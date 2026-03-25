import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" aria-label="Home">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -2 }}
        style={{
          position: 'fixed',
          top: 'var(--space-sm)',
          left: 'var(--space-sm)',
          zIndex: 9999,
          display: 'grid',
          gap: '0.1rem',
          color: 'var(--surface-ink)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 2vw, 1.9rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.05em',
          }}
        >
          LY
        </span>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Index
        </span>
      </motion.div>
    </Link>
  );
};

export default Logo;
