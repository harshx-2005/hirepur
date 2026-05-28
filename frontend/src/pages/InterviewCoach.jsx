import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, RefreshCw, Zap, Award, BookOpen, MessageSquare } from 'lucide-react';

const InterviewCoach = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your AI Interview Coach. I'm here to help you practice for your dream role. What position are we preparing for today, and would you like to start with a specific question or a full mock interview?" }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    const coachMutation = useMutation({
        mutationFn: async (history) => {
            const res = await apiClient.post('/ai/interview-coach', { messages: history });
            return res.data;
        },
        onSuccess: (data) => {
            setMessages(prev => [...prev, { role: 'assistant', content: data.data.feedback }]);
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMsg = { role: 'user', content: input };
        const updatedHistory = [...messages, newMsg];
        setMessages(updatedHistory);
        setInput('');
        coachMutation.mutate(updatedHistory);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
                <div className="bg-white border border-gray-200 rounded-t-2xl p-6 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <Bot className="w-6 h-6"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">AI Mock Interview</h2>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-secondary fill-secondary"/> Powered by HirePur Intelligence
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                         <div className="text-right hidden sm:block">
                             <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Confidence Score</p>
                             <div className="flex items-center gap-2 justify-end">
                                 <Award className="w-4 h-4 text-secondary"/>
                                 <span className="font-bold text-gray-900">--</span>
                             </div>
                         </div>
                    </div>
                </div>

                <div 
                    ref={scrollRef}
                    className="flex-grow bg-white border-x border-gray-200 overflow-y-auto p-6 space-y-6 scroll-smooth"
                >
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    msg.role === 'user' ? 'bg-secondary text-white' : 'bg-primary text-white'
                                }`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5"/> : <Bot className="w-5 h-5"/>}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                        ? 'bg-secondary/10 text-gray-800 rounded-tr-none' 
                                        : 'bg-primary/5 text-gray-800 rounded-tl-none'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {coachMutation.isPending && (
                        <div className="flex justify-start">
                             <div className="flex gap-3 max-w-[85%]">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center animate-pulse">
                                    <Bot className="w-5 h-5"/>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 text-gray-500 rounded-tl-none flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin"/> Thinking...
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-b-2xl p-4 shadow-sm">
                    <div className="relative flex gap-4">
                        <input 
                            type="text" 
                            className="input-field pr-12" 
                            placeholder="Type your response here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={coachMutation.isPending || !input.trim()}
                            className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition shadow-lg disabled:opacity-50"
                        >
                            <Send className="w-6 h-6"/>
                        </button>
                    </div>
                    <div className="mt-3 flex gap-4 overflow-x-auto pb-1">
                        <button className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md hover:text-primary transition flex items-center gap-1 border border-gray-100 flex-shrink-0">
                            <BookOpen className="w-3 h-3"/> Help me answer
                        </button>
                        <button className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md hover:text-primary transition flex items-center gap-1 border border-gray-100 flex-shrink-0">
                            <MessageSquare className="w-3 h-3"/> Common questions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewCoach;
