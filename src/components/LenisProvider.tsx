import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const LenisProvider = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    useEffect(() => {
        // Keep native wheel/trackpad behavior to avoid inertial blocking.
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.pathname]);

    return <>{children}</>;
};
