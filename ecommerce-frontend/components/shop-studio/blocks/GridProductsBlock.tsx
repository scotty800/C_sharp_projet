'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { FiPlus, FiTrash2, FiEdit2, FiGrid, FiX, FiImage, FiStar, FiAward, FiZap, FiDroplet, FiLayers, FiClock, FiEye } from 'react-icons/fi';
import { ProductGridConfig, StudioProduct, ProductGridSlot, ProductCustomization } from '@/types/studio';
import ProductDetailBar from '../ProductDetailBar';

// ⭐ IMPORTS DEPUIS LE FICHIER SHARED
import {
  animationStyles,
  useInjectGridStyles,
  DEFAULT_CUSTOMIZATION,
  FRAME_STYLE_CONFIG,
  getModeIcon,
  getSlideCustomization,
  getHoverEffectClass,
  getCustomFrameStylesUtil,
  getImageStylesUtil,
  getHoverEffectVarsUtil,
  getEntranceAnimationClassUtil,
  getEntranceAnimationStyleUtil,
  renderCustomBadgeUtil,
  getBackgroundStylesOnly,
  getImageCropStyle,
  computeSlotGeometry,
  ProductCarousel,
} from './productGrid/shared';

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
  onOpenCustomization?: (productId: number, productName: string, customization: ProductCustomization, slideCount?: number) => void;
  globalProductCustomizations?: Map<number, ProductCustomization>;
  onUpdateGlobalProductCustomization?: (productId: number, updates: Partial<ProductCustomization>) => void;
  onUpdateSlotConfig?: (slotId: string, config: Partial<ProductGridSlot>) => void;
  // ⭐ NOUVELLE PROP
  onHeightChange?: (height: number) => void;
}

const DEFAULT_DIMENSION = { width: 800, height: 400, widthUnit: 'px' as const, heightUnit: 'px' as const };
const DEFAULT_UNIFORM_SIZE = { enabled: false, width: 200, height: 200 };

