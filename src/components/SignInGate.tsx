import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SignInGateProps {
  featureName: string;
  featureDescription: string;
  onOpenAuth?: () => void;
}

export const SignInGate: React.FC<SignInGateProps> = ({
  featureName,
  featureDescription,
  onOpenAuth,
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
        Signed in only
      </p>
      <h3 className="mt-2 font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
        {featureName}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
        {featureDescription}
      </p>
      {onOpenAuth && (
        <button
          type="button"
          onClick={onOpenAuth}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-stone-900 px-5 text-xs font-semibold uppercase tracking-wider text-stone-100 dark:bg-stone-100 dark:text-stone-900"
        >
          <span>Sign in</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
