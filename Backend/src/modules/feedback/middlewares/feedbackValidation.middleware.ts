import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import {
  CreateFeedbackFormInput,
  FeedbackQuestionType,
  SubmitFeedbackInput,
} from "../types/feedback.types";

const questionTypes: FeedbackQuestionType[] = [
  "text",
  "rating",
  "checkbox",
  "radio",
  "dropdown",
];

const sendValidationError = (res: Response, message: string) =>
  res.status(400).json({ success: false, message });

const isObjectId = (value: unknown) =>
  typeof value === "string" && Types.ObjectId.isValid(value);

const isString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

export const validateObjectIdParam =
  (paramName: string) => (req: Request, res: Response, next: NextFunction) => {
    if (!isObjectId(req.params[paramName])) {
      return sendValidationError(res, `Invalid ${paramName}.`);
    }

    next();
  };

export const validateCreateFeedbackForm = (
  req: Request<unknown, unknown, CreateFeedbackFormInput>,
  res: Response,
  next: NextFunction
) => {
  const { title, createdBy, classroomCourseMetadata, sections } = req.body;

  if (!isString(title)) {
    return sendValidationError(res, "Feedback form title is required.");
  }

  if (!createdBy || !createdBy.userId) {
    return sendValidationError(res, "createdBy.userId is required.");
  }

  if (!classroomCourseMetadata) {
    return sendValidationError(
      res,
      "classroomCourseMetadata is required for feedback forms."
    );
  }

  if (!Array.isArray(sections) || sections.length === 0) {
    return sendValidationError(res, "At least one feedback section is required.");
  }

  for (const [sectionIndex, section] of sections.entries()) {
    if (!isString(section.title)) {
      return sendValidationError(
        res,
        `Section ${sectionIndex + 1} must include a title.`
      );
    }

    if (
      !Array.isArray(section.questions) ||
      section.questions.length < 3 ||
      section.questions.length > 5
    ) {
      return sendValidationError(
        res,
        `Section "${section.title}" must contain 3 to 5 questions.`
      );
    }

    for (const [questionIndex, question] of section.questions.entries()) {
      if (!isString(question.prompt)) {
        return sendValidationError(
          res,
          `Question ${questionIndex + 1} in "${section.title}" needs a prompt.`
        );
      }

      if (!questionTypes.includes(question.type)) {
        return sendValidationError(
          res,
          `Question "${question.prompt}" has an unsupported type.`
        );
      }

      if (
        ["checkbox", "radio", "dropdown"].includes(question.type) &&
        (!Array.isArray(question.options) || question.options.length < 2)
      ) {
        return sendValidationError(
          res,
          `Question "${question.prompt}" needs at least two options.`
        );
      }

      if (
        question.type === "rating" &&
        question.minRating !== undefined &&
        question.maxRating !== undefined &&
        question.minRating >= question.maxRating
      ) {
        return sendValidationError(
          res,
          `Question "${question.prompt}" has invalid rating bounds.`
        );
      }
    }
  }

  next();
};

export const validateUpdateFeedbackForm = validateCreateFeedbackForm;

export const validateSubmitFeedback = (
  req: Request<unknown, unknown, SubmitFeedbackInput>,
  res: Response,
  next: NextFunction
) => {
  const { formId, anonymous, userDetails, answers } = req.body;

  if (!isObjectId(formId)) {
    return sendValidationError(res, "A valid formId is required.");
  }

  if (typeof anonymous !== "boolean") {
    return sendValidationError(res, "anonymous must be a boolean.");
  }

  if (!anonymous && (!userDetails || !userDetails.userId)) {
    return sendValidationError(
      res,
      "Identified feedback requires userDetails.userId."
    );
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return sendValidationError(res, "At least one answer is required.");
  }

  for (const answer of answers) {
    if (!isObjectId(answer.questionId)) {
      return sendValidationError(res, "Every answer needs a valid questionId.");
    }

    if (
      answer.value === undefined ||
      answer.value === null ||
      (typeof answer.value === "string" && answer.value.trim().length === 0) ||
      (Array.isArray(answer.value) && answer.value.length === 0)
    ) {
      return sendValidationError(res, "Every answer must include a value.");
    }
  }

  next();
};
