import { Circle } from 'lucide-react';
import { QuestionComponentProps } from '../../types/feedback.types';

const RadioQuestion = ({
  question,
  value,
  error,
  disabled,
  onChange,
}: QuestionComponentProps) => (
  <div className="grid gap-2 sm:grid-cols-2">
    {(question.options ?? []).map((option) => {
      const checked = value === option.value;

      return (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60 ${
            checked
              ? 'border-indigo-300 bg-indigo-50 text-indigo-950'
              : 'border-slate-200 bg-white/85 text-slate-700 hover:border-indigo-200'
          } ${error ? 'ring-2 ring-rose-200' : ''}`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
              checked
                ? 'border-indigo-500 bg-indigo-500 text-white'
                : 'border-slate-300 bg-white'
            }`}
          >
            {checked && <Circle size={8} className="fill-current" />}
          </span>
          <span>{option.label}</span>
        </button>
      );
    })}
  </div>
);

export default RadioQuestion;
