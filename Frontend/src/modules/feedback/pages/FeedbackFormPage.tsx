import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence } from 'motion/react';
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, Resolver, useForm } from 'react-hook-form';
import FeedbackPageShell from '../components/common/FeedbackPageShell';
import FeedbackSkeleton from '../components/common/FeedbackSkeleton';
import FeedbackSection from '../components/FeedbackSection';
import ProgressBar from '../components/ProgressBar';
import SubmitConfirmationModal from '../components/SubmitConfirmationModal';
import SuccessNotification from '../components/SuccessNotification';
import { useFeedbackForm } from '../hooks/useFeedbackForm';
import { FeedbackFormValues } from '../types/feedback.types';
import {
  buildFeedbackSchema,
  getAllQuestions,
  getDefaultAnswers,
} from '../utils/feedbackValidation';

interface FeedbackFormPageProps {
  formId?: string;
  onBack?: () => void;
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

const FeedbackFormPage = ({ formId, onBack }: FeedbackFormPageProps) => {
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
    clearSuccess,
  } = useFeedbackForm(resolvedFormId);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const schema = useMemo(
    () => (form ? buildFeedbackSchema(form) : undefined),
    [form]
  );
  const defaultValues = useMemo<FeedbackFormValues>(
    () => ({
      anonymous: form?.anonymousAllowed ?? false,
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

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(clearSuccess, 2600);
    return () => window.clearTimeout(timeout);
  }, [clearSuccess, successMessage]);

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
    setShowConfirmation(false);
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

  return (
    <FeedbackPageShell>
      <SuccessNotification message={successMessage} />
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

export default FeedbackFormPage;