const SlotContent = ({
  slot, containerWidth, columns, gap, gridPadding, isSelected, onSelect, onOpenCustomization,
  onUpdateSlotConfig, onLinkProduct, onOpenAssetPicker, props, productCustomizations, allProducts,
  loadingProducts, setEditingSlot, setShowSlotEditor, setCustomTitle, setCustomImageUrl,
  setActiveTab, clearSlot, getProductCustomization, getSlotProduct, getDisplayImageForSlot, getAllProductImages
}: any) => {
  const [localOverlay, setLocalOverlay] = useState(false);
  
  const product = getSlotProduct(slot);
  const cc = slot.customConfig as any;
  const hasCustom = cc?.customTitle || cc?.customImage;
  const isEmpty = !product && !hasCustom;
  const productCustom = product ? getProductCustomization(product.id) : null;
  const allImages = getAllProductImages(product);
  const currentImageIndex = (slot.carouselConfig as any)?.currentImageIndex ?? 0;

  const effectiveCustom = getSlideCustomization(productCustom, currentImageIndex) || productCustom;

  const frameStyle = slot.frameStyle || 'square';
  const frameConfig = FRAME_STYLE_CONFIG[frameStyle as keyof typeof FRAME_STYLE_CONFIG] || FRAME_STYLE_CONFIG.square;

  const displayName = cc?.customTitle || product?.name || 'Sans titre';
  const displayPrice = product?.price;
  const displayImage = getDisplayImageForSlot(slot);
  const carCfg = slot.carouselConfig;
  const isCarousel = carCfg?.enabled && allImages.length > 1;

  const frameStyles = getCustomFrameStylesUtil(effectiveCustom);
  const imgStyles = getImageStylesUtil(effectiveCustom);
  const bgStyles = getBackgroundStylesOnly(effectiveCustom);
  const hoverClass = getHoverEffectClass(effectiveCustom);
  const hoverVars = getHoverEffectVarsUtil(effectiveCustom);
  const entranceClass = getEntranceAnimationClassUtil(effectiveCustom);
  const entranceStyle = getEntranceAnimationStyleUtil(effectiveCustom);

  // ⭐ UTILISATION DE computeSlotGeometry À LA PLACE DU CALCUL LOCAL
  const rowSpan = slot.gridPosition.rowSpan || 1;
  const colSpan = slot.gridPosition.colSpan || 1;
  
  const { slotBoxStyle, cellWidth, ar1, ar2 } = computeSlotGeometry(
    containerWidth,
    columns,
    gap,
    gridPadding,
    frameConfig,
    rowSpan,
    colSpan
  );
  
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

  const slideCustomizationsMap = useMemo((): Record<number, ProductCustomization | null> => {
    if (!productCustom) return {};
    const map: Record<number, ProductCustomization | null> = {};
    for (let idx = 0; idx < allImages.length; idx++) {
      map[idx] = getSlideCustomization(productCustom, idx);
    }
    return map;
  }, [
    productCustom,
    allImages.length,
    JSON.stringify(productCustom?.slidesConfig),
  ]);

  const getCustomForImageIndex = useCallback((imageIdx: number) => {
    const imageCustom = getSlideCustomization(productCustom, imageIdx);
    return imageCustom || productCustom;
  }, [productCustom]);

  const ActionButtons = ({ showCustomize = true }: { showCustomize?: boolean }) => (
    <div className="absolute top-2 right-2 flex gap-1 z-50" style={{ pointerEvents: 'auto' }}>
      {showCustomize && product && (
        <button onClick={(e) => { 
          e.stopPropagation(); 
          const slideCount = allImages.length;
          onOpenCustomization?.(product.id, product.name, getProductCustomization(product.id), slideCount);
        }} 
        className="p-1.5 bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition-colors" 
        title="Personnaliser">
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
      <div className="relative overflow-hidden" style={{ position: 'relative', borderRadius: frameConfig.borderRadius, width: '100%', ...slotBoxStyle, transition: 'background 0.3s ease', ...frameStyles }}>
        {children}
      </div>
      {showActions && <div className="absolute inset-0" style={{ borderRadius: frameConfig.borderRadius }} />}
    </div>
  );

  if (isEmpty) {
    return (
      <div className="relative cursor-pointer group transition-transform hover:scale-[1.02] duration-200 w-full"
        style={{ ...slotBoxStyle, borderRadius: frameConfig.borderRadius, backgroundColor: 'transparent', border: '2px dashed rgba(156,163,175,0.5)' }}
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

  // MODE INTERACTIF
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

    const handleToggle = () => {
      if (triggerType === 'click') {
        onSelect?.();
        setLocalOverlay(true);
      }
    };

    return (
      <>
        <div
          className={`relative cursor-pointer w-full group ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''} ${interactiveHoverClass}`}
          style={{ ...slotBoxStyle, overflow: 'visible', ...interactiveHoverVars }}
          onClick={handleToggle}
          onMouseEnter={() => triggerType === 'hover' && setLocalOverlay(true)}
          onMouseLeave={() => triggerType === 'hover' && setLocalOverlay(false)}
        >
          <div 
            className="relative w-full h-full overflow-hidden transition-colors duration-300" 
            style={{ 
              borderRadius: frameConfig.borderRadius,
              ...interactiveFrameStyles,
              ...interactiveBgStyles 
            }}
          >
            {isCarousel && product ? (
              <ProductCarousel
                images={allImages}
                productName={displayName}
                frameConfig={frameConfig}
                carouselConfig={carCfg}
                autoPlay={true}
                onImageChange={(i) => {
                  onUpdateSlotConfig?.(slot.id, { 
                    carouselConfig: { ...carCfg, currentImageIndex: i } 
                  });
                }}
                imageCrops={imageCropsMap}
                slideCustomizations={slideCustomizationsMap}
                slotId={slot.id}
              />
            ) : displayImage ? (
              <div style={interactiveImgStyles} className="w-full h-full relative">
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

            {interactiveBadge}
          </div>

          {isSelected && <ActionButtons />}
        </div>

        {localOverlay && (
          <>
            <div
              className="fixed inset-0 z-[999]"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: `blur(${cc?.interactiveConfig?.overlayBlur ?? 4}px)` }}
              onClick={() => setLocalOverlay(false)}
            />
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
                ...interactiveFrameStyles,
                ...interactiveBgStyles,
                ...entranceStyle,
              }}
              onClick={(e) => e.stopPropagation()}
            >
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
                    onImageChange={(i) => {
                      onUpdateSlotConfig?.(slot.id, { 
                        carouselConfig: { ...carCfg, currentImageIndex: i } 
                      });
                    }}
                    imageCrops={imageCropsMap}
                    slideCustomizations={slideCustomizationsMap}
                    slotId={`${slot.id}-overlay`}
                  />
                ) : displayImage ? (
                  <div style={interactiveImgStyles} className="w-full h-full relative">
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
                {interactiveBadge}
              </div>
              <button
                onClick={() => setLocalOverlay(false)}
                className="absolute top-2 right-2 z-20 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors shadow-md"
              >
                <FiX size={14} />
              </button>
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

  // BLOC TRADITIONNEL AVEC CARROUSEL
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
            onImageChange={(i) => {
              onUpdateSlotConfig?.(slot.id, { 
                carouselConfig: { ...carCfg, currentImageIndex: i } 
              });
            }}
            imageCrops={imageCropsMap}
            slideCustomizations={slideCustomizationsMap}
            slotId={slot.id}
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm flex gap-1 z-20">
            <span>📦</span><span>{frameConfig.icon}</span><span>🎠</span>
          </div>
          {effectiveCustom && renderCustomBadgeUtil(effectiveCustom, frameConfig)}
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

  // BLOC TRADITIONNEL PAR DÉFAUT
  const tradConfig = slot.customConfig?.traditionalConfig || {};
  
  const currentImageIdx = slot.imageIndex ?? 0;
  const currentImageCustom = getSlideCustomization(productCustom, currentImageIdx);
  const effectiveForDisplay = currentImageCustom || productCustom;

  const displayImgStyles = getImageStylesUtil(effectiveForDisplay);
  const displayFrameStyles = getCustomFrameStylesUtil(effectiveForDisplay);
  const displayBgStyles = getBackgroundStylesOnly(effectiveForDisplay);
  const displayHoverClass = getHoverEffectClass(effectiveForDisplay);
  const displayHoverVars = getHoverEffectVarsUtil(effectiveForDisplay);
  const displayBadge = effectiveForDisplay && renderCustomBadgeUtil(effectiveForDisplay, frameConfig);

  return (
    <div className="relative group w-full" style={{ height: 'auto' }}>
      <div className={`relative w-full ${displayHoverClass}`} style={{ borderRadius: frameConfig.borderRadius, ...displayHoverVars }}>
        <div className="relative overflow-hidden" style={{ position: 'relative', borderRadius: frameConfig.borderRadius, width: '100%', ...slotBoxStyle, transition: 'background 0.3s ease', ...displayFrameStyles, ...displayBgStyles }}>
          <div style={displayImgStyles} className="w-full h-full">
            {displayImage
              ? <Image 
                  src={displayImage} 
                  alt={displayName} 
                  fill 
                  className="object-cover" 
                  unoptimized 
                  style={{ backgroundColor: 'transparent', ...imageCropsMap[slot.imageIndex ?? 0] }} 
                />
              : <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50">
                  <div className="text-3xl mb-1">{frameConfig.icon}</div>
                  <span className="text-xs text-gray-500">Aucune image</span>
                </div>
            }
          </div>
          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm flex gap-1 z-20">
            <span>{getModeIcon(slot.displayMode)}</span><span>{frameConfig.icon}</span>
            {slot.imageIndex != null && <span className="ml-1">📷{slot.imageIndex + 1}</span>}
          </div>
          {displayBadge}
        </div>
        {isSelected && <ActionButtons />}
      </div>
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
    </div>
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

// ⭐⭐⭐ COMPOSANT PRINCIPAL ⭐⭐⭐
function GridProductsBlock({
  shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1, isResizing = false,
  onOpenAssetPicker, gridConfig: externalGridConfig, onUpdateGridConfig,
  productsList: externalProductsList = [], onLinkProduct, onUpdateProductCustomization,
  onOpenCustomization, globalProductCustomizations: externalProductCustomizations,
  onUpdateGlobalProductCustomization, onUpdateSlotConfig,
  onHeightChange, // ⭐ NOUVELLE PROP
}: Props) {
  // ⭐ INJECTION DES STYLES AVEC useInjectGridStyles
  useInjectGridStyles();

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

  // ⭐⭐⭐ ÉTATS POUR LE MENU CONTEXTUEL ET LE POPUP D'ÉDITION ⭐⭐⭐
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    product: any;
    slotId: string;
  } | null>(null);
  
  // ⭐ État pour le popup central
  const [editingProductData, setEditingProductData] = useState<{
    product: StudioProduct;
    slot: ProductGridSlot;
  } | null>(null);

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

  const refresh = useCallback(() => {
    forceUpdate(p => p + 1);
  }, []);
  const onUpdateGridConfigRef = useRef(onUpdateGridConfig);
  useEffect(() => { onUpdateGridConfigRef.current = onUpdateGridConfig; }, [onUpdateGridConfig]);

  // ⭐⭐⭐ FONCTIONS POUR L'AFFICHAGE DES IMAGES ⭐⭐⭐

  const getSlotProduct = useCallback((slot: ProductGridSlot) => {
    if (slot.linkedProduct) return slot.linkedProduct;
    if (slot.productId) return allProducts.find(p => p.id === slot.productId);
    return null;
  }, [allProducts]);

  const getAllProductImages = useCallback((product: StudioProduct | null | undefined): string[] => {
    if (!product) return [];
    const images = [];
    if (product.imageUrl1) images.push(product.imageUrl1);
    if (product.imageUrl2) images.push(product.imageUrl2);
    if (product.imageUrl3) images.push(product.imageUrl3);
    return images;
  }, []);

  const getDisplayImageForSlot = useCallback((slot: ProductGridSlot) => {
    const product = getSlotProduct(slot);
    const cc = slot.customConfig as any;
    if (!product) return cc?.customImage || null;
    const imageIndex = slot.imageIndex;
    if (imageIndex === 0 && product.imageUrl1) return product.imageUrl1;
    if (imageIndex === 1 && product.imageUrl2) return product.imageUrl2;
    if (imageIndex === 2 && product.imageUrl3) return product.imageUrl3;
    return product.imageUrl1 || product.imageUrl2 || product.imageUrl3 || null;
  }, [getSlotProduct]);

  const getProductCustomization = useCallback((productId: number): ProductCustomization => {
    return productCustomizations.get(productId) || { ...DEFAULT_CUSTOMIZATION };
  }, [productCustomizations]);

  // ⭐⭐ GESTION DU MENU CONTEXTUEL (CLIC DROIT) ⭐⭐
  const handleProductContextMenu = useCallback((e: React.MouseEvent, product: any, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const x = e.clientX;
    const y = e.clientY;
    
    const menuWidth = 170;
    const menuHeight = 50;
    const padding = 10;
    
    let finalX = x;
    let finalY = y;
    
    if (x + menuWidth > window.innerWidth - padding) {
      finalX = x - menuWidth;
    }
    if (finalX < padding) {
      finalX = padding;
    }
    
    if (y + menuHeight > window.innerHeight - padding) {
      finalY = y - menuHeight;
    }
    if (finalY < padding) {
      finalY = padding;
    }
    
    setContextMenu({
      visible: true,
      x: finalX,
      y: finalY,
      product,
      slotId
    });
  }, []);

  // Fermer le menu contextuel au clic ailleurs
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // ⭐⭐ OUVERTURE DU POPUP D'ÉDITION ⭐⭐
  const openProductEditor = useCallback((product: any, slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (slot && product) {
      setEditingProductData({ product, slot });
    }
    setContextMenu(null);
  }, [slots]);

  // Fermer le popup
  const closeProductEditor = useCallback(() => {
    setEditingProductData(null);
  }, []);

  // ⭐⭐⭐ FONCTION CORRIGÉE - Mise à jour produit avec synchronisation complète ⭐⭐⭐
  const handleUpdateProduct = useCallback(async (productId: number, updates: Partial<StudioProduct>) => {
    try {
      const currentProduct = allProducts.find(p => p.id === productId);
      if (!currentProduct) {
        console.error('❌ Impossible de trouver le produit actuel dans allProducts');
        return;
      }
      
      const updateData: any = {
        name: updates.name !== undefined ? updates.name : currentProduct.name,
        price: updates.price !== undefined ? updates.price : currentProduct.price,
        category: updates.category !== undefined ? updates.category : (currentProduct.category || 'Non catégorisé'),
        description: updates.description !== undefined ? updates.description : (currentProduct.description || ''),
        stock: updates.stock !== undefined ? updates.stock : (currentProduct.stock || 0),
      };
      
      if (updates.sizes !== undefined) {
        updateData.sizes = Array.isArray(updates.sizes) ? updates.sizes : [];
      } else if (currentProduct.sizes && currentProduct.sizes.length > 0) {
        updateData.sizes = currentProduct.sizes;
      }
      
      if (updates.colors !== undefined) {
        if (Array.isArray(updates.colors)) {
          if (updates.colors.length > 0 && typeof updates.colors[0] === 'object' && 'value' in updates.colors[0]) {
            updateData.colors = updates.colors.map((c: any) => c.value);
          } else {
            updateData.colors = updates.colors;
          }
        } else {
          updateData.colors = [];
        }
      } else if (currentProduct.colors && currentProduct.colors.length > 0) {
        updateData.colors = currentProduct.colors;
      }
      
      if (updates.imageUrl1 !== undefined) updateData.imageUrl1 = updates.imageUrl1;
      if (updates.imageUrl2 !== undefined) updateData.imageUrl2 = updates.imageUrl2;
      if (updates.imageUrl3 !== undefined) updateData.imageUrl3 = updates.imageUrl3;
      
      const { productService } = await import('@/services/api/products');
      const updatedProduct = await productService.updateProduct(productId, updateData);
      
      const updatedProductData = { ...currentProduct, ...updates, sizes: updateData.sizes || currentProduct.sizes, colors: updateData.colors || currentProduct.colors };
      
      setEditingProductData(prev => {
        if (!prev) return prev;
        return { ...prev, product: updatedProductData };
      });
      
      const updatedSlots = slots.map(slot => {
        if (slot.linkedProduct?.id === productId) {
          return { ...slot, linkedProduct: updatedProductData };
        }
        return slot;
      });
      
      if (onUpdateGridConfig && gridConfig) {
        onUpdateGridConfig({ ...gridConfig, slots: updatedSlots });
      }
      
      window.dispatchEvent(new CustomEvent('productUpdated', { 
        detail: { productId, updates: updatedProductData, timestamp: Date.now() }
      }));
      
      window.dispatchEvent(new CustomEvent('productDataChanged', { 
        detail: { productId, updates: updatedProductData }
      }));

      window.dispatchEvent(new CustomEvent('productsListChanged', { 
        detail: { productId, updates: updatedProductData, timestamp: Date.now() }
      }));
      
      window.dispatchEvent(new CustomEvent('refreshProducts'));
      
      refresh();
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du produit:', error);
    }
  }, [slots, gridConfig, onUpdateGridConfig, refresh, allProducts]);

  // ⭐⭐⭐ Écouter les changements de produits pour mettre à jour les slots ⭐⭐⭐
  useEffect(() => {
    const handleProductDataChanged = (event: CustomEvent) => {
      const { productId, updates } = event.detail;
      
      let hasChanges = false;
      const updatedSlots = slots.map(slot => {
        if (slot.linkedProduct && slot.linkedProduct.id === productId) {
          hasChanges = true;
          return {
            ...slot,
            linkedProduct: { ...slot.linkedProduct, ...updates }
          };
        }
        return slot;
      });
      
      if (hasChanges && onUpdateGridConfig && gridConfig) {
        onUpdateGridConfig({ ...gridConfig, slots: updatedSlots });
        refresh();
      }
    };
    
    window.addEventListener('productDataChanged', handleProductDataChanged as EventListener);
    return () => window.removeEventListener('productDataChanged', handleProductDataChanged as EventListener);
  }, [slots, gridConfig, onUpdateGridConfig, refresh]);

  // ⭐⭐⭐ FIX: Refs stables pour ne jamais redéclencher le ResizeObserver inutilement ⭐⭐⭐
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  const onHeightChangeRef = useRef(onHeightChange);
  useEffect(() => { onHeightChangeRef.current = onHeightChange; }, [onHeightChange]);

  // Dernière hauteur de LAYOUT mesurée (contentRect, jamais affectée par le zoom CSS)
  const lastContentRectHeightRef = useRef<number | null>(null);

  const reportHeight = useCallback((h: number) => {
    if (lastReportedHeightRef.current != null && Math.abs(h - lastReportedHeightRef.current) <= 2) return;
    lastReportedHeightRef.current = h;
    if (onHeightChangeRef.current) onHeightChangeRef.current(h);
    else onUpdateRef.current?.({ _blockHeight: h });
  }, []);

  // ⭐⭐⭐ Un seul ResizeObserver, monté une seule fois pour la durée de vie du bloc.
  // Pas besoin de le recréer quand slots/columns changent : le ResizeObserver
  // détecte tout changement de taille du conteneur, quelle qu'en soit la cause.
  useEffect(() => {
    if (!containerRef.current) return;
    let rafId: number | null = null;

    const flush = () => {
      rafId = null;
      const h = lastContentRectHeightRef.current;
      if (h == null || isResizingRef.current) return;
      reportHeight(h);
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // contentRect = taille de LAYOUT, insensible au transform:scale() du zoom Studio
        lastContentRectHeightRef.current = entry.contentRect.height;
        if (rafId == null) rafId = requestAnimationFrame(flush);
      }
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [reportHeight]);

  // Une fois le resize manuel terminé : on republie la DERNIÈRE valeur connue
  // du ResizeObserver (jamais getBoundingClientRect, faussé par le zoom).
  const prevIsResizingRef = useRef(isResizing);
  useEffect(() => {
    const wasResizing = prevIsResizingRef.current;
    prevIsResizingRef.current = isResizing;
    if (wasResizing && !isResizing && lastContentRectHeightRef.current != null) {
      lastReportedHeightRef.current = null; // force la republication même si valeur identique
      reportHeight(lastContentRectHeightRef.current);
    }
  }, [isResizing, reportHeight]);

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

  // ⭐⭐⭐ FIX FLUIDITÉ #1 ⭐⭐⭐
  useEffect(() => {
    if (!containerRef.current) return;
    let rafId: number | null = null;
    let pendingWidth: number | null = null;

    const applyWidth = () => {
      rafId = null;
      if (pendingWidth == null) return;
      if (Math.abs(pendingWidth - containerWidthRef.current) > 0.5) {
        containerWidthRef.current = pendingWidth;
        forceContainerUpdate(p => p + 1);
      }
      pendingWidth = null;
    };

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        pendingWidth = entry.contentRect.width;
        if (rafId == null) rafId = requestAnimationFrame(applyWidth);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => { return () => { if (reportTimer.current) clearTimeout(reportTimer.current); }; }, []);

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

  const handleLinkProduct = useCallback((slotId: string, product: StudioProduct) => {
    if (onLinkProduct) onLinkProduct(slotId, product);
    else updateSlots(slots.map((s: ProductGridSlot) => s.id === slotId ? { ...s, productId: product.id, linkedProduct: product, customConfig: undefined, imageIndex: null } : s));
    setShowSlotEditor(false); setEditingSlot(null); setCustomTitle(''); setCustomImageUrl(''); setProductSearch('');
    refresh();
  }, [slots, onLinkProduct, updateSlots, refresh]);

  const clearSlot = useCallback((slotId: string) => {
    if (onLinkProduct) onLinkProduct(slotId, {} as StudioProduct);
    else updateSlots(slots.map((s: ProductGridSlot) => s.id === slotId ? { ...s, productId: null, linkedProduct: undefined, customConfig: undefined, imageIndex: null } : s));
    refresh();
  }, [slots, onLinkProduct, updateSlots, refresh]);

  const addCustomToSlot = useCallback((slotId: string) => {
    if (!customTitle && !customImageUrl) return;
    updateSlots(slots.map((s: ProductGridSlot) => s.id === slotId ? { ...s, productId: null, linkedProduct: undefined, customConfig: { ...s.customConfig, customTitle: customTitle || undefined, customImage: customImageUrl || undefined }, imageIndex: null } : s));
    setShowSlotEditor(false); setEditingSlot(null); setCustomTitle(''); setCustomImageUrl('');
    refresh();
  }, [slots, customTitle, customImageUrl, updateSlots, refresh]);

  const getSlotSizeStyle = useCallback((slot: ProductGridSlot): React.CSSProperties => {
    const customSize = slot.customSize;
    if (customSize) {
      const style: React.CSSProperties = {};
      style.width = customSize.widthUnit === 'auto' ? 'auto' : `${customSize.width}px`;
      style.height = customSize.heightUnit === 'auto' ? 'auto' : `${customSize.height}px`;
      return style;
    }
    if (currentUniformSize.enabled) return { width: `${currentUniformSize.width}px`, height: `${currentUniformSize.height}px` };
    return { width: '100%', height: '100%' };
  }, [currentUniformSize]);

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
                          {p.imageUrl1 ? 
                            <Image src={p.imageUrl1} alt={p.name} fill className="object-cover" unoptimized /> : 
                            <div className="w-full h-full flex items-center justify-center text-gray-500">📷</div>
                          }
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

  const GHOST_CELL_ASPECT_RATIO = FRAME_STYLE_CONFIG.square.aspectRatio;

  useEffect(() => {
    setEmptyHoveredCell(null);
    setDraggedSlotId(null);
    activeDragRef.current = null;
  }, [columns, rows]);

  const POPUP_SLOT_WIDTH = 260;

  const getPopupSlotStyles = useMemo(() => {
    if (!editingProductData) return { width: POPUP_SLOT_WIDTH, height: POPUP_SLOT_WIDTH, borderRadius: '8px' };
    const frameStyle = editingProductData.slot.frameStyle || 'square';
    const frameConfig = FRAME_STYLE_CONFIG[frameStyle as keyof typeof FRAME_STYLE_CONFIG] || FRAME_STYLE_CONFIG.square;
    const [ar1, ar2] = frameConfig.aspectRatio.split('/').map(Number);
    const popupHeight = POPUP_SLOT_WIDTH * (ar2 / ar1);
    return {
      width: POPUP_SLOT_WIDTH,
      height: popupHeight,
      borderRadius: frameConfig.borderRadius,
    };
  }, [editingProductData]);

  const normalizedPopupSlot = useMemo(() => {
    if (!editingProductData) return null;
    return {
      ...editingProductData.slot,
      gridPosition: {
        ...editingProductData.slot.gridPosition,
        rowSpan: 1,
        colSpan: 1,
      },
      customSize: undefined,
    };
  }, [editingProductData]);

  const getPopupFrameBorderRadius = useMemo(() => {
    if (!editingProductData) return '8px';
    const frameStyle = editingProductData.slot.frameStyle || 'square';
    const frameConfig = FRAME_STYLE_CONFIG[frameStyle as keyof typeof FRAME_STYLE_CONFIG] || FRAME_STYLE_CONFIG.square;
    return frameConfig.borderRadius;
  }, [editingProductData]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative cursor-pointer w-full"
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
                    const product = getSlotProduct(slotAtPosition);
                    
                    return (
                      <div
                        key={`slot-node-${slotAtPosition.id}`}
                        id={`product-slot-${slotAtPosition.id}`}
                        draggable
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => handleSlotDragStart(e, slotAtPosition.id)}
                        onDragOver={handleSlotDragOver}
                        onDrop={(e) => handleSlotDrop(e, slotAtPosition.id)}
                        onDragEnd={handleSlotDragEnd}
                        onContextMenu={product ? (e) => handleProductContextMenu(e, product, slotAtPosition.id) : undefined}
                        className={`relative rounded-lg group select-none ${isBeingDragged ? 'opacity-40' : 'opacity-100'}`}
                        style={{
                          gridArea: `${slotAtPosition.gridPosition.row + 1} / ${slotAtPosition.gridPosition.col + 1} / span ${slotAtPosition.gridPosition.rowSpan || 1} / span ${slotAtPosition.gridPosition.colSpan || 1}`,
                          transition: isBeingDragged ? 'none' : 'opacity 0.15s ease',
                          cursor: activeDragRef.current ? 'grabbing' : 'grab',
                          overflow: 'visible',
                        }}
                      >
                        <div>
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
                        aspectRatio: GHOST_CELL_ASPECT_RATIO,
                        height: 'auto',
                        borderRadius: '8px',
                        border: isEmptyOver ? '2px dashed #8B5CF6' : '1.5px dashed rgba(156,163,175,0.25)',
                        background: isEmptyOver ? 'rgba(139, 92, 246, 0.08)' : 'rgba(156,163,175,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: activeDragRef.current ? 'move' : 'default',
                        transition: 'border-color 0.15s ease, background-color 0.15s ease',
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

      {/* ⭐⭐ MENU CONTEXTUEL (CLIC DROIT) - AVEC PORTAL ⭐⭐ */}
      {contextMenu && contextMenu.visible && createPortal(
        <div
          className="fixed z-[9999] bg-[#161722]/95 backdrop-blur-md border border-[#2d303f] rounded-lg shadow-2xl py-1.5 min-w-[170px] animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            top: contextMenu.y, 
            left: contextMenu.x,
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            onClick={() => openProductEditor(contextMenu.product, contextMenu.slotId)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-gray-200 hover:bg-[#4c249f] hover:text-white transition-colors group"
          >
            <FiEdit2 size={13} className="text-purple-400 group-hover:text-white transition-colors" />
            Modifier le produit
          </button>
        </div>,
        document.body
      )}

      {/* ⭐⭐ POPUP CENTRAL AVEC LE SLOT AGRANDI ET LA BARRE EN DESSOUS ⭐⭐ */}
      {editingProductData && onUpdateGlobalProductCustomization && typeof window !== 'undefined' && (
        createPortal(
          <>
            <div
              onClick={closeProductEditor}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99998,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
              }}
            />
            <div
              style={{
                position: 'fixed',
                zIndex: 99999,
                top: '38%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0px',
                maxHeight: '95vh',
              }}
              className="animate-in zoom-in-95 fade-in duration-200"
            >
              <div
                className="shadow-2xl overflow-hidden"
                style={{
                  ...getPopupSlotStyles,
                  border: '2px solid #7c3aed',
                  borderBottom: 'none',
                  borderRadius: `${getPopupFrameBorderRadius} ${getPopupFrameBorderRadius} 0 0`,
                  background: '#0a0a0f',
                  flexShrink: 0,
                }}
              >
                {normalizedPopupSlot && (
                  <SlotContent
                    slot={normalizedPopupSlot}
                    containerWidth={POPUP_SLOT_WIDTH}
                    columns={1}
                    gap={0}
                    gridPadding={0}
                    isSelected={false}
                    onSelect={() => {}}
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
                )}
              </div>

              <div style={{
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '10px solid #7c3aed',
                flexShrink: 0,
              }} />

              <div style={{ width: `${Math.max(getPopupSlotStyles.width || 260, 580)}px` }}>
                <ProductDetailBar
                  product={editingProductData.product}
                  customization={productCustomizations.get(editingProductData.product.id)}
                  onUpdateCustomization={(updates: Partial<ProductCustomization>) => {
                    onUpdateGlobalProductCustomization(editingProductData.product.id, updates);
                  }}
                  onUpdateProduct={(productId, updates) => {
                    handleUpdateProduct(productId, updates);
                  }}
                  onSave={() => {
                    closeProductEditor();
                  }}
                  onCancel={() => {
                    closeProductEditor();
                  }}
                />
              </div>
            </div>
          </>,
          document.documentElement
        )
      )}

      <SlotEditorModal />
    </>
  );
}

// ⭐⭐⭐ EXPORT AVEC MEMO CORRIGÉ POUR LES PERSONNALISATIONS ⭐⭐⭐
const MemoizedGridProductsBlock = React.memo(GridProductsBlock, (prevProps, nextProps) => {
  const prevCustoms = prevProps.globalProductCustomizations;
  const nextCustoms = nextProps.globalProductCustomizations;
  
  let customizationsChanged = false;
  if (prevCustoms !== nextCustoms) {
    if (prevCustoms && nextCustoms) {
      if (prevCustoms.size !== nextCustoms.size) {
        customizationsChanged = true;
      } else {
        for (const [key, value] of prevCustoms) {
          const nextValue = nextCustoms.get(key);
          if (JSON.stringify(value) !== JSON.stringify(nextValue)) {
            customizationsChanged = true;
            break;
          }
        }
      }
    } else if (prevCustoms || nextCustoms) {
      customizationsChanged = true;
    }
  }
  
  const gridConfigChanged =
    prevProps.gridConfig !== nextProps.gridConfig &&
    JSON.stringify(prevProps.gridConfig) !== JSON.stringify(nextProps.gridConfig);

  const productsListChanged =
    prevProps.productsList !== nextProps.productsList &&
    JSON.stringify(prevProps.productsList) !== JSON.stringify(nextProps.productsList);

  const slotsChanged =
    prevProps.gridConfig?.slots !== nextProps.gridConfig?.slots &&
    JSON.stringify(prevProps.gridConfig?.slots) !== JSON.stringify(nextProps.gridConfig?.slots);

  const blockPropsChanged =
    prevProps.block?.props !== nextProps.block?.props &&
    JSON.stringify(prevProps.block?.props) !== JSON.stringify(nextProps.block?.props);
  
  const otherPropsChanged = 
    prevProps.shop?.id !== nextProps.shop?.id ||
    prevProps.block?.id !== nextProps.block?.id ||
    blockPropsChanged ||
    prevProps.isSelected !== nextProps.isSelected ||
    prevProps.textOpacity !== nextProps.textOpacity ||
    prevProps.isResizing !== nextProps.isResizing ||
    gridConfigChanged ||
    productsListChanged;
  
  const shouldReRender = customizationsChanged || slotsChanged || otherPropsChanged;
  
  return !shouldReRender;
});

export { MemoizedGridProductsBlock as GridProductsBlock };
export default MemoizedGridProductsBlock;