import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import styles from './AboutSection.module.css';
import { useLanguage } from '../LanguageContext';

const AboutSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-18% 0px' });
  const { t } = useLanguage();

  const paragraphs = [t('about.p1'), t('about.p2'), t('about.p3')];

  return (
    <section className={styles.aboutWrapper} ref={ref}>
      <div className="container">
        <div className={styles.layout}>
          <motion.div
            className={styles.sideColumn}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-kicker">{t('about.manifesto')}</span>
            <p className={styles.sideNote}>{t('about.statement')}</p>
          </motion.div>

          <div className={styles.mainColumn}>
            <motion.h2
              className={styles.heading}
              initial={{ opacity: 0, y: 26 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
              transition={{ duration: 0.95, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <span>{t('about.headingL1')}</span>
              <span className={styles.accentLine}>{t('about.headingL2')}</span>
            </motion.h2>

            <div className={styles.textGrid}>
              {paragraphs.map((paragraph, index) => (
                <motion.p
                  key={paragraph}
                  className={styles.paragraph}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  transition={{ duration: 0.82, delay: 0.2 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
