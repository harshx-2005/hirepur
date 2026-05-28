import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, Calendar, ChevronLeft, Send, ShieldCheck, Zap, Star, Globe, Building2, UserCircle2, CheckCircle, UploadCloud, FileText, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const JobDetails = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [isApplying, setIsApplying] = useState(false);
    const [appSuccess, setAppSuccess] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(null);

    const { data: jobResponse, isLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: async () => {
            const res = await apiClient.get(`/jobs/${id}`);
            return res.data;
        }
    });

    const { data: applicationsResponse } = useQuery({
        queryKey: ['user-applications'],
        queryFn: async () => {
            const res = await apiClient.get('/applications/user');
            return res.data;
        },
        enabled: !!user && user.role === 'job_seeker'
    });

    const hasApplied = applicationsResponse?.data?.some(app => Number(app.job_id) === Number(id)) || appSuccess;

    const applyMutation = useMutation({
        mutationFn: async () => {
            const res = await apiClient.post(`/applications/job/${id}`, { resume_url: resumeUrl });
            return res.data;
        },
        onSuccess: () => {
            setAppSuccess(true);
            queryClient.invalidateQueries(['user-applications']);
        }
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setResumeFile(file);
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumeUrl(res.data.url);
        } catch (error) {
            console.error('File upload failed', error);
            alert('Failed to upload file. Please try again.');
            setResumeFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const job = jobResponse?.data;

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="bg-slate-100 w-20 h-20 rounded-3xl"></div>
                <div className="h-4 bg-slate-100 w-32 rounded-full"></div>
            </div>
        </div>
    );

    if (!job) return <div className="p-20 text-center font-black">Job Not Found</div>;

    return (
        <div className="min-h-screen bg-slate-50/50 py-16 px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
                <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-xs uppercase tracking-widest mb-12 transition-colors">
                    <ChevronLeft className="w-4 h-4"/> Back to board
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-10">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card !p-12"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-center font-black text-3xl text-slate-300">
                                        {job.company_name?.[0]}
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none mb-4">{job.title}</h1>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                                <Building2 className="w-4 h-4 text-slate-300"/> {job.company_name}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                                <MapPin className="w-4 h-4 text-slate-300"/> {job.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <Star className="w-6 h-6 text-slate-200"/>
                                    </button>
                                    <button className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <Globe className="w-6 h-6 text-slate-200"/>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-slate-50 rounded-[2rem] mb-12">
                                <DetailBox icon={<Briefcase/>} label="Job Type" value={job.job_type || 'Full-time'} />
                                <DetailBox icon={<Calendar/>} label="Posted" value={new Date(job.created_at).toLocaleDateString()} />
                                <DetailBox icon={<DollarSign/>} label="Salary" value={job.salary_range || 'Competitive'} />
                                <DetailBox icon={<Globe/>} label="Mode" value={job.work_mode || 'Hybrid'} />
                            </div>

                            <div className="prose prose-slate max-w-none">
                                <h3 className="text-xl font-black mb-6 uppercase tracking-wider text-slate-400">Description</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                                
                                <h3 className="text-xl font-black mt-12 mb-6 uppercase tracking-wider text-slate-400">Requirements</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{job.requirements || 'Standard high-performance requirements apply.'}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-8">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card !p-8 border-2 border-primary/10 shadow-2xl shadow-primary/5"
                            >
                            <div className="mb-8">
                                <div className="bg-primary/5 p-4 rounded-3xl flex items-center gap-4 mb-6">
                                    <Zap className="text-primary w-8 h-8"/>
                                    <div>
                                        <h4 className="font-bold text-slate-900">AI Compatibility </h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Matched: 92%</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Our semantic matching indicates you are a high-tier candidate for this specific role. 
                                </p>
                            </div>

                            <AnimatePresence mode="wait">
                                {user && user.role !== 'job_seeker' ? (
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recruiter Mode</p>
                                        </div>
                                        <Link to={`/chat?partnerId=${job.employer_user_id}`} className="w-full btn-outline block text-center !py-5 !text-slate-900 border-2 border-slate-100 hover:border-slate-900 !rounded-[2rem] transition-all hover:shadow-lg">
                                            Message Recruiter
                                        </Link>
                                    </div>
                                ) : hasApplied ? (
                                    <div className="space-y-4">
                                        <motion.div 
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-green-500 text-white rounded-2xl p-6 text-center shadow-xl shadow-green-500/20"
                                        >
                                            <CheckCircle className="w-12 h-12 mx-auto mb-2"/>
                                            <h4 className="font-black text-lg underline underline-offset-4 decoration-white/30 decoration-4">SUCCESS</h4>
                                            <p className="text-xs font-bold uppercase tracking-widest mt-2">Application Transmitted</p>
                                        </motion.div>
                                        <Link to={`/chat?partnerId=${job.employer_user_id}`} className="w-full btn-outline block text-center !py-5 !text-slate-900 border-2 border-slate-100 hover:border-slate-900 !rounded-[2rem] transition-all hover:shadow-lg">
                                            Message Recruiter
                                        </Link>
                                    </div>
                                ) : (
                                    <motion.div key="action" className="space-y-4">
                                        
                                        {!resumeUrl ? (
                                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative group">
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.doc,.docx" 
                                                    onChange={handleFileUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    disabled={isUploading}
                                                />
                                                <div className="flex flex-col items-center gap-2">
                                                    {isUploading ? (
                                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                    ) : (
                                                        <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
                                                    )}
                                                    <span className="text-xs font-bold text-slate-500">
                                                        {isUploading ? 'Uploading...' : 'Upload CV / Resume (PDF, DOCX)'}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-green-50/50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-6 h-6 text-green-600" />
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-green-900 truncate max-w-[150px]">{resumeFile?.name}</p>
                                                        <p className="text-[10px] uppercase font-black tracking-widest text-green-600/70">Ready to submit</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setResumeUrl(null); setResumeFile(null); }} className="text-green-600 hover:text-green-800">
                                                    <XCircle className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => applyMutation.mutate()}
                                            disabled={applyMutation.isPending || isUploading || !resumeUrl}
                                            className="w-full btn-primary !py-5 text-lg shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {applyMutation.isPending ? 'Syncing...' : 'Instantly Apply'}
                                        </button>
                                        <Link to={`/chat?partnerId=${job.employer_user_id}`} className="w-full btn-outline block text-center !py-5 !text-slate-900 border-2 border-slate-100 hover:border-slate-900 !rounded-[2rem] transition-all hover:shadow-lg">
                                            Message Recruiter
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 justify-center">
                                <ShieldCheck className="w-4 h-4"/> HirePur Verified Company
                            </div>
                        </motion.div>

                            <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-secondary/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                <h4 className="text-xl font-black mb-4 relative z-10 uppercase tracking-tighter">Need a <br/> Tailored CV?</h4>
                                <p className="text-white/50 text-xs mb-8 leading-relaxed font-bold relative z-10">Use our AI Agent to rewrite your resume specifically for this {job.title} role.</p>
                                <Link to="/resume-builder" className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition active:scale-95 shadow-xl relative z-10">
                                    Optimize Resume <Zap className="w-4 h-4 text-primary"/>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const DetailBox = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 mb-2 shadow-sm border border-slate-100">
            {icon}
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-xs font-black text-slate-700 truncate w-full">{value}</p>
    </div>
);

export default JobDetails;
