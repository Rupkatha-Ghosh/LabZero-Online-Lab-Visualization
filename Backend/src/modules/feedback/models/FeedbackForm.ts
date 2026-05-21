import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IFeedbackFormSection {
  title: string;
  description?: string;
  questionIds: Types.ObjectId[];
  order: number;
}

export interface IFeedbackForm extends Document {
  title: string;
  description?: string;
  createdBy: {
    userId?: Types.ObjectId;
    name?: string;
    email?: string;
    role?: string;
  };
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
  anonymousAllowed: boolean;
  startsAt?: Date;
  endsAt?: Date;
  sections: IFeedbackFormSection[];
  status: "draft" | "published" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

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

const feedbackFormSectionSchema = new Schema<IFeedbackFormSection>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    questionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "FeedbackQuestion",
        required: true,
      },
    ],
    order: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const feedbackFormSchema = new Schema<IFeedbackForm>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    createdBy: { type: userDetailsSchema, required: true },
    classroomCourseMetadata: {
      type: classroomCourseMetadataSchema,
      required: true,
    },
    anonymousAllowed: { type: Boolean, default: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
    sections: {
      type: [feedbackFormSectionSchema],
      required: true,
      validate: {
        validator(sections: IFeedbackFormSection[]) {
          return (
            Array.isArray(sections) &&
            sections.length > 0 &&
            sections.every(
              (section) =>
                section.questionIds.length >= 3 && section.questionIds.length <= 5
            )
          );
        },
        message: "Each feedback section must contain 3 to 5 questions.",
      },
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

feedbackFormSchema.pre("validate", function validateDateWindow(next) {
  if (this.startsAt && this.endsAt && this.startsAt >= this.endsAt) {
    next(new Error("startsAt must be earlier than endsAt."));
    return;
  }

  next();
});

feedbackFormSchema.index({ "classroomCourseMetadata.classroomId": 1 });
feedbackFormSchema.index({ "classroomCourseMetadata.courseId": 1 });
feedbackFormSchema.index({ createdAt: -1 });

export const FeedbackForm: Model<IFeedbackForm> =
  mongoose.models.FeedbackForm ||
  mongoose.model<IFeedbackForm>("FeedbackForm", feedbackFormSchema);
