import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
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
    const reduce = useReducedMotion();
    const dim = (id) => (focus && focus !== id ? 0.15 : 1);

    return (
        <div>
            <svg viewBox="0 0 640 520" className="w-full h-auto select-none" role="img" aria-label="HirePur network map: four job categories as metro lines">
                {LINES.map((l, i) => (
                    <motion.path key={l.id} id={`line-${l.id}`} d={l.d} fill="none" stroke={l.color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1, opacity: dim(l.id) }}
                        transition={{ pathLength: { duration: 1.4, delay: 0.3 + i * 0.18, ease: EASE }, opacity: { duration: 0.25 } }} />
                ))}

                {/* trains shuttle end to end once the lines are drawn, slowing into each terminus */}
                {!reduce && LINES.map((l, i) => {
                    const begin = `${2.2 + i * 0.5}s`;
                    return (
                        <g key={`train-${l.id}`} style={{ opacity: dim(l.id), transition: 'opacity .25s' }}>
                            <g opacity="0">
                                <rect x="-12" y="-5.5" width="24" height="11" rx="5.5" fill="#121212" />
                                <rect x="-6" y="-1.5" width="12" height="3" rx="1.5" fill={l.color} />
                                <set attributeName="opacity" to="1" begin={begin} fill="freeze" />
                                <animateMotion dur={`${12 + i * 2.5}s`} begin={begin} repeatCount="indefinite" rotate="auto"
                                    keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.6 0 0.4 1;0.6 0 0.4 1">
                                    <mpath href={`#line-${l.id}`} />
                                </animateMotion>
                            </g>
                        </g>
                    );
                })}

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
                        <span className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-semibold" style={{ background: l.color, color: l.id === 'L4' ? '#121212' : '#fff' }}>{l.id}</span>
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

const pad = (n) => String(n).padStart(2, '0');

// Station clock for the top strip; the colon blinks each second.
const StationClock = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return (
        <span className="label-mono tabular-nums">
            {now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {pad(now.getHours())}
            <span className={now.getSeconds() % 2 ? 'opacity-25' : ''}>:</span>{pad(now.getMinutes())}
        </span>
    );
};

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Split-flap board: letters cycle through random glyphs and settle left to right.
const FlapText = ({ text, delay = 0 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.8 });
    const reduce = useReducedMotion();
    const [shown, setShown] = useState(() => (reduce ? text : text.replace(/\S/g, ' ')));

    useEffect(() => {
        if (!inView || reduce) { setShown(text); return; }
        let frame = 0;
        let id;
        const start = setTimeout(() => {
            id = setInterval(() => {
                frame++;
                setShown(text.split('').map((ch, i) =>
                    ch === ' ' || frame > 4 + i * 1.6 ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                ).join(''));
                if (frame > 4 + text.length * 1.6) clearInterval(id);
            }, 45);
        }, delay);
        return () => { clearTimeout(start); clearInterval(id); };
    }, [inView, reduce, text, delay]);

    return (
        <span ref={ref}>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true" className="whitespace-pre">{shown}</span>
        </span>
    );
};

