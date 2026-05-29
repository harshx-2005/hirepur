import { create } from 'zustand';
import { io } from 'socket.io-client';
import apiClient from '../api/client';
import { useNotificationStore } from './useNotificationStore';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000';

export const useChatStore = create((set, get) => ({
    socket: null,
    conversations: [],
    messages: [],
    onlineUsers: [],
    typingStatus: {}, // conversation_id -> Map of typing userIds
    activePartner: null,
    activeConversationId: null,
    activePartnerError: null, // Holds security-gated error messages (e.g. 403 Forbidden)
    loadingConvs: false,
    loadingMessages: false,

    // 1. Fetch conversations list via API
    fetchConversations: async () => {
        set({ loadingConvs: true });
        try {
            const res = await apiClient.get('/chat/conversations');
            if (res.data.success) {
                set({ conversations: res.data.data });
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            set({ loadingConvs: false });
        }
    },

    // 2. Select conversation and fetch history
    selectConversation: async (partner) => {
        set({ 
            activePartner: partner, 
            loadingMessages: true, 
            messages: [], 
            activePartnerError: null 
        });
        try {
            const res = await apiClient.get(`/chat/history/${partner.id}`);
            if (res.data.success) {
                set({ 
                    messages: res.data.data, 
                    activeConversationId: res.data.conversation_id 
                });

                // Clear unread count locally
                set(state => ({
                    conversations: state.conversations.map(c => 
                        Number(c.id) === Number(partner.id) ? { ...c, unread_count: 0 } : c
                    )
                }));

                // Emit mark_read to socket
                const socket = get().socket;
                if (socket && res.data.conversation_id) {
                    socket.emit('mark_read', {
                        conversationId: res.data.conversation_id,
                        senderId: partner.id
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            if (error.response?.status === 403) {
                set({ activePartnerError: error.response.data.message });
            } else {
                set({ activePartnerError: 'An error occurred loading conversation history.' });
            }
        } finally {
            set({ loadingMessages: false });
        }
    },

    // 2b. Select conversation by Partner ID (for starting brand-new chats!)
    selectConversationById: async (partnerId) => {
        set({ 
            loadingMessages: true, 
            messages: [], 
            activePartner: null, 
            activePartnerError: null 
        });
        try {
            // Fetch profile details
            const profileRes = await apiClient.get(`/profile/${partnerId}`);
            if (profileRes.data.success) {
                const partner = profileRes.data.data;
                set({ activePartner: partner });

                // Fetch history (this will safely get or create conversation ID in database!)
                const res = await apiClient.get(`/chat/history/${partnerId}`);
                if (res.data.success) {
                    set({ 
                        messages: res.data.data, 
                        activeConversationId: res.data.conversation_id 
                    });

                    // Emit mark_read to socket
                    const socket = get().socket;
                    if (socket && res.data.conversation_id) {
                        socket.emit('mark_read', {
                            conversationId: res.data.conversation_id,
                            senderId: partner.id
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to select conversation by ID:', error);
            if (error.response?.status === 403) {
                set({ activePartnerError: error.response.data.message });
            } else {
                set({ activePartnerError: 'An error occurred setting up conversation.' });
            }
        } finally {
            set({ loadingMessages: false });
        }
    },

    // 3. Connect to Socket.IO server
    initSocket: (token) => {
        if (get().socket) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            reconnectionAttempts: 5,
            reconnectionDelay: 2000
        });

        // Register core socket listeners
        socket.on('connect', () => {
            console.log('⚡ Socket connected successfully.');
        });

        // Live Realtime Notification dispatcher
        socket.on('receive_notification', (notif) => {
            console.log('🔔 Live notification received:', notif);
            useNotificationStore.getState().addNotification(notif);
        });

        // Received online list
        socket.on('online_users_list', (users) => {
            set({ onlineUsers: users });
        });

        // Online status change of other users
        socket.on('user_status_change', ({ userId, status }) => {
            set(state => {
                const currentOnline = new Set(state.onlineUsers);
                if (status === 'online') {
                    currentOnline.add(userId);
                } else {
                    currentOnline.delete(userId);
                }
                return { onlineUsers: Array.from(currentOnline) };
            });
        });

        // Receive Message Realtime
        socket.on('receive_message', (msg) => {
            const activePartner = get().activePartner;
            
            // If the message is inside active chat, append to messages
            if (activePartner && (Number(msg.sender_id) === Number(activePartner.id) || Number(msg.receiver_id) === Number(activePartner.id))) {
                set(state => ({ messages: [...state.messages, msg] }));

                // Mark read immediately
                if (Number(msg.sender_id) === Number(activePartner.id)) {
                    socket.emit('mark_read', {
                        conversationId: msg.conversation_id,
                        senderId: activePartner.id
                    });
                }
            } else {
                // Otherwise increment unread count on sidebar list
                set(state => ({
                    conversations: state.conversations.map(c => 
                        Number(c.id) === Number(msg.sender_id) 
                            ? { ...c, unread_count: (c.unread_count || 0) + 1, last_message: msg.message } 
                            : c
                    )
                }));
            }

            // Sync last message in sidebar list
            set(state => ({
                conversations: state.conversations.map(c => {
                    const partnerId = Number(msg.sender_id) === Number(activePartner?.id) ? msg.sender_id : msg.receiver_id;
                    if (Number(c.id) === Number(partnerId)) {
                        return { 
                            ...c, 
                            last_message: msg.message,
                            last_message_time: msg.timestamp
                        };
                    }
                    return c;
                })
            }));
            
            // Re-fetch conversations to keep sorting and unread counts accurate
            get().fetchConversations();
        });

        // Typing Indicator Signals
        socket.on('user_typing', ({ conversationId, senderId }) => {
            set(state => {
                const typing = { ...state.typingStatus };
                if (!typing[conversationId]) typing[conversationId] = new Set();
                typing[conversationId].add(senderId);
                return { typingStatus: typing };
            });
        });

        socket.on('user_stop_typing', ({ conversationId, senderId }) => {
            set(state => {
                const typing = { ...state.typingStatus };
                if (typing[conversationId]) {
                    typing[conversationId].delete(senderId);
                    if (typing[conversationId].size === 0) {
                        delete typing[conversationId];
                    }
                }
                return { typingStatus: typing };
            });
        });

        // Read Receipts listener
        socket.on('messages_read', ({ conversationId, readerId }) => {
            const activePartner = get().activePartner;
            if (activePartner && Number(activePartner.id) === Number(readerId)) {
                set(state => ({
                    messages: state.messages.map(m => 
                        Number(m.sender_id) !== Number(readerId) ? { ...m, is_read: 1 } : m
                    )
                }));
            }
        });

        set({ socket });
    },

    // 4. Send Message Action
    sendMessage: (content) => {
        const { socket, activePartner, activeConversationId } = get();
        if (!socket || !activePartner || !content.trim()) return;

        const payload = {
            conversationId: activeConversationId,
            receiverId: activePartner.id,
            content
        };

        socket.emit('send_message', payload);
        get().sendTyping(false); // Stop typing immediately on send
    },

    // 5. Typing Signal Action
    sendTyping: (isTyping) => {
        const { socket, activePartner, activeConversationId } = get();
        if (!socket || !activePartner || !activeConversationId) return;

        const event = isTyping ? 'typing' : 'stop_typing';
        socket.emit(event, {
            conversationId: activeConversationId,
            receiverId: activePartner.id
        });
    },

    // 6. Close socket connection
    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null, activePartner: null, activeConversationId: null, messages: [], activePartnerError: null });
        }
    },

    // 7. Clear active chat state without disconnecting global socket
    clearActiveChat: () => {
        set({ activePartner: null, activeConversationId: null, messages: [], activePartnerError: null });
    }
}));
