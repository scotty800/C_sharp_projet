// ============================================================
// hooks/useBlockAnimation.ts
// Hook React — pont entre le moteur GSAP et les blocs du Studio
// ============================================================
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { animationEngine, setInitialState } from '@/components/shop-studio/lib/animations/engine';
import type {
  BlockAnimationsConfig,
  AnimationParams,
  AnimationContext,
  PageTransitionConfig,
} from '@/types/animations';

// ─────────────────────────────────────────────────────────────
// 1. useBlockAnimation
// Applique les animations configurées sur un bloc
// ─────────────────────────────────────────────────────────────

interface UseBlockAnimationOptions {
  blockId: string;
  config?: BlockAnimationsConfig | null;
  context?: AnimationContext;
  /** En mode studio on applique uniquement les boucles et hover, pas les scroll/entrance auto */
  studioMode?: boolean;
}

export function useBlockAnimation({
  blockId,
  config,
  context = 'shop',
  studioMode = false,
}: UseBlockAnimationOptions) {
  const elementRef = useRef<HTMLElement | null>(null);
  /** Signature de tout ce qui peut changer le résultat de l'effet (pas seulement `config`). */
  const prevSignatureRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  const setRef = useCallback((el: HTMLElement | null) => {
    elementRef.current = el;
    // Enregistre l'élément réel dans le moteur, pour que le panneau Animations
    // puisse retrouver ce DOM node et y jouer une prévisualisation réelle.
    animationEngine.registerElement(blockId, el);
  }, [blockId]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const signature = JSON.stringify({ config, studioMode, context });
    if (prevSignatureRef.current === signature) return;
    prevSignatureRef.current = signature;

    // Toujours nettoyer ce qui tournait avant ET remettre l'élément dans un
    // état visuel neutre — qu'on ait une nouvelle config, une config vide,
    // ou des animations désactivées. C'est ce qui garantit qu'un bloc ne
    // reste jamais invisible/transformé de façon persistante en Studio.
    cleanupRef.current.forEach(fn => fn());
    cleanupRef.current = [];
    animationEngine.killBlockAnimations(blockId);

    if (!config || config.disabled) return;

    const animations = config.animations?.filter(a => a.enabled) ?? [];
    if (animations.length === 0) return;

    const prefersReduced =
      config.respectReducedMotion !== false &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    animationEngine.init({
      context,
      reducedMotion: prefersReduced,
      debug: context === 'studio',
    });

    // En Studio (édition) : seules les boucles et les survols restent actifs
    // en continu. Les entrées/scroll/sorties/clics ne se jouent QUE via une
    // prévisualisation volontaire (bouton Preview) — jamais automatiquement.
    const animsToApply = studioMode
      ? animations.filter(a => a.category === 'loop' || a.category === 'hover')
      : animations;

    // ⭐ FIX : l'état initial (anti-FOUC) n'est posé QUE pour les animations
    // qui vont réellement être jouées automatiquement. Avant, il était posé
    // pour toutes les animations d'entrée/scroll, même celles filtrées par
    // studioMode — ce qui figeait le bloc à opacity:0 sans jamais l'animer.
    animsToApply.forEach(anim => {
      if (anim.category === 'entrance' || anim.category === 'scroll') {
        setInitialState(el, anim);
      }
    });

    animsToApply.forEach(anim => {
      animationEngine.applyAnimation(el, anim, blockId).catch(err => {
        console.error('[useBlockAnimation] Erreur animation', anim.id, err);
      });
    });

    cleanupRef.current.push(() => {
      animationEngine.killBlockAnimations(blockId);
      animationEngine.cleanupElementListeners(el);
    });
  }, [blockId, config, context, studioMode]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
      animationEngine.killBlockAnimations(blockId);
      animationEngine.registerElement(blockId, null);
    };
  }, [blockId]);

  /** Rejoue une animation spécifique (utile pour le bouton Preview du studio) */
  const previewAnimation = useCallback(
    async (params: AnimationParams) => {
      const el = elementRef.current;
      if (!el) return;
      await animationEngine.previewAnimation(el, params, blockId);
    },
    [blockId]
  );

  return { setRef, previewAnimation };
}

