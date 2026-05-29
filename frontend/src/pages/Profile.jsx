import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfileStore } from '../store/useProfileStore';
import { User, Mail, MapPin, Linkedin, Globe, Save, RefreshCw, Briefcase, GraduationCap, Plus, Trash2, Zap, Camera } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';

const Profile = () => {
    const { user, setUser } = useAuthStore();
    const { profile, fetchProfile, updateProfile, isLoading, updateProfilePic } = useProfileStore();
    const [isUploading, setIsUploading] = useState(false);
    const [searchParams] = useSearchParams();
    const queryUserId = searchParams.get('userId');
    const isReadOnly = !!queryUserId;
    const [viewUser, setViewUser] = useState(null);
    
    const [formData, setFormData] = useState({
        phone: '',
        headline: '',
        summary: '',
        location: '',
        linkedin: '',
        portfolio: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        // Employer specific fields
        company_name: '',
        company_website: '',
        company_size: '',
        industry: '',
        company_description: ''
    });

    const [isFresher, setIsFresher] = useState(false);

    useEffect(() => {
        if (isReadOnly) {
            const fetchTargetProfile = async () => {
                try {
                    const res = await apiClient.get(`/profile/${queryUserId}`);
                    if (res.data.success) {
                        const targetData = res.data.data;
                        setViewUser({
                            name: targetData.name,
                            email: targetData.email,
                            role: targetData.role,
                            profile_pic: targetData.profile_pic
                        });
                        const targetProfile = targetData.profile || {};
                        setFormData({
                            phone: targetProfile.phone || '',
                            headline: targetProfile.headline || '',
                            summary: targetProfile.summary || '',
                            location: targetProfile.location || '',
                            linkedin: targetProfile.linkedin || '',
                            portfolio: targetProfile.portfolio || '',
                            skills: typeof targetProfile.skills === 'string' ? JSON.parse(targetProfile.skills) : (targetProfile.skills || []),
                            experience: typeof targetProfile.experience === 'string' ? JSON.parse(targetProfile.experience) : (targetProfile.experience || []),
                            education: typeof targetProfile.education === 'string' ? JSON.parse(targetProfile.education) : (targetProfile.education || []),
                            projects: typeof targetProfile.projects === 'string' ? JSON.parse(targetProfile.projects) : (targetProfile.projects || []),
                            company_name: targetProfile.company_name || '',
                            company_website: targetProfile.company_website || '',
                            company_size: targetProfile.company_size || '',
                            industry: targetProfile.industry || '',
                            company_description: targetProfile.company_description || ''
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch target user profile:', err);
                }
            };
            fetchTargetProfile();
        } else {
            fetchProfile();
        }
    }, [fetchProfile, isReadOnly, queryUserId]);

    useEffect(() => {
        if (!isReadOnly && profile) {
            setFormData({
                phone: profile.phone || '',
                headline: profile.headline || '',
                summary: profile.summary || '',
                location: profile.location || '',
                linkedin: profile.linkedin || '',
                portfolio: profile.portfolio || '',
                skills: typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []),
                experience: typeof profile.experience === 'string' ? JSON.parse(profile.experience) : (profile.experience || []),
                education: typeof profile.education === 'string' ? JSON.parse(profile.education) : (profile.education || []),
                projects: typeof profile.projects === 'string' ? JSON.parse(profile.projects) : (profile.projects || []),
                company_name: profile.company_name || '',
                company_website: profile.company_website || '',
                company_size: profile.company_size || '',
                industry: profile.industry || '',
                company_description: profile.company_description || ''
            });
        }
    }, [profile, isReadOnly]);

    const handleSave = async () => {
        if (isReadOnly) return;
        await updateProfile(formData);
    };

    const handlePhotoUpload = async (e) => {
        if (isReadOnly) return;
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        setIsUploading(true);
        try {
            const res = await apiClient.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data.url;
            const success = await updateProfilePic(url);
            if (success) {
                setUser({ ...user, profile_pic: url });
            }
        } catch (err) {
            console.error('Photo upload failed', err);
        } finally {
            setIsUploading(false);
        }
    };

    const addListItem = (field, template) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], template] }));
    };

    const removeListItem = (field, index) => {
        const newList = [...formData[field]];
        newList.splice(index, 1);
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const updateListItem = (field, index, value) => {
        const newList = [...formData[field]];
        newList[index] = value;
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const updateNestedItem = (field, index, subfield, value) => {
        const newList = [...formData[field]];
        newList[index] = { ...newList[index], [subfield]: value };
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const displayName = isReadOnly ? viewUser?.name : user?.name;
    const displayEmail = isReadOnly ? viewUser?.email : user?.email;
    const displayRole = isReadOnly ? viewUser?.role : user?.role;
    const displayPic = isReadOnly ? viewUser?.profile_pic : user?.profile_pic;

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header Card */}
                <div className="glass-card flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-primary to-secondary p-1 overflow-hidden">
                            <div className="w-full h-full rounded-[2.3rem] bg-white flex items-center justify-center overflow-hidden">
                                {displayPic ? (
                                    <img src={displayPic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-primary" />
                                )}
                            </div>
                        </div>
                        {!isReadOnly && (
                            <label className="absolute -bottom-2 -right-2 bg-primary w-10 h-10 rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                                <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                                {isUploading ? <RefreshCw className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
                            </label>
                        )}
                    </div>

                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-3xl font-black text-gray-900">{displayName}</h1>
                        <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                            <Mail className="w-4 h-4"/> {displayEmail}
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                <MapPin className="w-3 h-3"/> {formData.location || 'Location Not Set'}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                                <Briefcase className="w-3 h-3"/> {displayRole === 'employer' ? formData.company_name : displayRole?.replace('_', ' ')}
                            </div>
                        </div>
                    </div>


                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column - Basics */}
                    <div className="space-y-6">
                        <div className="glass-card">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 italic">
                                <motion.span animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>👋</motion.span> Introduction
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Phone Number</label>
                                    <input 
                                        type="text" 
                                        className="input-field mt-1" 
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Professional Headline</label>
                                    <input 
                                        type="text" 
                                        className="input-field mt-1" 
                                        placeholder="e.g. Aspiring Software Engineer | Recent Graduate"
                                        value={formData.headline}
                                        onChange={(e) => setFormData({...formData, headline: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Personal Summary / Bio</label>
                                    <textarea 
                                        rows="4"
                                        className="input-field mt-1" 
                                        placeholder="Briefly describe your professional background, academic achievements, or career goals..."
                                        value={formData.summary}
                                        onChange={(e) => setFormData({...formData, summary: e.target.value})}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Base Location</label>
                                    <input 
                                        type="text" 
                                        className="input-field mt-1" 
                                        placeholder="e.g. Mumbai, Maharashtra"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Globe className="text-primary w-5 h-5"/> Social Presence
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">LinkedIn URL</label>
                                    <div className="relative mt-1">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text" 
                                            className="input-field pl-10" 
                                            placeholder="linkedin.com/in/username"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Portfolio / Website</label>
                                    <div className="relative mt-1">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text" 
                                            className="input-field pl-10" 
                                            placeholder="your-portfolio.me"
                                            value={formData.portfolio}
                                            onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="lg:col-span-2 space-y-6">
                        {user?.role === 'employer' ? (
                            <div className="glass-card space-y-8">
                                <h3 className="text-xl font-bold flex items-center gap-2 italic">
                                    🏢 Company Information
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Company Name</label>
                                        <input 
                                            type="text" 
                                            className="input-field mt-1" 
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Company Website</label>
                                        <div className="relative mt-1">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="text" 
                                                className="input-field pl-10" 
                                                value={formData.company_website}
                                                onChange={(e) => setFormData({...formData, company_website: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Industry</label>
                                        <input 
                                            type="text" 
                                            className="input-field mt-1" 
                                            value={formData.industry}
                                            onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Company Size</label>
                                        <select 
                                            className="input-field mt-1 bg-white"
                                            value={formData.company_size}
                                            onChange={(e) => setFormData({...formData, company_size: e.target.value})}
                                        >
                                            <option value="">Select Size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-500">201-500 employees</option>
                                            <option value="501-1000">501-1000 employees</option>
                                            <option value="1000+">1000+ employees</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Company Description</label>
                                    <textarea 
                                        rows="6"
                                        className="input-field mt-1" 
                                        value={formData.company_description}
                                        onChange={(e) => setFormData({...formData, company_description: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Skills */}
                                <div className="glass-card">
                                    <h3 className="text-lg font-bold mb-6 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Zap className="text-secondary w-5 h-5 fill-secondary"/> Technical Skills
                                        </div>
                                        <button 
                                            onClick={() => addListItem('skills', '')}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition"
                                        >
                                            <Plus className="w-5 h-5"/>
                                        </button>
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {formData.skills.map((skill, idx) => (
                                            <div key={idx} className="group relative">
                                                <input 
                                                    type="text" 
                                                    value={skill}
                                                    onChange={(e) => updateListItem('skills', idx, e.target.value)}
                                                    className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition w-32"
                                                    placeholder="Add skill..."
                                                />
                                                <button 
                                                    onClick={() => removeListItem('skills', idx)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-lg"
                                                >
                                                    <Trash2 className="w-3 h-3"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div className="glass-card">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Briefcase className="text-primary w-5 h-5"/> Experience
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            {user?.role === 'job_seeker' && (
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                                                        checked={isFresher}
                                                        onChange={(e) => setIsFresher(e.target.checked)}
                                                    />
                                                    <span className="text-xs font-bold text-gray-500 uppercase group-hover:text-primary transition">I am a Fresher</span>
                                                </label>
                                            )}
                                            <button 
                                                onClick={() => addListItem('experience', { company: '', role: '', period: '', description: '', type: isFresher && user?.role === 'job_seeker' ? 'Internship' : 'Job' })}
                                                className="btn-outline !py-2 !px-4 text-xs flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4"/> Add {isFresher && user?.role === 'job_seeker' ? 'Internship' : 'Work'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {isFresher && user?.role === 'job_seeker' && formData.experience.length === 0 ? (
                                        <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl text-center bg-gray-50/50">
                                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-4">
                                                🎓
                                            </motion.div>
                                            <h4 className="font-bold text-gray-900">Career Kickstart</h4>
                                            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                                                I see you're a fresher! You can add **Internships** here if you have any, or focus on your **projects** and **education** below.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {formData.experience.map((exp, idx) => (
                                                <div key={idx} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/20 relative group">
                                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                                        <select 
                                                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold uppercase text-gray-400 outline-none"
                                                            value={exp.type || 'Job'}
                                                            onChange={(e) => updateNestedItem('experience', idx, 'type', e.target.value)}
                                                        >
                                                            <option value="Job">Job</option>
                                                            <option value="Internship">Internship</option>
                                                        </select>
                                                        <button 
                                                            onClick={() => removeListItem('experience', idx)}
                                                            className="text-gray-300 hover:text-red-500 transition"
                                                        >
                                                            <Trash2 className="w-5 h-5"/>
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Company</label>
                                                            <input 
                                                                type="text" 
                                                                className="input-field mt-1" 
                                                                value={exp.company}
                                                                onChange={(e) => updateNestedItem('experience', idx, 'company', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Role</label>
                                                            <input 
                                                                type="text" 
                                                                className="input-field mt-1" 
                                                                value={exp.role}
                                                                onChange={(e) => updateNestedItem('experience', idx, 'role', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Duration / Period</label>
                                                            <input 
                                                                type="text" 
                                                                className="input-field mt-1" 
                                                                placeholder="e.g. Jan 2021 - Present"
                                                                value={exp.period}
                                                                onChange={(e) => updateNestedItem('experience', idx, 'period', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Key Achievements</label>
                                                            <textarea 
                                                                rows="3" 
                                                                className="input-field mt-1" 
                                                                value={exp.description}
                                                                onChange={(e) => updateNestedItem('experience', idx, 'description', e.target.value)}
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Projects */}
                                <div className="glass-card">
                                    <h3 className="text-lg font-bold mb-6 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Globe className="text-primary w-5 h-5"/> Projects
                                        </div>
                                        <button 
                                            onClick={() => addListItem('projects', { name: '', description: '', link: '' })}
                                            className="btn-outline !py-2 !px-4 text-xs flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4"/> Add Project
                                        </button>
                                    </h3>
                                    <div className="space-y-6">
                                        {formData.projects.map((proj, idx) => (
                                            <div key={idx} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/20 relative group">
                                                <button 
                                                    onClick={() => removeListItem('projects', idx)}
                                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition"
                                                >
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                                <div className="grid grid-cols-1 gap-6">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Project Name</label>
                                                        <input 
                                                            type="text" 
                                                            className="input-field mt-1" 
                                                            value={proj.name}
                                                            onChange={(e) => updateNestedItem('projects', idx, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Link</label>
                                                        <input 
                                                            type="text" 
                                                            className="input-field mt-1" 
                                                            value={proj.link}
                                                            onChange={(e) => updateNestedItem('projects', idx, 'link', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description</label>
                                                        <textarea 
                                                            rows="3" 
                                                            className="input-field mt-1" 
                                                            value={proj.description}
                                                            onChange={(e) => updateNestedItem('projects', idx, 'description', e.target.value)}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Education */}
                                <div className="glass-card">
                                    <h3 className="text-lg font-bold mb-6 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="text-primary w-5 h-5"/> Education
                                        </div>
                                        <button 
                                            onClick={() => addListItem('education', { institution: '', degree: '', year: '' })}
                                            className="btn-outline !py-2 !px-4 text-xs flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4"/> Add History
                                        </button>
                                    </h3>
                                    <div className="space-y-6">
                                        {formData.education.map((edu, idx) => (
                                            <div key={idx} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/20 relative group">
                                                <button 
                                                    onClick={() => removeListItem('education', idx)}
                                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition"
                                                >
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="md:col-span-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Institution</label>
                                                        <input 
                                                            type="text" 
                                                            className="input-field mt-1" 
                                                            value={edu.institution}
                                                            onChange={(e) => updateNestedItem('education', idx, 'institution', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Degree</label>
                                                        <input 
                                                            type="text" 
                                                            className="input-field mt-1" 
                                                            value={edu.degree}
                                                            onChange={(e) => updateNestedItem('education', idx, 'degree', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Year</label>
                                                        <input 
                                                            type="text" 
                                                            className="input-field mt-1" 
                                                            value={edu.year}
                                                            onChange={(e) => updateNestedItem('education', idx, 'year', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Final Save Button */}
                {!isReadOnly && (
                    <div className="flex justify-center pt-8 pb-12">
                        <button 
                            onClick={handleSave}
                            disabled={isLoading}
                            className="btn-primary px-12 py-4 flex items-center gap-3 shadow-2xl shadow-primary/30 disabled:opacity-50 text-lg"
                        >
                            {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                            Save Professional Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
