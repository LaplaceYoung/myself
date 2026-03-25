import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';

export const LenisProvider = ({ children }: { children: React.ReactNode }) => {
    const lenisRef = useRef<Lenis | null>(null);
    const location = useLocation();

    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.75,
            easing: (t) => 1 - Math.pow(1 - t, 4),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.08,
            touchMultiplier: 1.25,
            syncTouch: true,
            infinite: false,
        });

        let rafId: number;

        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);
        lenisRef.current = lenis;

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    // Scroll to top on route change and trigger resize
    useEffect(() => {
        const lenis = lenisRef.current;
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });

            // Wait for DOM to paint new route then resize Lenis
            const timeoutId = setTimeout(() => {
                lenis.resize();
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [location.pathname]);

    return <>{children}</>;
};
