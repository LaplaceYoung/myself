import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './Footer.module.css';
import { useLanguage } from '../LanguageContext';
import { footerData } from '../data/content';

const Footer = () => {
    const footerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(footerRef, { once: true, margin: "0px 0px -100px 0px" });
    const { t } = useLanguage();

    const info = footerData[0] || {};

    return (
        <footer className={styles.footer} ref={footerRef}>
            <motion.div
                className="container"
                initial={{ y: 50, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className={styles.grid}>
                    <div className={styles.col}>
                        <h2 className={styles.cta} style={{ whiteSpace: 'pre-line' }}>{t('footer.cta')}</h2>
                        <a href={`mailto:${info.email}`} className={styles.email}>{info.email}</a>
                    </div>

                    <div className={styles.links}>
                        <div className={styles.linkGroup}>
                            <span className={styles.groupTitle}>{t('footer.socials')}</span>
                            <a href={info.twitter_link} target="_blank" rel="noopener noreferrer" className={styles.link}>Twitter (X)</a>
                            <a href={info.github_link} target="_blank" rel="noopener noreferrer" className={styles.link}>GitHub</a>
                            <a href={info.linkedin_link} target="_blank" rel="noopener noreferrer" className={styles.link}>LinkedIn</a>
                        </div>

                        <div className={styles.linkGroup}>
                            <span className={styles.groupTitle}>{t('footer.location')}</span>
                            <p className={styles.text}>{t('footer.basedIn')}</p>
                            <p className={styles.text}>{t('footer.availableWorldwide')}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
                    <p>{t('footer.intent')}</p>
                </div>
            </motion.div>
        </footer>
    );
};

export default Footer;
