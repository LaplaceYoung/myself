import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import styles from './ProjectsSection.module.css';
import { useLanguage } from '../LanguageContext';
import { projectsData as projects } from '../data/content';
import { applyFallbackImage, resolveImageUrl } from '../utils/image';

const ProjectsSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-12% 0px' });
  const { t } = useLanguage();
  const visibleProjects = projects.filter((item) => item.status === 'published');
  const [activeIndex, setActiveIndex] = useState(0);

  const activeProject = visibleProjects[activeIndex] ?? visibleProjects[0];

  if (visibleProjects.length === 0) {
    return null;
  }

  return (
    <section className={styles.projectsWrapper} ref={ref}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.headerCopy}>
            <span className="section-kicker">{t('projects.eyebrow')}</span>
            <h2 className="section-title-display">{t('projects.title')}</h2>
          </div>
          <p className="section-copy">{t('projects.subtitle')}</p>
        </motion.div>

        <div className={styles.layout}>
          <div className={styles.projectList}>
            {visibleProjects.map((project, index) => {
              const isActive = index === activeIndex;

              return (
                <article
                  key={project.id}
                  className={`${styles.projectItem} ${isActive ? styles.active : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                >
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.projectLink}
                    data-cursor-text="VIEW"
                  >
                    <div className={styles.itemTopline}>
                      <span className={styles.itemIndex}>{String(index + 1).padStart(2, '0')}</span>
                      <span className={styles.itemYear}>{project.year}</span>
                    </div>

                    <div className={styles.itemMain}>
                      <h3 className={styles.itemTitle}>{project.title}</h3>
                      <div className={styles.itemRole}>{project.role}</div>
                    </div>

                    <motion.div
                      className={styles.itemDetails}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0.55,
                        y: isActive ? 0 : 6,
                      }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className={styles.itemExcerpt}>{project.excerpt}</p>
                      <div className={styles.itemMeta}>
                        <div className={styles.tagList}>
                          {project.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className={styles.itemCta}>{t('projects.cta')}</span>
                      </div>
                    </motion.div>
                  </a>
                </article>
              );
            })}
          </div>

          <div className={styles.previewColumn}>
            <div className={styles.previewFrame}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProject.id}
                  className={styles.previewInner}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -22 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <img
                    src={resolveImageUrl(activeProject.image)}
                    alt={activeProject.title}
                    className={styles.previewImage}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(event) => applyFallbackImage(event.currentTarget)}
                  />
                  <div className={styles.previewCaption}>
                    <span className={styles.previewLabel}>{activeProject.role}</span>
                    <span className={styles.previewName}>{activeProject.title}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
