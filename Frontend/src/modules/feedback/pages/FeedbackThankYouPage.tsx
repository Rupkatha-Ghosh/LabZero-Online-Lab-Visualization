import { Home, RotateCcw } from 'lucide-react';
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

const floralMarks = [
  { className: 'left-[11%] top-[21%] rotate-[-18deg]', tone: 'rose' },
  { className: 'left-[30%] top-[8%] rotate-[14deg]', tone: 'mint' },
  { className: 'left-[47%] top-[35%] rotate-[-10deg]', tone: 'rose' },
  { className: 'right-[26%] top-[16%] rotate-[18deg]', tone: 'mint' },
  { className: 'right-[10%] top-[23%] rotate-[24deg]', tone: 'rose' },
  { className: 'right-[37%] bottom-[11%] rotate-[-20deg]', tone: 'mint' },
];

const Flower = ({ className, tone }: { className: string; tone: string }) => (
  <span
    aria-hidden="true"
    className={`feedback-thanks-flower feedback-thanks-flower-${tone} absolute ${className}`}
  >
    <span />
    <span />
    <span />
    <span />
  </span>
);

const FeedbackThankYouPage = ({
  details,
  onBack,
  onSubmitAnother,
}: FeedbackThankYouPageProps) => {
  const message =
    details?.message ||
    'Thanks for reaching out. Your feedback has been received, and it will help us improve the LabZero experience.';

  return (
    <FeedbackPageShell tone="emerald">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <section className="feedback-thanks-stage w-full text-center">
          <div className="relative mx-auto w-full max-w-3xl pb-3 pt-8">
            <div
              aria-hidden="true"
              className="feedback-thanks-vine left-[8%] top-[28%] w-[84%]"
            />
            <div
              aria-hidden="true"
              className="feedback-thanks-vine left-[20%] top-[50%] w-[62%] rotate-[-4deg]"
            />

            {floralMarks.map((flower) => (
              <Flower
                key={`${flower.tone}-${flower.className}`}
                className={flower.className}
                tone={flower.tone}
              />
            ))}

            <h1 className="feedback-thanks-heading relative mx-auto max-w-3xl text-[clamp(4.5rem,16vw,9.5rem)] font-black uppercase leading-[0.78] tracking-normal">
              <span className="block">Thank</span>
              <span className="block">You</span>
            </h1>
          </div>

          <div className="mx-auto mt-6 max-w-xl">
            <p className="text-base font-semibold text-slate-950">
              {details?.title || 'Thanks for reaching out!'}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {message}
            </p>

            {details?.formTitle && (
              <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                {details.formTitle}
              </p>
            )}

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
                >
                  <Home size={16} />
                  {details?.primaryActionLabel || 'Back to Home'}
                </button>
              )}
              {onSubmitAnother && (
                <button
                  type="button"
                  onClick={onSubmitAnother}
                  className="inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RotateCcw size={16} />
                  {details?.secondaryActionLabel || 'Submit another'}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </FeedbackPageShell>
  );
};

export default FeedbackThankYouPage;
