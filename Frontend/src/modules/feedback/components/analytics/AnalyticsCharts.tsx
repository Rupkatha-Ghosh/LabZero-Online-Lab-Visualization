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
import { FeedbackQuestionAnalytics } from '../../types/feedback.types';
import {
  heatmapData,
  optionPieData,
  ratingHistogramData,
} from '../../utils/feedbackAnalytics';
import ChartCard from './ChartCard';
import PieDonutChart from './PieDonutChart';

interface AnalyticsChartsProps {
  questionStats: FeedbackQuestionAnalytics[];
}

const AnalyticsCharts = ({ questionStats }: AnalyticsChartsProps) => {
  const ratingQuestions = questionStats.filter(
    (question) => question.type === 'rating'
  );
  const choiceQuestions = questionStats.filter((question) =>
    ['checkbox', 'radio', 'dropdown'].includes(question.type)
  );

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {ratingQuestions.map((question) => (
        <div key={question.questionId} className="contents">
          <RatingHistogram question={question} />
          <RatingBarGraph question={question} />
          <RatingHeatmap question={question} />
        </div>
      ))}

      {choiceQuestions.map((question) => (
        <ChoicePieChart key={question.questionId} question={question} />
      ))}

      {questionStats.length === 0 && (
        <ChartCard title="No analytics yet">
          <div className="flex min-h-56 items-center justify-center text-sm text-slate-500">
            Feedback charts will appear after responses are submitted.
          </div>
        </ChartCard>
      )}
    </div>
  );
};

const RatingHistogram = ({
  question,
}: {
  question: FeedbackQuestionAnalytics;
}) => {
  const data = ratingHistogramData(question);

  return (
    <ChartCard
      title="Rating Histogram"
      subtitle={question.prompt ?? question.questionId}
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'rgba(79, 70, 229, 0.08)' }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

const RatingBarGraph = ({
  question,
}: {
  question: FeedbackQuestionAnalytics;
}) => {
  const data = [
    {
      name: 'Average',
      value: Number((question.averageRating ?? 0).toFixed(2)),
    },
    {
      name: 'Responses',
      value: question.totalAnswers,
    },
  ];

  return (
    <ChartCard
      title="Rating Bar Graph"
      subtitle={question.prompt ?? question.questionId}
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'rgba(8, 145, 178, 0.08)' }} />
            <Bar dataKey="value" fill="#0891b2" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

const RatingHeatmap = ({
  question,
}: {
  question: FeedbackQuestionAnalytics;
}) => {
  const data = heatmapData(question);
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <ChartCard
      title="Rating Heatmap"
      subtitle={question.prompt ?? question.questionId}
    >
      <div className="grid grid-cols-5 gap-2">
        {data.map((cell) => {
          const intensity = cell.count / maxCount;

          return (
            <div
              key={`${cell.label}-${cell.rating}`}
              className="flex min-h-24 flex-col justify-between rounded-xl border border-slate-200 p-3 text-sm"
              style={{
                backgroundColor: `rgba(79, 70, 229, ${0.08 + intensity * 0.42})`,
              }}
              title={`${cell.label}: ${cell.count}`}
            >
              <span className="font-semibold text-slate-700">
                {cell.rating}
              </span>
              <span className="text-lg font-black text-slate-950">
                {cell.count}
              </span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
};

const ChoicePieChart = ({
  question,
}: {
  question: FeedbackQuestionAnalytics;
}) => {
  const data = optionPieData(question);

  return (
    <ChartCard
      title={`${question.type[0].toUpperCase()}${question.type.slice(1)} Pie Chart`}
      subtitle={question.prompt ?? question.questionId}
    >
      <PieDonutChart
        data={data}
        heightClass="h-80"
        legendGridClassName="sm:grid-cols-2"
      />
    </ChartCard>
  );
};

export default AnalyticsCharts;
