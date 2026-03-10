import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform, useVelocity, useSpring, useMotionValue } from 'framer-motion';
import styles from './ProjectsSection.module.css';
import { useLanguage } from '../LanguageContext';
import { projectsData as projects } from '../data/content';

const ProjectCard = ({ project, index }: { project: any, index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(cardRef, { once: true, margin: "-20% 0px" });

    const { scrollYProgress, scrollY } = useScroll({
        target: cardRef,
        offset: ["start end", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);

    // Velocity Physics (Image Skew)
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const skewImage = useTransform(smoothVelocity, [-1000, 0, 1000], [-3, 0, 3]);
    const scaleYImage = useTransform(smoothVelocity, [-1000, 0, 1000], [1.05, 1, 1.05]);

    const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false;
    const finalSkew = isMobile ? 0 : skewImage;
    const finalScaleY = isMobile ? 1 : scaleYImage;

    // 3D Tilt Effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const mouseXSpring = useSpring(mouseX, { stiffness: 150, damping: 15 });
    const mouseYSpring = useSpring(mouseY, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || isMobile) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        const xPct = clientX / width - 0.5;
        const yPct = clientY / height - 0.5;
        mouseX.set(xPct);
        mouseY.set(yPct);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <div
            className={styles.projectCard}
            ref={cardRef}
            data-even={index % 2 === 0}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1200 }}
        >
            <div className={styles.imageRevealContainer}>
                {/* The Mask Wipe */}
                <motion.div
                    className={styles.maskImage}
                    initial={{ left: 0 }}
                    animate={isInView ? { left: "100%" } : { left: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                />
                <div className={styles.imageInner}>
                    <a href={project.link} target="_blank" rel="noopener noreferrer" data-cursor-text="VIEW" data-lens="true">
                        <motion.img
                            src={project.image}
                            alt={project.title}
                            className={styles.image}
                            style={{
                                y: yParallax,
                                scale: 1.4,
                                skewY: finalSkew,
                                scaleY: finalScaleY,
                                rotateX: isMobile ? 0 : rotateX,
                                rotateY: isMobile ? 0 : rotateY,
                            }}
                        />
                    </a>
                </div>
            </div>

            <motion.div
                className={styles.meta}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.6 }}
            >
                <div className={styles.metaMain}>
                    <h3 className={styles.projectTitle}>
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                            {project.title}
                        </a>
                    </h3>
                    <span className={styles.role}>{project.role}</span>
                </div>
                <div className={styles.metaBottom}>
                    <span className={styles.index}>0{index + 1}</span>
                    <span className={styles.year}>{project.year}</span>
                </div>
            </motion.div>
        </div>
    );
};

const ProjectsSection = () => {
    const { t } = useLanguage();

    return (
        <section className={styles.projectsWrapper}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.sectionTitle}>{t('projects.title')}</h2>
                </div>
                <div className={styles.projectsList}>
                    {projects.map((proj, idx) => (
                        <ProjectCard key={proj.id} project={proj} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProjectsSection;
