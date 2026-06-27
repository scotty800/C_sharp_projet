'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { BannerBlock } from './blocks/BannerBlock';
import { LogoBlock } from './blocks/LogoBlock';
import { TitleBlock } from './blocks/TitleBlock';
import { GridProductsBlock } from './blocks/GridProductsBlock';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { ShapeBlock } from './blocks/ShapeBlock';
import { ScreenBannerBlock } from './blocks/ScreenBannerBlock';
import { CarouselBannerBlock } from './blocks/CarouselBannerBlock';
import { GroupOverlay } from './GroupOverlay';
import { ProductGridConfig, StudioProduct, ProductCustomization } from '@/types/studio';
import { useCanvasHeight } from '@/hooks/useCanvasHeight';

// ⭐ Import du renderer pour les Navbars
import NavbarBlockRenderer from './blocks/navbar/NavbarBlockRenderer';

interface Props {
  shop: any;
  blocks: any[];
  customization: any;
  filters: any;
  canvasFilters: any;
  selectedBlockId: string | null;
  isBackgroundSelected: boolean;
  onSelectBlock: (id: string | null, target?: 'text' | 'background') => void;
  onSelectBackground: () => void;
  onUpdateBlock: (id: string, updates: any) => void;
  onUpdateBlockPosition: (id: string, position: any) => void;
  onReorderBlocks: (startIndex: number, endIndex: number) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  isCropperOpen?: boolean;
  onMoveGroup?: (movedBlockId: string, deltaX: number, deltaY: number) => void;
  getGroupMembers?: (groupId: string) => any[];
  onResizeGroup?: (groupId: string, bounds: { x: number; y: number; width: number; height: number }) => void;
  getGroupBounds?: (groupId: string) => { x: number; y: number; width: number; height: number } | null;
  onResizeGroupStart?: (groupId: string) => void;
  onResizeGroupEnd?: () => void;
  onAddSlide?: (carouselBlockId: string) => void;
  onUpdateGridConfig?: (blockId: string, config: ProductGridConfig) => void;
  productsList?: StudioProduct[];
  onLinkProduct?: (blockId: string, slotId: string, product: StudioProduct) => void;
  onOpenProductCustomization?: (productId: number, productName: string, customization: ProductCustomization, slideCount?: number) => void;
  globalProductCustomizations?: Map<number, ProductCustomization>;
  onUpdateGlobalProductCustomization?: (productId: number, updates: Partial<ProductCustomization>) => void;
  // ⭐ Pages pour les Navbars
  pages?: any[];
}

