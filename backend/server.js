const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const jwt = require('jsonwebtoken');
const Chat = require('./models/Chat');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Security Hardening - Middlewares
app.use(helmet({
    crossOriginResourcePolicy: false // Allows loading local static files from React domain
}));
app.use(express.json({ limit: '10kb' })); // Prevents large payload body attacks

// Serve Uploads Directory Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Production-ready CORS Protection
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(morgan('dev'));

// 2. Security Hardening - Strict Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 2000, // Limit each IP to 2000 requests per window
  message: {
      success: false,
      message: 'Too many requests from this IP. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// 3. Database & Socket.IO Orchestration
const startServer = async () => {
    try {
        await connectDB();

        // Advanced Socket.IO setup with strict CORS rules
        const io = new Server(server, {
          cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true
          },
          pingTimeout: 60000, // Close idle socket after 60s
        });

        // Store active connections: userId -> Set of socketIds
        const onlineUsers = new Map();

        // Socket Authentication Middleware
        io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
            if (!token) return next(new Error('Authentication error - Token missing'));
            
            jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_hirepur_jobportal_2026', (err, decoded) => {
                if (err) return next(new Error('Authentication error - Invalid token'));
                socket.userId = decoded.id;
                next();
            });
        });

        io.on('connection', (socket) => {
          const userId = socket.userId;
          console.log(`⚡ Socket client connected: UserID ${userId} (Socket: ${socket.id})`);
          
          if (!onlineUsers.has(userId)) {
              onlineUsers.set(userId, new Set());
          }
          onlineUsers.get(userId).add(socket.id);

          socket.join(`user_${userId}`);

          socket.broadcast.emit('user_status_change', {
              userId,
              status: 'online'
          });

          socket.emit('online_users_list', Array.from(onlineUsers.keys()));

          socket.on('send_message', async ({ conversationId, receiverId, content }) => {
              try {
                  if (!content || !receiverId) return;

                  const msgId = await Chat.saveMessage(conversationId, userId, receiverId, content);
                  
                  const messageData = {
                      id: msgId,
                      conversation_id: conversationId,
                      sender_id: userId,
                      receiver_id: receiverId,
                      message: content,
                      is_read: 0,
                      timestamp: new Date().toISOString()
                  };

                  io.to(`user_${receiverId}`).emit('receive_message', messageData);
                  socket.to(`user_${userId}`).emit('receive_message', messageData);
                  socket.emit('receive_message', messageData);

              } catch (error) {
                  console.error('❌ Socket Message Delivery Failure:', error);
                  socket.emit('message_error', { message: 'Message delivery failed' });
              }
          });

          socket.on('typing', ({ conversationId, receiverId }) => {
              io.to(`user_${receiverId}`).emit('user_typing', {
                  conversationId,
                  senderId: userId
              });
          });

          socket.on('stop_typing', ({ conversationId, receiverId }) => {
              io.to(`user_${receiverId}`).emit('user_stop_typing', {
                  conversationId,
                  senderId: userId
              });
          });

          socket.on('mark_read', async ({ conversationId, senderId }) => {
              try {
                  await Chat.markAsRead(conversationId, senderId);
                  io.to(`user_${senderId}`).emit('messages_read', {
                      conversationId,
                      readerId: userId
                  });
              } catch (error) {
                  console.error('❌ Socket Read Receipt Failure:', error);
              }
          });

          socket.on('disconnect', () => {
            console.log(`🔌 Socket client disconnected: UserID ${userId} (Socket: ${socket.id})`);
            
            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    
                    socket.broadcast.emit('user_status_change', {
                        userId,
                        status: 'offline',
                        lastSeen: new Date().toISOString()
                    });
                }
            }
          });
        });

        // 4. Mount REST API Routes
        app.get('/', (req, res) => {
          res.send('HirePur Enterprise API is running...');
        });

        app.use('/api/auth', require('./routes/auth'));
        app.use('/api/profile', require('./routes/profile'));
        app.use('/api/jobs', require('./routes/jobs'));
        app.use('/api/applications', require('./routes/applications'));
        app.use('/api/employer', require('./routes/employer'));
        app.use('/api/chat', require('./routes/chat'));
        app.use('/api/ai', require('./routes/ai'));
        app.use('/api/upload', require('./routes/upload'));
        app.use('/api/admin', require('./routes/admin'));
        app.use('/api/notifications', require('./routes/notifications'));

        // 5. Centralized Error Handler Middleware
        const errorHandler = require('./middleware/errorHandler');
        app.use(errorHandler);

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`🚀 Server fully operational on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Critical Server Initialization Failure:', error);
        process.exit(1);
    }
};

startServer();
