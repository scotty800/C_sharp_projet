'use client';

import React, { useEffect, useState } from 'react';
import { BannerBlock } from '@/components/shop-studio/blocks/BannerBlock';
import { LogoBlock } from '@/components/shop-studio/blocks/LogoBlock';
import { TitleBlock } from '@/components/shop-studio/blocks/TitleBlock';
import { TextBlock } from '@/components/shop-studio/blocks/TextBlock';
import { ImageBlock } from '@/components/shop-studio/blocks/ImageBlock';
import { ButtonBlock } from '@/components/shop-studio/blocks/ButtonBlock';
import { SpacerBlock } from '@/components/shop-studio/blocks/SpacerBlock';
import { ShapeBlock } from '@/components/shop-studio/blocks/ShapeBlock';
import { ScreenBannerBlock } from '@/components/shop-studio/blocks/ScreenBannerBlock';
import { CarouselBannerBlock } from '@/components/shop-studio/blocks/CarouselBannerBlock';
import ShopProductGrid from './blocks/ShopProductGrid';
import { BlockUI, ProductCustomization, StudioProduct } from '@/types/studio';

/**
 * Largeur de référence Studio.
 * Toutes les positions/dimensions des blocs ont été saisies dans ce référentiel.
 */
const STUDIO_FRAME_WIDTH = 1200;

const noop = () => {};

