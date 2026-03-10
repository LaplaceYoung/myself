import { motion, useScroll, useTransform, useVelocity, useSpring, type Variants } from 'framer-motion';
import { useRef } from 'react';
import styles from './HeroSection.module.css';
import { useLanguage } from '../LanguageContext';

const HeroSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    });

    // Parallax effects
    const yText = useTransform(scrollYProgress, [0, 1], ['0%', '80%']); // Deeper parallax for text
    const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
    const yImage = useTransform(scrollYProgress, [0, 1], ['0%', '30%']); // Slower parallax for background

    // Scroll Velocity Physics (Skew)
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    // Range of skew based on velocity
    const skewVelocity = useTransform(smoothVelocity, [-1000, 0, 1000], [-5, 0, 5]);

    // Handle Mobile Fallback for Animations
    const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false;
    const finalSkew = isMobile ? 0 : skewVelocity;

    const { t } = useLanguage();

    const chars = t('hero.title').split("");

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.03, // Tighter stagger for characters
                delayChildren: 0.2
            }
        }
    };

    const charVariants: Variants = {
        hidden: {
            y: "110%",
            rotateX: 60,
            opacity: 0,
            transformOrigin: "bottom center"
        },
        visible: {
            y: "0%",
            rotateX: 0,
            opacity: 1,
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <section ref={containerRef} className={styles.heroWrapper}>
            <motion.div
                className={styles.textContainer}
                style={{ y: yText, opacity: opacityText }}
            >
                <p className={styles.label}>{t('hero.role')}</p>
                <motion.h1
                    className={`editorial-title ${styles.mainTitle}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ skewY: finalSkew, perspective: 1200 }}
                >
                    {chars.map((char, index) => (
                        <span key={index} className={styles.wordWrapper}>
                            <motion.span variants={charVariants} className={styles.word}>
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        </span>
                    ))}
                </motion.h1>
            </motion.div>

            <div className={styles.imageContainer}>
                <motion.div
                    className={styles.imageInner}
                    style={{ scale: scaleImage, y: yImage }}
                    initial={{ clipPath: 'inset(50% 0 50% 0)', filter: 'blur(20px)', scale: 1.1 }}
                    animate={{ clipPath: 'inset(0% 0 0% 0)', filter: 'blur(0px)', scale: 1 }}
                    transition={{ duration: 2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* High-end Abstract Video Background */}
                    <video
                        src="/uploads/hero_bg_video.mp4"
                        className={styles.heroImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                </motion.div>
            </div>

            <div className={styles.scrollIndicator}>
                <motion.span
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    {t('hero.scroll')}
                </motion.span>
            </div>
        </section>
    );
};

export default HeroSection;
