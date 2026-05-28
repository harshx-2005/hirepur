import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Briefcase, Loader2, ArrowRight, Mail, Key } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setSuccess('');
      const response = await apiClient.post('/auth/forgot-password', data);
      
      if (response.data.success) {
        setSuccess('Recovery email sent successfully!');
        setTimeout(() => {
            // Redirect to verify code screen with forgot_password category
            navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&type=forgot_password`);
        }, 1200);
      }
    } catch (error) {
       setServerError(error.response?.data?.message || 'We could not find an account associated with this email address.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-6 bg-slate-50/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card !p-12 shadow-2xl shadow-slate-200/50"
      >
        <div className="text-center mb-8">
            <div className="bg-primary/10 p-4 rounded-3xl w-fit mx-auto mb-6">
                <Key className="w-8 h-8 text-primary"/>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password</h2>
            <p className="text-slate-400 font-bold text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                Enter your registered email address and we will dispatch a 6-digit recovery OTP code.
            </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider leading-relaxed text-center">
                    {serverError}
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider leading-relaxed text-center">
                    {success}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors"/>
                    <input
                        {...register('email')}
                        type="email"
                        className="input-field !pl-16 shadow-sm border-slate-100"
                        placeholder="name@company.com"
                    />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500 font-bold ml-2">{errors.email.message}</p>}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary !py-5 text-lg group mt-8"
            >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
                    <>
                        Send Recovery Code <ArrowRight className="w-5 h-5 group-hover:ml-3 transition-all"/>
                    </>
                )}
            </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-50 pt-8">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Remember your password? <Link to="/login" className="text-primary hover:underline ml-1">Log in here</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
