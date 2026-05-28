import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Briefcase, Loader2, ArrowRight, User, Mail, Lock, Building2 } from 'lucide-react';

// Strict Password Validation Policy
const passwordValidation = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[0-9]/, 'Password must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordValidation,
  role: z.enum(['job_seeker', 'employer']),
  company_name: z.string().optional(),
  company_website: z.string().optional(),
  company_size: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  company_description: z.string().optional(),
}).refine((data) => {
  if (data.role === 'employer' && !data.company_name) return false;
  return true;
}, {
  message: "Company name is required for employers",
  path: ["company_name"],
});

const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'job_seeker' }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const response = await apiClient.post('/auth/register', data);
      
      if (response.data.success) {
        // Gated: Redirect to OTP verification screen after successful registration
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&type=registration`);
      }
    } catch (error) {
       setServerError(error.response?.data?.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="min-h-[90vh] py-20 px-6 bg-slate-50/50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="glass-card !p-0 shadow-[0_32px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row border-none">
            
            {/* Sidebar Branding */}
            <div className="w-full md:w-[40%] bg-slate-900 p-12 text-white relative flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20 rotate-12 translate-x-12 translate-y-12 overflow-hidden pointer-events-none">
                    <Briefcase className="w-[300px] h-[300px] text-primary"/>
                </div>
                
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 text-2xl font-black mb-16">
                        <div className="bg-primary p-1.5 rounded-xl"><Briefcase className="w-6 h-6"/></div>
                        HirePur
                    </Link>
                    <h2 className="text-4xl font-black tracking-tighter leading-[0.9] mb-6 underline decoration-primary decoration-8 underline-offset-8">Join the Future <br/> of Work.</h2>
                    <p className="text-slate-400 font-bold text-sm">Create your intelligent profile and start matching with top companies instantly.</p>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs font-medium leading-relaxed italic">
                        "The fastest registration experience in the industry. Highly recommend."
                    </div>
                </div>
            </div>

            {/* Registration Form */}
            <div className="flex-1 p-12 bg-white">
                <div className="mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Profile</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Start your journey today</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {serverError && (
                        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-relaxed">
                            {serverError}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <label className={`cursor-pointer border-2 p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${selectedRole === 'job_seeker' ? 'border-primary bg-primary/5' : 'border-slate-50 hover:border-slate-200'}`}>
                            <input {...register('role')} type="radio" value="job_seeker" className="hidden" />
                            <User className={`w-5 h-5 ${selectedRole === 'job_seeker' ? 'text-primary' : 'text-slate-300'}`}/>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${selectedRole === 'job_seeker' ? 'text-primary' : 'text-slate-400'}`}>Job Seeker</span>
                        </label>
                        <label className={`cursor-pointer border-2 p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${selectedRole === 'employer' ? 'border-secondary bg-secondary/5' : 'border-slate-50 hover:border-slate-200'}`}>
                            <input {...register('role')} type="radio" value="employer" className="hidden" />
                            <Building2 className={`w-5 h-5 ${selectedRole === 'employer' ? 'text-secondary' : 'text-slate-300'}`}/>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${selectedRole === 'employer' ? 'text-secondary' : 'text-slate-400'}`}>Employer</span>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Full Name</label>
                            <input {...register('name')} className="input-field !py-3 shadow-sm border-slate-100" placeholder="Johnathan Doe" />
                            {errors.name && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.name.message}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Email</label>
                            <input {...register('email')} className="input-field !py-3 shadow-sm border-slate-100" placeholder="john@company.com" />
                            {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.email.message}</p>}
                        </div>

                        {selectedRole === 'employer' && (
                             <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Company Name</label>
                                    <input {...register('company_name')} className="input-field !py-3 shadow-sm border-slate-100" placeholder="Acme Inc." />
                                    {errors.company_name && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.company_name.message}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Company Website</label>
                                        <input {...register('company_website')} className="input-field !py-3 shadow-sm border-slate-100" placeholder="https://acme.com" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Company Size</label>
                                        <select {...register('company_size')} className="input-field !py-3 shadow-sm border-slate-100 bg-white">
                                            <option value="">Select Size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-500">201-500 employees</option>
                                            <option value="501-1000">501-1000 employees</option>
                                            <option value="1000+">1000+ employees</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Industry</label>
                                        <input {...register('industry')} className="input-field !py-3 shadow-sm border-slate-100" placeholder="e.g. Technology" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Location</label>
                                        <input {...register('location')} className="input-field !py-3 shadow-sm border-slate-100" placeholder="e.g. San Francisco, CA" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Company Description</label>
                                    <textarea {...register('company_description')} rows="3" className="input-field !py-3 shadow-sm border-slate-100" placeholder="Tell us about your company..." />
                                </div>
                             </motion.div>
                        )}

                        <div className="flex flex-col gap-1 mb-8">
                            <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase ml-2">Password</label>
                            <input {...register('password')} type="password" className="input-field !py-3 shadow-sm border-slate-100" placeholder="••••••••" />
                            {errors.password && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.password.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary !py-5 text-lg group mt-6"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
                            <>
                                Create Account <ArrowRight className="w-5 h-5 group-hover:ml-3 transition-all"/>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Already registered? <Link to="/login" className="text-primary hover:underline ml-1">Log in here</Link>
                    </p>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
