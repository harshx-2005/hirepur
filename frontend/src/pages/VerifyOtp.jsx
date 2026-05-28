import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import { Briefcase, Loader2, KeyRound, ArrowRight } from 'lucide-react';

const VerifyOtp = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginUser } = useAuthStore();

    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || 'registration';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendTimer, setResendTimer] = useState(60); // 60s throttle limit
    const [expiryTimer, setExpiryTimer] = useState(300); // 5m expiry timer
    const inputRefs = useRef([]);

    // 1. Focus shift helper
    const handleChange = (element, index) => {
        const val = element.value.replace(/[^0-9]/g, '');
        if (!val) return;

        const newOtp = [...otp];
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);

        // Shift focus to next input
        if (index < 5 && element.value !== '') {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);

            // Shift focus to previous input
            if (index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    // 2. Format timer digits
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // 3. Timers updates
    useEffect(() => {
        const interval = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
            setExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // 4. Submit verification code
    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        const otpCode = otp.join('');
        
        if (otpCode.length < 6) {
            setError('Please enter the full 6-digit verification code.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const res = await apiClient.post('/auth/verify-otp', {
                email,
                otp: otpCode,
                type
            });

            if (res.data.success) {
                setSuccess('Email verified successfully!');
                
                // If it was registration, log in directly and redirect to dashboard
                if (type === 'registration') {
                    setTimeout(() => {
                        loginUser(res.data.user, res.data.token, res.data.refreshToken);
                        navigate('/dashboard');
                    }, 1500);
                } 
                // If forgot password, redirect to ResetPassword page with validated token
                else if (type === 'forgot_password') {
                    setTimeout(() => {
                        navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpCode)}`);
                    }, 1000);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please double check your code.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. Trigger Resend OTP
    const handleResend = async () => {
        if (resendTimer > 0) return;

        setError('');
        setSuccess('');
        try {
            await apiClient.post('/auth/resend-otp', { email, type });
            setSuccess('A fresh verification code has been dispatched!');
            setResendTimer(60); // Reset timer
            setExpiryTimer(300); // Reset expiry timer
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification code.');
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
                        <KeyRound className="w-8 h-8 text-primary"/>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Security Check</h2>
                    <p className="text-slate-400 font-bold text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                        We sent a 6-digit authentication code to <br/>
                        <span className="text-slate-800 font-extrabold">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider leading-relaxed text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider leading-relaxed text-center">
                            {success}
                        </div>
                    )}

                    {/* Split 6 digits input fields */}
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (inputRefs.current[idx] = el)}
                                type="text"
                                maxLength="1"
                                className="w-12 h-14 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-center text-xl font-black text-slate-900 border-2 border-slate-100 focus:border-primary focus:outline-none rounded-2xl shadow-sm transition-all focus:scale-105"
                                value={digit}
                                onChange={(e) => handleChange(e.target, idx)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
                        <p>Code expires in: <span className="text-red-500 font-black">{formatTime(expiryTimer)}</span></p>
                        {expiryTimer === 0 && <p className="text-red-500 font-black">Code Expired!</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || expiryTimer === 0}
                        className="w-full btn-primary !py-5 text-lg group mt-8"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
                            <>
                                Verify Identity <ArrowRight className="w-5 h-5 group-hover:ml-3 transition-all"/>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-50 pt-8">
                    <p className="text-xs text-slate-400 font-bold">
                        Didn't receive verification code? <br/>
                        <button
                            onClick={handleResend}
                            disabled={resendTimer > 0}
                            className={`mt-2 text-xs font-black uppercase tracking-widest ${resendTimer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-primary hover:underline'}`}
                        >
                            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend Verification Code'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOtp;
