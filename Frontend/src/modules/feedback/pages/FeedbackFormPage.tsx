import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, Resolver, useForm } from 'react-hook-form';
import FeedbackPageShell from '../components/common/FeedbackPageShell';
import FeedbackSkeleton from '../components/common/FeedbackSkeleton';
import FeedbackSection from '../components/FeedbackSection';
import ProgressBar from '../components/ProgressBar';
import SubmitConfirmationModal from '../components/SubmitConfirmationModal';
import { useFeedbackForm } from '../hooks/useFeedbackForm';
import { FeedbackFormValues } from '../types/feedback.types';
import {
  buildFeedbackSchema,
  getAllQuestions,
  getDefaultAnswers,
} from '../utils/feedbackValidation';
import { safeLocalStorage } from '../../../utils/safeStorage';
import type { FeedbackThankYouDetails } from './FeedbackThankYouPage';

interface FeedbackFormPageProps {
  formId?: string;
  onBack?: () => void;
  onSubmitted?: (details?: FeedbackThankYouDetails) => void;
}

const getFormIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('feedbackFormId') || params.get('formId') || '';
};

const isAnswered = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return typeof value === 'string' && value.trim().length > 0;
};

const getDraftValues = (
  draftKey: string,
  defaultValues: FeedbackFormValues,
  maxSectionIndex: number
) => {
  const rawDraft = safeLocalStorage.getItem(draftKey);
  if (!rawDraft) {
    return { values: defaultValues, activeSectionIndex: 0 };
  }

  try {
    const draft = JSON.parse(rawDraft) as {
      values?: FeedbackFormValues;
      activeSectionIndex?: number;
    };
    const draftAnswers = draft.values?.answers ?? {};

    return {
      values: {
        anonymous: Boolean(draft.values?.anonymous),
        answers: Object.fromEntries(
          Object.entries(defaultValues.answers).map(([questionId, fallback]) => [
            questionId,
            Object.prototype.hasOwnProperty.call(draftAnswers, questionId)
              ? draftAnswers[questionId]
              : fallback,
          ])
        ) as FeedbackFormValues['answers'],
      },
      activeSectionIndex: Math.min(
        Math.max(Number(draft.activeSectionIndex ?? 0), 0),
        maxSectionIndex
      ),
    };
  } catch {
    safeLocalStorage.removeItem(draftKey);
    return { values: defaultValues, activeSectionIndex: 0 };
  }
};

