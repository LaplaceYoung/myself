import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion';
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

const HorizontalStage = ({ panels }: { panels: HorizontalPanel[] }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef(false);
  const unlockTimerRef = useRef<number | null>(null);
  const wheelResetRef = useRef<number | null>(null);
  const wheelBufferRef = useRef(0);
  const lastWheelAtRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const emitProgress = useCallback(
    (index: number) => {
      if (panels.length === 0) {
        return;
      }

      const progress = panels.length === 1 ? 1 : index / (panels.length - 1);
      const activeId = panels[index]?.id ?? panels[0].id;
      window.dispatchEvent(
        new CustomEvent(HORIZONTAL_PROGRESS_EVENT, {
          detail: {
            progress,
            activeId,
            index,
            total: panels.length,
          } satisfies HorizontalProgressDetail,
        }),
      );
    },
    [panels],
  );

  useEffect(() => {
    emitProgress(activeIndex);
  }, [activeIndex, emitProgress]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || panels.length === 0) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.dataset.horizontalMode = 'true';
    document.body.style.overflow = 'hidden';

    const unlock = () => {
      lockRef.current = false;
      unlockTimerRef.current = null;
    };

    const requestStep = (step: number, lockMs: number) => {
      if (lockRef.current || step === 0) {
        return;
      }

      setActiveIndex((current) => {
        const next = Math.max(0, Math.min(panels.length - 1, current + step));
        if (next === current) {
          return current;
        }

        setDirection(step > 0 ? 1 : -1);
        lockRef.current = true;
        if (unlockTimerRef.current) {
          window.clearTimeout(unlockTimerRef.current);
        }
        unlockTimerRef.current = window.setTimeout(unlock, lockMs);
        return next;
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey) {
        return;
      }

      event.preventDefault();
      const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const delta = event.deltaMode === 1 ? dominantDelta * 17 : dominantDelta;
      const now = performance.now();
      const elapsed = now - lastWheelAtRef.current;
      lastWheelAtRef.current = now;

      // Trackpads emit tiny frequent deltas, mice emit sparse large deltas.
      const momentumWeight = elapsed > 120 ? 1 : 1.18;
      wheelBufferRef.current += delta * momentumWeight;

      const threshold = Math.abs(delta) > 95 ? 24 : 34;
      const lockMs = Math.abs(delta) > 170 ? 320 : 390;
      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
      }
      wheelResetRef.current = window.setTimeout(() => {
        wheelBufferRef.current = 0;
        wheelResetRef.current = null;
      }, 92);

      if (Math.abs(wheelBufferRef.current) < threshold) {
        return;
      }

      requestStep(wheelBufferRef.current > 0 ? 1 : -1, lockMs);
      wheelBufferRef.current = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        requestStep(1, 380);
      }

      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        requestStep(-1, 380);
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
        if (nextIndex === current) {
          return current;
        }

        setDirection(nextIndex > current ? 1 : -1);
        lockRef.current = true;
        if (unlockTimerRef.current) {
          window.clearTimeout(unlockTimerRef.current);
        }
        unlockTimerRef.current = window.setTimeout(unlock, 360);
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
      if (unlockTimerRef.current) {
        window.clearTimeout(unlockTimerRef.current);
      }
      if (wheelResetRef.current) {
        window.clearTimeout(wheelResetRef.current);
      }
      wheelBufferRef.current = 0;
      wheelResetRef.current = null;
    };
  }, [panels]);

  const activePanel = useMemo(() => panels[activeIndex] ?? panels[0], [activeIndex, panels]);

  const transitionByEffect: Record<
    NonNullable<HorizontalPanel['effect']>,
    { enter: TargetAndTransition; exit: TargetAndTransition }
  > = {
    drift: {
      enter: { x: direction > 0 ? '14vw' : '-14vw', opacity: 0, scale: 0.98 },
      exit: { x: direction > 0 ? '-10vw' : '10vw', opacity: 0.12, scale: 1.015 },
    },
    snap: {
      enter: { x: direction > 0 ? '20vw' : '-20vw', opacity: 0, rotate: direction > 0 ? 0.85 : -0.85 },
      exit: { x: direction > 0 ? '-15vw' : '15vw', opacity: 0.08, rotate: direction > 0 ? -0.55 : 0.55 },
    },
    reveal: {
      enter: { x: direction > 0 ? '12vw' : '-12vw', opacity: 0, scale: 0.985 },
      exit: { x: direction > 0 ? '-9vw' : '9vw', opacity: 0.1, scale: 1.01 },
    },
    float: {
      enter: { x: direction > 0 ? '14vw' : '-14vw', y: '2.4vh', opacity: 0, scale: 0.985 },
      exit: { x: direction > 0 ? '-11vw' : '11vw', y: '-2.2vh', opacity: 0.08, scale: 1.01 },
    },
  };

  const effect = activePanel.effect ?? 'drift';
  const transitions = transitionByEffect[effect];

  return (
    <div className={styles.horizontalStage} data-horizontal-root="true" ref={rootRef}>
      <AnimatePresence mode="sync" initial={false}>
        <motion.section
          key={activePanel.id}
          id={activePanel.id}
          data-panel-id={activePanel.id}
          className={styles.panel}
          initial={transitions.enter}
          animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          exit={transitions.exit}
          transition={{
            x: { type: 'spring', stiffness: 96, damping: 18, mass: 0.86 },
            y: { type: 'spring', stiffness: 102, damping: 19, mass: 0.84 },
            rotate: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 0.46, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.38, ease: [0.25, 1, 0.5, 1] },
          }}
        >
          {activePanel.content}
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

export default HorizontalStage;
