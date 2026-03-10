import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Logo = () => {
    return (
        <Link to="/">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'fixed',
                    top: 'var(--space-md)',
                    left: 'var(--space-md)',
                    zIndex: 9999,
                    height: '40px',
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mixBlendMode: 'difference', // Key for the adaptive editorial feel
                    color: 'white', // Base color when difference is applied over bright bg
                    cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Home"
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Minimalist Organic Serif "LY" Monogram */}
                    {/* The "L" with sharp editorial stems */}
                    <path
                        d="M35 20V80H60"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                    />

                    {/* The elegant "Y" that intersects */}
                    <path
                        d="M45 20L55 50L75 20 M55 50V85"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                    />

                    {/* An organic sweeping accent line cutting through, adding the "Organic" feel */}
                    <motion.path
                        d="M20 75C40 75 50 25 80 25"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        style={{ mixBlendMode: 'normal' }}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                    />
                </svg>
            </motion.div>
        </Link>
    );
};

export default Logo;
