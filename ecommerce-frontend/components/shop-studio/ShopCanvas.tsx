'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { BannerBlock } from '@/components/shop-studio/blocks/BannerBlock';
import { LogoBlock } from '@/components/shop-studio/blocks/LogoBlock';
import { TitleBlock } from '@/components/shop-studio/blocks/TitleBlock';
import { TextBlock } from '@/components/shop-studio/blocks/TextBlock';
import { ImageBlock } from '@/components/shop-studio/blocks/ImageBlock';
import { ButtonBlock } from '@/components/shop-studio/blocks/ButtonBlock';
import { SpacerBlock } from '@/components/shop-studio/blocks/SpacerBlock';
import { ShapeBlock } from '@/components/shop-studio/blocks/ShapeBlock';
import { FrameBlock } from '@/components/shop-studio/blocks/FrameBlock';
import { ScreenBannerBlock } from '@/components/shop-studio/blocks/ScreenBannerBlock';
import { CarouselBannerBlock } from '@/components/shop-studio/blocks/CarouselBannerBlock';
import ShopProductGrid from './blocks/ShopProductGrid';
import { BlockUI, ProductCustomization, StudioProduct, NavLinkTarget } from '@/types/studio';
import { useBlockAnimation } from '@/hooks/useBlockAnimation';
import type { BlockAnimationsConfig } from '@/types/animations';
// ⭐ NOUVEAU IMPORT
import {
  resolveProductDisplay,
  getResolvedImages,
  getBoundFieldImageIndex,
} from '@/components/shop-studio/lib/resolveProductVariant';
// ⭐ NOUVEAU IMPORT
import toast from 'react-hot-toast';

const STUDIO_FRAME_WIDTH = 1200;
const noop = () => {};

function AnimatedBlock({
  blockId,
  animationsConfig,
  style,
  children,
  className,
  onClick,
}: {
  blockId: string;
  animationsConfig?: BlockAnimationsConfig | null;
  style: React.CSSProperties;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler;
}) {
  const { setRef } = useBlockAnimation({
    blockId,
    config: animationsConfig ?? null,
    context: 'shop',
    studioMode: false,
  });

  return (
    <div 
      ref={setRef as any} 
      style={style} 
      className={className} 
      onClick={(e) => {
        console.log('🖱️ AnimatedBlock onClick - blockId:', blockId);
        onClick?.(e);
      }}
    >
      {children}
    </div>
  );
}

interface Props {
  shop: any;
  customization: any;
  blocks: BlockUI[];
  productsList: StudioProduct[];
  globalProductCustomizations: Map<number, ProductCustomization>;
  frameWidth: number;
  onHeightChange?: (height: number) => void;
  onAddToCart?: (product: StudioProduct, variant?: { size?: string; color?: string }) => void;
  onNavigateToProduct?: (productId: number) => void;
  hasProductPage?: (productId: number) => boolean;
  onNavigateLink?: (link: NavLinkTarget | null | undefined) => void;
  isNavLinkActive?: (link: NavLinkTarget | null | undefined) => boolean;
  pageProduct?: StudioProduct | null;
}

