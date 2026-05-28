import { motion } from 'framer-motion';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-white py-20 px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div>
                        <h1 className="text-6xl font-black tracking-tighter text-slate-900 mb-6">Terms of Service</h1>
                        <p className="text-slate-500 font-medium text-lg">Last modified: March 15, 2026</p>
                    </div>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest border-b-4 border-primary/10 pb-2 inline-block">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 leading-relaxed font-medium">By accessing or using HirePur, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest border-b-4 border-primary/10 pb-2 inline-block">2. User Accounts</h2>
                        <p className="text-slate-600 leading-relaxed font-medium">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest border-b-4 border-primary/10 pb-2 inline-block">3. AI Services</h2>
                        <p className="text-slate-600 leading-relaxed font-medium">HirePur provides AI-generated content including resumes, job descriptions, and interview feedback. While we strive for accuracy, these outputs are for reference and should be reviewed by the user. HirePur is not liable for outcomes based on AI-generated suggestions.</p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest border-b-4 border-primary/10 pb-2 inline-block">4. Prohibited Conduct</h2>
                        <p className="text-slate-600 leading-relaxed font-medium">Users may not use the platform for fraudulent purposes, upload malicious code, or attempt to reverse engineer the AI models used by HirePur.</p>
                    </section>

                    <div className="pt-12 border-t border-slate-100 italic text-slate-400 font-medium">
                        For any legal inquiries, please contact legal@hirepur.com
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsOfService;
