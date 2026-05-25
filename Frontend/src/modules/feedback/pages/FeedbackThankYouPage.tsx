import { CheckCircle2, Home, RotateCcw } from 'lucide-react';
import FeedbackPageShell from '../components/common/FeedbackPageShell';

export interface FeedbackThankYouDetails {
  title?: string;
  message?: string;
  formTitle?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

interface FeedbackThankYouPageProps {
  details?: FeedbackThankYouDetails;
  onBack?: () => void;
  onSubmitAnother?: () => void;
}

const FeedbackThankYouPage = ({
  details,
  onBack,
  onSubmitAnother,
}: FeedbackThankYouPageProps) => {
  const title = details?.title || 'Thank you';
  const message =
    details?.message ||
    'Your feedback has been submitted successfully.';

  return (
    <FeedbackPageShell tone="emerald">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full border-t-8 border-emerald-500 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-10">
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Response recorded
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {message}
              </p>

              {details?.formTitle && (
                <div className="mt-6 border-l-4 border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {details.formTitle}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    <Home size={16} />
                    {details?.primaryActionLabel || 'Back to LabZero'}
                  </button>
                )}
                {onSubmitAnother && (
                  <button
                    type="button"
                    onClick={onSubmitAnother}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <RotateCcw size={16} />
                    {details?.secondaryActionLabel || 'Submit another response'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </FeedbackPageShell>
  );
};

export default FeedbackThankYouPage;
