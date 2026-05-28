import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Copy, Check, RefreshCw, FileText, Sparkles, Layout } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const JDGenerator = () => {
    const [formData, setFormData] = useState({
        role: '',
        company: '',
        requirements: '',
        tone: 'professional'
    });
    const [generatedJD, setGeneratedJD] = useState('');
    const [copied, setCopied] = useState(false);

    const jdMutation = useMutation({
        mutationFn: async (data) => {
            const res = await apiClient.post('/ai/job-description', data);
            return res.data;
        },
        onSuccess: (data) => {
            setGeneratedJD(data.data.description);
        }
    });

    const handleGenerate = () => {
        if (!formData.role) return;
        jdMutation.mutate(formData);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedJD);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
                
                {/* Configuration Panel */}
                <div className="lg:w-1/3 space-y-6">
                    <div className="glass-card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary text-white rounded-lg"><Sparkles className="w-5 h-5"/></div>
                            <h2 className="text-xl font-bold">JD Gen</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Job Role / Title</label>
                                <input 
                                    type="text" 
                                    className="input-field mt-1" 
                                    placeholder="e.g. Senior Backend Engineer"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Industry / Detail</label>
                                <textarea 
                                    rows="4" 
                                    className="input-field mt-1" 
                                    placeholder="Mention key tech stack or company culture..."
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                                ></textarea>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tone</label>
                                <select 
                                    className="input-field mt-1"
                                    value={formData.tone}
                                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                                >
                                    <option value="professional">Professional</option>
                                    <option value="startup">Startup / Energetic</option>
                                    <option value="formal">Formal</option>
                                </select>
                            </div>
                            
                            <button 
                                onClick={handleGenerate}
                                disabled={jdMutation.isPending || !formData.role}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                            >
                                {jdMutation.isPending ? <RefreshCw className="animate-spin w-5 h-5"/> : <Wand2 className="w-5 h-5"/>}
                                Generate JD
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
                        <h4 className="text-sm font-bold text-secondary flex items-center gap-2 mb-2">
                            <Layout className="w-4 h-4"/> Smart Templates
                        </h4>
                        <p className="text-xs text-gray-500">Our AI uses industry-standard frameworks to ensure your JD attracts the top 1% of talent.</p>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="lg:w-2/3">
                    <div className="glass-card min-h-[600px] flex flex-col relative">
                        <div className="absolute top-6 right-6 flex gap-2">
                             {generatedJD && (
                                 <button onClick={handleCopy} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition border border-gray-100 bg-white">
                                     {copied ? <Check className="w-5 h-5 text-green-500"/> : <Copy className="w-5 h-5"/>}
                                 </button>
                             )}
                        </div>

                        <div className="flex items-center gap-3 mb-8 text-gray-400">
                            <FileText className="w-6 h-6"/>
                            <span className="font-bold text-sm tracking-widest uppercase">Resulting Document</span>
                        </div>

                        <AnimatePresence mode="wait">
                            {generatedJD ? (
                                <motion.div 
                                    key="result"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="prose max-w-none text-gray-800"
                                >
                                    <ReactMarkdown>{generatedJD}</ReactMarkdown>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-grow flex flex-col items-center justify-center text-center opacity-30 select-none"
                                >
                                    <Sparkles className="w-16 h-16 mb-4"/>
                                    <p className="text-xl font-medium italic">Generating magic will appear here...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default JDGenerator;
