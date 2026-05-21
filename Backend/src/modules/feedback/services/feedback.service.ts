import { Types } from "mongoose";
import { rebuildFeedbackAnalytics } from "../analytics/feedbackAnalytics.service";
import { FeedbackAnalytics } from "../models/FeedbackAnalytics";
import { FeedbackForm } from "../models/FeedbackForm";
import { FeedbackQuestion, IFeedbackQuestion } from "../models/FeedbackQuestion";
import { FeedbackResponse } from "../models/FeedbackResponse";
import {
  CreateFeedbackFormInput,
  FeedbackAnswerInput,
  FeedbackFormListQuery,
  SubmitFeedbackInput,
} from "../types/feedback.types";

const toObjectId = (value: Types.ObjectId | string | undefined) =>
  value ? new Types.ObjectId(value) : undefined;

export const createFeedbackForm = async (payload: CreateFeedbackFormInput) => {
  const formId = new Types.ObjectId();
  const questionDocuments = payload.sections.flatMap((section) =>
    section.questions.map((question, questionIndex) => ({
      formId,
      sectionTitle: section.title,
      prompt: question.prompt,
      type: question.type,
      required: question.required ?? true,
      options: question.options ?? [],
      minRating: question.minRating,
      maxRating: question.maxRating,
      order: question.order ?? questionIndex,
    }))
  );
  const createdQuestions = await FeedbackQuestion.insertMany(questionDocuments);

  const form = await FeedbackForm.create({
    _id: formId,
    title: payload.title,
    description: payload.description,
    createdBy: {
      ...payload.createdBy,
      userId: toObjectId(payload.createdBy.userId),
    },
    classroomCourseMetadata: normalizeMetadata(payload.classroomCourseMetadata),
    anonymousAllowed: payload.anonymousAllowed ?? true,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    status: payload.status ?? "draft",
    sections: payload.sections.map((section, index) => ({
      title: section.title,
      description: section.description,
      questionIds: createdQuestions
        .filter((question) => question.sectionTitle === section.title)
        .map((question) => question._id),
      order: index,
    })),
  });

  await rebuildFeedbackAnalytics(formId.toString());

  return getFeedbackFormById(form._id.toString());
};

