import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

// ---------------------------------------------------------------------------
// 1. BESPOKE ULTRADIAN LOGO / MONOGRAM
// An intertwining dual-phase ultradian wave meeting a central focal jewel
// ---------------------------------------------------------------------------
export const UltradianLogo: React.FC<IconProps & { animated?: boolean }> = ({
  size = 24,
  className = '',
  animated = false,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <defs>
      <linearGradient id="ultradian-logo-grad" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="currentColor" stopOpacity="1" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0.75" />
      </linearGradient>
    </defs>
    {/* Outer subtle orbital boundary */}
    <circle
      cx="12"
      cy="12"
      r="9.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeDasharray="1.5 3.5"
      className="opacity-40"
    />
    {/* Continuous harmonic ultradian 90-minute wave */}
    <path
      d="M3.5 12C5.5 5.5 8.5 5.5 12 12C15.5 18.5 18.5 18.5 20.5 12"
      stroke="url(#ultradian-logo-grad)"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={animated ? 'animate-pulse' : ''}
    />
    {/* Secondary counter-phase recovery wave */}
    <path
      d="M5 12C7 16 9.5 16 12 12C14.5 8 17 8 19 12"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="2 2.5"
      className="opacity-50"
    />
    {/* Core focal jewel / nucleus */}
    <circle cx="12" cy="12" r="1.8" fill="currentColor" />
  </svg>
);

// ---------------------------------------------------------------------------
// 2. NAVIGATION ICONS
// ---------------------------------------------------------------------------

// Focus / Chronometer dial with 90-minute quadrant wave
export const IconFocus: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    {/* 90-min quadrant arc accent */}
    <path d="M12 3 A 9 9 0 0 1 21 12" strokeWidth={strokeWidth + 0.6} className="opacity-90" />
    {/* Precision hands */}
    <path d="M12 7.5V12L15.5 14" />
    {/* Subtle center pin */}
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </svg>
);

// Rhythm / Bio-Harmonic Frequency Wave (Replacing standard 3-bar chart)
export const IconRhythm: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    {/* Peak Focus Wave */}
    <path d="M3 13.5C5.5 7.5 8 7.5 10.5 13.5C13 19.5 15.5 19.5 18 13.5H21" />
    {/* Harmonic Cadence Pillars */}
    <path d="M7 16.5V18.5" strokeWidth={strokeWidth + 0.4} />
    <path d="M12 5.5V8.5" strokeWidth={strokeWidth + 0.4} />
    <path d="M17 15.5V18.5" strokeWidth={strokeWidth + 0.4} />
  </svg>
);

// League / Tribal Resonance (Replacing generic share icon)
export const IconLeague: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    {/* Triad constellation nodes */}
    <circle cx="12" cy="6" r="2.2" />
    <circle cx="6" cy="17" r="2.2" />
    <circle cx="18" cy="17" r="2.2" />
    {/* Harmonic connecting filaments */}
    <path d="M10.2 7.5L7.8 15.2" />
    <path d="M13.8 7.5L16.2 15.2" />
    <path d="M8.4 17H15.6" strokeDasharray="1.5 2" />
  </svg>
);

// ---------------------------------------------------------------------------
// 3. CORE ACTION & CONTROLS ICONS
// ---------------------------------------------------------------------------

// Sculpted Play Glyph
export const IconPlay: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M7.25 4.85C6.55 4.4 5.75 4.88 5.75 5.72V18.28C5.75 19.12 6.55 19.6 7.25 19.15L18.4 12.87C19.15 12.45 19.15 11.55 18.4 11.13L7.25 4.85Z" />
  </svg>
);

// Sculpted Pause Glyph
export const IconPause: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <rect x="6" y="5" width="3.75" height="14" rx="1.85" />
    <rect x="14.25" y="5" width="3.75" height="14" rx="1.85" />
  </svg>
);

// Rhythmic Orbit Reset Arrow
export const IconReset: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.8, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <path d="M3.5 4.5v3.5h3.5" />
  </svg>
);

// Rhythmic Skip / Phase Transition
export const IconSkip: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.8, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M5 6.5l8 5.5-8 5.5V6.5z" fill="currentColor" fillOpacity="0.15" />
    <path d="M14 6.5l7 5.5-7 5.5V6.5z" fill="currentColor" fillOpacity="0.15" />
    <path d="M20.5 6v12" strokeWidth={strokeWidth + 0.3} />
  </svg>
);

