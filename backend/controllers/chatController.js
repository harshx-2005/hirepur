const Chat = require('../models/Chat');
const User = require('../models/User');

// 1. Fetch conversations list for authenticated user
exports.getConversations = async (req, res, next) => {
     try {
        const conversations = await Chat.getConversations(req.user.id);
        
        // Map to format that frontend expects
        const formattedConvs = conversations.map(c => ({
            id: c.partner_id,
            conversation_id: c.conversation_id,
            name: c.partner_name,
            email: c.partner_email,
            profile_pic: c.partner_profile_pic,
            role: c.partner_role,
            last_message: c.last_message,
            last_message_time: c.last_message_time,
            unread_count: c.unread_count
        }));

        res.status(200).json({ success: true, data: formattedConvs });
    } catch (error) {
        console.error('❌ Get Conversations Controller Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching conversations' });
    }
};

// 2. Fetch messaging history between user and a partner
exports.getChatHistory = async (req, res, next) => {
    try {
        const partnerId = req.params.userId;
        const myId = req.user.id;

        // Security check: Verify if conversation is authorized
        const allowed = await Chat.canChat(myId, partnerId);
        if (!allowed) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to chat with this user. Conversations require an active job application pipeline.' 
            });
        }

        // Fetch or create conversation
        const conversationId = await Chat.getOrCreateConversation(myId, partnerId);
        const messages = await Chat.getHistory(conversationId);

        // Mark incoming messages as read instantly when opening chat history
        await Chat.markAsRead(conversationId, partnerId);

        res.status(200).json({ 
            success: true, 
            conversation_id: conversationId,
            count: messages.length, 
            data: messages 
        });
    } catch (error) {
        console.error('❌ Get Chat History Controller Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching chat history' });
    }
};

// 3. Send REST-fallback message
exports.sendMessage = async (req, res, next) => {
    try {
        const { receiver_id, message } = req.body;
        const myId = req.user.id;

        if (!receiver_id || !message) {
            return res.status(400).json({ success: false, message: 'Please provide receiver_id and message content.' });
        }

        // Security check: Verify if communication is allowed
        const allowed = await Chat.canChat(myId, receiver_id);
        if (!allowed) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to message this user. An active application pipeline is required.' 
            });
        }

        // Get or create conversation, then save message
        const conversationId = await Chat.getOrCreateConversation(myId, receiver_id);
        const messageId = await Chat.saveMessage(conversationId, myId, receiver_id, message);
        
        res.status(201).json({ 
            success: true, 
            message: 'Message successfully sent', 
            data: { 
                id: messageId,
                conversation_id: conversationId,
                sender_id: myId,
                receiver_id,
                message,
                timestamp: new Date().toISOString()
            } 
        });
    } catch (error) {
         console.error('❌ Send Message Controller Error:', error);
         res.status(500).json({ success: false, message: 'Server error sending message' });
    }
};
