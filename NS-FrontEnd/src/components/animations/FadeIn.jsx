import React from 'react';
import { motion } from 'framer-motion';
import './Animations.css';

const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5,
  direction = 'up',
  distance = 20,
  once = true,
  className = ''
}) => {
  const getInitial = () => {
    switch(direction) {
      case 'up':
        return { opacity: 0, y: distance };
      case 'down':
        return { opacity: 0, y: -distance };
      case 'left':
        return { opacity: 0, x: distance };
      case 'right':
        return { opacity: 0, x: -distance };
      default:
        return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      viewport={{ once, amount: 0.3 }}
      className={`fade-in ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Variants pour animations en cascade
export const FadeInStagger = ({ 
  children, 
  staggerChildren = 0.1,
  delayChildren = 0,
  direction = 'up',
  distance = 20,
  once = true,
  className = ''
}) => {
  const getInitial = () => {
    switch(direction) {
      case 'up':
        return { opacity: 0, y: distance };
      case 'down':
        return { opacity: 0, y: -distance };
      case 'left':
        return { opacity: 0, x: distance };
      case 'right':
        return { opacity: 0, x: -distance };
      default:
        return { opacity: 0 };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren
      }
    }
  };

  const childVariants = {
    hidden: getInitial(),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      viewport={{ once, amount: 0.3 }}
      className={`fade-in-stagger ${className}`}
    >
      {React.Children.map(children, child => (
        <motion.div variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Pour les transitions de page
export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

// Pour les éléments qui apparaissent au scroll
export const ScrollReveal = ({ 
  children, 
  threshold = 0.2,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, threshold }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`scroll-reveal ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;