interface Props {
  shop: any;
  customization: any;
  blocks: BlockUI[];
  productsList: StudioProduct[];
  globalProductCustomizations: Map<number, ProductCustomization>;
  frameWidth: number;
  onHeightChange?: (height: number) => void;
  onAddToCart?: (product: StudioProduct) => void;
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
}: Props) {
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  // Hauteurs réelles mesurées des blocs products (en px Studio)
  const [productHeights, setProductHeights] = useState<Record<string, number>>({});

  // ratio = viewport_width / studio_width
  // Exemple : frameWidth=800 → ratio=0.667 → un bloc de 600px Studio fait 400px
  const ratio = frameWidth > 0 ? frameWidth / STUDIO_FRAME_WIDTH : 1;

  const visibleBlocks = blocks.filter(b => b.isVisible !== false && b.type !== 'group');
  const rootBlocks = [...visibleBlocks]
    .filter(b => !b.parentId)
    .sort((a, b) => (a.position?.zIndex ?? 0) - (b.position?.zIndex ?? 0));

  const getChildren = (parentId: string) =>
    visibleBlocks
      .filter(b => b.parentId === parentId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // ── Calcul de la hauteur totale du canvas (en px viewport) ──────────────
  // On parcourt tous les blocs racines et on trouve le bord inférieur le plus bas.
  const canvasHeightPx = React.useMemo(() => {
    let maxBottom = 0;
    rootBlocks.forEach(block => {
      const pos = block.position;
      if (!pos) return;
      const y = (pos.y ?? 0) * ratio;
      // Pour les blocs products, on utilise la hauteur mesurée si disponible
      const h = block.type === 'products' && productHeights[block.id]
        ? productHeights[block.id] * ratio
        : (pos.height ?? 100) * ratio;
      const bottom = y + h;
      if (bottom > maxBottom) maxBottom = bottom;
    });
    // Padding bas
    return Math.max(maxBottom + 80, 400);
  }, [rootBlocks, ratio, productHeights]);

  useEffect(() => {
    onHeightChange?.(canvasHeightPx);
  }, [canvasHeightPx, onHeightChange]);

  // ── Conversion position Studio → position viewport ──────────────────────
  // TOUS les blocs racines sont en position: absolute pour respecter
  // exactement leur position Y dans Studio.
  function scalePosition(block: BlockUI): React.CSSProperties {
    const pos = block.position;
    if (!pos) return {};

    const x = (pos.x ?? 0) * ratio;
    const y = (pos.y ?? 0) * ratio;
    const w = (pos.width ?? 200) * ratio;
    const zIndex = pos.zIndex ?? 1;
    const rotation = pos.rotation ? `rotate(${pos.rotation}deg)` : undefined;

    // Hauteur : pour les products on laisse "auto" car le contenu est variable
    const h = block.type === 'products'
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

  // ── Rendu des enfants d'un bloc parent (banner, carousel…) ───────────────
  // Les enfants utilisent des positions en % relatifs à leur parent → pas de scaling.
  function renderChildrenOverlay(children: BlockUI[]) {
    return (
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        {children.map(child => (
          <div
            key={`child-${child.id}`}
            style={{
              position: 'absolute',
              left: `${child.position?.x ?? 0}%`,
              top: `${child.position?.y ?? 0}%`,
              width: `${child.position?.width ?? 100}%`,
              height: child.position?.height === 0 ? 'auto' : `${child.position?.height ?? 100}%`,
              // ⭐ MODIFICATION : minHeight adaptatif avec ratio
              minHeight: Math.max(6, 16 * ratio),
              pointerEvents: 'auto',
            }}
          >
            {renderBlock(child, true)}
          </div>
        ))}
      </div>
    );
  }

  // ── Rendu d'un bloc ──────────────────────────────────────────────────────
  function renderBlock(block: BlockUI, isChild = false): React.ReactNode {
    const children = getChildren(block.id);
    const blockFilter = block.props?.cssFilter || 'none';
    const blockOpacity = block.props?.opacity !== undefined ? block.props.opacity / 100 : 1;
    const textOpacity = block.props?.textOpacity !== undefined ? block.props.textOpacity / 100 : 1;
    const isParentBlock = ['banner', 'screen-banner', 'carousel-banner'].includes(block.type);

    // ⭐ AJOUT : ratio dans commonProps
    const commonProps = {
      shop,
      block,
      customization: block.type === 'products' ? {} : customization,
      isSelected: false,
      isEditing: false,
      textOpacity,
      isResizing: false,
      ratio,          // ← AJOUT
      onSelect: noop,
      onUpdate: noop,
      onDelete: noop,
      onDuplicate: noop,
      onDoubleClick: noop,
      onTextBlur: noop,
    };

    // Style wrapper :
    //  - Bloc racine  → position absolute avec coordonnées scalées
    //  - Bloc enfant  → occupe 100% de son parent (déjà positionné par renderChildrenOverlay)
    const wrapperStyle: React.CSSProperties = isChild
      ? { width: '100%', height: '100%', position: 'relative' as const, zIndex: block.position?.zIndex ?? 1 }
      : scalePosition(block);

    // ── Blocs parents (banner, screen-banner, carousel-banner) ───────────
    if (isParentBlock) {
      const slideBlocks = block.type === 'carousel-banner'
        ? children.filter(c => c.type === 'carousel-slide').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [];
      const activeSlideIndex = carouselIndices[block.id] ?? block.props?.currentIndex ?? 0;
      const activeSlide = slideBlocks[activeSlideIndex];

      return (
        <div key={`wrapper-${block.id}`} style={wrapperStyle}>
          <div className="w-full h-full relative" style={{ filter: blockFilter, opacity: blockOpacity, overflow: 'hidden' }}>
            {block.type === 'banner' && <BannerBlock {...commonProps} />}
            {block.type === 'screen-banner' && <ScreenBannerBlock {...commonProps} />}
            {block.type === 'carousel-banner' && (
              <CarouselBannerBlock
                {...commonProps}
                childBlocks={slideBlocks}
                shopId={shop?.id}
                onUpdate={(updates: any) => {
                  if (updates?.currentIndex !== undefined) {
                    setCarouselIndices(prev => ({ ...prev, [block.id]: updates.currentIndex }));
                  }
                }}
              />
            )}
            {block.type === 'carousel-banner'
              ? activeSlide && renderChildrenOverlay(getChildren(activeSlide.id))
              : children.filter(c => c.type !== 'carousel-slide').length > 0 &&
                renderChildrenOverlay(children.filter(c => c.type !== 'carousel-slide'))}
          </div>
        </div>
      );
    }

    // ── Contenu du bloc ───────────────────────────────────────────────────
    const renderContent = () => {
      switch (block.type) {
        case 'logo':    return <LogoBlock {...commonProps} />;
        case 'title':   return <TitleBlock {...commonProps} />;
        case 'text':    return <TextBlock {...commonProps} />;
        case 'image':   return <ImageBlock {...commonProps} />;
        case 'button':  return <ButtonBlock {...commonProps} />;
        case 'spacer':  return <SpacerBlock {...commonProps} />;
        case 'shape':   return <ShapeBlock {...commonProps} />;
        case 'products':
          return (
            <ShopProductGrid
              block={block}
              gridConfig={block.gridConfig}
              productsList={productsList}
              globalProductCustomizations={globalProductCustomizations}
              onAddToCart={onAddToCart}
              onHeightChange={h => {
                // On stocke la hauteur en px Studio (avant ratio) pour le calcul du canvas
                const hStudio = h / ratio;
                setProductHeights(prev =>
                  Math.abs((prev[block.id] ?? 0) - hStudio) > 2
                    ? { ...prev, [block.id]: hStudio }
                    : prev
                );
              }}
            />
          );
        default: return null;
      }
    };

    return (
      <div key={`wrapper-${block.id}`} style={wrapperStyle}>
        <div className="w-full h-full relative" style={{ filter: blockFilter, opacity: blockOpacity, overflow: 'visible' }}>
          {renderContent()}
          {children.length > 0 && renderChildrenOverlay(children)}
        </div>
      </div>
    );
  }

  // ── Canvas ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full" style={{ height: canvasHeightPx }}>
      {rootBlocks.map(block => renderBlock(block))}
    </div>
  );
}