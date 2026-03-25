import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

const Home = lazy(() => import('../pages/Home'));
const AdminPanel = lazy(() => import('./AdminPanel'));
const WritingDetail = lazy(() => import('../pages/WritingDetail'));

export const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <Suspense fallback={<div className="container" style={{ padding: '4rem 2rem' }}>Loading…</div>}>
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
        </Suspense>
    );
};
