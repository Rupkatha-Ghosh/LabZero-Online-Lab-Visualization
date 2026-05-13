import React from 'react';
import { Subject } from '../../types/types';
import { Beaker, Zap, Calculator, Dna, ArrowRight, Play, Maximize2, Move3d, RotateCcw, Rotate3D } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../../services/translations';
import { Hero3DModel } from '../models/Hero3DModel.tsx';
import { Logo } from '../common/Logo';
import Footer from '../common/Footer';
import { Skeleton } from 'boneyard-js/react';
import { ElectricFieldSimulation, InverseSquareGraph } from '../models/ElectricField';

interface LandingPageProps {
  onSelectSubject: (subject: Subject) => void;
  language: Language;
  theme: 'dark' | 'light';
  user?: any;

onLoginClick?: () => void;
onLogoutClick?: () => void;
onProfileClick?: () => void;
onOpenGlossary?: () => void;
onDashboardClick?: () => void;
onAdminClick?: () => void;
subjects: Subject[];
  selectedClass?: string | null;
  onSelectClass?: (cls: string | null) => void;
  onLaunchSimulation?: (topicId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onSelectSubject,
  user,
  onLoginClick,
  onProfileClick,
  onDashboardClick,
  onAdminClick,
  language,
  theme,
  subjects,
  selectedClass,
  onSelectClass,
  onLaunchSimulation
}) => {
  const t = (key: string) => translations[key]?.[language] || key;

  // Dynamically filter subjects based on active dropdown selection
  const displayedSubjects = selectedClass
    ? subjects.filter(sub => !sub.targetClass || sub.targetClass.includes(selectedClass))
    : subjects;
  return (
    <div className={`relative min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] font-sans selection:bg-[#7DD3FC]/30 overflow-hidden transition-colors duration-500 ${theme === 'light' ? 'light-mode' : ''}`}>

      {/* Minimal background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[var(--color-primary)] opacity-10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--color-secondary)] opacity-10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 h-20 z-50 bg-[var(--bg-deep)]/80 backdrop-blur-lg border-b border-[var(--border-glass)] px-6 md:px-12 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-8">
          {['Home', 'Explore', 'Simulations', 'About', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[15px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <button onClick={onLoginClick} className="hidden md:block px-5 py-2 text-[15px] font-medium text-[var(--text-primary)] border border-[var(--border-glass)] hover:bg-[var(--bg-panel)] rounded-full transition-all bg-white/5 shadow-sm">
                Log in
              </button>
              <button
                onClick={onLoginClick}
                className="px-6 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white rounded-full text-[15px] font-medium transition-all shadow-md shadow-[var(--color-secondary)]/20"
              >
                Get Started
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {(user.is_staff || user.is_superuser) && (
                <button
                  onClick={onAdminClick}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[13px] font-bold uppercase tracking-tight transition-all shadow-md shadow-indigo-500/25 border border-indigo-400/20"
                >
                  Admin Panel
                </button>
              )}
              {user.role && (
                <button onClick={onDashboardClick} className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-full text-[15px] font-medium transition-all shadow-sm hidden md:block">
                  {user.role === 'teacher' ? 'Teacher Dashboard' : user.role === 'student' ? 'My Dashboard' : 'Institute Dashboard'}
                </button>
              )}
              <button onClick={onProfileClick} className="px-4 py-2 border border-[var(--border-glass)] bg-white/5 hover:bg-[var(--bg-panel)] rounded-full text-[15px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                Hello, {user.first_name || user.username}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="pt-32 pb-0 px-6 md:px-12 max-w-[1400px] mx-auto space-y-32">

        {/* HERO SECTION */}
        <Skeleton name="landing-hero" loading={false}>
          <section id="home" className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[75vh] scroll-mt-24">
            <div className="lg:w-[40%] space-y-8 z-10 pt-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD]"
              >
                <span className="text-xs font-semibold text-[#0284c7] tracking-wide">3D Educational Virtual Lab</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
                className="text-[64px] md:text-[72px] lg:text-[84px] font-display font-bold leading-[1.05] tracking-[-0.03em] text-[var(--text-primary)]"
              >
                Visualize.<br />
                Experiment.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Understand.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
                className="text-lg md:text-xl text-[var(--text-muted)] max-w-md leading-relaxed font-normal"
              >
                Interactive 3D labs for Physics, Chemistry, Math & Biology.<br className="hidden md:block" /><br className="hidden md:block" />
                Turn abstract concepts into real understanding.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 pt-2"
              >
                <button className="px-8 py-4 bg-[#14b8a6] hover:bg-[#0f766e] text-white rounded-full text-base font-semibold transition-all shadow-lg shadow-[#14b8a6]/25 flex items-center justify-center gap-2">
                  Start Exploring <ArrowRight size={18} />
                </button>
                <button className="px-8 py-4 bg-white border-2 border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] rounded-full text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-sm">
                  Watch Demo <Play size={18} fill="currentColor" className="text-[#0F172A]" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }}
                className="flex items-center gap-4 pt-6"
              >
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/100?img=5" alt="Student" className="w-10 h-10 rounded-full border-[3px] border-[#F8FAFC] shadow-sm" />
                  <img src="https://i.pravatar.cc/100?img=9" alt="Student" className="w-10 h-10 rounded-full border-[3px] border-[#F8FAFC] shadow-sm" />
                  <img src="https://i.pravatar.cc/100?img=12" alt="Student" className="w-10 h-10 rounded-full border-[3px] border-[#F8FAFC] shadow-sm" />
                  <img src="https://i.pravatar.cc/100?img=47" alt="Student" className="w-10 h-10 rounded-full border-[3px] border-[#F8FAFC] shadow-sm" />
                </div>
                <div className="text-sm text-[#64748B] flex flex-col justify-center">
                  <p>Loved by <strong className="text-[#0F172A]">1000+</strong> students</p>
                  <div className="flex items-center gap-1 text-[#FBBF24] mt-0.5 text-xs">
                    {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)} <span className="text-[#64748B] ml-1 font-medium">4.9/5</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:w-[60%] h-[650px] w-full relative">
              <div className="absolute inset-0 max-w-[800px] mx-auto w-full h-full">
                <Hero3DModel theme={theme} />
              </div>

              {/* Interaction Hint Bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-glass)] px-6 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.1)] flex items-center gap-6 z-20">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)]"><Move3d size={16} strokeWidth={2} /> Drag</div>
                <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)]"><Rotate3D size={16} strokeWidth={2} /> Rotate</div>
                <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)]"><Maximize2 size={16} strokeWidth={2} /> Zoom</div>
                <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)]"><RotateCcw size={16} strokeWidth={2} /> Reset</div>
              </div>

              {/* Floating Subject Buttons Overlay */}
            </div>
          </section>
        </Skeleton>

        {/* Subject Cards Grid */}
        {/* Subject Cards Grid */}
        <Skeleton name="landing-cards" loading={subjects.length === 0}>
          <section className="min-h-[440px]">
            {/* CLASS SELECTION DROPDOWN BAR */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest opacity-60">
                  Curriculum Filter
                </span>
              </div>

              {onSelectClass && (
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedClass || ''}
                    onChange={(e) => onSelectClass(e.target.value || null)}
                    className="w-full appearance-none rounded-xl border border-[var(--border-glass)] bg-[var(--bg-panel)] px-4 py-3 pr-10 text-sm font-medium tracking-wide text-[var(--text-primary)] outline-none transition-all hover:border-sky-500/50 focus:border-sky-500 backdrop-blur-md cursor-pointer shadow-sm"
                  >
                    <option value="" className={theme === 'light' ? 'text-slate-900' : 'text-white'}>All Standards (Combined)</option>
                    <option value="Class 9" className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Class 9</option>
                    <option value="Class 10" className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Class 10</option>
                    <option value="Class 11" className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Class 11</option>
                    <option value="Class 12" className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Class 12</option>
                  </select>
                  {/* Custom absolute dropdown arrow for clean styling */}
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    ▼
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedSubjects.length === 0 ? (
              // Empty placeholders so the section has height for the Boneyard Skeleton to show
              Array.from({ length: Number(localStorage.getItem('labzero_last_subject_count')) || 4 }).map((_, i) => (
                <div key={`ghost-${i}`} className="h-[440px] invisible" />
              ))
            ) : (
              displayedSubjects.map((subject, i) => {
                const subjectMeta = {
                  name: subject.name,
                  desc: subject.description || `Explore interactive 3D visualizations and virtual experiments for ${subject.name}.`,
                  img: subject.image_url || 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=400',
                  theme: subject.theme || 'border-[var(--border-glass)]',
                  iconColor: subject.iconColor || 'text-indigo-500'
                };

                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => onSelectSubject(subject)}
                    className="bg-[var(--bg-panel)] rounded-[32px] p-6 border border-[var(--border-glass)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1 h-[440px]"
                  >
                    <div className={`w-full h-48 rounded-[24px] bg-white/[0.03] mb-6 overflow-hidden border ${subjectMeta.theme} flex items-center justify-center relative group-hover:bg-white/[0.08] transition-all duration-500`}>
                      <img
                        src={subjectMeta.img}
                        alt={subjectMeta.name}
                        className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-500 saturate-100 brightness-[1.1]"
                      />
                      <div className="absolute inset-0 bg-white/5 group-hover:opacity-0 transition-opacity"></div>
                    </div>

                    <div className="flex flex-col flex-1">
                      <h3 className="text-xl font-display font-semibold mb-3 text-[var(--text-primary)]">{subjectMeta.name}</h3>
                      <p className="text-[var(--text-muted)] text-[15px] leading-relaxed mb-8 flex-1">{subjectMeta.desc}</p>
                      <div className={`flex items-center text-sm font-semibold ${subjectMeta.iconColor} p-0 m-0 uppercase tracking-wide gap-2 group-hover:gap-3 transition-all`}>
                        Explore <ArrowRight size={16} strokeWidth={2.5} />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            </div>
          </section>
        </Skeleton>


        {/* Theory to Visual */}
        <Skeleton name="landing-theory" loading={false}>
          <section id="about" className="bg-[#FAFBFD] rounded-[32px] p-8 md:p-12 border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col xl:flex-row items-stretch gap-8 w-full max-w-[1400px] mx-auto overflow-hidden relative scroll-mt-24">

            {/* Left Text */}
            <div className="w-full xl:w-[30%] flex flex-col justify-center min-w-[280px]">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-4 block">ABSTRACT TO VISUAL</span>
              <h2 className="text-4xl md:text-[52px] font-display font-semibold text-[#0F172A] mb-8 leading-[1.1] tracking-tight">
                From Theory<br />
                to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Reality</span>
              </h2>
              <p className="text-[#64748B] text-[15px] leading-relaxed mb-8">
                We bridge the gap between abstract theory and real-world understanding through immersive 3D visualizations.
              </p>
              <button className="text-[#f43f5e] font-medium flex items-center gap-2 hover:gap-3 transition-all text-sm">
                Learn More <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row items-center justify-end gap-6 lg:gap-8 w-full">

              {/* LEFT CARD: Abstract Theory */}
              <div className="w-full lg:w-[320px] bg-white rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#F1F5F9] flex flex-col isolate relative h-[450px]">
                <h3 className="text-[17px] font-semibold text-[#0F172A] mb-1">Abstract Theory</h3>
                <span className="text-[13px] font-medium text-[#f43f5e] mb-8 block">Electric Field</span>

                <div className="flex-1 flex flex-col opacity-95">
                  <div className="flex justify-center items-center gap-4 text-[#0F172A] font-serif text-[1.75rem] leading-none mb-6">
                    <div className="flex flex-col items-center">
                      <span className="relative">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[1rem]">→</span>
                        E
                      </span>
                    </div>
                    <span>=</span>
                    <div className="flex flex-col items-center justify-center">
                      <span className="border-b border-[#0F172A] px-1 pb-1">1</span>
                      <span className="pt-1">4π<span className="italic font-sans">ε</span><sub className="text-[1rem]">0</sub></span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="border-b border-[#0F172A] px-1 pb-1">q</span>
                      <span className="pt-1">r<sup className="text-[1rem]">2</sup></span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="relative">
                        <span className="absolute -top-[1.1rem] left-1/2 -translate-x-1/2 text-[1.2rem]">^</span>
                        r
                      </span>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#64748B] text-center mb-8">Electric field due to a point charge.</p>

                  <div className="w-full flex-1 relative -mt-5">
                    <InverseSquareGraph />
                  </div>
                </div>
              </div>

              {/* CONNECTOR ELEMENT */}
              <div className="w-12 h-12 rounded-full bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#E2E8F0] flex items-center justify-center shrink-0 z-10 -my-4 lg:my-0 lg:-mx-12 rotate-90 lg:rotate-0 transition-transform">
                <ArrowRight strokeWidth={2.5} className="w-5 h-5 text-[#f43f5e]" />
              </div>

              {/* RIGHT CARD: 3D Visualization */}
              <div className="w-full lg:flex-1 bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-[#F1F5F9] h-[450px] relative isolate flex flex-col">
                <div className="flex justify-between items-start mb-2 relative z-20">
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#f43f5e] mb-1">3D Visualization</h3>
                    <span className="text-[13px] text-[#64748B] block">Electric Dipole Field</span>
                  </div>
                  <button className="w-9 h-9 rounded-xl border border-[#E2E8F0] flex items-center justify-center text-[#14B8A6] hover:bg-slate-50 transition-colors">
                    <Maximize2 size={16} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="absolute inset-0 pt-20 px-4 pb-4">
                  <ElectricFieldSimulation />
                </div>
              </div>

            </div>
          </section>
        </Skeleton>

        {/* Live Simulations Row */}
        <Skeleton name="landing-simulations" loading={false}>
          <section id="simulations" className="space-y-8 scroll-mt-24">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Try it yourself</span>
                <h2 className="text-3xl font-display font-bold mt-2 text-[var(--text-primary)]">Try Live Simulations</h2>
              </div>
              <button className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-sm hover:underline">
                View All Simulations <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'electromagnetism', title: 'Electromagnetism', tag: 'Physics', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', hoverBorder: 'hover:border-indigo-500/40', text: 'text-indigo-500', iconUrl: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&q=80&w=400' },
                { id: 'genetics', title: 'Genetic Probability', tag: 'Biology', bg: 'bg-rose-500/10', border: 'border-rose-500/20', hoverBorder: 'hover:border-rose-500/40', text: 'text-rose-500', iconUrl: 'https://images.unsplash.com/photo-1629904853716-f0bc54eea481?auto=format&fit=crop&q=80&w=400' },
                { id: 'linear_algebra', title: 'Linear Transformations', tag: 'Math', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hoverBorder: 'hover:border-emerald-500/40', text: 'text-emerald-500', iconUrl: 'https://images.unsplash.com/photo-1614850715649-1d0106293cb1?auto=format&fit=crop&q=80&w=400' },
              ].map((sim, i) => (
                <div 
                  key={i} 
                  onClick={() => onLaunchSimulation?.(sim.id)}
                  className={`rounded-[32px] p-8 border ${sim.border} ${sim.bg} backdrop-blur-md relative overflow-hidden flex flex-col h-64 cursor-pointer group shadow-sm transition-all duration-300 hover:shadow-lg ${sim.hoverBorder}`}
                >
                  <div className="relative z-10">
                    <h4 className="font-display font-semibold text-lg text-[var(--text-primary)]">{sim.title}</h4>
                    <span className="text-xs font-medium text-[var(--text-muted)] mt-1 block">{sim.tag}</span>
                  </div>
                  <div className="mt-auto relative z-10">
                    <div className={`w-12 h-12 bg-white/10 dark:bg-[var(--bg-deep)]/20 border border-white/20 dark:border-[var(--border-glass)] backdrop-blur-md rounded-full flex items-center justify-center shadow-md ${sim.text} group-hover:scale-110 transition-transform`}>
                      <Play size={16} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                  <div className="absolute right-0 bottom-0 w-48 h-48 rounded-tl-full overflow-hidden opacity-80 flex items-end justify-end group-hover:opacity-100 transition-opacity">
                    <img src={sim.iconUrl} className="w-full h-full object-cover rounded-tl-full brightness-[1.1] saturate-[1.2]" alt="sim graphic" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Skeleton>

        {/* Stats Row */}
        <Skeleton name="landing-stats" loading={false}>
          <section className="bg-[var(--bg-panel)] rounded-[40px] md:rounded-full py-4 px-4 md:px-8 border border-[var(--border-glass)] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-center max-w-5xl mx-auto mb-5">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 flex items-center justify-center text-[var(--color-primary)] shrink-0"><Maximize2 size={20} /></div>
              <div className="text-left">
                <h4 className="font-display font-bold text-2xl text-[var(--text-primary)]">1000+</h4>
                <p className="text-xs text-[var(--text-muted)]">Active Students</p>
              </div>
            </div>

            <div className="w-full h-px md:w-px md:h-12 bg-[var(--border-glass)]"></div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 flex items-center justify-center text-[var(--color-secondary)] shrink-0"><Beaker size={20} /></div>
              <div className="text-left">
                <h4 className="font-display font-bold text-2xl text-[var(--text-primary)]">50+</h4>
                <p className="text-xs text-[var(--text-muted)]">Interactive Simulations</p>
              </div>
            </div>

            <div className="w-full h-px md:w-px md:h-12 bg-[var(--border-glass)]"></div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 flex items-center justify-center text-[var(--color-accent)] shrink-0"><Zap size={20} /></div>
              <div className="text-left">
                <h4 className="font-display font-bold text-2xl text-[var(--text-primary)]">4+</h4>
                <p className="text-xs text-[var(--text-muted)]">Science Domains</p>
              </div>
            </div>

            <div className="w-full h-px md:w-px md:h-12 bg-[var(--border-glass)]"></div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full border border-slate-500/30 bg-slate-500/5 flex items-center justify-center text-slate-400 shrink-0"><Play size={20} /></div>
              <div className="text-left">
                <h4 className="font-display font-bold text-2xl text-[var(--text-primary)]">24/7</h4>
                <p className="text-xs text-[var(--text-muted)]">Access Anywhere</p>
              </div>
            </div>
          </section>
        </Skeleton>

      </main>
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
