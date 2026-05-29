import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, FileText, BarChart3, ShieldCheck, ChevronRight, Activity, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

const StatusBadge = ({ status }) => {
    const styles = {
        active: 'bg-green-50 text-green-500',
        pending: 'bg-orange-50 text-orange-500',
        closed: 'bg-slate-100 text-slate-400',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.closed}`}>
            {status}
        </span>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                if (!searchQuery) setIsLoading(true);
                else setIsSearching(true);

                const [statsRes, usersRes, jobsRes] = await Promise.all([
                    apiClient.get('/admin/stats'),
                    apiClient.get(`/admin/users?search=${searchQuery}`),
                    apiClient.get(`/admin/jobs?search=${searchQuery}`)
                ]);

                if (statsRes.data.success) setStats(statsRes.data.stats);
                if (usersRes.data.success) setUsers(usersRes.data.data);
                if (jobsRes.data.success) setJobs(jobsRes.data.data);
            } catch (error) {
                console.error('Failed to fetch admin data', error);
                setError('Failed to fetch platform data. Please ensure you have administrative privileges.');
            } finally {
                setIsLoading(false);
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => {
            fetchAdminData();
        }, 500); // Debounce search

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
        try {
            const res = await apiClient.delete(`/admin/users/${id}`);
            if (res.data.success) {
                setUsers(users.filter(u => u.id !== id));
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            const res = await apiClient.delete(`/admin/jobs/${id}`);
            if (res.data.success) {
                setJobs(jobs.filter(j => j.id !== id));
            }
        } catch (error) {
            alert('Failed to delete job');
        }
    };

    const handleToggleRole = async (user) => {
        const newRole = user.role === 'job_seeker' ? 'employer' : user.role === 'employer' ? 'admin' : 'job_seeker';
        if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
        
        try {
            const res = await apiClient.put(`/admin/users/${user.id}/role`, { role: newRole });
            if (res.data.success) {
                setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            alert('Failed to update role');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-6 text-white">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="bg-primary/20 p-6 rounded-[2rem] border border-primary/20 shadow-2xl shadow-primary/20"
                >
                    <ShieldCheck className="w-12 h-12 text-primary" />
                </motion.div>
                <div className="text-center space-y-2">
                    <h2 className="text-sm font-black uppercase tracking-[0.25em] text-primary animate-pulse">Initialising High-Level Access...</h2>
                    <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">SECURE HANDSHAKE HP-ADM-SECURE-882...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center max-w-md">
                    <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Access Resticted</h2>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary w-full">Retry Connection</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="bg-primary p-2 rounded-xl">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tighter">Admin Hub</span>
                </div>

                <nav className="flex flex-col gap-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'users', label: 'Manage Users', icon: Users },
                        { id: 'jobs', label: 'Job Postings', icon: Briefcase },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                                activeTab === item.id 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-12">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 capitalize">{activeTab}</h1>
                        <p className="text-slate-400 font-medium text-sm mt-1">System Administration & Overview</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearching ? 'text-primary' : 'text-slate-400'}`} />
                            <input 
                                type="text" 
                                placeholder="Search Users or Jobs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 transition w-64"
                            />
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: 'Total Users', value: stats?.users, icon: Users, color: 'text-blue-500' },
                                { label: 'Job Listings', value: stats?.jobs, icon: Briefcase, color: 'text-green-500' },
                                { label: 'Applications', value: stats?.applications, icon: FileText, color: 'text-orange-500' },
                                { label: 'Employers', value: stats?.employers, icon: Activity, color: 'text-primary' },
                            ].map((s, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-4 rounded-2xl bg-slate-50`}>
                                            <s.icon className={`w-6 h-6 ${s.color}`} />
                                        </div>
                                        <div className="text-2xl font-black text-slate-900">{s.value}</div>
                                    </div>
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">{s.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Users Table */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="font-black text-slate-900">Recent Users</h3>
                                <button 
                                    onClick={() => setActiveTab('users')}
                                    className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                                >
                                    View All <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users.slice(0, 5).map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5 font-bold text-slate-700">{u.name}</td>
                                                <td className="px-8 py-5 text-slate-500 font-medium">{u.email}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        u.role === 'admin' ? 'bg-red-50 text-red-500' : 
                                                        u.role === 'employer' ? 'bg-primary/5 text-primary' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        {u.role.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-slate-400 text-xs font-medium">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Jobs */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="font-black text-slate-900">Recent Job Postings</h3>
                                <button 
                                    onClick={() => setActiveTab('jobs')}
                                    className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                                >
                                    View All <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-8 space-y-4">
                                {jobs.slice(0, 3).map((job) => (
                                    <div key={job.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{job.title}</h4>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{job.company_name}</p>
                                        </div>
                                        <StatusBadge status="active" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5 font-bold text-slate-700">{u.name}</td>
                                            <td className="px-8 py-5 text-slate-500 font-medium">{u.email}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    u.role === 'admin' ? 'bg-red-50 text-red-500' : 
                                                    u.role === 'employer' ? 'bg-primary/5 text-primary' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right font-bold space-x-4">
                                                <button 
                                                    onClick={() => handleToggleRole(u)}
                                                    className="text-primary hover:underline"
                                                >
                                                    Change Role
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="text-red-400 hover:text-red-500 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="grid gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center group hover:border-primary/20 transition-all">
                                <Link to={`/jobs/${job.id}`} className="flex-grow block text-left group-hover:opacity-90">
                                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors hover:underline">{job.title}</h4>
                                    <div className="flex items-center gap-4 mt-2">
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" /> {job.company_name}
                                        </p>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                                            <Activity className="w-3 h-3" /> {job.job_type}
                                        </p>
                                    </div>
                                </Link>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => handleDeleteJob(job.id)}
                                        className="text-red-400 font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
