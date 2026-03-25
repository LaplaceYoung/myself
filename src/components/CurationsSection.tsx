import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './CurationsSection.module.css';
import { useLanguage } from '../LanguageContext';
import { curationsData as curations } from '../data/content';
import { applyFallbackImage, resolveImageUrl } from '../utils/image';

const CurationsSection = () => {
  const { t } = useLanguage();
  const publishedCurations = curations.filter((item) => item.status === 'published');
  const visibleCurations = publishedCurations.length > 0 ? publishedCurations : curations;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const selectedItem = visibleCurations.find((item) => item.id === selectedId);

  const depthClasses = [styles.depthA, styles.depthB, styles.depthC, styles.depthD];

  return (
    <section className={styles.curationsSection}>
      <div className={styles.stage}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.headerCopy}>
              <span className="section-kicker">{t('curations.eyebrow')}</span>
              <h2 className="section-title-display">{t('curations.title')}</h2>
            </div>
            <div className={styles.headerMeta}>
              <p className="section-copy">{t('curations.subtitle')}</p>
              <div className={styles.storyHint}>
                <span className={styles.hintLabel}>{t('curations.keepScrolling')}</span>
                <div className={styles.progressRail} aria-hidden="true">
                  <span className={styles.progressBarStatic} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.trackViewport} no-scrollbar`}>
          <div className={styles.track}>
            {visibleCurations.map((item, index) => {
              const isDimmed = hoveredId !== null && hoveredId !== item.id;
              const depthClass = depthClasses[index % depthClasses.length];

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  className={`${styles.card} ${depthClass}`}
                  onClick={() => setSelectedId(item.id)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  data-cursor-text="OPEN"
                  animate={{
                    opacity: isDimmed ? 0.62 : 1,
                    scale: hoveredId === item.id ? 1.02 : 1,
                    y: hoveredId === item.id ? -6 : 0,
                  }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
          </div>
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
