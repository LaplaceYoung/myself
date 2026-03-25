import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import styles from './CurationsSection.module.css';
import { useLanguage } from '../LanguageContext';
import { curationsData as curations } from '../data/content';
import { applyFallbackImage, resolveImageUrl } from '../utils/image';

const CurationsSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { t } = useLanguage();
  const publishedCurations = curations.filter((item) => item.status === 'published');
  const visibleCurations = publishedCurations.length > 0 ? publishedCurations : curations;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const selectedItem = visibleCurations.find((item) => item.id === selectedId);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headerY = useTransform(scrollYProgress, [0, 1], [26, -26]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.45, 1, 1, 0.72]);
  const trackX = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const railScaleX = useTransform(scrollYProgress, [0.06, 0.9], [0.08, 1]);

  const depthClasses = [styles.depthA, styles.depthB, styles.depthC, styles.depthD];

  return (
    <section className={styles.curationsSection} ref={sectionRef}>
      <div className={styles.stage}>
        <div className="container">
          <motion.div className={styles.header} style={{ y: headerY, opacity: headerOpacity }}>
            <div className={styles.headerCopy}>
              <span className="section-kicker">{t('curations.eyebrow')}</span>
              <h2 className="section-title-display">{t('curations.title')}</h2>
            </div>
            <div className={styles.headerMeta}>
              <p className="section-copy">{t('curations.subtitle')}</p>
              <div className={styles.storyHint}>
                <span className={styles.hintLabel}>{t('curations.keepScrolling')}</span>
                <div className={styles.progressRail} aria-hidden="true">
                  <motion.span className={styles.progressBar} style={{ scaleX: railScaleX }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className={`${styles.trackViewport} no-scrollbar`}>
          <motion.div className={styles.track} style={{ x: trackX }}>
            {visibleCurations.map((item, index) => {
              const isDimmed = hoveredId !== null && hoveredId !== item.id;
              const depthClass = depthClasses[index % depthClasses.length];

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  className={`${styles.card} ${depthClass} ${isDimmed ? styles.cardDimmed : ''}`}
                  onClick={() => setSelectedId(item.id)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  data-cursor-text="OPEN"
                  initial={{ opacity: 0, y: 44, clipPath: 'inset(8% 0% 0% 0%)' }}
                  whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
                  viewport={{ once: true, amount: 0.35 }}
                  whileHover={{ y: -7, scale: 1.018 }}
                  transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className={styles.cardMedia}>
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.title}
                      className={styles.image}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        applyFallbackImage(event.currentTarget);
                      }}
                    />
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardTopline}>
                      <span className={styles.type}>{item.type}</span>
                      <span className={styles.cardLabel}>Open</span>
                    </div>
                    <h3 className={styles.itemName}>{item.title}</h3>
                    <p className={styles.cardDescription}>{item.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedItem ? (
              <motion.div
                className={styles.modalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
              >
                <motion.div
                  className={styles.modalContent}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.modalImageWrap}>
                    <img
                      src={resolveImageUrl(selectedItem.image)}
                      alt={selectedItem.title}
                      className={styles.modalImage}
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        applyFallbackImage(event.currentTarget);
                      }}
                    />
                  </div>

                  <div className={styles.modalMeta}>
                    <div className={styles.modalTopline}>
                      <span className={styles.type}>{selectedItem.type}</span>
                      <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={() => setSelectedId(null)}
                        data-cursor-text="CLOSE"
                      >
                        {t('nav.close')}
                      </button>
                    </div>
                    <h3 className={styles.modalTitle}>{selectedItem.title}</h3>
                    <p className={styles.modalDesc}>{selectedItem.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
};

export default CurationsSection;
