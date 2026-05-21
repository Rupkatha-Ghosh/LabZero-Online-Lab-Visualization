import { QuestionComponentProps } from '../../types/feedback.types';

const TextQuestion = ({
  question,
  value,
  error,
  disabled,
  onChange,
}: QuestionComponentProps) => (
  <label className="block">
    <span className="sr-only">{question.prompt}</span>
    <textarea
      value={typeof value === 'string' ? value : ''}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      className={`min-h-28 w-full resize-y rounded-xl border bg-white/85 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60 ${
        error ? 'border-rose-300' : 'border-slate-200'
      }`}
      placeholder="Type your response..."
    />
  </label>
);

export default TextQuestion;
