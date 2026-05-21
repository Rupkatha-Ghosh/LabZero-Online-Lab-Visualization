import { Router } from "express";
import {
  createFeedbackFormController,
  deleteFeedbackFormController,
  fetchAnalyticsController,
  fetchFeedbackFormController,
  fetchQuestionStatisticsController,
  fetchTextFeedbackAnalysisController,
  listFeedbackFormsController,
  submitFeedbackController,
  updateFeedbackFormController,
  updateFeedbackFormStatusController,
} from "../controllers/feedback.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
import {
  validateCreateFeedbackForm,
  validateObjectIdParam,
  validateSubmitFeedback,
  validateUpdateFeedbackForm,
} from "../middlewares/feedbackValidation.middleware";

const router = Router();

router.get("/admin/forms", requireAuth, requireAdmin, listFeedbackFormsController);
router.post(
  "/admin/forms",
  requireAuth,
  requireAdmin,
  validateCreateFeedbackForm,
  createFeedbackFormController
);
router.put(
  "/admin/forms/:formId",
  requireAuth,
  requireAdmin,
  validateObjectIdParam("formId"),
  validateUpdateFeedbackForm,
  updateFeedbackFormController
);
router.delete(
  "/admin/forms/:formId",
  requireAuth,
  requireAdmin,
  validateObjectIdParam("formId"),
  deleteFeedbackFormController
);
router.patch(
  "/admin/forms/:formId/status",
  requireAuth,
  requireAdmin,
  validateObjectIdParam("formId"),
  updateFeedbackFormStatusController
);

router.post("/forms", validateCreateFeedbackForm, createFeedbackFormController);
router.get(
  "/forms/:formId",
  validateObjectIdParam("formId"),
  fetchFeedbackFormController
);
router.post("/responses", validateSubmitFeedback, submitFeedbackController);
router.get(
  "/forms/:formId/analytics",
  validateObjectIdParam("formId"),
  fetchAnalyticsController
);
router.get(
  "/forms/:formId/text-analysis",
  validateObjectIdParam("formId"),
  fetchTextFeedbackAnalysisController
);
router.get(
  "/forms/:formId/questions/:questionId/statistics",
  validateObjectIdParam("formId"),
  validateObjectIdParam("questionId"),
  fetchQuestionStatisticsController
);

export default router;
