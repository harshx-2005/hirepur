import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import apiClient from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, Search, Filter, ChevronRight, Star, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const Jobs = () => {
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [page, setPage] = useState(1);

    const { data: jobsResponse, isLoading, error } = useQuery({
        queryKey: ['jobs', { location, page }],
        queryFn: async () => {
            const res = await apiClient.get(`/jobs?location=${location}&page=${page}`);
            return res.data;
        }
    });

    const jobs = jobsResponse?.data || [];
    const pagination = jobsResponse?.pagination || { pages: 1 };
    
    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) || 
        job.company_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 py-16 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">Explore Roles</h1>
                        <p className="text-slate-500 font-medium">Discover your next career milestone at top-tier companies.</p>
                    </div>
                </div>

                {/* Advanced Search & Filter Bar */}
                <div className="bg-white shadow-xl shadow-slate-200/40 rounded-[2.5rem] p-3 flex flex-col lg:flex-row items-center gap-3 border border-slate-100 mb-16">
                    <div className="flex-1 flex items-center gap-4 px-6 py-4 w-full lg:border-r border-slate-100">
                        <Search className="text-primary w-6 h-6"/>
                        <input 
                            type="text" 
                            placeholder="Search by role or company..." 
                            className="w-full bg-transparent border-none focus:outline-none text-lg font-bold text-slate-700 placeholder:text-slate-300"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="flex-1 flex items-center gap-4 px-6 py-4 w-full">
                        <MapPin className="text-secondary w-6 h-6"/>
                        <input 
                            type="text" 
                            placeholder="Filter by location..." 
                            className="w-full bg-transparent border-none focus:outline-none text-lg font-bold text-slate-700 placeholder:text-slate-300"
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Job Grid */}
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="glass-card animate-pulse h-80 bg-slate-100"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-24 glass-card bg-red-50/50 border-red-100">
                            <p className="text-red-500 font-black uppercase tracking-widest text-[10px]">Transmission Error</p>
                            <h3 className="text-xl font-bold mt-2">Failed to sync job data.</h3>
                        </motion.div>
                    ) : filteredJobs.length === 0 ? (
                        <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="text-center py-32 glass-card">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <Search className="w-10 h-10"/>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">No matches found</h3>
                            <p className="text-slate-400 font-medium">Try broadening your search criteria.</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredJobs.map((job, index) => (
                                    <JobCard key={job.id} job={job} index={index} user={user}/>
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="mt-16 flex justify-center items-center gap-4">
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="btn-outline !rounded-full p-4 disabled:opacity-30"
                                    >
                                        <ChevronRight className="w-5 h-5 rotate-180"/>
                                    </button>
                                    <div className="flex gap-2">
                                        {[...Array(pagination.pages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-12 h-12 rounded-full font-black text-sm transition-all ${
                                                    page === i + 1 
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/20 bg-blue-600' 
                                                        : 'bg-white text-slate-400 hover:bg-slate-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                        disabled={page === pagination.pages}
                                        className="btn-outline !rounded-full p-4 disabled:opacity-30"
                                    >
                                        <ChevronRight className="w-5 h-5"/>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const JobCard = ({ job, index, user }) => {
    const isCandidate = !user || user.role === 'job_seeker';

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative"
        >
            <div className="absolute top-8 right-8 text-slate-200 group-hover:text-primary transition-colors">
                <Star className="w-5 h-5"/>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-slate-50 rounded-[1.25rem] flex items-center justify-center border border-slate-100 font-black text-slate-400 text-xl group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                     {job.company_name?.[0]}
                </div>
                <div>
                     <span className="badge bg-slate-50 text-slate-500 mb-1 inline-block">{job.job_type || 'Full-time'}</span>
                     <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                </div>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <MapPin className="w-4 h-4 text-slate-300"/> {job.location} • {job.work_mode || 'Remote'}
                </div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest text-[#2563eb]">
                    <span className="text-lg">₹</span> {job.salary_range || 'Competitive Pay'}
                </div>
            </div>

            <div className="flex gap-4 pt-8 border-t border-slate-50">
                {isCandidate ? (
                    <>
                        <Link to={`/jobs/${job.id}`} className="btn-outline !py-3 !px-0 flex-1 !text-sm flex items-center justify-center border-slate-200 border text-slate-700 hover:bg-slate-50 rounded-xl">View Insights</Link>
                        <Link to={`/jobs/${job.id}`} className="btn-primary !py-3 !px-0 flex-1 !text-sm flex items-center justify-center bg-blue-600 text-white rounded-xl">Apply <ArrowRight className="w-4 h-4 ml-2"/></Link>
                    </>
                ) : (
                    <Link to={`/jobs/${job.id}`} className="btn-primary w-full !py-3 !px-0 !text-sm flex items-center justify-center bg-blue-600 text-white rounded-xl">View Insights & Analytics <ArrowRight className="w-4 h-4 ml-2"/></Link>
                )}
            </div>
        </motion.div>
    );
};

export default Jobs;