// ─────────────────────────────────────────────────────────────
// 2. usePageTransition
// Gère les transitions entre pages dans ShopPageRenderer
// ─────────────────────────────────────────────────────────────

interface UsePageTransitionOptions {
  containerRef: React.RefObject<HTMLElement>;
  config?: PageTransitionConfig | null;
  context?: AnimationContext;
}

export function usePageTransition({
  containerRef,
  config,
  context = 'shop',
}: UsePageTransitionOptions) {
  const isTransitioningRef = useRef(false);

  const transitionToPage = useCallback(
    async (onSwap: () => void | Promise<void>) => {
      if (isTransitioningRef.current) return;
      const el = containerRef.current;
      if (!el || !config || config.type === 'none') {
        await onSwap();
        return;
      }

      isTransitioningRef.current = true;
      animationEngine.init({ context });

      try {
        // Phase OUT
        await animationEngine.transitionOut(el, config);
        // Swap du contenu
        await onSwap();
        // Phase IN
        await animationEngine.transitionIn(el, config);
      } catch (err) {
        console.error('[usePageTransition]', err);
        await onSwap(); // fallback sans animation
      } finally {
        isTransitioningRef.current = false;
      }
    },
    [containerRef, config, context]
  );

  return { transitionToPage, isTransitioning: isTransitioningRef };
}

// ─────────────────────────────────────────────────────────────
// 3. usePreviewOnRealElement
// Utilisé par AnimationsPanel pour jouer la preview directement sur
// le vrai bloc/page du canvas (via le registre du moteur), au lieu
// d'une boîte CSS isolée.
// ─────────────────────────────────────────────────────────────

export function usePreviewOnRealElement(targetId: string) {
  const play = useCallback(async (params: AnimationParams) => {
    const el = animationEngine.getElement(targetId);
    if (!el) return;
    animationEngine.init({ context: 'studio', debug: false });
    await animationEngine.previewAnimation(el, params, targetId);
  }, [targetId]);

  const playPageTransition = useCallback(async (config: PageTransitionConfig) => {
    const el = animationEngine.getElement(targetId);
    if (!el) return;
    animationEngine.init({ context: 'studio', debug: false });
    await animationEngine.previewPageTransition(el, config);
  }, [targetId]);

  const stop = useCallback(() => {
    animationEngine.killBlockAnimations(targetId);
    const el = animationEngine.getElement(targetId);
    if (el) {
      animationEngine.cleanupElementListeners(el);
      animationEngine.resetElementStyle(targetId);
    }
  }, [targetId]);

  return { play, playPageTransition, stop };
}

// ─────────────────────────────────────────────────────────────
// 4. useAnimationPreview
// Hook léger pour le panneau Studio (preview instantanée)
// ⚠️ DEPRECATED : préférer usePreviewOnRealElement pour les
// prévisualisations sur le canvas réel.
// ─────────────────────────────────────────────────────────────

export function useAnimationPreview(blockId: string) {
  const elementRef = useRef<HTMLElement | null>(null);

  const setPreviewRef = useCallback((el: HTMLElement | null) => {
    elementRef.current = el;
  }, []);

  const play = useCallback(
    async (params: AnimationParams) => {
      const el = elementRef.current;
      if (!el) return;

      animationEngine.init({ context: 'studio', debug: false });
      await animationEngine.previewAnimation(el, params, `preview-${blockId}`);
    },
    [blockId]
  );

  const stop = useCallback(() => {
    animationEngine.killBlockAnimations(`preview-${blockId}`);
    if (elementRef.current) {
      animationEngine.cleanupElementListeners(elementRef.current);
      // Réinitialiser les transformations CSS
      elementRef.current.style.transform = '';
      elementRef.current.style.opacity = '';
      elementRef.current.style.filter = '';
      elementRef.current.style.boxShadow = '';
    }
  }, [blockId]);

  return { setPreviewRef, play, stop };
}

// ─────────────────────────────────────────────────────────────
// 5. useScrollTriggerRefresh
// Refresh automatique des ScrollTriggers après resize/layout
// ─────────────────────────────────────────────────────────────

export function useScrollTriggerRefresh() {
  useEffect(() => {
    const handleResize = () => {
      animationEngine.refresh().catch(() => {});
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
}