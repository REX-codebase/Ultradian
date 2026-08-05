import React, { useEffect, useRef } from 'react';
import { playThemeTransitionChime } from '../utils/audio';

interface ThemeTransitionSpectacleProps {
  isTransitioning: boolean;
  targetDarkMode: boolean;
  originX: number;
  originY: number;
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  color: string;
  glowColor: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
}

export const ThemeTransitionSpectacle: React.FC<ThemeTransitionSpectacleProps> = ({
  isTransitioning,
  targetDarkMode,
  originX,
  originY,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isTransitioning) return;

    // Play gentle acoustic chime for extra multisensory spectacle
    playThemeTransitionChime(targetDarkMode);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const startX = originX || width - 120;
    const startY = originY || 32;

    // Determine color palette based on destination theme
    // To Dark: Deep Indigo, Violet, Electric Cyan, Gold Stardust
    // To Light: Radiant Amber, Warm Sun Gold, Coral Flare, Pearl White
    const particleColors = targetDarkMode
      ? ['#818cf8', '#c084fc', '#38bdf8', '#fef08a', '#6366f1']
      : ['#fbbf24', '#f59e0b', '#fb7185', '#fef3c7', '#ffffff'];

    const glowColors = targetDarkMode
      ? ['rgba(129, 140, 248, 0.8)', 'rgba(192, 132, 252, 0.8)', 'rgba(56, 189, 248, 0.8)']
      : ['rgba(251, 191, 36, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(254, 243, 199, 0.9)'];

    // Generate ~40 high-performance particles
    const particles: Particle[] = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 6 + 3;
      const maxLife = Math.random() * 30 + 40; // ~40-70 frames

      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        maxSize: Math.random() * 6 + 4,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        glowColor: glowColors[Math.floor(Math.random() * glowColors.length)],
        alpha: 1,
        life: 0,
        maxLife,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }

    let frame = 0;
    const maxFrames = 50; // Total effect duration ~800ms

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const progress = frame / maxFrames; // 0 to 1

      // 1. Draw Expanding Smooth Radial Color Wave Aura
      const maxRadius = Math.max(
        Math.hypot(startX, startY),
        Math.hypot(width - startX, startY),
        Math.hypot(startX, height - startY),
        Math.hypot(width - startX, height - startY)
      );

      // Smooth cubic ease out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentRadius = easeProgress * maxRadius * 1.2;

      // Draw expanding translucent color aura
      const waveAlpha = Math.max(0, (1 - progress) * 0.4); // subtle non-intrusive glow
      if (waveAlpha > 0) {
        const waveGrad = ctx.createRadialGradient(
          startX,
          startY,
          0,
          startX,
          startY,
          currentRadius
        );

        if (targetDarkMode) {
          waveGrad.addColorStop(0, `rgba(129, 140, 248, ${waveAlpha * 0.8})`);
          waveGrad.addColorStop(0.5, `rgba(99, 102, 241, ${waveAlpha * 0.4})`);
          waveGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        } else {
          waveGrad.addColorStop(0, `rgba(253, 230, 138, ${waveAlpha * 0.85})`);
          waveGrad.addColorStop(0.5, `rgba(251, 191, 36, ${waveAlpha * 0.45})`);
          waveGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }

        ctx.save();
        ctx.fillStyle = waveGrad;
        ctx.beginPath();
        ctx.arc(startX, startY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Draw Expanding Energy Shockwave Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(startX, startY, currentRadius * 0.85, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(2, (1 - easeProgress) * 18);
      ctx.strokeStyle = targetDarkMode
        ? `rgba(168, 85, 247, ${Math.max(0, (1 - progress) * 0.8)})`
        : `rgba(251, 191, 36, ${Math.max(0, (1 - progress) * 0.9)})`;
      ctx.shadowColor = targetDarkMode ? '#c084fc' : '#fbbf24';
      ctx.shadowBlur = 24;
      ctx.stroke();
      ctx.restore();

      // 2. Center Celestial Burst Glow
      if (progress < 0.6) {
        const burstAlpha = Math.max(0, 1 - progress / 0.6);
        const burstRadius = (progress / 0.6) * 120;

        const radialGrad = ctx.createRadialGradient(
          startX,
          startY,
          0,
          startX,
          startY,
          burstRadius
        );

        if (targetDarkMode) {
          radialGrad.addColorStop(0, `rgba(192, 132, 252, ${burstAlpha * 0.9})`);
          radialGrad.addColorStop(0.5, `rgba(129, 140, 248, ${burstAlpha * 0.5})`);
          radialGrad.addColorStop(1, 'rgba(129, 140, 248, 0)');
        } else {
          radialGrad.addColorStop(0, `rgba(255, 255, 255, ${burstAlpha * 0.95})`);
          radialGrad.addColorStop(0.4, `rgba(251, 191, 36, ${burstAlpha * 0.7})`);
          radialGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        }

        ctx.save();
        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(startX, startY, burstRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Render Particles
      particles.forEach((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94; // friction
        p.vy *= 0.94;
        p.rotation += p.vRot;

        const pLifeRatio = p.life / p.maxLife;
        p.alpha = Math.max(0, 1 - pLifeRatio);

        if (p.alpha <= 0) return;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        // Particle shadow glow
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 12;

        ctx.fillStyle = p.color;

        // Draw 4-point star particle
        ctx.beginPath();
        const rOuter = p.size * (1 - pLifeRatio * 0.3);
        const rInner = rOuter * 0.4;
        for (let k = 0; k < 8; k++) {
          const r = k % 2 === 0 ? rOuter : rInner;
          const a = (k * Math.PI) / 4;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      if (frame < maxFrames) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        onComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isTransitioning, targetDarkMode, originX, originY, onComplete]);

  if (!isTransitioning) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99999] w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
};
