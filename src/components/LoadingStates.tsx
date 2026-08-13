import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading',
}) => {
  const width = size === 'sm' ? 'w-16' : size === 'lg' ? 'w-40' : 'w-28';

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4" role="status" aria-label={label}>
      <div className={`ink-bar ${width}`} />
      {label && <span className="text-sm text-[color:var(--ink-mute)]">{label}</span>}
    </div>
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="space-y-3 py-2">
    <div className="skeleton-line w-3/4" />
    <div className="skeleton-line w-1/2" />
    <div className="skeleton-line h-10 w-full rounded-xl" />
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="mx-auto w-full max-w-2xl space-y-10 py-2" aria-busy="true" aria-label="Loading rhythm">
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
      {['Hours', 'Waves', 'Clarity', 'SQI'].map((label) => (
        <div key={label}>
          <p className="text-sm text-[color:var(--ink-mute)]">{label}</p>
          <div className="skeleton-line mt-3 h-8 w-16" />
        </div>
      ))}
    </div>
    <div>
      <div className="skeleton-line h-6 w-28" />
      <div className="skeleton-line mt-5 h-52 w-full rounded-xl sm:h-64" />
    </div>
    <div className="space-y-4">
      <div className="skeleton-line h-6 w-20" />
      <div className="skeleton-line h-12 w-full" />
      <div className="skeleton-line h-12 w-full" />
      <div className="skeleton-line h-12 w-5/6" />
    </div>
  </div>
);

export const SkeletonLeague: React.FC = () => (
  <div className="mx-auto w-full max-w-xl space-y-6 py-2" aria-busy="true" aria-label="Loading league">
    <div className="skeleton-line h-7 w-24" />
    <div className="skeleton-line h-4 w-40" />
    <div className="space-y-3 pt-2">
      <div className="skeleton-line h-14 w-full rounded-xl" />
      <div className="skeleton-line h-14 w-full rounded-xl" />
      <div className="skeleton-line h-14 w-full rounded-xl" />
    </div>
  </div>
);

export const BootScreen: React.FC = () => (
  <div className="app-shell flex min-h-dvh items-center justify-center">
    <div className="flex flex-col items-center gap-5" role="status" aria-label="Starting Ultradian">
      <p className="font-serif text-2xl tracking-tight text-[color:var(--ink)]">Ultradian</p>
      <div className="ink-bar w-24" />
    </div>
  </div>
);

export const LoadingFallback: React.FC<{ label?: string; variant?: 'page' | 'rhythm' | 'league' | 'sheet' }> = ({
  label = 'Loading',
  variant = 'page',
}) => {
  if (variant === 'rhythm') return <SkeletonDashboard />;
  if (variant === 'league') return <SkeletonLeague />;
  if (variant === 'sheet') {
    return (
      <div className="flex min-h-[240px] w-full items-center justify-center p-8">
        <LoadingSpinner label={label} />
      </div>
    );
  }
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center p-8">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
};
