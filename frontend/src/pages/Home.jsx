import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from '../icons';

const EASE = [0.7, 0, 0.2, 1];

// Four lines crossing at HirePur Central (320,260). Stations link to a job search.
const LINES = [
    { id: 'L1', name: 'Engineering', color: '#0a5bd3', d: 'M20 200 H150 L210 260 H620',
      stops: [{ x: 80, y: 200, label: 'Frontend', dy: -16 }, { x: 450, y: 260, label: 'Backend', dy: -16 }, { x: 575, y: 260, label: 'Data', dy: 26 }] },
    { id: 'L2', name: 'Design', color: '#e0322b', d: 'M40 470 H110 L530 50 H620',
      stops: [{ x: 190, y: 390, label: 'Product', dx: -14, anchor: 'end' }, { x: 440, y: 140, label: 'Brand', dx: 14, anchor: 'start' }] },
    { id: 'L3', name: 'Sales', color: '#1e8e4e', d: 'M260 20 V80 L320 140 V500',
      stops: [{ x: 260, y: 50, label: 'Partnerships', dx: -14, anchor: 'end' }, { x: 320, y: 430, label: 'Growth', dx: 14, anchor: 'start' }] },
    { id: 'L4', name: 'Operations', color: '#f5b700', d: 'M130 70 L520 460 H620',
      stops: [{ x: 190, y: 130, label: 'Finance', dx: -14, anchor: 'end' }, { x: 440, y: 380, label: 'People', dx: 14, anchor: 'start' }] },
];

