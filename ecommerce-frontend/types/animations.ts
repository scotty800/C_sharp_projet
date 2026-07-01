// ============================================================
// types/animations.ts
// Contrats TypeScript pour le système d'animations GSAP
// ============================================================

// ─────────────────────────────────────────────────────────────
// 1. EASING
// ─────────────────────────────────────────────────────────────

export type EasingPreset =
  | 'none'
  | 'power1.in' | 'power1.out' | 'power1.inOut'
  | 'power2.in' | 'power2.out' | 'power2.inOut'
  | 'power3.in' | 'power3.out' | 'power3.inOut'
  | 'power4.in' | 'power4.out' | 'power4.inOut'
  | 'back.in'   | 'back.out'   | 'back.inOut'
  | 'bounce.in' | 'bounce.out' | 'bounce.inOut'
  | 'elastic.in'| 'elastic.out'| 'elastic.inOut'
  | 'circ.in'   | 'circ.out'   | 'circ.inOut'
  | 'expo.in'   | 'expo.out'   | 'expo.inOut'
  | 'sine.in'   | 'sine.out'   | 'sine.inOut';

// ─────────────────────────────────────────────────────────────
// 2. CATÉGORIES D'ANIMATIONS
// ─────────────────────────────────────────────────────────────

export type AnimationCategory =
  | 'entrance'    // apparition au chargement ou à l'entrée dans le viewport
  | 'scroll'      // déclenchée par le scroll (ScrollTrigger)
  | 'hover'       // au survol
  | 'click'       // au clic
  | 'loop'        // en boucle continue
  | 'exit'        // disparition

// ─────────────────────────────────────────────────────────────
// 3. TYPES D'ANIMATIONS
// ─────────────────────────────────────────────────────────────

export type EntranceAnimationType =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'scaleUp'
  | 'scaleDown'
  | 'rotateIn'
  | 'blurIn'
  | 'flipX'
  | 'flipY'
  | 'bounceIn'
  | 'elasticIn'
  | 'rollIn'
  | 'skewIn'
  | 'none';

export type ScrollAnimationType =
  | 'fadeInOnScroll'
  | 'slideUpOnScroll'
  | 'slideLeftOnScroll'
  | 'slideRightOnScroll'
  | 'zoomInOnScroll'
  | 'rotateOnScroll'
  | 'scaleOnScroll'
  | 'parallax'
  | 'stagger'
  | 'pinSection'
  | 'revealText'
  | 'countUp'
  | 'horizontalScroll'
  | 'none';

export type HoverAnimationType =
  | 'hoverScale'
  | 'hoverGlow'
  | 'hoverSlideUp'
  | 'hoverRotate'
  | 'hoverShake'
  | 'hoverPulse'
  | 'hoverFlip'
  | 'hoverTilt'
  | 'none';

export type ClickAnimationType =
  | 'clickBounce'
  | 'clickPulse'
  | 'clickRipple'
  | 'clickShake'
  | 'none';

export type LoopAnimationType =
  | 'pulse'
  | 'float'
  | 'spin'
  | 'swing'
  | 'heartbeat'
  | 'blink'
  | 'wave'
  | 'none';

export type PageTransitionType =
  | 'fade'
  | 'slideLeft'
  | 'slideRight'
  | 'slideUp'
  | 'slideDown'
  | 'zoomIn'
  | 'zoomOut'
  | 'reveal'
  | 'curtainVertical'
  | 'curtainHorizontal'
  | 'morph'
  | 'none';

export type AnyAnimationType =
  | EntranceAnimationType
  | ScrollAnimationType
  | HoverAnimationType
  | ClickAnimationType
  | LoopAnimationType
  | PageTransitionType;

// ─────────────────────────────────────────────────────────────
// 4. DÉCLENCHEUR
// ─────────────────────────────────────────────────────────────

export type AnimationTrigger =
  | 'onLoad'        // dès le chargement de la page
  | 'onEnterView'   // quand l'élément entre dans le viewport
  | 'onScroll'      // progression liée au scroll
  | 'onHover'       // au survol
  | 'onClick'       // au clic
  | 'manual';       // contrôlé par code

// ─────────────────────────────────────────────────────────────
// 5. PARAMÈTRES D'UNE ANIMATION INDIVIDUELLE
// ─────────────────────────────────────────────────────────────

export interface AnimationParams {
  // Identité
  id: string;
  name?: string;                      // label libre pour l'utilisateur
  category: AnimationCategory;
  type: AnyAnimationType;
  trigger: AnimationTrigger;
  enabled: boolean;

  // Timing
  duration: number;                   // secondes
  delay: number;                      // secondes
  repeatCount: number;                // 0 = pas de répétition, -1 = infini
  repeatDelay?: number;               // délai entre répétitions
  yoyo?: boolean;                     // aller-retour sur la répétition

  // Easing
  ease: EasingPreset;

  // Propriétés de transformation
  fromX?: number;                     // px ou %
  fromY?: number;
  fromScale?: number;
  fromRotation?: number;              // degrés
  fromOpacity?: number;               // 0–1
  fromBlur?: number;                  // px
  fromSkewX?: number;                 // degrés
  fromSkewY?: number;

  toX?: number;
  toY?: number;
  toScale?: number;
  toRotation?: number;
  toOpacity?: number;
  toBlur?: number;
  toSkewX?: number;
  toSkewY?: number;

