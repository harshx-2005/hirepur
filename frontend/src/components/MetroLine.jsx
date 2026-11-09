import { motion } from 'framer-motion';

export const STOPS = [
    { key: 'applied', label: 'Applied' },
    { key: 'under_review', label: 'In review' },
    { key: 'interview', label: 'Interview' },
    { key: 'accepted', label: 'Offer' },
];

// An application drawn as a metro line: stops passed are filled, the current stop
// is ringed, and a rejection ends the line early at a red terminus.
const MetroLine = ({ status = 'applied', color = '#0a5bd3', compact = false }) => {
    const rejected = status === 'rejected';
    // shortcut: we don't store which stop a rejection happened at, so it is drawn after "In review".
    const reached = rejected ? 1 : Math.max(0, STOPS.findIndex(s => s.key === status));
    const lineColor = rejected ? '#e0322b' : color;
    const pct = (reached / (STOPS.length - 1)) * 100;

    return (
        <div className={compact ? 'w-full min-w-[220px]' : 'w-full'} role="img"
            aria-label={rejected ? 'Application closed' : `Application stage: ${STOPS[reached].label}`}>
            <div className="relative h-4 mx-[7px]">
                <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-[3px] bg-ink/10 rounded-full" />
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 left-0 h-[3px] rounded-full"
                    style={{ background: lineColor }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
                />
                {STOPS.map((s, i) => {
                    const passed = i < reached;
                    const current = i === reached;
                    const dead = rejected && i > reached;
                    return (
                        <span key={s.key}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-[3px] bg-surface transition-colors"
                            style={{
                                left: `${(i / (STOPS.length - 1)) * 100}%`,
                                width: current ? 16 : 12, height: current ? 16 : 12,
                                borderColor: dead ? 'rgba(18,18,18,.15)' : (passed || current) ? lineColor : 'rgba(18,18,18,.25)',
                                background: passed ? lineColor : undefined,
                            }} />
                    );
                })}
            </div>
            {!compact && (
                <div className="flex justify-between mt-2">
                    {STOPS.map((s, i) => (
                        <span key={s.key} className={`label-mono !text-[10px] ${i === reached ? '!text-ink' : ''} ${rejected && i === reached + 1 ? '!text-metro-red' : ''} ${rejected && i > reached + 1 ? 'line-through opacity-50' : ''}`}>
                            {rejected && i === reached + 1 ? 'Closed' : s.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MetroLine;
