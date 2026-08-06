import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, Sparkles, Check, X, Shield, Trophy, Zap, Copy } from 'lucide-react';
import { SessionRecord, UserSettings } from '../types';
import { playMilestoneSound } from '../utils/audio';

interface FlexCardModalProps {
  session: SessionRecord;
  settings: UserSettings;
  onClose: () => void;
}

export const FlexCardModal: React.FC<FlexCardModalProps> = ({
  session,
  settings,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const focusScore = session.focusRating || 4.8;
  const minsCompleted = Math.round(session.actualSecondsCompleted / 60) || session.durationMinutes;

  const levelName =
    settings.staminaLevel === 1
      ? 'Level 1: Apprentice'
      : settings.staminaLevel === 2
      ? 'Level 2: Adept'
      : 'Level 3: Ultradian Master';

  const shareText = `⚡ I survived a ${minsCompleted}-min Deep Work Cycle! Focus Score: ${focusScore}/5 | Category: ${session.category} | Level: ${levelName} | Tracked with Ultradian Pulse`;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      playMilestoneSound();

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High-res export
        useCORS: true,
        backgroundColor: '#09090b',
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ultradian-flex-card-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    playMilestoneSound();
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl text-stone-100 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-1.5">
            Phase 3 Virality: "Flex" Card
          </span>
          <h3 className="font-serif text-2xl font-medium text-white">
            Share Your Flow Achievement
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Export a high-res Instagram-Story flex asset to inspire your peers.
          </p>
        </div>

        {/* Target Capture Area for html2canvas */}
        <div
          ref={cardRef}
          className="w-full max-w-sm aspect-[4/5] rounded-2xl p-7 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 border border-stone-800/80 shadow-2xl flex flex-col justify-between text-stone-100 relative overflow-hidden"
        >
          {/* Subtle Ambient Glow Effect inside card */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                ⚡
              </div>
              <span className="font-serif font-bold text-sm tracking-wide text-stone-200">
                ULTRADIAN PULSE
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-stone-800/80 text-amber-400 border border-stone-700">
              {levelName}
            </span>
          </div>

          {/* Core Stat Display */}
          <div className="my-auto py-6 text-center relative z-10 space-y-3">
            <div className="inline-block px-3 py-1 rounded-full bg-stone-800/90 text-stone-300 text-[10px] font-bold uppercase tracking-widest border border-stone-700/80">
              {session.category} Deep Focus
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-5xl font-normal text-white tracking-tight">
                {minsCompleted} <span className="text-xl text-stone-400 font-sans font-light">MINS</span>
              </h2>
              <p className="text-xs font-semibold text-stone-300 tracking-wide uppercase">
                Continuous Flow State
              </p>
            </div>

            <div className="flex items-center justify-center space-x-6 pt-2">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Focus Rating
                </span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  {focusScore}/5
                </span>
              </div>
              <div className="h-6 w-px bg-stone-800" />
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Distractions
                </span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {session.distractionsCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 relative z-10">
            <span className="italic font-serif">"Focus is a trained muscle."</span>
            <span className="font-mono text-[10px] text-stone-500">ultradianpulse.app</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex-1 py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Rendering Image...' : 'Download PNG Flex Card'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex-1 py-3.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs uppercase tracking-wider border border-stone-700 shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText ? 'Copied Stats!' : 'Copy Text Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