  // Scroll spécifique
  scrollStart?: string;               // ex: "top 80%"
  scrollEnd?: string;                 // ex: "bottom 20%"
  scrub?: boolean | number;           // true = smooth scrub, number = lag
  pin?: boolean;                      // épingle l'élément
  pinSpacing?: boolean;
  staggerAmount?: number;             // délai entre enfants (stagger)
  staggerFrom?: 'start' | 'end' | 'center' | 'random';
  parallaxSpeed?: number;             // multiplicateur de vitesse (-2 à 2)
  markers?: boolean;                  // debug markers (dev seulement)

  // ⭐ NOUVEAU : rejouer l'animation à chaque passage (montée ET descente)
  // false (défaut) = once: true — l'animation ne se joue qu'une fois
  // true = l'animation se rejoue à chaque fois que l'élément entre dans le viewport
  //        que ce soit en descendant OU en remontant
  replayOnScroll?: boolean;

  // Hover spécifique
  hoverScale?: number;
  hoverRotation?: number;
  hoverX?: number;
  hoverY?: number;
  hoverDuration?: number;

  // Transition de page spécifique
  pageTransitionType?: PageTransitionType;
  pageTransitionDuration?: number;
  pageTransitionEase?: EasingPreset;
}

// ─────────────────────────────────────────────────────────────
// 6. PRESET D'ANIMATION (template prêt à l'emploi)
// ─────────────────────────────────────────────────────────────

export interface AnimationPreset {
  id: string;
  label: string;
  description: string;
  category: AnimationCategory;
  type: AnyAnimationType;
  icon: string;                       // emoji ou nom d'icône
  tags: string[];
  params: Omit<AnimationParams, 'id' | 'enabled'>;
  previewCss?: string;                // classe CSS pour l'aperçu miniature
}

// ─────────────────────────────────────────────────────────────
// 7. CONFIGURATION ANIMATIONS D'UN BLOC
// Stockée dans block.props.animationsConfig
// ─────────────────────────────────────────────────────────────

export interface BlockAnimationsConfig {
  // Animations actives sur ce bloc (tableau pour cumuler)
  animations: AnimationParams[];

  // Transition de page sortante (quand on quitte cette page)
  pageTransitionOut?: PageTransitionConfig;

  // Override global : désactiver toutes les animations sur ce bloc
  disabled?: boolean;

  // Réduire les animations (accessibilité)
  respectReducedMotion?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 8. CONFIGURATION TRANSITION DE PAGE
// ─────────────────────────────────────────────────────────────

export interface PageTransitionConfig {
  type: PageTransitionType;
  duration: number;
  ease: EasingPreset;
  direction?: 'forward' | 'backward' | 'auto';
  color?: string;                     // couleur du rideau / overlay
}

// ─────────────────────────────────────────────────────────────
// 9. CONTEXTE D'EXÉCUTION
// ─────────────────────────────────────────────────────────────

export type AnimationContext = 'studio' | 'preview' | 'shop';

// ─────────────────────────────────────────────────────────────
// 10. ÉTAT D'UNE ANIMATION (pour le moteur)
// ─────────────────────────────────────────────────────────────

export interface AnimationState {
  blockId: string;
  animationId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  progress: number;                   // 0–1
  timeline?: any;                     // référence GSAP timeline
}

// ─────────────────────────────────────────────────────────────
// 11. OPTIONS DU MOTEUR
// ─────────────────────────────────────────────────────────────

export interface AnimationEngineOptions {
  context: AnimationContext;
  reducedMotion?: boolean;
  debug?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 12. HELPERS TYPES
// ─────────────────────────────────────────────────────────────

/** Crée un AnimationParams minimal avec des valeurs par défaut */
export function createDefaultAnimation(
  category: AnimationCategory,
  type: AnyAnimationType,
  trigger: AnimationTrigger
): AnimationParams {
  return {
    id: `anim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category,
    type,
    trigger,
    enabled: true,
    duration: 0.6,
    delay: 0,
    repeatCount: 0,
    ease: 'power2.out',
    replayOnScroll: false,
    fromOpacity: type.includes('fade') || type.includes('Fade') ? 0 : undefined,
    fromY: type === 'slideUp' || type === 'slideUpOnScroll' ? 40 : undefined,
    fromX:
      type === 'slideLeft' || type === 'slideLeftOnScroll' ? -40
      : type === 'slideRight' || type === 'slideRightOnScroll' ? 40
      : undefined,
    fromScale: type === 'zoomIn' || type === 'zoomInOnScroll' ? 0.8 : undefined,
  };
}

/** Retourne true si le type appartient à la catégorie scroll */
export function isScrollAnimation(type: AnyAnimationType): type is ScrollAnimationType {
  const scrollTypes: ScrollAnimationType[] = [
    'fadeInOnScroll', 'slideUpOnScroll', 'slideLeftOnScroll', 'slideRightOnScroll',
    'zoomInOnScroll', 'rotateOnScroll', 'scaleOnScroll', 'parallax', 'stagger',
    'pinSection', 'revealText', 'countUp', 'horizontalScroll', 'none',
  ];
  return scrollTypes.includes(type as ScrollAnimationType);
}

/** Retourne true si le type appartient à la catégorie hover */
export function isHoverAnimation(type: AnyAnimationType): type is HoverAnimationType {
  const hoverTypes: HoverAnimationType[] = [
    'hoverScale', 'hoverGlow', 'hoverSlideUp', 'hoverRotate',
    'hoverShake', 'hoverPulse', 'hoverFlip', 'hoverTilt', 'none',
  ];
  return hoverTypes.includes(type as HoverAnimationType);
}