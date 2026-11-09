import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { LogoMark } from './components/Logo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import InterviewCoach from './pages/InterviewCoach';
import JobMatch from './pages/JobMatch';
import Chat from './pages/Chat';
import ApplicationReview from './pages/ApplicationReview';
import JDGenerator from './pages/JDGenerator';
import Profile from './pages/Profile';
import About from './pages/About';
import PostJob from './pages/PostJob';
import LegalPrivacy from './pages/LegalPrivacy';
import TermsOfService from './pages/TermsOfService';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import { useAuthStore } from './store/useAuthStore';
import { useChatStore } from './store/useChatStore';

// New Authentication Workflow Pages
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

const App = () => {
  const { checkAuth, isCheckingAuth, token, user } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (token) {
      initSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token, initSocket, disconnectSocket]);

  if (isCheckingAuth) {
      return (
          <div className="min-h-screen bg-paper flex items-center justify-center">
              <div className="flex flex-col items-center gap-5 w-48">
                  <LogoMark className="w-12 h-12" />
                  {/* a train crossing the line while auth is checked */}
                  <div className="relative w-full h-[3px] bg-ink/10 rounded-full overflow-hidden">
                      <motion.span className="absolute inset-y-0 w-1/3 bg-primary rounded-full"
                        initial={{ left: '-33%' }} animate={{ left: '100%' }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: [0.7, 0, 0.2, 1] }} />
                  </div>
                  <span className="label-mono">Now arriving</span>
              </div>
          </div>
      );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <Router>
          <div className="flex flex-col min-h-screen bg-paper">
            <Navbar />
            <main className="flex-grow">
                <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/jobs/:id" element={<JobDetails />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      
                      {/* Advanced Auth Routes */}
                      <Route path="/verify-otp" element={<VerifyOtp />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      
                      <Route path="/privacy" element={<LegalPrivacy />} />
                      <Route path="/terms" element={<TermsOfService />} />

                      {/* Common Protected Routes */}
                      <Route element={<ProtectedRoute allowedRoles={['job_seeker', 'employer', 'admin']} />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/profile" element={<Profile />} />
                      </Route>

                      {/* Protected Job Seeker Routes */}
                      <Route element={<ProtectedRoute allowedRoles={['job_seeker']} />}>
                        <Route path="/resume-builder" element={<ResumeBuilder />} />
                        <Route path="/interview-coach" element={<InterviewCoach />} />
                        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                        <Route path="/job-match" element={<JobMatch />} />
                      </Route>

                      {/* Protected Employer Routes */}
                      <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
                        <Route path="/applications/review" element={<ApplicationReview />} />
                        <Route path="/jd-generator" element={<JDGenerator />} />
                        <Route path="/jobs/post" element={<PostJob />} />
                        <Route path="/jobs/edit/:id" element={<PostJob />} />
                      </Route>

                      {/* Protected Admin Routes */}
                      <Route 
                        path="/admin" 
                        element={user?.role === 'admin' ? <AdminDashboard /> : <AdminLogin />} 
                      />
                    </Routes>
                </AnimatePresence>
            </main>
            <Footer />
          </div>
        </Router>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
