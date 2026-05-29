import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Briefcase, LogOut, User, Menu, Bell, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-5 px-6 md:px-12 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-slate-900 group">
        <div className="bg-primary p-1.5 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <Briefcase className="w-6 h-6 text-white" />
        </div>
        HirePur
      </Link>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-10 font-bold">
        {isAuthenticated && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
        {isAuthenticated && <Link to="/chat" className="nav-link">Messages</Link>}
        <Link to="/jobs" className="nav-link">Browse Jobs</Link>
        <Link to="/about" className="nav-link">About</Link>
        
        {isAuthenticated ? (
           <div className="flex items-center gap-6">
                
                {/* 1. Live Notification Bell & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                        <Bell className="w-5 h-5"/>
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 15 }}
                                className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl z-50 max-h-[400px] overflow-y-auto"
                            >
                                <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                                        Alerts <Sparkles className="w-3.5 h-3.5 text-primary"/>
                                    </h4>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={markAllAsRead}
                                            className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {notifications.length === 0 ? (
                                        <div className="py-8 text-center text-slate-400">
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">No alerts yet</p>
                                        </div>
                                    ) : (
                                        notifications.slice(0, 5).map(notif => (
                                            <div 
                                                key={notif.id}
                                                onClick={() => {
                                                    markAsRead(notif.id);
                                                    setShowNotifications(false);
                                                }}
                                                className={`p-3 rounded-2xl text-[11px] font-semibold cursor-pointer border transition-all text-left ${
                                                    notif.is_read 
                                                        ? 'bg-slate-50/50 border-transparent text-slate-500' 
                                                        : 'bg-primary/5 border-primary/10 text-slate-800'
                                                }`}
                                            >
                                                <p className="leading-relaxed">{notif.message}</p>
                                                <span className="text-[8px] text-slate-400 font-bold block mt-1.5 uppercase">
                                                    {new Date(notif.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Profiling Navigation */}
                <Link to="/profile" className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 hover:bg-white hover:border-primary/20 transition-all group">
                   <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                       {user?.profile_pic ? (
                           <img src={user.profile_pic} alt="" className="w-full h-full object-cover" />
                       ) : (
                           <User className="w-4 h-4"/>
                       )}
                   </div>
                   <div className="flex flex-col text-left">
                       <span className="text-sm font-black text-slate-900 leading-none">{user?.name}</span>
                       <span className="text-[10px] font-bold text-slate-400 mt-1">View Profile</span>
                   </div>
                </Link>
                
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-2">
                   <LogOut className="w-5 h-5" />
                </button>
           </div>
        ) : (
          <div className="flex items-center gap-6">
             <Link to="/login" className="text-slate-600 hover:text-primary transition-colors">Login</Link>
             <Link to="/register" className="btn-primary !px-6 !py-2.5 !text-sm">Sign Up</Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button className="md:hidden p-2 bg-slate-50 rounded-xl" onClick={() => setIsOpen(!isOpen)}>
        <Menu className="w-6 h-6 text-slate-600" />
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 flex flex-col gap-6 md:hidden border border-slate-100 z-50"
           >
              <Link to="/jobs" className="text-xl font-bold" onClick={() => setIsOpen(false)}>Browse Jobs</Link>
              <Link to="/about" className="text-xl font-bold" onClick={() => setIsOpen(false)}>About</Link>
              <hr className="border-slate-100" />
              {isAuthenticated ? (
                 <>
                   <Link to="/profile" className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100" onClick={() => setIsOpen(false)}>
                       <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden">
                           {user?.profile_pic ? (
                               <img src={user.profile_pic} alt="" className="w-full h-full object-cover" />
                           ) : (
                               user?.name?.[0]
                           )}
                       </div>
                       <div className="flex flex-col text-left">
                           <span className="text-sm font-black text-slate-900 leading-none">{user?.name}</span>
                           <span className="text-[10px] font-bold text-primary mt-1">View Profile</span>
                       </div>
                   </Link>
                   <Link to="/dashboard" className="text-xl font-bold flex items-center gap-3 mt-2" onClick={() => setIsOpen(false)}>
                       Dashboard
                   </Link>
                   <Link to="/chat" className="text-xl font-bold flex items-center gap-3 mt-2" onClick={() => setIsOpen(false)}>
                       Messages
                   </Link>
                   <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-left text-red-500 text-xl font-bold">Logout</button>
                 </>
              ) : (
                  <div className="grid grid-cols-2 gap-4">
                   <Link to="/login" className="btn-outline !text-sm flex justify-center" onClick={() => setIsOpen(false)}>Login</Link>
                   <Link to="/register" className="btn-primary !text-sm flex justify-center" onClick={() => setIsOpen(false)}>Sign Up</Link>
                  </div>
              )}
           </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
