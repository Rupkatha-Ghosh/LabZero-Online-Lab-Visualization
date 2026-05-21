import { useCallback, useEffect, useState } from 'react';
import {
  createAdminFeedbackForm,
  deleteAdminFeedbackForm,
  fetchAdminFeedbackForms,
  getFeedbackApiError,
  updateAdminFeedbackForm,
  updateAdminFeedbackFormStatus,
} from '../services/feedbackApi';
import {
  FeedbackAdminListQuery,
  FeedbackAdminListResponse,
  FeedbackForm,
  FeedbackFormDraft,
} from '../types/feedback.types';

const defaultList: FeedbackAdminListResponse = {
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const useFeedbackAdmin = (query: FeedbackAdminListQuery) => {
  const [data, setData] = useState<FeedbackAdminListResponse>(defaultList);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadForms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAdminFeedbackForms(query);
      setData(response);
    } catch (requestError) {
      setError(getFeedbackApiError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const runMutation = useCallback(
    async (mutation: () => Promise<unknown>) => {
      setIsMutating(true);
      setError(null);

      try {
        await mutation();
        await loadForms();
      } catch (requestError) {
        setError(getFeedbackApiError(requestError));
        throw requestError;
      } finally {
        setIsMutating(false);
      }
    },
    [loadForms]
  );

  return {
    forms: data.items,
    pagination: data.pagination,
    isLoading,
    isMutating,
    error,
    reload: loadForms,
    createForm: (draft: FeedbackFormDraft) =>
      runMutation(() => createAdminFeedbackForm(draft)),
    updateForm: (form: FeedbackForm, draft: FeedbackFormDraft) =>
      runMutation(() => updateAdminFeedbackForm(form._id, draft)),
    deleteForm: (form: FeedbackForm) =>
      runMutation(() => deleteAdminFeedbackForm(form._id)),
    updateStatus: (
      form: FeedbackForm,
      status: 'draft' | 'published' | 'closed'
    ) => runMutation(() => updateAdminFeedbackFormStatus(form._id, status)),
  };
};
