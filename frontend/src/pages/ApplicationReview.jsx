import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, FileText, CheckCircle, XCircle, Clock, ExternalLink, Bot, CheckSquare, Square, Trash2, Users } from 'lucide-react';

const ApplicationReview = () => {
    const queryClient = useQueryClient();
    const [selectedIds, setSelectedIds] = useState([]);

    const { data: appsResponse, isLoading } = useQuery({
        queryKey: ['all-applications'],
        queryFn: async () => {
            const res = await apiClient.get('/employer/applications');
            return res.data;
        }
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            return await apiClient.put(`/applications/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['all-applications']);
        }
    });

    const batchStatusMutation = useMutation({
        mutationFn: async ({ ids, status }) => {
            return await apiClient.put('/applications/batch-status', { ids, status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['all-applications']);
            setSelectedIds([]);
        }
    });

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === applications.length) setSelectedIds([]);
        else setSelectedIds(applications.map(app => app.id));
    };

    const applications = appsResponse?.data || [];

    const getStatusStyles = (status) => {
        switch(status) {
            case 'applied': return 'bg-gray-100 text-gray-700';
            case 'under_review': return 'bg-blue-100 text-blue-700';
            case 'interview': return 'bg-purple-100 text-purple-700';
            case 'accepted': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-white py-12 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-slate-900">Candidate Pipeline</h1>
                        <p className="mt-2 text-slate-500 font-medium">Review, shortlist, and hire talent efficiently.</p>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 border border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <span className="bg-primary px-3 py-1 rounded-full text-xs font-black">{selectedIds.length}</span>
                                <span className="text-sm font-bold tracking-tight">Candidates Selected</span>
                            </div>
                            <div className="h-4 w-px bg-white/20"></div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => batchStatusMutation.mutate({ ids: selectedIds, status: 'interview' })}
                                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-xs font-black transition-all"
                                >
                                    SHORTLIST
                                </button>
                                <button 
                                    onClick={() => batchStatusMutation.mutate({ ids: selectedIds, status: 'accepted' })}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl text-xs font-black transition-all"
                                >
                                    HIRE
                                </button>
                                <button 
                                    onClick={() => batchStatusMutation.mutate({ ids: selectedIds, status: 'rejected' })}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-black transition-all"
                                >
                                    REJECT
                                </button>
                            </div>
                            <button onClick={() => setSelectedIds([])} className="text-white/40 hover:text-white transition-colors">
                                <XCircle className="w-5 h-5"/>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1,2,3].map(i => <div key={i} className="glass-card h-32 animate-pulse"></div>)}
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                        <User className="w-20 h-20 text-slate-200 mx-auto mb-6"/>
                        <h3 className="text-2xl font-black text-slate-900">No applicants yet</h3>
                        <p className="text-slate-500 mt-2 font-medium">When candidates apply, they will appear in your pipeline.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 px-6 mb-4">
                            <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                                {selectedIds.length === applications.length ? <CheckSquare className="w-4 h-4 text-primary"/> : <Square className="w-4 h-4"/>}
                                Select All Candidates
                            </button>
                        </div>
                        {applications.map((app, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={app.id} 
                                className={`glass-card !p-8 flex flex-col md:flex-row justify-between items-center gap-8 group transition-all border-2 ${selectedIds.includes(app.id) ? 'border-primary ring-4 ring-primary/5' : 'border-transparent'}`}
                            >
                                <div className="flex items-center gap-8 flex-1">
                                    <button onClick={() => toggleSelect(app.id)} className={`transition-colors ${selectedIds.includes(app.id) ? 'text-primary' : 'text-slate-100 group-hover:text-slate-300'}`}>
                                        {selectedIds.includes(app.id) ? <CheckSquare className="w-6 h-6"/> : <Square className="w-6 h-6"/>}
                                    </button>
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                        {app.applicant_name?.[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-black text-slate-900">{app.applicant_name}</h3>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusStyles(app.status)}`}>
                                                {app.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                            Applying for <span className="text-slate-900 underline decoration-primary/30 decoration-2 underline-offset-4">{app.job_title}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-end gap-2 mb-1">
                                            <Mail className="w-3 h-3"/> {app.email}
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="h-10 w-px bg-slate-100 mx-2"></div>
                                    <div className="flex gap-2">
                                        <a href={app.resume_url} target="_blank" rel="noreferrer" className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                            <FileText className="w-5 h-5"/>
                                        </a>
                                        <button 
                                            onClick={() => statusMutation.mutate({ id: app.id, status: 'interview' })}
                                            className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                            title="Shortlist"
                                        >
                                            <Users className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationReview;
