import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from '../icons';
import Logo from './Logo';

const columns = [
    { line: 'L1', color: 'bg-metro-blue', title: 'Candidates', links: [['/jobs', 'Find a job'], ['/resume-builder', 'Resume builder'], ['/resume-analyzer', 'Resume check'], ['/interview-coach', 'Interview practice']] },
    { line: 'L2', color: 'bg-metro-red', title: 'Employers', links: [['/register', 'Post a role'], ['/jd-generator', 'Job description writer'], ['/applications/review', 'Review applicants']] },
    { line: 'L3', color: 'bg-metro-green', title: 'HirePur', links: [['/about', 'About'], ['/privacy', 'Privacy'], ['/terms', 'Terms']] },
];

const Footer = () => (
    <footer className="bg-ink text-paper mt-auto">
        {/* the four lines leaving the station */}
        <div className="grid grid-rows-4 h-3">
            <span className="bg-metro-blue" /><span className="bg-metro-red" /><span className="bg-metro-green" /><span className="bg-metro-yellow" />
        </div>
        <div className="max-w-7xl mx-auto px-5 md:px-10 pt-16 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                <div className="md:col-span-5 space-y-5">
                    <Logo inverted />
                    <p className="text-paper/60 text-sm leading-relaxed max-w-xs">
                        A job board built like a transit map: pick a line, board, and see exactly which stop your application is at.
                    </p>
                    <a href="mailto:support@hirepur.com" className="inline-flex items-center gap-2 text-sm text-paper/80 hover:text-paper">
                        <Mail className="w-4 h-4" /> support@hirepur.com
                    </a>
                </div>

                {columns.map(col => (
                    <div key={col.title} className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-5">
                            <span className={`${col.color} w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-semibold text-white`}>{col.line}</span>
                            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-paper/60">{col.title}</span>
                        </div>
                        <ul className="space-y-3 border-l border-paper/15 pl-4">
                            {col.links.map(([to, label]) => (
                                <li key={to}><Link to={to} className="text-sm text-paper/85 hover:text-paper">{label}</Link></li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-16 pt-6 border-t border-paper/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-paper/50">
                    &copy; {new Date().getFullYear()} HirePur · Made in Pune
                </p>
                <div className="flex items-center gap-4 text-paper/60">
                    <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-paper"><Github className="w-5 h-5" /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-paper"><Linkedin className="w-5 h-5" /></a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
