import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView, useSpring, useVelocity, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './WritingsSection.module.css';
import { useLanguage } from '../LanguageContext';
import { writingsData as writings } from '../data/content';

const WritingsSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-10% 0px" });

    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const mouseX = useSpring(0, { stiffness: 100, damping: 25 });
    const mouseY = useSpring(0, { stiffness: 100, damping: 25 });

    // Calculate tilt based on horizontal mouse movement speed
    const xVelocity = useVelocity(mouseX);
    // Smooth the tilt using spring or just direct transform. Use direct for immediate responsiveness.
    const rotate = useTransform(xVelocity, [-1000, 0, 1000], [-15, 0, 15]);

    const { t } = useLanguage();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Adjust offset so image is centered on cursor or slightly offset
            mouseX.set(e.clientX - 150);
            mouseY.set(e.clientY - 200);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [mouseX, mouseY]);

    return (
        <section className={styles.writingsWrapper} ref={containerRef}>
            <div className="container">
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className={styles.title}>{t('writings.title')}</h2>
                    <span className={styles.badge}>{writings.length} {t('writings.badge')}</span>
                </motion.div>

                <div className={styles.listContainer}>
                    {writings.map((writing, idx) => (
                        <Link
                            to={`/writing/${writing.id}`}
                            key={writing.id}
                            className={styles.listItem}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        // We need to disable framer-motion props if Link is not a motion component,
                        // OR we can use motion(Link) or wrap it.
                        // Better yet, just wrap motion.div inside the Link, or make the Link the child.
                        >
                            <motion.div
                                style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                            >
                                <div className={styles.itemLeft}>
                                    <span className={styles.index}>0{idx + 1}</span>
                                    <h3 className={styles.itemTitle}>{writing.title}</h3>
                                </div>
                                <div className={styles.itemRight}>
                                    <span className={styles.category}>{writing.category}</span>
                                    <span className={styles.date}>{writing.date}</span>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Hover Image Reveal (Fixed positioned, follows mouse) */}
            {createPortal(
                <motion.div
                    className={styles.cursorImageContainer}
                    style={{
                        x: mouseX,
                        y: mouseY,
                        rotate: rotate,
                        opacity: hoveredIdx !== null ? 1 : 0,
                        scale: hoveredIdx !== null ? 1 : 0.8,
                    }}
                    transition={{ opacity: { duration: 0.3 }, scale: { duration: 0.3 } }}
                >
                    {writings.map((writing, idx) => (
                        <img
                            key={writing.id}
                            src={writing.image}
                            alt={writing.title}
                            className={`${styles.cursorImage} ${hoveredIdx === idx ? styles.active : ''}`}
                        />
                    ))}
                </motion.div>,
                document.body
            )}
        </section>
    );
};

export default WritingsSection;
