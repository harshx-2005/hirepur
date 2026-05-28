import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, IndianRupee, Clock, Layout, Save, Trash2, Plus, Sparkles } from 'lucide-react';

const PostJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        salary_range: '',
        experience_required: '',
        job_type: 'full-time',
        work_mode: 'office',
        location: '',
        skills_required: []
    });

    const [newSkill, setNewSkill] = useState('');

    const { data: jobData, isLoading: isJobLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: async () => {
            const res = await apiClient.get(`/jobs/${id}`);
            return res.data.data;
        },
        enabled: isEdit,
        onSuccess: (data) => {
            setFormData({
                ...data,
                skills_required: Array.isArray(data.skills_required) ? data.skills_required : JSON.parse(data.skills_required || '[]')
            });
        }
    });

    // Handle initial state set for edit mode
    useEffect(() => {
        if (jobData) {
            setFormData({
                ...jobData,
                skills_required: Array.isArray(jobData.skills_required) ? jobData.skills_required : JSON.parse(jobData.skills_required || '[]')
            });
        }
    }, [jobData]);

    const mutation = useMutation({
        mutationFn: async (data) => {
            if (isEdit) {
                return await apiClient.put(`/jobs/${id}`, data);
            }
            return await apiClient.post('/jobs', data);
        },
        onSuccess: () => {
            navigate('/dashboard');
        }
    });

    const addSkill = () => {
        if (newSkill && !formData.skills_required.includes(newSkill)) {
            setFormData({ ...formData, skills_required: [...formData.skills_required, newSkill] });
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData({ ...formData, skills_required: formData.skills_required.filter(s => s !== skillToRemove) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isEdit && isJobLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-white py-12 px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">
                        {isEdit ? 'Edit Vacancy' : 'Post New Vacancy'}
                    </h1>
                    <p className="text-slate-500 font-medium">Define the role and attract top talent from HirePur's network.</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="glass-card !p-8 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Job Title</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300"/>
                                    <input 
                                        type="text" 
                                        required
                                        className="input-field !pl-12" 
                                        placeholder="e.g. Senior Frontend Engineer"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Job Description</label>
                                <textarea 
                                    required
                                    rows="6"
                                    className="input-field !p-4" 
                                    placeholder="Describe the role, responsibilities, and team..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Salary Range</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300"/>
                                    <input 
                                        type="text" 
                                        className="input-field !pl-12" 
                                        placeholder="e.g. 8 LPA - 12 LPA"
                                        value={formData.salary_range}
                                        onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300"/>
                                    <input 
                                        type="text" 
                                        required
                                        className="input-field !pl-12" 
                                        placeholder="e.g. Mumbai, Bengaluru or Remote"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Job Type</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300"/>
                                    <select 
                                        className="input-field !pl-12"
                                        value={formData.job_type}
                                        onChange={(e) => setFormData({...formData, job_type: e.target.value})}
                                    >
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Work Mode</label>
                                <div className="relative">
                                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300"/>
                                    <select 
                                        className="input-field !pl-12"
                                        value={formData.work_mode}
                                        onChange={(e) => setFormData({...formData, work_mode: e.target.value})}
                                    >
                                        <option value="office">Office</option>
                                        <option value="remote">Remote</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Exp. Level</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="e.g. 3+ Years"
                                    value={formData.experience_required}
                                    onChange={(e) => setFormData({...formData, experience_required: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Skills Required</label>
                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="Press enter to add skill"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                />
                                <button type="button" onClick={addSkill} className="btn-primary !py-2 !px-6">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills_required.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 group">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pb-20">
                        <button type="button" onClick={() => navigate('/dashboard')} className="btn-outline !px-10">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={mutation.isLoading}
                            className="btn-primary !px-10 flex items-center gap-2"
                        >
                            {mutation.isLoading ? 'Saving...' : (
                                <><Save className="w-5 h-5"/> {isEdit ? 'Update Changes' : 'Publish Job'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;
