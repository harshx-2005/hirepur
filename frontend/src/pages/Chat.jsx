import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Send, User, Search, MoreVertical, 
    Paperclip, ArrowLeft, Check, CheckCheck, Loader2, Sparkles, ShieldAlert 
} from 'lucide-react';

const Chat = () => {
    const { user, token } = useAuthStore();
    const {
        conversations,
        messages,
        onlineUsers,
        typingStatus,
        activePartner,
        activeConversationId,
        activePartnerError,
        loadingConvs,
        loadingMessages,
        fetchConversations,
        selectConversation,
        selectConversationById,
        initSocket,
        sendMessage,
        sendTyping,
        clearActiveChat
    } = useChatStore();

    const [input, setInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'
    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const location = useLocation();

    // 1. Initialize socket connection and sync conversations
    useEffect(() => {
        if (token) {
            initSocket(token);
            fetchConversations();
        }
        return () => clearActiveChat();
    }, [token, initSocket, fetchConversations, clearActiveChat]);

    // 2. Select initial chat partner if passed via URL parameter
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const partnerId = queryParams.get('partnerId');

        if (partnerId && !loadingMessages && (!activePartner || Number(activePartner.id) !== Number(partnerId))) {
            const match = conversations.find(c => Number(c.id) === Number(partnerId));
            if (match) {
                handleSelectChat(match);
            } else if (!loadingConvs) {
                // Fetch profile and provision empty/new conversation
                selectConversationById(partnerId);
                setMobileView('chat');
            }
        }
    }, [location.search, conversations, selectConversationById, activePartner, loadingConvs, loadingMessages]);

    // 3. Keep messages container scrolled to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // 4. Handle text inputs and emit typing indicators with debouncing
    const handleInputChange = (e) => {
        setInput(e.target.value);
        sendTyping(true);

        // Clear existing stop-typing timer
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Set fresh timer to emit stop_typing after 1.5s of no keypresses
        typingTimeoutRef.current = setTimeout(() => {
            sendTyping(false);
        }, 1500);
    };

    const handleSendMessage = () => {
        if (!input.trim() || !activePartner) return;
        sendMessage(input);
        setInput('');
    };

    const handleSelectChat = (conv) => {
        selectConversation(conv);
        setMobileView('chat');
    };

    const handleBackToList = () => {
        setMobileView('list');
        // Clear active selection in store if going back
        useChatStore.setState({ activePartner: null, activeConversationId: null, messages: [], activePartnerError: null });
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? '...' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Filter conversations by search string
    const filteredConvs = conversations.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.last_message && c.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Check if current active partner is typing
    const isPartnerTyping = activeConversationId && 
        typingStatus[activeConversationId] && 
        (typingStatus[activeConversationId].has(Number(activePartner?.id)) || 
         typingStatus[activeConversationId].has(String(activePartner?.id)));

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full h-[85vh] bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 flex overflow-hidden">
                
                {/* 1. Conversations Sidebar Pane */}
                <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/20 ${
                    mobileView === 'chat' ? 'hidden md:flex' : 'flex'
                }`}>
                    <div className="p-6 border-b border-slate-100 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chats</h2>
                            <span className="badge bg-primary/10 text-primary font-black uppercase text-[9px] tracking-wider flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5"/> Secure Sync
                            </span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
                            <input 
                                type="text" 
                                placeholder="Search connections..." 
                                className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-transparent rounded-2xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary/20 transition-all focus:ring-4 focus:ring-primary/5"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-4 space-y-1.5">
                        {loadingConvs ? (
                             <div className="space-y-3">
                                 {[1,2,3,4].map(i => (
                                     <div key={i} className="h-16 bg-white border border-slate-50 animate-pulse rounded-2xl flex items-center gap-3 p-3">
                                         <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                                         <div className="flex-1 space-y-2">
                                             <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                             <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        ) : filteredConvs.length === 0 ? (
                            <div className="py-20 text-center text-slate-400">
                                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20"/>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-300">No chats found</p>
                            </div>
                        ) : (
                            filteredConvs.map(conv => {
                                const isOnline = onlineUsers.includes(conv.id);
                                const isActive = activePartner?.id === conv.id;
                                return (
                                    <button 
                                        key={conv.id}
                                        onClick={() => handleSelectChat(conv)}
                                        className={`w-full p-4 rounded-2xl flex items-center gap-4 border transition-all ${
                                            isActive 
                                                ? 'bg-white border-slate-100 shadow-md shadow-slate-100/30 font-black' 
                                                : 'border-transparent hover:bg-white hover:border-slate-50'
                                        }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            {conv.profile_pic ? (
                                                <img src={conv.profile_pic} alt={conv.name} className="w-11 h-11 rounded-full object-cover border border-slate-100" />
                                            ) : (
                                                <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm uppercase">
                                                    {conv.name[0]}
                                                </div>
                                            )}
                                            {isOnline && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                            )}
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="flex justify-between items-center gap-2">
                                                <h4 className="font-bold text-slate-900 text-sm truncate">{conv.name}</h4>
                                                {conv.last_message_time && (
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">{formatTime(conv.last_message_time)}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center gap-2 mt-0.5">
                                                <p className="text-xs text-slate-400 truncate flex-1">{conv.last_message || 'Tap to start chatting...'}</p>
                                                {conv.unread_count > 0 && (
                                                    <motion.span 
                                                        animate={{ scale: [1, 1.1, 1] }} 
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                        className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-primary text-white rounded-full text-[9px] font-black"
                                                    >
                                                        {conv.unread_count}
                                                    </motion.span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 2. Main Chat Thread Pane */}
                <div className={`flex-grow flex flex-col ${
                    mobileView === 'list' ? 'hidden md:flex' : 'flex'
                }`}>
                    {activePartner ? (
                        <>
                            {/* Active Chat Top Bar */}
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center px-6 shadow-sm bg-white">
                                <div className="flex items-center gap-4 min-w-0">
                                    <button 
                                        onClick={handleBackToList}
                                        className="p-2 -ml-2 text-slate-400 hover:text-slate-600 md:hidden transition"
                                    >
                                        <ArrowLeft className="w-5 h-5"/>
                                    </button>
                                    <div className="relative flex-shrink-0">
                                        {activePartner.profile_pic ? (
                                            <img src={activePartner.profile_pic} alt={activePartner.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                                        ) : (
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary uppercase text-sm">
                                                {activePartner.name[0]}
                                            </div>
                                        )}
                                        {onlineUsers.includes(activePartner.id) && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-extrabold text-slate-900 text-sm truncate leading-tight">{activePartner.name}</h3>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mt-0.5">
                                            {onlineUsers.includes(activePartner.id) ? (
                                                <span className="text-green-500 flex items-center gap-1 font-extrabold">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> Active Now
                                                </span>
                                            ) : 'Away'}
                                            <span>•</span>
                                            <span>{activePartner.role?.replace('_', ' ') || 'Recruiter'}</span>
                                        </p>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 transition p-2"><MoreVertical className="w-5 h-5"/></button>
                            </div>

                            {/* Active Chat Content Body or Gated Warning */}
                            {activePartnerError ? (
                                <div className="flex-grow flex flex-col items-center justify-center p-12 text-center bg-slate-50/20">
                                    <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-6">
                                        <ShieldAlert className="w-8 h-8 text-red-500"/>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Security Gated Conversation</h3>
                                    <p className="text-slate-400 font-bold text-xs mt-3 max-w-sm leading-relaxed">
                                        {activePartnerError}
                                    </p>
                                    <p className="text-slate-400 font-medium text-[10px] uppercase tracking-widest mt-6 border border-slate-100 bg-slate-50 px-4 py-2 rounded-xl">
                                        Job Seeker ↔ Employer Safety Protocol
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div 
                                        ref={scrollRef}
                                        className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/20"
                                    >
                                        {loadingMessages ? (
                                             <div className="flex items-center justify-center h-full">
                                                 <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                             </div>
                                        ) : (
                                            <>
                                                {messages.map((msg, idx) => {
                                                    const isMe = msg.sender_id === user.id;
                                                    return (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            key={idx} 
                                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            <div className={`max-w-[70%] p-4 rounded-2xl text-xs font-semibold shadow-sm border transition-all ${
                                                                isMe 
                                                                    ? 'bg-slate-900 text-white border-transparent rounded-tr-none' 
                                                                    : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                                                            }`}>
                                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                                <div className="flex justify-end items-center gap-1 mt-1.5 opacity-65">
                                                                    <span className="text-[9px] font-medium">{formatTime(msg.timestamp || msg.created_at)}</span>
                                                                    {isMe && (
                                                                        msg.is_read ? (
                                                                            <CheckCheck className="w-3 h-3 text-blue-400" />
                                                                        ) : (
                                                                            <Check className="w-3 h-3 text-slate-400" />
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}

                                                {/* Typing status trigger block */}
                                                <AnimatePresence>
                                                    {isPartnerTyping && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="flex justify-start"
                                                        >
                                                            <div className="bg-slate-100 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200/50 flex items-center gap-2">
                                                                 <span className="flex gap-1">
                                                                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                                 </span>
                                                                 <span className="text-[10px] font-black uppercase tracking-wider">{activePartner.name} is typing</span>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        )}
                                    </div>

                                    {/* Message Composer Footer */}
                                    <div className="p-6 bg-white border-t border-slate-100">
                                        <div className="relative flex gap-3 items-center">
                                            <button className="text-slate-400 hover:text-primary transition p-2"><Paperclip className="w-5 h-5"/></button>
                                            <input 
                                                type="text" 
                                                placeholder="Write a message..." 
                                                className="w-full pl-5 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary/20 transition-all focus:ring-4 focus:ring-primary/5" 
                                                value={input}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                onBlur={() => sendTyping(false)}
                                            />
                                            <button 
                                                onClick={handleSendMessage}
                                                className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl hover:shadow-lg transition active:scale-95 flex-shrink-0"
                                            >
                                                <Send className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-12 bg-slate-50/10">
                            <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-primary opacity-25"/>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select connection to chat</h3>
                            <p className="text-slate-400 font-bold text-xs mt-2 max-w-xs leading-relaxed">
                                Communicate with candidates and hiring managers instantly. Secure, real-time sync.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
