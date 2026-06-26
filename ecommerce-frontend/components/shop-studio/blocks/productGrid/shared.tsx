'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ProductCustomization, ProductGridSlot } from '@/types/studio';

/* ──────────────────────────────────────────────────────────────────────────
 * Logique de présentation des slots produits, partagée entre :
 *  - GridProductsBlock.tsx (Studio, édition)
 *  - ShopProductGrid.tsx   (Boutique, lecture seule)
 * Objectif : rendu visuel pixel-identique entre les deux, puisqu'ils
 * appellent exactement les mêmes fonctions.
 * ────────────────────────────────────────────────────────────────────────── */

export const animationStyles = `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
@keyframes badgePulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes badgeBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

.animate-fadeIn { animation: fadeIn var(--duration, 0.5s) var(--easing, ease) forwards; }
.animate-slideUp { animation: slideUp var(--duration, 0.5s) var(--easing, ease-out) forwards; }
.animate-slideDown { animation: slideDown var(--duration, 0.5s) var(--easing, ease-out) forwards; }
.animate-slideLeft { animation: slideLeft var(--duration, 0.5s) var(--easing, ease-out) forwards; }
.animate-slideRight { animation: slideRight var(--duration, 0.5s) var(--easing, ease-out) forwards; }
.animate-zoomIn { animation: zoomIn var(--duration, 0.4s) var(--easing, ease-out) forwards; }
.animate-bounce { animation: bounce var(--duration, 0.8s) var(--easing, cubic-bezier(0.68, -0.55, 0.265, 1.55)) forwards; }

.hover-zoom { transition: transform 0.3s ease; display: block; }
.hover-zoom:hover { transform: scale(var(--hover-scale, 1.05)); }
.hover-glow-wrapper { transition: box-shadow 0.3s ease; display: block; }
.hover-glow-wrapper:hover { box-shadow: 0 0 var(--glow-intensity, 20px) var(--glow-color, #3B82F6); }
.hover-slide-up { transition: transform 0.3s ease; display: block; }
.hover-slide-up:hover { transform: translateY(calc(-1 * var(--slide-distance, 10px))); }
.hover-slide-down { transition: transform 0.3s ease; display: block; }
.hover-slide-down:hover { transform: translateY(var(--slide-distance, 10px)); }
.hover-slide-left { transition: transform 0.3s ease; display: block; }
.hover-slide-left:hover { transform: translateX(calc(-1 * var(--slide-distance, 10px))); }
.hover-slide-right { transition: transform 0.3s ease; display: block; }
.hover-slide-right:hover { transform: translateX(var(--slide-distance, 10px)); }
.hover-rotate { transition: transform 0.3s ease; display: block; }
.hover-rotate:hover { transform: rotate(var(--rotate-deg, 5deg)); }

.carousel-container { pointer-events: auto; }
.frame-polaroid { padding: 12px 12px 32px 12px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.frame-polaroid img { margin-bottom: 8px; }
.bg-3d-paper { background: repeating-linear-gradient(45deg, #f5f5f5 0px, #f5f5f5 2px, #e8e8e8 2px, #e8e8e8 8px); }
.bg-3d-metal { background: linear-gradient(135deg, #e0e0e0 0%, #b0b0b0 50%, #e0e0e0 100%); }
.bg-3d-glass { background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%); backdrop-filter: blur(10px); }
.bg-3d-wood { background: repeating-linear-gradient(90deg, #8B6914 0px, #8B6914 2px, #A0782C 2px, #A0782C 6px); }
.badge-pulse { animation: badgePulse 1s ease-in-out infinite; }
.badge-bounce { animation: badgeBounce 0.8s ease-in-out infinite; }

@keyframes interactiveSlotIn {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.92); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
`;

/** Injecte la feuille de style partagée (une fois par page, Studio ou Boutique). */
export function useInjectGridStyles(elementId: string = 'grid-products-styles') {
  useEffect(() => {
    let el = document.getElementById(elementId) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = elementId;
      document.head.appendChild(el);
    }
    el.textContent = animationStyles;
  }, [elementId]);
}

