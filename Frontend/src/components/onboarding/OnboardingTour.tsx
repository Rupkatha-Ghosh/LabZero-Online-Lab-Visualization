import { useCallback, useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEvaluationProgress } from '../../hooks/useEvaluationProgress';
import type { EvaluationProgressState, EvaluationTaskKey } from '../../store/evaluationStore';

interface GuideStep {
  selector: string;
  title: string;
  description: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  waitForTask?: EvaluationTaskKey;
  waitForEvent?: string;
  beforeShow?: () => void;
  fallbackAfterMs?: number;
  onFallback?: () => void;
}

const guideSteps: GuideStep[] = [
  {
    selector: '[data-tour="onboarding"]',
    title: 'Onboarding',
    description: 'This panel tracks your guide progress. Continue from here, then complete each highlighted action.',
    side: 'left',
  },
  {
    selector: '[data-tour="login"]',
    title: 'Login',
    description: 'Click this login area and sign in so LabZero can save your guide progress.',
    side: 'bottom',
    waitForTask: 'loginCompleted',
  },
  {
    selector: '[data-tour="dashboard"]',
    title: 'Dashboard',
    description: 'Open the dashboard to view your learning workspace and classroom controls.',
    side: 'bottom',
    waitForTask: 'dashboardVisited',
  },
  {
    selector: '[data-tour="video-call"]',
    title: 'Video Calling',
    description: 'Click the online class control to view the video calling feature.',
    side: 'bottom',
    waitForTask: 'videoCallViewed',
    beforeShow: () => window.dispatchEvent(new CustomEvent('labzero:guide-show-dashboard')),
    fallbackAfterMs: 4_000,
    onFallback: () => window.dispatchEvent(new CustomEvent('labzero:evaluation-task', { detail: 'videoCallViewed' })),
  },
  {
    selector: '[data-tour="subjects"]',
    title: 'Subject View',
    description: 'Click any subject card to open its subject view.',
    side: 'left',
    waitForTask: 'subjectViewed',
    beforeShow: () => window.dispatchEvent(new CustomEvent('labzero:guide-show-subjects')),
  },
  {
    selector: '[data-tour="topic-card"]',
    title: 'Choose a Topic',
    description: 'Open any topic from this subject so you can view a simulation.',
    side: 'left',
    waitForEvent: 'labzero:guide-topic-opened',
  },
  {
    selector: '[data-tour="simulation-view"]',
    title: 'Simulation View',
    description: 'Click Visualization to view one simulation or visualization for this topic.',
    side: 'bottom',
    waitForTask: 'simulationViewed',
  },
];

const requiredTourTasks: EvaluationTaskKey[] = [
  'loginCompleted',
  'dashboardVisited',
  'videoCallViewed',
  'subjectViewed',
  'simulationViewed',
];

const isVisibleTourTarget = (element: Element) => {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.visibility !== 'hidden' &&
    style.display !== 'none'
  );
};

const getVisibleTourElement = (selector: string) =>
  Array.from(document.querySelectorAll(selector)).find(isVisibleTourTarget);

const taskIsComplete = (
  progress: EvaluationProgressState,
  task?: EvaluationTaskKey,
) => Boolean(task && progress[task as keyof EvaluationProgressState]);

const guideIsComplete = (progress: EvaluationProgressState) =>
  progress.tourCompleted && requiredTourTasks.every((task) => progress[task]);

