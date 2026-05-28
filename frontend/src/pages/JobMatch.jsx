import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Zap, Briefcase, Star, TrendingUp, CheckCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobMatch = () => {
    const { data: matchesResponse, isLoading } = useQuery({
        queryKey: ['job-matches'],
        queryFn: async () => {
            const res = await apiClient.get('/ai/job-match');
            return res.data;
        }
    });

    const matches = matchesResponse?.data || [];

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 text-center">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm mb-4"
                    >
                        <Zap className="w-4 h-4 fill-primary"/> AI Semantic Engine Active
                    </motion.div>
                    <h1 className="text-4xl font-bold text-gray-900">Your Identity Matches</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        We've analyzed your profile and semantic skills to find roles that perfectly align with your career trajectory.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="glass-card h-64 animate-pulse"></div>
                        ))}
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                         <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                             <Search className="w-10 h-10 text-gray-200" />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900">No matches found yet</h3>
                         <p className="text-gray-500 mt-2">Update your profile to improve our matching accuracy.</p>
                         <Link to="/profile" className="btn-primary mt-8 inline-block">Complete Profile</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {matches.map((job, idx) => (
                            <motion.div 
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card relative flex flex-col group hover:-translate-y-2 transition-all duration-300"
                            >
                                <div className="absolute top-4 right-4 bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3"/> {job.match_score}% Match
                                </div>
                                
                                <div className="flex items-center gap-4 mb-6 pt-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-2">
                                        <Briefcase className="text-primary w-6 h-6"/>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                                        <p className="text-sm text-gray-500">{job.company_name}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8 flex-grow">
                                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Why it matches:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(job.match_reasons || []).slice(0, 3).map((reason, i) => (
                                            <span key={i} className="flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                <CheckCircle className="w-3 h-3 text-green-500"/> {reason}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                    <Link to={`/jobs/${job.id}`} className="text-sm font-bold text-primary hover:underline">View Details</Link>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-4 h-4 fill-yellow-500"/>
                                        <Star className="w-4 h-4 fill-yellow-500"/>
                                        <Star className="w-4 h-4 fill-yellow-500"/>
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

export default JobMatch;
