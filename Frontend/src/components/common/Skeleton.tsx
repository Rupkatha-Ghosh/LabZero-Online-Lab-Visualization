import React from 'react';

export const HeroSkeleton: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => (
  <div className="flex items-center justify-center h-full w-full bg-gray-200 dark:bg-gray-800 animate-pulse">
    <p className="text-xl text-gray-500 dark:text-gray-400">Loading...</p>
  </div>
);

/**
 * Generic Skeleton placeholder component.
 * - `loading`: when true, shows a pulsing placeholder.
 * - `children`: rendered when loading is false.
 * - `name`: optional identifier (unused in this simple implementation).
 */
export const Skeleton: React.FC<{ name?: string; loading?: boolean; children?: React.ReactNode }> = ({ loading = false, children }) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-md" style={{ minHeight: '1rem' }} />
    );
  }
  return <>{children}</>;
};