// Live ticker of real postings; renders nothing if the API has no jobs.
const NowBoarding = () => {
    const { data } = useQuery({
        queryKey: ['jobs', { location: '', page: 1 }],
        queryFn: async () => (await apiClient.get('/jobs?location=&page=1')).data,
    });
    const jobs = (data?.data || []).slice(0, 10);
    if (!jobs.length) return null;

    return (
        <div className="bg-ink text-paper flex items-stretch overflow-hidden">
            <span className="shrink-0 bg-metro-yellow text-ink font-mono text-[11px] font-semibold uppercase tracking-[0.1em] px-4 md:px-6 flex items-center">
                Now boarding
            </span>
            <div className="overflow-hidden flex-1">
                <div className="marquee flex w-max" style={{ '--marquee-d': `${jobs.length * 6}s` }}>
                    {[...jobs, ...jobs].map((j, i) => (
                        <Link key={i} to={`/jobs/${j.id}`} aria-hidden={i >= jobs.length || undefined} tabIndex={i >= jobs.length ? -1 : undefined}
                            className="flex items-center gap-3 px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.06em] whitespace-nowrap hover:text-metro-yellow transition-colors">
                            <span className="w-2 h-2 rounded-full" style={{ background: LINES[i % LINES.length].color }} />
                            {j.title}
                            <span className="text-paper/45">{j.company_name}{j.location ? ` · ${j.location}` : ''}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

const JOURNEY = [
    { stop: 'Applied', text: 'Apply in two clicks. The resume on your profile goes with it, so there is nothing to re-upload.' },
    { stop: 'In review', text: 'The employer opens your application. You get a notification and an email when it moves.' },
    { stop: 'Interview', text: 'Talk to the hiring team directly in Messages and agree on a time — no third-party back and forth.' },
    { stop: 'Offer', text: 'An offer, or a clear “not this time”. Either way the line ends with an answer, not silence.' },
];

// Scroll position -> train position. The train dwells at each stop for the first and last
// 15% of every leg and eases between them, so it always comes to rest *at* a station.
const dwell = (p) => {
    const s = Math.min(Math.max(p, 0), 1) * 3;
    const leg = Math.min(Math.floor(s), 2);
    const f = Math.min(Math.max((s - leg - 0.15) / 0.7, 0), 1);
    return (leg + f * f * (3 - 2 * f)) / 3;
};

// Side view of a carriage, facing right; wheels sit on the rail.
const Train = () => (
    <svg width="76" height="28" viewBox="0 0 76 28" aria-hidden="true">
        <path d="M4 3 H54 Q72 3 73 17 V21 H4 Q2 21 2 19 V5 Q2 3 4 3 Z" fill="#121212" />
        <rect x="9" y="8" width="9" height="6" rx="1" fill="#f4f2ec" />
        <rect x="22" y="8" width="9" height="6" rx="1" fill="#f4f2ec" />
        <rect x="35" y="8" width="9" height="6" rx="1" fill="#f4f2ec" />
        <path d="M50 8 H58 Q66 8 68 14 H50 Z" fill="#f4f2ec" opacity=".9" />
        <rect x="2" y="16.5" width="71" height="2" fill="#0a5bd3" />
        <circle cx="70" cy="18.5" r="1.3" fill="#f5b700" />
        {[13, 24, 49, 60].map(cx => <circle key={cx} cx={cx} cy="23.5" r="3.2" fill="#121212" stroke="#f4f2ec" strokeWidth="1.2" />)}
    </svg>
);

// The train rides the rail with the reader's scroll; each stop lights up as the train docks there.
const Journey = () => {
    const ref = useRef(null);
    // the trip spans a long stretch of scroll: from the section entering until it's in the top quarter
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'end 25%'] });
    // dwell first, then spring: the spring turns the stop-and-go curve and wheel steps into one smooth glide
    const progress = useSpring(useTransform(scrollYProgress, dwell), { stiffness: 60, damping: 22, mass: 0.8, restDelta: 0.0005 });
    const [reached, setReached] = useState(-1);
    useMotionValueEvent(progress, 'change', (t) => setReached(t < 0.01 ? -1 : Math.floor(t * 3 + 0.02)));
    // stops sit at the start of each of 4 grid columns (gap-8 = 2rem), so the last one is at 75% + 1.5rem
    const travel = useTransform(progress, (t) => `calc(${t * 75}% + ${t * 1.5}rem)`);

    return (
        <div ref={ref} className="relative md:pt-10">
            {/* rail: runs station 1 -> station 4 only, with terminus caps */}
            <div className="hidden md:block absolute top-[51px] left-[13.5px] w-[calc(75%+1.5rem)] h-[5px] bg-ink/10">
                <span className="absolute -left-[2px] -top-[6px] w-[4px] h-[17px] bg-ink rounded-sm" />
                <span className="absolute -right-[2px] -top-[6px] w-[4px] h-[17px] bg-ink rounded-sm" />
            </div>
            <motion.div className="hidden md:block absolute top-[51px] left-[13.5px] h-[5px] bg-primary" style={{ width: travel }} />
            {/* train: wheels resting on top of the rail, centred over its stop when docked */}
            <motion.div className="hidden md:block absolute top-[25px] left-[13.5px] z-10 pointer-events-none" style={{ x: '-50%', marginLeft: travel }}>
                <Train />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
                {JOURNEY.map((s, i) => {
                    const on = reached >= i;
                    return (
                        <div key={s.stop} className="relative pl-10 md:pl-0">
                            <div className="absolute md:relative left-0 top-0 w-[27px] h-[27px]">
                                {reached === i && (
                                    <motion.span key={`pulse-${i}`} className="absolute inset-0 rounded-full border-2 border-primary"
                                        initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }} />
                                )}
                                <span className="absolute inset-0 rounded-full border-[5px] bg-surface transition-colors duration-300"
                                    style={{ borderColor: on ? '#0a5bd3' : 'rgba(18,18,18,.2)' }} />
                                <span className={`absolute inset-[8px] rounded-full bg-primary transition-transform duration-300 ${reached > i ? 'scale-100' : 'scale-0'}`} />
                            </div>
                            <span className={`label-mono block md:mt-6 transition-colors ${reached === i ? '!text-primary' : ''}`}>
                                {reached === i ? `Stop 0${i + 1} · Train at platform` : `Stop 0${i + 1}`}
                            </span>
                            <h3 className={`font-display font-extrabold uppercase text-3xl mt-1 transition-opacity duration-300 ${on ? '' : 'opacity-35'}`}>{s.stop}</h3>
                            <p className={`text-slate-600 mt-3 leading-relaxed max-w-xs transition-opacity duration-300 ${on ? '' : 'opacity-50'}`}>{s.text}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

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
                    <StationClock />
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

            <NowBoarding />

            {/* Journey */}
            <section>
                <div className="max-w-7xl mx-auto px-5 md:px-10 py-24">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
                        <span className="label-mono md:col-span-3">How a hire travels</span>
                        <h2 className="md:col-span-9 font-display font-extrabold uppercase text-5xl md:text-7xl leading-[0.9]">
                            Four stops. <span className="text-slate-400">You always know which one you're at.</span>
                        </h2>
                    </div>
                    <Journey />
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
                    {DEPARTURES.map((d, i) => (
                        <Link key={d.to} to={d.to} className="group grid grid-cols-12 gap-4 items-center px-6 md:px-8 py-4 border-b border-paper/10 last:border-0 hover:bg-paper/[0.06] transition-colors">
                            <span className="col-span-2 md:col-span-1">
                                <span className="w-7 h-7 rounded-full inline-flex items-center justify-center font-mono text-[10px] font-semibold text-white" style={{ background: d.color }}>{d.line}</span>
                            </span>
                            <span className="col-span-10 md:col-span-3 font-mono text-[15px] text-metro-yellow uppercase tracking-wide">
                                <span className="roll"><span data-text={d.name}><FlapText text={d.name} delay={i * 140} /></span></span>
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

                    {/* rubber stamp lands after the ticket settles */}
                    <motion.div aria-hidden="true"
                        initial={{ opacity: 0, scale: 1.8, rotate: -26 }} whileInView={{ opacity: 0.9, scale: 1, rotate: -12 }} viewport={{ once: true, amount: 0.5 }}
                        transition={{ delay: 0.8, type: 'spring', stiffness: 500, damping: 20 }}
                        className="absolute right-[172px] top-7 hidden md:flex flex-col items-center justify-center w-28 h-28 rounded-full border-[3px] border-metro-red text-metro-red outline outline-1 outline-metro-red outline-offset-[-9px] pointer-events-none mix-blend-multiply">
                        <span className="font-mono text-[9px] tracking-[0.2em] uppercase">HirePur</span>
                        <span className="font-display font-black text-3xl leading-none uppercase">Valid</span>
                        <span className="font-mono text-[9px] tracking-[0.2em] uppercase">All lines</span>
                    </motion.div>

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
