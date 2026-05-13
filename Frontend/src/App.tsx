import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Sparkles, MessageSquare, X, Settings, Eye, Moon, Sun, Languages, BookOpen, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from './components/pages/LandingPage';
import SubjectPage from './components/pages/SubjectPage';
import TopicPage from './components/pages/TopicPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import InstituteDashboard from './components/dashboards/InstituteDashboard';
import GestureController from './components/shared/GestureController';
import BottomNav from './components/common/BottomNav';
import Glossary from './components/shared/Glossary';
import AuthOverlay from './components/auth/AuthOverlay';
import AuthPage from './components/auth/AuthPage';
import FloatingBrain from './components/common/FloatingBrain';
import MemoryMapOverlay from './components/shared/MemoryMapOverlay';

const useAnimatedFavicon = () => {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId: number;
    const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    faviconLink.type = 'image/x-icon';
    faviconLink.rel = 'shortcut icon';

    const draw = (isStatic: boolean = false) => {
      ctx.clearRect(0, 0, 32, 32);

      // 1. Draw Glow (subtle pulse or fixed)
      const glowOpacity = isStatic ? 0.15 : 0.1 + Math.sin(frame * 0.05) * 0.05;
      ctx.strokeStyle = `rgba(99, 102, 241, ${glowOpacity})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(3, 4); ctx.lineTo(29, 4); ctx.lineTo(3, 28); ctx.lineTo(29, 28);
      ctx.stroke();

      // 2. Draw Z
      ctx.strokeStyle = '#ffffff'; 
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(3, 4); ctx.lineTo(29, 4); ctx.lineTo(3, 28); ctx.lineTo(29, 28);
      ctx.stroke();

      if (!isStatic) {
        // 3. Draw Animated "0" Formation
        const drawProgress = (Math.sin(frame * 0.03) + 1) / 2;
        ctx.strokeStyle = '#6366f1'; 
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(16, 16, 9, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * drawProgress));
        ctx.stroke();

        // 4. Draw Precision Nodes (Pulsating)
        const nodePulse = 1 + Math.sin(frame * 0.1) * 0.3;
        
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(3, 4, 2.5 * nodePulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(29, 28, 2.5 * nodePulse, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Static dots for hidden state
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath(); ctx.arc(3, 4, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6366f1';
        ctx.beginPath(); ctx.arc(29, 28, 2.5, 0, Math.PI * 2); ctx.fill();
      }

      faviconLink.href = canvas.toDataURL('image/png');
      if (!document.head.contains(faviconLink)) {
        document.head.appendChild(faviconLink);
      }
    };

    const animate = () => {
      draw(false);
      frame++;
      animId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
        draw(true); // Draw static frame
      } else {
        animate(); // Resume animation
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animate(); // Start initial animation

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};

import QuizPage from './components/shared/Quiz';
import { generateQuizAI } from './data/quizData';
import { Skeleton } from 'boneyard-js/react';

import { Molecule, ElementData, Subject, Topic, ViewState, TopicId } from './types/types';
import { Language, translations } from './services/translations';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getElements } from './services/elementsService';
import { getMolecules } from './services/moleculesService';
import { getSubjects } from './services/subjectsService';
import { SIMULATION_REGISTRY } from './simulations/registry';
import { Suspense } from 'react';
import { usePWAInstall } from './hooks/usePWAInstall';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';


const BackgroundLayer = ({ theme }: { theme: 'dark' | 'light' }) => (
  <div className={`fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-700 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-[#fafaf8]'}`}>
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 100, 0],
        y: [0, 50, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] transition-colors duration-700 ${theme === 'dark' ? 'bg-sky-500/10' : 'bg-sky-300/20'}`}
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        x: [0, -100, 0],
        y: [0, -50, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] transition-colors duration-700 ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-emerald-300/20'}`}
    />
    <motion.div
      animate={{
        scale: [1, 1.5, 1],
        x: [0, 50, -50, 0],
        y: [0, 100, 50, 0],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute top-[20%] left-[40%] w-[40vw] h-[40vw] rounded-full blur-[130px] transition-colors duration-700 ${theme === 'dark' ? 'bg-violet-600/10' : 'bg-violet-300/20'}`}
    />
    <div className={`absolute inset-0 backdrop-blur-[50px] transition-colors duration-700 ${theme === 'dark' ? 'bg-slate-950/20' : 'bg-white/20'}`} />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
  </div>
);

const AppContent: React.FC = () => {
  useAnimatedFavicon();
  const { user, isLoading, logout, handleGoogleCallback } = useAuth();
  const { isInstallable, handleInstallClick } = usePWAInstall();

  useEffect(() => {
    handleGoogleCallback();
  }, [handleGoogleCallback]);

  const [elements, setElements] = useState<ElementData[]>([]);
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    // Initial load from cache to prevent layout shift and provide instant results
    const cached = localStorage.getItem('labzero_subjects_cache');
    return cached ? JSON.parse(cached) : [];
  });

  const [viewState, setViewState] = useState<ViewState>(ViewState.LANDING);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [showAITutor, setShowAITutor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showAuth, setShowAuth] = useState(() => new URLSearchParams(window.location.search).get('auth') === '1');
  const [showMindMap, setShowMindMap] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('labzero_theme') as 'dark' | 'light') || 'light');
  const [colorBlindMode, setColorBlindMode] = useState(() => localStorage.getItem('labzero_colorblind') === 'true');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('labzero_language') as Language) || 'en');

  const [isGestureActive, setIsGestureActive] = useState(false);
  const [atomRotation, setAtomRotation] = useState({ dx: 0, dy: 0 });
  const [atomZoom, setAtomZoom] = useState(1);
  const [moleculeRotation, setMoleculeRotation] = useState({ dx: 0, dy: 0 });
  const [moleculeZoom, setMoleculeZoom] = useState(1);
  const [gesturePos, setGesturePos] = useState<{ x: number; y: number } | null>(null);

  // ================= QUIZ =================
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLevel, setQuizLevel] = useState<'basic' | 'intermediate' | 'difficult'>('basic');


  // ================= FETCH =================
  const fetchAllData = useCallback(() => {
    getElements()
      .then((data) => {
        if (data?.length) {
          setElements(data);
          setSelectedElement(data[0]);
        }
      })
      .catch(console.error);

    getMolecules()
      .then((data) => {
        if (data?.length) {
          setMolecules(data);
        }
      })
      .catch(console.error);

    // Fetch settings then subjects to ensure correct order
    axios.get(`${API_URL}/settings/`)
      .then(sRes => {
        const sortMethod = sRes.data.subject_sort_method || 'order';
        getSubjects()
          .then((data) => {
            if (data?.length) {
              const sorted = [...data].sort((a, b) => {
                if (sortMethod === 'alpha') return a.name.localeCompare(b.name);
                return (a.order || 0) - (b.order || 0);
              });
              setSubjects(sorted);
              // Save to cache
              localStorage.setItem('labzero_subjects_cache', JSON.stringify(sorted));
              localStorage.setItem('labzero_last_subject_count', sorted.length.toString());
            }
          })
          .catch(console.error);
      })
      .catch(err => {
        console.error("Settings fetch failed", err);
        getSubjects()
          .then((data) => {
            if (data?.length) {
              const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
              setSubjects(sorted);
              localStorage.setItem('labzero_subjects_cache', JSON.stringify(sorted));
              localStorage.setItem('labzero_last_subject_count', sorted.length.toString());
            }
          })
          .catch(console.error);
      });
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ================= THEME =================
  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('labzero_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle('colorblind-mode', colorBlindMode);
    localStorage.setItem('labzero_colorblind', colorBlindMode.toString());
  }, [colorBlindMode]);

  useEffect(() => {
    localStorage.setItem('labzero_language', language);
  }, [language]);

  const t = (key: string) => translations[key]?.[language] || key;

  // ================= NAVIGATION =================
  const handleSelectSubject = useCallback((subject: Subject) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setSelectedSubject(subject);
    setViewState(ViewState.SUBJECT);
  }, [user]);

  const handleSelectTopic = useCallback((topic: Topic) => {
    setSelectedTopic(topic);
    setViewState(ViewState.TOPIC);
  }, []);

  const handleBackToLanding = () => {
    setViewState(ViewState.LANDING);
    setSelectedSubject(null);
  };

  const handleDashboardClick = () => {
    setViewState(ViewState.DASHBOARD);
  };

  const handleBackToSubject = () => {
    setViewState(ViewState.SUBJECT);
    setSelectedTopic(null);
  };

  // ================= QUIZ =================
  const startQuiz = () => {
    if (!selectedSubject) return;

    const generated = generateQuizAI(selectedSubject.slug, quizLevel);

    if (!generated || generated.length === 0) {
      alert("Quiz generation failed");
      return;
    }

    setQuizQuestions(generated);
    setShowQuiz(true);
  };

  // ================= VISUALIZATION =================
  const renderVisualization = useCallback((topicSlug: string, topic?: Topic) => {
    // 1. Check the dynamic Registry first (Step 2 & 3)
    const DynamicSim = topic?.simulation_id ? SIMULATION_REGISTRY[topic.simulation_id] : null;

    if (DynamicSim) {
      return (
        <Suspense fallback={<div className="p-20 text-center text-white font-mono animate-pulse uppercase tracking-widest">Initialising Simulation Protocol...</div>}>
          <DynamicSim
            elements={elements}
            molecules={molecules}
            selectedElement={selectedElement ?? undefined}
            onSelectElement={setSelectedElement}
            theme={theme}
            language={language}
            controls={{ rotation: moleculeRotation, zoom: moleculeZoom }}
          />
        </Suspense>
      );
    }

    // 2. Fallback to legacy switch for unregistered topics
    switch (topicSlug) {
      default:
        return (
          <div className="p-10 text-center text-white font-mono opacity-50 uppercase tracking-widest animate-pulse">
            Simulation Protocol Pending...
          </div>
        );
    }
  }, [elements, molecules, selectedElement, atomRotation, atomZoom, moleculeRotation, moleculeZoom]);

  // ================= GESTURES =================
  const handleGestureSelect = () => {
    // This is a bit complex since we don't have the exact coordinates in this component easily
    // But we can trigger a generic "Click" or use a ref from GestureController
    // For now, let's assume GestureController handles the coordinate-based click if we pass it a ref
  };

  const handleGestureBack = () => {
    if (viewState === ViewState.TOPIC) {
      handleBackToSubject();
    } else if (viewState === ViewState.SUBJECT) {
      handleBackToLanding();
    }
  };

  const handleGestureScroll = (delta: number) => {
    window.scrollBy({ top: delta, behavior: 'smooth' });
    // Also scroll any scrollable containers
    const scrollable = document.querySelector('.overflow-y-auto');
    if (scrollable) {
      scrollable.scrollBy({ top: delta, behavior: 'smooth' });
    }
  };

  const handleGestureRotate = (dx: number, dy: number) => {
    if (selectedTopic?.id === TopicId.MOLECULAR_STRUCTURE) {
      setMoleculeRotation({ dx, dy });
      setTimeout(() => setMoleculeRotation({ dx: 0, dy: 0 }), 50);
      return;
    }

    setAtomRotation({ dx, dy });
    setTimeout(() => setAtomRotation({ dx: 0, dy: 0 }), 50);
  };

  const handleGestureZoom = (delta: number) => {
    if (selectedTopic?.id === TopicId.MOLECULAR_STRUCTURE) {
      setMoleculeZoom((prev) => Math.min(1.8, Math.max(0.7, prev + delta * 0.00012)));
      return;
    }

    setAtomZoom((prev) => Math.min(1.8, Math.max(0.7, prev + delta * 0.00012)));
  };

  const handleResetZoom = useCallback(() => {
    const startMZoom = moleculeZoom;
    const startAZoom = atomZoom;
    const targetZoom = 1.0;
    const duration = 1200; // Slow reset
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: easeInOutCubic
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setMoleculeZoom(startMZoom + (targetZoom - startMZoom) * ease);
      setAtomZoom(startAZoom + (targetZoom - startAZoom) * ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [moleculeZoom, atomZoom, selectedTopic]);

  // ================= AUTH =================

  return (
    <Skeleton name="labzero-main" loading={isLoading}>
      <div className={`h-screen w-full flex flex-col bg-transparent overflow-hidden relative transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        <BackgroundLayer theme={theme} />

        {/* ================= QUIZ SCREEN ================= */}
        <AnimatePresence>
          {showQuiz && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200]"
            >
              <QuizPage
                questions={quizQuestions}
                onExit={() => setShowQuiz(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>



        {!showQuiz && (
          <>
            <AnimatePresence mode="wait">
              {viewState === ViewState.LANDING && (
                <motion.div key="landing" className="h-full w-full overflow-y-auto">
                  <LandingPage
                    onSelectSubject={handleSelectSubject}
                    language={language}
                    theme={theme}
                    user={user}
                    onLoginClick={() => setShowAuth(true)}
                    onLogoutClick={logout}
                    onProfileClick={() => setShowAuth(true)}
                    onOpenGlossary={() => setShowGlossary(true)}
                    onDashboardClick={() => setViewState(ViewState.DASHBOARD)}
                    onAdminClick={() => setViewState(ViewState.ADMIN)}
                    subjects={subjects}
                  />
                </motion.div>
              )}
              {viewState === ViewState.SUBJECT && selectedSubject && (
                <motion.div key="subject" className="h-full w-full overflow-y-auto">
                  <SubjectPage
                    subject={selectedSubject}
                    onSelectTopic={handleSelectTopic}
                    onBack={handleBackToLanding}
                    language={language}
                    theme={theme}
                    onStartQuiz={startQuiz}
                    quizLevel={quizLevel}
                    onLevelChange={setQuizLevel}
                  />
                </motion.div>
              )}
              {viewState === ViewState.TOPIC && selectedTopic && (
                <motion.div key="topic" className="h-full w-full">
                  <TopicPage
                    topic={selectedTopic}
                    onBack={handleBackToSubject}
                    visualization={renderVisualization(selectedTopic.slug, selectedTopic)}
                    language={language}
                    onStartQuiz={startQuiz}
                  />
                </motion.div>
              )}
              {viewState === ViewState.DASHBOARD && user && (
                <motion.div key="dashboard" className="h-full w-full">
                  {user.role === 'teacher' ? <TeacherDashboard onBack={handleBackToLanding} /> : user.role === 'institute' ? <InstituteDashboard onBack={handleBackToLanding} /> : <StudentDashboard onBack={handleBackToLanding} />}
                </motion.div>
              )}
              {viewState === ViewState.ADMIN && user && (user.is_staff || user.is_superuser) && (
                <motion.div key="admin" className="h-full w-full overflow-y-auto">
                  <AdminDashboard onBack={handleBackToLanding} onDataUpdate={fetchAllData} />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`fixed bottom-20 right-24 w-16 h-16 rounded-2xl hidden md:flex items-center justify-center transition-all duration-500 z-[110] ${showSettings ? 'bg-indigo-500 rotate-90' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
            >
              <Settings size={24} className={showSettings ? 'text-white' : 'text-slate-400'} />
            </button>


            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="fixed bottom-24 md:bottom-28 left-4 right-4 md:left-auto md:right-28 md:w-72 glass-panel p-6 rounded-3xl z-[110] border border-white/10 origin-bottom-right mx-auto max-w-[calc(100vw-32px)]"
                >
                  <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-400 mb-6 flex items-center gap-2">
                    <Eye size={12} /> {t('accessibility')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">{t('colorblindMode')}</span>
                      </div>
                      <button onClick={() => setColorBlindMode(!colorBlindMode)} className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${colorBlindMode ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${colorBlindMode ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">{t('theme')}</span>
                        <span className="text-[8px] font-mono text-slate-500">{theme === 'dark' ? t('dark') : t('light')} Visuals</span>
                      </div>
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <Languages size={12} className="text-indigo-400" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">{t('language')}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['en', 'bn', 'hi'] as Language[]).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${language === lang
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                              }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-300">
                          <BookOpen size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">Glossary</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowGlossary(true);
                          setShowSettings(false);
                        }}
                        className="rounded-xl bg-amber-500 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-950 transition-colors hover:bg-amber-400"
                      >
                        Open
                      </button>
                    </div>

                    {isInstallable && (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Download size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">LabZero App</span>
                            <span className="text-[8px] font-mono text-indigo-400/60 leading-none mt-0.5">Offline Ready</span>
                          </div>
                        </div>
                        <button
                          onClick={handleInstallClick}
                          className="rounded-xl bg-indigo-600 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-white transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
                        >
                          Install
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {viewState !== ViewState.ADMIN && (
              <BottomNav
                currentView={viewState}
                onNavigate={setViewState}
                onOpenGlossary={() => setShowGlossary(!showGlossary)}
                onOpenSettings={() => setShowSettings(!showSettings)}
                onOpenProfile={() => setShowAuth(!showAuth)}
                onToggleGesture={() => { if (user?.role !== 'student') setIsGestureActive(!isGestureActive); }}
                isGestureActive={isGestureActive}
                showSettings={showSettings}
                showGlossary={showGlossary}
                showAuth={showAuth}
                language={language}
                user={user}
              />
            )}

            <AnimatePresence>
              {showGlossary && <Glossary language={language} onClose={() => setShowGlossary(false)} />}
              {showAuth && <AuthOverlay onClose={() => setShowAuth(false)} />}
              {showMindMap && <MemoryMapOverlay subjects={subjects} onClose={() => setShowMindMap(false)} />}
            </AnimatePresence>

            {viewState === ViewState.LANDING && !showMindMap && (
              <FloatingBrain onClick={() => setShowMindMap(true)} />
            )}

            <GestureController
              isActive={isGestureActive && user?.role !== 'student'}
              onToggle={() => { if (user?.role !== 'student') setIsGestureActive(!isGestureActive); }}
              onBack={handleGestureBack}
              onScroll={handleGestureScroll}
              onRotate={handleGestureRotate}
              onZoom={handleGestureZoom}
              onResetZoom={handleResetZoom}
              onSelect={handleGestureSelect}
              onPositionChange={setGesturePos}
              onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            />

            {isGestureActive && gesturePos && user?.role !== 'student' && (
              <motion.div
                className="fixed w-4 h-4 rounded-full bg-indigo-500 pointer-events-none z-[200] shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                animate={{ left: `${gesturePos.x * 100}%`, top: `${gesturePos.y * 100}%` }}
                transition={{ type: 'spring', stiffness: 1000, damping: 60, mass: 1 }}
                style={{ transform: 'translate(-50%, -50%)' }}
              />
            )}
          </>
        )}
      </div>
    </Skeleton>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
