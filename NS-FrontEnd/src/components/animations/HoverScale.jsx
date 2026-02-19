import React from 'react';
import { motion } from 'framer-motion';
import './Animations.css';

const HoverScale = ({ 
  children, 
  scale = 1.05,
  duration = 0.2,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration, ease: 'easeInOut' }}
      className={`hover-scale ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Hover avec élévation
export const HoverLift = ({ 
  children, 
  lift = -4,
  scale = 1.02,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ y: lift, scale }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`hover-lift ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Hover avec glow
export const HoverGlow = ({ 
  children, 
  color = 'var(--primary)',
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ 
        boxShadow: `0 0 20px ${color}`,
        scale: 1.02
      }}
      transition={{ duration: 0.2 }}
      className={`hover-glow ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Hover avec rotation
export const HoverRotate = ({ 
  children, 
  rotate = 5,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ rotate }}
      transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
      className={`hover-rotate ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Hover avec pulse
export const HoverPulse = ({ 
  children, 
  scale = 1.1,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ 
        duration: 0.3,
        repeat: Infinity,
        repeatType: 'reverse'
      }}
      className={`hover-pulse ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Carte avec effets multiples
export const HoverCard = ({ 
  children, 
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ 
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 30px rgba(0,0,0,0.1)'
      }}
      transition={{ duration: 0.2 }}
      className={`hover-card ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Bouton avec effet
export const HoverButton = ({ 
  children, 
  className = ''
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className={`hover-button ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default HoverScale;