import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileUp,
  LayoutDashboard,
  Lock,
  LogIn,
  MessageSquareText,
  Sparkles,
  BookOpenCheck,
} from 'lucide-react';
import { useEvaluationProgress } from '../../hooks/useEvaluationProgress';
import type { EvaluationProgressState, EvaluationTaskKey } from '../../store/evaluationStore';
import type { UserRole } from '../../types/types';
import EvaluationFeedbackForm from './EvaluationFeedbackForm';

interface EvaluationProgressWidgetProps {
  theme: 'dark' | 'light';
  userRole?: UserRole;
  onOpenLogin?: () => void;
  onOpenDashboard?: () => void;
  onOpenSubjects?: () => void;
}

const buildChecklist = (userRole?: UserRole): Array<{
  key: keyof EvaluationProgressState;
  label: string;
  icon: typeof CheckCircle2;
}> => [
  { key: 'tourCompleted', label: 'Onboarding', icon: Sparkles },
  { key: 'loginCompleted', label: 'Login', icon: LogIn },
  { key: 'dashboardVisited', label: 'Visit Dashboard', icon: LayoutDashboard },
  {
    key: 'uploadDone',
    label: userRole === 'student' ? 'See the file' : 'Upload a file',
    icon: FileUp,
  },
  { key: 'subjectsChecked', label: 'Checked the subjects', icon: BookOpenCheck },
];

const getTaskFallbackLabel = (
  task: EvaluationTaskKey | null,
  userRole?: UserRole,
) => {
  if (!task) return 'Finish onboarding';

  const labels: Record<EvaluationTaskKey, string> = {
    loginCompleted: 'Log in',
    dashboardVisited: 'Open Dashboard',
    uploadDone: userRole === 'student' ? 'Open a shared file' : 'Upload a file',
    subjectsChecked: 'Review subject cards',
  };

  return labels[task];
};

const EvaluationProgressWidget = ({
  theme,
  userRole,
  onOpenLogin,
  onOpenDashboard,
  onOpenSubjects,
}: EvaluationProgressWidgetProps) => {
  const { progress, completionPercentage, feedbackUnlocked, notify } = useEvaluationProgress();
  const [expanded, setExpanded] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const isLight = theme === 'light';
  const checklist = useMemo(() => buildChecklist(userRole), [userRole]);

  const nextTask = useMemo(() => {
    const item = checklist.find((entry) => !progress[entry.key]);
    if (!item || item.key === 'tourCompleted') return null;
    return item.key as EvaluationTaskKey;
  }, [progress]);

  const handleFeedbackClick = () => {
    if (!feedbackUnlocked) {
      notify('Complete the guided evaluation checklist to unlock feedback.', 'warning');
    }
    setFeedbackOpen(true);
  };

  const getChecklistAction = (key: keyof EvaluationProgressState) => {
    if (key === 'loginCompleted') return onOpenLogin;
    if (key === 'dashboardVisited') return onOpenDashboard;
    if (key === 'subjectsChecked') return onOpenSubjects;
    return undefined;
  };

  return (
    <>
      <aside
        className={`fixed bottom-4 left-4 right-4 z-[135] overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-300 md:left-auto md:right-6 md:w-[360px] ${
          isLight
            ? 'border-slate-200 bg-white/95 text-slate-950 shadow-[0_20px_70px_rgba(15,23,42,0.16)]'
            : 'border-white/10 bg-slate-950/90 text-white shadow-[0_20px_70px_rgba(0,0,0,0.42)]'
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white">
              <ClipboardCheck className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-black text-slate-950">
                {completionPercentage}%
              </span>
            </div>
            <div>
              <p className="text-sm font-black">Evaluation Progress</p>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {feedbackUnlocked ? 'Feedback unlocked' : getTaskFallbackLabel(nextTask, userRole)}
              </p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 transition ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <div className="h-1.5 w-full bg-slate-200/30">
          <div
            className="h-full rounded-r-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {expanded && (
          <div className="space-y-4 px-4 pb-4 pt-3">
            <div className="grid gap-2">
              {checklist.map((item) => {
                const Icon = item.icon;
                const complete = progress[item.key];
                const action = getChecklistAction(item.key);
                const ChecklistItem = action ? 'button' : 'div';

                return (
                  <ChecklistItem
                    key={item.key}
                    type={action ? 'button' : undefined}
                    onClick={action}
                    data-tour={
                      item.key === 'tourCompleted'
                        ? 'onboarding'
                        : item.key === 'loginCompleted'
                        ? 'login'
                        : item.key === 'dashboardVisited'
                          ? 'dashboard'
                        : item.key === 'uploadDone'
                        ? 'upload'
                        : item.key === 'subjectsChecked'
                          ? 'subjects'
                          : undefined
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
                      complete
                        ? isLight
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                        : isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-600'
                          : 'border-white/10 bg-white/5 text-slate-300'
                    } ${action ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 font-semibold">{item.label}</span>
                    {complete ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-40" />}
                  </ChecklistItem>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFeedbackClick}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                feedbackUnlocked
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500'
                  : isLight
                    ? 'border border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {feedbackUnlocked ? <MessageSquareText className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {feedbackUnlocked ? 'Open feedback form' : 'Feedback locked'}
            </button>
          </div>
        )}
      </aside>

      <EvaluationFeedbackForm
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        theme={theme}
      />
    </>
  );
};

export default EvaluationProgressWidget;
