import { Star } from 'lucide-react';
import { QuestionComponentProps } from '../../types/feedback.types';

const RatingQuestion = ({
  question,
  value,
  error,
  disabled,
  onChange,
}: QuestionComponentProps) => {
  const min = question.minRating ?? 1;
  const max = question.maxRating ?? 5;
  const selected = Number(value) || 0;
  const ratings = Array.from({ length: max - min + 1 }, (_, index) => min + index);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ratings.map((rating) => {
          const isSelected = selected >= rating;

          return (
            <button
              key={rating}
              type="button"
              disabled={disabled}
              onClick={() => onChange(rating)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelected
                  ? 'border-amber-300 bg-amber-100 text-amber-600'
                  : 'border-slate-200 bg-white/85 text-slate-400 hover:border-amber-200'
              } ${error ? 'ring-2 ring-rose-200' : ''}`}
              aria-label={`Rate ${rating}`}
            >
              <Star
                size={18}
                className={isSelected ? 'fill-current' : undefined}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-slate-500">
        {selected ? `${selected} of ${max}` : `Select ${min}-${max}`}
      </div>
    </div>
  );
};

export default RatingQuestion;
