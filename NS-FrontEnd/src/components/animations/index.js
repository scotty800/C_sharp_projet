// Export all animation components
export { default as FadeIn, FadeInStagger, PageTransition, ScrollReveal } from './FadeIn';
export { default as SlideIn, SlideInModal, SlideInList } from './SlideIn';
export { 
  default as HoverScale,
  HoverLift,
  HoverGlow,
  HoverRotate,
  HoverPulse,
  HoverCard,
  HoverButton
} from './HoverScale';

// Animation utilities
export const animations = {
  fadeIn: 'fade-in-css',
  fadeInUp: 'fade-in-up-css',
  fadeInDown: 'fade-in-down-css',
  fadeInLeft: 'fade-in-left-css',
  fadeInRight: 'fade-in-right-css',
  scaleIn: 'scale-in-css',
  slideInLeft: 'slide-in-left-css',
  slideInRight: 'slide-in-right-css',
  slideInUp: 'slide-in-up-css',
  slideInDown: 'slide-in-down-css',
  pulse: 'pulse-css',
  shake: 'shake-css',
  bounce: 'bounce-css',
  rotate: 'rotate-css',
  float: 'float-css',
  glow: 'glow-css'
};

// Animation hooks
export const useAnimation = (animation, delay = 0) => {
  return {
    className: animations[animation] || '',
    style: { animationDelay: `${delay}ms` }
  };
};

// Intersection Observer hook for scroll animations
export const useScrollAnimation = (options = {}) => {
  const [ref, setRef] = React.useState(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (options.once) observer.unobserve(ref);
      } else if (!options.once) {
        setIsVisible(false);
      }
    }, { threshold: options.threshold || 0.1 });

    observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref, options]);

  return [setRef, isVisible];
};