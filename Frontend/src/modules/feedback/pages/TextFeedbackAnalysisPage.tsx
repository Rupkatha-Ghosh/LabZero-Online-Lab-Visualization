import { AlertCircle, Loader2, MessageSquareText, RefreshCw } from 'lucide-react';
import FeedbackPageShell from '../components/common/FeedbackPageShell';
import KeywordFrequencyChart from '../components/text-analysis/KeywordFrequencyChart';
import SentimentSummary from '../components/text-analysis/SentimentSummary';
import WordCloud from '../components/text-analysis/WordCloud';
import { useTextFeedbackAnalysis } from '../hooks/useTextFeedbackAnalysis';

interface TextFeedbackAnalysisPageProps {
  formId?: string;
}

const getFormIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('textAnalysisFormId') || params.get('feedbackFormId') || '';
};

const TextFeedbackAnalysisPage = ({ formId }: TextFeedbackAnalysisPageProps) => {
  const resolvedFormId = formId || getFormIdFromUrl();
  const { analysis, isLoading, error, reload } =
    useTextFeedbackAnalysis(resolvedFormId);

  return (
    <FeedbackPageShell tone="indigo">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
                LabZero Text Feedback
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                Text Analysis System
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Extract keywords, frequently used words, and sentiment signals
                from open-ended classroom feedback.
              </p>
            </div>
            <button
              type="button"
              onClick={reload}
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={isLoading ? 'animate-spin' : undefined}
              />
              Refresh
            </button>
          </div>
        </header>

        {!resolvedFormId && (
          <ErrorPanel
            title="Missing form id"
            message="Open this page with textAnalysisFormId or pass a formId prop."
            onRetry={undefined}
          />
        )}

        {resolvedFormId && isLoading && <LoadingPanel />}

        {resolvedFormId && !isLoading && error && (
          <ErrorPanel
            title="Text analysis unavailable"
            message={error}
            onRetry={reload}
          />
        )}

        {analysis && !isLoading && !error && (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Text responses"
                value={analysis.totalTextResponses}
                detail="Open-ended answers analyzed"
              />
              <MetricCard
                label="Keywords"
                value={analysis.keywords.length}
                detail="Ranked by frequency score"
              />
              <MetricCard
                label="Avg sentiment"
                value={analysis.sentiment.averageScore.toFixed(2)}
                detail="Positive minus negative signal"
              />
            </section>

            <SentimentSummary
              sentiment={analysis.sentiment}
              totalResponses={analysis.totalTextResponses}
            />

            <section className="grid gap-5 xl:grid-cols-2">
              <DashboardCard title="Word Cloud" subtitle="Frequently used words">
                <WordCloud words={analysis.wordFrequencies.slice(0, 45)} />
              </DashboardCard>
              <DashboardCard
                title="Keyword Frequency"
                subtitle="Top extracted terms"
              >
                <KeywordFrequencyChart keywords={analysis.keywords} />
              </DashboardCard>
            </section>

            <section className="space-y-5">
              {analysis.questions.map((question) => (
                <DashboardCard
                  key={question.questionId}
                  title={question.prompt}
                  subtitle={`${question.responseCount} text responses`}
                >
                  <div className="grid gap-5 xl:grid-cols-2">
                    <WordCloud words={question.wordFrequencies.slice(0, 30)} />
                    <KeywordFrequencyChart keywords={question.keywords} />
                  </div>
                </DashboardCard>
              ))}
            </section>
          </>
        )}
      </div>
    </FeedbackPageShell>
  );
};

const MetricCard = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) => (
  <article className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-700">
        <MessageSquareText size={20} />
      </span>
    </div>
    <p className="mt-3 text-sm text-slate-500">{detail}</p>
  </article>
);

const DashboardCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-5">
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
    {children}
  </section>
);

const LoadingPanel = () => (
  <div className="flex min-h-[42vh] items-center justify-center rounded-3xl border border-slate-200/80 bg-white/75 shadow-sm backdrop-blur">
    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
      <Loader2 size={20} className="animate-spin text-indigo-600" />
      Analyzing text feedback...
    </div>
  </div>
);

const ErrorPanel = ({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) => (
  <section className="rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
      <AlertCircle size={24} />
    </div>
    <h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2>
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
  </section>
);

export default TextFeedbackAnalysisPage;
