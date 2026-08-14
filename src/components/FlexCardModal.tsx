import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, Sparkles, Check, X, Shield, Trophy, Zap, Copy } from 'lucide-react';
import { SessionRecord, UserSettings } from '../types';
import { playMilestoneSound } from '../utils/audio';
import { Sheet } from './Sheet';

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

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedText(true);
      playMilestoneSound();
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  return (
    <Sheet open onClose={onClose} labelledBy="flex-title">
      <div className="relative flex flex-col items-center px-5 pb-7 pt-2 sm:px-7">
        <button
          type="button"
          onClick={onClose}
          className="pressable absolute right-3 top-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[color:var(--ink-mute)]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 text-center">
          <h3 id="flex-title" className="font-serif text-2xl text-[color:var(--ink)]">
            Share this wave
          </h3>
          <p className="mt-1 text-sm text-[color:var(--ink-mute)]">
            A quiet card for a finished session.
          </p>
        </div>

        {/* Target Capture Area for html2canvas */}
        <div
          ref={cardRef}
          className="w-full max-w-sm aspect-[4/5] rounded-2xl p-7 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 border border-stone-800/80 shadow-2xl flex flex-col justify-between text-stone-100 relative overflow-hidden"
        >
          {/* Subtle Ambient Glow Effect inside card */}
          <div className="pointer-events-none absolute inset-0 opacity-40" />

          {/* Top Brand Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-700 text-xs text-stone-200">
                U
              </div>
              <span className="font-serif font-bold text-sm tracking-wide text-stone-200">
                ULTRADIAN PULSE
              </span>
            </div>
            <span className="rounded-md border border-stone-700 bg-stone-800/80 px-2.5 py-1 text-[10px] uppercase tracking-widest text-stone-300">
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
                <span className="clock-face text-lg">
                  {focusScore}/5
                </span>
              </div>
              <div className="h-6 w-px bg-stone-800" />
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Distractions
                </span>
                <span className="clock-face text-lg">
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
            className="pressable flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)]"
          >
            <Download className="h-4 w-4" />
            <span>{downloading ? 'Saving' : 'Download'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="pressable flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[color:var(--line)] text-[color:var(--ink)]"
          >
            {copiedText ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copiedText ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </Sheet>
  );
};
