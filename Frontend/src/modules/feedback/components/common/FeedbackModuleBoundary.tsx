import { Suspense } from 'react';
import FeedbackErrorBoundary from './FeedbackErrorBoundary';
import FeedbackSkeleton from './FeedbackSkeleton';

interface FeedbackModuleBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

const FeedbackModuleBoundary = ({
  children,
  fallbackTitle,
}: FeedbackModuleBoundaryProps) => (
  <FeedbackErrorBoundary fallbackTitle={fallbackTitle}>
    <Suspense fallback={<FeedbackSkeleton rows={4} />}>{children}</Suspense>
  </FeedbackErrorBoundary>
);

export default FeedbackModuleBoundary;
