import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, UserCheck, Bot, Zap, RefreshCw, Briefcase, GraduationCap, Plus, Trash2, Globe, Linkedin } from 'lucide-react';
import { useProfileStore } from '../store/useProfileStore';
import { useAIStore } from '../store/useAIStore';
import { useAuthStore } from '../store/useAuthStore';
import ReactMarkdown from 'react-markdown';

const ResumeBuilder = () => {
    const { user } = useAuthStore();
    const { profile, fetchProfile } = useProfileStore();
    const { generateResume, builderMutation, generatedResume, pdfMutation, persistenceMutation, syncResumeToProfile, downloadPDF } = useAIStore();
    const [step, setStep] = useState(1);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        location: '',
        linkedin: '',
        summary: '',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        isFresher: false,
        achievements: []
    });

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                phone: profile.phone || '',
                location: profile.location || '',
                linkedin: profile.linkedin || '',
                summary: profile.summary || '',
                experience: typeof profile.experience === 'string' ? JSON.parse(profile.experience) : (profile.experience || []),
                education: typeof profile.education === 'string' ? JSON.parse(profile.education) : (profile.education || []),
                projects: typeof profile.projects === 'string' ? JSON.parse(profile.projects) : (profile.projects || []),
                skills: typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []),
                isFresher: profile.isFresher || false,
                achievements: typeof profile.achievements === 'string' ? JSON.parse(profile.achievements) : (profile.achievements || [])
            }));
        }
    }, [profile]);

    const handleGenerate = async () => {
        await generateResume(formData);
        setStep(2);
    };

    const handleSync = async () => {
        await syncResumeToProfile(generatedResume);
    };

    const addListItem = (field, template) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], template] }));
    };

    const removeListItem = (field, index) => {
        const newList = [...formData[field]];
        newList.splice(index, 1);
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const updateNestedItem = (field, index, subfield, value) => {
        const newList = [...formData[field]];
        newList[index] = { ...newList[index], [subfield]: value };
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Resume <span className="text-primary">Architect</span></h1>
                        <p className="text-gray-500 font-medium">Design your professional future with AI</p>
                    </div>
                    {step === 2 && (
                        <button 
                            onClick={() => setStep(1)}
                            className="btn-outline flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4"/> Edit Information
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto space-y-8"
                        >
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="glass-card">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <FileText className="text-primary w-5 h-5"/> Basic Contact Info
                                    </h3>
                                    
                                    {/* Fresher Mode Toggle */}
                                    <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-900">Fresher Mode</h4>
                                            <p className="text-xs text-gray-500 font-medium">Optimize resume layout for students and entry-level roles</p>
                                        </div>
                                        <button 
                                            onClick={() => setFormData({...formData, isFresher: !formData.isFresher})}
                                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${formData.isFresher ? 'bg-primary' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${formData.isFresher ? 'translate-x-6' : ''}`}></div>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                            <input type="text" className="input-field mt-1" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                            <input type="text" className="input-field mt-1" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                                            <input type="text" className="input-field mt-1" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Mumbai, Maharashtra" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">LinkedIn</label>
                                            <input type="text" className="input-field mt-1" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Professional Summary</label>
                                            <textarea rows="3" className="input-field mt-1" value={formData.summary} onChange={(e) => setFormData({...formData, summary: e.target.value})} placeholder="A concise professional summary for a one-page CV..."></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Experience */}
                                <div className="glass-card">
                                    <h3 className="text-lg font-bold mb-6 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="text-primary w-5 h-5"/> {formData.isFresher ? 'Internships & Work (Optional)' : 'Experience'}
                                        </div>
                                        <button onClick={() => addListItem('experience', { company: '', role: '', period: '', description: '' })} className="btn-outline !py-2 !px-4 text-xs flex items-center gap-2">
                                            <Plus className="w-4 h-4"/> Add Work
                                        </button>
                                    </h3>
                                    <div className="space-y-4">
                                        {formData.experience.map((exp, idx) => (
                                            <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                                <button onClick={() => removeListItem('experience', idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input type="text" className="input-field" placeholder="Company" value={exp.company} onChange={(e) => updateNestedItem('experience', idx, 'company', e.target.value)} />
                                                    <input type="text" className="input-field" placeholder="Role" value={exp.role} onChange={(e) => updateNestedItem('experience', idx, 'role', e.target.value)} />
                                                    <input type="text" className="input-field md:col-span-2" placeholder="Period (e.g. 2021 - Present)" value={exp.period} onChange={(e) => updateNestedItem('experience', idx, 'period', e.target.value)} />
                                                    <textarea className="input-field md:col-span-2" placeholder="Description" value={exp.description} onChange={(e) => updateNestedItem('experience', idx, 'description', e.target.value)}></textarea>
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
                                        <button onClick={() => addListItem('education', { institution: '', degree: '', year: '' })} className="btn-outline !py-2 !px-4 text-xs flex items-center gap-2">
                                            <Plus className="w-4 h-4"/> Add Education
                                        </button>
                                    </h3>
                                    <div className="space-y-4">
                                        {formData.education.map((edu, idx) => (
                                            <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                                <button onClick={() => removeListItem('education', idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input type="text" className="input-field" placeholder="Institution" value={edu.institution} onChange={(e) => updateNestedItem('education', idx, 'institution', e.target.value)} />
                                                    <input type="text" className="input-field" placeholder="Degree" value={edu.degree} onChange={(e) => updateNestedItem('education', idx, 'degree', e.target.value)} />
                                                    <input type="text" className="input-field md:col-span-2" placeholder="Year" value={edu.year} onChange={(e) => updateNestedItem('education', idx, 'year', e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Projects */}
                                <div className="glass-card">
                                    <h3 className="text-lg font-bold mb-6 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Globe className="text-primary w-5 h-5"/> Projects
                                        </div>
                                        <button onClick={() => addListItem('projects', { name: '', description: '', link: '' })} className="btn-outline !py-2 !px-4 text-xs flex items-center gap-2">
                                            <Plus className="w-4 h-4"/> Add Project
                                        </button>
                                    </h3>
                                    <div className="space-y-4">
                                        {formData.projects.map((proj, idx) => (
                                            <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                                <button onClick={() => removeListItem('projects', idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <input type="text" className="input-field" placeholder="Project Name" value={proj.name} onChange={(e) => updateNestedItem('projects', idx, 'name', e.target.value)} />
                                                    <input type="text" className="input-field" placeholder="Link (Optional)" value={proj.link} onChange={(e) => updateNestedItem('projects', idx, 'link', e.target.value)} />
                                                    <textarea className="input-field" placeholder="Description" value={proj.description} onChange={(e) => updateNestedItem('projects', idx, 'description', e.target.value)}></textarea>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Achievements & Certifications */}
                                <div className="glass-card">
                                    <h3 className="text-lg font-bold mb-6 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Zap className="text-primary w-5 h-5"/> Achievements & Certifications
                                        </div>
                                        <button onClick={() => addListItem('achievements', { title: '', issuer: '', year: '' })} className="btn-outline !py-2 !px-4 text-xs flex items-center gap-2">
                                            <Plus className="w-4 h-4"/> Add Achievement
                                        </button>
                                    </h3>
                                    <div className="space-y-4">
                                        {formData.achievements?.map((ach, idx) => (
                                            <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                                <button onClick={() => removeListItem('achievements', idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input type="text" className="input-field" placeholder="Achievement/Cert Title" value={ach.title} onChange={(e) => updateNestedItem('achievements', idx, 'title', e.target.value)} />
                                                    <input type="text" className="input-field" placeholder="Issuing Org (Optional)" value={ach.issuer} onChange={(e) => updateNestedItem('achievements', idx, 'issuer', e.target.value)} />
                                                    <input type="text" className="input-field md:col-span-2" placeholder="Year" value={ach.year} onChange={(e) => updateNestedItem('achievements', idx, 'year', e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Key Skills & Expert Areas (Comma separated)</label>
                                    <textarea 
                                        rows="3" 
                                        className="input-field" 
                                        placeholder="e.g. React, Node.js, Cloud Computing..."
                                        value={formData.skills.join(', ')}
                                        onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map(s => s.trim())})}
                                    ></textarea>
                                </div>

                                {/* AI Assistant at BOTTOM */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="p-8 rounded-3xl bg-primary text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                                <Bot className="w-8 h-8"/>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xl">AI Resume Architect</h4>
                                                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-[0.1em]">Verified Resume Builder</p>
                                            </div>
                                        </div>
                                        <p className="text-primary-foreground/80 text-sm mb-8 leading-relaxed">
                                            I'll analyze your input and generate a highly professional, **ATS-optimized** resume with correct industry terminology and premium formatting.
                                        </p>
                                        <button 
                                            onClick={handleGenerate}
                                            disabled={builderMutation.isPending}
                                            className="w-full bg-white text-primary font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                                        >
                                            {builderMutation.isPending ? <RefreshCw className="animate-spin w-6 h-6"/> : <Zap className="w-6 h-6"/>}
                                            {builderMutation.isPending ? 'Crafting your resume...' : 'Generate AI Professional CV'}
                                        </button>
                                    </div>
                                    <div className="glass-card text-center p-8 border-dashed flex flex-col items-center justify-center bg-gray-50/50">
                                         <FileText className="w-16 h-16 text-gray-200 mb-4"/>
                                         <h5 className="font-bold text-gray-400">Live Preview</h5>
                                         <p className="text-gray-400 text-sm italic mt-2">Preview will appear here after generation...</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card !p-0 overflow-hidden"
                        >
                            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                                <div className="flex gap-2">
                                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={handleSync}
                                        disabled={persistenceMutation.isPending}
                                        className="flex items-center gap-2 text-xs text-gray-300 hover:text-white px-3 py-1 rounded bg-white/10 transition"
                                    >
                                        {persistenceMutation.isPending ? <RefreshCw className="w-3 h-3 animate-spin"/> : <UserCheck className="w-3 h-3"/>}
                                        Sync to Profile
                                    </button>
                                    <button 
                                        onClick={() => downloadPDF(generatedResume)}
                                        disabled={pdfMutation.isPending}
                                        className="flex items-center gap-2 text-xs text-white px-3 py-1 rounded bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 transition"
                                    >
                                        {pdfMutation.isPending ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Download className="w-3 h-3"/>}
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                            <div className="p-12 bg-white min-h-[800px] shadow-inner font-serif">
                                <div className="max-w-3xl mx-auto">
                                    <div className="prose max-w-none prose-slate">
                                        <ReactMarkdown>{generatedResume}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ResumeBuilder;