const OnboardingTour = () => {
  const { progress, startOnboarding, completeOnboarding } = useEvaluationProgress();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const activeElementRef = useRef<Element | null>(null);
  const progressRef = useRef(progress);
  const isRunningRef = useRef(false);
  const isUnmountingRef = useRef(false);
  const isPausingForActionRef = useRef(false);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const createDriver = useCallback(() => driver({
    allowClose: false,
    animate: true,
    disableActiveInteraction: false,
    overlayOpacity: 0.72,
    showButtons: ['next'],
    showProgress: true,
    stagePadding: 8,
    stageRadius: 12,
    doneBtnText: 'Complete',
    onDestroyed: () => {
      driverRef.current = null;
      clearRetryTimer();
      clearFallbackTimer();
      activeElementRef.current = null;

      if (isPausingForActionRef.current) {
        isPausingForActionRef.current = false;
        return;
      }

      if (!isUnmountingRef.current) {
        isRunningRef.current = false;
      }
    },
  }), [clearFallbackTimer, clearRetryTimer]);

  const pauseOverlayForUserAction = useCallback(() => {
    if (!driverRef.current) return;
    isPausingForActionRef.current = true;
    driverRef.current.destroy();
  }, []);

  const showStep = useCallback((index: number) => {
    clearRetryTimer();
    clearFallbackTimer();
    activeElementRef.current = null;

    const step = guideSteps[index];
    if (!step) {
      driverRef.current?.destroy();
      driverRef.current = null;
      isRunningRef.current = false;
      if (!completeOnboarding()) {
        retryTimerRef.current = window.setTimeout(() => {
          completeOnboarding();
        }, 5_200);
      }
      return;
    }

    activeIndexRef.current = index;

    if (taskIsComplete(progressRef.current, step.waitForTask)) {
      showStep(index + 1);
      return;
    }

    step.beforeShow?.();
    if (step.fallbackAfterMs && step.onFallback) {
      fallbackTimerRef.current = window.setTimeout(() => {
        if (activeIndexRef.current === index && !getVisibleTourElement(step.selector)) {
          step.onFallback?.();
        }
      }, step.fallbackAfterMs);
    }

    const renderWhenReady = () => {
      const element = getVisibleTourElement(step.selector);

      if (!element) {
        retryTimerRef.current = window.setTimeout(renderWhenReady, 500);
        return;
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

      const waitsForUserAction = Boolean(step.waitForTask || step.waitForEvent);
      activeElementRef.current = element;
      if (!driverRef.current) {
        driverRef.current = createDriver();
      }

      driverRef.current?.highlight({
        element,
        disableActiveInteraction: false,
        popover: {
          title: step.title,
          description: waitsForUserAction
            ? `${step.description} The tour will continue after you do it.`
            : step.description,
          side: step.side,
          showButtons: waitsForUserAction ? [] : ['next'],
          showProgress: true,
          progressText: `${index + 1} of ${guideSteps.length}`,
          nextBtnText: 'Next',
          onNextClick: () => showStep(index + 1),
        },
      });
    };

    retryTimerRef.current = window.setTimeout(renderWhenReady, 300);
  }, [clearFallbackTimer, clearRetryTimer, completeOnboarding, createDriver]);

  const startTour = useCallback((force = false) => {
    if (!force && guideIsComplete(progressRef.current)) return;
    if (isRunningRef.current) return;

    isUnmountingRef.current = false;
    isRunningRef.current = true;
    startOnboarding();

    driverRef.current = createDriver();

    showStep(0);
  }, [createDriver, showStep, startOnboarding]);

  const advanceIfCurrentStepIsSatisfied = useCallback((eventName?: string) => {
    if (!isRunningRef.current) return;

    const activeStep = guideSteps[activeIndexRef.current];
    if (!activeStep) return;

    const taskDone = taskIsComplete(progressRef.current, activeStep.waitForTask);
    const eventDone = Boolean(eventName && activeStep.waitForEvent === eventName);

    if (taskDone || eventDone) {
      showStep(activeIndexRef.current + 1);
    }
  }, [showStep]);

  useEffect(() => {
    startTour(false);

    return () => {
      isUnmountingRef.current = true;
      clearRetryTimer();
      clearFallbackTimer();
      driverRef.current?.destroy();
      driverRef.current = null;
      isRunningRef.current = false;
    };
  }, [clearFallbackTimer, clearRetryTimer, startTour]);

  useEffect(() => {
    advanceIfCurrentStepIsSatisfied();
  }, [advanceIfCurrentStepIsSatisfied, progress]);

  useEffect(() => {
    const handlePopoverNextClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('.driver-popover-next-btn')) return;
      if (!isRunningRef.current) return;

      const activeStep = guideSteps[activeIndexRef.current];
      if (!activeStep || activeStep.waitForTask || activeStep.waitForEvent) return;

      event.preventDefault();
      event.stopPropagation();
      showStep(activeIndexRef.current + 1);
    };

    document.addEventListener('click', handlePopoverNextClick, true);

    return () => {
      document.removeEventListener('click', handlePopoverNextClick, true);
    };
  }, [showStep]);

  useEffect(() => {
    const handleActionTargetClick = (event: MouseEvent) => {
      if (!isRunningRef.current) return;

      const activeStep = guideSteps[activeIndexRef.current];
      const activeElement = activeElementRef.current;
      if (!activeStep || !activeElement || (!activeStep.waitForTask && !activeStep.waitForEvent)) return;

      const target = event.target as Node | null;
      if (!target || !activeElement.contains(target)) return;

      window.setTimeout(() => {
        pauseOverlayForUserAction();
      }, 0);
    };

    document.addEventListener('click', handleActionTargetClick, true);

    return () => {
      document.removeEventListener('click', handleActionTargetClick, true);
    };
  }, [pauseOverlayForUserAction]);

  useEffect(() => {
    const handleManualStart = () => startTour(true);
    const handleTaskComplete = () => window.setTimeout(() => advanceIfCurrentStepIsSatisfied(), 0);
    const handleTopicOpened = () => advanceIfCurrentStepIsSatisfied('labzero:guide-topic-opened');

    window.addEventListener('labzero:start-guide-tour', handleManualStart);
    window.addEventListener('labzero:evaluation-task', handleTaskComplete);
    window.addEventListener('labzero:guide-topic-opened', handleTopicOpened);

    return () => {
      window.removeEventListener('labzero:start-guide-tour', handleManualStart);
      window.removeEventListener('labzero:evaluation-task', handleTaskComplete);
      window.removeEventListener('labzero:guide-topic-opened', handleTopicOpened);
    };
  }, [advanceIfCurrentStepIsSatisfied, startTour]);

  return null;
};

export default OnboardingTour;
