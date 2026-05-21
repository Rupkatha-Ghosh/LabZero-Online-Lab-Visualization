import { Frown, Meh, Smile } from 'lucide-react';
import { TextFeedbackSentimentSummary } from '../../types/feedback.types';

interface SentimentSummaryProps {
  sentiment: TextFeedbackSentimentSummary;
  totalResponses: number;
}

const SentimentSummary = ({
  sentiment,
  totalResponses,
}: SentimentSummaryProps) => {
  const segments = [
    {
      label: 'Positive',
      value: sentiment.positive,
      color: 'bg-emerald-500',
      icon: Smile,
      text: 'text-emerald-700',
    },
    {
      label: 'Neutral',
      value: sentiment.neutral,
      color: 'bg-slate-400',
      icon: Meh,
      text: 'text-slate-600',
    },
    {
      label: 'Negative',
      value: sentiment.negative,
      color: 'bg-rose-500',
      icon: Frown,
      text: 'text-rose-700',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Sentiment Summary
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {totalResponses} text responses analyzed
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-3xl font-black text-slate-950">
            {sentiment.satisfactionPercentage}%
          </p>
          <p className="text-sm text-slate-500">positive satisfaction</p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="flex h-full">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className={segment.color}
              style={{
                width: `${
                  totalResponses > 0
                    ? Math.round((segment.value / totalResponses) * 100)
                    : 0
                }%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {segments.map((segment) => {
          const Icon = segment.icon;

          return (
            <div
              key={segment.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className={`flex items-center gap-2 ${segment.text}`}>
                <Icon size={18} />
                <span className="text-sm font-semibold">{segment.label}</span>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-950">
                {segment.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SentimentSummary;
