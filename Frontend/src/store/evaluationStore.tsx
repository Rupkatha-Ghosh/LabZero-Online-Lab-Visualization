import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { safeLocalStorage } from '../utils/safeStorage';
import { trackEvaluationEvent } from '../utils/evaluationAnalytics';
import { useAuth } from '../context/AuthContext';

export type EvaluationTaskKey =
  | 'loginCompleted'
  | 'dashboardVisited'
  | 'uploadDone'
  | 'subjectsChecked';

export interface EvaluationProgressState {
  tourCompleted: boolean;
  loginCompleted: boolean;
  dashboardVisited: boolean;
  uploadDone: boolean;
  subjectsChecked: boolean;
}

export interface EvaluationMetadata {
  onboardingStartedAt: number | null;
  onboardingCompletedAt: number | null;
  taskCompletedAt: Partial<Record<EvaluationTaskKey, number>>;
  feedbackSubmittedAt: number | null;
  feedbackSubmission?: EvaluationFeedbackSubmission;
}

export interface EvaluationFeedbackSubmission {
  dashboardRating: number;
  uploadRating: number;
  analysisRating: number;
  uiRating: number;
  suggestions: string;
  bugReport?: string;
}

interface PersistedEvaluationState {
  progress: EvaluationProgressState;
  metadata: EvaluationMetadata;
}

interface EvaluationToast {
  id: string;
  message: string;
  tone?: 'success' | 'info' | 'warning';
}

interface EvaluationContextValue {
  progress: EvaluationProgressState;
  metadata: EvaluationMetadata;
  completionPercentage: number;
  feedbackUnlocked: boolean;
  minOnboardingDurationMs: number;
  toasts: EvaluationToast[];
  startOnboarding: () => void;
  completeOnboarding: () => boolean;
  markTaskComplete: (task: EvaluationTaskKey) => void;
  submitFeedback: (submission: EvaluationFeedbackSubmission) => void;
  dismissToast: (id: string) => void;
  notify: (message: string, tone?: EvaluationToast['tone']) => void;
}

const STORAGE_KEY_PREFIX = 'labzero_evaluation_progress_v1';
export const MIN_ONBOARDING_DURATION_MS = 5_000;

export const defaultEvaluationProgress: EvaluationProgressState = {
  tourCompleted: false,
  loginCompleted: false,
  dashboardVisited: false,
  uploadDone: false,
  subjectsChecked: false,
};

const defaultMetadata: EvaluationMetadata = {
  onboardingStartedAt: null,
  onboardingCompletedAt: null,
  taskCompletedAt: {},
  feedbackSubmittedAt: null,
};

const taskKeys: EvaluationTaskKey[] = [
  'loginCompleted',
  'dashboardVisited',
  'uploadDone',
  'subjectsChecked',
];

const EvaluationContext = createContext<EvaluationContextValue | undefined>(undefined);

const createDefaultState = (): PersistedEvaluationState => ({
  progress: { ...defaultEvaluationProgress },
  metadata: { ...defaultMetadata, taskCompletedAt: {} },
});

const getUserStorageKey = (userId?: string | number | null, email?: string | null) => {
  const identity = userId ?? email;
  return identity ? `${STORAGE_KEY_PREFIX}_${identity}` : null;
};

const readPersistedState = (storageKey: string | null): PersistedEvaluationState => {
  try {
    if (!storageKey) {
      return createDefaultState();
    }

    const raw = safeLocalStorage.getItem(storageKey);
    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<PersistedEvaluationState>;
    return {
      progress: {
        ...defaultEvaluationProgress,
        ...parsed.progress,
        subjectsChecked:
          parsed.progress?.subjectsChecked ??
          Boolean(
            (parsed.progress as unknown as Partial<Record<string, boolean>> | undefined)
              ?.analysisGenerated,
          ),
      },
      metadata: {
        ...defaultMetadata,
        ...parsed.metadata,
        taskCompletedAt: parsed.metadata?.taskCompletedAt ?? {},
      },
    };
  } catch (error) {
    console.warn('[EvaluationStore] Could not parse persisted progress.', error);
    return createDefaultState();
  }
};

