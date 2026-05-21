import { Types } from "mongoose";
import { FeedbackAnalytics } from "../models/FeedbackAnalytics";
import { FeedbackQuestion, IFeedbackQuestion } from "../models/FeedbackQuestion";
import { FeedbackResponse } from "../models/FeedbackResponse";
import { QuestionStatistics } from "../types/feedback.types";

const toIdString = (id: Types.ObjectId | string) => id.toString();

export const rebuildFeedbackAnalytics = async (formId: string) => {
  const [questions, responses] = await Promise.all([
    FeedbackQuestion.find({ formId, isActive: true }).lean(),
    FeedbackResponse.find({ formId }).lean(),
  ]);

  const questionStats = questions.map((question) =>
    buildQuestionStats(question, responses)
  );

  const analytics = await FeedbackAnalytics.findOneAndUpdate(
    { formId },
    {
      formId,
      totalResponses: responses.length,
      anonymousResponses: responses.filter((response) => response.anonymous)
        .length,
      identifiedResponses: responses.filter((response) => !response.anonymous)
        .length,
      questionStats,
      lastCalculatedAt: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return analytics;
};

export const getQuestionStatistics = async (
  formId: string,
  questionId: string
): Promise<QuestionStatistics> => {
  const analytics = await rebuildFeedbackAnalytics(formId);
  const stats = analytics.questionStats.find(
    (questionStat) => toIdString(questionStat.questionId) === questionId
  );

  if (!stats) {
    throw new Error("Question statistics were not found for this form.");
  }

  return {
    questionId: stats.questionId,
    type: stats.type,
    totalAnswers: stats.totalAnswers,
    averageRating: stats.averageRating,
    optionCounts: normalizeOptionCounts(stats.optionCounts),
    textAnswerCount: stats.textAnswerCount,
  };
};

const normalizeOptionCounts = (
  optionCounts: Map<string, number> | Record<string, number> | undefined
) => {
  if (!optionCounts) {
    return undefined;
  }

  return optionCounts instanceof Map
    ? Object.fromEntries(optionCounts)
    : Object.fromEntries(Object.entries(optionCounts));
};

const buildQuestionStats = (
  question: Pick<IFeedbackQuestion, "type" | "options"> & {
    _id: Types.ObjectId;
  },
  responses: Array<{
    answers: Array<{
      questionId: Types.ObjectId | string;
      value: unknown;
    }>;
  }>
) => {
  const answers = responses
    .flatMap((response) => response.answers)
    .filter(
      (answer) => toIdString(answer.questionId) === toIdString(question._id)
    );

  const baseStats = {
    questionId: question._id,
    type: question.type,
    totalAnswers: answers.length,
  };

  if (question.type === "rating") {
    const numericAnswers = answers
      .map((answer) => Number(answer.value))
      .filter((value) => Number.isFinite(value));
    const ratingSum = numericAnswers.reduce((sum, value) => sum + value, 0);

    return {
      ...baseStats,
      ratingSum,
      averageRating:
        numericAnswers.length > 0 ? ratingSum / numericAnswers.length : 0,
    };
  }

  if (["checkbox", "radio", "dropdown"].includes(question.type)) {
    const optionCounts = new Map<string, number>();

    for (const option of question.options ?? []) {
      optionCounts.set(option.value, 0);
    }

    for (const answer of answers) {
      const values = Array.isArray(answer.value) ? answer.value : [answer.value];

      for (const value of values) {
        const key = String(value);
        optionCounts.set(key, (optionCounts.get(key) ?? 0) + 1);
      }
    }

    return {
      ...baseStats,
      optionCounts,
    };
  }

  return {
    ...baseStats,
    textAnswerCount: answers.length,
  };
};
