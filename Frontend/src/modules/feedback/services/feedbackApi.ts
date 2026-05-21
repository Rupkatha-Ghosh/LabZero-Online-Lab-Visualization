import { AxiosError } from 'axios';
import { api } from '../../../services/api';
import {
  ApiEnvelope,
  FeedbackAdminListQuery,
  FeedbackAdminListResponse,
  FeedbackAnalytics,
  FeedbackAnalyticsFilters,
  FeedbackForm,
  FeedbackFormDraft,
  SubmitFeedbackPayload,
  TextFeedbackAnalysis,
} from '../types/feedback.types';
import { withRetry } from '../utils/async';

export const fetchFeedbackForm = async (formId: string) => {
  const response = await withRetry(() =>
    api.get<ApiEnvelope<FeedbackForm>>(`/feedback/forms/${formId}/`)
  );
  return response.data.data;
};

export const submitFeedbackResponse = async (
  payload: SubmitFeedbackPayload
) => {
  const response = await withRetry(() =>
    api.post<ApiEnvelope<unknown>>('/feedback/responses/', payload),
    1
  );
  return response.data;
};

export const submitSiteFeedback = async (payload: {
  rating: number;
  comment: string;
}) => {
  const response = await withRetry(() => api.post('/feedback/', payload), 1);
  return response.data;
};

export const fetchFeedbackAnalytics = async (
  formId: string,
  filters: FeedbackAnalyticsFilters = {}
) => {
  const response = await withRetry(() =>
    api.get<ApiEnvelope<FeedbackAnalytics>>(
      `/feedback/forms/${formId}/analytics/`,
      {
        params: filters,
      }
    )
  );
  return response.data.data;
};

export const fetchTextFeedbackAnalysis = async (formId: string) => {
  const response = await withRetry(() =>
    api.get<ApiEnvelope<TextFeedbackAnalysis>>(
      `/feedback/forms/${formId}/text-analysis/`
    )
  );
  return response.data.data;
};

export const fetchAdminFeedbackForms = async (
  query: FeedbackAdminListQuery
) => {
  const response = await withRetry(() =>
    api.get<ApiEnvelope<FeedbackAdminListResponse>>('/feedback/admin/forms/', {
      params: query,
    })
  );
  return response.data.data;
};

export const createAdminFeedbackForm = async (payload: FeedbackFormDraft) => {
  const response = await withRetry(
    () =>
      api.post<ApiEnvelope<FeedbackForm>>(
        '/feedback/admin/forms/',
        toApiFormPayload(payload)
      ),
    1
  );
  return response.data.data;
};

export const updateAdminFeedbackForm = async (
  formId: string,
  payload: FeedbackFormDraft
) => {
  const response = await withRetry(
    () =>
      api.put<ApiEnvelope<FeedbackForm>>(
        `/feedback/admin/forms/${formId}/`,
        toApiFormPayload(payload)
      ),
    1
  );
  return response.data.data;
};

export const deleteAdminFeedbackForm = async (formId: string) => {
  const response = await withRetry(
    () =>
      api.delete<ApiEnvelope<{ deleted: boolean }>>(
        `/feedback/admin/forms/${formId}/`
      ),
    1
  );
  return response.data.data;
};

export const updateAdminFeedbackFormStatus = async (
  formId: string,
  status: 'draft' | 'published' | 'closed'
) => {
  const response = await withRetry(
    () =>
      api.patch<ApiEnvelope<FeedbackForm>>(
        `/feedback/admin/forms/${formId}/status/`,
        { status }
      ),
    1
  );
  return response.data.data;
};

const toApiFormPayload = (payload: FeedbackFormDraft) => ({
  ...payload,
  sections: payload.sections.map((section) => ({
    title: section.title,
    description: section.description,
    questions: section.questions.map((question, index) => ({
      sectionTitle: section.title,
      prompt: question.prompt,
      type: question.type,
      required: question.required,
      options: ['checkbox', 'radio', 'dropdown'].includes(question.type)
        ? question.options
        : [],
      minRating: question.type === 'rating' ? question.minRating ?? 1 : undefined,
      maxRating: question.type === 'rating' ? question.maxRating ?? 5 : undefined,
      order: index,
    })),
  })),
});

export const getFeedbackApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      'Feedback request failed.'
    );
  }

  return error instanceof Error ? error.message : 'Feedback request failed.';
};
