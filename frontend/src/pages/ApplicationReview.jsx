import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, FileText, MessageSquare, AlertCircle, X } from 'lucide-react';

const ApplicationReview = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [noResumeUser, setNoResumeUser] = useState(null);

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
        onMutate: async (newAppStatus) => {
            await queryClient.cancelQueries({ queryKey: ['all-applications'] });
            const previousApps = queryClient.getQueryData(['all-applications']);
            queryClient.setQueryData(['all-applications'], (old) => {
                if (!old || !old.data) return old;
                return {
                    ...old,
                    data: old.data.map(app => 
                        app.id === newAppStatus.id ? { ...app, status: newAppStatus.status } : app
                    )
                };
            });
            return { previousApps };
        },
        onError: (err, newAppStatus, context) => {
            if (context?.previousApps) {
                queryClient.setQueryData(['all-applications'], context.previousApps);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['all-applications'] });
            queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
        }
    });

    const applications = appsResponse?.data || [];

    const getStatusStyles = (status) => {
        switch(status) {
            case 'applied': return 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/60';
            case 'under_review': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/60';
            case 'interview': return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/60';
            case 'accepted': return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100/60';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100/60';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
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
                        {applications.map((app, idx) => {
                            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                            const hasValidResume = app.resume_url && (
                                !app.resume_url.includes('localhost') || isLocalhost
                            );
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={app.id} 
                                    className="glass-card !p-8 flex flex-col md:flex-row justify-between items-center gap-8 group transition-all border-2 border-transparent"
                                >
                                    <div className="flex items-center gap-8 flex-1">
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                            {app.applicant_name?.[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-black text-slate-900 hover:text-primary hover:underline transition-all">
                                                    <Link to={`/profile?userId=${app.user_id}`}>
                                                        {app.applicant_name}
                                                    </Link>
                                                </h3>
                                                <div className="relative inline-block">
                                                    <select
                                                        value={app.status}
                                                        onChange={(e) => statusMutation.mutate({ id: app.id, status: e.target.value })}
                                                        className={`appearance-none pl-3 pr-8 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/10 ${getStatusStyles(app.status)}`}
                                                    >
                                                        <option value="applied" className="bg-white text-slate-800 font-semibold normal-case">Applied</option>
                                                        <option value="under_review" className="bg-white text-slate-800 font-semibold normal-case">Under Review</option>
                                                        <option value="interview" className="bg-white text-slate-800 font-semibold normal-case">Shortlist</option>
                                                        <option value="accepted" className="bg-white text-slate-800 font-semibold normal-case">Hire</option>
                                                        <option value="rejected" className="bg-white text-slate-800 font-semibold normal-case">Reject</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-500">
                                                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
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
                                            {hasValidResume ? (
                                                <a 
                                                    href={app.resume_url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="p-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm border border-slate-200" 
                                                    title="View Resume"
                                                >
                                                    <FileText className="w-5 h-5"/>
                                                </a>
                                            ) : (
                                                <button 
                                                    onClick={() => setNoResumeUser({ name: app.applicant_name, id: app.user_id })}
                                                    className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all border border-slate-100" 
                                                    title="Resume Not Available"
                                                >
                                                    <FileText className="w-5 h-5"/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Modern Glassmorphic No-Resume Modal */}
                <AnimatePresence>
                    {noResumeUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-2xl"></div>
                                
                                <button 
                                    onClick={() => setNoResumeUser(null)} 
                                    className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="text-center relative z-10">
                                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
                                        <AlertCircle className="w-8 h-8 text-amber-600" />
                                    </div>
                                    
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Resume Not Uploaded</h3>
                                    
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                                        <strong>{noResumeUser.name}</strong> hasn't uploaded a professional resume yet, or the uploaded file is no longer available. 
                                        <br/><br/>
                                        You can message them directly in chat to request their latest CV.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button 
                                            onClick={() => setNoResumeUser(null)} 
                                            className="w-full py-4 border-2 border-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition"
                                        >
                                            Dismiss
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const userId = noResumeUser.id;
                                                setNoResumeUser(null);
                                                navigate(`/chat?partnerId=${userId}`);
                                            }}
                                            className="w-full py-4 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-primary/95 hover:scale-[1.02] transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Message Seeker
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ApplicationReview;
