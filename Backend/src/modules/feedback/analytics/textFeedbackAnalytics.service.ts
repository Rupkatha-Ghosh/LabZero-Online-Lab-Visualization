import { Types } from "mongoose";
import { FeedbackQuestion } from "../models/FeedbackQuestion";
import { FeedbackResponse } from "../models/FeedbackResponse";
import { TextFeedbackAnalysis } from "../types/feedback.types";
import {
  calculateWordFrequencies,
  extractKeywords,
  summarizeSentiment,
} from "../utils/textProcessing";

const toIdString = (id: Types.ObjectId | string) => id.toString();

export const getTextFeedbackAnalysis = async (
  formId: string
): Promise<TextFeedbackAnalysis> => {
  const [questions, responses] = await Promise.all([
    FeedbackQuestion.find({ formId, type: "text", isActive: true }).lean(),
    FeedbackResponse.find({ formId }).lean(),
  ]);

  const questionAnalyses = questions.map((question) => {
    const textResponses = responses
      .flatMap((response) => response.answers)
      .filter(
        (answer) => toIdString(answer.questionId) === toIdString(question._id)
      )
      .map((answer) => answer.value)
      .filter((value): value is string => typeof value === "string")
      .filter((value) => value.trim().length > 0);

    return {
      questionId: question._id,
      prompt: question.prompt,
      responseCount: textResponses.length,
      keywords: extractKeywords(textResponses),
      wordFrequencies: calculateWordFrequencies(textResponses),
      sentiment: summarizeSentiment(textResponses),
    };
  });

  const allTextResponses = questionAnalyses.flatMap((question) =>
    responses
      .flatMap((response) => response.answers)
      .filter(
        (answer) => toIdString(answer.questionId) === toIdString(question.questionId)
      )
      .map((answer) => answer.value)
      .filter((value): value is string => typeof value === "string")
  );

  return {
    formId,
    totalTextResponses: allTextResponses.length,
    keywords: extractKeywords(allTextResponses),
    wordFrequencies: calculateWordFrequencies(allTextResponses, 60),
    sentiment: summarizeSentiment(allTextResponses),
    questions: questionAnalyses,
    generatedAt: new Date(),
  };
};
