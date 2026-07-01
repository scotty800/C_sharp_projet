// ============================================================
// lib/animations/engine.ts
// Moteur d'animations GSAP centralisé
// ============================================================

import type {
  AnimationParams,
  AnimationEngineOptions,
  AnimationState,
  AnimationContext,
  PageTransitionConfig,
  AnyAnimationType,
} from '@/types/animations';

// ─────────────────────────────────────────────────────────────
// CHARGEMENT GSAP
// ─────────────────────────────────────────────────────────────

let gsapInstance: any = null;
let scrollTriggerInstance: any = null;

export async function loadGSAP(): Promise<{ gsap: any; ScrollTrigger: any }> {
  if (gsapInstance && scrollTriggerInstance) {
    return { gsap: gsapInstance, ScrollTrigger: scrollTriggerInstance };
  }

  if (typeof window === 'undefined') {
    throw new Error('[AnimationEngine] GSAP doit être chargé côté client uniquement.');
  }

  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);

  gsap.registerPlugin(ScrollTrigger);
  gsapInstance = gsap;
  scrollTriggerInstance = ScrollTrigger;

  return { gsap, ScrollTrigger };
}

function resetElementVisualState(el: HTMLElement) {
  el.style.opacity = '';
  el.style.filter = '';
  el.style.transform = '';
  el.style.boxShadow = '';
}

// ─────────────────────────────────────────────────────────────
// MOTEUR PRINCIPAL
// ─────────────────────────────────────────────────────────────

class AnimationEngine {
  private context: AnimationContext = 'shop';
  private reducedMotion = false;
  private debug = false;

  private timelines = new Map<string, Map<string, any>>();
  private states = new Map<string, Map<string, AnimationState>>();
  private listeners: Array<(states: Map<string, Map<string, AnimationState>>) => void> = [];
  private elementRegistry = new Map<string, HTMLElement>();

  // ───────────────────────────────────────────────────────────
  // REGISTRE D'ÉLÉMENTS
  // ───────────────────────────────────────────────────────────

  registerElement(blockId: string, el: HTMLElement | null) {
    if (el) {
      this.elementRegistry.set(blockId, el);
    } else {
      this.elementRegistry.delete(blockId);
    }
  }

  getElement(blockId: string): HTMLElement | undefined {
    return this.elementRegistry.get(blockId);
  }

  resetElementStyle(blockId: string) {
    const el = this.elementRegistry.get(blockId);
    if (el) resetElementVisualState(el);
  }

  // ───────────────────────────────────────────────────────────
  // INITIALISATION
  // ───────────────────────────────────────────────────────────