export default function ShopCanvas({
  shop,
  customization,
  blocks,
  productsList,
  globalProductCustomizations,
  frameWidth,
  onHeightChange,
  onAddToCart,
  onNavigateToProduct,
  hasProductPage,
  onNavigateLink,
  isNavLinkActive,
  pageProduct,
}: Props) {
  console.log('📦 ShopCanvas - pageProduct reçu:', pageProduct?.id, pageProduct?.name);

  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  const [productHeights, setProductHeights] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { size?: string; color?: string }>>({});

  const ratio = frameWidth > 0 ? frameWidth / STUDIO_FRAME_WIDTH : 1;
  const variantKey = pageProduct ? String(pageProduct.id) : 'default';

  console.log('🔑 variantKey:', variantKey);

  // ⭐ NOUVEAU — résolution de l'affichage du produit selon la couleur choisie
  const selectedColorForPage = pageProduct
    ? selectedVariants[variantKey]?.color
    : undefined;

  const resolvedDisplay = useMemo(
    () => (pageProduct ? resolveProductDisplay(pageProduct, selectedColorForPage) : null),
    [pageProduct, selectedColorForPage]
  );

  // ⭐ NOUVEAU — si la taille sélectionnée n'existe plus pour la nouvelle couleur, on la vide
  useEffect(() => {
    if (!pageProduct || !resolvedDisplay) return;
    const currentSize = selectedVariants[variantKey]?.size;
    if (currentSize && !resolvedDisplay.sizes.includes(currentSize)) {
      setSelectedVariants(prev => ({
        ...prev,
        [variantKey]: { ...prev[variantKey], size: undefined },
      }));
    }
  }, [resolvedDisplay, variantKey, pageProduct, selectedVariants]);

  // ⭐ NOUVEAU — résout les props effectives d'un bloc "lié" à une couleur
  const getEffectiveBlockProps = useCallback(
    (block: BlockUI): any => {
      const bf: string | undefined = block.props?.boundField;
      if (!pageProduct || !resolvedDisplay || !bf) return block.props;

      const images = getResolvedImages(resolvedDisplay);

      if (bf === 'mainImage') {
        const src = images[0] || '';
        return { ...block.props, src, url: src, imageUrl: src, image: src };
      }
      if (bf.startsWith('thumbImage:') || bf.startsWith('secondaryImage:')) {
        const idx = parseInt(bf.split(':')[1], 10);
        const src = images[idx + 1] || '';
        return { ...block.props, src, url: src, imageUrl: src, image: src };
      }
      if (bf.startsWith('galleryImage:')) {
        const idx = parseInt(bf.split(':')[1], 10);
        const src = images[idx] || '';
        return { ...block.props, src, url: src, imageUrl: src, image: src };
      }
      if (bf === 'productName') {
        return { ...block.props, title: resolvedDisplay.name, text: resolvedDisplay.name, content: resolvedDisplay.name };
      }
      if (bf === 'stockStatus') {
        const content = resolvedDisplay.stock > 0
          ? `✓ En stock (${resolvedDisplay.stock})`
          : 'Rupture de stock';
        const textColor = resolvedDisplay.stock > 0 ? '#16a34a' : '#dc2626';
        return { ...block.props, content, textColor };
      }
      // ⭐ CORRECTION — sizeButton utilise textOpacity, pas opacity
      if (bf === 'sizeButton') {
        const available = resolvedDisplay.sizes.includes(block.props.variantValue);
        return { ...block.props, textOpacity: available ? 100 : 30 };
      }

      return block.props;
    },
    [pageProduct, resolvedDisplay]
  );

  const getNavLinkProps = useCallback(
    (linkBlock: BlockUI) => {
      const link = linkBlock.props?.navigationLink as NavLinkTarget | undefined;
      if (!link || link.type === 'none' || !onNavigateLink) return undefined;
      const active = isNavLinkActive ? isNavLinkActive(link) : true;
      if (!active) return undefined;
      return {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          onNavigateLink(link);
        },
        style: { cursor: 'pointer' } as React.CSSProperties,
      };
    },
    [onNavigateLink, isNavLinkActive]
  );

  const getInteractionProps = useCallback(
    (block: BlockUI) => {
      const action = block.props?.action;
      const blockType = block.type;
      const variantValue = block.props?.variantValue;

      // ⭐ LOG — Tous les blocs avec action
      if (action) {
        console.log(`🎯 Action détectée - blockId: ${block.id}, type: ${blockType}, action: ${action}, variantValue: ${variantValue}`);
      }

      // ── selectSize ou selectColor ──
      if (action === 'selectSize' || action === 'selectColor') {
        const field = action === 'selectSize' ? 'size' : 'color';
        const value = variantValue;
        const currentVariant = selectedVariants[variantKey] || {};
        const isSelected = currentVariant[field] === value;

        // ⭐ CORRECTION — bloque le clic si la taille n'est pas disponible pour la couleur active
        // (le grisé visuel est déjà géré par boundField 'sizeButton' → textOpacity)
        if (field === 'size' && resolvedDisplay && !resolvedDisplay.sizes.includes(value)) {
          return {
            style: { cursor: 'not-allowed', pointerEvents: 'none' } as React.CSSProperties,
          };
        }

        console.log(`🔵 ${field} - valeur: ${value}, sélectionné: ${isSelected}, état actuel:`, currentVariant);

        return {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(`👆 Clic sur ${field}: ${value}`);
            
            setSelectedVariants((prev) => {
              const current = prev[variantKey] || {};
              const nextValue = current[field] === value ? undefined : value;
              const next = { 
                ...prev, 
                [variantKey]: { 
                  ...current, 
                  [field]: nextValue 
                } 
              };
              console.log(`📦 Nouvel état des variantes:`, next);
              return next;
            });
          },
          style: {
            cursor: 'pointer',
            ...(isSelected
              ? {
                  boxShadow: '0 0 0 2px #ffffff, 0 0 0 4px #111111',
                  ...(block.type === 'shape' ? { borderRadius: '50%' } : {}),
                }
              : {
                  ...(block.type === 'button' 
                    ? { border: `1px solid ${block.props?.textColor}40` }
                    : {}
                  ),
                }),
          } as React.CSSProperties,
        };
      }

      // ⭐ MODIFICATION — addToCart avec validation des variantes
      if (action === 'addToCart' && pageProduct && onAddToCart) {
        return {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();

            const variant = selectedVariants[variantKey] || {};
            const needsSize = (resolvedDisplay?.sizes?.length ?? 0) > 0;
            const needsColor = (pageProduct.colors?.length ?? 0) > 0;

            // ⭐ Validation avant ajout au panier
            if (needsSize && !variant.size) {
              toast.error('Veuillez choisir une taille');
              return;
            }
            if (needsColor && !variant.color) {
              toast.error('Veuillez choisir une couleur');
              return;
            }

            onAddToCart(pageProduct, variant);
          },
          style: { cursor: 'pointer' } as React.CSSProperties,
        };
      }

      return getNavLinkProps(block);
    },
    [pageProduct, onAddToCart, getNavLinkProps, selectedVariants, variantKey, resolvedDisplay]
  );

  const visibleBlocks = blocks.filter((b) => b.isVisible !== false && b.type !== 'group');
  const rootBlocks = [...visibleBlocks]
    .filter((b) => !b.parentId)
    .sort((a, b) => (a.position?.zIndex ?? 0) - (b.position?.zIndex ?? 0));

  const getChildren = (parentId: string) =>
    visibleBlocks
      .filter((b) => b.parentId === parentId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const canvasHeightPx = React.useMemo(() => {
    let maxBottom = 0;
    rootBlocks.forEach((block) => {
      const pos = block.position;
      if (!pos) return;
      const y = (pos.y ?? 0) * ratio;
      const h =
        block.type === 'products' && productHeights[block.id]
          ? productHeights[block.id] * ratio
          : (pos.height ?? 100) * ratio;
      const bottom = y + h;
      if (bottom > maxBottom) maxBottom = bottom;
    });
    return Math.max(maxBottom + 80, 400);
  }, [rootBlocks, ratio, productHeights]);

  useEffect(() => {
    onHeightChange?.(canvasHeightPx);
  }, [canvasHeightPx, onHeightChange]);

  function scalePosition(block: BlockUI): React.CSSProperties {
    const pos = block.position;
    if (!pos) return {};
    const x = (pos.x ?? 0) * ratio;
    const y = (pos.y ?? 0) * ratio;
    const w = (pos.width ?? 200) * ratio;
    const zIndex = pos.zIndex ?? 1;
    const rotation = pos.rotation ? `rotate(${pos.rotation}deg)` : undefined;
    const h =
      block.type === 'products'
        ? 'auto'
        : pos.height === 0
        ? 'auto'
        : (pos.height ?? 100) * ratio;
    return {
      position: 'absolute' as const,
      left: x,
      top: y,
      width: w,
      height: h,
      zIndex,
      ...(rotation ? { transform: rotation } : {}),
    };
  }

  function renderChildrenOverlay(children: BlockUI[]) {
    return (
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        {children.map((child) => {
          const navProps = getInteractionProps(child);
          return (
            <AnimatedBlock
              key={`child-${child.id}`}
              blockId={child.id}
              animationsConfig={child.props?.animationsConfig}
              style={{
                position: 'absolute',
                left: `${child.position?.x ?? 0}%`,
                top: `${child.position?.y ?? 0}%`,
                width: `${child.position?.width ?? 100}%`,
                height:
                  child.position?.height === 0 ? 'auto' : `${child.position?.height ?? 100}%`,
                minHeight: Math.max(6, 16 * ratio),
                pointerEvents: 'auto',
                ...(navProps?.style ?? {}),
              }}
              onClick={navProps?.onClick}
            >
              {renderBlock(child, true)}
            </AnimatedBlock>
          );
        })}
      </div>
    );
  }

  // ⭐ MODIFICATION — renderBlock avec résolution des props et cache des images sans contenu
  function renderBlock(inputBlock: BlockUI, isChild = false): React.ReactNode {
    // ⭐ Appliquer les props résolues avant tout rendu
    const effectiveProps = getEffectiveBlockProps(inputBlock);
    const block: BlockUI =
      effectiveProps !== inputBlock.props ? { ...inputBlock, props: effectiveProps } : inputBlock;

    // ⭐ NOUVEAU — cache les slots d'image sans contenu pour la couleur/variante active
    if (pageProduct && resolvedDisplay) {
      const imgIdx = getBoundFieldImageIndex(inputBlock.props?.boundField);
      if (imgIdx !== null) {
        const images = getResolvedImages(resolvedDisplay);
        if (imgIdx >= images.length) return null;
      }
    }

    const children = getChildren(block.id);
    const blockFilter = block.props?.cssFilter || 'none';
    const blockOpacity = block.props?.opacity !== undefined ? block.props.opacity / 100 : 1;
    const textOpacity =
      block.props?.textOpacity !== undefined ? block.props.textOpacity / 100 : 1;
    const isParentBlock = ['banner', 'screen-banner', 'carousel-banner'].includes(block.type);

    // ⭐ LOG — Blocs de sélection
    if (block.type === 'shape' || block.type === 'button') {
      const action = block.props?.action;
      if (action === 'selectColor' || action === 'selectSize') {
        console.log(`🎨 Bloc de sélection rendu - id: ${block.id}, type: ${block.type}, action: ${action}, valeur: ${block.props?.variantValue}`);
      }
    }

    const commonProps = {
      shop,
      block,
      customization: block.type === 'products' ? {} : customization,
      isSelected: false,
      isEditing: false,
      textOpacity,
      isResizing: false,
      ratio,
      onSelect: noop,
      onUpdate: noop,
      onDelete: noop,
      onDuplicate: noop,
      onDoubleClick: noop,
      onTextBlur: noop,
    };

    const wrapperStyle: React.CSSProperties = isChild
      ? {
          width: '100%',
          height: '100%',
          position: 'relative' as const,
          zIndex: block.position?.zIndex ?? 1,
        }
      : scalePosition(block);

    if (isParentBlock) {
      const navProps = getInteractionProps(block);
      const slideBlocks =
        block.type === 'carousel-banner'
          ? children
              .filter((c) => c.type === 'carousel-slide')
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          : [];
      const activeSlideIndex = carouselIndices[block.id] ?? block.props?.currentIndex ?? 0;
      const activeSlide = slideBlocks[activeSlideIndex];

      return (
        <AnimatedBlock
          key={`wrapper-${block.id}`}
          blockId={block.id}
          animationsConfig={block.props?.animationsConfig}
          style={wrapperStyle}
        >
          <div
            className="w-full h-full relative"
            style={{
              filter: blockFilter,
              opacity: blockOpacity,
              overflow: 'hidden',
              ...(navProps?.style ?? {}),
            }}
            onClick={navProps?.onClick}
          >
            {block.type === 'banner' && <BannerBlock {...commonProps} />}
            {block.type === 'screen-banner' && <ScreenBannerBlock {...commonProps} />}
            {block.type === 'carousel-banner' && (
              <CarouselBannerBlock
                {...commonProps}
                childBlocks={slideBlocks}
                shopId={shop?.id}
                onUpdate={(updates: any) => {
                  if (updates?.currentIndex !== undefined) {
                    setCarouselIndices((prev) => ({ ...prev, [block.id]: updates.currentIndex }));
                  }
                }}
              />
            )}
            {block.type === 'carousel-banner'
              ? activeSlide && renderChildrenOverlay(getChildren(activeSlide.id))
              : children.filter((c) => c.type !== 'carousel-slide').length > 0 &&
                renderChildrenOverlay(children.filter((c) => c.type !== 'carousel-slide'))}
          </div>
        </AnimatedBlock>
      );
    }

    const renderContent = () => {
      switch (block.type) {
        case 'logo':   return <LogoBlock {...commonProps} />;
        case 'title':  return <TitleBlock {...commonProps} />;
        case 'text':   return <TextBlock {...commonProps} />;
        case 'image':  return <ImageBlock {...commonProps} />;
        case 'button': return <ButtonBlock {...commonProps} />;
        case 'spacer': return <SpacerBlock {...commonProps} />;
        case 'shape':  return <ShapeBlock {...commonProps} />;
        case 'frame':  return <FrameBlock {...commonProps} />;
        case 'products':
          return (
            <ShopProductGrid
              block={block}
              gridConfig={block.gridConfig}
              productsList={productsList}
              globalProductCustomizations={globalProductCustomizations}
              onAddToCart={onAddToCart}
              onHeightChange={(h) => {
                const hStudio = h / ratio;
                setProductHeights((prev) =>
                  Math.abs((prev[block.id] ?? 0) - hStudio) > 2
                    ? { ...prev, [block.id]: hStudio }
                    : prev
                );
              }}
              onNavigateToProduct={onNavigateToProduct}
              hasProductPage={hasProductPage}
            />
          );
        default:
          return null;
      }
    };

    if (isChild) {
      return (
        <div
          className="w-full h-full relative"
          style={{ filter: blockFilter, opacity: blockOpacity, overflow: 'visible' }}
        >
          {renderContent()}
          {children.length > 0 && renderChildrenOverlay(children)}
        </div>
      );
    }

    const navProps = getInteractionProps(block);

    return (
      <AnimatedBlock
        key={`wrapper-${block.id}`}
        blockId={block.id}
        animationsConfig={block.props?.animationsConfig}
        style={wrapperStyle}
      >
        <div
          className="w-full h-full relative"
          style={{
            filter: blockFilter,
            opacity: blockOpacity,
            overflow: 'visible',
            ...(navProps?.style ?? {}),
          }}
          onClick={navProps?.onClick}
        >
          {renderContent()}
          {children.length > 0 && renderChildrenOverlay(children)}
        </div>
      </AnimatedBlock>
    );
  }

  // ⭐ MODIFICATION — retour avec isolation: 'isolate'
  return (
    <div
      className="relative w-full"
      style={{ height: canvasHeightPx, isolation: 'isolate' }}
    >
      {rootBlocks.map((block) => renderBlock(block))}
    </div>
  );
}