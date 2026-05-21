import { Controller, Control, FieldErrors } from 'react-hook-form';
import {
  CheckboxQuestion,
  DropdownQuestion,
  RadioQuestion,
  RatingQuestion,
  TextQuestion,
} from './questions';
import {
  FeedbackFormValues,
  FeedbackQuestion,
} from '../types/feedback.types';

interface QuestionRendererProps {
  question: FeedbackQuestion;
  control: Control<FeedbackFormValues>;
  errors: FieldErrors<FeedbackFormValues>;
  disabled?: boolean;
}

const getErrorMessage = (
  errors: FieldErrors<FeedbackFormValues>,
  questionId: string
) => {
  const answerErrors = errors.answers as
    | Record<string, { message?: string }>
    | undefined;
  return answerErrors?.[questionId]?.message;
};

const QuestionRenderer = ({
  question,
  control,
  errors,
  disabled,
}: QuestionRendererProps) => {
  const error = getErrorMessage(errors, question._id);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            {question.prompt}
            {question.required && (
              <span className="ml-1 text-rose-500" aria-hidden="true">
                *
              </span>
            )}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
            {question.type}
          </p>
        </div>
      </div>

      <Controller
        control={control}
        name={`answers.${question._id}`}
        render={({ field }) => {
          const props = {
            question,
            value: field.value,
            error,
            disabled,
            onChange: field.onChange,
          };

          switch (question.type) {
            case 'rating':
              return <RatingQuestion {...props} />;
            case 'checkbox':
              return <CheckboxQuestion {...props} />;
            case 'radio':
              return <RadioQuestion {...props} />;
            case 'dropdown':
              return <DropdownQuestion {...props} />;
            case 'text':
            default:
              return <TextQuestion {...props} />;
          }
        }}
      />

      {error && (
        <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
};

export default QuestionRenderer;