export const DEFAULT_CUSTOMIZATION: ProductCustomization = {
  backgroundType: 'solid',
  backgroundColor: '#FFFFFF',
  backgroundOpacity: 100,
  backgroundBlur: 0,
  frameColor: '#E5E7EB',
  frameWidth: 2,
  frameShadow: true,
  frameShadowColor: 'rgba(0,0,0,0.12)',
  hoverEffect: 'zoom',
  hoverScale: 1.05,
  hoverGlowColor: '#3B82F6',
  hoverGlowIntensity: 20,
  hoverSlideDirection: 'up',
  hoverSlideDistance: 10,
  hoverRotate: 5,
  isFeatured: false,
  featuredOrder: 0,
  entranceAnimation: 'fade',
  animationDuration: 500,
  animationDelay: 0,
  animationEasing: 'ease',
};

export const FRAME_STYLE_CONFIG = {
  square:     { aspectRatio: '1/1',  borderRadius: '8px',  icon: '⬛', name: 'Carré',      background: 'transparent' },
  horizontal: { aspectRatio: '4/3',  borderRadius: '8px',  icon: '📐', name: 'Horizontal', background: 'transparent' },
  vertical:   { aspectRatio: '3/4',  borderRadius: '8px',  icon: '📏', name: 'Vertical',   background: 'transparent' },
  circle:     { aspectRatio: '1/1',  borderRadius: '50%',  icon: '⚪', name: 'Cercle',     background: 'transparent' },
  rounded:    { aspectRatio: '1/1',  borderRadius: '24px', icon: '🟩', name: 'Arrondi',    background: 'transparent' },
} as const;

export const getModeIcon = (mode: 'traditional' | 'interactive') => (mode === 'traditional' ? '📦' : '✨');

export const getSlideCustomization = (
  base: ProductCustomization | null,
  slideIndex: number
): ProductCustomization | null => {
  if (!base) return null;
  const override = base.slidesConfig?.[slideIndex];
  if (!override || Object.keys(override).length === 0) return base;
  return { ...base, ...override };
};

export const getHoverEffectClass = (customization: ProductCustomization | null): string => {
  if (!customization) return '';
  switch (customization.hoverEffect) {
    case 'zoom':   return 'hover-zoom';
    case 'glow':   return 'hover-glow-wrapper';
    case 'slide':  return `hover-slide-${customization.hoverSlideDirection || 'up'}`;
    case 'rotate': return 'hover-rotate';
    default:       return '';
  }
};

export const getCustomFrameStylesUtil = (c: ProductCustomization | null): React.CSSProperties => {
  if (!c) return {};
  const s: React.CSSProperties = {};
  if (c.frameColor && c.frameWidth) s.border = `${c.frameWidth}px solid ${c.frameColor}`;
  if (c.frameShadow && c.frameShadowColor) s.boxShadow = `0 4px 12px ${c.frameShadowColor}`;
  return s;
};

export const getImageStylesUtil = (c: ProductCustomization | null): React.CSSProperties => {
  if (!c) return { backgroundColor: 'transparent' };
  return {
    backgroundColor: 'transparent',
    opacity: c.backgroundOpacity ? c.backgroundOpacity / 100 : 1,
    filter: c.backgroundBlur ? `blur(${c.backgroundBlur}px)` : 'none',
  };
};

export const getHoverEffectVarsUtil = (c: ProductCustomization | null): React.CSSProperties => {
  if (!c) return {};
  const s: any = {};
  if (c.hoverEffect === 'zoom')   s['--hover-scale']    = c.hoverScale || 1.05;
  if (c.hoverEffect === 'glow')   { s['--glow-color'] = c.hoverGlowColor || '#3B82F6'; s['--glow-intensity'] = `${c.hoverGlowIntensity || 20}px`; }
  if (c.hoverEffect === 'slide')  s['--slide-distance'] = `${c.hoverSlideDistance || 10}px`;
  if (c.hoverEffect === 'rotate') s['--rotate-deg']     = `${c.hoverRotate || 5}deg`;
  return s;
};

