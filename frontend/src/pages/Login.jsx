import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { Briefcase, Loader2, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const response = await apiClient.post('/auth/login', data);
      
      if (response.data.success) {
        // Save access & refresh tokens
        loginUser(response.data.user, response.data.token, response.data.refreshToken);
        navigate('/dashboard');
      }
    } catch (error) {
       if (error.response?.data?.requiresVerification) {
           // Redirect to OTP verification page if account is not activated yet
           navigate(`/verify-otp?email=${encodeURIComponent(error.response.data.email)}&type=registration`);
           return;
       }
       setServerError(error.response?.data?.message || 'The credentials you entered do not match our records.');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-16 items-center">
        
        {/* Left Side Info */}
        <div className="hidden md:block flex-1 space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
            >
                <div className="bg-primary p-3 rounded-2xl w-fit mb-8 shadow-xl shadow-primary/20">
                    <Briefcase className="w-8 h-8 text-white"/>
                </div>
                <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none mb-6">Welcome Back <br/> to <span className="gradient-text">HirePur.</span></h1>
                <p className="text-xl text-slate-400 font-medium max-w-sm mb-12">Login to manage your applications and discover AI-powered career growth.</p>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary"><ShieldCheck className="w-5 h-5"/></div>
                        <p className="font-bold text-slate-700">Bank-grade security protocols</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-secondary"><Loader2 className="w-5 h-5"/></div>
                        <p className="font-bold text-slate-700">99.9% Uptime availability</p>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Right Side Form */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
        >
            <div className="glass-card !p-12 shadow-2xl shadow-slate-200/50">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Access your professional dashboard</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {serverError && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> {serverError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors"/>
                            <input
                                {...register('email')}
                                type="email"
                                className="input-field !pl-16 shadow-sm"
                                placeholder="name@company.com"
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-500 font-bold ml-2">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                         <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Password</label>
                            <Link to="/forgot-password" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</Link>
                         </div>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors"/>
                            <input
                                {...register('password')}
                                type="password"
                                className="input-field !pl-16 shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && <p className="mt-1 text-xs text-red-500 font-bold ml-2">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary !py-5 text-lg group mt-10"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
                            <>
                                Authenticate Securely <ArrowRight className="w-5 h-5 group-hover:ml-3 transition-all"/>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-10 border-t border-slate-50 text-center">
                    <p className="text-slate-400 font-bold text-xs">
                        Don't have an account? <Link to="/register" className="text-primary hover:underline ml-1">Create free profile</Link>
                    </p>
                </div>
            </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;
