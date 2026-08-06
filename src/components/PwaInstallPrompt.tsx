import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';

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

    // Check if app is already launched in standalone mode
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
    <div className="w-full p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-stone-900 to-stone-950 text-stone-100 border border-amber-500/30 shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 font-bold shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Install Ultradian Pulse Native App
          </h4>
          <p className="text-xs text-stone-300 mt-0.5">
            Add to home screen for offline bio-rhythm timers and full-screen immersion.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
        <button
          onClick={handleInstallClick}
          className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>

        <button
          onClick={() => setShowPrompt(false)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
