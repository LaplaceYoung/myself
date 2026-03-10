import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';

export const LenisProvider = ({ children }: { children: React.ReactNode }) => {
    const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
    const location = useLocation();

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        let rafId: number;

        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);
        setLenisInstance(lenis);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            setLenisInstance(null);
        };
    }, []);

    // Scroll to top on route change and trigger resize
    useEffect(() => {
        if (lenisInstance) {
            lenisInstance.scrollTo(0, { immediate: true });

            // Wait for DOM to paint new route then resize Lenis
            const timeoutId = setTimeout(() => {
                lenisInstance.resize();
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [location.pathname, lenisInstance]);

    return <>{children}</>;
};
