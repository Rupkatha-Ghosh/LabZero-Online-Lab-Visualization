import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
  Send,
  Star,
} from 'lucide-react';
import { FormEvent } from 'react';
import { useState } from 'react';
import { User } from '../../../types/types';
import FeedbackPageShell from '../components/common/FeedbackPageShell';
import { getFeedbackApiError, submitSiteFeedback } from '../services/feedbackApi';

interface SiteFeedbackPageProps {
  user: User | null;
  theme: 'dark' | 'light';
  canManageFeedback: boolean;
  onBack: () => void;
  onLogin: () => void;
  onManageFeedback: () => void;
}

const SiteFeedbackPage = ({
  user,
  theme,
  canManageFeedback,
  onBack,
  onLogin,
  onManageFeedback,
}: SiteFeedbackPageProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('Could not submit feedback. Please try again.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLight = theme === 'light';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      onLogin();
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      await submitSiteFeedback({
        rating,
        comment: comment.trim(),
      });
      setStatus('success');
      setComment('');
    } catch (submitError) {
      setError(getFeedbackApiError(submitError));
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FeedbackPageShell tone="cyan">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {canManageFeedback && (
            <button
              type="button"
              onClick={onManageFeedback}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <LayoutDashboard size={16} />
              Manage forms
            </button>
          )}
        </div>

        <section className="grid flex-1 gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
              LabZero Feedback
            </p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Help us improve the lab experience
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Share what felt smooth, what slowed you down, or what you want us
              to polish next. Your feedback is saved with your account so the
              team can understand issues clearly.
            </p>

            {!user && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Please sign in before submitting feedback.
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className={`rounded-3xl border p-5 shadow-sm backdrop-blur sm:p-6 ${
              isLight
                ? 'border-slate-200/80 bg-white/90 text-slate-950'
                : 'border-slate-700/70 bg-slate-950/90 text-slate-50'
            }`}
          >
            <div>
              <label
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                Overall rating
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`Rate ${value} out of 5`}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                      value <= rating
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-400 hover:text-amber-500'
                          : 'border-white/10 bg-white/5 text-slate-500 hover:text-amber-300'
                    }`}
                  >
                    <Star
                      size={19}
                      fill={value <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="site-feedback-comment"
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                Feedback
              </label>
              <textarea
                id="site-feedback-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={7}
                placeholder="Tell us what worked well or what should be improved."
                className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                    : 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-cyan-300/15'
                }`}
              />
            </div>

            {status === 'success' && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={17} />
                Feedback submitted. Thank you.
              </div>
            )}

            {status === 'error' && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {!user && (
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sign in
                </button>
              )}
              <button
                type="submit"
                disabled={!user || isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Submit feedback
              </button>
            </div>
          </form>
        </section>
      </div>
    </FeedbackPageShell>
  );
};

export default SiteFeedbackPage;
