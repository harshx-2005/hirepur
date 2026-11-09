import { Link } from 'react-router-dom';

// The mark: an "H" whose crossbar is a Blue-line interchange station.
export const LogoMark = ({ className = 'w-8 h-8', paper = '#f4f2ec' }) => (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="#121212" />
        <path d="M10 7v18M22 7v18" stroke={paper} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M10 16h12" stroke="#0a5bd3" strokeWidth="3.2" />
        <circle cx="16" cy="16" r="3.4" fill={paper} stroke="#0a5bd3" strokeWidth="2" />
    </svg>
);

const Logo = ({ inverted = false, onClick }) => (
    <Link to="/" onClick={onClick} className="flex items-center gap-2.5 group" aria-label="HirePur home">
        <LogoMark className="w-8 h-8 transition-transform duration-500 group-hover:-rotate-90" />
        <span className={`font-display text-[26px] font-extrabold uppercase tracking-wide leading-none pt-0.5 ${inverted ? 'text-paper' : 'text-ink'}`}>
            HirePur
        </span>
    </Link>
);

export default Logo;
