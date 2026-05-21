import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { FeedbackQuestionType } from "../types/feedback.types";

export interface IFeedbackQuestion extends Document {
  formId: Types.ObjectId;
  sectionTitle: string;
  prompt: string;
  type: FeedbackQuestionType;
  required: boolean;
  options: { label: string; value: string }[];
  minRating?: number;
  maxRating?: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const feedbackQuestionSchema = new Schema<IFeedbackQuestion>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "FeedbackForm",
      required: true,
      index: true,
    },
    sectionTitle: { type: String, required: true, trim: true },
    prompt: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "rating", "checkbox", "radio", "dropdown"],
      required: true,
    },
    required: { type: Boolean, default: true },
    options: {
      type: [optionSchema],
      default: [],
      validate: {
        validator(this: IFeedbackQuestion, options: IFeedbackQuestion["options"]) {
          if (["checkbox", "radio", "dropdown"].includes(this.type)) {
            return Array.isArray(options) && options.length >= 2;
          }
          return options.length === 0;
        },
        message:
          "Checkbox, radio, and dropdown questions need at least two options; text and rating questions should not include options.",
      },
    },
    minRating: {
      type: Number,
      min: 1,
      default: undefined,
    },
    maxRating: {
      type: Number,
      min: 2,
      default: undefined,
    },
    order: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

feedbackQuestionSchema.pre("validate", function normalizeRatingBounds(next) {
  if (this.type === "rating") {
    this.minRating = this.minRating ?? 1;
    this.maxRating = this.maxRating ?? 5;
  } else {
    this.minRating = undefined;
    this.maxRating = undefined;
  }

  if (
    this.type === "rating" &&
    typeof this.minRating === "number" &&
    typeof this.maxRating === "number" &&
    this.minRating >= this.maxRating
  ) {
    next(new Error("minRating must be lower than maxRating."));
    return;
  }

  next();
});

feedbackQuestionSchema.index({ formId: 1, sectionTitle: 1, order: 1 });

export const FeedbackQuestion: Model<IFeedbackQuestion> =
  mongoose.models.FeedbackQuestion ||
  mongoose.model<IFeedbackQuestion>("FeedbackQuestion", feedbackQuestionSchema);