export const getEntranceAnimationClassUtil = (c: ProductCustomization | null): string => {
  if (!c || !c.entranceAnimation || c.entranceAnimation === 'none') return '';
  return `animate-${c.entranceAnimation}`;
};

export const getEntranceAnimationStyleUtil = (c: ProductCustomization | null): React.CSSProperties => {
  if (!c) return {};
  const s: any = { animationDelay: `${c.animationDelay || 0}ms` };
  s['--duration'] = `${c.animationDuration || 500}ms`;
  s['--easing']   = c.animationEasing || 'ease';
  return s;
};

export const renderCustomBadgeUtil = (c: ProductCustomization, frameConfig: any) => {
  const getPositionStyle = (position: string): React.CSSProperties => {
    const isCircle = frameConfig.borderRadius === '50%';
    const isRounded = frameConfig.borderRadius === '24px';
    const offset = isCircle ? '12%' : isRounded ? '6px' : '4px';
    switch (position) {
      case 'top-left':     return { top: offset, left: offset };
      case 'bottom-left':  return { bottom: offset, left: offset };
      case 'bottom-right': return { bottom: offset, right: offset };
      default:             return { top: offset, right: offset };
    }
  };
  const badgeBorderRadius = frameConfig.borderRadius === '50%' ? '999px' : undefined;
  if (c.isFeatured && c.featuredBadge) {
    const pos = getPositionStyle('top-right');
    return (
      <div className="absolute z-10 px-2 py-1 text-xs font-medium" style={{ ...pos, backgroundColor: c.featuredBadgeColor || '#F59E0B', color: '#FFFFFF', borderRadius: badgeBorderRadius || c.badge?.borderRadius || 4, fontSize: c.badge?.fontSize || 12 }}>
        {c.featuredBadge}
      </div>
    );
  }
  if (c.badge) {
    const anim = c.badge.animation === 'pulse' ? 'badge-pulse' : c.badge.animation === 'bounce' ? 'badge-bounce' : '';
    const pos  = getPositionStyle(c.badge.position || 'top-right');
    return (
      <div className={`absolute z-10 px-2 py-1 text-xs font-medium ${anim}`} style={{ ...pos, backgroundColor: c.badge.backgroundColor, color: c.badge.textColor, borderRadius: badgeBorderRadius || c.badge.borderRadius || 4, fontSize: c.badge.fontSize || 12 }}>
        {c.badge.text}
      </div>
    );
  }
  return null;
};

