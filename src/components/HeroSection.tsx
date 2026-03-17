import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useRef, useState } from 'react';
import styles from './HeroSection.module.css';
import { useLanguage } from '../LanguageContext';
import { applyFallbackImage, localAsset } from '../utils/image';

const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { t } = useLanguage();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReducedMotion ? '0%' : '16%']);
  const frameY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReducedMotion ? '0%' : '8%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReducedMotion ? '0%' : '24%']);
  const fadeOut = useTransform(scrollYProgress, [0, 0.82], [1, 0]);

  const headingVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0.15,
        staggerChildren: 0.12,
      },
    },
  };

  const cueLabels = [t('hero.pillStory'), t('hero.pillMotion'), t('hero.pillCraft')];

  const lineVariants: Variants = {
    hidden: {
      y: '112%',
      opacity: 0,
    },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 1.05,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const jumpTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  return (
    <section ref={containerRef} className={styles.heroWrapper}>
      <div className="container">
        <div className={styles.heroGrid}>
          <motion.div className={styles.copyColumn} style={{ y: textY, opacity: fadeOut }}>
            <motion.div
              className="section-kicker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('hero.kicker')}
            </motion.div>

            <motion.div
              className={styles.roleLine}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('hero.role')}
            </motion.div>

            <motion.h1
              className={`${styles.mainTitle} editorial-title`}
              variants={headingVariants}
              initial="hidden"
              animate="visible"
            >
              <span className={styles.lineMask}>
                <motion.span className={styles.lineInner} variants={lineVariants}>
                  {t('hero.titleL1')}
                </motion.span>
              </span>
              <span className={styles.lineMask}>
                <motion.span className={`${styles.lineInner} ${styles.emphasisLine}`} variants={lineVariants}>
                  {t('hero.titleL2')}
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              className={styles.actionRow}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <button type="button" className={styles.jumpLink} onClick={() => jumpTo('projects')}>
                {t('nav.projects')}
              </button>
              <button type="button" className={styles.jumpLink} onClick={() => jumpTo('writings')}>
                {t('nav.writings')}
              </button>
            </motion.div>

            <motion.ul
              className={styles.cueList}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {cueLabels.map((label) => (
                <li key={label} className={styles.cueItem}>
                  {label}
                </li>
              ))}
            </motion.ul>

            <motion.p
              className={styles.note}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.55 }}
            >
              {t('hero.note')}
            </motion.p>
          </motion.div>

          <motion.div
            className={styles.mediaColumn}
            style={{ y: frameY }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.mediaFrame}>
              <motion.div className={styles.mediaInner} style={{ y: mediaY }}>
                <video
                  src={localAsset('uploads/hero_bg_video.mp4')}
                  className={styles.heroMedia}
                  autoPlay={!prefersReducedMotion}
                  loop
                  muted
                  playsInline
                  poster={localAsset('uploads/aiingo_promo_v2.png')}
                  onError={() => setVideoFailed(true)}
                />
                {videoFailed ? (
                  <img
                    src={localAsset('uploads/aiingo_promo_v2.png')}
                    alt="Featured project preview"
                    className={styles.heroMedia}
                    onError={(event) => applyFallbackImage(event.currentTarget)}
                  />
                ) : null}
              </motion.div>

              <div className={styles.mediaOverlay}>
                <span className={styles.overlayLabel}>{t('hero.overlayLabel')}</span>
                <span className={styles.overlayMeta}>{t('hero.overlayMeta')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span>{t('hero.scroll')}</span>
        <span className={styles.scrollLine} />
      </motion.div>
    </section>
  );
};

export default HeroSection;
