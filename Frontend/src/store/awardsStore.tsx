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
import { AwardTier, computeEarnedTier } from '../utils/awardTiers';

export interface TopicAwardProgress {
  theoryRead: boolean;
  simulationRun: boolean;
  quizCompleted: boolean;
  timeSpentMs: number;
  theoryReadAt: number | null;
  simulationRunAt: number | null;
  quizCompletedAt: number | null;
  firstVisitAt: number | null;
  lastVisitAt: number | null;
  certificateIssuedAt: number | null;
}

const defaultTopicProgress: TopicAwardProgress = {
  theoryRead: false,
  simulationRun: false,
  quizCompleted: false,
  timeSpentMs: 0,
  theoryReadAt: null,
  simulationRunAt: null,
  quizCompletedAt: null,
  firstVisitAt: null,
  lastVisitAt: null,
  certificateIssuedAt: null,
};

type AwardProgressMap = Record<string, TopicAwardProgress>;

interface PersistedAwardState {
  progress: AwardProgressMap;
}

interface AwardsContextValue {
  getProgress: (topicId: string) => TopicAwardProgress;
  getEarnedTier: (topicId: string) => AwardTier;
  markTheoryRead: (topicId: string) => void;
  markSimulationRun: (topicId: string) => void;
  markQuizCompleted: (topicId: string) => void;
  startSession: (topicId: string) => () => void;
  issueCertificate: (topicId: string) => void;
  hasCertificate: (topicId: string) => boolean;
  getAllProgress: () => AwardProgressMap;
  getEarnedCount: () => number;
}

const STORAGE_KEY = 'labzero_awards_v1';

const createDefaultProgress = (): TopicAwardProgress => ({
  ...defaultTopicProgress,
  firstVisitAt: null,
  lastVisitAt: null,
  theoryReadAt: null,
  simulationRunAt: null,
  quizCompletedAt: null,
  certificateIssuedAt: null,
  timeSpentMs: 0,
});

const readPersistedState = (): PersistedAwardState => {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (!raw) return { progress: {} };
    const parsed = JSON.parse(raw) as Partial<PersistedAwardState>;
    return { progress: parsed.progress ?? {} };
  } catch (error) {
    console.warn('[AwardsStore] Could not parse persisted awards.', error);
    return { progress: {} };
  }
};

const AwardsContext = createContext<AwardsContextValue | undefined>(undefined);

export const AwardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedAwardState>(() => readPersistedState());
  const tickersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const ensureTopic = useCallback((topicId: string): TopicAwardProgress => {
    return state.progress[topicId] ?? createDefaultProgress();
  }, [state]);

  const updateTopic = useCallback((topicId: string, updater: (prev: TopicAwardProgress) => TopicAwardProgress) => {
    setState((current) => {
      const prev = current.progress[topicId] ?? createDefaultProgress();
      const next = updater(prev);
      if (next === prev) return current;
      return { ...current, progress: { ...current.progress, [topicId]: next } };
    });
  }, []);

  const markTheoryRead = useCallback((topicId: string) => {
    updateTopic(topicId, (prev) => {
      if (prev.theoryRead) return prev;
      return { ...prev, theoryRead: true, theoryReadAt: Date.now() };
    });
  }, [updateTopic]);

  const markSimulationRun = useCallback((topicId: string) => {
    updateTopic(topicId, (prev) => {
      if (prev.simulationRun) return prev;
      return { ...prev, simulationRun: true, simulationRunAt: Date.now() };
    });
  }, [updateTopic]);

  const markQuizCompleted = useCallback((topicId: string) => {
    updateTopic(topicId, (prev) => {
      if (prev.quizCompleted) return prev;
      return { ...prev, quizCompleted: true, quizCompletedAt: Date.now() };
    });
  }, [updateTopic]);

  const issueCertificate = useCallback((topicId: string) => {
    updateTopic(topicId, (prev) => {
      if (prev.certificateIssuedAt) return prev;
      return { ...prev, certificateIssuedAt: Date.now() };
    });
  }, [updateTopic]);

  const startSession = useCallback((topicId: string) => {
    updateTopic(topicId, (prev) => ({
      ...prev,
      firstVisitAt: prev.firstVisitAt ?? Date.now(),
      lastVisitAt: Date.now(),
    }));
    if (tickersRef.current[topicId]) {
      window.clearInterval(tickersRef.current[topicId]);
    }
    const intervalId = window.setInterval(() => {
      const sliceMs = 30_000;
      setState((current) => {
        const prev = current.progress[topicId] ?? createDefaultProgress();
        return {
          ...current,
          progress: {
            ...current.progress,
            [topicId]: {
              ...prev,
              timeSpentMs: prev.timeSpentMs + sliceMs,
              lastVisitAt: Date.now(),
            },
          },
        };
      });
    }, 30_000);
    tickersRef.current[topicId] = intervalId;
    return () => {
      window.clearInterval(intervalId);
      delete tickersRef.current[topicId];
      setState((current) => {
        const prev = current.progress[topicId] ?? createDefaultProgress();
        return {
          ...current,
          progress: {
            ...current.progress,
            [topicId]: { ...prev, lastVisitAt: Date.now() },
          },
        };
      });
    };
  }, [updateTopic]);

  const getProgress = useCallback(
    (topicId: string) => ensureTopic(topicId),
    [ensureTopic]
  );

  const getEarnedTier = useCallback(
    (topicId: string) => computeEarnedTier(ensureTopic(topicId)),
    [ensureTopic]
  );

  const hasCertificate = useCallback(
    (topicId: string) => Boolean(ensureTopic(topicId).certificateIssuedAt),
    [ensureTopic]
  );

  const getAllProgress = useCallback(() => state.progress, [state]);

  const getEarnedCount = useCallback(
    () =>
      Object.values(state.progress).filter((p) => p.theoryRead || p.simulationRun || p.quizCompleted)
        .length,
    [state]
  );

  useEffect(() => {
    return () => {
      Object.values(tickersRef.current).forEach((id) => window.clearInterval(id));
      tickersRef.current = {};
    };
  }, []);

  const value = useMemo<AwardsContextValue>(
    () => ({
      getProgress,
      getEarnedTier,
      markTheoryRead,
      markSimulationRun,
      markQuizCompleted,
      startSession,
      issueCertificate,
      hasCertificate,
      getAllProgress,
      getEarnedCount,
    }),
    [
      getProgress,
      getEarnedTier,
      markTheoryRead,
      markSimulationRun,
      markQuizCompleted,
      startSession,
      issueCertificate,
      hasCertificate,
      getAllProgress,
      getEarnedCount,
    ]
  );

  return <AwardsContext.Provider value={value}>{children}</AwardsContext.Provider>;
};

export const useAwards = () => {
  const ctx = useContext(AwardsContext);
  if (!ctx) throw new Error('useAwards must be used within AwardsProvider.');
  return ctx;
};
