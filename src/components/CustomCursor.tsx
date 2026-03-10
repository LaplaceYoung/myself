import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useScroll } from 'framer-motion';

const CustomCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Highly responsive spring for the cursor core
    const springConfig = { damping: 25, stiffness: 300, mass: 0.1 };
    const customX = useSpring(cursorX, springConfig);
    const customY = useSpring(cursorY, springConfig);

    const { scrollYProgress } = useScroll();

    const [cursorText, setCursorText] = useState('');
    const [isHovering, setIsHovering] = useState(false);

    const [isLensMode, setIsLensMode] = useState(false);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const closestInteractive = target.closest('a, button, [data-cursor-text]') as HTMLElement;

            // Check if hovering over an element we want to apply the lens effect to
            const isLensTarget = target.closest('.editorial-title, img, [data-lens]');

            if (closestInteractive) {
                setIsHovering(true);
                const text = closestInteractive.getAttribute('data-cursor-text');
                if (text) {
                    setCursorText(text);
                } else if (!closestInteractive.innerText) {
                    setCursorText('VIEW');
                } else {
                    setCursorText('');
                }
            } else {
                setIsHovering(false);
                setCursorText('');
            }

            setIsLensMode(!!isLensTarget && !closestInteractive);
        };

        document.body.style.cursor = 'none';

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            document.body.style.cursor = 'auto';
        };
    }, [cursorX, cursorY]);

    // Disable completely on mobile touch devices
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    useEffect(() => {
        setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }, []);

    if (isTouchDevice) {
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Keep exclusion for text contrast
                mixBlendMode: isLensMode ? 'normal' : 'exclusion'
            }}
        >
            <motion.div
                initial={false}
                animate={{
                    width: isLensMode ? 120 : (cursorText ? 80 : (isHovering ? 40 : 16)),
                    height: isLensMode ? 120 : (cursorText ? 80 : (isHovering ? 40 : 16)),
                    backgroundColor: isLensMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
                    borderRadius: '50%',
                    backdropFilter: isLensMode ? 'invert(1) blur(4px) saturate(1.5)' : 'none',
                    border: isLensMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    boxShadow: isLensMode ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
                }}
            >
                {/* SVG Progress Ring */}
                {!isLensMode && !cursorText && !isHovering && (
                    <motion.svg
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                        style={{ position: 'absolute', opacity: 0.4, rotate: -90 }}
                    >
                        <motion.circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            style={{ pathLength: scrollYProgress }}
                        />
                    </motion.svg>
                )}

                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: cursorText && !isLensMode ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {cursorText}
                </motion.span>
            </motion.div>
        </motion.div>
    );
};

export default CustomCursor;
