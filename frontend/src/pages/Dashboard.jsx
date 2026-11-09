import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Briefcase, Users, Bot, FileText, CheckCircle, Clock, XCircle, MessageSquare, Plus, ChevronRight, TrendingUp, Star, Search, ShieldCheck, Trash2 } from '../icons';
import { Link, useNavigate } from 'react-router-dom';
import MetroLine from '../components/MetroLine';

const Dashboard = () => {
    const { user, isAuthenticated, isCheckingAuth } = useAuthStore();

    const { data: analyticsResponse } = useQuery({
        queryKey: ['employer-analytics'],
        queryFn: async () => {
            const res = await apiClient.get('/employer/dashboard');
            return res.data;
        },
        enabled: user?.role === 'employer'
    });

    const queryClient = useQueryClient();

    const { data: myJobsResponse } = useQuery({
        queryKey: ['my-jobs'],
        queryFn: async () => {
            const res = await apiClient.get('/employer/jobs');
            return res.data;
        },
        enabled: user?.role === 'employer'
    });

    const { data: employerAppsResponse } = useQuery({
        queryKey: ['employer-applications'],
        queryFn: async () => {
            const res = await apiClient.get('/employer/applications');
            return res.data;
        },
        enabled: user?.role === 'employer'
    });

    const deleteJobMutation = useMutation({
        mutationFn: async (jobId) => {
            return await apiClient.delete(`/jobs/${jobId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['my-jobs']);
            queryClient.invalidateQueries(['employer-analytics']);
        }
    });

    const handleDeleteJob = (jobId) => {
        if (window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
            deleteJobMutation.mutate(jobId);
        }
    };

    const { data: applicationsResponse } = useQuery({
        queryKey: ['user-applications'],
        queryFn: async () => {
            const res = await apiClient.get('/applications/user');
            return res.data;
        },
        enabled: user?.role === 'job_seeker'
    });

    if (!user) return null;

    const renderEmployerDashboard = () => {
        const stats = analyticsResponse?.data || { totalJobs: 0, totalApplications: 0, totalShortlisted: 0, hiringConversionRate: '0%' };
        return (
            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard icon={<Briefcase/>} label="Active Jobs" value={stats.totalJobs} color="bg-metro-blue" delay={0}/>
                    <StatCard icon={<Users/>} label="Total Applicants" value={stats.totalApplications} color="bg-metro-red" delay={0.1}/>
                    <StatCard icon={<CheckCircle/>} label="Shortlisted" value={stats.totalShortlisted} color="bg-metro-green" delay={0.2}/>
                    <StatCard icon={<TrendingUp/>} label="Hiring Rate" value={stats.hiringConversionRate} color="bg-metro-yellow" delay={0.3}/>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card !p-8">
                            <h3 className="text-2xl font-extrabold uppercase mb-6">Quick actions</h3>
                            <div className="space-y-4">
                                <Link to="/jobs/post" className="w-full btn-outline !justify-start !px-6"> 
                                    <Plus className="w-5 h-5"/> Post New Job 
                                </Link>
                                <Link to="/applications/review" className="w-full btn-outline !justify-start !px-6">
                                    <Users className="w-5 h-5"/> Candidate Pipeline
                                </Link>
                                <Link to="/jd-generator" className="w-full btn-outline !justify-start !px-6">
                                    <Bot className="w-5 h-5"/> JD writer
                                </Link>
                            </div>
                        </div>
                     </div>
                     
                     <div className="lg:col-span-2 space-y-8">
                         <div className="glass-card !p-8">
                             <div className="flex justify-between items-center mb-8">
                                 <h3 className="text-xl font-black">My Posted Jobs</h3>
                                 <Link to="/jobs/post" className="text-primary font-bold text-sm uppercase tracking-widest hover:underline">Create New</Link>
                             </div>
                             <div className="space-y-4">
                                 {myJobsResponse?.data?.slice(0, 3).map(job => (
                                     <div key={job.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors group">
                                         <div className="flex items-center gap-4">
                                             <div className="p-3 bg-primary/5 rounded-xl"><Briefcase className="w-5 h-5 text-primary"/></div>
                                             <div>
                                                 <h4 className="font-bold text-slate-900">{job.title}</h4>
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{job.location} • {job.job_type}</p>
                                             </div>
                                         </div>
                                         <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button 
                                                 onClick={() => handleDeleteJob(job.id)}
                                                 className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                 title="Delete Job"
                                             >
                                                 <Trash2 className="w-5 h-5"/>
                                             </button>
                                             <Link to={`/jobs/edit/${job.id}`} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                 <FileText className="w-5 h-5"/>
                                             </Link>
                                         </div>
                                     </div>
                                 ))}
                                 {(!myJobsResponse?.data || myJobsResponse.data.length === 0) && (
                                     <div className="text-center py-8">
                                         <p className="text-sm font-medium text-slate-400">No jobs posted yet.</p>
                                     </div>
                                 )}
                             </div>
                         </div>

                         <div className="glass-card !p-8">
                             <div className="flex justify-between items-center mb-8">
                                 <h3 className="text-xl font-black">Recent Activity</h3>
                                 <Link to="/applications/review" className="text-primary font-bold text-sm uppercase tracking-widest hover:underline">View All</Link>
                             </div>
                             <div className="space-y-6">
                                 {employerAppsResponse?.data?.slice(0, 5).map(app => (
                                     <ActivityItem 
                                         key={app.id}
                                         user={app.applicant_name} 
                                         action={app.status === 'applied' ? 'applied for' : `was ${app.status.replace('_', ' ')} for`} 
                                         role={app.job_title} 
                                         time={new Date(app.applied_at).toLocaleDateString()} 
                                     />
                                 ))}
                                 {(!employerAppsResponse?.data || employerAppsResponse.data.length === 0) && (
                                     <p className="text-sm font-medium text-slate-400 text-center py-4">No recent activity.</p>
                                 )}
                             </div>
                         </div>
                     </div>
                </div>
            </div>
        );
    }

    const renderJobSeekerDashboard = () => {
        const applications = applicationsResponse?.data || [];
        
        return (
             <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <ActionCard icon={<Bot/>} title="Resume builder" desc="From your profile" link="/resume-builder" color="#0a5bd3"/>
                    <ActionCard icon={<FileText/>} title="Resume check" desc="Score vs. a job" link="/resume-analyzer" color="#e0322b"/>
                    <ActionCard icon={<Users/>} title="Interview practice" desc="Mock session" link="/interview-coach" color="#1e8e4e"/>
                    <ActionCard icon={<Star/>} title="Job match" desc="Ranked for you" link="/job-match" color="#f5b700"/>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card !p-8">
                         <div className="flex justify-between items-center mb-8">
                             <h3 className="text-3xl font-extrabold uppercase">Your applications</h3>
                             <Link to="/jobs" className="btn-primary !py-2 !px-4 !text-xs">Find More Jobs</Link>
                         </div>
                         {applications.length === 0 ? (
                             <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-100">
                                 <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4"/>
                                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active applications</p>
                             </div>
                         ) : (
                             <div className="space-y-4">
                                {applications.map((app) => (
                                    <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between gap-5 py-5 border-b border-ink/10 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400">
                                                {app.company_name?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{app.title}</h4>
                                                <p className="text-xs text-slate-400">{app.company_name} • {new Date(app.applied_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-[340px] shrink-0">
                                            <MetroLine status={app.status} />
                                        </div>
                                    </div>
                                ))}
                             </div>
                         )}
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <Link to="/chat" className="block glass-card !p-8 !bg-slate-900 text-white hover:!bg-ink/90 transition-colors group">
                            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-metro-yellow">Direct line</span>
                            <h3 className="text-3xl font-extrabold uppercase mt-2 mb-2">Messages</h3>
                            <p className="text-white/60 text-sm mb-6 leading-relaxed">Chat directly with hiring managers and get instant feedback.</p>
                            <div className="flex items-center gap-2 font-bold group-hover:gap-4 transition-all">
                                Open Inbox <ChevronRight className="w-5 h-5"/>
                            </div>
                        </Link>
                        
                        <div className="glass-card !p-8">
                            <span className="label-mono">Job match</span>
                            <div className="space-y-4 mt-3">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Open roles ranked against the skills on your profile. Keep your skills current for better matches.
                                </p>
                                <Link to="/job-match" className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
                                    View recommendations <ChevronRight className="w-3 h-3"/>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper py-12 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="badge bg-primary/10 text-primary">{user?.role === 'employer' ? 'Employer' : 'Professional'}</span>
                             <span className="text-slate-200">•</span>
                             <span className="text-xs font-bold text-slate-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black uppercase">Welcome back, {user?.name.split(' ')[0]}</h1>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {user?.role === 'admin' ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-100">
                            <ShieldCheck className="w-16 h-16 text-primary mb-6" />
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Administrator Access</h2>
                            <p className="text-slate-500 mb-8">You are logged in with system-wide administrative privileges.</p>
                            <Link to="/admin" className="btn-primary !px-10 !py-4">Go to Admin Dashboard</Link>
                        </div>
                    ) : user?.role === 'employer' ? renderEmployerDashboard() : renderJobSeekerDashboard()}
                </motion.div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color, delay }) => (
    <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay }}
        className="glass-card !p-0 overflow-hidden"
    >
        <div className={`${color} h-1.5`} />
        <div className="p-6">
            <p className="label-mono">{label}</p>
            <h3 className="text-6xl font-black mt-2">{value}</h3>
        </div>
    </motion.div>
);

const ActionCard = ({ icon, title, desc, link, color }) => (
    <Link to={link} className="glass-card !p-6 flex items-start justify-between group hover:!border-ink transition-colors">
        <div>
            <span className="block w-3.5 h-3.5 rounded-full border-[3px] bg-surface mb-6" style={{ borderColor: color }} />
            <h3 className="font-sans font-semibold text-lg text-ink">{title}</h3>
            <p className="label-mono mt-1">{desc}</p>
        </div>
        <span className="text-slate-400 group-hover:text-ink transition-colors [&>svg]:w-6 [&>svg]:h-6">{icon}</span>
    </Link>
);

const ActivityItem = ({ user, action, role, time }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
            <div>
                <p className="text-sm font-bold text-slate-900">{user} <span className="font-medium text-slate-400">{action}</span> {role}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-0.5">{time}</p>
            </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-200"/>
    </div>
);

export default Dashboard;
