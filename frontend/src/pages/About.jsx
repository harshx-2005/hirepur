import { motion } from 'framer-motion';
import { Briefcase, Users, Target, Rocket, CheckCircle2, Award, Zap, Heart } from 'lucide-react';

const About = () => {
    const highlights = [
        { label: 'AI Semantic Matching', value: '98%', description: 'Match accuracy for your dream role', icon: Zap, color: 'text-primary' },
        { label: 'Direct Hiring', value: 'Live', description: 'Connect directly with top employers', icon: Briefcase, color: 'text-secondary' },
        { label: 'Interview Coaching', value: '24/7', description: 'AI assistant ready to help', icon: Target, color: 'text-green-500' },
        { label: 'Smart Tracking', value: 'Real-time', description: 'Live status of your applications', icon: Rocket, color: 'text-orange-500' },
    ];

    const values = [
        {
            title: "Fair Recruitment",
            description: "We believe in equal opportunities for everyone, using AI to eliminate bias and find the best fit.",
            icon: Heart,
            bg: "bg-red-50"
        },
        {
            title: "Innovation First",
            description: "Our AI-driven tools help candidates and employers bridge the gap with cutting-edge technology.",
            icon: Zap,
            bg: "bg-yellow-50"
        },
        {
            title: "Career Growth",
            description: "We don't just provide jobs; we provide tools like AI Interview Coaching to help you grow.",
            icon: Award,
            bg: "bg-blue-50"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-24 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-slate-50 rounded-[100%] -mt-64 -z-10"></div>
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-8"
                    >
                        <Rocket className="w-3 h-3" /> Our Mission
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-8"
                    >
                        Connecting Talent with <br />
                        <span className="text-primary italic">Intelligence</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed"
                    >
                        HirePur is India's leading AI-powered recruitment platform, designed specifically to solve the modern challenges of hiring. We empower candidates to build better careers and help companies find their perfect match.
                    </motion.p>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {highlights.map((item, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card text-center p-8 group hover:border-primary/20 transition-all"
                            >
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <div className="text-4xl font-black text-slate-900 mb-2">{item.value}</div>
                                <div className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">{item.label}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{item.description}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 px-6 bg-slate-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-6">Built on Values, <br />Driven by Data</h2>
                            <p className="text-lg text-slate-500 mb-12">
                                At HirePur, we believe that the right job can change a person's life, and the right person can transform a business. Our values guide every decision we make.
                            </p>
                            <div className="space-y-6">
                                {['AI-First approach to matching','Real-time feedback for candidates','Premium design & seamless UX','Data privacy and security'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="bg-green-100 p-1 rounded-full">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className="font-bold text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-6">
                            {values.map((v, i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ x: 10 }}
                                    className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6"
                                >
                                    <div className={`p-4 ${v.bg} rounded-2xl`}>
                                        <v.icon className="w-6 h-6 text-slate-900" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">{v.title}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">{v.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto glass-card !p-16 !rounded-[3rem] bg-slate-900 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full -ml-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-8">Ready to transform your <br />hiring experience?</h2>
                         <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button className="btn-primary !px-10 !py-4 text-lg">Sign Up Now</button>
                            <button className="btn-outline !bg-transparent !text-white !border-white/20 hover:!bg-white/10 !px-10 !py-4 text-lg">Browse Jobs</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
