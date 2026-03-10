import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { writingsData as writings } from '../data/content';
import styles from './WritingDetail.module.css';

const WritingDetail = () => {
    const { id } = useParams();
    const article = writings.find(w => w.id === Number(id));
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacityFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    if (!article) {
        return (
            <div className={styles.notFound}>
                <h2>文章未找到 (Article Not Found)</h2>
                <Link to="/" className={styles.backBtn}>← 返回主页 (Back)</Link>
            </div>
        );
    }

    return (
        <article className={styles.articlePage} ref={containerRef}>
            <motion.header
                className={styles.header}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className={styles.nav}>
                    <Link to="/" className={styles.backLink} data-cursor-text="BACK">← 回到前沿 (Back to Home)</Link>
                </div>
                <div className={styles.heroInfo}>
                    <div className={styles.meta}>
                        <span className={styles.category}>{article.category}</span>
                        <span className={styles.date}>{article.date}</span>
                    </div>
                    <h1 className={styles.title}>{article.title}</h1>
                </div>
            </motion.header>

            {article.image && (
                <div className={styles.coverWrapper}>
                    <motion.div className={styles.imageInner} style={{ y: yParallax, opacity: opacityFade }}>
                        <img src={article.image} alt={article.title} className={styles.coverImage} />
                    </motion.div>
                </div>
            )}

            <div className={`${styles.contentWrapper} ${styles.markdownContent}`}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                >
                    {(article as any).content || '> _暂无内容 (No content available yet)_'}
                </ReactMarkdown>
            </div>

            <footer className={styles.footer}>
                <p>THE END</p>
                <div className={styles.divider}></div>
            </footer>
        </article>
    );
};

export default WritingDetail;
