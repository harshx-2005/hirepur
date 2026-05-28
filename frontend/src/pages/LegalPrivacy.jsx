import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-white py-20 px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div>
                        <h1 className="text-6xl font-black tracking-tighter text-slate-900 mb-6">Privacy Policy</h1>
                        <p className="text-slate-500 font-medium text-lg">Last updated: March 15, 2026</p>
                    </div>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest border-b-4 border-primary/10 pb-2 inline-block">1. Introduction</h2>
                        <p className="text-slate-600 leading-relaxed font-medium">Welcome to HirePur. We value your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you use our AI-powered recruitment platform.</p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest border-b-4 border-primary/10 pb-2 inline-block">2. Information We Collect</h2>
                        <ul className="space-y-4 text-slate-600 font-medium list-disc pl-6 text-lg">
                            <li>Account Information: Name, email address, password, and professional role.</li>
                            <li>Profile Data: Resumes, education history, work experience, and skills.</li>
                            <li>Usage Data: Information on how you interact with our AI tools, search queries, and job applications.</li>
                            <li>Communication: Transcripts of chats and interview sessions mediated by our AI.</li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest border-b-4 border-primary/10 pb-2 inline-block">3. How We Use Your Data</h2>
                        <p className="text-slate-600 leading-relaxed font-medium">We use your data to provide AI-powered job matching, generate resumes, and provide interview feedback. We do not sell your personal data to third parties. Your data is used exclusively to enhance your recruitment experience on HirePur.</p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest border-b-4 border-primary/10 pb-2 inline-block">4. AI Analysis</h2>
                        <p className="text-slate-600 leading-relaxed font-medium italic bg-slate-50 p-6 rounded-3xl border border-slate-100">Our platform uses advanced AI models to analyze resumes and simulate interviews. By using HirePur, you consent to the processing of your professional data by our AI systems for the purpose of recruitment evaluation.</p>
                    </section>

                    <div className="pt-12 border-t border-slate-100 italic text-slate-400 font-medium">
                        If you have any questions about this Privacy Policy, please contact us at privacy@hirepur.com
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
