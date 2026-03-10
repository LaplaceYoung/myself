import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
            transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] // Custom refined spring-like ease
            }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
