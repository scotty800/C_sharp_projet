'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { FiX } from 'react-icons/fi';
import {
  useInjectGridStyles, DEFAULT_CUSTOMIZATION, FRAME_STYLE_CONFIG,
  getSlideCustomization, getHoverEffectClass, getCustomFrameStylesUtil, getImageStylesUtil,
  getHoverEffectVarsUtil, getEntranceAnimationClassUtil, getEntranceAnimationStyleUtil,
  renderCustomBadgeUtil, getBackgroundStylesOnly, getImageCropStyle, computeSlotGeometry,
  ProductCarousel,
} from '@/components/shop-studio/blocks/productGrid/shared';
import { ProductCustomization, ProductGridConfig, ProductGridSlot, StudioProduct, ProductSlotData } from '@/types/studio';

interface Props {
  block: any;
  gridConfig?: ProductGridConfig;
  productsList: StudioProduct[];
  globalProductCustomizations: Map<number, ProductCustomization>;
  onAddToCart?: (product: StudioProduct) => void;
  onHeightChange?: (height: number) => void;
}

export default function ShopProductGrid({
  block, gridConfig, productsList, globalProductCustomizations, onAddToCart, onHeightChange,
}: Props) {
  useInjectGridStyles();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerWidth(w => (Math.abs(w - width) > 0.5 ? width : w));
      onHeightChange?.(height);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [onHeightChange]);

  const props = block?.props || {};

  const getSlotProduct = useCallback(
    (slot: ProductGridSlot) => slot.linkedProduct || productsList.find(p => p.id === slot.productId) || null,
    [productsList]
  );

  const getProductCustomization = useCallback(
    (productId: number) => globalProductCustomizations.get(productId) || { ...DEFAULT_CUSTOMIZATION },
    [globalProductCustomizations]
  );

  if (!gridConfig || gridConfig.slots.length === 0) return <div ref={containerRef} />;

  const columns = gridConfig.columns?.desktop || 3;
  const gap = gridConfig.gap ?? 20;
  const gridPadding = gridConfig.padding ?? 16;
  const slots = gridConfig.slots;

  const coveredCells = new Set<string>();
  slots.forEach(slot => {
    const startRow = slot.gridPosition.row, startCol = slot.gridPosition.col;
    const rowSpan = slot.gridPosition.rowSpan || 1, colSpan = slot.gridPosition.colSpan || 1;
    for (let r = startRow; r < startRow + rowSpan; r++)
      for (let c = startCol; c < startCol + colSpan; c++)
        if (r !== startRow || c !== startCol) coveredCells.add(`${c}-${r}`);
  });

  const dynamicRowsCount = slots.reduce(
    (max, s) => Math.max(max, s.gridPosition.row + (s.gridPosition.rowSpan || 1)), 0
  );

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${dynamicRowsCount}, auto)`,
    gap: `${gap}px`,
    position: 'relative',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: props.titleFont || 'Poppins',
    fontSize: props.titleFontSize || '36px',
    fontWeight: props.titleFontWeight || '700',
    textAlign: 'center',
    marginBottom: '1rem',
    lineHeight: 1.2,
    color: props.titleColor || '#1F2937',
  };

  return (
    <div ref={containerRef} className="w-full" style={{ background: props.backgroundColor || '#ffffff' }}>
      <div className="w-full px-3 py-3">
        {props.title && <h2 style={titleStyle}>{props.title}</h2>}

        <div style={gridStyle}>
          {Array.from({ length: dynamicRowsCount }, (_, rowIndex) =>
            Array.from({ length: columns }, (_, colIndex) => {
              const cellKey = `${colIndex}-${rowIndex}`;
              if (coveredCells.has(cellKey)) return null;
              const slot = slots.find(s => s.gridPosition.row === rowIndex && s.gridPosition.col === colIndex);
              if (!slot) return null;

              return (
                <div
                  key={slot.id}
                  style={{
                    gridArea: `${slot.gridPosition.row + 1} / ${slot.gridPosition.col + 1} / span ${slot.gridPosition.rowSpan || 1} / span ${slot.gridPosition.colSpan || 1}`,
                  }}
                >
                  <ShopSlotView
                    slot={slot}
                    containerWidth={containerWidth}
                    columns={columns}
                    gap={gap}
                    gridPadding={gridPadding}
                    props={props}
                    getSlotProduct={getSlotProduct}
                    getProductCustomization={getProductCustomization}
                    onAddToCart={onAddToCart}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ⭐ Interface pour les types du customConfig
interface CustomConfigWithTraditional {
  customTitle?: string;
  customImage?: string;
  traditionalConfig?: {
    showName?: boolean;
    nameFont?: string;
    nameFontSize?: number;
    nameFontWeight?: string;
    nameColor?: string;
    showPrice?: boolean;
    priceFont?: string;
    priceFontSize?: number;
    priceFontWeight?: string;
    priceColor?: string;
    showAddToCart?: boolean;
    buttonStyle?: 'primary' | 'outline' | 'text';
    showDescription?: boolean;
    showSizeSelector?: boolean;
    showColorSelector?: boolean;
    showStockStatus?: boolean;
    imagePosition?: 'top' | 'left' | 'right';
    cardStyle?: 'default' | 'minimal' | 'compact' | 'detailed';
  };
  interactiveConfig?: {
    showPriceOnClick?: boolean;
    showDescriptionOnClick?: boolean;
    showSizeSelector?: boolean;
    showColorSelector?: boolean;
    showStockStatus?: boolean;
    showAddToCart?: boolean;
    overlayStyle?: 'modal' | 'tooltip' | 'slide' | 'fade';
    overlayBackground?: string;
    overlayBlur?: number;
    animationDuration?: number;
    triggerType?: 'click' | 'hover';
    showNameOnClick?: boolean;
    namePosition?: string;
    pricePosition?: string;
    buttonPosition?: string;
    descriptionPosition?: string;
    nameColor?: string;
    priceColor?: string;
    cartButtonText?: string;
    nameFont?: string;
    nameFontSize?: number;
    nameFontWeight?: string;
    priceFont?: string;
    priceFontSize?: number;
    priceFontWeight?: string;
  };
}

function ShopSlotView({
  slot, containerWidth, columns, gap, gridPadding, props, getSlotProduct, getProductCustomization, onAddToCart,
}: {
  slot: ProductGridSlot;
  containerWidth: number;
  columns: number;
  gap: number;
  gridPadding: number;
  props: any;
  getSlotProduct: (slot: ProductGridSlot) => StudioProduct | null;
  getProductCustomization: (productId: number) => ProductCustomization;
  onAddToCart?: (product: StudioProduct) => void;
}) {
  const [overlayOpen, setOverlayOpen] = useState(false);

  const product = getSlotProduct(slot);
  
  // ⭐ Typer correctement le customConfig
  const cc = slot.customConfig as CustomConfigWithTraditional | undefined;
  const hasCustom = cc?.customTitle || cc?.customImage;
  const productCustom = product ? getProductCustomization(product.id) : null;

  const allImages = product
    ? ([product.imageUrl1, product.imageUrl2, product.imageUrl3].filter(Boolean) as string[])
    : [];
  const currentImageIndex = (slot.carouselConfig as any)?.currentImageIndex ?? 0;
  const effectiveCustom = getSlideCustomization(productCustom, currentImageIndex) || productCustom;

  const frameStyle = slot.frameStyle || 'square';
  const frameConfig = FRAME_STYLE_CONFIG[frameStyle as keyof typeof FRAME_STYLE_CONFIG] || FRAME_STYLE_CONFIG.square;

  const displayName = cc?.customTitle || product?.name || 'Sans titre';
  const displayPrice = product?.price;
  const carCfg = slot.carouselConfig;
  const isCarousel = carCfg?.enabled && allImages.length > 1;

  const displayImage = !product
    ? cc?.customImage || null
    : slot.imageIndex === 0 && product.imageUrl1 ? product.imageUrl1
    : slot.imageIndex === 1 && product.imageUrl2 ? product.imageUrl2
    : slot.imageIndex === 2 && product.imageUrl3 ? product.imageUrl3
    : product.imageUrl1 || product.imageUrl2 || product.imageUrl3 || null;

  const rowSpan = slot.gridPosition.rowSpan || 1;
  const colSpan = slot.gridPosition.colSpan || 1;
  const { slotBoxStyle, cellWidth, ar1, ar2 } = computeSlotGeometry(containerWidth, columns, gap, gridPadding, frameConfig, rowSpan, colSpan);

  // Tous les hooks doivent être appelés avant le "return null" du cas vide
  const imageCropsMap = useMemo(() => {
    const map: Record<number, React.CSSProperties> = {};
    for (let idx = 0; idx < allImages.length; idx++) map[idx] = getImageCropStyle(slot, idx);
    return map;
  }, [allImages.length, JSON.stringify((slot.customConfig as any)?.imageCrops)]);

  const slideCustomizationsMap = useMemo(() => {
    if (!productCustom) return {};
    const map: Record<number, ProductCustomization | null> = {};
    for (let idx = 0; idx < allImages.length; idx++) map[idx] = getSlideCustomization(productCustom, idx);
    return map;
  }, [productCustom, allImages.length, JSON.stringify(productCustom?.slidesConfig)]);

  // Côté Boutique : un slot vide ne s'affiche jamais
  if (!product && !hasCustom) return null;

  const getCustomForImageIndex = (imageIdx: number) => getSlideCustomization(productCustom, imageIdx) || productCustom;
  const hoverClass = getHoverEffectClass(effectiveCustom);
  const hoverVars = getHoverEffectVarsUtil(effectiveCustom);
  const frameStyles = getCustomFrameStylesUtil(effectiveCustom);
  const entranceClass = getEntranceAnimationClassUtil(effectiveCustom);
  const entranceStyle = getEntranceAnimationStyleUtil(effectiveCustom);
  
  // ⭐ Extraire la config traditionnelle avec des valeurs par défaut
  const tradConfig = cc?.traditionalConfig || {};

  // ── MODE INTERACTIF ──
  if (slot.displayMode === 'interactive') {
    const triggerType = cc?.interactiveConfig?.triggerType || 'click';
    const currentImageIdx = slot.imageIndex ?? 0;
    const customForImage = getCustomForImageIndex(currentImageIdx);
    const interactiveImgStyles = getImageStylesUtil(customForImage);
    const interactiveBgStyles = getBackgroundStylesOnly(customForImage);
    const interactiveBadge = customForImage && renderCustomBadgeUtil(customForImage, frameConfig);
    const interactiveHoverClass = getHoverEffectClass(customForImage);
    const interactiveHoverVars = getHoverEffectVarsUtil(customForImage);
    const interactiveFrameStyles = getCustomFrameStylesUtil(customForImage);

    // ⭐ Extraire la config interactive avec des valeurs par défaut
    const interactiveCfg = cc?.interactiveConfig || {};

    return (
      <>
        <div
          className={`relative cursor-pointer w-full group ${interactiveHoverClass}`}
          style={{ ...slotBoxStyle, overflow: 'visible', ...interactiveHoverVars }}
          onClick={() => triggerType === 'click' && setOverlayOpen(true)}
          onMouseEnter={() => triggerType === 'hover' && setOverlayOpen(true)}
          onMouseLeave={() => triggerType === 'hover' && setOverlayOpen(false)}
        >
          <div className="relative w-full h-full overflow-hidden transition-colors duration-300" style={{ borderRadius: frameConfig.borderRadius, ...interactiveFrameStyles, ...interactiveBgStyles }}>
            {isCarousel && product ? (
              <ProductCarousel
                images={allImages} productName={displayName} frameConfig={frameConfig} carouselConfig={carCfg} autoPlay
                imageCrops={imageCropsMap} slideCustomizations={slideCustomizationsMap}
                slotId={slot.id} namespace="shop"
              />
            ) : displayImage ? (
              <div style={interactiveImgStyles} className="w-full h-full relative">
                <Image src={displayImage} alt={displayName} fill className="object-cover" unoptimized style={{ backgroundColor: 'transparent', ...imageCropsMap[slot.imageIndex ?? 0] }} />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50">
                <div className="text-3xl mb-1">{frameConfig.icon}</div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            {interactiveBadge}
          </div>
        </div>

        {overlayOpen && (
          <>
            <div
              className="fixed inset-0 z-[999]"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: `blur(${interactiveCfg.overlayBlur ?? 4}px)` }}
              onClick={() => setOverlayOpen(false)}
            />
            <div
              className={`fixed z-[1000] ${entranceClass}`}
              style={{
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: `${Math.min(cellWidth * 1.8, 480)}px`,
                height: `${Math.min(cellWidth * 1.8, 480) * (ar2 / ar1)}px`,
                borderRadius: frameConfig.borderRadius === '50%' ? '16px' : frameConfig.borderRadius,
                overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                animation: entranceClass ? undefined : 'interactiveSlotIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                ...interactiveFrameStyles, ...interactiveBgStyles, ...entranceStyle,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="relative w-full" style={{ height: `${Math.min(cellWidth * 1.8, 480) * (ar2 / ar1)}px`, overflow: 'hidden' }}>
                {isCarousel && product ? (
                  <ProductCarousel
                    images={allImages} productName={displayName}
                    frameConfig={{ ...frameConfig, borderRadius: frameConfig.borderRadius === '50%' ? '16px 16px 0 0' : `${frameConfig.borderRadius} ${frameConfig.borderRadius} 0 0` }}
                    carouselConfig={{ ...carCfg, showArrows: true, showDots: true }} autoPlay
                    imageCrops={imageCropsMap} slideCustomizations={slideCustomizationsMap}
                    slotId={`${slot.id}-overlay`} namespace="shop"
                  />
                ) : displayImage ? (
                  <div style={interactiveImgStyles} className="w-full h-full relative">
                    <Image src={displayImage} alt={displayName} fill className="object-cover" unoptimized style={{ ...imageCropsMap[slot.imageIndex ?? 0] }} />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                    <div className="text-5xl">{frameConfig.icon}</div>
                  </div>
                )}
                {interactiveBadge}
              </div>
              <button onClick={() => setOverlayOpen(false)} className="absolute top-2 right-2 z-20 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors shadow-md">
                <FiX size={14} />
              </button>
              {(() => {
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
                    {interactiveCfg.showNameOnClick !== false && (
                      <div style={getStyle(interactiveCfg.namePosition || 'bottom-left')}>
                        <div className="font-semibold text-sm line-clamp-2" style={{
                          fontFamily: interactiveCfg.nameFont || props.productNameFont || 'Inter',
                          fontSize: interactiveCfg.nameFontSize ? `${interactiveCfg.nameFontSize}px` : '14px',
                          fontWeight: interactiveCfg.nameFontWeight || props.productNameWeight || '600',
                          color: interactiveCfg.nameColor || '#FFFFFF',
                        }}>
                          {displayName}
                        </div>
                      </div>
                    )}
                    {interactiveCfg.showPriceOnClick !== false && displayPrice != null && (
                      <div style={getStyle(interactiveCfg.pricePosition || 'bottom-left')}>
                        <div className="font-bold" style={{
                          fontFamily: interactiveCfg.priceFont || props.priceFont || 'Inter',
                          fontSize: interactiveCfg.priceFontSize ? `${interactiveCfg.priceFontSize}px` : '15px',
                          fontWeight: interactiveCfg.priceFontWeight || props.priceWeight || '700',
                          color: interactiveCfg.priceColor || '#FFFFFF',
                        }}>
                          {displayPrice} €
                        </div>
                      </div>
                    )}
                    {interactiveCfg.showDescriptionOnClick && product?.description && (
                      <div style={getStyle(interactiveCfg.descriptionPosition || 'bottom-center')}>
                        <p className="text-xs line-clamp-2" style={{ color: '#FFFFFF' }}>{product.description}</p>
                      </div>
                    )}
                    {interactiveCfg.showAddToCart !== false && product && (
                      <div style={getStyle(interactiveCfg.buttonPosition || 'bottom-right')}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors shadow-md whitespace-nowrap"
                        >
                          {interactiveCfg.cartButtonText || 'Ajouter au panier'}
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

  // ── MODE TRADITIONNEL ──
  // ⭐ Utiliser tradConfig avec des valeurs par défaut sécurisées
  const showName = tradConfig.showName !== false;
  const showPrice = tradConfig.showPrice !== false;
  const showAddToCart = tradConfig.showAddToCart !== false;
  const buttonStyle = tradConfig.buttonStyle || 'primary';

  return (
    <div className="relative group w-full" style={{ height: 'auto' }}>
      <div className={`relative w-full ${hoverClass}`} style={{ borderRadius: frameConfig.borderRadius, ...hoverVars }}>
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: frameConfig.borderRadius, width: '100%', ...slotBoxStyle,
            transition: 'background 0.3s ease', ...frameStyles,
            ...(isCarousel ? {} : getBackgroundStylesOnly(effectiveCustom)),
          }}
        >
          {isCarousel && product ? (
            <ProductCarousel
              images={allImages} productName={displayName} frameConfig={frameConfig} carouselConfig={carCfg} autoPlay
              imageCrops={imageCropsMap} slideCustomizations={slideCustomizationsMap}
              slotId={slot.id} namespace="shop"
            />
          ) : (
            <div style={getImageStylesUtil(effectiveCustom)} className="w-full h-full">
              {displayImage ? (
                <Image src={displayImage} alt={displayName} fill className="object-cover" unoptimized style={{ backgroundColor: 'transparent', ...imageCropsMap[slot.imageIndex ?? 0] }} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50">
                  <div className="text-3xl mb-1">{frameConfig.icon}</div>
                </div>
              )}
            </div>
          )}
          {effectiveCustom && renderCustomBadgeUtil(effectiveCustom, frameConfig)}
        </div>
      </div>
      <div className={`mt-2 text-center ${entranceClass}`} style={entranceStyle}>
        {showName && (
          <h3 className="font-semibold text-sm line-clamp-2" style={{
            fontFamily: tradConfig.nameFont || props.productNameFont || 'Inter',
            fontSize: tradConfig.nameFontSize ? `${tradConfig.nameFontSize}px` : (props.productNameSize || '14px'),
            fontWeight: tradConfig.nameFontWeight || props.productNameWeight || '600',
            color: tradConfig.nameColor || props.productNameColor || '#1F2937',
          }}>
            {displayName}
          </h3>
        )}
        {showPrice && displayPrice != null && (
          <p className="font-bold mt-1" style={{
            fontFamily: tradConfig.priceFont || props.priceFont || 'Inter',
            fontSize: tradConfig.priceFontSize ? `${tradConfig.priceFontSize}px` : (props.priceSize || '14px'),
            fontWeight: tradConfig.priceFontWeight || props.priceWeight || '700',
            color: tradConfig.priceColor || props.priceColor || '#2563EB',
          }}>
            {displayPrice} €
          </p>
        )}
        {showAddToCart && product && (
          <button
            onClick={() => onAddToCart?.(product)}
            className={`mt-2 w-full text-xs py-1.5 rounded transition-colors ${
              buttonStyle === 'outline' ? 'border border-gray-800 hover:bg-gray-100'
              : buttonStyle === 'text' ? 'text-primary hover:underline'
              : 'bg-primary text-white hover:bg-primary/80'
            }`}
          >
            Ajouter au panier
          </button>
        )}
      </div>
    </div>
  );
}