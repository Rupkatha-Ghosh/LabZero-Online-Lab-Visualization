import { Request, Response } from "express";
import {
  getQuestionStatistics,
  rebuildFeedbackAnalytics,
} from "../analytics/feedbackAnalytics.service";
import { getTextFeedbackAnalysis } from "../analytics/textFeedbackAnalytics.service";
import {
  createFeedbackForm,
  deleteFeedbackForm,
  getFeedbackAnalytics,
  getFeedbackFormById,
  listFeedbackForms,
  submitFeedback,
  updateFeedbackForm,
  updateFeedbackFormStatus,
} from "../services/feedback.service";
import {
  CreateFeedbackFormInput,
  FeedbackFormListQuery,
  SubmitFeedbackInput,
} from "../types/feedback.types";
import { sendError, sendSuccess } from "../utils/feedbackResponse";

export const createFeedbackFormController = async (
  req: Request<unknown, unknown, CreateFeedbackFormInput>,
  res: Response
) => {
  try {
    const form = await createFeedbackForm(req.body);
    return sendSuccess(res, form, "Feedback form created.", 201);
  } catch (error) {
    return sendError(res, error, "Unable to create feedback form.", 400);
  }
};

export const listFeedbackFormsController = async (
  req: Request<unknown, unknown, unknown, FeedbackFormListQuery>,
  res: Response
) => {
  try {
    const forms = await listFeedbackForms(req.query);
    return sendSuccess(res, forms, "Feedback forms fetched.");
  } catch (error) {
    return sendError(res, error, "Unable to fetch feedback forms.", 400);
  }
};

export const updateFeedbackFormController = async (
  req: Request<{ formId: string }, unknown, CreateFeedbackFormInput>,
  res: Response
) => {
  try {
    const form = await updateFeedbackForm(req.params.formId, req.body);
    return sendSuccess(res, form, "Feedback form updated.");
  } catch (error) {
    return sendError(res, error, "Unable to update feedback form.", 400);
  }
};

export const deleteFeedbackFormController = async (
  req: Request<{ formId: string }>,
  res: Response
) => {
  try {
    const result = await deleteFeedbackForm(req.params.formId);
    return sendSuccess(res, result, "Feedback form deleted.");
  } catch (error) {
    return sendError(res, error, "Unable to delete feedback form.", 400);
  }
};

export const updateFeedbackFormStatusController = async (
  req: Request<{ formId: string }, unknown, { status: "draft" | "published" | "closed" }>,
  res: Response
) => {
  try {
    const form = await updateFeedbackFormStatus(req.params.formId, req.body.status);
    return sendSuccess(res, form, "Feedback form status updated.");
  } catch (error) {
    return sendError(res, error, "Unable to update feedback form status.", 400);
  }
};

export const fetchFeedbackFormController = async (
  req: Request<{ formId: string }>,
  res: Response
) => {
  try {
    const form = await getFeedbackFormById(req.params.formId);
    return sendSuccess(res, form, "Feedback form fetched.");
  } catch (error) {
    return sendError(res, error, "Unable to fetch feedback form.", 404);
  }
};

export const submitFeedbackController = async (
  req: Request<unknown, unknown, SubmitFeedbackInput>,
  res: Response
) => {
  try {
    const response = await submitFeedback(req.body);
    return sendSuccess(res, response, "Feedback submitted.", 201);
  } catch (error) {
    return sendError(res, error, "Unable to submit feedback.", 400);
  }
};

export const fetchAnalyticsController = async (
  req: Request<{ formId: string }>,
  res: Response
) => {
  try {
    const analytics =
      (await getFeedbackAnalytics(req.params.formId)) ??
      (await rebuildFeedbackAnalytics(req.params.formId));
    return sendSuccess(res, analytics, "Feedback analytics fetched.");
  } catch (error) {
    return sendError(res, error, "Unable to fetch feedback analytics.", 404);
  }
};

export const fetchQuestionStatisticsController = async (
  req: Request<{ formId: string; questionId: string }>,
  res: Response
) => {
  try {
    const statistics = await getQuestionStatistics(
      req.params.formId,
      req.params.questionId
    );
    return sendSuccess(res, statistics, "Question statistics fetched.");
  } catch (error) {
    return sendError(res, error, "Unable to fetch question statistics.", 404);
  }
};

export const fetchTextFeedbackAnalysisController = async (
  req: Request<{ formId: string }>,
  res: Response
) => {
  try {
    const analysis = await getTextFeedbackAnalysis(req.params.formId);
    return sendSuccess(res, analysis, "Text feedback analysis fetched.");
  } catch (error) {
    return sendError(res, error, "Unable to fetch text feedback analysis.", 404);
  }
};
