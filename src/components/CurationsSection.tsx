import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './CurationsSection.module.css';
import { useLanguage } from '../LanguageContext';
import { curationsData as curations } from '../data/content';
import { applyFallbackImage, resolveImageUrl } from '../utils/image';

const CurationsSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const publishedCurations = curations.filter((item) => item.status === 'published');
  const visibleCurations = publishedCurations.length > 0 ? publishedCurations : curations;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const selectedItem = visibleCurations.find((item) => item.id === selectedId);

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) {
      return;
    }

    let targetLeft = element.scrollLeft;
    let currentLeft = element.scrollLeft;
    let frame = 0;

    const update = () => {
      currentLeft += (targetLeft - currentLeft) * 0.08;
      if (Math.abs(targetLeft - currentLeft) > 0.4) {
        element.scrollLeft = currentLeft;
      } else {
        currentLeft = targetLeft;
        element.scrollLeft = currentLeft;
      }
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);

    const handleWheel = (event: WheelEvent) => {
      const isTrackpad = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (isTrackpad || event.deltaY === 0) {
        targetLeft = element.scrollLeft;
        currentLeft = element.scrollLeft;
        return;
      }

      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      const canScroll =
        (event.deltaY > 0 && Math.ceil(targetLeft) < maxScrollLeft) ||
        (event.deltaY < 0 && Math.floor(targetLeft) > 0);

      if (canScroll) {
        event.preventDefault();
        targetLeft = Math.max(0, Math.min(maxScrollLeft, targetLeft + event.deltaY * 1.8));
      }
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={styles.curationsSection}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <span className="section-kicker">{t('curations.eyebrow')}</span>
            <h2 className="section-title-display">{t('curations.title')}</h2>
          </div>
          <p className="section-copy">{t('curations.subtitle')}</p>
        </div>
      </div>

      <div ref={scrollContainerRef} className={`${styles.horizontalScroll} no-scrollbar`} data-lenis-prevent>
        {visibleCurations.map((item) => {
          const isDimmed = hoveredId !== null && hoveredId !== item.id;

          return (
            <motion.button
              key={item.id}
              type="button"
              className={styles.card}
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
