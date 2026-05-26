import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEvaluationProgress } from '../../hooks/useEvaluationProgress';

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
    element: '[data-tour="login"]',
    popover: {
      title: 'Onboarding',
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

const getAvailableSteps = () =>
  requestedTourSteps.filter((step) => document.querySelector(step.element));

const OnboardingTour = () => {
  const { progress, startOnboarding, completeOnboarding, notify } = useEvaluationProgress();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const isUnmountingRef = useRef(false);

  useEffect(() => {
    if (progress.tourCompleted || driverRef.current) return;
    isUnmountingRef.current = false;

    const startTour = () => {
      const steps = getAvailableSteps();

      if (!steps.length) {
        retryTimerRef.current = window.setTimeout(startTour, 1000);
        return;
      }

      startOnboarding();

      const tour = driver({
        allowClose: false,
        animate: true,
        disableActiveInteraction: true,
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
              startTour();
            }, 900);
          }
        },
      });

      driverRef.current = tour;
      tour.drive();
    };

    retryTimerRef.current = window.setTimeout(startTour, 600);

    return () => {
      isUnmountingRef.current = true;
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
      }
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, [completeOnboarding, notify, progress.tourCompleted, startOnboarding]);

  return null;
};

export default OnboardingTour;
