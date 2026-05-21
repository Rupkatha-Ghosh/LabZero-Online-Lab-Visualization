import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchFeedbackForm,
  getFeedbackApiError,
  submitFeedbackResponse,
} from '../services/feedbackApi';
import {
  FeedbackForm,
  FeedbackFormValues,
  SubmitFeedbackPayload,
} from '../types/feedback.types';
import { getAllQuestions } from '../utils/feedbackValidation';

export const useFeedbackForm = (formId: string) => {
  const { user } = useAuth();
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadForm = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchFeedbackForm(formId);
      setForm(data);
    } catch (requestError) {
      setError(getFeedbackApiError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const questionCount = useMemo(
    () => (form ? getAllQuestions(form).length : 0),
    [form]
  );

  const submitFeedback = useCallback(
    async (values: FeedbackFormValues) => {
      if (!form) {
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const payload: SubmitFeedbackPayload = {
        formId: form._id,
        anonymous: values.anonymous,
        classroomCourseMetadata: form.classroomCourseMetadata,
        userDetails: values.anonymous
          ? undefined
          : {
              userId: user?.id,
              name: [user?.first_name, user?.last_name].filter(Boolean).join(' '),
              email: user?.email,
              role: user?.role,
            },
        answers: getAllQuestions(form).map((question) => ({
          questionId: question._id,
          value: values.answers[question._id],
        })),
      };

      try {
        await submitFeedbackResponse(payload);
        setSuccessMessage('Feedback submitted successfully.');
      } catch (requestError) {
        setError(getFeedbackApiError(requestError));
        throw requestError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, user]
  );

  return {
    form,
    questionCount,
    isLoading,
    isSubmitting,
    error,
    successMessage,
    reload: loadForm,
    submitFeedback,
    clearSuccess: () => setSuccessMessage(null),
  };
};
