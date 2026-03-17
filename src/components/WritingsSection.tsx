import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import styles from './WritingsSection.module.css';
import { useLanguage } from '../LanguageContext';
import { writingsData as writings } from '../data/content';
import { applyFallbackImage, resolveImageUrl } from '../utils/image';

const WritingsSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const { t } = useLanguage();
  const visibleWritings = writings.filter((item) => item.status === 'published');
  const [activeIndex, setActiveIndex] = useState(0);

  const activeWriting = visibleWritings[activeIndex] ?? visibleWritings[0];

  if (visibleWritings.length === 0) {
    return null;
  }

  return (
    <section className={styles.writingsWrapper} ref={ref}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.headerCopy}>
            <span className="section-kicker">{t('writings.eyebrow')}</span>
            <h2 className="section-title-display">{t('writings.title')}</h2>
          </div>
          <div className={styles.headerMeta}>
            <p className="section-copy">{t('writings.subtitle')}</p>
            <span className={styles.countBadge}>
              {visibleWritings.length} {t('writings.badge')}
            </span>
          </div>
        </motion.div>

        <div className={styles.layout}>
          <div className={styles.listColumn}>
            {visibleWritings.map((writing, index) => {
              const isActive = activeIndex === index;

              return (
                <Link
                  key={writing.id}
                  to={`/writing/${writing.id}`}
                  className={`${styles.listItem} ${isActive ? styles.active : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                >
                  <span className={styles.itemIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <div className={styles.itemMain}>
                    <div className={styles.itemMeta}>
                      <span>{writing.category}</span>
                      <span>{writing.date}</span>
                    </div>
                    <h3 className={styles.itemTitle}>{writing.title}</h3>
                    <p className={styles.itemExcerpt}>{writing.excerpt}</p>
                  </div>
                  <span className={styles.itemCta}>{t('writings.cta')}</span>
                </Link>
              );
            })}
          </div>

          <div className={styles.previewColumn}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWriting.id}
                className={styles.previewCard}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeWriting.image ? (
                  <div className={styles.previewImageWrap}>
                    <img
                      src={resolveImageUrl(activeWriting.image)}
                      alt={activeWriting.title}
                      className={styles.previewImage}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(event) => applyFallbackImage(event.currentTarget)}
                    />
                  </div>
                ) : null}
                <div className={styles.previewBody}>
                  <div className={styles.previewMeta}>
                    <span>{activeWriting.category}</span>
                    <span>{activeWriting.date}</span>
                  </div>
                  <h3 className={styles.previewTitle}>{activeWriting.title}</h3>
                  <p className={styles.previewExcerpt}>{activeWriting.excerpt}</p>
                  <Link to={`/writing/${activeWriting.id}`} className="ghost-link">
                    {t('writings.cta')}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WritingsSection;
