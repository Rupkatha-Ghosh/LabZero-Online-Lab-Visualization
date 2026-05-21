import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IFeedbackQuestionStat {
  questionId: Types.ObjectId;
  type: "text" | "rating" | "checkbox" | "radio" | "dropdown";
  totalAnswers: number;
  averageRating?: number;
  ratingSum?: number;
  optionCounts?: Map<string, number>;
  textAnswerCount?: number;
}

export interface IFeedbackAnalytics extends Document {
  formId: Types.ObjectId;
  totalResponses: number;
  anonymousResponses: number;
  identifiedResponses: number;
  questionStats: IFeedbackQuestionStat[];
  lastCalculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackQuestionStatSchema = new Schema<IFeedbackQuestionStat>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "FeedbackQuestion",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "rating", "checkbox", "radio", "dropdown"],
      required: true,
    },
    totalAnswers: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, min: 0 },
    ratingSum: { type: Number, default: 0, min: 0 },
    optionCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    textAnswerCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const feedbackAnalyticsSchema = new Schema<IFeedbackAnalytics>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "FeedbackForm",
      required: true,
      unique: true,
      index: true,
    },
    totalResponses: { type: Number, default: 0, min: 0 },
    anonymousResponses: { type: Number, default: 0, min: 0 },
    identifiedResponses: { type: Number, default: 0, min: 0 },
    questionStats: { type: [feedbackQuestionStatSchema], default: [] },
    lastCalculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const FeedbackAnalytics: Model<IFeedbackAnalytics> =
  mongoose.models.FeedbackAnalytics ||
  mongoose.model<IFeedbackAnalytics>(
    "FeedbackAnalytics",
    feedbackAnalyticsSchema
  );
