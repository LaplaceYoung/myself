import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext';

const LanguageToggle = () => {
    const { toggleLanguage, t } = useLanguage();

    return (
        <motion.button
            onClick={toggleLanguage}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
                position: 'fixed',
                top: 'var(--space-md)',
                right: 'var(--space-md)',
                zIndex: 9999,
                background: 'transparent',
                border: '1px solid var(--border-light)',
                borderRadius: '50px',
                padding: '8px 16px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                cursor: 'pointer',
                mixBlendMode: 'difference', // Helps it stand out on any background
                backdropFilter: 'blur(4px)',
            }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
        >
            {t('nav.translate')}
        </motion.button>
    );
};

export default LanguageToggle;
