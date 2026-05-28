import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Zap, FileText, Bot, ChevronRight, Star, Users, CheckCircle } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full mb-8"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">AI-Powered Recruitment</span>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]"
                        >
                            Connect with <span className="gradient-text">Future</span> <br/> 
                            Work Instantly.
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed"
                        >
                            The intelligent bridge between ambitious talent and visionary companies. 
                            Powered by semantic AI matching and real-time collaboration.
                        </motion.p>
                        
                        {/* Interactive Search Bar */}
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-4xl mx-auto bg-white shadow-2xl shadow-slate-200/50 rounded-[40px] p-2 flex flex-col md:flex-row items-center gap-2 border border-slate-100 mb-16"
                        >
                            <div className="flex-1 flex items-center gap-4 px-6 py-4 w-full md:border-r border-slate-100">
                                <Search className="text-primary w-6 h-6"/>
                                <input type="text" placeholder="Job title or company" className="w-full bg-transparent border-none focus:outline-none text-lg font-medium text-slate-700 placeholder:text-slate-300" />
                            </div>
                            <div className="flex-1 flex items-center gap-4 px-6 py-4 w-full">
                                <MapPin className="text-secondary w-6 h-6"/>
                                <input type="text" placeholder="Location or Remote" className="w-full bg-transparent border-none focus:outline-none text-lg font-medium text-slate-700 placeholder:text-slate-300" />
                            </div>
                            <Link to="/jobs" className="btn-primary !rounded-[32px] !px-12 !py-5 w-full md:w-auto text-lg">
                                Find Jobs
                            </Link>
                        </motion.div>

                        <motion.div 
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ delay: 0.4 }}
                             className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 opacity-25 mt-16"
                        >
                            <div className="font-black text-sm md:text-base uppercase tracking-[0.4em]">Software & AI</div>
                            <div className="font-black text-sm md:text-base uppercase tracking-[0.4em]">Fintech</div>
                            <div className="font-black text-sm md:text-base uppercase tracking-[0.4em]">Healthcare</div>
                            <div className="font-black text-sm md:text-base uppercase tracking-[0.4em]">E-Commerce</div>
                            <div className="font-black text-sm md:text-base uppercase tracking-[0.4em]">Global Logistics</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* AI Capability Grid */}
            <section className="py-32 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
                        <div>
                            <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
                                <Zap className="text-primary w-8 h-8"/>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
                                Why Settle for Less <br/> Than <span className="text-primary">Perfect?</span>
                            </h2>
                            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                                Traditional job boards are broken. We use semantic analysis to understand 
                                your career goals and match you with roles where you'll actually thrive.
                            </p>
                            
                            <ul className="space-y-4 mb-10">
                                {[
                                    "98% Accuracy in AI matching",
                                    "Real-time interview simulation",
                                    "Automated ATS optimization",
                                    "Direct employer communication"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                                        <CheckCircle className="text-secondary w-5 h-5"/> {item}
                                    </li>
                                ))}
                            </ul>

                            <Link to="/register" className="btn-outline">
                                Get Started Free <ChevronRight className="w-5 h-5"/>
                            </Link>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="relative bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Bot className="text-primary w-6 h-6"/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">HirePur AI Assistant</h4>
                                        <p className="text-xs text-slate-400">Analyzing 12.4k skills...</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="h-4 bg-slate-50 w-full rounded-full overflow-hidden">
                                        <motion.div initial={{width:0}} whileInView={{width:'85%'}} className="h-full bg-primary"></motion.div>
                                    </div>
                                    <div className="h-4 bg-slate-50 w-3/4 rounded-full overflow-hidden">
                                        <motion.div initial={{width:0}} whileInView={{width:'60%'}} className="h-full bg-secondary"></motion.div>
                                    </div>
                                </div>
                                
                                <div className="mt-12 p-6 bg-slate-50 rounded-3xl">
                                    <p className="text-sm italic text-slate-500 font-medium">
                                        "Based on your recent profile update, you are a 98% match for the lead Cloud Engineer role at an Enterprise Partner. Recommendations: Very High."
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Bot className="w-8 h-8 text-white"/>}
                            title="AI Resume Builder"
                            desc="Craft a high-converting CV in seconds with our industry-agnostic AI agent."
                            color="bg-primary"
                            link="/resume-builder"
                        />
                        <FeatureCard 
                            icon={<FileText className="w-8 h-8 text-white"/>}
                            title="Resume Analyzer"
                            desc="Get deep insights into how recruiters see your profile and fix critical gaps."
                            color="bg-secondary"
                            link="/resume-analyzer"
                        />
                        <FeatureCard 
                            icon={<Zap className="w-8 h-8 text-white"/>}
                            title="Interview Coach"
                            desc="Practice in a safe environment with an AI that mimics real-world interviewers."
                            color="bg-slate-900"
                            link="/interview-coach"
                        />
                    </div>
                </div>
            </section>

            {/* Footer-like CTA */}
            <section className="py-32 px-6">
                 <div className="max-w-5xl mx-auto bg-slate-900 rounded-[50px] p-12 md:p-24 text-center overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[150px] rounded-full"></div>
                     <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">
                         Ready to Level Up Your <br/> <span className="gradient-text">Career</span> Journey?
                     </h2>
                     <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto relative z-10">
                         Join over 50,000 professionals finding better roles through HirePur's intelligent ecosystem.
                     </p>
                     <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-center">
                        <Link to="/register" className="btn-primary !px-12 !py-5">Join Now</Link>
                        <Link to="/jobs" className="btn-outline !bg-transparent !text-white !border-white/20 hover:!bg-white/10">Browse Jobs</Link>
                     </div>
                 </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, color, link }) => (
    <Link to={link || '#'} className="group glass-card hover:-translate-y-2 transition-all p-10 cursor-pointer">
        <div className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:rotate-[10deg] transition-transform`}>
            {icon}
        </div>
        <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-500 leading-relaxed mb-6">{desc}</p>
        <div className="flex items-center gap-2 font-black text-sm text-primary group-hover:gap-4 transition-all uppercase tracking-widest">
            Try Tool <ChevronRight className="w-4 h-4"/>
        </div>
    </Link>
);

export default Home;
