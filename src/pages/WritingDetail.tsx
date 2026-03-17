import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { writingsData as writings } from '../data/content';
import styles from './WritingDetail.module.css';
import { applyFallbackImage, resolveImageUrl } from '../utils/image';

const WritingDetail = () => {
  const { id } = useParams();
  const article = writings.find((item) => item.id === Number(id) && item.status === 'published');
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const markdownComponents: Components = {
    img: ({ src, alt }) => (
      <img
        src={resolveImageUrl(typeof src === 'string' ? src : '')}
        alt={alt || 'Article illustration'}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(event) => applyFallbackImage(event.currentTarget)}
      />
    ),
  };

  if (!article) {
    return (
      <div className={styles.notFound}>
        <h2>Article Not Found</h2>
        <Link to="/" className={styles.backBtn}>Back</Link>
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
          <Link to="/" className={styles.backLink} data-cursor-text="BACK">Back to Home</Link>
        </div>
        <div className={styles.heroInfo}>
          <div className={styles.meta}>
            <span className={styles.category}>{article.category}</span>
            <span className={styles.date}>{article.date}</span>
          </div>
          <h1 className={styles.title}>{article.title}</h1>
          {article.excerpt ? <p>{article.excerpt}</p> : null}
        </div>
      </motion.header>

      {article.image ? (
        <div className={styles.coverWrapper}>
          <motion.div className={styles.imageInner} style={{ y: yParallax, opacity: opacityFade }}>
            <img
              src={resolveImageUrl(article.image)}
              alt={article.title}
              className={styles.coverImage}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(event) => applyFallbackImage(event.currentTarget)}
            />
          </motion.div>
        </div>
      ) : null}

      <div className={`${styles.contentWrapper} ${styles.markdownContent}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={markdownComponents}
        >
          {article.content || '> _No content available yet._'}
        </ReactMarkdown>
      </div>

      <footer className={styles.footer}>
        <p>THE END</p>
        <div className={styles.divider} />
      </footer>
    </article>
  );
};

export default WritingDetail;
