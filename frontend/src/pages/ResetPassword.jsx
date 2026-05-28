import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Briefcase, Loader2, ArrowRight, Lock, ShieldAlert } from 'lucide-react';

// Strict Password Validation Rules
const newPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Confirm password is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(newPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setSuccess('');
      const response = await apiClient.post('/auth/reset-password', {
          email,
          otp,
          newPassword: data.newPassword
      });
      
      if (response.data.success) {
        setSuccess('Password updated successfully!');
        setTimeout(() => {
            navigate('/login');
        }, 1500);
      }
    } catch (error) {
       setServerError(error.response?.data?.message || 'Failed to update password. Verification session expired.');
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
                <Lock className="w-8 h-8 text-primary"/>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Password</h2>
            <p className="text-slate-400 font-bold text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                Enter your strong, secure new password below to update your account access credentials.
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
                <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">New Password</label>
                <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors"/>
                    <input
                        {...register('newPassword')}
                        type="password"
                        className="input-field !pl-16 shadow-sm border-slate-100"
                        placeholder="••••••••"
                    />
                </div>
                {errors.newPassword && <p className="mt-1 text-xs text-red-500 font-bold ml-2">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Confirm Password</label>
                <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors"/>
                    <input
                        {...register('confirmPassword')}
                        type="password"
                        className="input-field !pl-16 shadow-sm border-slate-100"
                        placeholder="••••••••"
                    />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-bold ml-2">{errors.confirmPassword.message}</p>}
            </div>

            {/* Checklist of Password strength guidelines for clean visual cues */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[10px] font-bold text-slate-400 space-y-1">
                 <p className="uppercase tracking-widest text-slate-500 mb-2">Password Policy Requirements:</p>
                 <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Minimum of 8 characters</div>
                 <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> At least one uppercase letter (A-Z)</div>
                 <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> At least one lowercase letter (a-z)</div>
                 <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> At least one number (0-9)</div>
                 <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> At least one special character (!@#$%)</div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary !py-5 text-lg group mt-8"
            >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
                    <>
                        Reset Account Password <ArrowRight className="w-5 h-5 group-hover:ml-3 transition-all"/>
                    </>
                )}
            </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-50 pt-8">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Return to <Link to="/login" className="text-primary hover:underline ml-1">Log in here</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
