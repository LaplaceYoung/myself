import { motion, useInView, animate, useSpring } from 'framer-motion';
import { useRef, useEffect } from 'react';
import styles from './AboutSection.module.css';
import { useLanguage } from '../LanguageContext';

const AboutSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-15% 0px" });

    // Magnetic Repulsion & Follower Physics
    const svgWrapperRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const circleRef = useRef<SVGCircleElement>(null);
    const transX = useSpring(0, { stiffness: 150, damping: 15 });
    const transY = useSpring(0, { stiffness: 150, damping: 15 });

    const { t } = useLanguage();

    const paragraphs = [
        t('about.p1'),
        t('about.p2'),
        t('about.p3')
    ];

    // Follower Dot Animation
    useEffect(() => {
        if (isInView && pathRef.current && circleRef.current) {
            animate(0, 1, {
                duration: 2.5,
                delay: 0.8,
                ease: [0.65, 0, 0.35, 1], // Realistic pen hesitation easing
                onUpdate: (v) => {
                    if (!pathRef.current || !circleRef.current) return;
                    const length = pathRef.current.getTotalLength();
                    if (length === 0) return;
                    const point = pathRef.current.getPointAtLength(v * length);
                    circleRef.current.setAttribute('cx', point.x.toString());
                    circleRef.current.setAttribute('cy', point.y.toString());
                    circleRef.current.setAttribute('opacity', v > 0.01 ? '1' : '0');
                }
            });
        }
    }, [isInView]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!svgWrapperRef.current) return;
        const rect = svgWrapperRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;

        // Repulsion force
        const force = 0.15;
        transX.set(-distX * force);
        transY.set(-distY * force);
    };

    const handleMouseLeave = () => {
        transX.set(0);
        transY.set(0);
    };

    return (
        <section className={styles.aboutWrapper} ref={containerRef}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.leftCol}>
                        <motion.div
                            className={styles.verticalLine}
                            initial={{ height: 0 }}
                            animate={isInView ? { height: '100%' } : { height: 0 }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                        />
                        <span className={styles.sectionLabel}>{t('about.manifesto')}</span>
                    </div>

                    <div className={styles.rightCol}>
                        <h2 className={styles.heading}>
                            <motion.span
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                {t('about.headingL1')}
                            </motion.span>
                            <br />
                            <motion.span
                                className={styles.italicText}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            >
                                {t('about.headingL2')}
                            </motion.span>
                        </h2>

                        <div className={styles.textContent}>
                            {paragraphs.map((p, i) => (
                                <div key={i} className={styles.paragraphLine}>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.8, delay: 0.4 + (i * 0.15), ease: "easeOut" }}
                                    >
                                        {p}
                                    </motion.p>
                                </div>
                            ))}
                        </div>

                        <motion.div
                            className={styles.signature}
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            ref={svgWrapperRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            style={{ x: transX, y: transY, cursor: 'default' }}
                        >
                            <svg viewBox="0 0 200 60" className={styles.sigSvg} style={{ overflow: 'visible' }}>
                                <defs>
                                    <filter id="inkBleed" x="-20%" y="-20%" width="140%" height="140%">
                                        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
                                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
                                    </filter>
                                </defs>
                                {/* Advanced organic signature shape mimicking the screenshot */}
                                <motion.path
                                    ref={pathRef}
                                    d="M10,40 Q30,20 50,40 T90,50 Q130,-10 150,30 T190,40"
                                    fill="transparent"
                                    stroke="var(--accent)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    filter="url(#inkBleed)"
                                    style={{ mixBlendMode: 'multiply' }}
                                    initial={{ pathLength: 0 }}
                                    animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                                    transition={{ duration: 2.5, delay: 0.8, ease: [0.65, 0, 0.35, 1] }}
                                />
                                {/* The trailing focus dot */}
                                <circle
                                    ref={circleRef}
                                    r="4"
                                    fill="var(--text-main)"
                                    opacity="0"
                                    filter="url(#inkBleed)"
                                    style={{ mixBlendMode: 'multiply' }}
                                    pointerEvents="none"
                                />
                            </svg>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
