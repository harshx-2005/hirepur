import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { LogOut, User, Menu, Bell, X } from '../icons';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const navClass = ({ isActive }) => `nav-link ${isActive ? '!text-ink after:!w-full' : ''}`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotificationStore();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Sync notifications on authentication change
  useEffect(() => {
      if (isAuthenticated) {
          fetchNotifications();
      }
  }, [isAuthenticated, fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const close = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-paper/95 border-b border-ink/10 h-[68px] px-5 md:px-10 flex items-center justify-between">
      <Logo onClick={close} />

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-9 text-[15px]">
        {isAuthenticated && <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>}
        {isAuthenticated && <NavLink to="/chat" className={navClass}>Messages</NavLink>}
        <NavLink to="/jobs" className={navClass}>Jobs</NavLink>
        <NavLink to="/about" className={navClass}>About</NavLink>

        {isAuthenticated ? (
           <div className="flex items-center gap-4 pl-6 border-l border-ink/10">

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-500 hover:text-ink transition-colors"
                        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                    >
                        <Bell className="w-[22px] h-[22px]"/>
                        {unreadCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 h-4 min-w-[16px] px-1 bg-metro-red text-white rounded-full font-mono text-[9px] font-semibold flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-3 w-80 bg-surface border border-ink/15 rounded-lg z-50 max-h-[400px] overflow-y-auto"
                            >
                                <div className="flex justify-between items-center px-4 py-3 border-b border-ink/10">
                                    <span className="label-mono !text-ink">Announcements</span>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="label-mono !text-primary hover:underline">
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                {notifications.length === 0 ? (
                                    <p className="px-4 py-10 text-center text-sm text-slate-500">Nothing new on your line.</p>
                                ) : (
                                    notifications.slice(0, 5).map(notif => (
                                        <button
                                            key={notif.id}
                                            onClick={() => {
                                                markAsRead(notif.id);
                                                setShowNotifications(false);
                                            }}
                                            className="w-full text-left px-4 py-3 border-b border-ink/5 last:border-0 hover:bg-slate-50 transition-colors flex gap-3"
                                        >
                                            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.is_read ? 'bg-ink/15' : 'bg-primary'}`} />
                                            <span>
                                                <span className={`block text-[13px] leading-snug ${notif.is_read ? 'text-slate-500' : 'text-ink'}`}>{notif.message}</span>
                                                <span className="label-mono !text-[10px] block mt-1">
                                                    {new Date(notif.created_at).toLocaleDateString()}
                                                </span>
                                            </span>
                                        </button>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Link to="/profile" className="flex items-center gap-2.5 group" title="Your profile">
                   <span className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-ink/10 flex items-center justify-center text-slate-600">
                       {user?.profile_pic ? (
                           <img src={user.profile_pic} alt="" className="w-full h-full object-cover" />
                       ) : (
                           <User className="w-4 h-4"/>
                       )}
                   </span>
                   <span className="text-sm font-semibold text-ink group-hover:text-primary transition-colors">{user?.name?.split(' ')[0]}</span>
                </Link>

                <button onClick={handleLogout} className="text-slate-500 hover:text-metro-red transition-colors p-2" aria-label="Log out" title="Log out">
                   <LogOut className="w-5 h-5" />
                </button>
           </div>
        ) : (
          <div className="flex items-center gap-6 pl-6 border-l border-ink/10">
             <NavLink to="/login" className={navClass}>Log in</NavLink>
             <Link to="/register" className="btn-primary !px-5 !py-2.5 !text-sm">
                <span className="roll"><span data-text="Get a pass">Get a pass</span></span>
             </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button className="md:hidden p-2 -mr-2" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close menu' : 'Open menu'}>
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
           <motion.div
             initial={{ opacity: 0, y: -8 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -8 }}
             transition={{ duration: 0.2 }}
             className="absolute top-[68px] inset-x-0 bg-paper border-b border-ink/10 px-5 py-6 flex flex-col gap-1 md:hidden z-50"
           >
              {[
                ...(isAuthenticated ? [['/dashboard', 'Dashboard'], ['/chat', 'Messages'], ['/profile', 'Profile']] : []),
                ['/jobs', 'Jobs'],
                ['/about', 'About'],
              ].map(([to, label]) => (
                <Link key={to} to={to} onClick={close} className="font-display text-3xl font-bold uppercase py-2 border-b border-ink/10">{label}</Link>
              ))}
              {isAuthenticated ? (
                <button onClick={() => { handleLogout(); close(); }} className="text-left label-mono !text-metro-red !text-xs pt-4">Log out</button>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-5">
                  <Link to="/login" className="btn-outline !text-sm" onClick={close}>Log in</Link>
                  <Link to="/register" className="btn-primary !text-sm" onClick={close}>Get a pass</Link>
                </div>
              )}
           </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
