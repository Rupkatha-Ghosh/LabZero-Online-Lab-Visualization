import {
  FeedbackForm,
  FeedbackFormDraft,
  FeedbackQuestionDraft,
  FeedbackQuestionType,
  FeedbackSectionDraft,
  FeedbackUserDetails,
} from '../types/feedback.types';

export const createDraftId = () =>
  `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const createEmptyQuestion = (
  type: FeedbackQuestionType = 'text',
  order = 0
): FeedbackQuestionDraft => ({
  id: createDraftId(),
  prompt: '',
  type,
  required: true,
  options: ['checkbox', 'radio', 'dropdown'].includes(type)
    ? [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
      ]
    : [],
  minRating: type === 'rating' ? 1 : undefined,
  maxRating: type === 'rating' ? 5 : undefined,
  order,
});

export const createEmptySection = (order = 0): FeedbackSectionDraft => ({
  id: createDraftId(),
  title: `Section ${order + 1}`,
  description: '',
  questions: [0, 1, 2].map((index) => createEmptyQuestion('text', index)),
});

export const createEmptyFormDraft = (
  user?: FeedbackUserDetails
): FeedbackFormDraft => ({
  title: '',
  description: '',
  anonymousAllowed: true,
  status: 'draft',
  createdBy: user ?? {},
  classroomCourseMetadata: {},
  startsAt: '',
  endsAt: '',
  sections: [createEmptySection(0)],
});

export const formToDraft = (
  form: FeedbackForm,
  fallbackUser?: FeedbackUserDetails
): FeedbackFormDraft => ({
  title: form.title,
  description: form.description ?? '',
  anonymousAllowed: form.anonymousAllowed,
  status: form.status ?? 'draft',
  createdBy: form.createdBy ?? fallbackUser ?? {},
  classroomCourseMetadata: form.classroomCourseMetadata ?? {},
  startsAt: form.startsAt?.slice(0, 10) ?? '',
  endsAt: form.endsAt?.slice(0, 10) ?? '',
  sections: form.sections.map((section) => ({
    id: createDraftId(),
    title: section.title,
    description: section.description ?? '',
    questions: section.questions.map((question, index) => ({
      id: question._id || createDraftId(),
      prompt: question.prompt,
      type: question.type,
      required: question.required,
      options: question.options ?? [],
      minRating: question.minRating,
      maxRating: question.maxRating,
      order: index,
    })),
  })),
});

export const validateFormDraft = (draft: FeedbackFormDraft): string[] => {
  const errors: string[] = [];

  if (!draft.title.trim()) {
    errors.push('Form title is required.');
  }

  draft.sections.forEach((section, sectionIndex) => {
    if (!section.title.trim()) {
      errors.push(`Section ${sectionIndex + 1} needs a title.`);
    }

    if (section.questions.length < 3 || section.questions.length > 5) {
      errors.push(
        `${section.title || `Section ${sectionIndex + 1}`} must contain 3 to 5 questions.`
      );
    }

    section.questions.forEach((question, questionIndex) => {
      if (!question.prompt.trim()) {
        errors.push(
          `Question ${questionIndex + 1} in ${section.title || `section ${sectionIndex + 1}`} needs prompt text.`
        );
      }

      if (
        ['checkbox', 'radio', 'dropdown'].includes(question.type) &&
        question.options.filter((option) => option.label.trim()).length < 2
      ) {
        errors.push(`"${question.prompt || 'Choice question'}" needs at least two options.`);
      }
    });
  });

  return errors;
};

export const reorderItems = <T>(items: T[], fromIndex: number, toIndex: number) => {
  const nextItems = [...items];
  const [moved] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, moved);
  return nextItems;
};
