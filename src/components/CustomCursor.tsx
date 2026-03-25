import { useEffect, useState } from 'react';
import { motion, useMotionValue, useScroll, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const customX = useSpring(cursorX, { damping: 28, stiffness: 320, mass: 0.16 });
  const customY = useSpring(cursorY, { damping: 28, stiffness: 320, mass: 0.16 });
  const { scrollYProgress } = useScroll();

  const [cursorText, setCursorText] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(pointer: coarse)').matches;
  });
  const [reducedMotion] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (isTouchDevice || reducedMotion) {
      return;
    }

    const moveCursor = (event: MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const interactive = target.closest('a, button, [data-cursor-text]') as HTMLElement | null;

      if (!interactive) {
        setIsHovering(false);
        setCursorText('');
        return;
      }

      setIsHovering(true);
      setCursorText(interactive.getAttribute('data-cursor-text') ?? '');
    };

    document.body.style.cursor = 'none';
    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto';
    };
  }, [cursorX, cursorY, isTouchDevice, reducedMotion]);

  if (isTouchDevice || reducedMotion) {
    return null;
  }

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x: customX,
        y: customY,
        translateX: '-50%',
        translateY: '-50%',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      <motion.div
        animate={{
          width: cursorText ? 78 : isHovering ? 28 : 14,
          height: cursorText ? 78 : isHovering ? 28 : 14,
          borderWidth: cursorText ? 1 : 1.5,
          backgroundColor: cursorText ? 'rgba(247,245,240,0.92)' : 'rgba(247,245,240,0.18)',
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          borderStyle: 'solid',
          borderColor: 'rgba(44,44,44,0.24)',
          color: 'var(--surface-ink)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 30px rgba(34, 27, 24, 0.08)',
        }}
      >
        {!cursorText && !isHovering ? (
          <motion.svg
            width="32"
            height="32"
            viewBox="0 0 36 36"
            style={{ position: 'absolute', opacity: 0.55, rotate: -90 }}
          >
            <motion.circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              style={{ pathLength: scrollYProgress }}
            />
          </motion.svg>
        ) : null}

        <motion.span
          initial={false}
          animate={{ opacity: cursorText ? 1 : 0, scale: cursorText ? 1 : 0.8 }}
          transition={{ duration: 0.16 }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {cursorText}
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
