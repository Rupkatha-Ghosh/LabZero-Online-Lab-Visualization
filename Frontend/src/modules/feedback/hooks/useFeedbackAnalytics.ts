import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAdminFeedbackOverview,
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

const siteFeedbackFormMock: FeedbackForm = {
  _id: 'site-feedback',
  title: 'Site feedback',
  description: 'Feedback submitted from the LabZero feedback page.',
  anonymousAllowed: false,
  status: 'published',
  sections: [
    {
      title: 'Written Feedback',
      questionIds: ['sf-text-1', 'sf-text-2', 'sf-text-3', 'sf-text-4', 'sf-text-5'],
      order: 0,
      questions: [
        { _id: 'sf-text-1', prompt: 'Which laboratory simulation or interactive visualization helped you understand a concept best, and why?', type: 'text', required: true, order: 0, sectionTitle: 'Written Feedback' },
        { _id: 'sf-text-2', prompt: 'What technical issues did you face while running or interacting with the 3D/graphical lab visualizations?', type: 'text', required: true, order: 1, sectionTitle: 'Written Feedback' },
        { _id: 'sf-text-3', prompt: 'How interactive and collaborative was your experience during live virtual lab sessions?', type: 'text', required: true, order: 2, sectionTitle: 'Written Feedback' },
        { _id: 'sf-text-4', prompt: 'What improvements would you suggest for better learning?', type: 'text', required: true, order: 3, sectionTitle: 'Written Feedback' },
        { _id: 'sf-text-5', prompt: 'Any additional comments regarding student experience?', type: 'text', required: true, order: 4, sectionTitle: 'Written Feedback' },
      ]
    },
    {
      title: 'Ratings',
      questionIds: ['sf-rating-1', 'sf-rating-2', 'sf-rating-3', 'sf-rating-4', 'sf-rating-5'],
      order: 1,
      questions: [
        { _id: 'sf-rating-1', prompt: 'Rate the overall usability of LabZero.', type: 'rating', required: true, order: 0, sectionTitle: 'Ratings' },
        { _id: 'sf-rating-2', prompt: 'Rate the quality of classroom interaction.', type: 'rating', required: true, order: 1, sectionTitle: 'Ratings' },
        { _id: 'sf-rating-3', prompt: 'Rate the ease of accessing study resources and lecture notes.', type: 'rating', required: true, order: 2, sectionTitle: 'Ratings' },
        { _id: 'sf-rating-4', prompt: 'Rate the responsiveness and interactive control smoothness of the lab simulations.', type: 'rating', required: true, order: 3, sectionTitle: 'Ratings' },
        { _id: 'sf-rating-5', prompt: 'Rate how well the virtual lab simulation matched your real-world lab expectations.', type: 'rating', required: true, order: 4, sectionTitle: 'Ratings' },
      ]
    },
    {
      title: 'Feature Usage and Improvements',
      questionIds: ['sf-checkbox-1', 'sf-checkbox-2', 'sf-checkbox-3'],
      order: 2,
      questions: [
        { _id: 'sf-checkbox-1', prompt: 'Which features do you use regularly?', type: 'checkbox', required: true, order: 0, sectionTitle: 'Feature Usage and Improvements' },
        { _id: 'sf-checkbox-2', prompt: 'What improvements would you like?', type: 'checkbox', required: true, order: 1, sectionTitle: 'Feature Usage and Improvements' },
        { _id: 'sf-checkbox-3', prompt: 'Which devices do you use for LabZero?', type: 'checkbox', required: true, order: 2, sectionTitle: 'Feature Usage and Improvements' },
      ]
    },
    {
      title: 'Usage and Satisfaction',
      questionIds: ['sf-radio-1', 'sf-radio-2', 'sf-radio-3'],
      order: 3,
      questions: [
        { _id: 'sf-radio-1', prompt: 'What is your initial impression of the LabZero onboarding tour?', type: 'radio', required: true, order: 0, sectionTitle: 'Usage and Satisfaction' },
        { _id: 'sf-radio-2', prompt: 'Overall satisfaction with the platform?', type: 'radio', required: true, order: 1, sectionTitle: 'Usage and Satisfaction' },
        { _id: 'sf-radio-3', prompt: 'How easily can you follow laboratory procedures using the platform?', type: 'radio', required: true, order: 2, sectionTitle: 'Usage and Satisfaction' },
      ]
    },
    {
      title: 'Academic and Access Details',
      questionIds: ['sf-dropdown-1', 'sf-dropdown-2', 'sf-dropdown-3', 'sf-dropdown-4', 'sf-dropdown-5'],
      order: 4,
      questions: [
        { _id: 'sf-dropdown-1', prompt: 'Select your department.', type: 'dropdown', required: true, order: 0, sectionTitle: 'Academic and Access Details' },
        { _id: 'sf-dropdown-2', prompt: 'Select your year/semester.', type: 'dropdown', required: true, order: 1, sectionTitle: 'Academic and Access Details' },
        { _id: 'sf-dropdown-3', prompt: 'Select your student level / institution type.', type: 'dropdown', required: true, order: 2, sectionTitle: 'Academic and Access Details' },
        { _id: 'sf-dropdown-4', prompt: 'Select your internet connectivity quality.', type: 'dropdown', required: true, order: 3, sectionTitle: 'Academic and Access Details' },
        { _id: 'sf-dropdown-5', prompt: 'Select how easily you were able to navigate to the lab visualization page.', type: 'dropdown', required: true, order: 4, sectionTitle: 'Academic and Access Details' },
      ]
    }
  ]
};

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
      if (formId === 'site-feedback') {
        const overview = await fetchAdminFeedbackOverview();
        const analyticsData = overview.overall.siteFeedback.analytics;
        if (!analyticsData) {
          throw new Error('Site feedback analytics not found.');
        }
        setForm(siteFeedbackFormMock);
        setAnalytics(analyticsData);
      } else {
        const [formData, analyticsData] = await Promise.all([
          fetchFeedbackForm(formId),
          fetchFeedbackAnalytics(formId, filters),
        ]);
        setForm(formData);
        setAnalytics(analyticsData);
      }
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
