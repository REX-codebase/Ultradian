import React, { useState, useEffect } from 'react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt || installed) return null;

  return (
    <div className="mb-6 flex items-center justify-between gap-3 text-sm text-stone-500">
      <p>Keep Ultradian on your home screen.</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstallClick}
          className="min-h-11 text-stone-800 underline-offset-4 hover:underline dark:text-stone-200"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setShowPrompt(false)}
          className="min-h-11 px-2 text-stone-400 hover:text-stone-700"
        >
          Not now
        </button>
      </div>
    </div>
  );
};
