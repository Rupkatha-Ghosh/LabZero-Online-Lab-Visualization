import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IFeedbackAnswer {
  questionId: Types.ObjectId;
  value: string | number | string[];
}

export interface IFeedbackResponse extends Document {
  formId: Types.ObjectId;
  userDetails?: {
    userId?: Types.ObjectId;
    name?: string;
    email?: string;
    role?: string;
  };
  anonymous: boolean;
  classroomCourseMetadata: {
    classroomId?: Types.ObjectId;
    classroomName?: string;
    courseId?: Types.ObjectId;
    courseName?: string;
    subject?: string;
    topic?: string;
    instituteId?: Types.ObjectId;
    instituteName?: string;
  };
  answers: IFeedbackAnswer[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mixedAnswerValueSchema = {
  type: Schema.Types.Mixed,
  required: true,
};

const feedbackAnswerSchema = new Schema<IFeedbackAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "FeedbackQuestion",
      required: true,
    },
    value: mixedAnswerValueSchema,
  },
  { _id: false }
);

const userDetailsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    role: { type: String, trim: true },
  },
  { _id: false }
);

const classroomCourseMetadataSchema = new Schema(
  {
    classroomId: { type: Schema.Types.ObjectId, ref: "Classroom" },
    classroomName: { type: String, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    courseName: { type: String, trim: true },
    subject: { type: String, trim: true },
    topic: { type: String, trim: true },
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute" },
    instituteName: { type: String, trim: true },
  },
  { _id: false }
);

const feedbackResponseSchema = new Schema<IFeedbackResponse>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "FeedbackForm",
      required: true,
      index: true,
    },
    userDetails: { type: userDetailsSchema },
    anonymous: { type: Boolean, required: true, default: false },
    classroomCourseMetadata: {
      type: classroomCourseMetadataSchema,
      required: true,
    },
    answers: {
      type: [feedbackAnswerSchema],
      required: true,
      validate: {
        validator(answers: IFeedbackAnswer[]) {
          return Array.isArray(answers) && answers.length > 0;
        },
        message: "A feedback response must include at least one answer.",
      },
    },
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

feedbackResponseSchema.index({ formId: 1, submittedAt: -1 });
feedbackResponseSchema.index({ "userDetails.userId": 1, formId: 1 });

export const FeedbackResponse: Model<IFeedbackResponse> =
  mongoose.models.FeedbackResponse ||
  mongoose.model<IFeedbackResponse>("FeedbackResponse", feedbackResponseSchema);
