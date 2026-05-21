import { z } from 'zod';
import { FeedbackForm, FeedbackQuestion } from '../types/feedback.types';

export const buildFeedbackSchema = (form: FeedbackForm) => {
  const answerShape: Record<string, z.ZodTypeAny> = {};

  for (const question of getAllQuestions(form)) {
    answerShape[question._id] = buildQuestionSchema(question);
  }

  return z.object({
    anonymous: z.boolean(),
    answers: z.object(answerShape),
  });
};

export const getAllQuestions = (form: FeedbackForm): FeedbackQuestion[] =>
  form.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((section) =>
      section.questions.slice().sort((a, b) => a.order - b.order)
    );

export const getDefaultAnswers = (form: FeedbackForm) =>
  getAllQuestions(form).reduce<Record<string, string | number | string[]>>(
    (answers, question) => {
      answers[question._id] = question.type === 'checkbox' ? [] : '';
      return answers;
    },
    {}
  );

const buildQuestionSchema = (question: FeedbackQuestion) => {
  if (question.type === 'checkbox') {
    const schema = z.array(z.string());
    return question.required
      ? schema.min(1, `${question.prompt} is required.`)
      : schema.optional().default([]);
  }

  if (question.type === 'rating') {
    const min = question.minRating ?? 1;
    const max = question.maxRating ?? 5;
    const schema = z.coerce
      .number({
        error: `${question.prompt} is required.`,
      })
      .min(min, `Rating must be at least ${min}.`)
      .max(max, `Rating must be at most ${max}.`);

    return question.required ? schema : schema.optional();
  }

  const schema = z.string();
  return question.required
    ? schema.trim().min(1, `${question.prompt} is required.`)
    : schema.optional().default('');
};