  init(options: AnimationEngineOptions) {
    this.context = options.context;
    this.debug = options.debug ?? false;
    this.reducedMotion =
      options.reducedMotion ??
      (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // ───────────────────────────────────────────────────────────
  // APPLIQUER UNE ANIMATION
  // ───────────────────────────────────────────────────────────

  async applyAnimation(
    element: HTMLElement,
    params: AnimationParams,
    blockId: string
  ): Promise<void> {
    if (!params.enabled) return;
    if (this.reducedMotion && params.category !== 'hover') return;

    const { gsap, ScrollTrigger } = await loadGSAP();

    this.killAnimation(blockId, params.id);

    const tl = gsap.timeline({ paused: true });

    try {
      switch (params.category) {
        case 'entrance':
        case 'exit':
          this.buildEntranceTimeline(tl, element, params, gsap);
          await this.triggerEntrance(tl, element, params, gsap, ScrollTrigger, blockId);
          break;

        case 'scroll':
          this.buildScrollAnimation(element, params, gsap, ScrollTrigger, blockId);
          return;

        case 'hover':
          this.buildHoverAnimation(element, params, gsap, blockId);
          return;

        case 'loop':
          this.buildLoopAnimation(tl, element, params, gsap);
          tl.play();
          break;

        case 'click':
          this.buildClickAnimation(element, params, gsap, blockId);
          return;

        default:
          break;
      }

      this.storeTimeline(blockId, params.id, tl);
    } catch (err) {
      console.error('[AnimationEngine] Erreur animation', err);
      this.updateState(blockId, params.id, { status: 'error', progress: 0 });
    }
  }

  // ───────────────────────────────────────────────────────────
  // ENTRANCE / EXIT
  // ───────────────────────────────────────────────────────────

  private buildEntranceTimeline(tl: any, el: HTMLElement, p: AnimationParams, gsap: any) {
    const from: Record<string, any> = {};
    const to: Record<string, any> = {
      duration: p.duration,
      ease: p.ease,
      delay: p.delay,
      repeat: p.repeatCount,
      yoyo: p.yoyo ?? false,
    };

    if (p.fromOpacity !== undefined) from.opacity = p.fromOpacity;
    if (p.fromX !== undefined)       from.x        = p.fromX;
    if (p.fromY !== undefined)       from.y        = p.fromY;
    if (p.fromScale !== undefined)   from.scale    = p.fromScale;
    if (p.fromRotation !== undefined) from.rotation = p.fromRotation;
    if (p.fromSkewX !== undefined)   from.skewX    = p.fromSkewX;
    if (p.fromSkewY !== undefined)   from.skewY    = p.fromSkewY;
    if (p.fromBlur !== undefined) {
      from.filter = `blur(${p.fromBlur}px)`;
      to.filter   = 'blur(0px)';
    }

    if (p.toOpacity !== undefined)   to.opacity    = p.toOpacity;
    if (p.toX !== undefined)         to.x          = p.toX;
    if (p.toY !== undefined)         to.y          = p.toY;
    if (p.toScale !== undefined)     to.scale      = p.toScale;
    if (p.toRotation !== undefined)  to.rotation   = p.toRotation;
    if (p.toSkewX !== undefined)     to.skewX      = p.toSkewX;
    if (p.toSkewY !== undefined)     to.skewY      = p.toSkewY;

    if (p.type === 'blurIn') {
      tl.fromTo(el, { opacity: 0, filter: `blur(${p.fromBlur ?? 12}px)` }, { opacity: 1, filter: 'blur(0px)', ...to });
      return;
    }
    if (p.type === 'bounceIn') {
      tl.fromTo(el, { ...from }, { ...to, ease: 'bounce.out' });
      return;
    }
    if (p.type === 'elasticIn') {
      tl.fromTo(el, { ...from }, { ...to, ease: 'elastic.out(1, 0.5)' });
      return;
    }

    if (Object.keys(from).length > 0) {
      tl.fromTo(el, from, to);
    } else {
      tl.to(el, to);
    }
  }

  // ───────────────────────────────────────────────────────────
  // DÉCLENCHEMENT ENTRANCE
  // ───────────────────────────────────────────────────────────

  private async triggerEntrance(
    tl: any,
    el: HTMLElement,
    p: AnimationParams,
    gsap: any,
    ScrollTrigger: any,
    blockId: string
  ) {
    if (p.trigger === 'onLoad') {
      this.updateState(blockId, p.id, { status: 'running', progress: 0 });
      tl.play();
      tl.eventCallback('onComplete', () => {
        this.updateState(blockId, p.id, { status: 'completed', progress: 1 });
      });
      return;
    }

    if (p.trigger === 'onEnterView') {
      // ⭐ replayOnScroll : once: false + onEnterBack pour rejouer à chaque passage
      const shouldReplay = p.replayOnScroll === true;

      ScrollTrigger.create({
        trigger: el,
        start: p.scrollStart ?? 'top 85%',
        once: !shouldReplay,
        onEnter: () => {
          // Repart toujours de l'état initial pour un replay propre
          tl.restart();
          this.updateState(blockId, p.id, { status: 'running', progress: 0 });
        },
        // ⭐ onEnterBack : joue quand l'élément entre dans le viewport en remontant
        ...(shouldReplay ? {
          onEnterBack: () => {
            tl.restart();
            this.updateState(blockId, p.id, { status: 'running', progress: 0 });
          },
          // Remet l'élément dans son état initial quand il sort du viewport
          // pour que le replay soit propre
          onLeave: () => {
            tl.pause(0);
            this.updateState(blockId, p.id, { status: 'idle', progress: 0 });
          },
          onLeaveBack: () => {
            tl.pause(0);
            this.updateState(blockId, p.id, { status: 'idle', progress: 0 });
          },
        } : {}),
        id: `st-entrance-${blockId}-${p.id}`,
        markers: this.debug && (p.markers ?? false),
      });
    }
  }

  // ───────────────────────────────────────────────────────────
  // SCROLL ANIMATIONS
  // ───────────────────────────────────────────────────────────

  private buildScrollAnimation(
    el: HTMLElement,
    p: AnimationParams,
    gsap: any,
    ScrollTrigger: any,
    blockId: string
  ) {
    const stId = `st-scroll-${blockId}-${p.id}`;
    const shouldReplay = p.replayOnScroll === true;

    const commonST = {
      trigger: el,
      start: p.scrollStart ?? 'top 85%',
      end: p.scrollEnd ?? 'top 30%',
      scrub: p.scrub ?? false,
      pin: p.pin ?? false,
      pinSpacing: p.pinSpacing ?? false,
      markers: this.debug && (p.markers ?? false),
      id: stId,
      onUpdate: (self: any) => {
        this.updateState(blockId, p.id, { status: 'running', progress: self.progress });
      },
      onLeave: () => {
        this.updateState(blockId, p.id, { status: 'completed', progress: 1 });
      },
    };

    // Parallax — pas de replay possible (lié au scrub)
    if (p.type === 'parallax') {
      const speed = p.parallaxSpeed ?? -0.3;
      gsap.to(el, {
        y: () => el.offsetHeight * speed,
        ease: 'none',
        scrollTrigger: commonST,
      });
      return;
    }

    if (p.type === 'pinSection') {
      ScrollTrigger.create({ ...commonST });
      return;
    }

    if (p.type === 'rotateOnScroll') {
      gsap.fromTo(
        el,
        { rotation: p.fromRotation ?? 0 },
        { rotation: p.toRotation ?? 360, ease: 'none', scrollTrigger: commonST }
      );
      return;
    }

    if (p.type === 'scaleOnScroll') {
      gsap.fromTo(
        el,
        { scale: p.fromScale ?? 0.8 },
        { scale: p.toScale ?? 1, ease: 'none', scrollTrigger: commonST }
      );
      return;
    }

    // ⭐ STAGGER FIX : on descend dans le DOM pour trouver les vrais enfants visuels.
    // Le wrapper React ajoute un div intermédiaire, donc el.children[0].children
    // correspond aux vrais blocs. On essaie plusieurs niveaux et on prend le premier
    // qui a plusieurs enfants (= le bon niveau).
    if (p.type === 'stagger') {
      const findStaggerChildren = (root: HTMLElement): HTMLElement[] => {
        // Niveau 1 : enfants directs
        const level1 = Array.from(root.children) as HTMLElement[];
        if (level1.length > 1) return level1;
        // Niveau 2 : petit-enfants (cas wrapper React)
        if (level1.length === 1) {
          const level2 = Array.from(level1[0].children) as HTMLElement[];
          if (level2.length > 0) return level2;
        }
        // Fallback : enfants directs même s'il n'y en a qu'un
        return level1;
      };

      const children = findStaggerChildren(el);
      if (children.length === 0) return;

      const from: Record<string, any> = {};
      const to: Record<string, any> = {
        duration: p.duration,
        ease: p.ease,
        stagger: { amount: p.staggerAmount ?? 0.15, from: p.staggerFrom ?? 'start' },
      };

      if (p.fromOpacity !== undefined) from.opacity = p.fromOpacity;
      if (p.fromY !== undefined)       from.y        = p.fromY;
      if (p.fromX !== undefined)       from.x        = p.fromX;
      if (p.toOpacity !== undefined)   to.opacity    = p.toOpacity;
      if (p.toY !== undefined)         to.y          = p.toY;
      if (p.toX !== undefined)         to.x          = p.toX;

      if (shouldReplay) {
        // ⭐ replayOnScroll pour stagger : on recrée la tween à chaque entrée
        ScrollTrigger.create({
          trigger: el,
          start: p.scrollStart ?? 'top 85%',
          onEnter: () => {
            gsap.fromTo(children, from, to);
          },
          onEnterBack: () => {
            gsap.fromTo(children, from, to);
          },
          onLeave: () => {
            gsap.set(children, from);
          },
          onLeaveBack: () => {
            gsap.set(children, from);
          },
          id: stId,
          markers: this.debug && (p.markers ?? false),
        });
      } else {
        // Une seule fois
        ScrollTrigger.create({
          trigger: el,
          start: p.scrollStart ?? 'top 85%',
          once: true,
          onEnter: () => {
            gsap.fromTo(children, from, to);
          },
          id: stId,
          markers: this.debug && (p.markers ?? false),
        });
      }
      return;
    }

    // Animations génériques scroll (fade, slide, zoom…)
    const from: Record<string, any> = {};
    const to: Record<string, any> = {
      duration: p.duration,
      ease: p.ease,
    };

    if (p.fromOpacity !== undefined) from.opacity = p.fromOpacity;
    if (p.fromY !== undefined)       from.y        = p.fromY;
    if (p.fromX !== undefined)       from.x        = p.fromX;
    if (p.fromScale !== undefined)   from.scale    = p.fromScale;
    if (p.toOpacity !== undefined)   to.opacity    = p.toOpacity;
    if (p.toY !== undefined)         to.y          = p.toY;
    if (p.toX !== undefined)         to.x          = p.toX;
    if (p.toScale !== undefined)     to.scale      = p.toScale;

    if (shouldReplay) {
      // ⭐ replayOnScroll : recrée la tween à chaque entrée/sortie
      ScrollTrigger.create({
        trigger: el,
        start: p.scrollStart ?? 'top 85%',
        onEnter: () => {
          if (Object.keys(from).length > 0) {
            gsap.fromTo(el, from, to);
          } else {
            gsap.to(el, to);
          }
        },
        onEnterBack: () => {
          if (Object.keys(from).length > 0) {
            gsap.fromTo(el, from, to);
          } else {
            gsap.to(el, to);
          }
        },
        onLeave: () => {
          if (Object.keys(from).length > 0) gsap.set(el, from);
        },
        onLeaveBack: () => {
          if (Object.keys(from).length > 0) gsap.set(el, from);
        },
        id: stId,
        markers: this.debug && (p.markers ?? false),
      });
    } else {
      if (Object.keys(from).length > 0) {
        gsap.fromTo(el, from, { ...to, scrollTrigger: commonST });
      } else {
        gsap.to(el, { ...to, scrollTrigger: commonST });
      }
    }
  }

  // ───────────────────────────────────────────────────────────
  // HOVER
  // ───────────────────────────────────────────────────────────

  private buildHoverAnimation(
    el: HTMLElement,
    p: AnimationParams,
    gsap: any,
    blockId: string
  ) {
    const duration = p.hoverDuration ?? p.duration;
    const ease = p.ease;

    const onEnter = () => {
      switch (p.type as string) {
        case 'hoverScale':
          gsap.to(el, { scale: p.hoverScale ?? 1.05, duration, ease });
          break;
        case 'hoverSlideUp':
          gsap.to(el, { y: p.hoverY ?? -6, duration, ease });
          break;
        case 'hoverRotate':
          gsap.to(el, { rotation: p.hoverRotation ?? 5, duration, ease });
          break;
        case 'hoverTilt':
          el.addEventListener('mousemove', handleTilt);
          break;
        case 'hoverPulse':
          gsap.to(el, { scale: p.hoverScale ?? 1.06, duration, ease: 'power1.inOut', repeat: -1, yoyo: true });
          break;
        case 'hoverGlow':
          gsap.to(el, { boxShadow: '0 0 20px 4px rgba(99,102,241,0.5)', duration, ease });
          break;
        case 'hoverShake':
          gsap.fromTo(
            el,
            { x: -4 },
            { x: 4, duration: 0.08, ease: 'power1.inOut', repeat: 4, yoyo: true, onComplete: () => gsap.set(el, { x: 0 }) }
          );
          break;
        default:
          break;
      }
    };

    const onLeave = () => {
      gsap.killTweensOf(el);
      el.removeEventListener('mousemove', handleTilt);
      gsap.to(el, { scale: 1, y: 0, x: 0, rotation: 0, boxShadow: 'none', filter: 'none', duration: duration * 0.8, ease: 'power2.out' });
    };

    const handleTilt = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / (rect.height / 2)) * -(p.hoverRotation ?? 8);
      const ry = ((e.clientX - cx) / (rect.width / 2)) * (p.hoverRotation ?? 8);
      gsap.to(el, { rotationX: rx, rotationY: ry, duration: 0.2, ease: 'power2.out', transformPerspective: 600 });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    (el as any).__gsapHoverCleanup = () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousemove', handleTilt);
      gsap.killTweensOf(el);
    };
  }

