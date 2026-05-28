import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowRight, Lock, Mail } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().email('Admin email is required'),
  password: z.string().min(6, 'Password is required'),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const response = await apiClient.post('/auth/login', data);
      
      if (response.data.success) {
        if (response.data.user.role !== 'admin') {
            setServerError('Access Denied: Only administrators can log in here.');
            return;
        }
        loginUser(response.data.user, response.data.token);
        navigate('/admin');
      }
    } catch (error) {
       setServerError(error.response?.data?.message || 'Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <div className="text-center mb-10">
                <div className="bg-primary/20 p-4 rounded-2xl w-fit mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Admin Panel</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Authorised Personnel Only</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {serverError && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3"
                    >
                         <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> {serverError}
                    </motion.div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase ml-2">Secure Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors"/>
                        <input
                            {...register('email')}
                            type="email"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-white placeholder:text-slate-600"
                            placeholder="admin@hirepur.com"
                        />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-400 font-bold ml-2">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase ml-2">Access Key</label>
                    <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors"/>
                        <input
                            {...register('password')}
                            type="password"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-white placeholder:text-slate-600"
                            placeholder="••••••••"
                        />
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-400 font-bold ml-2">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group mt-10 shadow-lg shadow-primary/20"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            Log In to Hub <ArrowRight className="w-5 h-5 group-hover:ml-2 transition-all" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-12 text-center">
                <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">
                    System ID: HP-ADM-882
                </p>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
