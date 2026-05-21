import { useCallback, useEffect, useState } from 'react';
import {
  fetchTextFeedbackAnalysis,
  getFeedbackApiError,
} from '../services/feedbackApi';
import { TextFeedbackAnalysis } from '../types/feedback.types';

export const useTextFeedbackAnalysis = (formId: string) => {
  const [analysis, setAnalysis] = useState<TextFeedbackAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysis = useCallback(async () => {
    if (!formId) {
      setIsLoading(false);
      setError('A feedback form id is required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTextFeedbackAnalysis(formId);
      setAnalysis(data);
    } catch (requestError) {
      setError(getFeedbackApiError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  return {
    analysis,
    isLoading,
    error,
    reload: loadAnalysis,
  };
};