export const EvaluationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const userStorageKey = getUserStorageKey(user?.id, user?.email);
  const [state, setState] = useState<PersistedEvaluationState>(() =>
    readPersistedState(userStorageKey),
  );
  const [toasts, setToasts] = useState<EvaluationToast[]>([]);
  const skipNextPersistRef = useRef(false);

  const notify = useCallback((message: string, tone: EvaluationToast['tone'] = 'info') => {
    const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    skipNextPersistRef.current = true;
    setState(readPersistedState(userStorageKey));
  }, [userStorageKey]);

  useEffect(() => {
    if (!userStorageKey) return;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    safeLocalStorage.setItem(userStorageKey, JSON.stringify(state));
    trackEvaluationEvent('progress_saved', {
      completion: taskKeys.filter((task) => state.progress[task]).length,
      tourCompleted: state.progress.tourCompleted,
    });
  }, [state, userStorageKey]);

  const startOnboarding = useCallback(() => {
    setState((current) => {
      if (current.metadata.onboardingStartedAt) return current;

      const startedAt = Date.now();
      trackEvaluationEvent('onboarding_started', { startedAt });
      return {
        ...current,
        metadata: { ...current.metadata, onboardingStartedAt: startedAt },
      };
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    let completed = false;

    setState((current) => {
      const startedAt = current.metadata.onboardingStartedAt ?? Date.now();
      const elapsed = Date.now() - startedAt;

      if (elapsed < MIN_ONBOARDING_DURATION_MS) {
        return current;
      }

      completed = true;
      const completedAt = Date.now();
      trackEvaluationEvent('onboarding_completed', {
        completedAt,
        durationMs: elapsed,
      });

      return {
        progress: { ...current.progress, tourCompleted: true },
        metadata: { ...current.metadata, onboardingCompletedAt: completedAt },
      };
    });

    if (completed) {
      notify('Evaluation progress saved', 'success');
    } else {
      notify('Please spend at least 5 seconds in the onboarding tour.', 'warning');
    }

    return completed;
  }, [notify]);

  const markTaskComplete = useCallback(
    (task: EvaluationTaskKey) => {
      setState((current) => {
        if (current.progress[task]) return current;

        const completedAt = Date.now();
        trackEvaluationEvent('task_completed', { task, completedAt });

        return {
          progress: { ...current.progress, [task]: true },
          metadata: {
            ...current.metadata,
            taskCompletedAt: {
              ...current.metadata.taskCompletedAt,
              [task]: completedAt,
            },
          },
        };
      });

      notify('Task completed', 'success');
      notify('Evaluation progress saved', 'info');
    },
    [notify],
  );

  const submitFeedback = useCallback(
    (submission: EvaluationFeedbackSubmission) => {
      const feedbackSubmittedAt = Date.now();
      setState((current) => ({
        ...current,
        metadata: {
          ...current.metadata,
          feedbackSubmittedAt,
          feedbackSubmission: submission,
        },
      }));
      trackEvaluationEvent('feedback_submitted', { feedbackSubmittedAt });
      notify('Evaluation feedback submitted', 'success');
    },
    [notify],
  );

  const completionPercentage = useMemo(() => {
    const total = taskKeys.length + 1;
    const completedTasks = taskKeys.filter((task) => state.progress[task]).length;
    return Math.round(((completedTasks + Number(state.progress.tourCompleted)) / total) * 100);
  }, [state.progress]);

  const feedbackUnlocked = useMemo(
    () => state.progress.tourCompleted && taskKeys.every((task) => state.progress[task]),
    [state.progress],
  );

  useEffect(() => {
    if (feedbackUnlocked && !state.metadata.feedbackSubmittedAt) {
      notify('Feedback unlocked', 'success');
    }
  }, [feedbackUnlocked, notify, state.metadata.feedbackSubmittedAt]);

  const value = useMemo<EvaluationContextValue>(
    () => ({
      progress: state.progress,
      metadata: state.metadata,
      completionPercentage,
      feedbackUnlocked,
      minOnboardingDurationMs: MIN_ONBOARDING_DURATION_MS,
      toasts,
      startOnboarding,
      completeOnboarding,
      markTaskComplete,
      submitFeedback,
      dismissToast,
      notify,
    }),
    [
      state,
      completionPercentage,
      feedbackUnlocked,
      toasts,
      startOnboarding,
      completeOnboarding,
      markTaskComplete,
      submitFeedback,
      dismissToast,
      notify,
    ],
  );

  return <EvaluationContext.Provider value={value}>{children}</EvaluationContext.Provider>;
};

export const useEvaluationStore = () => {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluationStore must be used within EvaluationProvider.');
  }

  return context;
};
