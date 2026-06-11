'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { FiPlus, FiTrash2, FiEdit2, FiGrid, FiX, FiImage, FiStar, FiAward, FiZap, FiDroplet, FiLayers, FiClock, FiEye } from 'react-icons/fi';
import { ProductGridConfig, StudioProduct, ProductGridSlot, ProductCustomization } from '@/types/studio';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number;
  isResizing?: boolean;
  onOpenAssetPicker?: (callback: (url: string) => void) => void;
  gridConfig?: ProductGridConfig;
  onUpdateGridConfig?: (config: ProductGridConfig) => void;
  productsList?: StudioProduct[];
  onLinkProduct?: (slotId: string, product: StudioProduct) => void;
  onUpdateProductCustomization?: (productId: number, customization: Partial<ProductCustomization>) => void;
  onOpenCustomization?: (productId: number, productName: string, customization: ProductCustomization) => void;
  globalProductCustomizations?: Map<number, ProductCustomization>;
  onUpdateGlobalProductCustomization?: (productId: number, updates: Partial<ProductCustomization>) => void;
  onUpdateSlotConfig?: (slotId: string, config: Partial<ProductGridSlot>) => void;
}

const animationStyles = `
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

const DEFAULT_CUSTOMIZATION: ProductCustomization = {
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

const FRAME_STYLE_CONFIG = {
  square:     { aspectRatio: '1/1',  borderRadius: '8px',  icon: '⬛', name: 'Carré',      background: 'transparent' },
  horizontal: { aspectRatio: '4/3',  borderRadius: '8px',  icon: '📐', name: 'Horizontal', background: 'transparent' },
  vertical:   { aspectRatio: '3/4',  borderRadius: '8px',  icon: '📏', name: 'Vertical',   background: 'transparent' },
  circle:     { aspectRatio: '1/1',  borderRadius: '50%',  icon: '⚪', name: 'Cercle',     background: 'transparent' },
  rounded:    { aspectRatio: '1/1',  borderRadius: '24px', icon: '🟩', name: 'Arrondi',    background: 'transparent' },
};

const getModeIcon = (mode: 'traditional' | 'interactive') => mode === 'traditional' ? '📦' : '✨';

const DEFAULT_DIMENSION = { width: 800, height: 400, widthUnit: 'px' as const, heightUnit: 'px' as const };
const DEFAULT_UNIFORM_SIZE = { enabled: false, width: 200, height: 200 };

const getHoverEffectClass = (customization: ProductCustomization | null): string => {
  if (!customization) return '';
  switch (customization.hoverEffect) {
    case 'zoom':   return 'hover-zoom';
    case 'glow':   return 'hover-glow-wrapper';
    case 'slide':  return `hover-slide-${customization.hoverSlideDirection || 'up'}`;
    case 'rotate': return 'hover-rotate';
    default:       return '';
  }
};

const getCustomFrameStylesUtil = (c: ProductCustomization | null): React.CSSProperties => {
  if (!c) return {};
  const s: React.CSSProperties = {};
  if (c.frameColor && c.frameWidth) s.border = `${c.frameWidth}px solid ${c.frameColor}`;
  if (c.frameShadow && c.frameShadowColor) s.boxShadow = `0 4px 12px ${c.frameShadowColor}`;
  if (c.backgroundType === 'gradient' && c.backgroundGradient) s.background = c.backgroundGradient;
  else if (c.backgroundType === 'image' && c.backgroundImage) { s.backgroundImage = `url(${c.backgroundImage})`; s.backgroundSize = 'cover'; s.backgroundPosition = 'center'; }
  else if (c.backgroundType === 'transparent') s.backgroundColor = 'transparent';
  else if (c.backgroundColor) s.backgroundColor = c.backgroundColor;
  return s;
};

const getImageStylesUtil = (c: ProductCustomization | null): React.CSSProperties => {
  if (!c) return { backgroundColor: 'transparent' };
  return { backgroundColor: 'transparent', opacity: c.backgroundOpacity ? c.backgroundOpacity / 100 : 1, filter: c.backgroundBlur ? `blur(${c.backgroundBlur}px)` : 'none' };
};

const getHoverEffectVarsUtil = (c: ProductCustomization | null): React.CSSProperties => {
  if (!c) return {};
  const s: any = {};
  if (c.hoverEffect === 'zoom')   s['--hover-scale']    = c.hoverScale || 1.05;
  if (c.hoverEffect === 'glow')   { s['--glow-color'] = c.hoverGlowColor || '#3B82F6'; s['--glow-intensity'] = `${c.hoverGlowIntensity || 20}px`; }
  if (c.hoverEffect === 'slide')  s['--slide-distance'] = `${c.hoverSlideDistance || 10}px`;
  if (c.hoverEffect === 'rotate') s['--rotate-deg']     = `${c.hoverRotate || 5}deg`;
  return s;
};

const getEntranceAnimationClassUtil = (c: ProductCustomization | null): string => {
  if (!c || !c.entranceAnimation || c.entranceAnimation === 'none') return '';
  return `animate-${c.entranceAnimation}`;
};

const getEntranceAnimationStyleUtil = (c: ProductCustomization | null): React.CSSProperties => {
  if (!c) return {};
  const s: any = { animationDelay: `${c.animationDelay || 0}ms` };
  s['--duration'] = `${c.animationDuration || 500}ms`;
  s['--easing']   = c.animationEasing || 'ease';
  return s;
};

const renderCustomBadgeUtil = (c: ProductCustomization, frameConfig: any) => {
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

// ⭐ ProductCarousel modifié pour accepter imageCrops (un objet par index d'image)
const ProductCarousel = ({
  images, productName, frameConfig, onImageChange, carouselConfig: config, autoPlay = true,
  imageCrops,
}: {
  images: string[]; productName: string; frameConfig: any; onImageChange?: (index: number) => void;
  carouselConfig?: ProductGridSlot['carouselConfig']; autoPlay?: boolean;
  imageCrops?: Record<number, React.CSSProperties>;
}) => {
  const [currentIndex, setCurrentIndex] = useState(config?.currentImageIndex || 0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const validImages = images.filter(Boolean);
  const imageCount = validImages.length;

  const nextImage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => { const next = (prev + 1) % imageCount; onImageChange?.(next); return next; });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [imageCount, onImageChange, isTransitioning]);

  const prevImage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => { const next = (prev - 1 + imageCount) % imageCount; onImageChange?.(next); return next; });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [imageCount, onImageChange, isTransitioning]);

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

  const getImageStyle = (idx: number) => ({
    backgroundColor: 'transparent',
    ...(imageCrops?.[idx] || {}),
  });

  return (
    <div className="relative w-full h-full overflow-hidden carousel-container" style={{ borderRadius: frameConfig.borderRadius }}
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

// ⭐ Fonction pour obtenir le style de recadrage pour une image spécifique
const getImageCropStyle = (slot: ProductGridSlot, imageIndex?: number): React.CSSProperties => {
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

const SlotContent = ({
  slot, containerWidth, columns, gap, gridPadding, isSelected, onSelect, onOpenCustomization,
  onUpdateSlotConfig, onLinkProduct, onOpenAssetPicker, props, productCustomizations, allProducts,
  loadingProducts, setEditingSlot, setShowSlotEditor, setCustomTitle, setCustomImageUrl,
  setActiveTab, clearSlot, getProductCustomization, getSlotProduct, getDisplayImageForSlot, getAllProductImages
}: any) => {
  // ⭐ 1. TOUS LES HOOKS SONT DÉCLARÉS AU DÉBUT (avant tout return conditionnel)
  const [localOverlay, setLocalOverlay] = useState(false);
  
  // ⭐ 2. TOUTES LES VARIABLES DÉRIVÉES
  const product = getSlotProduct(slot);
  const cc = slot.customConfig as any;
  const hasCustom = cc?.customTitle || cc?.customImage;
  const isEmpty = !product && !hasCustom;
  const productCustom = product ? getProductCustomization(product.id) : null;

  const frameStyle = slot.frameStyle || 'square';
  const frameConfig = FRAME_STYLE_CONFIG[frameStyle as keyof typeof FRAME_STYLE_CONFIG] || FRAME_STYLE_CONFIG.square;

  const displayName = cc?.customTitle || product?.name || 'Sans titre';
  const displayPrice = product?.price;
  const displayImage = getDisplayImageForSlot(slot);
  const allImages = getAllProductImages(product);
  const carCfg = slot.carouselConfig;
  const isCarousel = carCfg?.enabled && allImages.length > 1;

  // Récupération des personnalisations amont
  const frameStyles = getCustomFrameStylesUtil(productCustom);
  const imgStyles = getImageStylesUtil(productCustom);
  const hoverClass = getHoverEffectClass(productCustom);
  const hoverVars = getHoverEffectVarsUtil(productCustom);
  const entranceClass = getEntranceAnimationClassUtil(productCustom);
  const entranceStyle = getEntranceAnimationStyleUtil(productCustom);

  const rowSpan = slot.gridPosition.rowSpan || 1;
  const cellWidth = containerWidth > 0 ? (containerWidth - gridPadding * 2 - gap * (columns - 1)) / columns : 200;
  const [ar1, ar2] = frameConfig.aspectRatio.split('/').map(Number);
  const cellHeight = cellWidth * (ar2 / ar1);
  const slotHeight = cellHeight * rowSpan + gap * (rowSpan - 1);
  
  // ⭐ Construction du map des styles de crop — mémoïsé pour éviter les re-renders du carrousel
  const imageCropsMap = useMemo((): Record<number, React.CSSProperties> => {
    const map: Record<number, React.CSSProperties> = {};
    for (let idx = 0; idx < allImages.length; idx++) {
      map[idx] = getImageCropStyle(slot, idx);
    }
    return map;
  }, [
    allImages.length,
    JSON.stringify((slot.customConfig as any)?.imageCrops),
  ]);

  // ⭐ 3. COMPOSANTS INTERNES (pas des hooks, donc OK après la logique conditionnelle)
  const ActionButtons = ({ showCustomize = true }: { showCustomize?: boolean }) => (
    <div className="absolute top-2 right-2 flex gap-1 z-50" style={{ pointerEvents: 'auto' }}>
      {showCustomize && product && (
        <button onClick={(e) => { e.stopPropagation(); onOpenCustomization?.(product.id, product.name, getProductCustomization(product.id)); }} className="p-1.5 bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition-colors" title="Personnaliser">
          <FiZap size={14} />
        </button>
      )}
      <button onClick={(e) => { e.stopPropagation(); setEditingSlot(slot.id); if (cc?.customTitle) setCustomTitle(cc.customTitle); if (cc?.customImage) setCustomImageUrl(cc.customImage); setActiveTab(product ? 'product' : 'custom'); setShowSlotEditor(true); }} className="p-1.5 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors">
        <FiEdit2 size={14} />
      </button>
      {(product || cc?.customTitle) && (
        <button onClick={(e) => { e.stopPropagation(); clearSlot(slot.id); }} className="p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors">
          <FiTrash2 size={14} />
        </button>
      )}
    </div>
  );

  const OuterWrapper = ({ children, showActions = false }: { children: React.ReactNode; showActions?: boolean }) => (
    <div className={`relative w-full ${hoverClass}`} style={{ borderRadius: frameConfig.borderRadius, ...hoverVars }}>
      <div className="relative overflow-hidden transition-all duration-300" style={{ position: 'relative', borderRadius: frameConfig.borderRadius, backgroundColor: 'transparent', width: '100%', height: `${slotHeight}px`, ...frameStyles }}>
        {children}
      </div>
      {showActions && <div className="absolute inset-0" style={{ borderRadius: frameConfig.borderRadius }} />}
    </div>
  );

  // ⭐ 4. RETOURS CONDITIONNELS (maintenant sûrs car tous les hooks sont déjà appelés)
  if (isEmpty) {
    return (
      <div className="relative cursor-pointer group transition-all hover:scale-[1.02] duration-200 w-full"
        style={{ height: `${slotHeight}px`, borderRadius: frameConfig.borderRadius, backgroundColor: 'transparent', border: '2px dashed rgba(156,163,175,0.5)' }}
        onClick={() => { setEditingSlot(slot.id); setShowSlotEditor(true); }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20" style={{ borderRadius: frameConfig.borderRadius }}>
          <div className="text-center"><div className="text-4xl mb-2">{frameConfig.icon}</div><div className="text-xs text-gray-500">{frameConfig.name}</div></div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm mx-2">
            <FiPlus size={20} className="text-primary mb-1" />
            <span className="text-xs text-gray-700 font-medium">Ajouter</span>
          </div>
        </div>
        {isSelected && (
          <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('selectSlotForConfig', { detail: { slotId: slot.id } })); }} className="absolute top-1 right-1 p-1 bg-gray-800/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <FiEdit2 size={10} />
          </button>
        )}
      </div>
    );
  }

  // ⭐ MODE INTERACTIF - maintenant safe car localOverlay est déclaré en haut
  if (slot.displayMode === 'interactive') {
    const triggerType = cc?.interactiveConfig?.triggerType || 'click';

    const handleToggle = () => {
      if (triggerType === 'click') {
        onSelect?.();
        setLocalOverlay(true);
      }
    };

    return (
      <>
        {/* Slot réduit (état normal) */}
        <div
          className={`relative cursor-pointer w-full group ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''} ${hoverClass}`}
          style={{ height: `${slotHeight}px`, overflow: 'visible', ...hoverVars }}
          onClick={handleToggle}
          onMouseEnter={() => triggerType === 'hover' && setLocalOverlay(true)}
          onMouseLeave={() => triggerType === 'hover' && setLocalOverlay(false)}
        >
          <div 
            className="relative w-full h-full overflow-hidden transition-all duration-300" 
            style={{ borderRadius: frameConfig.borderRadius, ...frameStyles }}
          >
            {isCarousel && product ? (
              <ProductCarousel
                images={allImages}
                productName={displayName}
                frameConfig={frameConfig}
                carouselConfig={carCfg}
                autoPlay={false}
                onImageChange={(i) => onUpdateSlotConfig?.(slot.id, { carouselConfig: { ...carCfg, currentImageIndex: i } })}
                imageCrops={imageCropsMap}
              />
            ) : displayImage ? (
              <div style={imgStyles} className="w-full h-full relative">
                <Image
                  src={displayImage}
                  alt={displayName}
                  fill
                  className="object-cover"
                  unoptimized
                  style={{ backgroundColor: 'transparent', ...imageCropsMap[slot.imageIndex ?? 0] }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50">
                <div className="text-3xl mb-1">{frameConfig.icon}</div>
                <span className="text-xs text-gray-500">Aperçu</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <FiEye size={18} className="text-gray-700" />
              </div>
            </div>

            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm flex gap-1 z-10">
              <span>✨</span><span>{frameConfig.icon}</span>
              {isCarousel && <span>🎠</span>}
              {product && <span>✓</span>}
            </div>

            {productCustom && renderCustomBadgeUtil(productCustom, frameConfig)}
          </div>

          {isSelected && <ActionButtons />}
        </div>

        {/* Popup overlay agrandi avec intégration des personnalisations */}
        {localOverlay && (
          <>
            {/* Fond flouté */}
            <div
              className="fixed inset-0 z-[999]"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: `blur(${cc?.interactiveConfig?.overlayBlur ?? 4}px)` }}
              onClick={() => setLocalOverlay(false)}
            />

            {/* Popup centrée avec les styles personnalisés */}
            <div
              className={`fixed z-[1000] ${entranceClass}`}
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${Math.min(cellWidth * 1.8, 480)}px`,
                height: `${Math.min(cellWidth * 1.8, 480) * (ar2 / ar1)}px`,
                borderRadius: frameConfig.borderRadius === '50%' ? '16px' : frameConfig.borderRadius,
                overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                animation: entranceClass ? undefined : 'interactiveSlotIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                ...frameStyles,
                ...entranceStyle,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image pleine largeur avec styles personnalisés */}
              <div
                className="relative w-full"
                style={{
                  height: `${Math.min(cellWidth * 1.8, 480) * (ar2 / ar1)}px`,
                  borderRadius: frameConfig.borderRadius === '50%' ? '16px 16px 0 0' : `${frameConfig.borderRadius} ${frameConfig.borderRadius} 0 0`,
                  overflow: 'hidden',
                }}
              >
                {isCarousel && product ? (
                  <ProductCarousel
                    images={allImages}
                    productName={displayName}
                    frameConfig={{
                      ...frameConfig,
                      borderRadius: frameConfig.borderRadius === '50%' ? '16px 16px 0 0' : `${frameConfig.borderRadius} ${frameConfig.borderRadius} 0 0`,
                    }}
                    carouselConfig={{ ...carCfg, showArrows: true, showDots: true }}
                    autoPlay={true}
                    onImageChange={(i) => onUpdateSlotConfig?.(slot.id, { carouselConfig: { ...carCfg, currentImageIndex: i } })}
                    imageCrops={imageCropsMap}
                  />
                ) : displayImage ? (
                  <div style={imgStyles} className="w-full h-full relative">
                    <Image
                      src={displayImage}
                      alt={displayName}
                      fill
                      className="object-cover"
                      unoptimized
                      style={{ ...imageCropsMap[slot.imageIndex ?? 0] }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                    <div className="text-5xl mb-2">{frameConfig.icon}</div>
                    <span className="text-sm text-gray-400">Aucune image</span>
                  </div>
                )}

                {productCustom && renderCustomBadgeUtil(productCustom, frameConfig)}
              </div>

              {/* Bouton fermer */}
              <button
                onClick={() => setLocalOverlay(false)}
                className="absolute top-2 right-2 z-20 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors shadow-md"
              >
                <FiX size={14} />
              </button>

              {/* Éléments positionnables superposés sur l'image */}
              {(() => {
                const cfg = cc?.interactiveConfig || {};
                const getStyle = (pos: string): React.CSSProperties => {
                  const base: React.CSSProperties = { position: 'absolute', zIndex: 15, maxWidth: '60%' };
                  const shadow = '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)';
                  switch (pos) {
                    case 'top-left':      return { ...base, top: 12, left: 12, textShadow: shadow };
                    case 'top-center':    return { ...base, top: 12, left: '50%', transform: 'translateX(-50%)', textShadow: shadow };
                    case 'top-right':     return { ...base, top: 12, right: 12, textShadow: shadow };
                    case 'center-left':   return { ...base, top: '50%', left: 12, transform: 'translateY(-50%)', textShadow: shadow };
                    case 'center':        return { ...base, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textShadow: shadow };
                    case 'center-right':  return { ...base, top: '50%', right: 12, transform: 'translateY(-50%)', textShadow: shadow };
                    case 'bottom-left':   return { ...base, bottom: 12, left: 12, textShadow: shadow };
                    case 'bottom-center': return { ...base, bottom: 12, left: '50%', transform: 'translateX(-50%)', textShadow: shadow };
                    case 'bottom-right':  return { ...base, bottom: 12, right: 12, textShadow: shadow };
                    default:              return { ...base, bottom: 12, left: 12, textShadow: shadow };
                  }
                };

                return (
                  <>
                    {cfg.showNameOnClick !== false && (
                      <div style={getStyle(cfg.namePosition || 'bottom-left')}>
                        <div className="font-semibold text-sm line-clamp-2" style={{
                          fontFamily: cfg.nameFont || props.productNameFont || 'Inter',
                          fontSize: cfg.nameFontSize ? `${cfg.nameFontSize}px` : '14px',
                          fontWeight: cfg.nameFontWeight || props.productNameWeight || '600',
                          color: cfg.nameColor || '#FFFFFF',
                        }}>
                          {displayName}
                        </div>
                      </div>
                    )}

                    {cfg.showPriceOnClick !== false && displayPrice && (
                      <div style={getStyle(cfg.pricePosition || 'bottom-left')}>
                        <div className="font-bold" style={{
                          fontFamily: cfg.priceFont || props.priceFont || 'Inter',
                          fontSize: cfg.priceFontSize ? `${cfg.priceFontSize}px` : '15px',
                          fontWeight: cfg.priceFontWeight || props.priceWeight || '700',
                          color: cfg.priceColor || '#FFFFFF',
                        }}>
                          {displayPrice} €
                        </div>
                      </div>
                    )}

                    {cfg.showDescriptionOnClick && product?.description && (
                      <div style={getStyle(cfg.descriptionPosition || 'bottom-center')}>
                        <p className="text-xs line-clamp-2" style={{ color: '#FFFFFF' }}>
                          {product.description}
                        </p>
                      </div>
                    )}

                    {cfg.showAddToCart !== false && (
                      <div style={getStyle(cfg.buttonPosition || 'bottom-right')}>
                        <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors shadow-md whitespace-nowrap">
                          {cfg.cartButtonText || 'Ajouter au panier'}
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </>
        )}
      </>
    );
  }

  // ⭐⭐ BLOC TRADITIONNEL AVEC CARROUSEL - AVEC PRIORITÉ À LA CONFIGURATION DU SLOT ⭐⭐
  if (slot.displayMode === 'traditional' && isCarousel && product) {
    const tradConfig = slot.customConfig?.traditionalConfig || {};
    
    return (
      <div className="relative group w-full" style={{ height: 'auto' }}>
        <OuterWrapper showActions={true}>
          <ProductCarousel 
            images={allImages} 
            productName={displayName} 
            frameConfig={frameConfig} 
            carouselConfig={carCfg} 
            autoPlay 
            onImageChange={(i) => onUpdateSlotConfig?.(slot.id, { carouselConfig: { ...carCfg, currentImageIndex: i } })}
            imageCrops={imageCropsMap}
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm flex gap-1 z-20">
            <span>📦</span><span>{frameConfig.icon}</span><span>🎠</span>
          </div>
          {productCustom && renderCustomBadgeUtil(productCustom, frameConfig)}
        </OuterWrapper>
        <div className="mt-2 text-center">
          <h3 className="font-semibold text-sm line-clamp-2" style={{
            fontFamily: tradConfig.nameFont || props.productNameFont || 'Inter',
            fontSize: tradConfig.nameFontSize ? `${tradConfig.nameFontSize}px` : (props.productNameSize || '14px'),
            fontWeight: tradConfig.nameFontWeight || props.productNameWeight || '600',
            color: tradConfig.nameColor || props.productNameColor || '#1F2937'
          }}>
            {displayName}
          </h3>
          {displayPrice && (
            <p className="font-bold mt-1" style={{
              fontFamily: tradConfig.priceFont || props.priceFont || 'Inter',
              fontSize: tradConfig.priceFontSize ? `${tradConfig.priceFontSize}px` : (props.priceSize || '14px'),
              fontWeight: tradConfig.priceFontWeight || props.priceWeight || '700',
              color: tradConfig.priceColor || props.priceColor || '#2563EB'
            }}>
              {displayPrice} €
            </p>
          )}
        </div>
        {isSelected && <ActionButtons />}
      </div>
    );
  }

  // ⭐⭐ BLOC TRADITIONNEL PAR DÉFAUT - AVEC PRIORITÉ À LA CONFIGURATION DU SLOT ⭐⭐
  const tradConfig = slot.customConfig?.traditionalConfig || {};
  
  return (
    <div className="relative group w-full" style={{ height: 'auto' }}>
      <OuterWrapper showActions={true}>
        <div style={imgStyles} className="w-full h-full">
          {displayImage
            ? <Image src={displayImage} alt={displayName} fill className="object-cover" unoptimized style={{ backgroundColor: 'transparent', ...imageCropsMap[slot.imageIndex ?? 0] }} />
            : <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50"><div className="text-3xl mb-1">{frameConfig.icon}</div><span className="text-xs text-gray-500">Aucune image</span></div>
          }
        </div>
        <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm flex gap-1 z-20">
          <span>{getModeIcon(slot.displayMode)}</span><span>{frameConfig.icon}</span>
          {slot.imageIndex != null && <span className="ml-1">📷{slot.imageIndex + 1}</span>}
        </div>
        {productCustom && renderCustomBadgeUtil(productCustom, frameConfig)}
      </OuterWrapper>
      <div className={`mt-2 text-center ${entranceClass}`} style={entranceStyle}>
        <h3 className="font-semibold text-sm line-clamp-2" style={{
          fontFamily: tradConfig.nameFont || props.productNameFont || 'Inter',
          fontSize: tradConfig.nameFontSize ? `${tradConfig.nameFontSize}px` : (props.productNameSize || '14px'),
          fontWeight: tradConfig.nameFontWeight || props.productNameWeight || '600',
          color: tradConfig.nameColor || props.productNameColor || '#1F2937'
        }}>
          {displayName}
        </h3>
        {displayPrice
          ? (
            <p className="font-bold mt-1" style={{
              fontFamily: tradConfig.priceFont || props.priceFont || 'Inter',
              fontSize: tradConfig.priceFontSize ? `${tradConfig.priceFontSize}px` : (props.priceSize || '14px'),
              fontWeight: tradConfig.priceFontWeight || props.priceWeight || '700',
              color: tradConfig.priceColor || props.priceColor || '#2563EB'
            }}>
              {displayPrice} €
            </p>
          )
          : !product && <p className="text-xs text-gray-400 mt-1">Cliquez pour ajouter un produit</p>
        }
      </div>
      {isSelected && <ActionButtons />}
    </div>
  );
};

const InteractiveOverlay = ({ product, slot, onClose }: { product: StudioProduct; slot: ProductGridSlot; onClose: () => void }) => {
  const cfg = slot.customConfig?.interactiveConfig;
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const styles: Record<string, React.CSSProperties> = {
    modal:   { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '450px', zIndex: 1000, borderRadius: '12px', overflow: 'hidden' },
    tooltip: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '280px', zIndex: 1000, borderRadius: '8px' },
    slide:   { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, borderRadius: '12px 12px 0 0' },
    fade:    { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '400px', zIndex: 1000, borderRadius: '12px' },
  };

  const st = cfg?.overlayStyle || 'modal';
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[999]" onClick={onClose} style={{ backdropFilter: `blur(${cfg?.overlayBlur || 4}px)` }} />
      <div style={{ ...styles[st], backgroundColor: cfg?.overlayBackground || '#ffffff', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: `${st === 'slide' ? 'slideUp' : 'fadeIn'} ${cfg?.animationDuration || 300}ms ease` }}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 rounded-full hover:bg-white shadow-md"><FiX size={18} /></button>
        <div className="relative h-48 bg-gray-100">
          <Image src={product.imageUrl || product.imageUrl1 || '/images/placeholder.svg'} alt={product.name} fill className="object-cover" unoptimized />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{product.name}</h3>
          {cfg?.showPriceOnClick !== false && <div className="text-2xl font-bold text-primary mb-2">{product.price} €</div>}
          {cfg?.showDescriptionOnClick && product.description && <p className="text-gray-600 text-sm mb-3">{product.description}</p>}
          {cfg?.showAddToCart !== false && <button className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">Ajouter au panier</button>}
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn { from{opacity:0;transform:translate(-50%,-48%)} to{opacity:1;transform:translate(-50%,-50%)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>
    </>
  );
};

const repositionSlotsCorrectly = (
  currentSlots: ProductGridSlot[],
  maxColumns: number,
  prioritySlotId?: string
): ProductGridSlot[] => {
  const finalSlots: ProductGridSlot[] = [];

  const prioritySlot = currentSlots.find(s => s.id === prioritySlotId);
  if (prioritySlot) {
    const rSpan = prioritySlot.gridPosition.rowSpan || 1;
    const cSpan = prioritySlot.gridPosition.colSpan || 1;
    const adjustedCSpan = Math.min(cSpan, maxColumns);
    let targetCol = prioritySlot.gridPosition.col;
    if (targetCol + adjustedCSpan > maxColumns) targetCol = Math.max(0, maxColumns - adjustedCSpan);
    finalSlots.push({ ...prioritySlot, gridPosition: { ...prioritySlot.gridPosition, col: targetCol, colSpan: adjustedCSpan, rowSpan: rSpan } });
  }

  const remainingSlots = currentSlots
    .filter(s => s.id !== prioritySlotId)
    .sort((a, b) => {
      if (a.gridPosition.row !== b.gridPosition.row) return a.gridPosition.row - b.gridPosition.row;
      return a.gridPosition.col - b.gridPosition.col;
    });

  const isAreaOccupied = (startRow: number, startCol: number, rSpan: number, cSpan: number): boolean => {
    if (startCol + cSpan > maxColumns) return true;
    for (let r = startRow; r < startRow + rSpan; r++) {
      for (let c = startCol; c < startCol + cSpan; c++) {
        const collision = finalSlots.some((s) => {
          const sR = s.gridPosition.row; const sC = s.gridPosition.col;
          const sRSpan = s.gridPosition.rowSpan || 1; const sCSpan = s.gridPosition.colSpan || 1;
          return r >= sR && r < sR + sRSpan && c >= sC && c < sC + sCSpan;
        });
        if (collision) return true;
      }
    }
    return false;
  };

  remainingSlots.forEach((slot) => {
    const rSpan = slot.gridPosition.rowSpan || 1;
    const cSpan = slot.gridPosition.colSpan || 1;
    const adjustedCSpan = Math.min(cSpan, maxColumns);
    let targetRow = slot.gridPosition.row;
    let targetCol = slot.gridPosition.col;
    if (targetCol + adjustedCSpan > maxColumns) targetCol = Math.max(0, maxColumns - adjustedCSpan);
    while (isAreaOccupied(targetRow, targetCol, rSpan, adjustedCSpan)) {
      targetCol++;
      if (targetCol + adjustedCSpan > maxColumns) { targetCol = 0; targetRow++; }
    }
    finalSlots.push({ ...slot, gridPosition: { ...slot.gridPosition, row: targetRow, col: targetCol, colSpan: adjustedCSpan, rowSpan: rSpan } });
  });

  return finalSlots.sort((a, b) => {
    if (a.gridPosition.row !== b.gridPosition.row) return a.gridPosition.row - b.gridPosition.row;
    return a.gridPosition.col - b.gridPosition.col;
  });
};

export function GridProductsBlock({
  shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1, isResizing = false,
  onOpenAssetPicker, gridConfig: externalGridConfig, onUpdateGridConfig,
  productsList: externalProductsList = [], onLinkProduct, onUpdateProductCustomization,
  onOpenCustomization, globalProductCustomizations: externalProductCustomizations,
  onUpdateGlobalProductCustomization, onUpdateSlotConfig,
}: Props) {
  const { props } = block;
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const containerWidthRef = useRef(1200);
  const [, forceContainerUpdate] = useState(0);
  const isResizingRef = useRef(isResizing);
  const isReportingRef = useRef(false);
  const lastReportedHeightRef = useRef<number | null>(null);
  const reportTimer = useRef<any>(null);
  const [localGridConfig, setLocalGridConfig] = useState<ProductGridConfig | null>(null);
  const [localProductCustomizations, setLocalProductCustomizations] = useState<Map<number, ProductCustomization>>(new Map());
  const [, forceUpdate] = useState(0);
  const isInitialMount = useRef(true);
  const prevCustomizationsRef = useRef<string>('');

  const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);
  const [emptyHoveredCell, setEmptyHoveredCell] = useState<string | null>(null);
  const activeDragRef = useRef<string | null>(null);
  const [resizingSlotId, setResizingSlotId] = useState<string | null>(null);
  const resizeRef = useRef<any>(null);

  const productCustomizations = externalProductCustomizations || localProductCustomizations;
  const gridConfig = externalGridConfig || localGridConfig;
  const allProducts = externalProductsList;

  const columns = gridConfig?.columns?.desktop || props.gridColumns || 3;
  const rows    = gridConfig?.rows             || props.gridRows    || 2;
  const slots   = (gridConfig?.slots as ProductGridSlot[]) || props.gridSlots || [];
  const gap     = gridConfig?.gap              || props.gapSize     || 20;
  const currentDimension = gridConfig?.dimension || DEFAULT_DIMENSION;
  const currentUniformSize = gridConfig?.uniformSize || DEFAULT_UNIFORM_SIZE;

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [showSlotEditor, setShowSlotEditor] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'product' | 'custom'>('product');

  const refresh = useCallback(() => forceUpdate(p => p + 1), []);
  const onUpdateGridConfigRef = useRef(onUpdateGridConfig);
  useEffect(() => { onUpdateGridConfigRef.current = onUpdateGridConfig; }, [onUpdateGridConfig]);

  useEffect(() => {
    if (!gridConfig?.slots || gridConfig.slots.length === 0) return;
    const activePriorityId = resizingSlotId || draggedSlotId || undefined;
    const resolvedSlots = repositionSlotsCorrectly(gridConfig.slots, columns, activePriorityId);
    const hasStructureChanged = resolvedSlots.some((slot) => {
      const original = gridConfig.slots.find((s) => s.id === slot.id);
      if (!original) return true;
      return slot.gridPosition.row !== original.gridPosition.row || slot.gridPosition.col !== original.gridPosition.col;
    });
    if (hasStructureChanged && onUpdateGridConfigRef.current) {
      const maxRowUsed = resolvedSlots.reduce((max, s) => Math.max(max, s.gridPosition.row + (s.gridPosition.rowSpan || 1)), 0);
      const newRows = maxRowUsed <= 4 ? maxRowUsed : gridConfig.rows;
      onUpdateGridConfigRef.current({ ...gridConfig, rows: newRows, slots: resolvedSlots });
    }
  }, [
    columns, resizingSlotId, draggedSlotId,
    (gridConfig?.slots || []).map(s => `${s.id}-R${s.gridPosition.row}-C${s.gridPosition.col}-W${s.gridPosition.colSpan || 1}-H${s.gridPosition.rowSpan || 1}`).join(',')
  ]);

  const handleSlotDragStart = useCallback((e: React.DragEvent, slotId: string) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const img = new window.Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer.setDragImage(img, 0, 0);
    }
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSlotId(slotId);
    activeDragRef.current = slotId;
  }, []);

  const handleSlotDragEnd = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedSlotId(null);
    if (activeDragRef.current) activeDragRef.current = null;
    setEmptyHoveredCell(null);
  }, []);

  const handleSlotDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleSlotDrop = useCallback((e: React.DragEvent, targetSlotId: string) => {
    e.preventDefault();
    const currentDraggedId = activeDragRef.current;
    if (!currentDraggedId || currentDraggedId === targetSlotId || !gridConfig) {
      setDraggedSlotId(null);
      activeDragRef.current = null;
      setEmptyHoveredCell(null);
      return;
    }
    const draggedSlot = slots.find(s => s.id === currentDraggedId);
    const targetSlot = slots.find(s => s.id === targetSlotId);
    if (!draggedSlot || !targetSlot) {
      setDraggedSlotId(null);
      activeDragRef.current = null;
      setEmptyHoveredCell(null);
      return;
    }
    const updatedSlots = gridConfig.slots.map(slot => {
      if (slot.id === currentDraggedId) return { ...slot, gridPosition: { ...slot.gridPosition, row: targetSlot.gridPosition.row, col: targetSlot.gridPosition.col } };
      if (slot.id === targetSlotId) return { ...slot, gridPosition: { ...slot.gridPosition, row: draggedSlot.gridPosition.row, col: draggedSlot.gridPosition.col } };
      return slot;
    });
    if (onUpdateGridConfigRef.current) onUpdateGridConfigRef.current({ ...gridConfig, slots: updatedSlots });
    else if (onUpdate && block?.props) onUpdate({ ...block.props, gridSlots: updatedSlots });
    setDraggedSlotId(null);
    activeDragRef.current = null;
    setEmptyHoveredCell(null);
  }, [gridConfig, slots, onUpdate, block]);

  const handleEmptyCellDrop = useCallback((e: React.DragEvent, rowIndex: number, colIndex: number) => {
    e.preventDefault();
    const currentDraggedId = activeDragRef.current;
    if (!currentDraggedId || !gridConfig) return;
    const updatedSlots = gridConfig.slots.map(slot =>
      slot.id === currentDraggedId
        ? { ...slot, gridPosition: { ...slot.gridPosition, row: rowIndex, col: colIndex, rowSpan: 1, colSpan: 1 } }
        : slot
    );
    if (onUpdateGridConfigRef.current) onUpdateGridConfigRef.current({ ...gridConfig, slots: updatedSlots });
    else if (onUpdate && block?.props) onUpdate({ ...block.props, gridSlots: updatedSlots });
    setDraggedSlotId(null);
    activeDragRef.current = null;
    setEmptyHoveredCell(null);
  }, [gridConfig, onUpdate, block]);

  const handleDragLeave = useCallback(() => { setEmptyHoveredCell(null); }, []);

  useEffect(() => { isResizingRef.current = isResizing; }, [isResizing]);

  useEffect(() => {
    if (containerRef.current) {
      const initialWidth = containerRef.current.getBoundingClientRect().width;
      if (initialWidth > 0) containerWidthRef.current = initialWidth;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        if (Math.abs(newWidth - containerWidthRef.current) > 8) { containerWidthRef.current = newWidth; forceContainerUpdate(p => p + 1); }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => { return () => { if (reportTimer.current) clearTimeout(reportTimer.current); }; }, []);

  useEffect(() => {
    let el = document.getElementById('grid-products-styles') as HTMLStyleElement | null;
    if (!el) { el = document.createElement('style'); el.id = 'grid-products-styles'; document.head.appendChild(el); }
    el.textContent = animationStyles;
  }, []);

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    const currentHash = JSON.stringify(Array.from(productCustomizations.entries()));
    if (prevCustomizationsRef.current !== currentHash && prevCustomizationsRef.current !== '') prevCustomizationsRef.current = currentHash;
    else if (prevCustomizationsRef.current === '') prevCustomizationsRef.current = currentHash;
  }, [productCustomizations]);

  const updateGridConfig = (cfg: ProductGridConfig) => {
    if (onUpdateGridConfig) onUpdateGridConfig(cfg);
    else { setLocalGridConfig(cfg); onUpdate({ gridColumns: cfg.columns.desktop, gridRows: cfg.rows, gridSlots: cfg.slots, gapSize: cfg.gap, gridConfig: cfg }); }
  };

  const updateSlots = (newSlots: ProductGridSlot[]) => {
    if (gridConfig) updateGridConfig({ ...gridConfig, slots: newSlots });
    else onUpdate({ gridSlots: newSlots, gridColumns: columns, gridRows: rows, gridConfig: { columns: { desktop: columns, tablet: 2, mobile: 1 }, rows, slots: newSlots, gap, padding: 16, layoutType: 'grid', dimension: DEFAULT_DIMENSION } });
  };

  useEffect(() => {
    if ((!slots || slots.length === 0) && !isResizing) {
      const newSlots: ProductGridSlot[] = [];
      let idx = 0;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < columns; c++)
          newSlots.push({ id: `slot-${r}-${c}`, order: idx++, productId: null, displayMode: 'traditional', frameStyle: 'square', imageIndex: null, gridPosition: { row: r, col: c, rowSpan: 1, colSpan: 1 } });
      updateGridConfig({ columns: { desktop: columns, tablet: 2, mobile: 1 }, rows, slots: newSlots, gap: 20, padding: 16, layoutType: 'grid', dimension: DEFAULT_DIMENSION, uniformSize: DEFAULT_UNIFORM_SIZE });
    }
  }, [columns, rows, slots?.length, isResizing]);

  const addSlot = useCallback(() => {
    let targetRow = 0; let targetCol = 0;
    const isOccupied = (r: number, c: number) => slots.some(s => {
      const startR = s.gridPosition.row; const startC = s.gridPosition.col;
      const rSpan = s.gridPosition.rowSpan || 1; const cSpan = s.gridPosition.colSpan || 1;
      return r >= startR && r < startR + rSpan && c >= startC && c < startC + cSpan;
    });
    while (isOccupied(targetRow, targetCol)) {
      targetCol++;
      if (targetCol >= columns) { targetCol = 0; targetRow++; }
    }
    const newSlot: ProductGridSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, order: slots.length,
      productId: null, displayMode: 'traditional', frameStyle: slots[0]?.frameStyle || 'square',
      imageIndex: null, gridPosition: { row: targetRow, col: targetCol, rowSpan: 1, colSpan: 1 },
    };
    const resolvedSlots = repositionSlotsCorrectly([...slots, newSlot], columns);
    if (onUpdateGridConfigRef.current && gridConfig) onUpdateGridConfigRef.current({ ...gridConfig, slots: resolvedSlots });
    else if (onUpdate && block?.props) onUpdate({ ...block.props, gridSlots: resolvedSlots });
  }, [slots, columns, gridConfig, onUpdate, block]);

  const handleLinkProduct = (slotId: string, product: StudioProduct) => {
    if (onLinkProduct) onLinkProduct(slotId, product);
    else updateSlots(slots.map((s: ProductGridSlot) => s.id === slotId ? { ...s, productId: product.id, linkedProduct: product, customConfig: undefined, imageIndex: null } : s));
    setShowSlotEditor(false); setEditingSlot(null); setCustomTitle(''); setCustomImageUrl(''); setProductSearch('');
    refresh();
  };

  const clearSlot = (slotId: string) => {
    if (onLinkProduct) onLinkProduct(slotId, {} as StudioProduct);
    else updateSlots(slots.map((s: ProductGridSlot) => s.id === slotId ? { ...s, productId: null, linkedProduct: undefined, customConfig: undefined, imageIndex: null } : s));
    refresh();
  };

  const addCustomToSlot = (slotId: string) => {
    if (!customTitle && !customImageUrl) return;
    updateSlots(slots.map((s: ProductGridSlot) => s.id === slotId ? { ...s, productId: null, linkedProduct: undefined, customConfig: { ...s.customConfig, customTitle: customTitle || undefined, customImage: customImageUrl || undefined }, imageIndex: null } : s));
    setShowSlotEditor(false); setEditingSlot(null); setCustomTitle(''); setCustomImageUrl('');
    refresh();
  };

  const getProductCustomization = (productId: number): ProductCustomization => productCustomizations.get(productId) || { ...DEFAULT_CUSTOMIZATION };

  const getSlotProduct = (slot: ProductGridSlot) => {
    if (slot.linkedProduct) return slot.linkedProduct;
    if (slot.productId) return allProducts.find(p => p.id === slot.productId);
    return null;
  };

  const getDisplayImageForSlot = (slot: ProductGridSlot) => {
    const product = getSlotProduct(slot);
    const cc = slot.customConfig as any;
    if (!product) return cc?.customImage || null;
    const i = slot.imageIndex;
    if (i === 1 && product.imageUrl1) return product.imageUrl1;
    if (i === 2 && product.imageUrl2) return product.imageUrl2;
    if (i === 3 && product.imageUrl3) return product.imageUrl3;
    return product.imageUrl || product.imageUrl1 || null;
  };

  const getAllProductImages = (product: StudioProduct | null | undefined): string[] => {
    if (!product) return [];
    return [product.imageUrl, product.imageUrl1, product.imageUrl2, product.imageUrl3].filter(Boolean) as string[];
  };

  const getSlotSizeStyle = (slot: ProductGridSlot): React.CSSProperties => {
    const customSize = slot.customSize;
    if (customSize) {
      const style: React.CSSProperties = {};
      style.width = customSize.widthUnit === 'auto' ? 'auto' : `${customSize.width}px`;
      style.height = customSize.heightUnit === 'auto' ? 'auto' : `${customSize.height}px`;
      return style;
    }
    if (currentUniformSize.enabled) return { width: `${currentUniformSize.width}px`, height: `${currentUniformSize.height}px` };
    return { width: '100%', height: '100%' };
  };

  const SlotEditorModal = () => {
    if (!showSlotEditor) return null;
    const filtered = allProducts.filter((p: StudioProduct) => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" onClick={() => setShowSlotEditor(false)}>
        <div className="bg-gray-900 rounded-xl w-[500px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Configurer le slot</h3>
            <button onClick={() => setShowSlotEditor(false)} className="text-gray-400 hover:text-white"><FiX size={20} /></button>
          </div>
          <div className="flex border-b border-gray-700">
            <button className={`flex-1 py-2 text-sm ${activeTab === 'product' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`} onClick={() => setActiveTab('product')}>Produit existant</button>
            <button className={`flex-1 py-2 text-sm ${activeTab === 'custom'  ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`} onClick={() => setActiveTab('custom')}>Contenu personnalisé</button>
          </div>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {activeTab === 'product' ? (
              <div>
                <input type="text" placeholder="Rechercher..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mb-3" />
                <div className="space-y-2">
                  {loadingProducts ? <div className="text-center py-4 text-gray-400">Chargement...</div>
                    : filtered.length === 0 ? <p className="text-gray-500 text-center py-4">Aucun produit trouvé</p>
                    : filtered.map((p: StudioProduct) => (
                      <button key={p.id} onClick={() => editingSlot && handleLinkProduct(editingSlot, p)} className="w-full flex items-center gap-3 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                          {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized /> : <div className="w-full h-full flex items-center justify-center text-gray-500">📷</div>}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white text-sm">{p.name}</div>
                          <div className="text-primary text-xs">{p.price} €</div>
                          <div className="text-gray-500 text-xs">{p.isInStock && p.stock > 0 ? `Stock: ${p.stock}` : 'Rupture'}</div>
                        </div>
                      </button>
                    ))
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm block mb-1">Titre personnalisé</label>
                  <input type="text" value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="Titre du slot" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="text-white text-sm block mb-1">Image</label>
                  <div className="flex gap-2">
                    <input type="text" value={customImageUrl} onChange={e => setCustomImageUrl(e.target.value)} placeholder="URL de l'image" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                    {onOpenAssetPicker && <button onClick={() => onOpenAssetPicker(url => setCustomImageUrl(url))} className="bg-gray-700 hover:bg-gray-600 text-white px-3 rounded-lg">📁</button>}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => editingSlot && addCustomToSlot(editingSlot)} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/80">Sauvegarder</button>
                  <button onClick={() => { setShowSlotEditor(false); setEditingSlot(null); setCustomTitle(''); setCustomImageUrl(''); }} className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600">Annuler</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const gridGap = gridConfig?.gap ?? gap;
  const gridPadding = gridConfig?.padding ?? 16;

  const dynamicRowsCount = useMemo(() => {
    const maxSlotRow = slots.reduce((max, slot) => Math.max(max, slot.gridPosition.row + (slot.gridPosition.rowSpan || 1)), 0);
    return Math.max(rows, maxSlotRow);
  }, [slots, rows]);

  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${dynamicRowsCount}, auto)`,
    gap: `${gridGap}px`,
    position: 'relative' as const,
  }), [columns, dynamicRowsCount, gridGap]);

  const titleStyle = useMemo(() => ({
    fontFamily: props.titleFont || 'Poppins',
    fontSize: props.titleFontSize || '36px',
    fontWeight: props.titleFontWeight || '700',
    textAlign: 'center' as const,
    marginBottom: '1rem',
    lineHeight: 1.2,
    opacity: textOpacity,
    color: props.titleColor || '#1F2937',
  }), [props.titleFont, props.titleFontSize, props.titleFontWeight, props.titleColor, textOpacity]);

  const containerStyle = useMemo(() => ({
    background: props.backgroundColor || '#ffffff',
    width: '100%',
    height: 'auto',
    overflow: 'visible',
    position: 'relative' as const,
    outline: isSelected ? '2px solid var(--color-primary, #3B82F6)' : 'none',
    outlineOffset: '2px',
  }), [props.backgroundColor, isSelected]);

  const coveredCells = useMemo(() => {
    const covered = new Set<string>();
    slots.forEach(slot => {
      const startRow = slot.gridPosition.row; const startCol = slot.gridPosition.col;
      const rowSpan = slot.gridPosition.rowSpan || 1; const colSpan = slot.gridPosition.colSpan || 1;
      for (let r = startRow; r < startRow + rowSpan; r++)
        for (let c = startCol; c < startCol + colSpan; c++)
          if (r !== startRow || c !== startCol) covered.add(`${c}-${r}`);
    });
    return covered;
  }, [slots]);

  const ghostCellHeight = useMemo(() => {
    const currentWidth = containerWidthRef.current > 0 ? containerWidthRef.current : 1200;
    const cellW = (currentWidth - gridPadding * 2 - gap * (columns - 1)) / columns;
    const [ar1, ar2] = FRAME_STYLE_CONFIG.square.aspectRatio.split('/').map(Number);
    return cellW * (ar2 / ar1);
  }, [columns, gap, gridPadding, containerWidthRef.current]);

  useEffect(() => {
    setEmptyHoveredCell(null);
    setDraggedSlotId(null);
    activeDragRef.current = null;
  }, [columns, rows]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative cursor-pointer transition-all w-full"
        style={containerStyle}
        onClick={onSelect}
        onMouseDown={(e) => {
          if (activeDragRef.current) e.stopPropagation();
        }}
        onDragStart={(e) => e.stopPropagation()}
        onDragOver={(e) => e.stopPropagation()}
        onDrop={(e) => e.stopPropagation()}
        onDragEnd={(e) => e.stopPropagation()}
      >
        <div ref={innerRef} className="w-full px-3 py-3 overflow-visible">
          <h2
            className="text-center mb-4"
            style={titleStyle}
            contentEditable={isSelected}
            onBlur={e => onUpdate({ title: e.currentTarget.innerText })}
            suppressContentEditableWarning
          >
            {props.title || 'Nos produits'}
          </h2>

          {slots.length > 0 ? (
            <div style={gridStyle}>
              {Array.from({ length: dynamicRowsCount }, (_, rowIndex) =>
                Array.from({ length: columns }, (_, colIndex) => {
                  const cellKey = `${colIndex}-${rowIndex}`;
                  if (coveredCells.has(cellKey)) return null;

                  const slotAtPosition = slots.find(s => s.gridPosition.row === rowIndex && s.gridPosition.col === colIndex);

                  if (slotAtPosition) {
                    const isBeingDragged = draggedSlotId === slotAtPosition.id;
                    return (
                      <div
                        key={`slot-node-${slotAtPosition.id}`}
                        draggable
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => handleSlotDragStart(e, slotAtPosition.id)}
                        onDragOver={handleSlotDragOver}
                        onDrop={(e) => handleSlotDrop(e, slotAtPosition.id)}
                        onDragEnd={handleSlotDragEnd}
                        className={`relative rounded-lg group select-none ${isBeingDragged ? 'opacity-40' : 'opacity-100'}`}
                        style={{
                          gridArea: `${slotAtPosition.gridPosition.row + 1} / ${slotAtPosition.gridPosition.col + 1} / span ${slotAtPosition.gridPosition.rowSpan || 1} / span ${slotAtPosition.gridPosition.colSpan || 1}`,
                          transition: isBeingDragged ? 'none' : 'all 0.15s ease',
                          cursor: activeDragRef.current ? 'grabbing' : 'grab',
                          overflow: 'visible',
                        }}
                      >
                        <SlotContent
                          slot={slotAtPosition}
                          containerWidth={containerWidthRef.current}
                          columns={columns}
                          gap={gap}
                          gridPadding={gridPadding}
                          isSelected={isSelected}
                          onSelect={() => { if (!activeDragRef.current) onSelect(); }}
                          onOpenCustomization={onOpenCustomization}
                          onUpdateSlotConfig={onUpdateSlotConfig}
                          onLinkProduct={onLinkProduct}
                          onOpenAssetPicker={onOpenAssetPicker}
                          props={props}
                          productCustomizations={productCustomizations}
                          allProducts={allProducts}
                          loadingProducts={loadingProducts}
                          setEditingSlot={setEditingSlot}
                          setShowSlotEditor={setShowSlotEditor}
                          setCustomTitle={setCustomTitle}
                          setCustomImageUrl={setCustomImageUrl}
                          setActiveTab={setActiveTab}
                          clearSlot={clearSlot}
                          getProductCustomization={getProductCustomization}
                          getSlotProduct={getSlotProduct}
                          getDisplayImageForSlot={getDisplayImageForSlot}
                          getAllProductImages={getAllProductImages}
                        />
                      </div>
                    );
                  }

                  const isEmptyOver = emptyHoveredCell === `empty-cell-${cellKey}`;
                  return (
                    <div
                      key={`empty-node-${cellKey}`}
                      data-row={rowIndex}
                      data-col={colIndex}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (activeDragRef.current && emptyHoveredCell !== `empty-cell-${cellKey}`) setEmptyHoveredCell(`empty-cell-${cellKey}`);
                      }}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleEmptyCellDrop(e, rowIndex, colIndex)}
                      style={{
                        gridColumn: `${colIndex + 1}`,
                        gridRow: `${rowIndex + 1}`,
                        height: `${ghostCellHeight}px`,
                        borderRadius: '8px',
                        border: isEmptyOver ? '2px dashed #8B5CF6' : '1.5px dashed rgba(156,163,175,0.25)',
                        background: isEmptyOver ? 'rgba(139, 92, 246, 0.08)' : 'rgba(156,163,175,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: activeDragRef.current ? 'move' : 'default',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={addSlot}
                    >
                      <span style={{ fontSize: 10, color: isEmptyOver ? '#8B5CF6' : 'rgba(156,163,175,0.45)', pointerEvents: 'none', fontFamily: 'monospace' }}>
                        {isEmptyOver ? 'Déposer' : `${colIndex + 1},${rowIndex + 1}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <button onClick={addSlot} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 mx-auto hover:bg-primary/90">
                <FiPlus size={16} />
                Ajouter un slot
              </button>
            </div>
          )}
        </div>

        {isSelected && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap">
            Grille de produits ({slots.length} slots)
          </div>
        )}
      </div>

      <SlotEditorModal />
    </>
  );
}

export default React.memo(GridProductsBlock);