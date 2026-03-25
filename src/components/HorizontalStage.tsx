import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import styles from './HorizontalStage.module.css';

export const HORIZONTAL_PROGRESS_EVENT = 'home-horizontal-progress';
export const HORIZONTAL_GOTO_EVENT = 'home-horizontal-goto';

type HorizontalProgressDetail = {
  progress: number;
  activeId: string;
  index: number;
  total: number;
};

export type HorizontalPanel = {
  id: string;
  content: ReactNode;
  effect?: 'drift' | 'snap' | 'reveal' | 'float';
};

const WHEEL_RESET_MS = 130;
const WHEEL_THRESHOLD = 56;
const STEP_COOLDOWN_MS = 340;

const HorizontalStage = ({ panels }: { panels: HorizontalPanel[] }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef(false);
  const lockTimerRef = useRef<number | null>(null);
  const wheelResetRef = useRef<number | null>(null);
  const wheelBufferRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const totalPanels = panels.length;
  const normalizedIndex = Math.max(0, Math.min(activeIndex, Math.max(0, totalPanels - 1)));

  const emitProgress = useCallback(
    (index: number) => {
      if (totalPanels === 0) {
        return;
      }

      const progress = totalPanels === 1 ? 1 : index / (totalPanels - 1);
      const activeId = panels[index]?.id ?? panels[0].id;

      window.dispatchEvent(
        new CustomEvent(HORIZONTAL_PROGRESS_EVENT, {
          detail: {
            progress,
            activeId,
            index,
            total: totalPanels,
          } satisfies HorizontalProgressDetail,
        }),
      );
    },
    [panels, totalPanels],
  );

  useEffect(() => {
    emitProgress(normalizedIndex);
  }, [emitProgress, normalizedIndex]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || totalPanels === 0) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.dataset.horizontalMode = 'true';
    document.body.style.overflow = 'hidden';

    const unlock = () => {
      lockRef.current = false;
      lockTimerRef.current = null;
    };

    const moveBy = (step: number, cooldown = STEP_COOLDOWN_MS) => {
      if (step === 0 || lockRef.current) {
        return;
      }

      setActiveIndex((current) => {
        const next = Math.max(0, Math.min(totalPanels - 1, current + step));
        if (next === current) {
          return current;
        }

        lockRef.current = true;
        if (lockTimerRef.current) {
          window.clearTimeout(lockTimerRef.current);
        }
        lockTimerRef.current = window.setTimeout(unlock, cooldown);
        return next;
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey) {
        return;
      }

      event.preventDefault();

      const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const delta = event.deltaMode === 1 ? dominantDelta * 16 : dominantDelta;
      const normalized = Math.max(-180, Math.min(180, delta));
      wheelBufferRef.current += normalized;

      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
      }
      wheelResetRef.current = window.setTimeout(() => {
        wheelBufferRef.current = 0;
        wheelResetRef.current = null;
      }, WHEEL_RESET_MS);

      if (Math.abs(wheelBufferRef.current) < WHEEL_THRESHOLD) {
        return;
      }

      const step = wheelBufferRef.current > 0 ? 1 : -1;
      moveBy(step);
      wheelBufferRef.current = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        moveBy(1, 300);
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        moveBy(-1, 300);
      }
    };

    const onGoto = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (!detail?.id) {
        return;
      }

      const nextIndex = panels.findIndex((panel) => panel.id === detail.id);
      if (nextIndex < 0) {
        return;
      }

      setActiveIndex((current) => {
        if (current === nextIndex) {
          return current;
        }

        lockRef.current = true;
        if (lockTimerRef.current) {
          window.clearTimeout(lockTimerRef.current);
        }
        lockTimerRef.current = window.setTimeout(unlock, 260);
        return nextIndex;
      });
    };

    root.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(HORIZONTAL_GOTO_EVENT, onGoto as EventListener);

    return () => {
      delete document.body.dataset.horizontalMode;
      document.body.style.overflow = prevOverflow;
      root.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(HORIZONTAL_GOTO_EVENT, onGoto as EventListener);
      if (lockTimerRef.current) {
        window.clearTimeout(lockTimerRef.current);
      }
      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
      }
      wheelBufferRef.current = 0;
      wheelResetRef.current = null;
    };
  }, [panels, totalPanels]);

  const xTarget = useMemo(() => `-${normalizedIndex * 100}vw`, [normalizedIndex]);

  return (
    <div className={styles.horizontalStage} data-horizontal-root="true" ref={rootRef}>
      <motion.div
        className={styles.track}
        animate={{ x: xTarget }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: 62,
                damping: 20,
                mass: 0.96,
              }
        }
      >
        {panels.map((panel) => (
          <section key={panel.id} id={panel.id} data-panel-id={panel.id} className={styles.panel}>
            {panel.content}
          </section>
        ))}
      </motion.div>
    </div>
  );
};

export default HorizontalStage;
