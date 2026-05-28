import { Link } from 'react-router-dom';
import { Briefcase, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 mt-auto">
            <div className="max-w-7xl mx-auto py-20 px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
                    <div className="col-span-1 md:col-span-1 space-y-6">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-black text-slate-900 tracking-tighter">
                            <div className="bg-primary p-1.5 rounded-xl shadow-lg shadow-primary/20">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            HirePur
                        </Link>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            The intelligent bridge between ambitious talent and visionary companies. Powered by HirePur AI.
                        </p>
                        <div className="flex items-center gap-4 text-slate-300">
                             <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5"/></a>
                             <a href="#" className="hover:text-primary transition-colors"><Github className="w-5 h-5"/></a>
                             <a href="#" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5"/></a>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-8">Candidates</h3>
                        <ul className="space-y-4">
                            <li><Link to="/jobs" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Find Opportunities</Link></li>
                            <li><Link to="/resume-builder" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">AI Resume Builder</Link></li>
                            <li><Link to="/interview-coach" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Interview Coach</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-8">Employers</h3>
                        <ul className="space-y-4">
                            <li><Link to="/register" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Post a Role</Link></li>
                            <li><Link to="/jd-generator" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">JD Generator</Link></li>
                            <li><Link to="/applications/review" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Candidate Review</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-8">Support</h3>
                        <ul className="space-y-4">
                            <li><Link to="/about" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Company Story</Link></li>
                            <li><Link to="/contact" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Get Assistance</Link></li>
                            <li className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Mail className="w-4 h-4 text-slate-300"/> support@hirepur.com
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                        &copy; 2026 HirePur Intelligence Inc. Built for Excellence.
                    </p>
                    <div className="flex gap-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <Link to="/privacy" className="hover:text-slate-500">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-slate-500">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