export default function StudioCanvas({
  shop,
  blocks,
  customization,
  canvasFilters,
  selectedBlockId,
  isBackgroundSelected,
  onSelectBlock,
  onSelectBackground,
  onUpdateBlock,
  onUpdateBlockPosition,
  onDeleteBlock,
  onDuplicateBlock,
  isCropperOpen = false,
  onMoveGroup,
  getGroupMembers,
  onResizeGroup,
  getGroupBounds,
  onResizeGroupStart,
  onResizeGroupEnd,
  onAddSlide,
  onUpdateGridConfig,
  productsList = [],
  onLinkProduct,
  onOpenProductCustomization,
  globalProductCustomizations,
  onUpdateGlobalProductCustomization,
  pages = [], // ⭐ Nouvelle prop
}: Props) {
  console.log('🔵🔵🔵 StudioCanvas - productsList reçus:', productsList?.length);

  const [resizingBlock, setResizingBlock] = useState<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeForceUpdate, setResizeForceUpdate] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupBounds, setGroupBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // ⭐⭐ UTILISATION DU HOOK useCanvasHeight
  const { canvasHeight, reportBlockHeight } = useCanvasHeight({ blocks });

  // Refs pour le drag
  const draggingBlockRef = useRef<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const originalPositionRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const blocksRef = useRef(blocks);
  
  // Refs pour les callbacks instables
  const onUpdateBlockPositionRef = useRef(onUpdateBlockPosition);
  const onMoveGroupRef = useRef(onMoveGroup);
  const isCropperOpenRef = useRef(isCropperOpen);
  
  // Refs pour getGroupBounds et selectedGroupId
  const getGroupBoundsRef = useRef(getGroupBounds);
  const selectedGroupIdRef = useRef(selectedGroupId);
  
  // Ref pour groupBounds (fallback pour l'overlay)
  const groupBoundsRef = useRef(groupBounds);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const dragRafId = useRef<number | null>(null);
  const resizeRafId = useRef<number | null>(null);
  const lastUpdateRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // ⭐ Ref pour le callback stable du bloc products
  const productsOnUpdateRef = useRef<((updates: any) => void) | null>(null);
  
  // ⭐ Ref pour reportBlockHeight stabilisée
  const reportBlockHeightRef = useRef(reportBlockHeight);
  useEffect(() => { reportBlockHeightRef.current = reportBlockHeight; }, [reportBlockHeight]);

  // ⭐ Une fonction stable par blockId : ne change jamais de référence,
  // même si StudioCanvas re-render à chaque clic/sélection.
  const heightChangeCallbacksRef = useRef<Map<string, (h: number) => void>>(new Map());
  const getStableOnHeightChange = useCallback((blockId: string) => {
    let cb = heightChangeCallbacksRef.current.get(blockId);
    if (!cb) {
      cb = (h: number) => reportBlockHeightRef.current(blockId, h);
      heightChangeCallbacksRef.current.set(blockId, cb);
    }
    return cb;
  }, []);
  
  // ⭐ Callback stable pour onUpdate du bloc products (ne change jamais de référence)
  const stableProductsOnUpdate = useCallback((updates: any) => {
    productsOnUpdateRef.current?.(updates);
  }, []);

  // Garder les refs toujours à jour
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);
  
  useEffect(() => {
    onUpdateBlockPositionRef.current = onUpdateBlockPosition;
  }, [onUpdateBlockPosition]);
  
  useEffect(() => {
    onMoveGroupRef.current = onMoveGroup;
  }, [onMoveGroup]);
  
  useEffect(() => {
    isCropperOpenRef.current = isCropperOpen;
  }, [isCropperOpen]);
  
  useEffect(() => {
    getGroupBoundsRef.current = getGroupBounds;
  }, [getGroupBounds]);
  
  useEffect(() => {
    selectedGroupIdRef.current = selectedGroupId;
  }, [selectedGroupId]);
  
  useEffect(() => {
    if (groupBounds) groupBoundsRef.current = groupBounds;
  }, [groupBounds]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .force-font-apply, [class*="font-"], h1, h2, h3, h4, p, button, span, div {
        font-display: swap !important;
      }
      .group-container {
        border: 2px dashed #3b82f6;
        border-radius: 8px;
        background: rgba(59, 130, 246, 0.05);
        position: relative;
        transition: all 0.2s ease;
      }
      .group-container:hover {
        background: rgba(59, 130, 246, 0.1);
        border-color: #60a5fa;
      }
      .group-label {
        position: absolute;
        top: -10px;
        left: 10px;
        background: #3b82f6;
        color: white;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 12px;
        z-index: 10;
        pointer-events: none;
        font-weight: 500;
        letter-spacing: 0.5px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .products-block-wrapper {
        transition: none !important;
        will-change: auto !important;
        transform: translateZ(0);
        backface-visibility: hidden;
      }
      
      .products-block-wrapper > div {
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  const getChildren = useCallback((parentId: string) => {
    return blocks.filter(b => b.parentId === parentId);
  }, [blocks]);

  // Helpers pour calculer les positions absolues
  const getAbsolutePosition = useCallback((block: any): { x: number; y: number; width: number; height: number } => {
    if (!block.parentId) {
      return { x: block.position.x, y: block.position.y, width: block.position.width, height: block.position.height };
    }
    const parent = blocksRef.current.find(b => b.id === block.parentId);
    if (!parent) return { x: block.position.x, y: block.position.y, width: block.position.width, height: block.position.height };
    
    const parentAbs = getAbsolutePosition(parent);
    return {
      x: parentAbs.x + (block.position.x / 100) * parentAbs.width,
      y: parentAbs.y + (block.position.y / 100) * parentAbs.height,
      width: (block.position.width / 100) * parentAbs.width,
      height: block.position.height === 0 ? 0 : (block.position.height / 100) * parentAbs.height,
    };
  }, []);

  const getParentAbsolutePosition = useCallback((parentId: string): { x: number; y: number; width: number; height: number } | null => {
    const parent = blocksRef.current.find(b => b.id === parentId);
    if (!parent) return null;
    return getAbsolutePosition(parent);
  }, [getAbsolutePosition]);

  // Version optimisée de updateGroupBounds
  const updateGroupBounds = useCallback(() => {
    const gid = selectedGroupIdRef.current;
    if (!gid || !getGroupBoundsRef.current) {
      setGroupBounds(null);
      return;
    }
    const bounds = getGroupBoundsRef.current(gid);
    setGroupBounds(bounds ?? null);
  }, []);

  // Se met à jour uniquement quand les blocs changent
  useEffect(() => {
    updateGroupBounds();
  }, [blocks, updateGroupBounds]);

  const handleGroupResize = useCallback((groupId: string, newBounds: { x: number; y: number; width: number; height: number }) => {
    if (onResizeGroup) {
      onResizeGroup(groupId, newBounds);
      updateGroupBounds();
    }
  }, [onResizeGroup, updateGroupBounds]);

  const handleGroupResizeStart = useCallback(() => {
    if (selectedGroupId && onResizeGroupStart) {
      onResizeGroupStart(selectedGroupId);
    }
  }, [selectedGroupId, onResizeGroupStart]);

  const handleGroupResizeEnd = useCallback(() => {
    if (onResizeGroupEnd) {
      onResizeGroupEnd();
    }
  }, [onResizeGroupEnd]);

  // Version optimisée - synchronise la ref immédiatement ET calcule les bounds
  const handleSelectBlockWithGroup = useCallback((blockId: string | null, target?: 'text' | 'background') => {
    if (blockId) {
      const block = blocksRef.current.find(b => b.id === blockId);
      const gid = block?.groupId ?? null;
      selectedGroupIdRef.current = gid;
      setSelectedGroupId(gid);
      
      // Calculer les bounds immédiatement si bloc groupé
      if (gid && getGroupBoundsRef.current) {
        const bounds = getGroupBoundsRef.current(gid);
        if (bounds) {
          setGroupBounds(bounds);
          groupBoundsRef.current = bounds;
        }
      } else {
        setGroupBounds(null);
      }
    } else {
      selectedGroupIdRef.current = null;
      setSelectedGroupId(null);
      setGroupBounds(null);
    }
    onSelectBlock(blockId, target);
  }, [onSelectBlock]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingBlockRef.current || isCropperOpenRef.current) return;
    if (dragRafId.current) return;

    dragRafId.current = requestAnimationFrame(() => {
      const blockId = draggingBlockRef.current;
      if (!blockId) { dragRafId.current = null; return; }

      const currentBlocks = blocksRef.current;
      const block = currentBlocks.find(b => b.id === blockId);
      if (!block) { dragRafId.current = null; return; }

      if (block.groupId && onMoveGroupRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        onMoveGroupRef.current(blockId, dx, dy);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        dragRafId.current = null;
        return;
      }

      if (block.parentId) {
        const resolveAbs = (b: any): { x: number; y: number; width: number; height: number } => {
          if (!b.parentId) return { x: b.position.x, y: b.position.y, width: b.position.width, height: b.position.height };
          const p = blocksRef.current.find((bl: any) => bl.id === b.parentId);
          if (!p) return { x: b.position.x, y: b.position.y, width: b.position.width, height: b.position.height };
          const pAbs = resolveAbs(p);
          return {
            x: pAbs.x + (b.position.x / 100) * pAbs.width,
            y: pAbs.y + (b.position.y / 100) * pAbs.height,
            width: (b.position.width / 100) * pAbs.width,
            height: b.position.height === 0 ? 0 : (b.position.height / 100) * pAbs.height,
          };
        };

        const parent = currentBlocks.find((b: any) => b.id === block.parentId);
        if (parent) {
          const parentAbs = resolveAbs(parent);
          const cw = block.position.width || 0;
          const ch = block.position.height || 0;
          const newX = Math.max(0, Math.min(100 - cw,
            originalPositionRef.current.x + (e.clientX - dragStartRef.current.x) / parentAbs.width * 100
          ));
          const newY = Math.max(0, Math.min(100 - ch,
            originalPositionRef.current.y + (e.clientY - dragStartRef.current.y) / parentAbs.height * 100
          ));
          onUpdateBlockPositionRef.current(blockId, {
            x: newX, y: newY,
            width: originalPositionRef.current.width,
            height: originalPositionRef.current.height,
          });
        }
      } else {
        const w = originalPositionRef.current.width;
        const h = originalPositionRef.current.height;
        const canvasEl = canvasContainerRef.current;
        const canvasW = canvasEl?.clientWidth ?? Infinity;

        let newX = originalPositionRef.current.x + (e.clientX - dragStartRef.current.x);
        let newY = originalPositionRef.current.y + (e.clientY - dragStartRef.current.y);

        newX = Math.max(0, Math.min(canvasW - w, newX));
        newY = Math.max(0, newY);

        onUpdateBlockPositionRef.current(blockId, {
          x: newX,
          y: newY,
          width: w,
          height: h,
        });
      }

      dragRafId.current = null;
    });
  }, []);

  const handleResizeMove = useCallback((e: MouseEvent, blockId: string, startData: any) => {
    if (isCropperOpenRef.current || resizeRafId.current) return;
    resizeRafId.current = requestAnimationFrame(() => {
      const dx = e.clientX - startData.startX;
      const dy = e.clientY - startData.startY;
      let newWidth = startData.startWidth, newHeight = startData.startHeight;
      let newX = startData.startXpos, newY = startData.startYpos;
      const MIN_PERCENT = 5, MIN_PX = 20;

      const block = blocksRef.current.find(b => b.id === blockId);
      const isChild = block?.parentId != null;

      // ⭐ GENERALISATION : isAutoHeightBlock au lieu de isProductsBlock
      const isAutoHeightBlock = block?.type === 'products' || block?.type?.startsWith('navbar-');
      if (isAutoHeightBlock) {
        newHeight = startData.startHeight;
        newY = startData.startYpos;
      }

      if (isChild && block?.parentId) {
        const parentAbs = getParentAbsolutePosition(block.parentId);
        if (parentAbs) {
          const pW = parentAbs.width, pH = parentAbs.height;
          const dpx = (dx / pW) * 100, dpy = (dy / pH) * 100;
          switch (startData.direction) {
            case 'se': newWidth = Math.max(MIN_PERCENT, startData.startWidth + dpx); 
                       if (!isAutoHeightBlock) newHeight = Math.max(MIN_PERCENT, startData.startHeight + dpy); 
                       break;
            case 'e':  newWidth = Math.max(MIN_PERCENT, startData.startWidth + dpx); break;
            case 's':  if (!isAutoHeightBlock) newHeight = Math.max(MIN_PERCENT, startData.startHeight + dpy); break;
            case 'ne': newWidth = Math.max(MIN_PERCENT, startData.startWidth + dpx); 
                       if (!isAutoHeightBlock) { newHeight = Math.max(MIN_PERCENT, startData.startHeight - dpy); newY = startData.startYpos + dpy; }
                       break;
            case 'nw': newWidth = Math.max(MIN_PERCENT, startData.startWidth - dpx); 
                       if (!isAutoHeightBlock) { newHeight = Math.max(MIN_PERCENT, startData.startHeight - dpy); newX = startData.startXpos + dpx; newY = startData.startYpos + dpy; }
                       break;
            case 'sw': newWidth = Math.max(MIN_PERCENT, startData.startWidth - dpx); 
                       if (!isAutoHeightBlock) { newHeight = Math.max(MIN_PERCENT, startData.startHeight + dpy); newX = startData.startXpos + dpx; }
                       break;
            case 'n':  if (!isAutoHeightBlock) { newHeight = Math.max(MIN_PERCENT, startData.startHeight - dpy); newY = startData.startYpos + dpy; } break;
            case 'w':  newWidth = Math.max(MIN_PERCENT, startData.startWidth - dpx); newX = startData.startXpos + dpx; break;
          }
          newWidth = Math.max(MIN_PERCENT, Math.min(100 - newX, newWidth));
          if (!isAutoHeightBlock) newHeight = Math.max(MIN_PERCENT, Math.min(100 - newY, newHeight));
          newX = Math.max(0, Math.min(100 - newWidth, newX));
          if (!isAutoHeightBlock) newY = Math.max(0, Math.min(100 - newHeight, newY));
        }
      } else {
        switch (startData.direction) {
          case 'se': newWidth = Math.max(MIN_PX, startData.startWidth + dx); 
                     if (!isAutoHeightBlock) newHeight = Math.max(MIN_PX, startData.startHeight + dy); 
                     break;
          case 'e':  newWidth = Math.max(MIN_PX, startData.startWidth + dx); break;
          case 's':  if (!isAutoHeightBlock) newHeight = Math.max(MIN_PX, startData.startHeight + dy); break;
          case 'ne': newWidth = Math.max(MIN_PX, startData.startWidth + dx); 
                     if (!isAutoHeightBlock) { newHeight = Math.max(MIN_PX, startData.startHeight - dy); newY = startData.startYpos + dy; }
                     break;
          case 'nw': newWidth = Math.max(MIN_PX, startData.startWidth - dx); 
                     if (!isAutoHeightBlock) { newHeight = Math.max(MIN_PX, startData.startHeight - dy); newX = startData.startXpos + dx; newY = startData.startYpos + dy; }
                     break;
          case 'sw': newWidth = Math.max(MIN_PX, startData.startWidth - dx); 
                     if (!isAutoHeightBlock) { newHeight = Math.max(MIN_PX, startData.startHeight + dy); newX = startData.startXpos + dx; }
                     break;
          case 'n':  if (!isAutoHeightBlock) { newHeight = Math.max(MIN_PX, startData.startHeight - dy); newY = startData.startYpos + dy; } break;
          case 'w':  newWidth = Math.max(MIN_PX, startData.startWidth - dx); newX = startData.startXpos + dx; break;
        }

        const canvasEl = canvasContainerRef.current;
        const canvasW = canvasEl?.clientWidth ?? Infinity;

        if (newX < 0) {
          newWidth += newX;
          newX = 0;
        }
        if (newX + newWidth > canvasW) {
          newWidth = canvasW - newX;
        }
        newWidth = Math.max(MIN_PX, newWidth);

        if (!isAutoHeightBlock && newY < 0) {
          newHeight += newY;
          newY = 0;
          newHeight = Math.max(MIN_PX, newHeight);
        }
      }

      const last = lastUpdateRef.current;
      if (!last || Math.abs(newX-last.x)>0.5 || Math.abs(newY-last.y)>0.5 || Math.abs(newWidth-last.width)>0.5 || Math.abs(newHeight-last.height)>0.5) {
        lastUpdateRef.current = { x: newX, y: newY, width: newWidth, height: newHeight };
        onUpdateBlockPositionRef.current(blockId, { x: newX, y: newY, width: newWidth, height: newHeight });
        setResizeForceUpdate(p => p + 1);
      }
      resizeRafId.current = null;
    });
  }, [getParentAbsolutePosition]);

  const handleMouseUp = useCallback(() => {
    if (dragRafId.current) { cancelAnimationFrame(dragRafId.current); dragRafId.current = null; }
    if (resizeRafId.current) { cancelAnimationFrame(resizeRafId.current); resizeRafId.current = null; }
    lastUpdateRef.current = null;
    draggingBlockRef.current = null;
    setResizingBlock(null);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleBlockClick = (e: React.MouseEvent, blockId: string, block: any) => {
    if (isCropperOpen) { e.stopPropagation(); return; }
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const isTextElement = ['H1','H2','H3','H4','P','BUTTON'].includes(target.tagName) ||
      target.classList?.contains('text-content') ||
      target.classList?.contains('prose') ||
      target.getAttribute?.('contenteditable') === 'true';
    const isParentBlock = ['banner','screen-banner','carousel-banner'].includes(block.type);

    if (isParentBlock) {
      handleSelectBlockWithGroup(blockId, 'background');
      return;
    }
    handleSelectBlockWithGroup(blockId, isTextElement ? 'text' : 'background');
  };

  const handleCanvasClick = () => {
    if (isCropperOpen) return;
    setSelectedGroupId(null);
    selectedGroupIdRef.current = null;
    onSelectBackground();
  };

  const handleMouseDown = (e: React.MouseEvent, blockId: string, block: any) => {
    if (isCropperOpen) { e.stopPropagation(); return; }
    if (block.type === 'carousel-slide') return;

    e.stopPropagation();
    draggingBlockRef.current = blockId;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    originalPositionRef.current = {
      x: block.position.x,
      y: block.position.y,
      width: block.position.width,
      height: block.position.height,
    };
  };

  // ⭐ handleResizeStart avec correction pour la hauteur "auto"
  const handleResizeStart = (e: React.MouseEvent, blockId: string, block: any, direction: string) => {
    if (isCropperOpen) { e.stopPropagation(); return; }
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizingBlock(blockId);
    setResizeDirection(direction);
    originalPositionRef.current = { ...block.position };

    // ⭐ Si height = 0 (= 'auto'), on mesure la hauteur réellement
    // rendue dans le DOM pour partir de la vraie taille du bloc,
    // au lieu de partir de 0 (ce qui écrasait le bloc dès le clic).
    let effectiveStartHeight = block.position.height;
    if (effectiveStartHeight === 0) {
      const domEl = canvasContainerRef.current?.querySelector(
        `[data-block-id="${blockId}"]`
      ) as HTMLElement | null;
      const measuredPx = domEl?.getBoundingClientRect().height ?? 0;
      if (block.parentId) {
        const parentAbs = getParentAbsolutePosition(block.parentId);
        effectiveStartHeight = parentAbs && parentAbs.height > 0
          ? (measuredPx / parentAbs.height) * 100
          : 10;
      } else {
        effectiveStartHeight = measuredPx || 30;
      }
    }

    const startData = {
      startX: e.clientX, startY: e.clientY,
      startWidth: block.position.width,
      startHeight: effectiveStartHeight,
      startXpos: block.position.x,
      startYpos: block.position.y,
      direction,
    };
    const onMove = (me: MouseEvent) => handleResizeMove(me, blockId, startData);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (resizeRafId.current) { cancelAnimationFrame(resizeRafId.current); resizeRafId.current = null; }
      setIsResizing(false);
      setResizingBlock(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleTextDoubleClick = (e: React.MouseEvent, blockId: string) => {
    if (isCropperOpen) return;
    e.stopPropagation();
    setEditingTextId(blockId);
    handleSelectBlockWithGroup(blockId, 'text');
  };

  const handleTextBlur = (blockId: string, newContent: string) => {
    console.log('📝 handleTextBlur appelé pour', blockId, 'nouveau contenu:', newContent);
    setEditingTextId(null);
    onUpdateBlock(blockId, { content: newContent });
    
    setTimeout(() => {
      console.log('🔥 Dispatch forceSave depuis handleTextBlur (delay)');
      window.dispatchEvent(new CustomEvent('forceSave'));
    }, 100);
  };

  const renderParentContent = (block: any, commonProps: any) => {
    switch (block.type) {
      case 'banner': return <BannerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
      case 'screen-banner': return <ScreenBannerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
      case 'carousel-banner': return <CarouselBannerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
      default: return null;
    }
  };

  const memoizedProductsList = useMemo(() => productsList, [productsList]);
  const memoizedGlobalProductCustomizations = useMemo(() => globalProductCustomizations, [globalProductCustomizations]);

  const stableOnUpdateGridConfig = useCallback((blockId: string, config: ProductGridConfig) => {
    onUpdateGridConfig?.(blockId, config);
  }, [onUpdateGridConfig]);

  const stableOnLinkProduct = useCallback((blockId: string, slotId: string, product: StudioProduct) => {
    onLinkProduct?.(blockId, slotId, product);
  }, [onLinkProduct]);

  const stableOnOpenProductCustomization = useCallback((productId: number, productName: string, customization: ProductCustomization, slideCount?: number) => {
    onOpenProductCustomization?.(productId, productName, customization, slideCount);
  }, [onOpenProductCustomization]);

  const stableOnUpdateGlobalProductCustomization = useCallback((productId: number, updates: Partial<ProductCustomization>) => {
    onUpdateGlobalProductCustomization?.(productId, updates);
  }, [onUpdateGlobalProductCustomization]);

  const stableOnOpenAssetPicker = useCallback((callback: (url: string) => void) => {
    const event = new CustomEvent('openAssetPicker', { detail: { callback } });
    window.dispatchEvent(event);
  }, []);

  const stableShop = useMemo(() => ({
    id: shop?.id,
    name: shop?.name,
    slug: shop?.slug,
    ownerId: shop?.ownerId,
  }), [shop?.id, shop?.name, shop?.slug, shop?.ownerId]);

  const stableCustomizationForOtherBlocks = useMemo(() => ({
    primaryColor: customization?.primaryColor,
    backgroundColor: customization?.backgroundColor,
    textColor: customization?.textColor,
    backgroundType: customization?.backgroundType,
    backgroundValue: customization?.backgroundValue,
    headingFont: customization?.headingFont,
    bodyFont: customization?.bodyFont,
  }), [customization?.primaryColor, customization?.backgroundColor, customization?.textColor, customization?.backgroundType, customization?.backgroundValue, customization?.headingFont, customization?.bodyFont]);

  const stableOnUpdateBlock = useCallback((id: string, updates: any) => {
    console.log('📝 stableOnUpdateBlock appelé pour', id, updates);
    onUpdateBlock(id, updates);
  }, [onUpdateBlock]);

  const stableOnDeleteBlock = useCallback((id: string) => {
    onDeleteBlock(id);
  }, [onDeleteBlock]);

  const stableOnDuplicateBlock = useCallback((id: string) => {
    onDuplicateBlock(id);
  }, [onDuplicateBlock]);

  const stableOnUpdateBlockPosition = useCallback((id: string, position: any) => {
    onUpdateBlockPosition(id, position);
  }, [onUpdateBlockPosition]);

  // Render BLOCK avec le nouveau blockStyle corrigé
  const renderBlock = useCallback((block: any, isChild: boolean = false) => {
    const isSelected = selectedBlockId === block.id;
    const isEditing = editingTextId === block.id;
    const children = getChildren(block.id);
    
    const blockFilter = block.props?.cssFilter || 'none';
    const blockOpacity = block.props?.opacity !== undefined ? block.props.opacity / 100 : 1;
    const textOpacity = block.props?.textOpacity !== undefined ? block.props.textOpacity / 100 : 1;
    
    const showSelectionRing = isSelected && !isCropperOpen;
    const showResizeHandles = isSelected && !isCropperOpen && block.type !== 'group';
    
    // ⭐ GENERALISATION : isAutoHeightBlock au lieu de isProductsBlock
    const isAutoHeightBlock = block.type === 'products' || block.type?.startsWith('navbar-');
    
    // ⭐ Pour le bloc products, mettre à jour la ref avec la vraie logique
    if (block.type === 'products') {
      productsOnUpdateRef.current = (updates: any) => {
        if (updates._blockHeight) {
          // ⭐ Déléguer au hook centralisé
          reportBlockHeight(block.id, updates._blockHeight);
          return;
        }
        stableOnUpdateBlock(block.id, updates);
      };
    }
    
    const commonProps = {
      shop: stableShop,
      block,
      customization: block.type === 'products' ? {} : stableCustomizationForOtherBlocks,
      isSelected: showSelectionRing,
      isEditing,
      textOpacity,
      isResizing,
      onSelect: () => {
        if (isCropperOpen) return;
        handleSelectBlockWithGroup(block.id, 'background');
      },
      onUpdate: block.type === 'products' ? stableProductsOnUpdate : ((updates: any) => {
        stableOnUpdateBlock(block.id, updates);
      }),
      onDelete: () => stableOnDeleteBlock(block.id),
      onDuplicate: () => stableOnDuplicateBlock(block.id),
      onDoubleClick: (e: React.MouseEvent) => {
        if (isCropperOpen) return;
        handleTextDoubleClick(e, block.id);
      },
      onTextBlur: (content: string) => handleTextBlur(block.id, content),
    };

    if (block.type === 'group') {
      return null;
    }

    const isParentBlock = ['banner', 'screen-banner', 'carousel-banner'].includes(block.type);
    
    if (isParentBlock) {
      const slideBlocks = block.type === 'carousel-banner'
        ? getChildren(block.id).filter(c => c.type === 'carousel-slide').sort((a, b) => (a.order || 0) - (b.order || 0))
        : [];
      
      const activeSlideIndex = block.props?.currentIndex ?? 0;
      const activeSlideId = slideBlocks[activeSlideIndex]?.id;
      
      return (
        <div key={`wrapper-${block.id}`}>
          <div
            style={{
              position: 'absolute',
              left: block.position.x,
              top: block.position.y,
              width: block.position.width,
              height: block.position.height,
              zIndex: block.position.zIndex,
            }}
            className="relative"
          >
            <div
              data-block-id={block.id}
              className={`w-full h-full ${!isChild ? 'cursor-grab active:cursor-grabbing' : ''} ${showSelectionRing && !isChild ? 'ring-2 ring-primary ring-offset-2 rounded-lg z-50' : ''}`}
              onClick={(e) => {
                if (isCropperOpen) {
                  e.stopPropagation();
                  return;
                }
                e.stopPropagation();
                handleSelectBlockWithGroup(block.id, 'background');
              }}
              onMouseDown={(e) => {
                handleMouseDown(e, block.id, block);
              }}
              style={{
                filter: blockFilter,
                opacity: blockOpacity,
                transform: block.position.rotation ? `rotate(${block.position.rotation}deg)` : 'none',
                overflow: 'visible',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            >
              {block.type === 'carousel-banner' ? (
                <CarouselBannerBlock
                  key={`${block.id}-${resizeForceUpdate}`}
                  {...commonProps}
                  childBlocks={slideBlocks}
                  onAddSlide={onAddSlide ? () => onAddSlide(block.id) : undefined}
                  shopId={shop?.id}
                />
              ) : (
                renderParentContent(block, commonProps)
              )}
              
              {block.type === 'carousel-banner' && slideBlocks.map(slide => {
                const slideChildren = getChildren(slide.id).filter(c => c.type !== 'carousel-slide');
                const isActiveSlide = slide.id === activeSlideId;
                if (!isActiveSlide) return null;
                
                return slideChildren.map(child => (
                  <div
                    key={`slide-child-${child.id}`}
                    data-block-id={child.id}
                    style={{
                      position: 'absolute',
                      left: `${child.position.x}%`,
                      top: `${child.position.y}%`,
                      width: `${child.position.width}%`,
                      height: child.position.height === 0 ? 'auto' : `${child.position.height}%`,
                      minHeight: '16px',
                      pointerEvents: 'auto',
                      zIndex: child.position.zIndex,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectBlockWithGroup(child.id, 'text');
                    }}
                  >
                    {renderBlock(child, true)}
                  </div>
                ));
              })}
              
              {children.filter(c => c.type !== 'carousel-slide').length > 0 && (
                <div 
                  className="absolute inset-0"
                  style={{ pointerEvents: 'none' }}
                >
                  {children
                    .filter(child => child.type !== 'group')
                    .map(child => {
                    return (
                      <div
                        key={`child-wrapper-${child.id}`}
                        data-block-id={child.id}
                        style={{
                          position: 'absolute',
                          left: `${child.position.x}%`,
                          top: `${child.position.y}%`,
                          width: `${child.position.width}%`,
                          height: child.position.height === 0 ? 'auto' : `${child.position.height}%`,
                          minHeight: '16px',
                          pointerEvents: 'auto',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBlockWithGroup(child.id, 'text');
                        }}
                      >
                        {renderBlock(child, true)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {showResizeHandles && (
              <div className="absolute inset-0 pointer-events-none z-50" style={{ margin: '-4px' }}>
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-nw-resize pointer-events-auto"
                     style={{ width: 12, height: 12, left: -6, top: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'nw')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-ne-resize pointer-events-auto"
                     style={{ width: 12, height: 12, right: -6, top: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'ne')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-sw-resize pointer-events-auto"
                     style={{ width: 12, height: 12, left: -6, bottom: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'sw')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-se-resize pointer-events-auto"
                     style={{ width: 12, height: 12, right: -6, bottom: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'se')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-n-resize pointer-events-auto"
                     style={{ width: 12, height: 12, left: 'calc(50% - 6px)', top: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'n')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-s-resize pointer-events-auto"
                     style={{ width: 12, height: 12, left: 'calc(50% - 6px)', bottom: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 's')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-w-resize pointer-events-auto"
                     style={{ width: 12, height: 12, left: -6, top: 'calc(50% - 6px)' }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'w')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-e-resize pointer-events-auto"
                     style={{ width: 12, height: 12, right: -6, top: 'calc(50% - 6px)' }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'e')} />
              </div>
            )}
          </div>
        </div>
      );
    }

    const renderContent = () => {
      switch (block.type) {
        case 'logo':   return <LogoBlock key={block.id} {...commonProps} />;
        case 'title':  return <TitleBlock key={block.id} {...commonProps} />;
        
        // ⭐ Navbars — shopSlug supprimé
        case 'navbar-horizontal':
        case 'navbar-hero':
        case 'navbar-sidebar':
          return (
            <NavbarBlockRenderer
              mode="studio"
              navConfig={block.props?.navConfig}
              pages={pages}
              isSelected={showSelectionRing}
              onSelect={() => {
                if (!isCropperOpen) handleSelectBlockWithGroup(block.id, 'background');
              }}
              onSelectButton={() => {
                if (!isCropperOpen) handleSelectBlockWithGroup(block.id, 'background');
              }}
            />
          );
        
        case 'products': {
          console.log('🟣🟣🟣 StudioCanvas - Rendu GridProductsBlock, productsList reçu:', memoizedProductsList?.length);
          return (
            <div className="products-block-wrapper">
              <GridProductsBlock
                key={`products-${block.id}-${memoizedProductsList?.length || 0}`}
                shop={stableShop}
                block={block}
                customization={{}}
                isSelected={showSelectionRing}
                textOpacity={textOpacity}
                isResizing={isResizing}
                onSelect={() => {
                  if (isCropperOpen) return;
                  handleSelectBlockWithGroup(block.id, 'background');
                }}
                onUpdate={stableProductsOnUpdate}
                gridConfig={block.gridConfig}
                onUpdateGridConfig={(config) => stableOnUpdateGridConfig(block.id, config)}
                productsList={memoizedProductsList}
                onLinkProduct={(slotId, product) => stableOnLinkProduct(block.id, slotId, product)}
                onOpenCustomization={stableOnOpenProductCustomization}
                globalProductCustomizations={memoizedGlobalProductCustomizations}
                onUpdateGlobalProductCustomization={stableOnUpdateGlobalProductCustomization}
                onOpenAssetPicker={stableOnOpenAssetPicker}
                onHeightChange={getStableOnHeightChange(block.id)}
              />
            </div>
          );
        }
        case 'text':   return <TextBlock key={block.id} {...commonProps} />;
        case 'image': return <ImageBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'button': return <ButtonBlock key={block.id} {...commonProps} />;
        case 'spacer': return <SpacerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'shape': return <ShapeBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        default: return <div key={block.id} className="w-full h-full bg-gray-100 flex items-center justify-center">⚠️ {block.type}</div>;
      }
    };

    // ⭐ blockStyle avec height: 'auto' pour les blocs à hauteur auto
    const blockStyle: React.CSSProperties = isChild
      ? {
          width: '100%',
          height: '100%',
          position: 'relative' as const,
          zIndex: block.position.zIndex,
          transform: block.position.rotation ? `rotate(${block.position.rotation}deg)` : 'none',
        }
      : {
          position: 'absolute' as const,
          left: block.position.x,
          top: block.position.y,
          width: block.position.width,
          // ⭐ Toujours 'auto' pour laisser le contenu définir la hauteur
          // Le hook mesure la hauteur réelle via onHeightChange
          height: isAutoHeightBlock ? 'auto' : block.position.height,
          zIndex: block.position.zIndex,
          transform: block.position.rotation ? `rotate(${block.position.rotation}deg)` : 'none',
        };

    const hasChildren = children && children.length > 0;

    return (
      <div
        key={`wrapper-${block.id}`}
        data-block-id={block.id}
        style={blockStyle}
        className="relative"
      >
        <div
          className={`w-full h-full cursor-grab active:cursor-grabbing ${showSelectionRing ? 'ring-2 ring-primary ring-offset-2 rounded-lg z-50' : ''}`}
          onClick={(e) => handleBlockClick(e, block.id, block)}
          onMouseDown={(e) => handleMouseDown(e, block.id, block)}
          style={{
            filter: blockFilter,
            opacity: blockOpacity,
            transform: block.position.rotation ? `rotate(${block.position.rotation}deg)` : 'none',
            overflow: 'visible',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            position: 'relative',
          }}
        >
          {renderContent()}
          
          {hasChildren && (
            <div 
              className="absolute inset-0"
              style={{ pointerEvents: 'none' }}
            >
              {children
                .filter(child => child.type !== 'group')
                .map(child => {
                const childStyle = {
                  position: 'absolute' as const,
                  left: `${child.position.x}%`,
                  top: `${child.position.y}%`,
                  width: `${child.position.width}%`,
                  height: child.position.height === 0 ? 'auto' : `${child.position.height}%`,
                  minHeight: '16px',
                  pointerEvents: 'auto' as const,
                };
                
                return (
                  <div
                    key={`child-wrapper-${child.id}`}
                    data-block-id={child.id}
                    style={childStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectBlockWithGroup(child.id, 'text');
                    }}
                  >
                    {renderBlock(child, true)}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showResizeHandles && (
          <div className="absolute inset-0 pointer-events-none z-50" style={{ margin: '-4px' }}>
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-nw-resize pointer-events-auto"
                 style={{ width: 12, height: 12, left: -6, top: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'nw')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-ne-resize pointer-events-auto"
                 style={{ width: 12, height: 12, right: -6, top: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'ne')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-sw-resize pointer-events-auto"
                 style={{ width: 12, height: 12, left: -6, bottom: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'sw')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-se-resize pointer-events-auto"
                 style={{ width: 12, height: 12, right: -6, bottom: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'se')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-n-resize pointer-events-auto"
                 style={{ width: 12, height: 12, left: 'calc(50% - 6px)', top: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'n')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-s-resize pointer-events-auto"
                 style={{ width: 12, height: 12, left: 'calc(50% - 6px)', bottom: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 's')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-w-resize pointer-events-auto"
                 style={{ width: 12, height: 12, left: -6, top: 'calc(50% - 6px)' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'w')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-e-resize pointer-events-auto"
                 style={{ width: 12, height: 12, right: -6, top: 'calc(50% - 6px)' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'e')} />
          </div>
        )}
      </div>
    );
  }, [blocks, selectedBlockId, editingTextId, isCropperOpen, isResizing, getChildren, resizeForceUpdate, stableShop, stableOnUpdateBlock, stableOnDeleteBlock, stableOnDuplicateBlock, stableOnUpdateBlockPosition, stableProductsOnUpdate, getStableOnHeightChange, handleSelectBlockWithGroup, handleTextDoubleClick, handleTextBlur, handleBlockClick, handleMouseDown, handleResizeStart, stableOnUpdateGridConfig, memoizedProductsList, stableOnLinkProduct, stableOnOpenProductCustomization, memoizedGlobalProductCustomizations, stableOnUpdateGlobalProductCustomization, stableOnOpenAssetPicker, onAddSlide, renderParentContent, reportBlockHeight, pages]);

  // Style du fond pour le canvas
  let backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    width: '100%',
    minHeight: canvasHeight + 'px',
    height: '100%',
  };

  const canvasFilter = canvasFilters?.globalCssFilter || 'none';
  backgroundStyle.filter = canvasFilter;

  if (customization?.backgroundType === 'gradient' && customization?.backgroundValue) {
    backgroundStyle.background = customization.backgroundValue;
  } else if (customization?.backgroundImage) {
    backgroundStyle.backgroundImage = `url(${customization.backgroundImage})`;
    backgroundStyle.backgroundSize = customization?.backgroundSize || 'cover';
    backgroundStyle.backgroundPosition = customization?.backgroundPosition || 'center';
    backgroundStyle.backgroundRepeat = 'no-repeat';
  } else {
    backgroundStyle.backgroundColor = customization?.backgroundColor || '#ffffff';
  }

  if (customization?.backgroundOpacity !== undefined && customization?.backgroundOpacity !== 100) {
    backgroundStyle.opacity = customization.backgroundOpacity / 100;
  }

  const sortedBlocks = [...blocks].sort((a, b) => (a.position?.zIndex || 0) - (b.position?.zIndex || 0));
  const rootBlocks = sortedBlocks.filter(block => !block.parentId && block.type !== 'group');

  const hasBlocks = rootBlocks.length > 0;

  return (
    <div 
      ref={canvasContainerRef}
      className={`relative w-full ${isBackgroundSelected ? 'ring-4 ring-primary ring-offset-4 rounded-lg' : ''}`}
      style={{ 
        minHeight: canvasHeight + 'px',
        height: 'auto',
        position: 'relative',
      }}
      onClick={handleCanvasClick}
    >
      <div style={backgroundStyle} />
      
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 1, 
          width: '100%',
          height: '100%',
        }}
      >
        {rootBlocks.map(block => renderBlock(block))}
        
        {hasBlocks && (
          <div 
            className="absolute bottom-4 left-0 right-0 text-center pointer-events-none"
            style={{ zIndex: 100 }}
          >
            <div className="inline-block bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-gray-400 border border-gray-700/30">
              ⬇️ Zone infinie — Ajoutez des blocs en bas
            </div>
          </div>
        )}
      </div>
      
      {selectedGroupId && (groupBounds || groupBoundsRef.current) && onResizeGroup && (
        <GroupOverlay
          groupId={selectedGroupId}
          bounds={groupBounds || groupBoundsRef.current!}
          containerRef={canvasContainerRef}
          isSelected={true}
          onResize={handleGroupResize}
          onResizeStart={handleGroupResizeStart}
          onResizeEnd={handleGroupResizeEnd}
        />
      )}
    </div>
  );
}