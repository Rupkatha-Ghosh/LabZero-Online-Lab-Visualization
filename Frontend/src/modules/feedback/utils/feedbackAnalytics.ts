import {
  FeedbackAnalytics,
  FeedbackAnalyticsSummary,
  FeedbackAnalyticsViewModel,
  FeedbackForm,
  FeedbackQuestion,
  FeedbackQuestionAnalytics,
} from '../types/feedback.types';

export interface ChartDatum {
  name: string;
  value: number;
  fill?: string;
}

const chartColors = [
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#c026d3',
  '#e11d48',
  '#475569',
];

export const buildAnalyticsViewModel = (
  analytics: FeedbackAnalytics,
  form?: FeedbackForm
): FeedbackAnalyticsViewModel => {
  const questionsById = new Map(
    form?.sections.flatMap((section) =>
      section.questions.map((question) => [question._id, question])
    ) ?? []
  );
  const questionStats = analytics.questionStats.map((stat) =>
    mergeQuestionAnalytics(stat, questionsById.get(stat.questionId))
  );
  const summary = buildSummary(analytics, questionStats);

  return {
    form,
    analytics,
    summary,
    questionStats,
  };
};

export const buildSummary = (
  analytics: FeedbackAnalytics,
  questionStats: FeedbackQuestionAnalytics[]
): FeedbackAnalyticsSummary => {
  const ratingQuestions = questionStats.filter(
    (question) => question.type === 'rating' && question.totalAnswers > 0
  );
  const averageRating =
    ratingQuestions.length > 0
      ? ratingQuestions.reduce(
          (sum, question) => sum + (question.averageRating ?? 0),
          0
        ) / ratingQuestions.length
      : 0;
  const satisfactionPercentage =
    ratingQuestions.length > 0 ? Math.round((averageRating / 5) * 100) : 0;

  return {
    totalResponses:
      analytics.summary?.totalResponses ?? analytics.totalResponses ?? 0,
    anonymousResponses:
      analytics.summary?.anonymousResponses ?? analytics.anonymousResponses ?? 0,
    identifiedResponses:
      analytics.summary?.identifiedResponses ??
      analytics.identifiedResponses ??
      0,
    averageRating: analytics.summary?.averageRating ?? averageRating,
    satisfactionPercentage:
      analytics.summary?.satisfactionPercentage ?? satisfactionPercentage,
  };
};

export const ratingHistogramData = (
  question: FeedbackQuestionAnalytics
): ChartDatum[] => {
  const distribution =
    question.ratingDistribution ??
    buildDistributionFallback(question.averageRating, question.totalAnswers);

  return Object.entries(distribution)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([rating, count], index) => ({
      name: `${rating} star`,
      value: count,
      fill: chartColors[index % chartColors.length],
    }));
};

export const optionPieData = (
  question: FeedbackQuestionAnalytics
): ChartDatum[] =>
  Object.entries(question.optionCounts ?? {}).map(([name, value], index) => ({
    name,
    value,
    fill: chartColors[index % chartColors.length],
  }));

export const heatmapData = (question: FeedbackQuestionAnalytics) => {
  if (question.heatmap?.length) {
    return question.heatmap;
  }

  const roundedRating = Math.max(
    1,
    Math.min(5, Math.round(question.averageRating ?? 0) || 1)
  );

  return Array.from({ length: 5 }, (_, index) => ({
    label: `Rating ${index + 1}`,
    rating: index + 1,
    count: index + 1 === roundedRating ? question.totalAnswers : 0,
  }));
};

export const exportAnalyticsCsv = (viewModel: FeedbackAnalyticsViewModel) => {
  const rows = [
    ['Metric', 'Value'],
    ['Total responses', viewModel.summary.totalResponses],
    ['Anonymous responses', viewModel.summary.anonymousResponses],
    ['Identified responses', viewModel.summary.identifiedResponses],
    ['Average rating', viewModel.summary.averageRating.toFixed(2)],
    ['Satisfaction percentage', `${viewModel.summary.satisfactionPercentage}%`],
    [],
    ['Question', 'Type', 'Total answers', 'Average rating', 'Options'],
    ...viewModel.questionStats.map((question) => [
      question.prompt ?? question.questionId,
      question.type,
      question.totalAnswers,
      question.averageRating?.toFixed(2) ?? '',
      JSON.stringify(question.optionCounts ?? question.ratingDistribution ?? {}),
    ]),
  ];

  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')
    )
    .join('\n');
  downloadFile(
    csv,
    `labzero-feedback-analytics-${viewModel.analytics.formId}.csv`,
    'text/csv;charset=utf-8'
  );
};

const mergeQuestionAnalytics = (
  stat: FeedbackQuestionAnalytics,
  question?: FeedbackQuestion
): FeedbackQuestionAnalytics => ({
  ...stat,
  questionId: String(stat.questionId),
  prompt: stat.prompt ?? question?.prompt,
  type: stat.type ?? question?.type,
});

const buildDistributionFallback = (
  averageRating = 0,
  totalAnswers = 0
): Record<string, number> => {
  const rounded = Math.max(1, Math.min(5, Math.round(averageRating) || 1));

  return Array.from({ length: 5 }, (_, index) => index + 1).reduce<
    Record<string, number>
  >((distribution, rating) => {
    distribution[String(rating)] = rating === rounded ? totalAnswers : 0;
    return distribution;
  }, {});
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