  // ───────────────────────────────────────────────────────────
  // LOOP
  // ───────────────────────────────────────────────────────────

  private buildLoopAnimation(tl: any, el: HTMLElement, p: AnimationParams, gsap: any) {
    const to: Record<string, any> = {
      duration: p.duration,
      ease: p.ease,
      repeat: p.repeatCount === 0 ? -1 : p.repeatCount,
      yoyo: p.yoyo ?? true,
      delay: p.delay,
    };

    switch (p.type as string) {
      case 'float':      tl.to(el, { y: p.toY ?? -12, ...to }); break;
      case 'pulse':      tl.to(el, { scale: p.toScale ?? 1.06, ...to }); break;
      case 'spin':       tl.to(el, { rotation: 360, duration: p.duration, ease: 'none', repeat: -1 }); break;
      case 'swing':      tl.fromTo(el, { rotation: p.fromRotation ?? -5 }, { rotation: p.toRotation ?? 5, ...to }); break;
      case 'blink':      tl.to(el, { opacity: p.toOpacity ?? 0.2, ...to }); break;
      case 'wave':       tl.to(el, { skewX: 8, duration: p.duration / 4, ease: 'sine.inOut', yoyo: true, repeat: -1 }); break;
      case 'heartbeat':
        tl.to(el, { scale: 1.15, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 3 })
          .to(el, { scale: 1, duration: p.duration - 0.6, ease: 'none' });
        break;
      default: break;
    }
  }

