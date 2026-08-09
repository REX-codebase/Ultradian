import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

/**
 * LoadingSpinner Component
 * Displays a rotating accessible spinner with optional label.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  label = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-2">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-amber-500 border-t-transparent`}
        role="status"
        aria-label={label}
      />
      {label && <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">{label}</span>}
    </div>
  );
};

/**
 * SkeletonCard Component
 * Displays animated skeleton placeholder for cards while async data loads.
 */
export const SkeletonCard: React.FC = () => (
  <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 animate-pulse space-y-3">
    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-md w-3/4"></div>
    <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded-md w-1/2"></div>
    <div className="h-10 bg-stone-100 dark:bg-stone-800 rounded-xl w-full"></div>
  </div>
);

/**
 * SkeletonDashboard Component
 * Displays animated skeleton grid for dashboard views.
 */
export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6 animate-pulse p-4">
    <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded-xl w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <div className="h-64 bg-stone-200 dark:bg-stone-800 rounded-2xl w-full"></div>
  </div>
);

/**
 * Full page or full modal Suspense fallback loader
 */
export const LoadingFallback: React.FC<{ label?: string }> = ({ label = 'Loading section...' }) => (
  <div className="flex items-center justify-center min-h-[300px] w-full p-8">
    <LoadingSpinner size="lg" label={label} />
  </div>
);
