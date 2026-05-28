import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Search, FileText, BarChart3, ChevronRight, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ResumeAnalyzer = () => {
    const [jdText, setJdText] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [score, setScore] = useState(null);

    const analyzeMutation = useMutation({
        mutationFn: async (data) => {
            const res = await apiClient.post('/ai/resume-analyze', data);
            return res.data;
        },
        onSuccess: (data) => {
            setAnalysis(data.data.analysis);
            setScore(data.data.score);
        }
    });

    const handleAnalyze = () => {
        if (!jdText) return;
        analyzeMutation.mutate({ resumeText: '', jobDescription: jdText });
    };

    const getMatchLevel = (mathScore) => {
        if (mathScore >= 80) return { label: 'Strong Match', color: 'bg-green-100 text-green-700' };
        if (mathScore >= 50) return { label: 'Moderate Match', color: 'bg-yellow-100 text-yellow-700' };
        return { label: 'Low Match', color: 'bg-red-100 text-red-700' };
    };

    const match = score ? getMatchLevel(score) : { label: 'Analyzing...', color: 'bg-gray-100 text-gray-700' };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">AI Resume Analyzer</h1>
                    <p className="mt-2 text-gray-600">Check how well your resume matches a specific job description.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Inputs */}
                    <div className="space-y-6">
                        <div className="glass-card">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                                <Search className="text-primary w-5 h-5"/> Job Description
                            </h3>
                            <textarea 
                                rows="10" 
                                className="input-field" 
                                placeholder="Paste the job description here..."
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                            ></textarea>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest">Tip: Including full requirements yields better analysis.</p>
                        </div>
                        
                        <button 
                            onClick={handleAnalyze}
                            disabled={analyzeMutation.isPending || !jdText}
                            className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                        >
                            {analyzeMutation.isPending ? <RefreshCw className="animate-spin w-6 h-6"/> : <ShieldCheck className="w-6 h-6"/>}
                            {analyzeMutation.isPending ? 'Analyzing Profile...' : 'Analyze Resume Compatibility'}
                        </button>
                    </div>

                    {/* Results */}
                    <div className="glass-card min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {analysis ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                                <BarChart3 className="w-8 h-8"/>
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-gray-900 leading-none">{score}%</h4>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Similarity Score</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 ${match.color} rounded-full text-xs font-bold uppercase`}>{match.label}</div>
                                    </div>

                                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed italic">
                                        <ReactMarkdown>{analysis}</ReactMarkdown>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <h5 className="text-xs font-bold text-blue-600 uppercase mb-2">Analysis Insight</h5>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle className="w-3 h-3 text-green-500"/> Profile Synced</div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle className="w-3 h-3 text-green-500"/> AI Comparison Active</div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                                            <h5 className="text-xs font-bold text-orange-600 uppercase mb-2">Next Steps</h5>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600"><AlertCircle className="w-3 h-3 text-orange-500"/> Optimize Resume</div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600"><AlertCircle className="w-3 h-3 text-orange-500"/> Address Gaps</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                                    <FileText className="w-20 h-20 mb-6"/>
                                    <h3 className="text-xl font-bold">Waiting for Analysis</h3>
                                    <p className="max-w-xs text-sm mt-2">Paste a job description on the left to see how your profile stacks up.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-12 p-8 bg-gradient-to-r from-primary to-secondary rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div className="max-w-md">
                        <h3 className="text-2xl font-bold mb-2">Want to improve your score?</h3>
                        <p className="text-white/80">Use our AI Resume Builder to tailor your experience specifically for this job description.</p>
                    </div>
                    <button className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-2 hover:scale-105 transition active:scale-95 shadow-lg">
                        Go to Builder <ChevronRight className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalyzer;