// Celestial Artisan Sun
export const IconSun: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2.5V4.5" />
    <path d="M12 19.5V21.5" />
    <path d="M2.5 12H4.5" />
    <path d="M19.5 12H21.5" />
    <path d="M5.3 5.3L6.8 6.8" />
    <path d="M17.2 17.2L18.7 18.7" />
    <path d="M5.3 18.7L6.8 17.2" />
    <path d="M17.2 6.8L18.7 5.3" />
  </svg>
);

// Ethereal Crescent Moon & Star
export const IconMoon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5 6.8 6.8 0 0 0 20.5 13.2Z" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

// Architectural Calibration Dial / Settings
export const IconSettings: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// Organic Acoustic Resonance / Volume
export const IconVolume: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.12" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 5a9 9 0 0 1 0 14" opacity="0.65" />
  </svg>
);

// Volume Muted
export const IconVolumeMute: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  </svg>
);

// Zen Focus Portal / Maximize
export const IconZenPortal: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M4 8V4h4" />
    <path d="M16 4h4v4" />
    <path d="M20 16v4h-4" />
    <path d="M8 20H4v-4" />
    <circle cx="12" cy="12" r="3" strokeWidth={strokeWidth + 0.3} />
  </svg>
);

// Radiant Stellar Sparkle / Ritual Mark
export const IconSparkle: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
  </svg>
);

// Close / Dismiss Glyph
export const IconClose: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 2, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

// Geometric Precision Check
export const IconCheck: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 2.2, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Precision Check Circle
export const IconCheckCircle: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.8, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12l2.5 2.5 5-5" strokeWidth={strokeWidth + 0.3} />
  </svg>
);

// Laurel Crest / Trophy
export const IconTrophy: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M6 9H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
    <path d="M18 9h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3" />
    <path d="M4 3h16v6a8 8 0 0 1-16 0V3z" fill="currentColor" fillOpacity="0.1" />
    <path d="M12 17v4" />
    <path d="M8 21h8" />
  </svg>
);

// Recovery Vessel / Rest Steam
export const IconRestVessel: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill="currentColor" fillOpacity="0.1" />
    <path d="M6 2v3" strokeDasharray="1.5 2" />
    <path d="M10 2v3" strokeDasharray="1.5 2" />
    <path d="M14 2v3" strokeDasharray="1.5 2" />
  </svg>
);

// Neural Flow / Brain
export const IconNeuralFlow: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5C5 7.4 5.3 8.2 5.7 8.9A4.5 4.5 0 0 0 4 12.5a4.5 4.5 0 0 0 2 3.7A4.5 4.5 0 0 0 9.5 20h.5V2h-.5Z" />
    <path d="M14.5 2A4.5 4.5 0 0 1 19 6.5c0 .9-.3 1.7-.7 2.4a4.5 4.5 0 0 1 1.7 3.6 4.5 4.5 0 0 1-2 3.7 4.5 4.5 0 0 1-3.5 3.8h-.5V2h.5Z" />
    <path d="M10 8h4" strokeDasharray="1.5 2" />
    <path d="M10 12h4" strokeDasharray="1.5 2" />
    <path d="M10 16h4" strokeDasharray="1.5 2" />
  </svg>
);

// Community / Tribe Constellation
export const IconTribe: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// Precision Directional Arrows
export const IconArrowRight: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 2, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 2, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IconChevronDown: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 2, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Organic Wind / Breath Flow
export const IconWind: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M9.5 4H17a2.5 2.5 0 1 1-2.3 3.5" />
    <path d="M4 10h14.5a3 3 0 1 1-2.8 4" />
    <path d="M6 16h8.5a2 2 0 1 1-1.8 2.8" />
  </svg>
);

// Precision Concentric Target / Focus
export const IconFocusTarget: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

// Organic Flame Glyph
export const IconFlame: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path
      d="M8.5 14.5A4.5 4.5 0 0 0 15 17c2-1.5 2.5-4 1.5-6-1 2-2 2.5-3 2.5-1.5 0-2-1.5-1.5-3.5 1-4-3-6-4.5-8-.5 3-2 5.5-2 8a4.5 4.5 0 0 0 3 4.5Z"
      fill="currentColor"
      fillOpacity="0.12"
    />
  </svg>
);

// Alert Triangle
export const IconAlert: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <path d="M10.3 3.6a2 2 0 0 1 3.4 0l8.1 14.2A2 2 0 0 1 20.1 21H3.9a2 2 0 0 1-1.7-3.2l8.1-14.2z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <circle cx="12" cy="17" r="0.8" fill="currentColor" />
  </svg>
);

// Minimize / Restore Window
export const IconMinimize: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`}
    {...props}
  >
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

