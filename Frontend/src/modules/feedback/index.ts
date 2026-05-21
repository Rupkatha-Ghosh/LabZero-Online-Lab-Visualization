import { lazy } from 'react';
import './feedback.css';

export { default as FeedbackErrorBoundary } from './components/common/FeedbackErrorBoundary';
export { default as FeedbackModuleBoundary } from './components/common/FeedbackModuleBoundary';
export { default as FeedbackSkeleton } from './components/common/FeedbackSkeleton';
export const LazyAnalyticsDashboardPage = lazy(
  () => import('./pages/AnalyticsDashboardPage')
);
export const LazyFeedbackAdminPage = lazy(
  () => import('./pages/FeedbackAdminPage')
);
export const LazyFeedbackFormPage = lazy(() => import('./pages/FeedbackFormPage'));
export const LazyTextFeedbackAnalysisPage = lazy(
  () => import('./pages/TextFeedbackAnalysisPage')
);
export * from './types/feedback.types';
