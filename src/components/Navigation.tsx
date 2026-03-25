import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';
import { useLanguage } from '../LanguageContext';
import { HORIZONTAL_GOTO_EVENT, HORIZONTAL_PROGRESS_EVENT } from './HorizontalStage';

type HorizontalProgressPayload = {
  progress: number;
  activeId: string;
  index: number;
  total: number;
};

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalScreens, setTotalScreens] = useState(4);
  const { t, language, toggleLanguage } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') {
      return;
    }

    if (document.querySelector('[data-horizontal-root="true"]')) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: 0,
      },
    );

    ['hero', 'projects', 'writings', 'curations'].forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/') {
      return;
    }

    const handleScroll = () => {
      if (document.querySelector('[data-horizontal-root="true"]')) {
        return;
      }

      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const nextValue = max > 0 ? window.scrollY / max : 0;
      setScrollProgress(Math.max(0, Math.min(1, nextValue)));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/') {
      return;
    }

    const onHorizontalProgress = (event: Event) => {
      const detail = (event as CustomEvent<HorizontalProgressPayload>).detail;
      if (!detail) {
        return;
      }

      setActiveSection(detail.activeId);
      setScrollProgress(Math.max(0, Math.min(1, detail.progress)));
      setActiveIndex(Math.max(0, detail.index));
      setTotalScreens(Math.max(1, detail.total));
    };

    window.addEventListener(HORIZONTAL_PROGRESS_EVENT, onHorizontalProgress as EventListener);
    return () =>
      window.removeEventListener(HORIZONTAL_PROGRESS_EVENT, onHorizontalProgress as EventListener);
  }, [location.pathname]);

  if (location.pathname !== '/') {
    return null;
  }

  const navItems = [
    { id: 'hero', label: t('nav.home'), short: '00' },
    { id: 'projects', label: t('nav.projects'), short: '01' },
    { id: 'writings', label: t('nav.writings'), short: '02' },
    { id: 'curations', label: t('nav.curations'), short: '03' },
  ];
  const progressLabel = String(Math.round(scrollProgress * 100)).padStart(2, '0');

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    const horizontalRoot = document.querySelector<HTMLElement>('[data-horizontal-root="true"]');

    if (horizontalRoot) {
      window.dispatchEvent(new CustomEvent(HORIZONTAL_GOTO_EVENT, { detail: { id } }));
      return;
    }

    if (!section) {
      return;
    }

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.nav
      className={styles.navWrapper}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.95, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.progressHud}>
        <span className={styles.hudLabel}>[INDEX]</span>
        <div className={styles.progressRail} aria-hidden="true">
          <motion.div
            className={styles.progressBar}
            animate={{ scaleX: scrollProgress }}
            transition={{ duration: 0.18, ease: 'linear' }}
          />
          <div className={styles.progressTicks}>
            {navItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.tickBtn} ${activeIndex === index ? styles.tickActive : ''}`}
                onClick={() => scrollToSection(item.id)}
                data-cursor-text={item.short}
              >
                {item.short}
              </button>
            ))}
          </div>
        </div>
        <span className={styles.progressValue}>[{progressLabel}%]</span>
      </div>

      <div className={styles.navContainer}>
        <div className={styles.navList}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={`/#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(item.id);
              }}
              className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
              data-cursor-text="GO"
            >
              <span className={styles.itemIndex}>{item.short}</span>
              <span className={styles.itemLabel}>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className={styles.screenCounter}>
          {String(activeIndex + 1).padStart(2, '0')} / {String(totalScreens).padStart(2, '0')}
        </div>

        <button
          type="button"
          className={styles.langToggle}
          onClick={toggleLanguage}
          data-cursor-text="LANG"
          aria-label={t('nav.translate')}
        >
          <span className={styles.itemIndex}>ZH</span>
          <span className={styles.itemLabel}>{language === 'zh' ? 'EN' : '中文'}</span>
        </button>
      </div>
    </motion.nav>
  );
};

export default Navigation;

