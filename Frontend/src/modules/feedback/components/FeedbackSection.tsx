import { motion } from 'motion/react';
import { Control, FieldErrors } from 'react-hook-form';
import {
  FeedbackFormValues,
  FeedbackSectionData,
} from '../types/feedback.types';
import QuestionRenderer from './QuestionRenderer';

interface FeedbackSectionProps {
  section: FeedbackSectionData;
  sectionIndex: number;
  totalSections: number;
  control: Control<FeedbackFormValues>;
  errors: FieldErrors<FeedbackFormValues>;
  disabled?: boolean;
}

const FeedbackSection = ({
  section,
  sectionIndex,
  totalSections,
  control,
  errors,
  disabled,
}: FeedbackSectionProps) => (
  <motion.section
    key={section.title}
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
    className="space-y-4"
  >
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">
        Part {sectionIndex + 1} of {totalSections}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        {section.title}
      </h2>
      {section.description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {section.description}
        </p>
      )}
    </div>

    {section.questions.map((question) => (
      <QuestionRenderer
        key={question._id}
        question={question}
        control={control}
        errors={errors}
        disabled={disabled}
      />
    ))}
  </motion.section>
);

export default FeedbackSection;
