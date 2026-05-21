import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Loader2, X } from 'lucide-react';

interface SubmitConfirmationModalProps {
  open: boolean;
  isSubmitting?: boolean;
  answeredCount: number;
  totalQuestions: number;
  anonymous: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const SubmitConfirmationModal = ({
  open,
  isSubmitting,
  answeredCount,
  totalQuestions,
  anonymous,
  onCancel,
  onConfirm,
}: SubmitConfirmationModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[220] flex items-end justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Submit feedback?
                </h2>
                <p className="text-sm text-slate-500">
                  {answeredCount} of {totalQuestions} questions answered
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              aria-label="Close confirmation"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            Your response will be submitted{' '}
            <span className="font-semibold text-slate-900">
              {anonymous ? 'anonymously' : 'with your LabZero profile'}
            </span>
            . You can review your answers before confirming.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Review
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Submit
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default SubmitConfirmationModal;
