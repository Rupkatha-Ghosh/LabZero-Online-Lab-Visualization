import { FormEvent, useMemo, useState } from 'react';
import { AlertCircle, Bug, CheckCircle2, Lock, Send, Star, X } from 'lucide-react';
import { useEvaluationProgress } from '../../hooks/useEvaluationProgress';
import type { EvaluationFeedbackSubmission } from '../../store/evaluationStore';

interface EvaluationFeedbackFormProps {
  open: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

const ratingFields = [
  { id: 'dashboardRating', label: 'Dashboard experience rating' },
  { id: 'uploadRating', label: 'Upload experience rating' },
  { id: 'analysisRating', label: 'Analysis usefulness rating' },
  { id: 'uiRating', label: 'UI/UX rating' },
] as const;

const initialFormState: EvaluationFeedbackSubmission = {
  dashboardRating: 0,
  uploadRating: 0,
  analysisRating: 0,
  uiRating: 0,
  suggestions: '',
  bugReport: '',
};

const EvaluationFeedbackForm = ({ open, onClose, theme }: EvaluationFeedbackFormProps) => {
  const { feedbackUnlocked, submitFeedback, notify, metadata } = useEvaluationProgress();
  const [form, setForm] = useState<EvaluationFeedbackSubmission>(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const isLight = theme === 'light';

  const isValid = useMemo(
    () =>
      ratingFields.every((field) => form[field.id] > 0) &&
      form.suggestions.trim().length >= 10,
    [form],
  );

  if (!open) return null;

  const updateRating = (field: (typeof ratingFields)[number]['id'], value: number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!feedbackUnlocked) {
      notify('Complete onboarding and required tasks before submitting feedback.', 'warning');
      return;
    }

    if (!isValid) {
      notify('Please complete all ratings and add at least 10 characters of suggestions.', 'warning');
      return;
    }

    submitFeedback({ ...form, suggestions: form.suggestions.trim(), bugReport: form.bugReport?.trim() });
    setSubmitted(true);
  };

  const panelClass = isLight
    ? 'border-slate-200 bg-white text-slate-950 shadow-[0_28px_90px_rgba(15,23,42,0.18)]'
    : 'border-white/10 bg-slate-950 text-slate-50 shadow-[0_28px_90px_rgba(0,0,0,0.52)]';
  const inputClass = isLight
    ? 'border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-200'
    : 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:ring-cyan-300/20';

  return (
    <div className="fixed inset-0 z-[240] flex items-end justify-center bg-slate-950/65 px-3 py-4 backdrop-blur-md sm:items-center">
      <form
        onSubmit={handleSubmit}
        className={`max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border p-5 transition sm:p-6 ${panelClass}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-indigo-400">
              {feedbackUnlocked ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              Guided Evaluation
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight">LabZero evaluation feedback</h2>
            <p className={`mt-2 max-w-2xl text-sm leading-6 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Feedback unlocks after onboarding and all required exploration tasks are complete.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close evaluation feedback"
            className={`rounded-2xl border p-2 transition ${isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-white/10 hover:bg-white/10'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!feedbackUnlocked && (
          <div className={`mt-5 flex gap-3 rounded-2xl border p-4 text-sm ${isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-300/20 bg-amber-300/10 text-amber-100'}`}>
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Feedback is locked until the tour and every required task are complete.</p>
          </div>
        )}

        {submitted || metadata.feedbackSubmittedAt ? (
          <div className={`mt-6 rounded-3xl border p-6 text-center ${isLight ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-300/20 bg-emerald-300/10'}`}>
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h3 className="mt-3 text-xl font-black">Thanks, feedback received.</h3>
            <p className={`mt-2 text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Your evaluation response is stored locally and ready to forward to the backend analytics pipeline.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {ratingFields.map((field) => (
                <fieldset
                  key={field.id}
                  disabled={!feedbackUnlocked}
                  className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-white/5'}`}
                >
                  <legend className="px-1 text-sm font-bold">{field.label}</legend>
                  <div className="mt-3 flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateRating(field.id, value)}
                        aria-label={`${field.label}: ${value} out of 5`}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                          value <= form[field.id]
                            ? 'border-amber-400 bg-amber-400 text-slate-950'
                            : isLight
                              ? 'border-slate-200 bg-white text-slate-400 hover:text-amber-500'
                              : 'border-white/10 bg-slate-950/50 text-slate-500 hover:text-amber-300'
                        }`}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            <label className="mt-5 block text-sm font-bold" htmlFor="evaluation-suggestions">
              Open text suggestions
            </label>
            <textarea
              id="evaluation-suggestions"
              disabled={!feedbackUnlocked}
              value={form.suggestions}
              onChange={(event) => setForm((current) => ({ ...current, suggestions: event.target.value }))}
              rows={4}
              className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${inputClass}`}
              placeholder="Share what felt useful, confusing, slow, or missing."
            />

            <label className="mt-5 flex items-center gap-2 text-sm font-bold" htmlFor="evaluation-bug">
              <Bug className="h-4 w-4" />
              Optional bug reporting
            </label>
            <textarea
              id="evaluation-bug"
              disabled={!feedbackUnlocked}
              value={form.bugReport}
              onChange={(event) => setForm((current) => ({ ...current, bugReport: event.target.value }))}
              rows={3}
              className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${inputClass}`}
              placeholder="Describe any issue, browser/device details, and what you expected to happen."
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-2xl border px-5 py-3 text-sm font-bold transition ${isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-white/10 hover:bg-white/10'}`}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!feedbackUnlocked}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
                Submit feedback
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default EvaluationFeedbackForm;
