import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';
import { useLanguage } from '../LanguageContext';

const MagneticWrapper = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.35, y: middleY * 0.35 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            style={{ display: "inline-block" }}
        >
            {children}
        </motion.div>
    );
};

const Navigation = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const { t, language, setLanguage } = useLanguage();
    const location = useLocation();

    // Track which section is in view on the homepage
    useEffect(() => {
        if (location.pathname !== '/') {
            setActiveSection('');
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '-40% 0px -40% 0px', // Center-ish of the screen
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Sections to track
        const sectionIds = ['hero', 'projects', 'writings', 'curations'];
        sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [location.pathname]);

    const navItems = [
        { id: 'hero', label: t('nav.home'), path: '/' },
        { id: 'projects', label: t('nav.projects'), path: '/#projects' },
        { id: 'writings', label: t('nav.writings'), path: '/#writings' },
        { id: 'curations', label: t('nav.curations'), path: '/#curations' },
    ];

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (location.pathname !== '/') {
        return null;
    }

    return (
        <motion.nav
            className={styles.dockWrapper}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
            <div
                className={`${styles.dockContainer} ${isExpanded ? styles.expanded : ''}`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <div className={styles.dockContent}>
                    {/* Navigation Links */}
                    <div className={styles.mainLinks}>
                        {navItems.map((item) => (
                            <MagneticWrapper key={item.id}>
                                <Link
                                    to={item.path}
                                    onClick={(e) => {
                                        if (location.pathname === '/') {
                                            e.preventDefault();
                                            scrollToSection(item.id);
                                        }
                                    }}
                                    className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
                                    data-cursor-text="GO"
                                >
                                    <span className={styles.itemLabel}>
                                        {isExpanded ? item.label : item.label[0]}
                                    </span>
                                    {activeSection === item.id && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className={styles.activeDot}
                                        />
                                    )}
                                </Link>
                            </MagneticWrapper>
                        ))}
                    </div>

                    <div className={styles.divider} />

                    {/* Language Switch */}
                    <MagneticWrapper>
                        <button
                            className={styles.langToggle}
                            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                            data-cursor-text="LANG"
                        >
                            {language.toUpperCase()}
                        </button>
                    </MagneticWrapper>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navigation;
