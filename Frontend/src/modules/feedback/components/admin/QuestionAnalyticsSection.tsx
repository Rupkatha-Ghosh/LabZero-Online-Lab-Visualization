import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from '../analytics/ChartCard';
import PieDonutChart from '../analytics/PieDonutChart';
import {
  FeedbackAnalytics,
  FeedbackForm,
  FeedbackQuestion,
  FeedbackQuestionAnalytics,
  FeedbackQuestionType,
} from '../../types/feedback.types';

interface QuestionAnalyticsSectionProps {
  form: FeedbackForm;
  analytics: FeedbackAnalytics;
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

const choiceQuestionTypes: FeedbackQuestionType[] = ['checkbox', 'radio', 'dropdown'];

const QuestionAnalyticsSection = ({
  form,
  analytics,
}: QuestionAnalyticsSectionProps) => {
  const questionsById = new Map(
    form.sections.flatMap((section) =>
      section.questions.map((question) => [question._id, question] as const)
    )
  );

  const visibleQuestions = analytics.questionStats
    .map((stat) => {
      const question = questionsById.get(stat.questionId);
      return {
        stat,
        question,
        prompt: question?.prompt ?? stat.prompt ?? 'Question',
        sectionTitle: question?.sectionTitle ?? '',
        type: stat.type,
        group: stat.group ?? '',
      };
    })
    .filter(
      ({ stat }) => stat.type === 'rating' || choiceQuestionTypes.includes(stat.type)
    );

  if (!visibleQuestions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm font-medium text-slate-500">
        No rating, radio, checkbox, or dropdown questions were found for this form.
      </div>
    );
  }

  const groups: string[] = [];
  for (const v of visibleQuestions) {
    if (v.group && !groups.includes(v.group)) {
      groups.push(v.group);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {(groups.length ? groups : ['']).map((groupLabel) => {
        const items = visibleQuestions.filter((v) =>
          groups.length ? v.group === groupLabel : true,
        );
        if (!items.length) return null;
        return (
          <div key={groupLabel || 'default'} className="flex flex-col gap-4">
            {groupLabel ? (
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-950">
                  {groupLabel}
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {items.length} questions
                </span>
              </div>
            ) : null}
            <div className="grid gap-4 xl:grid-cols-2">
              {items.map(({ stat, question, prompt, sectionTitle, type }) => {
                if (type === 'rating') {
                  return (
                    <QuestionCard
                      key={stat.questionId}
                      title={prompt}
                      subtitle={`${sectionTitle || 'Rating question'} · ${stat.totalAnswers} responses`}
                    >
                      <div data-pdf-chart-id={`chart-rating-${stat.questionId}`}>
                        <RatingChart stat={stat} />
                      </div>
                    </QuestionCard>
                  );
                }

                return (
                  <QuestionCard
                    key={stat.questionId}
                    title={prompt}
                    subtitle={`${sectionTitle || ''} · ${capitalize(type)} question · ${stat.totalAnswers} responses`}
                  >
                    <div data-pdf-chart-id={`chart-choice-${stat.questionId}`}>
                      <ChoiceChart stat={stat} question={question ?? undefined} />
                    </div>
                  </QuestionCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const QuestionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <article className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-5">
    <div className="mb-4 flex flex-col gap-1">
      <h4 className="text-base font-bold text-slate-950">{title}</h4>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
    {children}
  </article>
);

const RatingChart = ({ stat }: { stat: FeedbackQuestionAnalytics }) => {
  const data = Array.from({ length: 5 }, (_, index) => {
    const rating = String(index + 1);
    return {
      name: rating,
      value: Number(stat.ratingDistribution?.[rating] ?? 0),
      fill: chartColors[index % chartColors.length],
    };
  });

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ fill: 'rgba(79, 70, 229, 0.08)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ChoiceChart = ({
  stat,
  question,
}: {
  stat: FeedbackQuestionAnalytics;
  question?: FeedbackQuestion;
}) => {
  const knownOptions = question?.options ?? [];
  const optionLabels = new Map(
    knownOptions.map((option) => [option.value, option.label] as const)
  );

  const data = knownOptions.map((option, index) => ({
    name: option.label || option.value,
    value: Number(stat.optionCounts?.[option.value] ?? stat.optionCounts?.[option.label] ?? 0),
    fill: chartColors[index % chartColors.length],
  }));

  const extraOptions = Object.entries(stat.optionCounts ?? {})
    .filter(([key]) => !optionLabels.has(key))
    .map(([name, value], index) => ({
      name,
      value: Number(value),
      fill: chartColors[(index + data.length) % chartColors.length],
    }));

  return (
    <PieDonutChart
      data={[...data, ...extraOptions]}
      heightClass="h-80"
      legendGridClassName="sm:grid-cols-2"
      legendMaxHeightClass="max-h-40"
    />
  );
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default QuestionAnalyticsSection;
