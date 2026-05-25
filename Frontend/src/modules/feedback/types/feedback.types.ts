export type FeedbackQuestionType =
  | 'text'
  | 'rating'
  | 'checkbox'
  | 'radio'
  | 'dropdown';

export interface FeedbackQuestionOption {
  label: string;
  value: string;
}

export interface FeedbackQuestion {
  _id: string;
  id?: string;
  sectionTitle: string;
  prompt: string;
  type: FeedbackQuestionType;
  required: boolean;
  options?: FeedbackQuestionOption[];
  minRating?: number;
  maxRating?: number;
  order: number;
}

export interface FeedbackSectionData {
  title: string;
  description?: string;
  questionIds: string[];
  order: number;
  questions: FeedbackQuestion[];
}

export interface FeedbackUserDetails {
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface ClassroomCourseMetadata {
  classroomId?: string;
  classroomName?: string;
  courseId?: string;
  courseName?: string;
  subject?: string;
  topic?: string;
  instituteId?: string;
  instituteName?: string;
}

export interface FeedbackForm {
  _id: string;
  title: string;
  description?: string;
  anonymousAllowed: boolean;
  status?: 'draft' | 'published' | 'closed';
  createdBy?: FeedbackUserDetails;
  classroomCourseMetadata?: ClassroomCourseMetadata;
  startsAt?: string;
  endsAt?: string;
  sections: FeedbackSectionData[];
}

export interface FeedbackQuestionDraft {
  id: string;
  prompt: string;
  type: FeedbackQuestionType;
  required: boolean;
  options: FeedbackQuestionOption[];
  minRating?: number;
  maxRating?: number;
  order: number;
}

export interface FeedbackSectionDraft {
  id: string;
  title: string;
  description?: string;
  questions: FeedbackQuestionDraft[];
}

export interface FeedbackFormDraft {
  title: string;
  description?: string;
  anonymousAllowed: boolean;
  status: 'draft' | 'published' | 'closed';
  createdBy: FeedbackUserDetails;
  classroomCourseMetadata: ClassroomCourseMetadata;
  startsAt?: string;
  endsAt?: string;
  sections: FeedbackSectionDraft[];
}

export type FeedbackAnswerValue = string | number | string[];

export interface FeedbackFormValues {
  anonymous: boolean;
  answers: Record<string, FeedbackAnswerValue>;
}

export interface SubmitFeedbackPayload {
  formId: string;
  anonymous: boolean;
  userDetails?: FeedbackUserDetails;
  classroomCourseMetadata?: ClassroomCourseMetadata;
  answers: Array<{
    questionId: string;
    value: FeedbackAnswerValue;
  }>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface QuestionComponentProps {
  question: FeedbackQuestion;
  value?: FeedbackAnswerValue;
  error?: string;
  disabled?: boolean;
  onChange: (value: FeedbackAnswerValue) => void;
}

export interface FeedbackAnalyticsFilters {
  classroomId?: string;
  teacherId?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}

export interface FeedbackAdminListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: 'draft' | 'published' | 'closed';
  classroomId?: string;
  teacherId?: string;
  department?: string;
}

export interface FeedbackAdminListResponse {
  items: FeedbackForm[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FeedbackFilterOption {
  label: string;
  value: string;
}

export interface FeedbackQuestionAnalytics {
  questionId: string;
  prompt?: string;
  type: FeedbackQuestionType;
  totalAnswers: number;
  averageRating?: number;
  ratingSum?: number;
  ratingDistribution?: Record<string, number>;
  optionCounts?: Record<string, number>;
  textAnswerCount?: number;
  heatmap?: Array<{
    label: string;
    rating: number;
    count: number;
  }>;
}

export interface FeedbackAnalyticsSummary {
  totalResponses: number;
  anonymousResponses: number;
  identifiedResponses: number;
  averageRating: number;
  satisfactionPercentage: number;
}

export interface FeedbackAnalytics {
  formId: string;
  totalResponses: number;
  anonymousResponses: number;
  identifiedResponses: number;
  questionStats: FeedbackQuestionAnalytics[];
  lastCalculatedAt?: string;
  summary?: Partial<FeedbackAnalyticsSummary>;
}

export interface FeedbackAnalyticsViewModel {
  form?: FeedbackForm;
  analytics: FeedbackAnalytics;
  summary: FeedbackAnalyticsSummary;
  questionStats: FeedbackQuestionAnalytics[];
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
  questionId: string;
  prompt: string;
  responseCount: number;
  keywords: TextFeedbackKeyword[];
  wordFrequencies: TextFeedbackWordFrequency[];
  sentiment: TextFeedbackSentimentSummary;
}

export interface TextFeedbackAnalysis {
  formId: string;
  totalTextResponses: number;
  keywords: TextFeedbackKeyword[];
  wordFrequencies: TextFeedbackWordFrequency[];
  sentiment: TextFeedbackSentimentSummary;
  questions: TextFeedbackQuestionAnalysis[];
  generatedAt: string;
}

export interface FeedbackAdminFormOverview {
  form: FeedbackForm;
  analytics: FeedbackAnalytics;
  textAnalysis: Omit<TextFeedbackAnalysis, 'formId' | 'questions' | 'generatedAt'>;
}

export interface FeedbackAdminOverview {
  overall: {
    totalForms: number;
    totalResponses: number;
    anonymousResponses: number;
    identifiedResponses: number;
    totalQuestions: number;
    questionTypeCounts: Record<string, number>;
    averageRating: number;
    satisfactionPercentage: number;
    ratingDistribution: Record<string, number>;
    optionCounts: Record<string, number>;
    textAnalysis: Omit<TextFeedbackAnalysis, 'formId' | 'questions' | 'generatedAt'>;
    siteFeedback: {
      total: number;
      averageRating: number;
      ratingDistribution: Record<string, number>;
    };
  };
  forms: FeedbackAdminFormOverview[];
}
