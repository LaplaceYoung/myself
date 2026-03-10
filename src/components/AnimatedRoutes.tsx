import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from '../pages/Home';
import AdminPanel from './AdminPanel';
import WritingDetail from '../pages/WritingDetail';
import PageTransition from './PageTransition';

export const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/"
                    element={
                        <PageTransition>
                            <Home />
                        </PageTransition>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <PageTransition>
                            <AdminPanel />
                        </PageTransition>
                    }
                />
                <Route
                    path="/writing/:id"
                    element={
                        <PageTransition>
                            <WritingDetail />
                        </PageTransition>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
};
