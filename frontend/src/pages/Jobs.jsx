import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { MapPin, Search, ArrowRight, ChevronLeft, ChevronRight } from '../icons';
import { useAuthStore } from '../store/useAuthStore';

const LINE_COLORS = ['#0a5bd3', '#e0322b', '#1e8e4e', '#f5b700'];

const Jobs = () => {
    const { user } = useAuthStore();
    const [params] = useSearchParams();
    const [search, setSearch] = useState(params.get('q') || '');
    const [location, setLocation] = useState(params.get('location') || '');
    const [page, setPage] = useState(1);

    const { data: jobsResponse, isLoading, error } = useQuery({
        queryKey: ['jobs', { location, page }],
        queryFn: async () => {
            const res = await apiClient.get(`/jobs?location=${encodeURIComponent(location)}&page=${page}`);
            return res.data;
        }
    });

    const jobs = jobsResponse?.data || [];
    const pagination = jobsResponse?.pagination || { pages: 1 };

    const needle = search.toLowerCase();
    const filteredJobs = jobs.filter(job =>
        [job.title, job.company_name, job.description, job.skills, job.category]
            .filter(Boolean).join(' ').toLowerCase().includes(needle)
    );

    return (
        <div className="min-h-screen bg-paper py-12 px-5 md:px-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center border-b border-ink pb-3 mb-8">
                    <span className="label-mono !text-ink">Departures · All lines</span>
                    {!isLoading && !error && <span className="label-mono">{filteredJobs.length} on this page</span>}
                </div>

                <h1 className="font-display font-black uppercase text-6xl md:text-8xl leading-[0.86] mb-10">Open roles</h1>

                <div className="bg-surface border border-ink rounded-lg flex flex-col md:flex-row overflow-hidden mb-10">
                    <label className="flex-1 flex items-center gap-3 px-4 py-3.5 border-b md:border-b-0 md:border-r border-ink/15 cursor-text">
                        <Search className="w-5 h-5 text-slate-500 shrink-0"/>
                        <input
                            type="text"
                            placeholder="Role, company or skill"
                            aria-label="Role, company or skill"
                            className="w-full bg-transparent focus:outline-none placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </label>
                    <label className="flex-1 flex items-center gap-3 px-4 py-3.5 cursor-text">
                        <MapPin className="w-5 h-5 text-slate-500 shrink-0"/>
                        <input
                            type="text"
                            placeholder="City or remote"
                            aria-label="City or remote"
                            className="w-full bg-transparent focus:outline-none placeholder:text-slate-400"
                            value={location}
                            onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                        />
                    </label>
                </div>

                {/* column heads, like a departure board */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 pb-2 label-mono !text-[10px]">
                    <span className="col-span-5">Role</span>
                    <span className="col-span-3">Where</span>
                    <span className="col-span-2">Pay</span>
                    <span className="col-span-2 text-right">Board</span>
                </div>

                {isLoading ? (
                    <div className="border-t border-ink/15">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[76px] border-b border-ink/10 flex items-center gap-4 px-5">
                                <span className="w-3 h-3 rounded-full bg-slate-200" />
                                <span className="h-4 w-1/3 bg-slate-200/70 rounded-sm animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="border border-metro-red/40 bg-metro-red/5 rounded-lg px-6 py-10">
                        <span className="label-mono !text-metro-red">Service disruption</span>
                        <h3 className="font-display font-extrabold uppercase text-3xl mt-2">Couldn't load jobs.</h3>
                        <p className="text-slate-600 mt-2">The server didn't answer. Check that the backend is running, then refresh.</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="border-t border-ink/15 py-20 text-center">
                        <span className="label-mono">No departures</span>
                        <h3 className="font-display font-extrabold uppercase text-4xl mt-2">Nothing matches that search</h3>
                        <p className="text-slate-600 mt-2">Try a shorter role name, or clear the city.</p>
                    </div>
                ) : (
                    <>
                        <div className="border-t border-ink/15">
                            {filteredJobs.map((job, index) => (
                                <JobRow key={job.id} job={job} index={index} user={user}/>
                            ))}
                        </div>

                        {pagination.pages > 1 && (
                            <div className="mt-10 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-outline !p-2.5 disabled:opacity-30"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-5 h-5"/>
                                </button>
                                {[...Array(pagination.pages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        aria-current={page === i + 1 ? 'page' : undefined}
                                        className={`w-10 h-10 rounded-md font-mono text-sm transition-colors ${
                                            page === i + 1 ? 'bg-ink text-paper' : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                    className="btn-outline !p-2.5 disabled:opacity-30"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="w-5 h-5"/>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const JobRow = ({ job, index, user }) => {
    const isCandidate = !user || user.role === 'job_seeker';
    const color = LINE_COLORS[job.id % LINE_COLORS.length] || LINE_COLORS[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 10) * 0.04, duration: 0.35 }}
        >
            <Link to={`/jobs/${job.id}`}
                className="group grid grid-cols-12 gap-x-4 gap-y-1 items-center px-5 py-5 border-b border-ink/10 hover:bg-surface transition-colors">
                <div className="col-span-12 md:col-span-5 flex items-center gap-4 min-w-0">
                    <span className="w-3 h-3 rounded-full border-[3px] shrink-0 bg-surface" style={{ borderColor: color }} />
                    <div className="min-w-0">
                        <h3 className="font-sans text-[17px] font-semibold leading-tight truncate group-hover:text-primary transition-colors">{job.title}</h3>
                        <p className="text-sm text-slate-500 truncate">{job.company_name}</p>
                    </div>
                </div>
                <div className="col-span-6 md:col-span-3 pl-7 md:pl-0 text-sm text-slate-600 truncate">
                    {job.location}{job.work_mode ? ` · ${job.work_mode}` : ''}
                    <span className="badge text-slate-500 ml-2 hidden lg:inline-block">{job.job_type || 'Full-time'}</span>
                </div>
                <div className="col-span-6 md:col-span-2 font-mono text-sm text-ink truncate">
                    {job.salary_range ? `₹ ${job.salary_range}` : <span className="text-slate-400">Not listed</span>}
                </div>
                <div className="hidden md:flex col-span-2 justify-end items-center gap-2 text-sm font-semibold">
                    {isCandidate ? 'Apply' : 'Open'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
            </Link>
        </motion.div>
    );
};

export default Jobs;
