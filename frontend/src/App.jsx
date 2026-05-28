import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase } from 'lucide-react';
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

// New Authentication Workflow Pages
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

const App = () => {
  const { checkAuth, isCheckingAuth, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
      return (
          <div className="min-h-screen bg-white flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                  <div className="bg-primary p-4 rounded-[2rem] shadow-2xl shadow-primary/20 animate-bounce">
                      <Briefcase className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex flex-col items-center">
                      <h1 className="text-3xl font-black tracking-tighter text-slate-900">HirePur</h1>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300 mt-1 ml-1">AI Recruitment</p>
                  </div>
              </motion.div>
          </div>
      );
  }

  return (
    <QueryClientProvider client={queryClient}>
        <Router>
          <div className="flex flex-col min-h-screen bg-background">
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
    </QueryClientProvider>
  );
}

export default App;
