import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import styles from './UnseenPanels.module.css';
import { useLanguage } from '../LanguageContext';
import { curationsData, footerData, projectsData, writingsData } from '../data/content';
import { applyFallbackImage, localAsset, resolveImageUrl } from '../utils/image';

const cleanText = (value: string) => value.replace(/\\u[0-9a-fA-F]{4}/g, '').trim();

export const HeroPanel = () => {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const heroPoster = localAsset('uploads/aiingo_promo_v2.png');
  const heroVideo = localAsset('uploads/hero_bg_video.mp4');

  return (
    <div className={`${styles.panelShell} ${styles.heroPanel}`}>
      <div className={styles.panelTexture} />
      <div className="container">
        <div className={styles.panelTopline}>
          <span>[YEAR IN REVIEW]</span>
          <span>[00]</span>
        </div>

        <div className={styles.heroStage}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>{t('hero.kicker')}</span>
            <h1 className={styles.heroDisplay}>
              <span>{t('hero.titleL1')}</span>
              <span>{t('hero.titleL2')}</span>
            </h1>
            <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
          </div>

          <motion.figure
            className={styles.heroFigure}
            initial={{ opacity: 0, x: 30, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <video
              src={heroVideo}
              className={styles.heroMedia}
              autoPlay={!prefersReducedMotion}
              loop
              muted
              playsInline
              preload="metadata"
              poster={heroPoster}
              onError={() => setVideoFailed(true)}
            />
            {videoFailed ? (
              <img
                src={heroPoster}
                alt="Hero visual"
                className={styles.heroMedia}
                onError={(event) => applyFallbackImage(event.currentTarget)}
                referrerPolicy="no-referrer"
              />
            ) : null}
            <figcaption>{t('hero.overlayMeta')}</figcaption>
          </motion.figure>
        </div>

        <div className={styles.panelFoot}>
          <span>{t('hero.role')}</span>
          <span>{t('hero.note')}</span>
        </div>
      </div>
    </div>
  );
};

export const ProjectsPanel = () => {
  const { t } = useLanguage();
  const visibleProjects = useMemo(
    () => projectsData.filter((item) => item.status === 'published').slice(0, 3),
    [],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = visibleProjects[activeIndex] ?? visibleProjects[0];

  if (visibleProjects.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.panelShell} ${styles.projectsPanel}`}>
      <div className={styles.panelTexture} />
      <div className="container">
        <div className={styles.panelTopline}>
          <span>[PROJECTS]</span>
          <span>[01]</span>
        </div>

        <div className={styles.projectsStage}>
          <div className={styles.projectsMain}>
            <span className={styles.kicker}>{t('projects.eyebrow')}</span>
            <h2 className={styles.panelDisplay}>{t('projects.title')}</h2>
            <p className={styles.panelLead}>{t('projects.subtitle')}</p>

            <div className={styles.projectMenu}>
              {visibleProjects.map((project, index) => (
                <a
                  key={project.id}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.projectMenuItem} ${activeIndex === index ? styles.projectMenuActive : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{project.title}</span>
                </a>
              ))}
            </div>
          </div>

          <motion.div
            key={activeProject.id}
            className={styles.projectsVisual}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={resolveImageUrl(activeProject.image)}
              alt={activeProject.title}
              onError={(event) => applyFallbackImage(event.currentTarget)}
              referrerPolicy="no-referrer"
            />
            <div className={styles.visualMeta}>
              <span>{activeProject.role}</span>
              <span>{activeProject.year}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export const WritingsPanel = () => {
  const { t } = useLanguage();
  const visibleWritings = useMemo(
    () => writingsData.filter((item) => item.status === 'published').slice(0, 2),
    [],
  );

  if (visibleWritings.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.panelShell} ${styles.writingsPanel}`}>
      <div className={styles.panelTexture} />
      <div className="container">
        <div className={styles.panelTopline}>
          <span>[WRITINGS]</span>
          <span>[02]</span>
        </div>

        <div className={styles.writingsStage}>
          <div className={styles.writingsMain}>
            <span className={styles.kicker}>{t('writings.eyebrow')}</span>
            <h2 className={styles.panelDisplay}>{t('writings.title')}</h2>
            <p className={styles.panelLead}>{t('writings.subtitle')}</p>
          </div>

          <div className={styles.writingStack}>
            {visibleWritings.map((writing) => (
              <Link key={writing.id} to={`/writing/${writing.id}`} className={styles.writingCard}>
                <div className={styles.writingMeta}>
                  <span>{cleanText(writing.category)}</span>
                  <span>{cleanText(writing.date)}</span>
                </div>
                <h3>{cleanText(writing.title)}</h3>
                <p>{cleanText(writing.excerpt)}</p>
                <span className={styles.readMore}>{t('writings.cta')}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CurationsPanel = () => {
  const { t, language } = useLanguage();
  const visibleCurations = useMemo(
    () => curationsData.filter((item) => item.status === 'published').slice(0, 3),
    [],
  );
  const footer = footerData[0];
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openedId, setOpenedId] = useState<number | null>(null);
  const openedItem = visibleCurations.find((item) => item.id === openedId);

  if (visibleCurations.length === 0) {
    return null;
  }

  const isSelected = (id: number) => selectedIds.includes(id);

  const toggleSelect = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <>
      <div className={`${styles.panelShell} ${styles.curationsPanel}`}>
        <div className={styles.panelTexture} />
        <div className="container">
          <div className={styles.panelTopline}>
            <span>[CURATIONS]</span>
            <span>[03]</span>
          </div>

          <div className={styles.curationsStage}>
            <div className={styles.curationsMain}>
              <span className={styles.kicker}>{t('curations.eyebrow')}</span>
              <h2 className={styles.panelDisplay}>{t('curations.title')}</h2>
              <p className={styles.panelLead}>{t('curations.subtitle')}</p>
            </div>

            <div className={styles.curationPair}>
              {visibleCurations.map((item, index) => {
                const checked = isSelected(item.id);

                return (
                  <motion.article
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    className={`${styles.curationCard} ${checked ? styles.curationCardChecked : ''}`}
                    onClick={() => setOpenedId(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setOpenedId(item.id);
                      }
                    }}
                    data-cursor-text="OPEN"
                    initial={{ opacity: 0, y: 36, clipPath: 'inset(8% 0 0 0)' }}
                    whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' }}
                    viewport={{ once: true, amount: 0.4 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.54, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <button
                      type="button"
                      className={`${styles.curationCheck} ${checked ? styles.curationCheckActive : ''}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSelect(item.id);
                      }}
                      data-cursor-text="PICK"
                      aria-label={`${language === 'zh' ? '选择' : 'Select'} ${cleanText(item.title)}`}
                    >
                      <span>{checked ? '01' : '00'}</span>
                    </button>

                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.title}
                      onError={(event) => applyFallbackImage(event.currentTarget)}
                      referrerPolicy="no-referrer"
                    />

                    <div className={styles.curationBody}>
                      <div className={styles.curationTopline}>
                        <span>{cleanText(item.type)}</span>
                        <span>{checked ? (language === 'zh' ? '已选中' : 'SELECTED') : language === 'zh' ? '详情' : 'DETAIL'}</span>
                      </div>
                      <h3>{cleanText(item.title)}</h3>
                      <p>{cleanText(item.description)}</p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          {footer ? (
            <div className={styles.panelFoot}>
              <span>{footer.email}</span>
              <span>{footer.location}</span>
              <span>{footer.credibility}</span>
            </div>
          ) : null}
        </div>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {openedItem ? (
              <motion.div
                className={styles.curationModalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpenedId(null)}
              >
                <motion.div
                  className={styles.curationModal}
                  initial={{ opacity: 0, y: 28, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.modalMedia}>
                    <img
                      src={resolveImageUrl(openedItem.image)}
                      alt={openedItem.title}
                      referrerPolicy="no-referrer"
                      onError={(event) => applyFallbackImage(event.currentTarget)}
                    />
                  </div>
                  <div className={styles.modalBody}>
                    <div className={styles.modalTopline}>
                      <span>{cleanText(openedItem.type)}</span>
                      <button type="button" onClick={() => setOpenedId(null)} data-cursor-text="CLOSE">
                        {t('nav.close')}
                      </button>
                    </div>
                    <h3>{cleanText(openedItem.title)}</h3>
                    <p>{cleanText(openedItem.description)}</p>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
