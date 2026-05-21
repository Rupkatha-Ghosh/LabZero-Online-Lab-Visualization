import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchFeedbackAnalytics,
  fetchFeedbackForm,
  getFeedbackApiError,
} from '../services/feedbackApi';
import {
  FeedbackAnalytics,
  FeedbackAnalyticsFilters,
  FeedbackAnalyticsViewModel,
  FeedbackForm,
} from '../types/feedback.types';
import { buildAnalyticsViewModel } from '../utils/feedbackAnalytics';

export const useFeedbackAnalytics = (
  formId: string,
  filters: FeedbackAnalyticsFilters
) => {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!formId) {
      setIsLoading(false);
      setError('A feedback form id is required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [formData, analyticsData] = await Promise.all([
        fetchFeedbackForm(formId),
        fetchFeedbackAnalytics(formId, filters),
      ]);
      setForm(formData);
      setAnalytics(analyticsData);
    } catch (requestError) {
      setError(getFeedbackApiError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [filters, formId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const viewModel: FeedbackAnalyticsViewModel | null = useMemo(
    () => (analytics ? buildAnalyticsViewModel(analytics, form ?? undefined) : null),
    [analytics, form]
  );

  return {
    viewModel,
    isLoading,
    error,
    reload: loadAnalytics,
  };
};
