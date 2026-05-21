import { Types } from "mongoose";

export type FeedbackQuestionType =
  | "text"
  | "rating"
  | "checkbox"
  | "radio"
  | "dropdown";

export interface FeedbackUserDetails {
  userId?: Types.ObjectId | string;
  name?: string;
  email?: string;
  role?: "student" | "teacher" | "admin" | "institute" | string;
}

export interface ClassroomCourseMetadata {
  classroomId?: Types.ObjectId | string;
  classroomName?: string;
  courseId?: Types.ObjectId | string;
  courseName?: string;
  subject?: string;
  topic?: string;
  instituteId?: Types.ObjectId | string;
  instituteName?: string;
}

export interface FeedbackQuestionOption {
  label: string;
  value: string;
}

export interface FeedbackSectionInput {
  title: string;
  description?: string;
  questions: CreateFeedbackQuestionInput[];
}

export interface CreateFeedbackQuestionInput {
  sectionTitle: string;
  prompt: string;
  type: FeedbackQuestionType;
  required?: boolean;
  options?: FeedbackQuestionOption[];
  minRating?: number;
  maxRating?: number;
  order?: number;
}

export interface CreateFeedbackFormInput {
  title: string;
  description?: string;
  createdBy: FeedbackUserDetails;
  classroomCourseMetadata: ClassroomCourseMetadata;
  anonymousAllowed?: boolean;
  status?: "draft" | "published" | "closed";
  startsAt?: Date | string;
  endsAt?: Date | string;
  sections: FeedbackSectionInput[];
}

export interface FeedbackFormListQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: "draft" | "published" | "closed";
  classroomId?: string;
  teacherId?: string;
  department?: string;
}

export interface FeedbackAnswerInput {
  questionId: Types.ObjectId | string;
  value: string | number | string[];
}

export interface SubmitFeedbackInput {
  formId: Types.ObjectId | string;
  anonymous: boolean;
  userDetails?: FeedbackUserDetails;
  classroomCourseMetadata?: ClassroomCourseMetadata;
  answers: FeedbackAnswerInput[];
}

export interface QuestionStatistics {
  questionId: Types.ObjectId;
  type: FeedbackQuestionType;
  totalAnswers: number;
  averageRating?: number;
  optionCounts?: Record<string, number>;
  textAnswerCount?: number;
}

export interface TextFeedbackKeyword {
  keyword: string;
  count: number;
  score: number;
}

export interface TextFeedbackWordFrequency {
  word: string;
  count: number;
}

export interface TextFeedbackSentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
  averageScore: number;
  satisfactionPercentage: number;
}

export interface TextFeedbackQuestionAnalysis {
  questionId: Types.ObjectId | string;
  prompt: string;
  responseCount: number;
  keywords: TextFeedbackKeyword[];
  wordFrequencies: TextFeedbackWordFrequency[];
  sentiment: TextFeedbackSentimentSummary;
}

export interface TextFeedbackAnalysis {
  formId: Types.ObjectId | string;
  totalTextResponses: number;
  keywords: TextFeedbackKeyword[];
  wordFrequencies: TextFeedbackWordFrequency[];
  sentiment: TextFeedbackSentimentSummary;
  questions: TextFeedbackQuestionAnalysis[];
  generatedAt: Date;
}