export const getBackgroundStylesOnly = (custom: ProductCustomization | null): React.CSSProperties => {
  if (!custom) return {};
  const s: React.CSSProperties = {};
  const bgType = custom.backgroundType || 'solid';
  switch (bgType) {
    case 'gradient':
      if (custom.backgroundGradient) s.background = custom.backgroundGradient;
      else if (custom.backgroundColor) s.backgroundColor = custom.backgroundColor;
      break;
    case 'image':
      if (custom.backgroundImage) {
        s.backgroundImage = `url(${custom.backgroundImage})`;
        s.backgroundSize = 'cover';
        s.backgroundPosition = 'center';
        s.backgroundRepeat = 'no-repeat';
      } else if (custom.backgroundColor) {
        s.backgroundColor = custom.backgroundColor;
      }
      break;
    case '3d':
      if (custom.backgroundValue === 'paper') s.background = 'repeating-linear-gradient(45deg, #f5f5f5 0px, #f5f5f5 2px, #e8e8e8 2px, #e8e8e8 8px)';
      else if (custom.backgroundValue === 'metal') s.background = 'linear-gradient(135deg, #e0e0e0 0%, #b0b0b0 50%, #e0e0e0 100%)';
      else if (custom.backgroundValue === 'glass') { s.background = 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'; s.backdropFilter = 'blur(10px)'; }
      else if (custom.backgroundValue === 'wood') s.background = 'repeating-linear-gradient(90deg, #8B6914 0px, #8B6914 2px, #A0782C 2px, #A0782C 6px)';
      else s.backgroundColor = '#e5e7eb';
      break;
    case 'transparent':
      s.backgroundColor = 'transparent';
      break;
    default:
      if (custom.backgroundColor) s.backgroundColor = custom.backgroundColor;
      break;
  }
  return s;
};

export const getImageCropStyle = (slot: ProductGridSlot, imageIndex?: number): React.CSSProperties => {
  const imageCrops = (slot.customConfig as any)?.imageCrops;
  const legacyCrop = (slot.customConfig as any)?.imageCrop;
  const key = imageIndex ?? slot.imageIndex ?? 0;
  const crop = imageCrops?.[key] || legacyCrop || null;
  if (!crop) return { objectFit: 'cover', objectPosition: 'center center' };
  return {
    objectFit: (crop.fit || 'cover') as any,
    objectPosition: `${crop.posX ?? 50}% ${crop.posY ?? 50}%`,
    transform: crop.zoom && crop.zoom !== 100 ? `scale(${crop.zoom / 100})` : 'none',
    transformOrigin: `${crop.posX ?? 50}% ${crop.posY ?? 50}%`,
  };
};

/** Géométrie d'un slot (taille de cellule + style boîte), identique Studio/Boutique. */
export function computeSlotGeometry(
  containerWidth: number,
  columns: number,
  gap: number,
  gridPadding: number,
  frameConfig: { aspectRatio: string },
  rowSpan: number,
  colSpan: number
) {
  const cellWidth = containerWidth > 0 ? (containerWidth - gridPadding * 2 - gap * (columns - 1)) / columns : 200;
  const [ar1, ar2] = frameConfig.aspectRatio.split('/').map(Number);
  const cellHeight = cellWidth * (ar2 / ar1);
  const slotHeight = cellHeight * rowSpan + gap * (rowSpan - 1);
  const slotBoxStyle: React.CSSProperties =
    rowSpan > 1 || colSpan > 1
      ? { height: `${slotHeight}px` }
      : { aspectRatio: frameConfig.aspectRatio, height: 'auto' };
  return { cellWidth, cellHeight, slotHeight, slotBoxStyle, ar1, ar2 };
}

declare global {
  interface Window {
    __carouselStates?: Record<string, { currentIndex: number; isTransitioning: boolean; lastUpdate: number }>;
  }
}

/**
 * Carrousel d'images d'un slot produit.
 * `namespace` isole l'état transitoire du Studio de celui de la Boutique
 * (deux contextes de rendu totalement indépendants côté navigateur).
 */
export const ProductCarousel = ({
  images, productName, frameConfig, onImageChange, carouselConfig: config, autoPlay = true,
  imageCrops, slideCustomizations, slotId, namespace = 'studio',
}: {
  images: string[]; productName: string; frameConfig: any; onImageChange?: (index: number) => void;
  carouselConfig?: ProductGridSlot['carouselConfig']; autoPlay?: boolean;
  imageCrops?: Record<number, React.CSSProperties>;
  slideCustomizations?: Record<number, ProductCustomization | null>;
  slotId: string;
  namespace?: string;
}) => {
  const stateKey = `${namespace}:${slotId}`;

  const getSavedIndex = useCallback(() => {
    if (typeof window !== 'undefined' && window.__carouselStates?.[stateKey]) {
      return window.__carouselStates[stateKey].currentIndex;
    }
    return config?.currentImageIndex || 0;
  }, [stateKey, config?.currentImageIndex]);

  const [currentIndex, setCurrentIndex] = useState(() => getSavedIndex());
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const validImages = images.filter(Boolean);
  const imageCount = validImages.length;
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.__carouselStates) window.__carouselStates = {};
      window.__carouselStates[stateKey] = { currentIndex, isTransitioning, lastUpdate: Date.now() };
      if (!isInitialMount.current && onImageChange) onImageChange(currentIndex);
    }
  }, [currentIndex, isTransitioning, stateKey, onImageChange]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const saved = getSavedIndex();
      if (saved !== currentIndex) {
        setCurrentIndex(saved);
        if (onImageChange) onImageChange(saved);
      }
    }
  }, [getSavedIndex, currentIndex, onImageChange]);

  const nextImage = useCallback(() => {
    if (isTransitioning || imageCount <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev + 1) % imageCount);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [imageCount, isTransitioning]);

  const prevImage = useCallback(() => {
    if (isTransitioning || imageCount <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev - 1 + imageCount) % imageCount);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [imageCount, isTransitioning]);

  useEffect(() => {
    if (!autoPlay || !config?.enabled || imageCount <= 1) return;
    if (config.stopOnHover && isHovered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextImage, config.interval || 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [config?.enabled, config?.interval, config?.stopOnHover, isHovered, imageCount, nextImage, autoPlay]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  if (imageCount === 0) return null;
  const isFade = config?.animation === 'fade';

  const getImageStyle = (idx: number): React.CSSProperties => {
    const sc = slideCustomizations?.[idx];
    return {
      backgroundColor: 'transparent',
      opacity: sc?.backgroundOpacity != null ? sc.backgroundOpacity / 100 : 1,
      filter: sc?.backgroundBlur ? `blur(${sc.backgroundBlur}px)` : 'none',
      ...(imageCrops?.[idx] || {}),
    };
  };

  const getCurrentSlideBackgroundStyle = (): React.CSSProperties => {
    const sc = slideCustomizations?.[currentIndex];
    return sc ? getBackgroundStylesOnly(sc) : {};
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden carousel-container"
      style={{ borderRadius: frameConfig.borderRadius, transition: 'background 0.3s ease', ...getCurrentSlideBackgroundStyle() }}
      onMouseEnter={() => config?.stopOnHover && setIsHovered(true)}
      onMouseLeave={() => config?.stopOnHover && setIsHovered(false)}
    >
      {isFade && (
        <div className="relative w-full h-full">
          {validImages.map((img, idx) => (
            <div key={idx} className="absolute inset-0 transition-opacity duration-500 ease-in-out" style={{ opacity: idx === currentIndex ? 1 : 0 }}>
              <Image src={img} alt={`${productName} - ${idx + 1}`} fill className="object-cover" unoptimized style={getImageStyle(idx)} />
            </div>
          ))}
        </div>
      )}
      {!isFade && (
        <div className="relative w-full h-full overflow-hidden">
          <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)`, width: `${imageCount * 100}%` }}>
            {validImages.map((img, idx) => (
              <div key={idx} className="relative h-full flex-shrink-0" style={{ width: `${100 / imageCount}%` }}>
                <Image src={img} alt={`${productName} - ${idx + 1}`} fill className="object-cover" unoptimized style={getImageStyle(idx)} />
              </div>
            ))}
          </div>
        </div>
      )}
      {config?.showDots && imageCount > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          {validImages.map((_, idx) => (
            <button key={idx}
              onClick={() => { if (isTransitioning) return; setIsTransitioning(true); setCurrentIndex(idx); onImageChange?.(idx); setTimeout(() => setIsTransitioning(false), 500); }}
              className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      )}
      {config?.showArrows && imageCount > 1 && (
        <>
          <button onClick={prevImage} disabled={isTransitioning} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity z-10 hover:bg-black/70 disabled:opacity-30">◀</button>
          <button onClick={nextImage} disabled={isTransitioning} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity z-10 hover:bg-black/70 disabled:opacity-30">▶</button>
        </>
      )}
      {config?.enabled && imageCount > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm z-10">
          🎠 {currentIndex + 1}/{imageCount}
        </div>
      )}
      {isTransitioning && <div className="absolute inset-0 bg-black/10 pointer-events-none z-5" />}
    </div>
  );
};