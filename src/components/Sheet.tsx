import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE: Record<NonNullable<SheetProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export const Sheet: React.FC<SheetProps> = ({
  open,
  onClose,
  children,
  labelledBy,
  size = 'md',
  className = '',
}) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const [isCompact, setIsCompact] = useState(false);
  const openedAtRef = useRef(0);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!open) return;
    openedAtRef.current = Date.now();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const appShell = document.querySelector('.app-shell');
    if (appShell) {
      appShell.classList.add('is-recessed');
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      if (appShell) {
        appShell.classList.remove('is-recessed');
      }
    };
  }, [open]);

  const requestClose = () => {
    if (Date.now() - openedAtRef.current < 280) return;
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="sheet-root">
          <motion.button
            type="button"
            aria-label="Close"
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.32, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={requestClose}
          />
          <div className="sheet-stage">
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy || titleId}
              className={`pointer-events-auto sheet-panel w-full ${SIZE[size]} max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-[2rem] md:rounded-[1.75rem] pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl ${className}`}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 30,
                mass: 0.75,
              }}
              drag={isCompact && !reduceMotion ? 'y' : false}
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.22 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 600) requestClose();
              }}
            >
              <div
                className="sheet-handle md:hidden"
                aria-hidden
                onPointerDown={(event) => dragControls.start(event)}
              />
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