  // ───────────────────────────────────────────────────────────
  // CLICK
  // ───────────────────────────────────────────────────────────

  private buildClickAnimation(el: HTMLElement, p: AnimationParams, gsap: any, blockId: string) {
    const onClick = () => {
      switch (p.type as string) {
        case 'clickBounce': gsap.fromTo(el, { scale: 1 }, { scale: 0.9, duration: 0.1, ease: 'power2.in', yoyo: true, repeat: 1 }); break;
        case 'clickPulse':  gsap.fromTo(el, { scale: 1 }, { scale: 1.1, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 }); break;
        case 'clickRipple': gsap.fromTo(el, { scale: 1 }, { scale: 1.04, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 }); break;
        case 'clickShake':  gsap.fromTo(el, { x: 0 }, { x: 6, duration: 0.06, ease: 'power1.inOut', yoyo: true, repeat: 5 }); break;
        default: break;
      }
    };
    el.addEventListener('click', onClick);
    (el as any).__gsapClickCleanup = () => el.removeEventListener('click', onClick);
  }

  // ───────────────────────────────────────────────────────────
  // TRANSITIONS DE PAGE
  // ⭐ FIX : on ne nettoie que ce que GSAP a pu modifier (opacity/transform/filter),
  // jamais tout le style inline — sinon ça efface aussi position/left/top/width
  // posés par React sur le cadre de page, et la page perd sa largeur.
  // ───────────────────────────────────────────────────────────

