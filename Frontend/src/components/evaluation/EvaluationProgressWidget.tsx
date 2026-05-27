import { useRef, useState } from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronsDown,
  LayoutDashboard,
  Lock,
  LogIn,
  MessageSquareText,
  MonitorPlay,
  Route,
  Sparkles,
  Video,
} from 'lucide-react';
import { useEvaluationProgress } from '../../hooks/useEvaluationProgress';
import type { EvaluationProgressState } from '../../store/evaluationStore';

const checklist: Array<{
  key: keyof EvaluationProgressState;
  label: string;
  icon: typeof CheckCircle2;
}> = [
  { key: 'tourCompleted', label: 'Onboarding', icon: Sparkles },
  { key: 'loginCompleted', label: 'Login', icon: LogIn },
  { key: 'dashboardVisited', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'videoCallViewed', label: 'Video Calling', icon: Video },
  { key: 'subjectViewed', label: 'Subject View', icon: BookOpenCheck },
  { key: 'simulationViewed', label: 'Simulation View', icon: MonitorPlay },
];

interface EvaluationProgressWidgetProps {
  theme: 'dark' | 'light';
  onOpenFeedback?: () => void;
}

const EvaluationProgressWidget = ({
  theme,
  onOpenFeedback,
}: EvaluationProgressWidgetProps) => {
  const { progress, completionPercentage, feedbackUnlocked, notify } = useEvaluationProgress();
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const isLight = theme === 'light';

  const handleStartTour = () => {
    window.dispatchEvent(new CustomEvent('labzero:start-guide-tour'));
  };

  const handleScrollDown = () => {
    panelRef.current?.scrollTo({
      top: panelRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleFeedbackClick = () => {
    if (!feedbackUnlocked) {
      notify('Complete the guide tour progress to unlock feedback.', 'warning');
      return;
    }

    onOpenFeedback?.();
  };

  return (
    <div className="fixed bottom-24 right-6 z-[140] flex flex-col items-end gap-3">
      {expanded && (
        <section
          ref={panelRef}
          className={`max-h-[calc(100vh-17rem)] w-[min(calc(100vw-3rem),320px)] overflow-y-auto rounded-3xl border backdrop-blur-xl ${
            isLight
              ? 'border-slate-200 bg-white/95 text-slate-950 shadow-[0_20px_70px_rgba(15,23,42,0.16)]'
              : 'border-white/10 bg-slate-950/90 text-white shadow-[0_20px_70px_rgba(0,0,0,0.42)]'
          }`}
        >
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white">
                <Route className="h-5 w-5" />
                <span className="absolute -right-2 -top-2 rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-black text-slate-950">
                  {completionPercentage}%
                </span>
              </div>
              <div>
                <p className="text-sm font-black">Guide Tour</p>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {completionPercentage === 100 ? 'Tour progress complete' : 'Tour progress'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Collapse guide tour progress"
              className="grid h-9 w-9 place-items-center rounded-xl text-current opacity-70 transition hover:bg-current/10 hover:opacity-100"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleScrollDown}
            aria-label="Scroll down guide tour progress"
            title="Scroll down"
            className={`mx-4 mb-3 flex h-9 w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-2xl border text-xs font-black transition ${
              isLight
                ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ChevronsDown className="h-4 w-4" />
            Scroll down
          </button>

          <div className="h-1.5 w-full bg-slate-200/30">
            <div
              className="h-full rounded-r-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="grid gap-2 p-4 pt-3">
            {checklist.map((item) => {
              const Icon = item.icon;
              const complete = progress[item.key];

              return (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm ${
                    complete
                      ? isLight
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                      : isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-600'
                        : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 font-semibold">{item.label}</span>
                  {complete ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-40" />
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleStartTour}
              className="mt-1 flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
            >
              <Route className="h-4 w-4" />
              Start tour
            </button>

            <button
              type="button"
              onClick={handleFeedbackClick}
              className={`flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition ${
                feedbackUnlocked
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400'
                  : isLight
                    ? 'border border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {feedbackUnlocked ? (
                <MessageSquareText className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {feedbackUnlocked ? 'Open feedback' : 'Feedback locked'}
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-label={expanded ? 'Hide guide tour progress' : 'Show guide tour progress'}
        title="Guide Tour"
        data-tour="onboarding"
        className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isLight
            ? 'border-slate-200 bg-white/90 text-indigo-700 shadow-[0_18px_45px_rgba(15,23,42,0.16)] hover:bg-indigo-50 focus-visible:ring-indigo-500 focus-visible:ring-offset-white'
            : 'border-white/10 bg-slate-900/90 text-cyan-200 shadow-[0_18px_45px_rgba(0,0,0,0.38)] hover:border-cyan-300/30 hover:bg-slate-800 focus-visible:ring-cyan-300 focus-visible:ring-offset-slate-950'
        }`}
      >
        <Route className="h-6 w-6" />
        <Sparkles className="absolute right-2 top-2 h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default EvaluationProgressWidget;
