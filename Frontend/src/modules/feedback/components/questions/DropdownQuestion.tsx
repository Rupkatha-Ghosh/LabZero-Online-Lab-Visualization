import { ChevronDown } from 'lucide-react';
import { QuestionComponentProps } from '../../types/feedback.types';

const DropdownQuestion = ({
  question,
  value,
  error,
  disabled,
  onChange,
}: QuestionComponentProps) => (
  <div className="relative">
    <select
      value={typeof value === 'string' ? value : ''}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={`h-12 w-full appearance-none rounded-xl border bg-white/85 px-4 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60 ${
        error ? 'border-rose-300' : 'border-slate-200'
      }`}
    >
      <option value="">Choose an option</option>
      {(question.options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={18}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </div>
);

export default DropdownQuestion;
