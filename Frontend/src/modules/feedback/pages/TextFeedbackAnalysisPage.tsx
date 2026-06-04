import { AlertCircle, Loader2, MessageSquareText, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import FeedbackPageShell from '../components/common/FeedbackPageShell';
import KeywordFrequencyChart from '../components/text-analysis/KeywordFrequencyChart';
import SentimentSummary from '../components/text-analysis/SentimentSummary';
import WordCloud from '../components/text-analysis/WordCloud';
import { useTextFeedbackAnalysis } from '../hooks/useTextFeedbackAnalysis';
import {
  FeedbackAnalyticsPdfButton,
  buildKeywordsBlock,
  buildSentimentBlock,
  buildSummaryMetrics,
  buildTextQuestionBlock,
  buildWordCloudBlock,
  type PdfSection,
} from '../components/FeedbackAnalyticsPdfButton';

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

  const pdfSections = useMemo<PdfSection[]>(() => {
    if (!analysis) return [];
    const studentCount = analysis.studentTextResponses ?? 0;
    const teacherCount = analysis.teacherTextResponses ?? 0;
    const sections: PdfSection[] = [
      {
        title: 'Overview',
        subtitle: 'Summary of open-ended student and teacher feedback',
        content: buildSummaryMetrics([
          { label: 'Text responses', value: analysis.totalTextResponses, detail: `${studentCount} student · ${teacherCount} teacher` },
          { label: 'Keywords', value: analysis.keywords.length, detail: 'Ranked by frequency score' },
          { label: 'Avg sentiment', value: analysis.sentiment.averageScore.toFixed(2), detail: 'Positive minus negative signal' },
        ]),
      },
      {
        title: 'Sentiment Summary',
        subtitle: `${analysis.totalTextResponses} text responses analyzed`,
        content: buildSentimentBlock(analysis.sentiment, analysis.totalTextResponses),
      },
      {
        title: 'Top Keywords',
        subtitle: 'Most frequent terms across all text feedback',
        content: buildKeywordsBlock(analysis.keywords),
        chartId: 'chart-text-keywords',
        chartCaption: 'Top keywords bar chart',
      },
      {
        title: 'Frequently Used Words',
        subtitle: 'Word cloud of the most common words',
        content: buildWordCloudBlock(analysis.wordFrequencies),
      },
    ];
    const orderedGroups = ['Student Feedback', 'Teacher Feedback'];
    const seen = new Set<string>();
    for (const q of analysis.questions) {
      const g = q.group;
      if (g && !seen.has(g)) seen.add(g);
    }
    const groups: string[] = [];
    for (const g of orderedGroups) {
      if (seen.has(g)) {
        groups.push(g);
        seen.delete(g);
      }
    }
    for (const g of seen) groups.push(g);

    if (groups.length) {
      groups.forEach((groupLabel) => {
        sections.push({
          title: groupLabel,
          subtitle: `${groupLabel} open-ended responses`,
          content: buildSummaryMetrics([
            { label: 'Questions', value: analysis.questions.filter((q) => q.group === groupLabel).length, detail: `From ${groupLabel.toLowerCase()}` },
          ]),
        });
        analysis.questions
          .filter((q) => q.group === groupLabel)
          .forEach((question) => {
            sections.push({
              title: question.prompt,
              subtitle: `${question.responseCount} text responses · ${question.sentiment.satisfactionPercentage}% positive`,
              content: buildTextQuestionBlock(question),
              chartId: `chart-text-keywords-${question.questionId}`,
              chartCaption: 'Top keywords bar chart',
            });
          });
      });
    } else {
      analysis.questions.forEach((question) => {
        sections.push({
          title: question.prompt,
          subtitle: `${question.responseCount} text responses · ${question.sentiment.satisfactionPercentage}% positive`,
          content: buildTextQuestionBlock(question),
          chartId: `chart-text-keywords-${question.questionId}`,
          chartCaption: 'Top keywords bar chart',
        });
      });
    }
    return sections;
  }, [analysis]);

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
            <div className="flex flex-col gap-2 sm:flex-row">
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
              {analysis && !isLoading && !error && (
                <FeedbackAnalyticsPdfButton
                  title="LabZero - Text Feedback Analysis"
                  sections={pdfSections}
                />
              )}
            </div>
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
                detail={`${analysis.studentTextResponses ?? 0} student · ${analysis.teacherTextResponses ?? 0} teacher`}
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
                <KeywordFrequencyChart
                  keywords={analysis.keywords}
                  chartId="chart-text-keywords"
                />
              </DashboardCard>
            </section>

            <section className="space-y-5">
              {analysis.questions.map((question) => (
                <DashboardCard
                  key={question.questionId}
                  title={question.prompt}
                  subtitle={`${question.group ? question.group + ' · ' : ''}${question.responseCount} text responses`}
                >
                  <div className="grid gap-5 xl:grid-cols-2">
                    <WordCloud words={question.wordFrequencies.slice(0, 30)} />
                    <KeywordFrequencyChart
                      keywords={question.keywords}
                      chartId={`chart-text-keywords-${question.questionId}`}
                    />
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