  async transitionOut(container: HTMLElement, config: PageTransitionConfig): Promise<void> {
    if (this.reducedMotion) return;
    const { gsap } = await loadGSAP();

    // ⭐ FIX : on ne nettoie que ce que GSAP a pu modifier (opacity/transform/filter),
    // jamais tout le style inline — sinon ça efface aussi position/left/top/width
    // posés par React sur le cadre de page, et la page perd sa largeur.
    gsap.killTweensOf(container);
    gsap.set(container, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, filter: 'none' });

    return new Promise(resolve => {
      switch (config.type) {
        case 'fade':
          gsap.to(container, { opacity: 0, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'slideLeft':
          gsap.to(container, { x: '-100%', opacity: 0, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'slideRight':
          gsap.to(container, { x: '100%', opacity: 0, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'slideUp':
          gsap.to(container, { y: '-30%', opacity: 0, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'slideDown':
          gsap.to(container, { y: '30%', opacity: 0, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'zoomOut':
          gsap.to(container, { scale: 0.85, opacity: 0, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'zoomIn':
          gsap.to(container, { scale: 1.1, opacity: 0, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'reveal':
        case 'curtainVertical': {
          // ⭐ Supprimer un éventuel rideau orphelin avant d'en créer un nouveau
          document.querySelectorAll('[data-gsap-curtain]').forEach(el => el.remove());

          const curtain = document.createElement('div');
          curtain.setAttribute('data-gsap-curtain', 'true');
          curtain.style.cssText = `
            position:fixed;inset:0;z-index:9999;
            background:${config.color ?? '#000'};
            transform:scaleY(0);transform-origin:top;
            pointer-events:none;
          `;
          document.body.appendChild(curtain);
          gsap.to(curtain, {
            scaleY: 1,
            duration: config.duration / 2,
            ease: config.ease,
            onComplete: resolve,
          });
          break;
        }

        case 'curtainHorizontal': {
          document.querySelectorAll('[data-gsap-curtain]').forEach(el => el.remove());
          const curtain = document.createElement('div');
          curtain.setAttribute('data-gsap-curtain', 'true');
          curtain.style.cssText = `
            position:fixed;inset:0;z-index:9999;
            background:${config.color ?? '#000'};
            transform:scaleX(0);transform-origin:left;
            pointer-events:none;
          `;
          document.body.appendChild(curtain);
          gsap.to(curtain, {
            scaleX: 1,
            duration: config.duration / 2,
            ease: config.ease,
            onComplete: resolve,
          });
          break;
        }

        default:
          gsap.to(container, { opacity: 0, duration: config.duration * 0.5, ease: config.ease, onComplete: resolve });
      }
    });
  }

  async transitionIn(container: HTMLElement, config: PageTransitionConfig): Promise<void> {
    if (this.reducedMotion) return;
    const { gsap } = await loadGSAP();

    // ⭐ S'assurer que le container est visible avant de l'animer
    gsap.killTweensOf(container);

    return new Promise(resolve => {
      const existingCurtain = document.querySelector('[data-gsap-curtain]') as HTMLElement | null;

      switch (config.type) {
        case 'fade':
          gsap.fromTo(container, { opacity: 0 }, { opacity: 1, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'slideLeft':
          gsap.fromTo(container, { x: '30%', opacity: 0 }, { x: 0, opacity: 1, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'slideRight':
          gsap.fromTo(container, { x: '-30%', opacity: 0 }, { x: 0, opacity: 1, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'slideUp':
          gsap.fromTo(container, { y: '20%', opacity: 0 }, { y: 0, opacity: 1, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'slideDown':
          gsap.fromTo(container, { y: '-20%', opacity: 0 }, { y: 0, opacity: 1, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'zoomIn':
          gsap.fromTo(container, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'zoomOut':
          gsap.fromTo(container, { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 1, duration: config.duration, ease: config.ease, onComplete: resolve });
          break;

        case 'reveal':
        case 'curtainVertical': {
          if (existingCurtain) {
            gsap.to(existingCurtain, {
              scaleY: 0,
              transformOrigin: 'bottom',
              duration: config.duration / 2,
              ease: config.ease,
              onComplete: () => {
                existingCurtain.remove();
                resolve();
              },
            });
          } else {
            resolve();
          }
          break;
        }

        case 'curtainHorizontal': {
          if (existingCurtain) {
            gsap.to(existingCurtain, {
              scaleX: 0,
              transformOrigin: 'right',
              duration: config.duration / 2,
              ease: config.ease,
              onComplete: () => {
                existingCurtain.remove();
                resolve();
              },
            });
          } else {
            resolve();
          }
          break;
        }

        default:
          document.querySelectorAll('[data-gsap-curtain]').forEach(el => el.remove());
          gsap.fromTo(container, { opacity: 0 }, { opacity: 1, duration: config.duration * 0.5, ease: config.ease, onComplete: resolve });
      }
    });
  }

  // ───────────────────────────────────────────────────────────
  // PRÉVISUALISATION STUDIO
  // ───────────────────────────────────────────────────────────

  async previewAnimation(element: HTMLElement, params: AnimationParams, blockId: string): Promise<void> {
    const { gsap } = await loadGSAP();

    this.killAnimation(blockId, params.id);
    gsap.killTweensOf(element);
    resetElementVisualState(element);

    const tl = gsap.timeline({ paused: false });

    switch (params.category) {
      case 'entrance':
      case 'scroll':
      case 'exit': {
        const previewParams: AnimationParams = { ...params, trigger: 'onLoad', delay: 0 };
        this.buildEntranceTimeline(tl, element, previewParams, gsap);
        if (params.category === 'exit') {
          tl.eventCallback('onComplete', () => {
            gsap.delayedCall(0.6, () => {
              gsap.to(element, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, skewX: 0, skewY: 0, filter: 'none', duration: 0.3, ease: 'power2.out' });
            });
          });
        }
        tl.play();
        break;
      }
      case 'loop': {
        this.buildLoopAnimation(tl, element, { ...params, delay: 0 }, gsap);
        tl.play();
        break;
      }
      case 'hover': {
        this.buildHoverPreviewTimeline(tl, element, params, gsap);
        tl.play();
        break;
      }
      case 'click': {
        this.buildClickPreviewTimeline(tl, element, params, gsap);
        tl.play();
        break;
      }
      default: break;
    }

    this.storeTimeline(blockId, params.id, tl);
  }

  private buildHoverPreviewTimeline(tl: any, el: HTMLElement, p: AnimationParams, gsap: any) {
    const duration = p.hoverDuration ?? p.duration;
    const ease = p.ease;
    const hold = 0.35;

    switch (p.type as string) {
      case 'hoverScale':   tl.to(el, { scale: p.hoverScale ?? 1.05, duration, ease }).to(el, { scale: 1, duration: duration * 0.8, ease: 'power2.out' }, `+=${hold}`); break;
      case 'hoverSlideUp': tl.to(el, { y: p.hoverY ?? -6, duration, ease }).to(el, { y: 0, duration: duration * 0.8, ease: 'power2.out' }, `+=${hold}`); break;
      case 'hoverRotate':  tl.to(el, { rotation: p.hoverRotation ?? 5, duration, ease }).to(el, { rotation: 0, duration: duration * 0.8, ease: 'power2.out' }, `+=${hold}`); break;
      case 'hoverTilt':    tl.to(el, { rotationX: -8, rotationY: 8, transformPerspective: 600, duration, ease }).to(el, { rotationX: 0, rotationY: 0, duration: duration * 0.8, ease: 'power2.out' }, `+=${hold}`); break;
      case 'hoverPulse':   tl.to(el, { scale: p.hoverScale ?? 1.06, duration, ease: 'power1.inOut', repeat: 3, yoyo: true }); break;
      case 'hoverGlow':    tl.to(el, { boxShadow: '0 0 20px 4px rgba(99,102,241,0.5)', duration, ease }).to(el, { boxShadow: 'none', duration: duration * 0.8, ease: 'power2.out' }, `+=${hold}`); break;
      case 'hoverShake':   tl.fromTo(el, { x: -4 }, { x: 4, duration: 0.08, ease: 'power1.inOut', repeat: 4, yoyo: true }).set(el, { x: 0 }); break;
      default: break;
    }
  }

  private buildClickPreviewTimeline(tl: any, el: HTMLElement, p: AnimationParams, gsap: any) {
    switch (p.type as string) {
      case 'clickBounce': tl.fromTo(el, { scale: 1 }, { scale: 0.9, duration: 0.1, ease: 'power2.in', yoyo: true, repeat: 1 }); break;
      case 'clickPulse':  tl.fromTo(el, { scale: 1 }, { scale: 1.1, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 }); break;
      case 'clickRipple': tl.fromTo(el, { scale: 1 }, { scale: 1.04, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 }); break;
      case 'clickShake':  tl.fromTo(el, { x: 0 }, { x: 6, duration: 0.06, ease: 'power1.inOut', yoyo: true, repeat: 5 }); break;
      default: break;
    }
  }

  async previewPageTransition(container: HTMLElement, config: PageTransitionConfig): Promise<void> {
    await this.transitionOut(container, config);
    await new Promise(resolve => setTimeout(resolve, 180));
    await this.transitionIn(container, config);
  }

  // ───────────────────────────────────────────────────────────
  // NETTOYAGE
  // ───────────────────────────────────────────────────────────

  killAnimation(blockId: string, animId: string) {
    const blockTimelines = this.timelines.get(blockId);
    if (blockTimelines) {
      const tl = blockTimelines.get(animId);
      if (tl) { tl.kill(); blockTimelines.delete(animId); }
    }
    if (scrollTriggerInstance) {
      scrollTriggerInstance.getAll()
        .filter((st: any) => st.vars?.id?.includes(`${blockId}-${animId}`))
        .forEach((st: any) => st.kill());
    }
  }

  killBlockAnimations(blockId: string) {
    const blockTimelines = this.timelines.get(blockId);
    if (blockTimelines) { blockTimelines.forEach(tl => tl.kill()); blockTimelines.clear(); }
    this.timelines.delete(blockId);
    this.states.delete(blockId);

    if (scrollTriggerInstance) {
      scrollTriggerInstance.getAll()
        .filter((st: any) => st.vars?.id?.includes(blockId))
        .forEach((st: any) => st.kill());
    }

    const el = this.elementRegistry.get(blockId);
    if (el) {
      if (gsapInstance) gsapInstance.killTweensOf(el);
      resetElementVisualState(el);
    }
  }

  killAll() {
    this.timelines.forEach(blockMap => { blockMap.forEach(tl => tl.kill()); });
    this.timelines.clear();
    this.states.clear();
    if (scrollTriggerInstance) scrollTriggerInstance.killAll();
    if (gsapInstance) gsapInstance.globalTimeline.clear();
  }

  cleanupElementListeners(element: HTMLElement) {
    if ((element as any).__gsapHoverCleanup) {
      (element as any).__gsapHoverCleanup();
      delete (element as any).__gsapHoverCleanup;
    }
    if ((element as any).__gsapClickCleanup) {
      (element as any).__gsapClickCleanup();
      delete (element as any).__gsapClickCleanup;
    }
  }

  // ───────────────────────────────────────────────────────────
  // GESTION D'ÉTAT
  // ───────────────────────────────────────────────────────────

  private storeTimeline(blockId: string, animId: string, tl: any) {
    if (!this.timelines.has(blockId)) this.timelines.set(blockId, new Map());
    this.timelines.get(blockId)!.set(animId, tl);
  }

  private updateState(blockId: string, animId: string, patch: Partial<Omit<AnimationState, 'blockId' | 'animationId'>>) {
    if (!this.states.has(blockId)) this.states.set(blockId, new Map());
    const current = this.states.get(blockId)!.get(animId) ?? { blockId, animationId: animId, status: 'idle', progress: 0 };
    this.states.get(blockId)!.set(animId, { ...current, ...patch });
    this.notifyListeners();
  }

  getState(blockId: string, animId: string): AnimationState | undefined {
    return this.states.get(blockId)?.get(animId);
  }

  subscribe(listener: (states: Map<string, Map<string, AnimationState>>) => void) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.states));
  }

  async refresh() {
    if (scrollTriggerInstance) scrollTriggerInstance.refresh();
  }
}

// ─────────────────────────────────────────────────────────────
// SINGLETON
// ─────────────────────────────────────────────────────────────

export const animationEngine = new AnimationEngine();

// ─────────────────────────────────────────────────────────────
// HELPER : SET INITIAL STATE
// ─────────────────────────────────────────────────────────────

export function setInitialState(element: HTMLElement, params: AnimationParams) {
  if (!element) return;
  const style = element.style;
  if (params.fromOpacity !== undefined) style.opacity = String(params.fromOpacity);
  if (params.fromBlur !== undefined)    style.filter  = `blur(${params.fromBlur}px)`;
}