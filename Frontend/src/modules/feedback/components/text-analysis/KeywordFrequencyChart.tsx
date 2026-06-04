import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TextFeedbackKeyword } from '../../types/feedback.types';

interface KeywordFrequencyChartProps {
  keywords: TextFeedbackKeyword[];
}

interface KeywordFrequencyChartProps {
  keywords: TextFeedbackKeyword[];
  chartId?: string;
}

const KeywordFrequencyChart = ({ keywords, chartId }: KeywordFrequencyChartProps) => (
  <div
    data-pdf-chart-id={chartId}
    className="h-80 rounded-2xl border border-slate-200 bg-white/70 p-3"
  >
    {keywords.length === 0 ? (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No keywords available yet.
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={keywords.slice(0, 12)} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="keyword"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ fill: 'rgba(79, 70, 229, 0.08)' }} />
          <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default KeywordFrequencyChart;