const NetworkMap = () => {
    const [focus, setFocus] = useState(null);
    const navigate = useNavigate();
    const dim = (id) => (focus && focus !== id ? 0.15 : 1);

    return (
        <div>
            <svg viewBox="0 0 640 520" className="w-full h-auto select-none" role="img" aria-label="HirePur network map: four job categories as metro lines">
                {LINES.map((l, i) => (
                    <motion.path key={l.id} d={l.d} fill="none" stroke={l.color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1, opacity: dim(l.id) }}
                        transition={{ pathLength: { duration: 1.4, delay: 0.3 + i * 0.18, ease: EASE }, opacity: { duration: 0.25 } }} />
                ))}
                {LINES.map((l, i) => l.stops.map((s, j) => (
                    <motion.g key={s.label} className="cursor-pointer" onClick={() => navigate(`/jobs?q=${encodeURIComponent(s.label)}`)}
                        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: dim(l.id), scale: 1 }}
                        transition={{ delay: 1.2 + i * 0.18 + j * 0.08, duration: 0.3 }}
                        style={{ transformOrigin: `${s.x}px ${s.y}px` }}>
                        <circle cx={s.x} cy={s.y} r="8" fill="#fbfaf6" stroke="#121212" strokeWidth="3" />
                        <text x={s.x + (s.dx || 0)} y={s.y + (s.dy || 4)} textAnchor={s.anchor || 'middle'}
                            className="font-mono" fontSize="12" fontWeight="500" fill="#121212">{s.label}</text>
                    </motion.g>
                )))}
                {/* interchange */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
                    <circle cx="320" cy="260" r="17" fill="#fbfaf6" stroke="#121212" strokeWidth="4" />
                    <circle cx="320" cy="260" r="5" fill="#121212" />
                    <rect x="346" y="276" width="128" height="24" rx="3" fill="#121212" />
                    <text x="410" y="292" textAnchor="middle" className="font-mono" fontSize="11" fontWeight="600" fill="#f4f2ec" letterSpacing="1">HIREPUR CENTRAL</text>
                </motion.g>
            </svg>

            <div className="flex flex-wrap gap-2 mt-4" onMouseLeave={() => setFocus(null)}>
                {LINES.map(l => (
                    <Link key={l.id} to={`/jobs?q=${encodeURIComponent(l.name)}`}
                        onMouseEnter={() => setFocus(l.id)} onFocus={() => setFocus(l.id)} onBlur={() => setFocus(null)}
                        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-ink/15 hover:border-ink bg-surface transition-colors">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-semibold text-white" style={{ background: l.color, color: l.id === 'L4' ? '#121212' : '#fff' }}>{l.id}</span>
                        <span className="text-sm font-medium">{l.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const RevealLine = ({ children, delay = 0 }) => (
    <span className="block overflow-hidden pb-1">
        <motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay, ease: EASE }}>
            {children}
        </motion.span>
    </span>
);

const JOURNEY = [
    { stop: 'Applied', text: 'Apply in two clicks. The resume on your profile goes with it, so there is nothing to re-upload.' },
    { stop: 'In review', text: 'The employer opens your application. You get a notification and an email when it moves.' },
    { stop: 'Interview', text: 'Talk to the hiring team directly in Messages and agree on a time — no third-party back and forth.' },
    { stop: 'Offer', text: 'An offer, or a clear “not this time”. Either way the line ends with an answer, not silence.' },
];

const DEPARTURES = [
    { line: 'L1', color: '#0a5bd3', name: 'Resume builder', what: 'Write and format a resume from your profile', to: '/resume-builder' },
    { line: 'L1', color: '#0a5bd3', name: 'Resume check', what: 'Score your resume against a job description', to: '/resume-analyzer' },
    { line: 'L1', color: '#0a5bd3', name: 'Interview practice', what: 'Answer real questions, get notes on each answer', to: '/interview-coach' },
    { line: 'L1', color: '#0a5bd3', name: 'Job match', what: 'Open roles ranked against your skills', to: '/job-match' },
    { line: 'L2', color: '#e0322b', name: 'JD writer', what: 'Turn a few bullet points into a clear job description', to: '/jd-generator' },
    { line: 'L2', color: '#e0322b', name: 'Applicant review', what: 'Move candidates along the line, one stop at a time', to: '/applications/review' },
];

const Home = () => {
    const navigate = useNavigate();
    const [q, setQ] = useState('');
    const [where, setWhere] = useState('');

    const search = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (where.trim()) params.set('location', where.trim());
        navigate(`/jobs${params.size ? `?${params}` : ''}`);
    };

    return (
        <div className="bg-paper">
            {/* Hero */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 pt-10 md:pt-14 pb-20">
                <div className="flex justify-between items-center border-b border-ink pb-3 mb-10 md:mb-14">
                    <span className="label-mono !text-ink">Network map</span>
                    <span className="label-mono hidden sm:block">Four lines · One interchange</span>
                    <span className="label-mono">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    <div className="lg:col-span-6">
                        <h1 className="font-display font-black uppercase text-[56px] sm:text-[84px] xl:text-[104px] leading-[0.86] tracking-[-0.01em]">
                            <RevealLine>Every career</RevealLine>
                            <RevealLine delay={0.1}>runs on <span className="text-primary">a line.</span></RevealLine>
                        </h1>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}
                            className="mt-8 text-lg text-slate-600 max-w-md leading-relaxed">
                            Find open roles across India, apply in a couple of clicks, and follow every application stop by stop — from Applied to Offer.
                        </motion.p>

                        <motion.form onSubmit={search} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.6 }}
                            className="mt-10 bg-surface border border-ink rounded-lg flex flex-col sm:flex-row sm:items-stretch overflow-hidden">
                            <label className="flex-1 flex items-center gap-3 px-4 py-3.5 border-b sm:border-b-0 sm:border-r border-ink/15 cursor-text">
                                <Search className="w-5 h-5 text-slate-500 shrink-0" />
                                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Role or company" aria-label="Role or company"
                                    className="w-full bg-transparent focus:outline-none placeholder:text-slate-400" />
                            </label>
                            <label className="flex-1 flex items-center gap-3 px-4 py-3.5 cursor-text">
                                <MapPin className="w-5 h-5 text-slate-500 shrink-0" />
                                <input value={where} onChange={e => setWhere(e.target.value)} placeholder="City or remote" aria-label="City or remote"
                                    className="w-full bg-transparent focus:outline-none placeholder:text-slate-400" />
                            </label>
                            <button type="submit" className="group bg-ink text-paper hover:bg-primary transition-colors px-6 py-3.5 font-semibold flex items-center justify-center gap-2">
                                Search jobs <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </motion.form>
                    </div>

                    <div className="lg:col-span-6">
                        <NetworkMap />
                    </div>
                </div>
            </section>

            {/* Journey */}
            <section className="border-t border-ink/10">
                <div className="max-w-7xl mx-auto px-5 md:px-10 py-24">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
                        <span className="label-mono md:col-span-3">How a hire travels</span>
                        <h2 className="md:col-span-9 font-display font-extrabold uppercase text-5xl md:text-7xl leading-[0.9]">
                            Four stops. <span className="text-slate-400">You always know which one you're at.</span>
                        </h2>
                    </div>

                    <div className="relative">
                        <div className="hidden md:block absolute top-[11px] left-0 right-0 h-[5px] bg-ink/10 rounded-full" />
                        <motion.div className="hidden md:block absolute top-[11px] left-0 h-[5px] bg-primary rounded-full"
                            initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 1.6, ease: EASE }} />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
                            {JOURNEY.map((s, i) => (
                                <motion.div key={s.stop} className="relative pl-10 md:pl-0"
                                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }}
                                    transition={{ delay: 0.25 + i * 0.3, duration: 0.5 }}>
                                    <span className="absolute md:static left-0 top-0 block w-[27px] h-[27px] rounded-full bg-surface border-[5px] border-primary" />
                                    <span className="label-mono block md:mt-6">Stop 0{i + 1}</span>
                                    <h3 className="font-display font-extrabold uppercase text-3xl mt-1">{s.stop}</h3>
                                    <p className="text-slate-600 mt-3 leading-relaxed max-w-xs">{s.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Departures board */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 pb-24">
                <div className="bg-ink text-paper rounded-xl overflow-hidden">
                    <div className="flex justify-between items-end px-6 md:px-8 pt-8 pb-6">
                        <h2 className="font-display font-extrabold uppercase text-4xl md:text-5xl">Departures</h2>
                        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-metro-yellow">Tools for the journey</span>
                    </div>
                    <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-2 border-y border-paper/15 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/45">
                        <span className="col-span-1">Line</span><span className="col-span-3">Destination</span><span className="col-span-6">What it does</span><span className="col-span-2 text-right">Status</span>
                    </div>
                    {DEPARTURES.map((d) => (
                        <Link key={d.to} to={d.to} className="group grid grid-cols-12 gap-4 items-center px-6 md:px-8 py-4 border-b border-paper/10 last:border-0 hover:bg-paper/[0.06] transition-colors">
                            <span className="col-span-2 md:col-span-1">
                                <span className="w-7 h-7 rounded-full inline-flex items-center justify-center font-mono text-[10px] font-semibold text-white" style={{ background: d.color }}>{d.line}</span>
                            </span>
                            <span className="col-span-10 md:col-span-3 font-mono text-[15px] text-metro-yellow uppercase tracking-wide">
                                <span className="roll"><span data-text={d.name}>{d.name}</span></span>
                            </span>
                            <span className="col-span-12 md:col-span-6 text-sm text-paper/70 -mt-2 md:mt-0">{d.what}</span>
                            <span className="hidden md:flex col-span-2 justify-end items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-paper/60 group-hover:text-paper">
                                Boarding <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Ticket CTA */}
            <section className="max-w-4xl mx-auto px-5 md:px-10 pb-28">
                <motion.div initial={{ opacity: 0, rotate: -1.5, y: 20 }} whileInView={{ opacity: 1, rotate: 0, y: 0 }} viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="relative flex bg-surface border border-ink rounded-lg">
                    {/* punched notches */}
                    <span className="absolute -top-[11px] right-[132px] w-5 h-5 rounded-full bg-paper border border-ink [clip-path:inset(50%_0_0_0)] hidden sm:block" />
                    <span className="absolute -bottom-[11px] right-[132px] w-5 h-5 rounded-full bg-paper border border-ink [clip-path:inset(0_0_50%_0)] hidden sm:block" />

                    <div className="flex-1 p-8 md:p-10">
                        <span className="label-mono">Single journey · Valid on all lines</span>
                        <h2 className="font-display font-black uppercase text-5xl md:text-6xl mt-3 leading-[0.9]">Board for free.</h2>
                        <p className="text-slate-600 mt-4 max-w-sm">One account for applying, tracking, and talking to employers. Employers post roles on the same pass.</p>
                        <div className="flex flex-wrap gap-3 mt-8">
                            <Link to="/register" className="btn-primary">Create account</Link>
                            <Link to="/jobs" className="btn-outline">Browse jobs</Link>
                        </div>
                    </div>
                    <div className="hidden sm:flex w-[142px] border-l border-dashed border-ink/40 flex-col items-center justify-between py-8">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] [writing-mode:vertical-rl] rotate-180 text-slate-500">Admit one · HirePur Central</span>
                        <span className="w-14 h-16 bg-[repeating-linear-gradient(90deg,#121212_0_2px,transparent_2px_4px,#121212_4px_5px,transparent_5px_8px)]" aria-hidden="true" />
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
