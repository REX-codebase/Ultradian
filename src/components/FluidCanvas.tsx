import React, { useEffect, useRef } from 'react';

export const FluidCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Fluid particles definition
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      maxLife: number;
      life: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 120;
    const mouse = { x: 0, y: 0, px: 0, py: 0, active: false, vx: 0, vy: 0 };

    // Initial background fluid grid nodes
    interface GridNode {
      x: number;
      y: number;
      ox: number;
      oy: number;
      vx: number;
      vy: number;
    }

    const gridNodes: GridNode[] = [];
    const spacing = 50;

    const initGrid = () => {
      gridNodes.length = 0;
      if (width <= 0 || height <= 0) return;
      for (let x = spacing; x < width; x += spacing) {
        for (let y = spacing; y < height; y += spacing) {
          gridNodes.push({
            x,
            y,
            ox: x,
            oy: y,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width <= 0 || height <= 0) return;
      canvas.width = width * (window.devicePixelRatio || 1);
      canvas.height = height * (window.devicePixelRatio || 1);
      if (ctx) {
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      }
      initGrid();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    resize();

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      if (!mouse.active) {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.active = true;
      }

      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      if (speed > 1) {
        const count = Math.min(Math.ceil(speed / 3), 6);
        for (let i = 0; i < count; i++) {
          if (particles.length < maxParticles) {
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 0.8 + 0.2;
            const tones = [
              'rgba(168, 162, 158, 0.15)',
              'rgba(120, 113, 108, 0.12)',
              'rgba(231, 229, 228, 0.08)',
              'rgba(245, 245, 244, 0.06)',
            ];
            const color = tones[Math.floor(Math.random() * tones.length)];

            particles.push({
              x: mouse.x + (Math.random() - 0.5) * 10,
              y: mouse.y + (Math.random() - 0.5) * 10,
              vx: mouse.vx * 0.15 + Math.cos(angle) * force,
              vy: mouse.vy * 0.15 + Math.sin(angle) * force,
              size: Math.random() * 35 + 15,
              alpha: Math.random() * 0.4 + 0.1,
              color,
              maxLife: Math.random() * 120 + 80,
              life: 0,
            });
          }
        }
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;

      if (!mouse.active) {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.active = true;
      }

      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      if (speed > 1) {
        const count = Math.min(Math.ceil(speed / 3), 6);
        for (let i = 0; i < count; i++) {
          if (particles.length < maxParticles) {
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 0.8 + 0.2;
            const tones = [
              'rgba(168, 162, 158, 0.15)',
              'rgba(120, 113, 108, 0.12)',
              'rgba(231, 229, 228, 0.08)',
              'rgba(245, 245, 244, 0.06)',
            ];
            const color = tones[Math.floor(Math.random() * tones.length)];

            particles.push({
              x: mouse.x + (Math.random() - 0.5) * 10,
              y: mouse.y + (Math.random() - 0.5) * 10,
              vx: mouse.vx * 0.15 + Math.cos(angle) * force,
              vy: mouse.vy * 0.15 + Math.sin(angle) * force,
              size: Math.random() * 35 + 15,
              alpha: Math.random() * 0.4 + 0.1,
              color,
              maxLife: Math.random() * 120 + 80,
              life: 0,
            });
          }
        }
      }
    };

    const handleTouchEnd = () => {
      mouse.active = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouse.x = touch.clientX - rect.left;
        mouse.y = touch.clientY - rect.top;
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.active = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    // Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle ambient fluid grid nodes
      ctx.lineWidth = 0.5;
      gridNodes.forEach((node) => {
        // Calculate force from cursor
        if (mouse.active) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            const angle = Math.atan2(dy, dx);
            // Push grid nodes slightly away from cursor or pull them
            node.vx -= Math.cos(angle) * force * 0.4;
            node.vy -= Math.sin(angle) * force * 0.4;
          }
        }

        // Return force back to origin
        const homeDx = node.ox - node.x;
        const homeDy = node.oy - node.y;
        node.vx += homeDx * 0.05;
        node.vy += homeDy * 0.05;

        // Friction
        node.vx *= 0.92;
        node.vy *= 0.92;

        node.x += node.vx;
        node.y += node.vy;

        // Draw node
        ctx.fillStyle = `rgba(120, 113, 108, ${Math.max(0.01, 0.05 - (Math.abs(node.vx) + Math.abs(node.vy)) * 0.01)})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw and update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        
        // Motion physics
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Pulse size slightly
        const currentAlpha = p.alpha * (1 - p.life / p.maxLife);
        
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, p.color.replace(/0\.\d+/, String(currentAlpha)));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // 3. Draw a very soft general glow at cursor coordinates
      if (mouse.active) {
        const glowRad = 150;
        const glowGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRad);
        glowGrad.addColorStop(0, 'rgba(168, 162, 158, 0.04)');
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, glowRad, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchstart', handleTouchStart);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80 dark:opacity-60 transition-opacity duration-500"
    />
  );
};
