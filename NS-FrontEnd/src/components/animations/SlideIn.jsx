import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Animations.css';

const SlideIn = ({ 
  children, 
  isVisible = true,
  direction = 'left',
  duration = 0.3,
  className = ''
}) => {
  const getVariants = () => {
    switch(direction) {
      case 'left':
        return {
          hidden: { x: '-100%', opacity: 0 },
          visible: { x: 0, opacity: 1 }
        };
      case 'right':
        return {
          hidden: { x: '100%', opacity: 0 },
          visible: { x: 0, opacity: 1 }
        };
      case 'top':
        return {
          hidden: { y: '-100%', opacity: 0 },
          visible: { y: 0, opacity: 1 }
        };
      case 'bottom':
        return {
          hidden: { y: '100%', opacity: 0 },
          visible: { y: 0, opacity: 1 }
        };
      default:
        return {
          hidden: { x: '-100%', opacity: 0 },
          visible: { x: 0, opacity: 1 }
        };
    }
  };

  const variants = getVariants();

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration, ease: 'easeInOut' }}
          className={`slide-in slide-in-${direction} ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// SlideIn pour les modales
export const SlideInModal = ({ 
  children, 
  isOpen, 
  onClose,
  direction = 'bottom',
  className = ''
}) => {
  const getInitialPosition = () => {
    switch(direction) {
      case 'left':
        return { x: '-100%' };
      case 'right':
        return { x: '100%' };
      case 'top':
        return { y: '-100%' };
      case 'bottom':
        return { y: '100%' };
      default:
        return { y: '100%' };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="slide-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className={`slide-modal slide-modal-${direction} ${className}`}
            initial={getInitialPosition()}
            animate={{ x: 0, y: 0 }}
            exit={getInitialPosition()}
            transition={{ type: 'spring', damping: 30 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// SlideIn pour les listes
export const SlideInList = ({ 
  children, 
  stagger = true,
  className = ''
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger ? 0.1 : 0
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`slide-in-list ${className}`}
    >
      {React.Children.map(children, child => (
        <motion.div variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SlideIn;