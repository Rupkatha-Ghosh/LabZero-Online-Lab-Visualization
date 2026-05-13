
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/types';
import {
  GraduationCap,
  School,
  Building2,
  ArrowRight,
  CheckCircle2,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../common/Logo';

const AuthPage: React.FC = () => {
  const { login, signup, googleLogin, error: authError, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMode = (mode: boolean) => {
    setIsLogin(mode);
    setError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearError();
    setIsSubmitting(true);
    try {
      if (isLogin) {
        if (!email || !password) return;
        await login(email, password);
        setSuccess("Login successful! Entering laboratory...");
      } else {
        if (selectedRole === 'institute') {
          if (!instituteName || !username || !email || !password) return;
          await signup(instituteName, '', username, email, password, 'institute');
        } else {
          if (!firstName || !lastName || !username || !email || !password) return;
          await signup(firstName, lastName, username, email, password, selectedRole);
        }
        setSuccess("Account created successfully!");
      }
    } catch (err: any) {
      if (!authError) setError(err.response?.data?.detail || "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles: { id: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    {
      id: 'student',
      label: 'Student',
      icon: GraduationCap,
      color: 'text-blue-400',
      desc: 'Join simulations, track progress, and learn with AI.'
    },
    {
      id: 'teacher',
      label: 'Teacher',
      icon: School,
      color: 'text-indigo-400',
      desc: 'Manage classrooms, upload resources, and guide students.'
    },
    {
      id: 'institute',
      label: 'Teaching Institute',
      icon: Building2,
      color: 'text-emerald-400',
      desc: 'Oversee multiple classes, analyze data, and manage faculty.'
    },
  ];

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl md:rounded-[48px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-violet-500/10 pointer-events-none" />
        {/* Left Side - Info Art */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-black/20 text-white relative overflow-hidden border-r border-white/10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop')] mix-blend-overlay opacity-50 object-cover w-full h-full" />

          <div className="relative z-10">
            <Logo className="mb-8" />

            <h2 className="text-5xl font-display font-semibold leading-[0.9] uppercase italic mb-8 drop-shadow-md">
              The Future of <br /> Interactive <br /> Learning.
            </h2>

            <div className="space-y-6">
              {[
                "Advanced 3D Scientific Simulations",
                "Real-time AI Tutoring & Analysis",
                "Cross-institutional Collaboration",
                "Mobile-First Offline Access"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80 font-mono text-[10px] uppercase tracking-widest drop-shadow-sm">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-12">
            <div className="p-6 rounded-[32px] bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg">
              <p className="text-sm font-sans italic text-white/90 leading-relaxed mb-4">
                "Our mission is to bring high-quality scientific laboratories to every corner of the globe, regardless of infrastructure."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/10 shadow-inner" />
                <div>
                  <div className="text-xs font-display font-bold uppercase drop-shadow-sm">Sayan Sinha</div>
                  <div className="text-[10px] text-cyan-300/80 uppercase font-mono tracking-widest mt-1">Lead Scientist, LabZero</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="relative p-6 md:p-12 lg:p-16 flex flex-col justify-center z-10">
          <div className="mb-10">
            <div className="flex items-center gap-1 p-1.5 bg-black/50 backdrop-blur-md rounded-2xl w-full sm:w-fit mb-8 border border-white/10 shadow-inner">
              <button
                onClick={() => toggleMode(true)}
                className={`flex-1 sm:px-8 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${isLogin ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg border border-white/20' : 'text-white/40 hover:text-white/80'}`}
              >
                Login
              </button>
              <button
                onClick={() => toggleMode(false)}
                className={`flex-1 sm:px-8 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${!isLogin ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg border border-white/20' : 'text-white/40 hover:text-white/80'}`}
              >
                Sign Up
              </button>
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-medium text-white uppercase tracking-tight mb-2 drop-shadow-md">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-sm text-cyan-300/60 font-sans">
              {isLogin ? 'Enter your credentials to access the laboratory.' : 'Create a new account to begin your journey.'}
            </p>
          </div>

          {/* Google OAuth Button — at the top */}
          <button
            type="button"
            onClick={() => googleLogin(isLogin ? 'login' : (selectedRole || undefined))}
            disabled={!isLogin && !selectedRole}
            className={`w-full h-14 rounded-2xl bg-white transition-all flex items-center justify-center gap-3 shadow-md border border-white/20 group ${!isLogin && !selectedRole ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[12px] font-semibold text-gray-700 tracking-wide">
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </span>
          </button>
          {!isLogin && !selectedRole && (
            <p className="text-[9px] font-mono text-rose-400/80 uppercase tracking-widest text-center mb-2">↓ Select an account type below to continue</p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {(error || authError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-mono uppercase tracking-widest text-center shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            >
              {error || authError}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono uppercase tracking-widest text-center shadow-[0_0_15px_rgba(52,211,153,0.3)]"
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-3 py-4">
              <label className="text-[10px] font-mono text-cyan-300 drop-shadow-sm uppercase tracking-widest pl-2">Select Account Type</label>
              <div className="flex flex-col md:flex-row gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`flex-1 p-4 rounded-2xl border transition-all text-left flex items-center gap-3 ${selectedRole === r.id
                        ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-cyan-400/40 text-white shadow-lg'
                        : 'bg-black/30 border-white/10 text-white/50 hover:bg-black/50 hover:border-white/20'
                      }`}
                  >
                    <r.icon size={20} className={`shrink-0 ${selectedRole === r.id ? 'text-cyan-300 drop-shadow-md' : 'text-white/40'}`} />
                    <div className={`text-[10px] font-display font-bold uppercase tracking-tight ${selectedRole === r.id ? 'text-white' : 'text-white/70'}`}>{r.label}</div>
                  </button>
                ))}
              </div>
              {!isLogin && selectedRole === 'institute' && (
                <div className="space-y-4">
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="INSTITUTE NAME"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-all text-xs font-mono shadow-inner"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="USERNAME"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-all text-xs font-mono shadow-inner"
                      required
                    />
                  </div>
                </div>
              )}

              {!isLogin && selectedRole !== 'institute' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="FIRST NAME"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-all text-xs font-mono shadow-inner"
                        required
                      />
                    </div>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="LAST NAME"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-all text-xs font-mono shadow-inner"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="USERNAME"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-all text-xs font-mono shadow-inner"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="relative group">
                {isLogin ? (
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                ) : (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                )}
                <input
                  type={isLogin ? "text" : "email"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isLogin ? "Email or Username" : "Email Address"}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all font-sans placeholder:text-white/30 shadow-inner"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all font-sans placeholder:text-white/30 shadow-inner"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer group mt-4">
                <div className="w-5 h-5 rounded border border-white/20 bg-black/50 flex items-center justify-center group-hover:border-cyan-400 transition-colors shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>
                <span className="text-[10px] font-mono text-cyan-300/80 uppercase tracking-widest drop-shadow-sm">Remember Me</span>
              </label>
              {isLogin && (
                <button type="button" className="text-[10px] font-mono text-white/50 uppercase tracking-widest hover:text-white transition-colors mt-4">
                  Forgot Password?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!isLogin && !selectedRole)}
              className="w-full h-14 mt-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-mono uppercase tracking-[.2em] hover:from-cyan-400 hover:to-violet-500 transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(34,211,238,0.3)] group disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="drop-shadow-sm">Processing...</span>
                </div>
              ) : (
                <>
                  <span className="drop-shadow-sm">{isLogin ? 'Enter Laboratory' : 'Create Account'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform drop-shadow-sm" />
                </>
              )}
            </button>

            <p className="text-center font-mono text-[9px] text-white/30 uppercase tracking-widest pt-2">
              Authorized Access Only • System v1.4.2
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
