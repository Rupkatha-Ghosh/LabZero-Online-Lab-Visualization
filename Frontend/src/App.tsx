import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Sparkles, MessageSquare, X, Settings, Moon, Sun, BookOpen, Download, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from './components/pages/LandingPage';
import SubjectPage from './components/pages/SubjectPage';
import TopicPage from './components/pages/TopicPage';
import MeetingRoom from './pages/MeetingRoom';
import AdminDashboard from './components/dashboards/AdminDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import InstituteDashboard from './components/dashboards/InstituteDashboard';
import GestureController from './components/shared/GestureController';
import BottomNav from './components/common/BottomNav';
import Glossary from './components/shared/Glossary';
import SettingsMenu from './components/shared/SettingsMenu';
import AuthOverlay from './components/auth/AuthOverlay';
import AuthPage from './components/auth/AuthPage';
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
import { MeetingConfig } from './context/MeetingContext';
import { createRoomId } from './utils/peerUtils';

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
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [meetingConfig, setMeetingConfig] = useState<MeetingConfig | null>(null);

  const [showAITutor, setShowAITutor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showAuth, setShowAuth] = useState(() => new URLSearchParams(window.location.search).get('auth') === '1');
  const [showMindMap, setShowMindMap] = useState(false);
  const landingScrollRef = useRef<HTMLDivElement>(null);
  const subjectScrollRef = useRef<HTMLDivElement>(null);
  const savedScrollPositions = useRef<Record<string, number>>({});


  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('labzero_theme') as 'dark' | 'light') || 'light');
  const [colorBlindMode, setColorBlindMode] = useState(() => localStorage.getItem('labzero_colorblind') === 'true');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('labzero_language') as Language) || 'en');

  const [isGestureActive, setIsGestureActive] = useState(false);
  const [cameraSource, setCameraSource] = useState<"local" | "remote">("local");
  const [atomRotation, setAtomRotation] = useState({ dx: 0, dy: 0 });
  const [atomZoom, setAtomZoom] = useState(1);
  const [moleculeRotation, setMoleculeRotation] = useState({ dx: 0, dy: 0 });
  const [moleculeZoom, setMoleculeZoom] = useState(1);
  const [gesturePos, setGesturePos] = useState<{ x: number; y: number } | null>(null);
  const [publicStats, setPublicStats] = useState({ 
    subjects: 0, 
    topics: 0, 
    students: 0, 
    average_rating: 4.9, 
    feedback_count: 1000 
  });

  // ================= QUIZ =================
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLevel, setQuizLevel] = useState<'basic' | 'intermediate' | 'difficult'>('basic');

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const signalingUrl = (() => {
    if (import.meta.env.VITE_SIGNALING_URL) return import.meta.env.VITE_SIGNALING_URL;
    const host = window.location.hostname || "localhost";
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${host}/signal`;
  })();

  const phoneSenderUrl = (() => {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("camera", "sender");
    url.searchParams.set("signal", signalingUrl);
    return url.toString();
  })();

  const copyPhoneLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(phoneSenderUrl);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 1400);
    } catch (error) {
      console.error("Could not copy phone camera link", error);
    }
  }, [phoneSenderUrl]);


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

        axios.get(`${API_URL}/public-stats/`)
          .then(res => setPublicStats(res.data))
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

  // Restore scroll position when view state changes
  // (Logic moved to ref callbacks for immediate execution)

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

  const handleLaunchSimulation = useCallback((topicId: string | number) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    // Find the topic in any of the subjects
    for (const subject of subjects) {
      const topic = subject.topics.find(t => t.id === topicId || t.slug === topicId);
      if (topic) {
        setSelectedSubject(subject);
        setSelectedTopic(topic);
        setViewState(ViewState.TOPIC);
        return;
      }
    }
    console.error("Topic not found for simulation:", topicId);
  }, [subjects]);

  const handleSelectClass = useCallback((className: string) => {
    setSelectedClass(className);
    setViewState(ViewState.CLASS_SUBJECTS);
  }, []);

  const handleBackToLanding = () => {
    setViewState(ViewState.LANDING);
    setSelectedSubject(null);
  };

  const handleBack = () => {
    switch (viewState) {
      case ViewState.TOPIC: setViewState(ViewState.SUBJECT); break;
      case ViewState.MEETING: setViewState(selectedTopic ? ViewState.TOPIC : ViewState.DASHBOARD); break;
      case ViewState.SUBJECT: setViewState(ViewState.CLASS_SUBJECTS); break;
      case ViewState.CLASS_SUBJECTS: setViewState(ViewState.LANDING); break;
      case ViewState.DASHBOARD: setViewState(ViewState.LANDING); break;
      default: setViewState(ViewState.LANDING);
    }
  };

  const handleDashboardClick = () => {
    setViewState(ViewState.DASHBOARD);
  };

  const handleBackToSubject = () => {
    setViewState(ViewState.SUBJECT);
    setSelectedClass(null);
    setSelectedTopic(null);
  };

  const handleStartTopicMeeting = useCallback((topic: Topic) => {
    setSelectedTopic(topic);
    setMeetingConfig({
      roomId: createRoomId(`topic-${topic.id}`),
      title: `${topic.name} Online Class`,
      subtitle: 'Live classroom session for this lab topic.',
      role: user?.role === 'student' ? 'guest' : 'host',
    });
    setViewState(ViewState.MEETING);
  }, [user?.role]);

  const handleStartClassMeeting = useCallback((classroom: any) => {
    setMeetingConfig({
      roomId: createRoomId(`class-${classroom?.id || classroom?.invite_code || classroom?.name || 'room'}`),
      title: `${classroom?.name || 'Classroom'} Online Class`,
      subtitle: classroom?.invite_code ? `Invite code: ${classroom.invite_code}` : 'Live classroom session.',
      role: user?.role === 'student' ? 'guest' : 'host',
    });
    setViewState(ViewState.MEETING);
  }, [user?.role]);

  const handleLeaveMeeting = useCallback(() => {
    setMeetingConfig(null);
    setViewState(selectedTopic ? ViewState.TOPIC : ViewState.DASHBOARD);
  }, [selectedTopic]);

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
    const DynamicSim = topic?.simulation_id ? SIMULATION_REGISTRY[topic.simulation_id.toLowerCase()] : null;

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
  }, [elements, molecules, selectedElement, moleculeRotation, moleculeZoom, theme, language]);

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
              {/* 1. MAIN LANDING PAGE (Now includes the Class Dropdown internally) */}
              {viewState === ViewState.LANDING && (
                <motion.div 
                  key="landing" 
                  ref={(el) => {
                    landingScrollRef.current = el;
                    if (el) {
                      el.scrollTop = savedScrollPositions.current[ViewState.LANDING] || 0;
                    }
                  }}
                  onScroll={(e) => {
                    savedScrollPositions.current[ViewState.LANDING] = e.currentTarget.scrollTop;
                  }}
                  className="h-full w-full overflow-y-auto"
                >
                  <LandingPage
                    onSelectSubject={handleSelectSubject}
                    language={language}
                    theme={theme}
                    user={user}
                    selectedClass={selectedClass}         // Pass current class state
                    onSelectClass={setSelectedClass}      // Let dropdown update the state
                    onLoginClick={() => setShowAuth(true)}
                    onLogoutClick={logout}
                    onProfileClick={() => setShowAuth(true)}
                    onOpenGlossary={() => setShowGlossary(true)}
                    onDashboardClick={() => setViewState(ViewState.DASHBOARD)}
                    onAdminClick={() => setViewState(ViewState.ADMIN)}
                    onLaunchSimulation={handleLaunchSimulation}
                    subjects={subjects}
                    stats={publicStats}
                  />
                </motion.div>
              )}

              {/* 2. SUBJECT PAGE (Preserves selected class to filter units) */}
              {viewState === ViewState.SUBJECT && selectedSubject && (
                <motion.div 
                  key="subject" 
                  ref={(el) => {
                    subjectScrollRef.current = el;
                    if (el) {
                      el.scrollTop = savedScrollPositions.current[ViewState.SUBJECT] || 0;
                    }
                  }}
                  onScroll={(e) => {
                    savedScrollPositions.current[ViewState.SUBJECT] = e.currentTarget.scrollTop;
                  }}
                  className="h-full w-full overflow-y-auto"
                >
                  <SubjectPage
                    subject={selectedSubject}
                    onSelectTopic={handleSelectTopic}
                    onBack={() => setViewState(ViewState.LANDING)} // Directly back to landing!
                    language={language}
                    theme={theme}
                    onStartQuiz={startQuiz}
                    quizLevel={quizLevel}
                    onLevelChange={setQuizLevel}
                    selectedClass={selectedClass} // Keeps unit modules filtered
                  />
                </motion.div>
              )}

              {/* ... Rest of your views (TOPIC, DASHBOARD, ADMIN) stay the same ... */}


              {/* ... Remaining view conditions (TOPIC, DASHBOARD, ADMIN) persist cleanly ... */}
              {viewState === ViewState.TOPIC && selectedTopic && (
                <motion.div key="topic" className="h-full w-full">
                  <TopicPage
                    topic={selectedTopic}
                    onBack={handleBackToSubject}
                    visualization={renderVisualization(selectedTopic.slug, selectedTopic)}
                    language={language}
                    onStartQuiz={startQuiz}
                    onStartMeeting={handleStartTopicMeeting}
                  />
                </motion.div>
              )}
              {viewState === ViewState.MEETING && meetingConfig && (
                <motion.div key="meeting" className="h-full w-full">
                  <MeetingRoom config={meetingConfig} onLeave={handleLeaveMeeting} />
                </motion.div>
              )}
              {viewState === ViewState.DASHBOARD && user && (
                <motion.div key="dashboard" className="h-full w-full">
                  {user.role === 'teacher' ? <TeacherDashboard onBack={handleBackToLanding} onStartMeeting={handleStartClassMeeting} /> : user.role === 'institute' ? <InstituteDashboard onBack={handleBackToLanding} /> : <StudentDashboard onBack={handleBackToLanding} onLaunchLab={handleLaunchSimulation} onStartMeeting={handleStartClassMeeting} />}
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
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowSettings(false)}
                    className={`fixed inset-0 z-[115] backdrop-blur-[2px] cursor-pointer ${theme === 'dark' ? 'bg-black/20' : 'bg-slate-900/10'}`}
                  />
                    <SettingsMenu
                      onClose={() => setShowSettings(false)}
                      theme={theme}
                      onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                      language={language}
                      onLanguageChange={setLanguage}
                      onOpenMindMap={() => { setShowMindMap(true); setShowSettings(false); }}
                      onOpenGlossary={() => { setShowGlossary(true); setShowSettings(false); }}
                      isInstallable={isInstallable}
                      onInstallApp={handleInstallClick}
                      cameraSource={cameraSource}
                      onCameraSourceChange={setCameraSource}
                      phoneSenderUrl={phoneSenderUrl}
                      copyStatus={copyStatus}
                      onCopyPhoneLink={copyPhoneLink}
                      colorBlindMode={colorBlindMode}
                      onToggleColorBlind={() => setColorBlindMode(prev => !prev)}
                      user={user}
                    />
                </>
              )}
            </AnimatePresence>

            {viewState !== ViewState.ADMIN && (
              <BottomNav
                currentView={viewState}
                onNavigate={setViewState}
                onOpenGlossary={() => setShowGlossary(!showGlossary)}
                onOpenSettings={() => setShowSettings(!showSettings)}
                onOpenProfile={() => setShowAuth(!showAuth)}
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
              cameraSource={cameraSource}
              onCameraSourceChange={setCameraSource}
              theme={theme}
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
