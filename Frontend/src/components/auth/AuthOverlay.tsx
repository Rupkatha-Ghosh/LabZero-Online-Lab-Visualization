
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/types';
import { User, LogOut, GraduationCap, School, X, ArrowRight, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthOverlayProps {
  onClose: () => void;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onClose }) => {
  const { user, login, signup, googleLogin, logout, error: authError, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
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
        setSuccess("Success! Identity verified.");
      } else {
        if (!firstName || !lastName || !username || !email || !password) return;
        if (!role) {
          setError('Please select an account type');
          setIsSubmitting(false);
          return;
        }
        await signup(firstName, lastName, username, email, password, role);
        setSuccess("Welcome! Account created.");
      }
    } catch (err: any) {
      // Error is handled by context, but we can set local error if needed for legacy compatibility
      if (!authError) setError(err.response?.data?.detail || "Auth failed. Check credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md sm:w-[95%] bg-slate-950 border border-white/10 rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="p-6 sm:p-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-tight">Identity Terminal</h2>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {(error || authError) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono uppercase tracking-widest text-center"
            >
              {error || authError}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-widest text-center"
            >
              {success}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!user ? (
              <motion.div
                key="auth-forms"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                  <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl w-full mb-6 border border-white/5">
                    <button
                      type="button"
                      onClick={() => toggleMode(true)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${isLogin ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleMode(false)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${!isLogin ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      Sign Up
                    </button>
                  </div>

                {/* Google OAuth Button — at the top */}
                <button
                  type="button"
                  onClick={() => googleLogin(isLogin ? 'login' : (role || undefined))}
                  disabled={!isLogin && !role}
                  className={`w-full h-14 rounded-2xl bg-white transition-all flex items-center justify-center gap-3 shadow-md border border-white/20 ${!isLogin && !role ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'}`}
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
                {!isLogin && !role && (
                  <p className="text-[9px] font-mono text-rose-400/80 uppercase tracking-widest text-center">↓ Select an access level below to continue</p>
                )}
                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="FIRST NAME"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-xs font-mono"
                          required
                        />
                        <input
                          type="text"
                          placeholder="LAST NAME"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-xs font-mono"
                          required
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="USERNAME"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-xs font-mono"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-2">
                      {isLogin ? "Email or Username" : "Email"}
                    </label>
                    <input
                      type={isLogin ? "text" : "email"}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isLogin ? "Enter email or username..." : "Enter your email..."}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-light"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-2">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary/50 transition-all font-light"
                    />
                  </div>

                  {!isLogin && (
                    <div className="space-y-4 pt-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-2">Select Access Level</label>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { id: 'student', label: 'Student', desc: 'Interact w/ simulations & tutor', icon: GraduationCap },
                          { id: 'teacher', label: 'Teacher', desc: 'Access classroom & resources', icon: School },
                          { id: 'institute', label: 'Institute', desc: 'System analytics & fleet mgmt', icon: Building2 },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id as UserRole)}
                            className={`p-4 sm:p-5 rounded-3xl border transition-all text-left flex items-center gap-4 ${role === r.id
                                ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                              }`}
                          >
                            <div className={`p-3 rounded-xl ${role === r.id ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'}`}>
                              <r.icon size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-bold uppercase tracking-tight">{r.label}</div>
                              <div className="text-[10px] opacity-60 font-mono tracking-widest leading-none mt-1">{r.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || (!isLogin && !role)}
                    className="w-full h-16 rounded-2xl bg-primary text-white font-mono uppercase tracking-[.2em] hover:bg-primary/80 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <>
                        {isLogin ? 'Login' : 'Create Account'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-inner relative">
                    <User size={48} />
                    <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-primary text-[8px] font-mono text-white tracking-widest uppercase border-4 border-slate-950">
                      Active Session
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">
                    {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-6">{user.role}</p>

                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Username</span>
                      <span className="text-[10px] font-mono text-white opacity-80 uppercase tracking-widest">{user.username}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Email</span>
                      <span className="text-[10px] font-mono text-white opacity-80">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">System ID</span>
                      <span className="text-[10px] font-mono text-white opacity-80 uppercase">{user.id}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-mono uppercase tracking-[.2em] flex items-center justify-center gap-3"
                >
                  <LogOut size={18} />
                  Terminate Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthOverlay;
