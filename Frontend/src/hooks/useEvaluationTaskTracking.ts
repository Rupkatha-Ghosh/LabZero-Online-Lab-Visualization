import { useEffect } from 'react';
import { EvaluationTaskKey, useEvaluationStore } from '../store/evaluationStore';

const fileInputSelector = 'input[type="file"]';
const subjectCardSelector = '[data-evaluation-subject-card]';

export const useEvaluationTaskTracking = () => {
  const { markTaskComplete } = useEvaluationStore();

  useEffect(() => {
    const handleFileChange = (event: Event) => {
      const input = event.target as HTMLInputElement | null;
      if (input?.matches(fileInputSelector) && input.files && input.files.length > 0) {
        markTaskComplete('uploadDone');
      }
    };

    const handleExplicitTask = (event: Event) => {
      const task = (event as CustomEvent<EvaluationTaskKey>).detail;
      if (task) {
        markTaskComplete(task);
      }
    };

    document.addEventListener('change', handleFileChange, true);
    window.addEventListener('labzero:evaluation-task', handleExplicitTask as EventListener);

    return () => {
      document.removeEventListener('change', handleFileChange, true);
      window.removeEventListener('labzero:evaluation-task', handleExplicitTask as EventListener);
    };
  }, [markTaskComplete]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const viewedSubjectCards = new Set<string>();
    let observer: IntersectionObserver | null = null;
    let refreshTimer: number | null = null;

    const observeSubjectCards = () => {
      observer?.disconnect();
      const cards = Array.from(document.querySelectorAll<HTMLElement>(subjectCardSelector));
      if (!cards.length) return;

      const expectedIds = new Set(
        cards.map((card, index) => card.dataset.evaluationSubjectCard || `subject-${index}`),
      );

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const element = entry.target as HTMLElement;
            const id = element.dataset.evaluationSubjectCard;
            if (id) {
              viewedSubjectCards.add(id);
            }
          });

          const allVisibleCardsSeen = Array.from(expectedIds).every((id) =>
            viewedSubjectCards.has(id),
          );

          if (allVisibleCardsSeen) {
            markTaskComplete('subjectsChecked');
            observer?.disconnect();
          }
        },
        { threshold: 0.45 },
      );

      cards.forEach((card) => observer?.observe(card));
    };

    const scheduleRefresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(observeSubjectCards, 250);
    };

    observeSubjectCards();
    window.addEventListener('labzero:subjects-rendered', scheduleRefresh);

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      observer?.disconnect();
      window.removeEventListener('labzero:subjects-rendered', scheduleRefresh);
    };
  }, [markTaskComplete]);
};

export const completeEvaluationTask = (task: EvaluationTaskKey) => {
  window.dispatchEvent(new CustomEvent('labzero:evaluation-task', { detail: task }));
};
