import { useCallback, useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEvaluationProgress } from '../../hooks/useEvaluationProgress';
import { useAuth } from '../../context/AuthContext';

interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'left' | 'right' | 'top' | 'bottom';
    align?: 'start' | 'center' | 'end';
  };
}

const requestedTourSteps: TourStep[] = [
  {
    element: '[data-tour="onboarding"]',
    popover: {
      title: 'Onboarding',
      description: 'Follow this short guided tour to understand each evaluation checkpoint.',
      side: 'left',
    },
  },
  {
    element: '[data-tour="login"]',
    popover: {
      title: 'Login',
      description: 'Log in to start the guided evaluation and save your LabZero progress.',
      side: 'bottom',
    },
  },
  {
    element: '[data-tour="dashboard"]',
    popover: {
      title: 'Visit Dashboard',
      description: 'Explore the dashboard to review your learning workspace, classrooms, and recent activity.',
      side: 'bottom',
    },
  },
  {
    element: '[data-tour="upload"]',
    popover: {
      title: 'File Task',
      description: 'Students should open a shared file. Teachers should upload a file for an assignment.',
      side: 'left',
    },
  },
  {
    element: '[data-tour="subjects"]',
    popover: {
      title: 'Checked the Subjects',
      description: 'Take a look at each subject card and its contents before submitting evaluation feedback.',
      side: 'left',
    },
  },
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

const getAvailableSteps = () =>
  requestedTourSteps
    .map((step) => {
      const element = getVisibleTourElement(step.element);
      return element ? { ...step, element } : null;
    })
    .filter(Boolean) as Array<Omit<TourStep, 'element'> & { element: Element }>;

const OnboardingTour = () => {
  const { user } = useAuth();
  const { progress, startOnboarding, completeOnboarding, notify } = useEvaluationProgress();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const isUnmountingRef = useRef(false);

  const startTour = useCallback((force = false) => {
    if (!user) return;
    if (!force && progress.tourCompleted) return;
    if (driverRef.current) return;
    isUnmountingRef.current = false;

    const runTour = () => {
      const steps = getAvailableSteps();

      if (!steps.length) {
        retryTimerRef.current = window.setTimeout(runTour, 1000);
        return;
      }

      startOnboarding();

      const tour = driver({
        allowClose: false,
        animate: true,
        disableActiveInteraction: false,
        overlayOpacity: 0.72,
        showButtons: ['previous', 'next'],
        showProgress: true,
        stagePadding: 8,
        stageRadius: 12,
        nextBtnText: 'Next',
        prevBtnText: 'Previous',
        doneBtnText: 'Complete',
        steps,
        onDestroyed: () => {
          driverRef.current = null;
          if (isUnmountingRef.current) return;

          if (!completeOnboarding()) {
            retryTimerRef.current = window.setTimeout(() => {
              notify('Onboarding will continue until the minimum review time is met.', 'info');
              runTour();
            }, 900);
          }
        },
      });

      driverRef.current = tour;
      tour.drive();
    };

    retryTimerRef.current = window.setTimeout(runTour, 600);
  }, [completeOnboarding, notify, progress.tourCompleted, startOnboarding, user]);

  useEffect(() => {
    startTour(false);

    return () => {
      isUnmountingRef.current = true;
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
      }
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, [startTour]);

  useEffect(() => {
    const handleManualStart = () => startTour(true);
    window.addEventListener('labzero:start-guide-tour', handleManualStart);

    return () => {
      window.removeEventListener('labzero:start-guide-tour', handleManualStart);
    };
  }, [startTour]);

  return null;
};

export default OnboardingTour;
