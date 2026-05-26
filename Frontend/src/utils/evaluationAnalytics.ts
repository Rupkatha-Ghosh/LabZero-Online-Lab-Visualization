import { safeLocalStorage } from './safeStorage';

export type EvaluationAnalyticsEvent =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'task_completed'
  | 'feedback_submitted'
  | 'progress_saved';

export interface EvaluationAnalyticsPayload {
  [key: string]: string | number | boolean | null | undefined;
}

const ANALYTICS_STORAGE_KEY = 'labzero_evaluation_analytics_events';

export interface StoredEvaluationAnalyticsEvent {
  event: EvaluationAnalyticsEvent;
  payload: EvaluationAnalyticsPayload;
  timestamp: string;
}

const readStoredEvents = (): StoredEvaluationAnalyticsEvent[] => {
  try {
    const raw = safeLocalStorage.getItem(ANALYTICS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('[EvaluationAnalytics] Could not read stored analytics events.', error);
    return [];
  }
};

const persistStoredEvents = (events: StoredEvaluationAnalyticsEvent[]) => {
  safeLocalStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events.slice(-200)));
};

export const trackEvaluationEvent = (
  event: EvaluationAnalyticsEvent,
  payload: EvaluationAnalyticsPayload = {},
) => {
  const analyticsEvent: StoredEvaluationAnalyticsEvent = {
    event,
    payload,
    timestamp: new Date().toISOString(),
  };

  persistStoredEvents([...readStoredEvents(), analyticsEvent]);

  // Backend-ready handoff: applications can subscribe and forward this to an API.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('labzero:evaluation-analytics', { detail: analyticsEvent }),
    );
  }
};

export const getStoredEvaluationAnalytics = readStoredEvents;
