import React from 'react';
import { Subject, Topic } from '../../types/types';
import { safeLocalStorage } from '../../utils/safeStorage';
import { Beaker, Zap, Calculator, Dna, ArrowRight, Play, Maximize2, Move3d, RotateCcw, Rotate3d, Layout, Layers, Users, Star, Globe, History, ChevronRight, Award, Clock, X } from 'lucide-react';
import { Language, translations } from '../../services/translations';
import { useLanguage } from '../../context/LanguageContext';
import { Logo } from '../common/Logo';
import Footer from '../common/Footer';
import LoadingTriviaCard from '../common/LoadingTriviaCard';
import { useAwards } from '../../store/awardsStore';
import { motion, AnimatePresence } from 'motion/react';
import { SUBJECTS } from '../../utils/constants';
import { TopicId } from '../../types/types';
// Inline skeleton components (replaces missing '../common/Skeleton')
const Hero3DModelFallback = ({ theme }: { theme: 'dark' | 'light' }) => {
 
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  return (
    <div className="w-full h-full min-h-[280px] flex items-center justify-center relative overflow-hidden select-none rounded-[32px]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orbit-1 {
          0% { transform: rotate3d(1, 1, 1, 0deg); }
          100% { transform: rotate3d(1, 1, 1, 360deg); }
        }
        @keyframes orbit-2 {
          0% { transform: rotate3d(-1, 1, 0.5, 0deg); }
          100% { transform: rotate3d(-1, 1, 0.5, 360deg); }
        }
        @keyframes orbit-3 {
          0% { transform: rotate3d(0.5, -1, 1, 0deg); }
          100% { transform: rotate3d(0.5, -1, 1, 360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.45; filter: drop-shadow(0 0 10px var(--glow-color)); }
          50% { transform: scale(1.15); opacity: 0.8; filter: drop-shadow(0 0 20px var(--glow-color)); }
        }
        @keyframes bubble-rise {
          0% { transform: translateY(45px) scale(0.3); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-75px) scale(1.1); opacity: 0; }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        .css-3d-scene {
          --glow-color: ${isDark ? 'rgba(14, 165, 233, 0.55)' : 'rgba(99, 102, 241, 0.5)'};
          perspective: 1000px;
          transform-style: preserve-3d;
          transform: scale(0.75);
          transition: transform 0.3s ease;
        }
        @media (min-width: 640px) {
          .css-3d-scene { transform: scale(0.95); }
        }
        @media (min-width: 1024px) {
          .css-3d-scene { transform: scale(1.2); }
        }
        .css-flask-container {
          animation: float-gentle 5s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .css-flask-body {
          position: relative;
          width: 110px;
          height: 110px;
          border: 3.5px solid ${isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.16)'};
          border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
          background: ${isDark ? 'rgba(15, 23, 42, 0.35)' : 'rgba(255, 255, 255, 0.45)'};
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .css-flask-body::before {
          content: '';
          position: absolute;
          bottom: 8px;
          width: 82px;
          height: 40px;
          background: linear-gradient(180deg, ${isDark ? '#0EA5E9' : '#6366f1'} 0%, ${isDark ? '#10B981' : '#f43f5e'} 100%);
          border-radius: 0 0 41px 41px / 0 0 30px 30px;
          opacity: 0.6;
          filter: blur(0.5px);
        }
        .css-flask-neck {
          width: 28px;
          height: 44px;
          border-left: 3.5px solid ${isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.16)'};
          border-right: 3.5px solid ${isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.16)'};
          border-top: 3.5px solid ${isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.16)'};
          border-radius: 5px 5px 0 0;
          margin: 0 auto -4px auto;
          background: ${isDark ? 'rgba(15, 23, 42, 0.25)' : 'rgba(255, 255, 255, 0.35)'};
        }
        .css-flask-bubble {
          position: absolute;
          bottom: 20px;
          background: ${isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(99, 102, 241, 0.75)'};
          border-radius: 50%;
          pointer-events: none;
        }
        .css-flask-bubble-1 { width: 7px; height: 7px; left: 40px; animation: bubble-rise 2.8s infinite ease-in; animation-delay: 0.2s; }
        .css-flask-bubble-2 { width: 10px; height: 10px; left: 54px; animation: bubble-rise 3.5s infinite ease-in; animation-delay: 1.0s; }
        .css-flask-bubble-3 { width: 5px; height: 5px; left: 66px; animation: bubble-rise 3.0s infinite ease-in; animation-delay: 1.8s; }
        
        .css-orbit {
          position: absolute;
          border: 1.5px dashed ${isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(99, 102, 241, 0.25)'};
          border-radius: 50%;
          transform-style: preserve-3d;
        }
        .css-orbit-1 {
          width: 220px;
          height: 220px;
          animation: orbit-1 10s linear infinite;
        }
        .css-orbit-2 {
          width: 260px;
          height: 260px;
          animation: orbit-2 13s linear infinite;
        }
        .css-orbit-3 {
          width: 300px;
          height: 300px;
          animation: orbit-3 16s linear infinite;
        }
        .css-electron {
          position: absolute;
          top: 50%;
          left: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: -5px;
          margin-left: -5px;
          background: ${isDark ? '#38bdf8' : '#6366f1'};
          box-shadow: 0 0 8px ${isDark ? '#0EA5E9' : '#6366f1'}, 0 0 16px ${isDark ? '#0EA5E9' : '#6366f1'};
        }
        .css-electron-2 {
          background: ${isDark ? '#34d399' : '#f43f5e'};
          box-shadow: 0 0 8px ${isDark ? '#10B981' : '#f43f5e'}, 0 0 16px ${isDark ? '#10B981' : '#f43f5e'};
        }
        .css-electron-3 {
          background: ${isDark ? '#fb923c' : '#10b981'};
          box-shadow: 0 0 8px ${isDark ? '#F97316' : '#10b981'}, 0 0 16px ${isDark ? '#F97316' : '#10b981'};
        }
        .css-nucleus {
          position: absolute;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: radial-gradient(circle, ${isDark ? '#38bdf8' : '#a78bfa'} 0%, ${isDark ? '#0284c7' : '#6366f1'} 100%);
          animation: pulse-glow 2.5s ease-in-out infinite;
          z-index: 1;
        }
      `}} />

      {/* 3D Scene Wrapper */}
      <div className="css-3d-scene flex items-center justify-center w-[360px] h-[360px] relative">
        {/* Orbiting rings */}
        <div className="css-orbit css-orbit-1">
          <div className="css-electron css-electron-1"></div>
        </div>
        <div className="css-orbit css-orbit-2">
          <div className="css-electron css-electron-2"></div>
        </div>
        <div className="css-orbit css-orbit-3">
          <div className="css-electron css-electron-3"></div>
        </div>

        {/* Glowing Beaker / Flask */}
        <div className="css-flask-container flex flex-col items-center justify-center relative">
          <div className="css-flask-neck"></div>
          <div className="css-flask-body">
            {/* Rising Bubbles */}
            <div className="css-flask-bubble css-flask-bubble-1"></div>
            <div className="css-flask-bubble css-flask-bubble-2"></div>
            <div className="css-flask-bubble css-flask-bubble-3"></div>
            
            {/* Center pulsing nucleus */}
            <div className="css-nucleus"></div>
          </div>
        </div>
      </div>
      
      {/* Subtle loading hint text */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-20 w-[min(92vw,420px)]">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-200/40 dark:bg-slate-950/45 backdrop-blur-md border border-slate-300/30 dark:border-white/10 shadow-lg">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </div>
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-slate-600 dark:text-sky-300 font-semibold">{t('Loading Interactive 3D...')}</span>
        </div>
        <div className="pointer-events-auto w-full">
          <LoadingTriviaCard theme={theme} />
        </div>
      </div>
    </div>
  );
};

const HeroSkeleton: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  
  const { t } = useLanguage();return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[75vh] scroll-mt-24 w-full">
      {/* Left-side Text skeleton */}
      <div className="lg:w-[40%] space-y-8 z-10 pt-10 flex flex-col items-center lg:items-start w-full">
        {/* Badge Skeleton */}
        <div className="h-7 w-48 bg-[#E0F2FE]/40 dark:bg-sky-950/30 border border-[#BAE6FD]/20 rounded-full animate-pulse" />
        
        {/* Title Skeleton */}
        <div className="space-y-4 w-full flex flex-col items-center lg:items-start">
          <div className="h-16 w-3/4 bg-gray-200/80 dark:bg-gray-800/80 rounded-2xl animate-pulse" />
          <div className="h-16 w-2/3 bg-gray-200/80 dark:bg-gray-800/80 rounded-2xl animate-pulse" />
          <div className="h-16 w-1/2 bg-gray-200/80 dark:bg-gray-800/80 rounded-2xl animate-pulse" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-3 w-full flex flex-col items-center lg:items-start">
          <div className="h-5 w-5/6 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg animate-pulse" />
          <div className="h-5 w-4/5 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg animate-pulse" />
        </div>

        {/* Buttons Skeleton */}
        <div className="flex gap-4 w-full justify-center lg:justify-start">
          <div className="h-12 w-36 bg-gray-200/80 dark:bg-gray-800/80 rounded-full animate-pulse" />
          <div className="h-12 w-32 bg-gray-200/80 dark:bg-gray-800/80 rounded-full animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="flex items-center gap-4 w-full justify-center lg:justify-start">
          <div className="flex -space-x-3">
            <div className="h-10 w-10 bg-gray-200/70 dark:bg-gray-800/70 rounded-full border-2 border-[var(--bg-deep)] animate-pulse" />
            <div className="h-10 w-10 bg-gray-200/70 dark:bg-gray-800/70 rounded-full border-2 border-[var(--bg-deep)] animate-pulse" />
            <div className="h-10 w-10 bg-gray-200/70 dark:bg-gray-800/70 rounded-full border-2 border-[var(--bg-deep)] animate-pulse" />
          </div>
          <div className="h-5 w-32 bg-gray-200/80 dark:bg-gray-800/80 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Right-side 3D Model Fallback / Placeholder */}
      <div className="lg:w-[60%] h-[280px] min-h-[280px] sm:h-[500px] lg:h-[650px] w-full relative flex items-center justify-center">
        <Hero3DModelFallback theme={theme} />
      </div>
    </div>
  );
};

const CardGridSkeleton: React.FC<{ count?: number; theme: 'dark' | 'light' }> = ({ count = 4 }) => (
  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
    ))}
  </div>
);

import { InverseSquareGraph } from '../models/InverseSquareGraph';

const LazyElectricFieldSimulation = React.lazy(() => import('../models/ElectricField').then(module => ({ default: module.ElectricFieldSimulation })));

const ElectricFieldSimulationFallback = () => {
 
  const { t } = useLanguage();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent min-h-[300px] select-none gap-4 p-4">
      <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      <div className="text-[10px] font-mono tracking-widest text-teal-500/50 uppercase">{t('Loading field grid...')}</div>
      <div className="w-full max-w-[280px]">
        <LoadingTriviaCard theme="dark" />
      </div>
    </div>
  );
};

const SuspendedElectricFieldSimulation = ({ theme }: { theme: 'dark' | 'light' }) => (
  <React.Suspense fallback={<ElectricFieldSimulationFallback />}>
    <div className="w-full h-full">
      <LazyElectricFieldSimulation theme={theme} />
    </div>
  </React.Suspense>
);

const LazyHero3DModel = React.lazy(() => import('../models/Hero3DModelCache.tsx'));

const SuspendedHero3DModel = ({ theme }: { theme: 'dark' | 'light' }) => (
  <React.Suspense fallback={<Hero3DModelFallback theme={theme} />}>
    <div className="w-full h-full">
      <LazyHero3DModel theme={theme} />
    </div>
  </React.Suspense>
);

const useDeferredHeroWidgets = () => {
  
  const { t } = useLanguage();const [shouldLoad, setShouldLoad] = React.useState(() => {
    return typeof window !== 'undefined' && safeLocalStorage.getItem('heroWidgetsLoaded') === 'true';
  });

  React.useEffect(() => {
    if (shouldLoad) return;

    let idleId: number | null = null;
    let timeoutId: any = null;

    const triggerLoad = () => {
      setShouldLoad(true);
      // Persist flag so subsequent mounts skip loading animation
      if (typeof window !== 'undefined') {
        safeLocalStorage.setItem('heroWidgetsLoaded', 'true');
      }
    };
    const onInteraction = () => triggerLoad();

    if ('requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(triggerLoad, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(triggerLoad, 1500);
    }

    window.addEventListener('pointerdown', onInteraction, { once: true });
    window.addEventListener('keydown', onInteraction, { once: true });

    return () => {
      if (idleId !== null && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('pointerdown', onInteraction);
      window.removeEventListener('keydown', onInteraction);
    };
  }, [shouldLoad]);

  return shouldLoad;
};

const RESUME_DISMISS_KEY = 'labzero_resume_dismissed_v1';

const formatRelativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

interface ResumeCardProps {
  onSelectSubject: (subject: Subject) => void;
  onDismiss: () => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ onSelectSubject, onDismiss }) => {
  const { getAllProgress, getEarnedTier } = useAwards();
  const progress = getAllProgress();

  const recent = React.useMemo(() => {
    const entries = Object.entries(progress)
      .filter(([, p]) => p.lastVisitAt)
      .sort(([, a], [, b]) => (b.lastVisitAt ?? 0) - (a.lastVisitAt ?? 0));
    if (entries.length === 0) return null;
    const [topicId, p] = entries[0];
    const parent = SUBJECTS.find((s) => s.topics?.some((t) => String(t.id) === String(topicId)));
    const topic = parent?.topics?.find((t) => String(t.id) === String(topicId));
    if (!parent || !topic) return null;
    return { topicId, topic, parent, lastVisitAt: p.lastVisitAt as number, progress: p };
  }, [progress]);

  if (!recent) return null;
  const earnedTier = getEarnedTier(String(recent.topicId));

  const handleResume = () => {
    onSelectSubject(recent.parent);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="mb-8 sm:mb-10"
      aria-label="Resume your last lab"
    >
      <button
        onClick={handleResume}
        className="group relative w-full overflow-hidden rounded-[28px] sm:rounded-[36px] border border-[var(--border-glass)] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-amber-500/10 hover:from-indigo-500/20 hover:via-purple-500/10 hover:to-amber-500/20 transition-all duration-500 text-left"
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          background: 'radial-gradient(circle at 90% 10%, rgba(99, 102, 241, 0.18), transparent 50%), radial-gradient(circle at 10% 90%, rgba(245, 158, 11, 0.15), transparent 45%)',
        }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-7">
          <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
            <History size={26} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-indigo-400 mb-1.5">
              <Clock size={11} />
              <span>{formatRelativeTime(recent.lastVisitAt)}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">Continue where you left off</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-display font-black tracking-tight text-[var(--text-primary)] truncate">
              {recent.topic.name}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)]">
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono uppercase tracking-wider text-[10px]">
                {recent.parent.name}
              </span>
              {earnedTier !== 'none' && (
                <span className="flex items-center gap-1 text-amber-400">
                  <Award size={12} />
                  <span className="font-mono uppercase tracking-wider text-[10px]">Tier {earnedTier === 'tier1' ? 1 : earnedTier === 'tier2' ? 2 : earnedTier === 'tier3' ? 3 : 4}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex w-11 h-11 rounded-full bg-white/5 border border-white/10 items-center justify-center text-[var(--text-primary)] group-hover:bg-indigo-500 group-hover:border-indigo-400 group-hover:text-white transition-all duration-300">
              <ChevronRight size={18} />
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onDismiss();
                }
              }}
              className="shrink-0 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 cursor-pointer"
              aria-label="Dismiss"
            >
              <X size={16} />
            </div>
          </div>
        </div>
      </button>
    </motion.section>
  );
};

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
  onFeedbackAdminClick?: () => void;
  subjects: Subject[];
  selectedClass?: string | null;
  onSelectClass?: (cls: string | null) => void;
  onLaunchSimulation?: (topicId: string) => void;
  stats?: { subjects: number; topics: number; students: number; average_rating?: number; feedback_count?: number };
}

const LandingPage: React.FC<LandingPageProps> = ({
  onSelectSubject,
  user,
  onLoginClick,
  onProfileClick,
  onDashboardClick,
  onAdminClick,
  onFeedbackAdminClick,
  language,
  theme,
  subjects,
  selectedClass,
  onSelectClass,
  onLaunchSimulation,
  stats = { subjects: 0, topics: 0, students: 0, average_rating: 0.0, feedback_count: 0 },
}) => {

  const { t } = useLanguage();
  const shouldLoadHeroWidgets = useDeferredHeroWidgets();
  const { getAllProgress } = useAwards();

  // "Continue where you left off" — visible if there is at least one
  // topic with a recent visit AND the user hasn't dismissed the card in
  // the last 24 hours. Reappears automatically when a new topic is visited.
  const [showResume, setShowResume] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const dismissedAt = Number(safeLocalStorage.getItem(RESUME_DISMISS_KEY) ?? 0);
    if (dismissedAt && Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return false;
    try {
      const raw = safeLocalStorage.getItem('labzero_awards_v1');
      if (!raw) return false;
      const parsed = JSON.parse(raw) as { progress?: Record<string, { lastVisitAt?: number | null }> };
      return Boolean(
        parsed.progress &&
          Object.values(parsed.progress).some((p) => typeof p.lastVisitAt === 'number')
      );
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    const all = getAllProgress();
    const hasAny = Object.values(all).some((p) => typeof p.lastVisitAt === 'number');
    if (hasAny) {
      const dismissedAt = Number(safeLocalStorage.getItem(RESUME_DISMISS_KEY) ?? 0);
      if (dismissedAt && Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return;
      setShowResume(true);
    }
  }, [getAllProgress]);

  const feedbackCount = Math.max(0, Number(stats.feedback_count ?? 0));
  const averageRating = Math.max(0, Math.min(5, Number(stats.average_rating ?? 0)));
  const formattedRating = averageRating.toFixed(averageRating % 1 === 0 ? 0 : 1);
  const lovedByLabel = feedbackCount === 1 ? 'student' : 'students';

  const [isModelReady, setIsModelReady] = React.useState(() => {
    return typeof window !== 'undefined' && (window as any).hero3DModelLoaded === true;
  });

  React.useEffect(() => {
    if (isModelReady) return;
    const handleLoaded = () => setIsModelReady(true);
    window.addEventListener('hero-3d-model-loaded', handleLoaded);
    return () => window.removeEventListener('hero-3d-model-loaded', handleLoaded);
  }, [isModelReady]);

  // Dynamically filter subjects based on active dropdown selection
  const displayedSubjects = selectedClass
    ? subjects.filter(sub => !sub.targetClass || sub.targetClass.includes(selectedClass))
    : subjects;

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('labzero:subjects-rendered'));
  }, [displayedSubjects.length]);

  return (
    <div className={`relative min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] font-sans selection:bg-[#7DD3FC]/30 overflow-hidden transition-colors duration-500 ${theme === 'light' ? 'light-mode' : ''}`}>

      {/* Minimal background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[var(--color-primary)] opacity-10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--color-secondary)] opacity-10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 h-16 sm:h-20 z-50 bg-[var(--bg-deep)]/80 backdrop-blur-lg border-b border-[var(--border-glass)] px-4 sm:px-6 md:px-12 flex items-center justify-between">
        <Logo lightText={theme === 'dark'} />

        <nav className="hidden lg:flex items-center gap-8">
          {['Home', 'Explore', 'About', 'Simulations', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[15px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          {!user ? (
            <>
              <button onClick={onLoginClick} data-tour="login" className="hidden md:block px-5 py-2 text-[15px] font-medium text-[var(--text-primary)] border border-[var(--border-glass)] hover:bg-[var(--bg-panel)] rounded-full transition-all bg-white/5 shadow-sm">{t('Log in')}</button>
              <button
                onClick={onLoginClick}
                data-tour="login"
                className="px-4 sm:px-6 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white rounded-full text-sm sm:text-[15px] font-medium transition-all shadow-md shadow-[var(--color-secondary)]/20 whitespace-nowrap"
              >{t('Get Started')}</button>
            </>
          ) : (
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {(user.is_staff || user.is_superuser) && (
                <button
                  onClick={onAdminClick}
                  className="hidden md:block px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[13px] font-bold uppercase tracking-tight transition-all shadow-md shadow-indigo-500/25 border border-indigo-400/20"
                >{t('Admin Panel')}</button>
              )}
              {(user.is_staff || user.is_superuser) && (
                <button
                  onClick={onFeedbackAdminClick}
                  className="hidden md:block px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full text-[13px] font-bold uppercase tracking-tight transition-all shadow-md shadow-cyan-500/25 border border-cyan-400/20"
                >{t('Feedback Admin')}</button>
              )}
              {user.role && (
                <button onClick={onDashboardClick} data-tour="dashboard" className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-full text-[15px] font-medium transition-all shadow-sm hidden md:block">
                  {user.role === 'teacher' ? 'Teacher Dashboard' : user.role === 'student' ? 'My Dashboard' : 'Institute Dashboard'}
                </button>
              )}
              <button onClick={onProfileClick} data-tour="login" className="max-w-[44vw] truncate px-3 sm:px-4 py-2 border border-[var(--border-glass)] bg-white/5 hover:bg-[var(--bg-panel)] rounded-full text-sm sm:text-[15px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                Hello, {user.first_name || user.username}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="pt-20 sm:pt-32 pb-32 md:pb-0 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto space-y-16 sm:space-y-20 md:space-y-32">

        {/* HERO SECTION */}
        {shouldLoadHeroWidgets ? (
          <section id="home" className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[75vh] scroll-mt-24">
            <div className="lg:w-[40%] space-y-8 z-10 pt-10 flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD]">
                <span className="text-xs font-semibold text-[#0284c7] tracking-wide text-center">{t('3D Educational Virtual Lab')}</span>
              </div>

              <h1 className="text-[52px] md:text-[72px] lg:text-[84px] font-display font-bold leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] text-center lg:text-left">
                {t('Visualize.')}<br />
                {t('Experiment.')}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">{t('Understand.')}</span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-[var(--text-muted)] max-w-md mx-auto lg:mx-0 leading-relaxed font-normal text-center lg:text-left">
                {t('Interactive 3D labs for Physics, Chemistry, Math & Biology.')}<br className="hidden md:block" />
                {t('Turn abstract concepts into real understanding.')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
                <button
                  onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-[#14b8a6] hover:bg-[#0f766e] text-white rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg shadow-[#14b8a6]/25 flex items-center justify-center gap-2"
                >
                  {t('Start Exploring')} <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => document.getElementById('simulations')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white border-2 border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] rounded-full text-sm sm:text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {t('Watch Demo')} <Play size={18} fill="currentColor" className="text-[#0F172A]" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/100?img=5" alt="Student" className="w-10 h-10 rounded-full border-[3px] border-[var(--bg-deep)] shadow-sm" />
                  <img src="https://i.pravatar.cc/100?img=9" alt="Student" className="w-10 h-10 rounded-full border-[3px] border-[var(--bg-deep)] shadow-sm" />
                  <img src="https://i.pravatar.cc/100?img=12" alt="Student" className="w-10 h-10 rounded-full border-[3px] border-[var(--bg-deep)] shadow-sm" />
                  <img src="https://i.pravatar.cc/100?img=47" alt="Student" className="w-10 h-10 rounded-full border-[3px] border-[var(--bg-deep)] shadow-sm" />
                </div>
                <div className="text-sm text-[var(--text-muted)] flex flex-col justify-center">
                  <p>
                    Loved by{' '}
                    <strong className="text-[var(--text-primary)]">{feedbackCount}</strong>{' '}
                    {lovedByLabel}
                  </p>
                  <div className="flex items-center gap-1 text-amber-400 mt-0.5 text-xs">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const isActive = s <= Math.round(averageRating);
                      return (
                        <Star
                          key={s}
                          size={14}
                          className={isActive
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-[var(--text-muted)]/20'}
                        />
                      );
                    })}
                    <span className="text-[var(--text-muted)] ml-1 font-medium">{formattedRating}/5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-[60%] h-[280px] min-h-[280px] sm:h-[500px] lg:h-[650px] w-full relative touch-pan-y">
              <div className="absolute inset-0 max-w-[950px] mx-auto w-full h-full">
                {/* 3D model mounts and loads in the background */}
                <SuspendedHero3DModel theme={theme} />
                
                {/* Smooth overlay that fades out once 3D canvas is ready to render */}
                <div 
                  className={`absolute inset-0 z-30 transition-all duration-700 ease-out ${
                    isModelReady ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
                  }`}
                  style={{ background: 'var(--bg-deep)' }}
                >
                  <Hero3DModelFallback theme={theme} />
                </div>
              </div>

              {/* Interaction Hint Bar */}
              <div className="hidden sm:flex absolute bottom-4 left-1/2 -translate-x-1/2 bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-glass)] px-4 sm:px-6 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.1)] items-center gap-4 sm:gap-6 z-20 whitespace-nowrap overflow-x-auto max-w-[90vw] scrollbar-hide">
                <div className="flex items-center gap-2 text-[11px] sm:text-[13px] font-medium text-[var(--text-muted)]"><Move3d size={16} strokeWidth={2} />{t('Drag')}</div>
                <div className="flex items-center gap-2 text-[11px] sm:text-[13px] font-medium text-[var(--text-muted)]"><Rotate3d size={16} strokeWidth={2} />{t('Rotate')}</div>
                <div className="flex items-center gap-2 text-[11px] sm:text-[13px] font-medium text-[var(--text-muted)]"><Maximize2 size={16} strokeWidth={2} />{t('Zoom')}</div>
                <div className="flex items-center gap-2 text-[11px] sm:text-[13px] font-medium text-[var(--text-muted)]"><RotateCcw size={16} strokeWidth={2} />{t('Reset')}</div>
              </div>

              {/* Floating Subject Buttons Overlay */}
            </div>
          </section>
        ) : (
          <HeroSkeleton theme={theme} />
        )}

        {/* Subject Cards Grid */}
        {displayedSubjects.length === 0 ? (
          <CardGridSkeleton count={Number(safeLocalStorage.getItem('labzero_last_subject_count')) || 4} theme={theme} />
        ) : (
          <>
            <AnimatePresence>
              {showResume && (
                <ResumeCard
                  onSelectSubject={onSelectSubject}
                  onDismiss={() => {
                    setShowResume(false);
                    safeLocalStorage.setItem(RESUME_DISMISS_KEY, String(Date.now()));
                  }}
                />
              )}
            </AnimatePresence>
          <section id="explore" className="min-h-[440px] scroll-mt-24">
            {/* CLASS SELECTION DROPDOWN BAR */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest opacity-60">{t('Curriculum Filter')}</span>
              </div>

              {onSelectClass && (
                <div className="relative w-full sm:w-[180px]">
                  <select
                    value={selectedClass || ''}
                    onChange={(e) => onSelectClass(e.target.value || null)}
                    className="w-full appearance-none rounded-xl border border-[var(--border-glass)] bg-[var(--bg-panel)] px-3.5 py-2.5 pr-9 text-sm font-medium tracking-wide text-[var(--text-primary)] outline-none transition-all hover:border-sky-500/50 focus:border-sky-500 backdrop-blur-md cursor-pointer shadow-sm"
                  >
                    <option value="" className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{t('All Standards')}</option>
                    <option value="Class 9" className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{t('Class 9')}</option>
                    <option value="Class 10" className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{t('Class 10')}</option>
                    <option value="Class 11" className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{t('Class 11')}</option>
                    <option value="Class 12" className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{t('Class 12')}</option>
                  </select>
                  {/* Custom absolute dropdown arrow for clean styling */}
                  <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    ▼
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {displayedSubjects.length === 0 ? (
                // Empty placeholders so the section has height for the Boneyard Skeleton to show
                Array.from({ length: Number(safeLocalStorage.getItem('labzero_last_subject_count')) || 4 }).map((_, i) => (
                  <div key={`ghost-${i}`} className="h-[440px] invisible" />
                ))
              ) : (
                displayedSubjects.map((subject, i) => {
                  // Normalize icon color: prefer backend `iconColor`, but support
                  // arbitrary CSS values like `text-[#8b5cf6]` or `text-[var(--color-accent)]`.
                  let iconClass = subject.iconColor || (subject.color ? `text-${subject.color}-500` : 'text-indigo-500');
                  let iconStyle: React.CSSProperties | undefined = undefined;

                  // If iconClass uses Tailwind arbitrary value syntax `text[...]`, extract and apply inline style
                  const arbitraryMatch = typeof iconClass === 'string' && iconClass.match(/^text-\[(.+)\]$/);
                  if (arbitraryMatch) {
                    iconStyle = { color: arbitraryMatch[1] };
                    // keep a sensible fallback class so sizing/weight remain predictable
                    iconClass = '';
                  }

                  const subjectMeta = {
                    name: subject.name,
                    desc: subject.description || `Explore interactive 3D visualizations and virtual experiments for ${subject.name}.`,
                    img: subject.image_url || 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=400',
                    theme: subject.theme || 'border-[var(--border-glass)]',
                    iconClass,
                    iconStyle,
                  };

                  return (
                    <div
                      key={subject.id}
                      onClick={() => onSelectSubject(subject)}
                      data-tour={i === 0 ? 'subjects' : undefined}
                      data-evaluation-subject-card={String(subject.id)}
                      className="bg-[var(--bg-panel)] rounded-[32px] p-5 sm:p-6 border border-[var(--border-glass)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1 h-auto sm:h-[440px]"
                    >
                      <div className={`w-full h-48 rounded-[24px] bg-white/[0.03] mb-6 overflow-hidden border ${subjectMeta.theme} flex items-center justify-center relative group-hover:bg-white/[0.08] transition-all duration-500`}>
                        <img
                          src={subjectMeta.img}
                          alt={t(subjectMeta.name)}
                          className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-500 saturate-100 brightness-[1.1]"
                        />
                        <div className="absolute inset-0 bg-white/5 group-hover:opacity-0 transition-opacity"></div>
                      </div>

                      <div className="flex flex-col flex-1">
                        <h3 className="text-xl font-display font-semibold mb-3 text-[var(--text-primary)]">{t(subjectMeta.name)}</h3>
                        <p className="text-[var(--text-muted)] text-[15px] leading-relaxed mb-8 flex-1">{t(subjectMeta.desc)}</p>
                        <div
                          className={`flex items-center text-sm font-semibold ${subjectMeta.iconClass || ''} p-0 m-0 uppercase tracking-wide gap-2 group-hover:gap-3 transition-all`}
                          style={subjectMeta.iconStyle}
                        >{t('Explore')}<ArrowRight size={16} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
          </>
        )}

        {/* Theory to Visual */}
        <section id="about" className={`rounded-[32px] p-6 sm:p-8 md:p-12 border transition-all duration-500 flex flex-col xl:flex-row items-stretch gap-8 sm:gap-12 w-full max-w-[1400px] mx-auto overflow-hidden relative scroll-mt-24 ${theme === 'dark'
          ? 'bg-slate-900/40 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-[#FAFBFD] border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
          }`}>

          {/* Left Text */}
          <div className="w-full xl:w-[30%] flex flex-col justify-center min-w-[280px]">
            <span className={`text-[11px] font-bold uppercase tracking-widest mb-4 block ${theme === 'dark' ? 'text-slate-500' : 'text-[#64748b]'}`}>{t('ABSTRACT TO VISUAL')}</span>
            <h2 className={`text-3xl sm:text-4xl md:text-[48px] lg:text-[52px] font-display font-semibold mb-6 sm:mb-8 leading-tight lg:leading-[1.2] tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>{t('From Theory')}<br />{t('to')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">{t('Reality')}</span>
            </h2>
            <p className={`text-sm sm:text-[15px] leading-relaxed mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-[#64748B]'}`}>{t('We bridge the gap between abstract theory and')}<br className="hidden sm:block" />{t('real-world understanding through immersive 3D visualizations.')}</p>
            <button className="text-[#f43f5e] font-medium flex items-center gap-2 hover:gap-3 transition-all text-sm">{t('Learn More')}<ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row items-center justify-end gap-6 lg:gap-8 w-full">

            {/* LEFT CARD: Abstract Theory */}
            <div className={`w-full lg:w-[320px] lg:min-w-[320px] rounded-[20px] p-6 border flex flex-col sm:flex-row lg:flex-col isolate relative h-[450px] sm:h-[380px] lg:h-[450px] overflow-hidden transition-colors duration-500 gap-6 sm:gap-4 lg:gap-0 mx-auto lg:mx-0 ${theme === 'dark'
              ? 'bg-slate-900/80 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
              : 'bg-white border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.03)]'
              }`}>
              <div className="flex flex-col sm:w-[45%] lg:w-full justify-between sm:pb-2 lg:pb-0">
                <div>
                  <h3 className={`text-[17px] font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>{t('Abstract Theory')}</h3>
                  <span className="text-[13px] font-medium text-[#f43f5e] mb-4 sm:mb-2 lg:mb-6 block">{t('Electric Field')}</span>
                </div>

                {/* Equation moved to left on Tablet */}
                <div className="hidden sm:flex lg:hidden flex-col items-center py-4 bg-slate-400/5 rounded-2xl border border-slate-400/10">
                  <div className={`flex items-center gap-2 font-serif text-[1.2rem] leading-none ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>
                    <span className="relative"><span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[0.7rem]">→</span>E</span>
                    <span>=</span>
                    <div className="flex flex-col items-center text-[0.9rem]">
                      <span className="border-b px-1">1</span>
                      <span>4π<span className="italic font-sans">ε</span><sub>0</sub></span>
                    </div>
                    <div className="flex flex-col items-center text-[0.9rem]">
                      <span className="border-b px-1">q</span>
                      <span>r<sup>2</sup></span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="relative">
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[0.8rem]">^</span>{t('r')}</span>
                    </div>
                  </div>
                </div>

                <p className={`text-[12px] lg:text-[13px] leading-relaxed hidden sm:block lg:hidden ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{t('Inverse-square law relationship.')}</p>
              </div>

              <div className="flex-1 flex flex-col opacity-95 sm:w-[55%] lg:w-full justify-center lg:justify-start">
                {/* Equation only shown here on Mobile & Desktop */}
                <div className="sm:hidden lg:flex flex-col items-center">
                  <div className={`flex justify-center items-center gap-4 font-serif text-[1.5rem] sm:text-[1.75rem] leading-none mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>
                    <div className="flex flex-col items-center">
                      <span className="relative">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[1rem]">→</span>{t('E')}</span>
                    </div>
                    <span>=</span>
                    <div className="flex flex-col items-center justify-center">
                      <span className={`border-b px-1 pb-1 ${theme === 'dark' ? 'border-white' : 'border-[#0F172A]'}`}>1</span>
                      <span className="pt-1">4π<span className="italic font-sans">ε</span><sub className="text-[1rem]">0</sub></span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className={`border-b px-1 pb-1 ${theme === 'dark' ? 'border-white' : 'border-[#0F172A]'}`}>q</span>
                      <span className="pt-1">r<sup className="text-[1rem]">2</sup></span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="relative">
                        <span className="absolute -top-[1.1rem] left-1/2 -translate-x-1/2 text-[1.2rem]">^</span>{t('r')}</span>
                    </div>
                  </div>
                  <p className={`text-[13px] text-center mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-[#64748B]'}`}>{t('Electric field due to a point charge.')}</p>
                </div>

                <div className="w-full flex-1 relative min-h-0 max-w-[240px] sm:max-w-[380px] lg:max-w-[280px] mx-auto">
                  <InverseSquareGraph theme={theme} />
                </div>
              </div>
            </div>

            {/* CONNECTOR ELEMENT */}
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 z-10 -my-4 lg:my-0 lg:-mx-12 rotate-90 lg:rotate-0 transition-all ${theme === 'dark'
              ? 'bg-slate-900 border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.4)]'
              : 'bg-white border-[#E2E8F0] shadow-[0_4px_15px_rgba(0,0,0,0.05)]'
              }`}>
              <ArrowRight strokeWidth={2.5} className="w-5 h-5 text-[#f43f5e]" />
            </div>

            {/* RIGHT CARD: 3D Visualization */}
            <div className={`w-full lg:flex-1 mx-auto lg:mx-0 rounded-[20px] p-6 border h-[450px] sm:h-[380px] lg:h-[450px] relative isolate flex flex-col transition-colors duration-500 ${theme === 'dark'
              ? 'bg-slate-900/80 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
              : 'bg-white border-[#F1F5F9] shadow-[0_12px_40px_rgba(0,0,0,0.04)]'
              }`}>
              <div className="flex justify-between items-start mb-2 relative z-20">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#f43f5e] mb-1">3D Visualization</h3>
                  <span className={`text-[13px] block ${theme === 'dark' ? 'text-slate-400' : 'text-[#64748B]'}`}>{t('Electric Dipole Field')}</span>
                </div>
                <button className={`w-9 h-9 rounded-xl border flex items-center justify-center text-[#14B8A6] transition-colors ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-[#E2E8F0] hover:bg-slate-50'
                  }`}>
                  <Maximize2 size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="absolute inset-0 pt-20 px-4 pb-4">
                {shouldLoadHeroWidgets ? (
                  <SuspendedElectricFieldSimulation theme={theme} />
                ) : (
                  <ElectricFieldSimulationFallback />
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Live Simulations Row */}
        <section id="simulations" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('Try it yourself')}</span>
              <h2 className="text-3xl font-display font-bold mt-2 text-[var(--text-primary)]">{t('Try Live Simulations')}</h2>
            </div>
            <button className="text-[var(--color-secondary)] font-medium flex items-center gap-2 text-sm hover:underline">{t('View All Simulations')}<ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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

        {/* Stats Row */}
        <section className="bg-[var(--bg-panel)] rounded-[32px] md:rounded-full py-8 md:py-4 px-6 md:px-10 border border-[var(--border-glass)] shadow-sm grid grid-cols-2 place-items-center md:flex md:flex-row justify-between items-center gap-y-10 gap-x-4 md:gap-4 lg:gap-8 max-w-5xl mx-auto mb-10 overflow-hidden sm:overflow-visible">
          {/* Stat 1 */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 lg:gap-4 w-full md:w-auto text-center md:text-left">
            <div className="w-10 h-10 md:w-9 md:h-9 lg:w-12 lg:h-12 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 flex items-center justify-center text-[var(--color-primary)] shrink-0"><Maximize2 className="w-5 h-5 lg:w-6 lg:h-6" /></div>
            <div className="flex flex-col">
              <h4 className="text-lg md:text-base lg:text-xl font-bold text-[var(--text-primary)] leading-tight">{stats.subjects}</h4>
              <p className="text-[9px] lg:text-[10px] text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">{t('Domains')}</p>
            </div>
          </div>

          <div className="hidden lg:block w-px h-8 bg-[var(--border-glass)]" />

          {/* Stat 2 */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 lg:gap-4 w-full md:w-auto text-center md:text-left">
            <div className="w-10 h-10 md:w-9 md:h-9 lg:w-12 lg:h-12 rounded-full border border-green-500/30 bg-green-500/5 flex items-center justify-center text-green-500 shrink-0"><Layers className="w-5 h-5 lg:w-6 lg:h-6" /></div>
            <div className="flex flex-col">
              <h4 className="text-lg md:text-base lg:text-xl font-bold text-[var(--text-primary)] leading-tight">{stats.topics}</h4>
              <p className="text-[9px] lg:text-[10px] text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">{t('Modules')}</p>
            </div>
          </div>

          <div className="hidden lg:block w-px h-8 bg-[var(--border-glass)]" />

          {/* Stat 3 */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 lg:gap-4 w-full md:w-auto text-center md:text-left">
            <div className="w-10 h-10 md:w-9 md:h-9 lg:w-12 lg:h-12 rounded-full border border-amber-500/30 bg-amber-500/5 flex items-center justify-center text-amber-500 shrink-0"><Users className="w-5 h-5 lg:w-6 lg:h-6" /></div>
            <div className="flex flex-col">
              <h4 className="text-lg md:text-base lg:text-xl font-bold text-[var(--text-primary)] leading-tight">{stats.students}+</h4>
              <p className="text-[9px] lg:text-[10px] text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">{t('Active Learners')}</p>
            </div>
          </div>

          <div className="hidden lg:block w-px h-8 bg-[var(--border-glass)]" />

          {/* Stat 4 */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 lg:gap-4 w-full md:w-auto text-center md:text-left">
            <div className="w-10 h-10 md:w-9 md:h-9 lg:w-12 lg:h-12 rounded-full border border-rose-500/30 bg-rose-500/5 flex items-center justify-center text-rose-500 shrink-0"><Star className="w-5 h-5 lg:w-6 lg:h-6" /></div>
            <div className="flex flex-col">
              <h4 className="text-lg md:text-base lg:text-xl font-bold text-[var(--text-primary)] leading-tight">{stats.average_rating}</h4>
              <p className="text-[9px] lg:text-[10px] text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">{t('Satisfaction')}</p>
            </div>
          </div>
        </section>

      </main>
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
