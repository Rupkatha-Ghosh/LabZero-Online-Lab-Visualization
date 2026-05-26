import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { useEvaluationProgress } from '../../hooks/useEvaluationProgress';

const toneIcon = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

const toneClass = {
  success: 'border-emerald-400/40 bg-emerald-500/95 text-white',
  info: 'border-cyan-300/40 bg-slate-950/95 text-cyan-50',
  warning: 'border-amber-300/50 bg-amber-500/95 text-slate-950',
};

const EvaluationToasts = () => {
  const { toasts, dismissToast } = useEvaluationProgress();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-[260] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
    >
      {toasts.map((toast) => {
        const Icon = toneIcon[toast.tone ?? 'info'];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 ${toneClass[toast.tone ?? 'info']}`}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="min-w-0 flex-1 text-sm font-semibold leading-5">{toast.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
              className="rounded-lg p-1 opacity-70 transition hover:bg-white/15 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default EvaluationToasts;