const FeedbackFormPage = ({ formId, onBack, onSubmitted }: FeedbackFormPageProps) => {
  const resolvedFormId = formId || getFormIdFromUrl();
  const {
    form,
    questionCount,
    isLoading,
    isSubmitting,
    error,
    successMessage,
    reload,
    submitFeedback,
  } = useFeedbackForm(resolvedFormId);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [hasSubmissionSuccess, setHasSubmissionSuccess] = useState(false);
  const draftKey = `labzero_feedback_form_draft_${resolvedFormId}`;

  const schema = useMemo(
    () => (form ? buildFeedbackSchema(form) : undefined),
    [form]
  );
  const defaultValues = useMemo<FeedbackFormValues>(
    () => ({
      anonymous: false,
      answers: form ? getDefaultAnswers(form) : {},
    }),
    [form]
  );

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    values: defaultValues,
    resolver: schema
      ? (zodResolver(schema) as Resolver<FeedbackFormValues>)
      : undefined,
    mode: 'onBlur',
  });

  const watchedValues = watch();
  const sections = useMemo(
    () => form?.sections.slice().sort((a, b) => a.order - b.order) ?? [],
    [form]
  );
  const activeSection = sections[activeSectionIndex];
  const allQuestions = useMemo(() => (form ? getAllQuestions(form) : []), [form]);
  const answeredCount = allQuestions.filter((question) =>
    isAnswered(watchedValues.answers?.[question._id])
  ).length;

  useEffect(() => {
    if (!form) {
      return;
    }

    setIsDraftReady(false);
    const draft = getDraftValues(
      draftKey,
      defaultValues,
      Math.max(sections.length - 1, 0)
    );
    reset(draft.values);
    setActiveSectionIndex(draft.activeSectionIndex);
    setIsDraftReady(true);
  }, [defaultValues, draftKey, form, reset, sections.length]);

  useEffect(() => {
    if (!form || !isDraftReady || successMessage) {
      return;
    }

    safeLocalStorage.setItem(
      draftKey,
      JSON.stringify({
        values: watchedValues,
        activeSectionIndex,
      })
    );
  }, [activeSectionIndex, draftKey, form, isDraftReady, successMessage, watchedValues]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    safeLocalStorage.removeItem(draftKey);
  }, [draftKey, successMessage]);

  const validateActiveSection = async () => {
    if (!activeSection) {
      return false;
    }

    const fieldNames = activeSection.questions.map(
      (question) => `answers.${question._id}` as const
    );
    return trigger(fieldNames);
  };

  const goNext = async () => {
    const valid = await validateActiveSection();
    if (valid) {
      setActiveSectionIndex((index) => Math.min(index + 1, sections.length - 1));
    }
  };

  const openConfirmation = handleSubmit(() => setShowConfirmation(true));

  const confirmSubmit = handleSubmit(async (values) => {
    await submitFeedback(values);
    safeLocalStorage.removeItem(draftKey);
    setShowConfirmation(false);
    if (onSubmitted) {
      onSubmitted({
        title: 'Thank you',
        message: 'Your feedback has been submitted successfully.',
        formTitle: form?.title,
        primaryActionLabel: 'Back to LabZero',
      });
      return;
    }
    setHasSubmissionSuccess(true);
  });

  if (!resolvedFormId) {
    return (
      <FeedbackPageShell>
        <ErrorState
          title="Missing feedback form"
          message="Open this page with a feedbackFormId or pass a formId prop."
          onRetry={undefined}
        />
      </FeedbackPageShell>
    );
  }

  if (isLoading) {
    return (
      <FeedbackPageShell>
        <FeedbackSkeleton rows={3} />
      </FeedbackPageShell>
    );
  }

  if (!form || error) {
    return (
      <FeedbackPageShell>
        <ErrorState
          title="Feedback form unavailable"
          message={error || 'The form could not be loaded.'}
          onRetry={reload}
        />
      </FeedbackPageShell>
    );
  }

  if (hasSubmissionSuccess) {
    return (
      <FeedbackPageShell tone="emerald">
        <ThankYouState
          formTitle={form.title}
          message={successMessage}
          anonymous={watchedValues.anonymous}
          answeredCount={answeredCount}
          totalQuestions={questionCount}
          onBack={onBack}
        />
      </FeedbackPageShell>
    );
  }

  return (
    <FeedbackPageShell>
      <form
        onSubmit={openConfirmation}
        className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
      >
        <header className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                LabZero Feedback
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                {form.title}
              </h1>
              {form.description && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {form.description}
                </p>
              )}
            </div>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
          </div>

          {form.anonymousAllowed && (
            <Controller
              control={control}
              name="anonymous"
              render={({ field }) => (
                <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Submit anonymously
                    </span>
                    <span className="block text-xs text-slate-500">
                      Hide your profile details from this response.
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`relative h-7 w-12 rounded-full transition ${
                      field.value ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                    aria-pressed={field.value}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                        field.value ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </label>
              )}
            />
          )}
        </header>

        <ProgressBar
          completed={answeredCount}
          total={questionCount}
          currentSection={activeSectionIndex + 1}
          totalSections={sections.length}
        />

        <AnimatePresence mode="wait">
          {activeSection && (
            <FeedbackSection
              key={activeSection.title}
              section={activeSection}
              sectionIndex={activeSectionIndex}
              totalSections={sections.length}
              control={control}
              errors={errors}
              disabled={isSubmitting}
            />
          )}
        </AnimatePresence>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="sticky bottom-0 -mx-4 border-t border-slate-200/80 bg-slate-50/90 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() =>
                setActiveSectionIndex((index) => Math.max(index - 1, 0))
              }
              disabled={activeSectionIndex === 0 || isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Previous
            </button>

            {activeSectionIndex < sections.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Submit feedback
              </button>
            )}
          </div>
        </div>
      </form>

      <SubmitConfirmationModal
        open={showConfirmation}
        isSubmitting={isSubmitting}
        answeredCount={answeredCount}
        totalQuestions={questionCount}
        anonymous={watchedValues.anonymous}
        onCancel={() => setShowConfirmation(false)}
        onConfirm={confirmSubmit}
      />
    </FeedbackPageShell>
  );
};

const ErrorState = ({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) => (
  <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
    <div className="w-full rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle size={24} />
      </div>
      <h1 className="mt-4 text-xl font-bold text-slate-950">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Try again
        </button>
      )}
    </div>
  </div>
);

const ThankYouState = ({
  formTitle,
  message,
  anonymous,
  answeredCount,
  totalQuestions,
  onBack,
}: {
  formTitle: string;
  message: string | null;
  anonymous: boolean;
  answeredCount: number;
  totalQuestions: number;
  onBack?: () => void;
}) => {
  const completion =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 100;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-x-6 top-8 h-2 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-300 opacity-80" />
      <div className="absolute left-8 top-24 h-5 w-5 rotate-12 rounded-md bg-amber-300 shadow-lg shadow-amber-200/70" />
      <div className="absolute right-10 top-32 h-6 w-6 -rotate-12 rounded-md bg-cyan-400 shadow-lg shadow-cyan-200/70" />
      <div className="absolute bottom-16 left-12 h-6 w-6 rotate-45 rounded-md bg-emerald-400 shadow-lg shadow-emerald-200/70" />
      <div className="absolute bottom-20 right-16 h-5 w-5 -rotate-6 rounded-md bg-fuchsia-400 shadow-lg shadow-fuchsia-200/70" />

      <section className="relative w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-6 text-center shadow-2xl shadow-emerald-100/70 backdrop-blur sm:p-10">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500" />
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-500 text-white shadow-xl shadow-emerald-200/80">
          <CheckCircle2 size={42} />
        </div>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
          <Sparkles size={14} />
          Response Received
        </div>

        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
          Thank You!
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          {message || 'Your feedback has been submitted successfully.'} Your
          thoughtful response to <span className="font-bold text-slate-900">{formTitle}</span>{' '}
          will help us improve LabZero for every learner, teacher, and institute.
        </p>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-4">
            <p className="text-2xl font-black text-cyan-700">{answeredCount}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-cyan-800/70">
              Answers Shared
            </p>
          </div>
          <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 px-4 py-4">
            <p className="text-2xl font-black text-fuchsia-700">{completion}%</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-fuchsia-800/70">
              Form Complete
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
            <p className="text-2xl font-black text-amber-700">
              {anonymous ? 'Private' : 'Profile'}
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-amber-800/70">
              Submission Mode
            </p>
          </div>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white shadow-lg shadow-slate-300/80 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <Home size={17} />
            Back to LabZero
          </button>
        )}
      </section>
    </div>
  );
};

export default FeedbackFormPage;
