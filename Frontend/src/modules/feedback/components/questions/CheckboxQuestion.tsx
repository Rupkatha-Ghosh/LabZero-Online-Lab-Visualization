import { Check } from 'lucide-react';
import { QuestionComponentProps } from '../../types/feedback.types';

const CheckboxQuestion = ({
  question,
  value,
  error,
  disabled,
  onChange,
}: QuestionComponentProps) => {
  const selectedValues = Array.isArray(value) ? value : [];

  const toggleValue = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter((selected) => selected !== optionValue));
      return;
    }

    onChange([...selectedValues, optionValue]);
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {(question.options ?? []).map((option) => {
        const checked = selectedValues.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => toggleValue(option.value)}
            className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60 ${
              checked
                ? 'border-cyan-300 bg-cyan-50 text-cyan-950'
                : 'border-slate-200 bg-white/85 text-slate-700 hover:border-cyan-200'
            } ${error ? 'ring-2 ring-rose-200' : ''}`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                checked
                  ? 'border-cyan-500 bg-cyan-500 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {checked && <Check size={14} />}
            </span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CheckboxQuestion;
