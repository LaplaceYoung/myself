import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CurationsSection.module.css';
import { useLanguage } from '../LanguageContext';
import { curationsData as curations } from '../data/content';

const CurationsSection = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selectedItem = curations.find(item => item.id === selectedId);

    // Map vertical wheel scrolls to smoothly interpolated horizontal scrolling
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        let targetLeft = el.scrollLeft;
        let currentLeft = el.scrollLeft;
        let rafId: number;

        const updateScroll = () => {
            // Linear interpolation (lerp) for buttery scrolling
            currentLeft += (targetLeft - currentLeft) * 0.08;

            if (Math.abs(targetLeft - currentLeft) > 0.5) {
                el.scrollLeft = currentLeft;
            } else {
                currentLeft = targetLeft;
                el.scrollLeft = currentLeft;
            }
            rafId = requestAnimationFrame(updateScroll);
        };

        rafId = requestAnimationFrame(updateScroll);

        const handleWheel = (e: WheelEvent) => {
            // Distinguish trackpad horizontal scroll from mouse wheel
            const isTrackpad = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            if (isTrackpad || e.deltaY === 0) {
                // User is naturally scrolling horizontally with trackpad
                targetLeft = el.scrollLeft;
                currentLeft = el.scrollLeft;
                return;
            }

            const maxScrollLeft = el.scrollWidth - el.clientWidth;

            // We use targetLeft to evaluate capacity to scroll.
            // This prevents "getting stuck" feeling when they over-scroll.
            const canScrollMore =
                (e.deltaY > 0 && Math.ceil(targetLeft) < maxScrollLeft) ||
                (e.deltaY < 0 && Math.floor(targetLeft) > 0);

            if (canScrollMore) {
                e.preventDefault();
                // Accumulate target left with a subtle multiplier
                targetLeft = Math.max(0, Math.min(maxScrollLeft, targetLeft + e.deltaY * 2.0));
            } else {
                // We reached the boundary. Allow native vertical scroll.
                targetLeft = Math.max(0, Math.min(maxScrollLeft, targetLeft));
                currentLeft = el.scrollLeft;
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            el.removeEventListener('wheel', handleWheel);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <section className={styles.curationsSection}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('curations.title')}</h2>
                <p className={styles.subtitle}>{t('curations.subtitle')}</p>
            </div>

            {/* Added data-lenis-prevent optionally, but preventDefault covers most of what we need */}
            <div ref={scrollContainerRef} className={styles.horizontalScroll} data-lenis-prevent>
                {curations.map((item) => (
                    <motion.div
                        key={item.id}
                        className={styles.card}
                        layoutId={`curation-${item.id}`}
                        onClick={() => setSelectedId(item.id)}
                        style={{ cursor: 'pointer' }}
                        data-cursor-text="EXPAND"
                    >
                        <motion.div className={styles.imageWrapper} layoutId={`image-${item.id}`}>
                            <img src={item.image} alt={item.title} className={styles.image} loading="lazy" />
                        </motion.div>
                        <motion.div className={styles.meta} layoutId={`meta-${item.id}`}>
                            <span className={styles.type}>{item.type}</span>
                            <h3 className={styles.itemName}>{item.title}</h3>
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {selectedId && selectedItem && (
                        <motion.div
                            className={styles.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                        >
                            <motion.div
                                className={styles.modalContent}
                                layoutId={`curation-${selectedItem.id}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.img
                                    layoutId={`image-${selectedItem.id}`}
                                    src={selectedItem.image}
                                    alt={selectedItem.title}
                                    className={styles.modalImage}
                                />
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setSelectedId(null)}
                                    data-cursor-text="CLOSE"
                                >
                                    {t('nav.close')} —
                                </button>
                                <motion.div
                                    className={styles.modalMeta}
                                    layoutId={`meta-${selectedItem.id}`}
                                    data-lenis-prevent
                                >
                                    <motion.span
                                        className={styles.type}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        [{selectedItem.type}]
                                    </motion.span>
                                    <h3 className={styles.itemName}>{selectedItem.title}</h3>
                                    {selectedItem.description && (
                                        <motion.p
                                            className={styles.modalDesc}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            {selectedItem.description}
                                        </motion.p>
                                    )}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </section>
    );
};

export default CurationsSection;