export const listFeedbackForms = async (query: FeedbackFormListQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;
  const filters: Record<string, unknown> = {};

  if (query.status) {
    filters.status = query.status;
  }

  if (query.classroomId) {
    filters["classroomCourseMetadata.classroomId"] = toObjectId(query.classroomId);
  }

  if (query.teacherId) {
    filters["createdBy.userId"] = toObjectId(query.teacherId);
  }

  if (query.department) {
    filters["classroomCourseMetadata.subject"] = query.department;
  }

  if (query.search) {
    filters.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { "classroomCourseMetadata.courseName": { $regex: query.search, $options: "i" } },
      { "classroomCourseMetadata.classroomName": { $regex: query.search, $options: "i" } },
    ];
  }

  const [forms, total] = await Promise.all([
    FeedbackForm.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    FeedbackForm.countDocuments(filters),
  ]);

  return {
    items: forms,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateFeedbackForm = async (
  formId: string,
  payload: CreateFeedbackFormInput
) => {
  const existingForm = await FeedbackForm.findById(formId);

  if (!existingForm) {
    throw new Error("Feedback form not found.");
  }

  await FeedbackQuestion.deleteMany({ formId });

  const createdQuestions = await FeedbackQuestion.insertMany(
    payload.sections.flatMap((section) =>
      section.questions.map((question, questionIndex) => ({
        formId,
        sectionTitle: section.title,
        prompt: question.prompt,
        type: question.type,
        required: question.required ?? true,
        options: question.options ?? [],
        minRating: question.minRating,
        maxRating: question.maxRating,
        order: question.order ?? questionIndex,
      }))
    )
  );

  existingForm.set({
    title: payload.title,
    description: payload.description,
    createdBy: {
      ...payload.createdBy,
      userId: toObjectId(payload.createdBy.userId),
    },
    classroomCourseMetadata: normalizeMetadata(payload.classroomCourseMetadata),
    anonymousAllowed: payload.anonymousAllowed ?? true,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    status: payload.status ?? existingForm.status,
    sections: payload.sections.map((section, index) => ({
      title: section.title,
      description: section.description,
      questionIds: createdQuestions
        .filter((question) => question.sectionTitle === section.title)
        .map((question) => question._id),
      order: index,
    })),
  });

  await existingForm.save();
  await rebuildFeedbackAnalytics(formId);

  return getFeedbackFormById(formId);
};

export const deleteFeedbackForm = async (formId: string) => {
  const form = await FeedbackForm.findById(formId);

  if (!form) {
    throw new Error("Feedback form not found.");
  }

  await Promise.all([
    FeedbackQuestion.deleteMany({ formId }),
    FeedbackResponse.deleteMany({ formId }),
    FeedbackAnalytics.deleteOne({ formId }),
    FeedbackForm.deleteOne({ _id: formId }),
  ]);

  return { deleted: true, formId };
};

export const updateFeedbackFormStatus = async (
  formId: string,
  status: "draft" | "published" | "closed"
) => {
  const form = await FeedbackForm.findByIdAndUpdate(
    formId,
    { status },
    { new: true }
  ).lean();

  if (!form) {
    throw new Error("Feedback form not found.");
  }

  return form;
};

export const getFeedbackFormById = async (formId: string) => {
  const form = await FeedbackForm.findById(formId).lean();

  if (!form) {
    throw new Error("Feedback form not found.");
  }

  const questions = await FeedbackQuestion.find({ formId, isActive: true })
    .sort({ sectionTitle: 1, order: 1 })
    .lean();

  return {
    ...form,
    sections: form.sections.map((section) => ({
      ...section,
      questions: questions.filter((question) =>
        section.questionIds.some(
          (questionId) => questionId.toString() === question._id.toString()
        )
      ),
    })),
  };
};

export const submitFeedback = async (payload: SubmitFeedbackInput) => {
  const form = await FeedbackForm.findById(payload.formId);

  if (!form) {
    throw new Error("Feedback form not found.");
  }

  if (form.status !== "published") {
    throw new Error("This feedback form is not accepting responses.");
  }

  if (payload.anonymous && !form.anonymousAllowed) {
    throw new Error("Anonymous submissions are not allowed for this form.");
  }

  const now = new Date();
  if (form.startsAt && now < form.startsAt) {
    throw new Error("This feedback form is not open yet.");
  }

  if (form.endsAt && now > form.endsAt) {
    throw new Error("This feedback form is closed.");
  }

  const questions = await FeedbackQuestion.find({
    formId: payload.formId,
    isActive: true,
  });

  validateAnswersAgainstQuestions(payload.answers, questions);

  const response = await FeedbackResponse.create({
    formId: payload.formId,
    anonymous: payload.anonymous,
    userDetails: payload.anonymous
      ? undefined
      : {
          ...payload.userDetails,
          userId: toObjectId(payload.userDetails?.userId),
        },
    classroomCourseMetadata: normalizeMetadata(
      payload.classroomCourseMetadata ?? form.classroomCourseMetadata
    ),
    answers: payload.answers.map((answer) => ({
      questionId: toObjectId(answer.questionId),
      value: answer.value,
    })),
    submittedAt: now,
  });

  await rebuildFeedbackAnalytics(payload.formId.toString());

  return response;
};

export const getFeedbackAnalytics = async (formId: string) => {
  const formExists = await FeedbackForm.exists({ _id: formId });

  if (!formExists) {
    throw new Error("Feedback form not found.");
  }

  return FeedbackAnalytics.findOne({ formId }).lean();
};

const normalizeMetadata = (metadata: Record<string, unknown>) => ({
  ...metadata,
  classroomId: toObjectId(metadata.classroomId as string | undefined),
  courseId: toObjectId(metadata.courseId as string | undefined),
  instituteId: toObjectId(metadata.instituteId as string | undefined),
});

const validateAnswersAgainstQuestions = (
  answers: FeedbackAnswerInput[],
  questions: IFeedbackQuestion[]
) => {
  const questionMap = new Map(
    questions.map((question) => [question._id.toString(), question])
  );
  const answerMap = new Map(
    answers.map((answer) => [answer.questionId.toString(), answer])
  );

  for (const question of questions) {
    const answer = answerMap.get(question._id.toString());

    if (question.required && !answer) {
      throw new Error(`Missing required answer for "${question.prompt}".`);
    }

    if (answer) {
      validateAnswerValue(answer, question);
    }
  }

  for (const answer of answers) {
    if (!questionMap.has(answer.questionId.toString())) {
      throw new Error("Submitted answer contains an unknown questionId.");
    }
  }
};

const validateAnswerValue = (
  answer: FeedbackAnswerInput,
  question: IFeedbackQuestion
) => {
  if (question.type === "text" && typeof answer.value !== "string") {
    throw new Error(`Answer for "${question.prompt}" must be text.`);
  }

  if (question.type === "rating") {
    const value = Number(answer.value);

    if (
      !Number.isFinite(value) ||
      value < (question.minRating ?? 1) ||
      value > (question.maxRating ?? 5)
    ) {
      throw new Error(`Answer for "${question.prompt}" is outside rating bounds.`);
    }
  }

  if (question.type === "checkbox" && !Array.isArray(answer.value)) {
    throw new Error(`Answer for "${question.prompt}" must be an array.`);
  }

  if (["checkbox", "radio", "dropdown"].includes(question.type)) {
    const allowedValues = new Set(question.options.map((option) => option.value));
    const values = Array.isArray(answer.value) ? answer.value : [answer.value];

    for (const value of values) {
      if (!allowedValues.has(String(value))) {
        throw new Error(`Answer for "${question.prompt}" has an invalid option.`);
      }
    }
  }
};
