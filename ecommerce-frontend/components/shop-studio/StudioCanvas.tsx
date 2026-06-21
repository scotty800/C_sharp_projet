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
  // ⭐ 2.1 - Supprimer gridConfig des props
  onUpdateGridConfig?: (blockId: string, config: ProductGridConfig) => void;
  productsList?: StudioProduct[];
  onLinkProduct?: (blockId: string, slotId: string, product: StudioProduct) => void;
  onOpenProductCustomization?: (productId: number, productName: string, customization: ProductCustomization, slideCount?: number) => void;
  globalProductCustomizations?: Map<number, ProductCustomization>;
  onUpdateGlobalProductCustomization?: (productId: number, updates: Partial<ProductCustomization>) => void;
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
}: Props) {
  // ⭐ Log pour vérifier que productsList est bien reçu
  console.log('🔵🔵🔵 StudioCanvas - productsList reçus:', productsList?.length);

  const [resizingBlock, setResizingBlock] = useState<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeForceUpdate, setResizeForceUpdate] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupBounds, setGroupBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // ⭐⭐ NOUVEAU : État pour la hauteur du canvas infini
  const [canvasHeight, setCanvasHeight] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight || 800;
    }
    return 800;
  });

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

  // ⭐ Ref pour stocker les hauteurs mesurées des blocs products
  const productBlockHeights = useRef<Map<string, number>>(new Map());

  // ⭐ Ref pour le callback stable du bloc products
  const productsOnUpdateRef = useRef<((updates: any) => void) | null>(null);
  
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
      
      /* ⭐ Stabiliser le bloc products pendant les changements de couleur */
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

  // ⭐⭐ NOUVEAU : Calculer la hauteur nécessaire du canvas (version complète)
  const calculateCanvasHeight = useCallback(() => {
    const minHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    if (!blocks.length) return minHeight;

    let maxBottom = 0;

    // Fonction pour obtenir la position absolue d'un bloc
    const getAbsPos = (block: any): { x: number; y: number; width: number; height: number } => {
      let absX = block.position?.x || 0;
      let absY = block.position?.y || 0;
      let absW = block.position?.width || 100;
      let absH = block.position?.height || 100;
      
      let currentId = block.parentId;
      while (currentId) {
        const parent = blocks.find(b => b.id === currentId);
        if (!parent) break;
        
        if (parent.position?.positionType === 'relative') {
          absX += parent.position?.x || 0;
          absY += parent.position?.y || 0;
        } else {
          absX = (parent.position?.x || 0) + (absX * (parent.position?.width || 100) / 100);
          absY = (parent.position?.y || 0) + (absY * (parent.position?.height || 100) / 100);
          absW = absW * (parent.position?.width || 100) / 100;
          absH = absH * (parent.position?.height || 100) / 100;
        }
        
        currentId = parent.parentId;
      }
      
      return { x: absX, y: absY, width: absW, height: absH };
    };

    // Parcourir tous les blocs
    blocks.forEach(block => {
      if (block.type === 'group') return;
      
      const absPos = getAbsPos(block);
      let bottom = absPos.y + absPos.height;
      
      // ⭐ Pour les blocs products, utiliser la hauteur de contenu stockée
      if (block.type === 'products') {
        const contentHeight = productBlockHeights.current.get(block.id);
        if (contentHeight) {
          bottom = absPos.y + contentHeight;
        }
      }
      
      if (bottom > maxBottom) maxBottom = bottom;
      
      // ⭐ Vérifier les enfants directs
      const children = blocks.filter(b => b.parentId === block.id && b.type !== 'carousel-slide');
      children.forEach(child => {
        const childAbsPos = getAbsPos(child);
        const childBottom = childAbsPos.y + childAbsPos.height;
        if (childBottom > maxBottom) maxBottom = childBottom;
      });
    });

    // ⭐ Padding de 200px pour avoir de l'espace en bas
    const padding = 200;
    const neededHeight = Math.max(minHeight, maxBottom + padding);
    
    // Arrondir pour éviter les micro-changements
    return Math.ceil(neededHeight / 50) * 50;
  }, [blocks]);

  // ⭐⭐ NOUVEAU : Surveiller en continu les blocs qui dépassent
  useEffect(() => {
    let animationFrameId: number;
    let lastHeight = canvasHeight;

    const checkHeight = () => {
      const minHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      let maxBottom = 0;

      // Fonction pour obtenir la position absolue
      const getAbsPos = (block: any): { x: number; y: number; width: number; height: number } => {
        let absX = block.position?.x || 0;
        let absY = block.position?.y || 0;
        let absW = block.position?.width || 100;
        let absH = block.position?.height || 100;
        
        let currentId = block.parentId;
        while (currentId) {
          const parent = blocks.find(b => b.id === currentId);
          if (!parent) break;
          
          if (parent.position?.positionType === 'relative') {
            absX += parent.position?.x || 0;
            absY += parent.position?.y || 0;
          } else {
            absX = (parent.position?.x || 0) + (absX * (parent.position?.width || 100) / 100);
            absY = (parent.position?.y || 0) + (absY * (parent.position?.height || 100) / 100);
            absW = absW * (parent.position?.width || 100) / 100;
            absH = absH * (parent.position?.height || 100) / 100;
          }
          
          currentId = parent.parentId;
        }
        
        return { x: absX, y: absY, width: absW, height: absH };
      };

      blocks.forEach(block => {
        if (block.type === 'group') return;
        const absPos = getAbsPos(block);
        let bottom = absPos.y + absPos.height;
        
        // ⭐ Pour les blocs products, utiliser la hauteur de contenu stockée
        if (block.type === 'products') {
          const contentHeight = productBlockHeights.current.get(block.id);
          if (contentHeight) {
            bottom = absPos.y + contentHeight;
          }
        }
        
        if (bottom > maxBottom) maxBottom = bottom;
        
        // Vérifier les enfants
        const children = blocks.filter(b => b.parentId === block.id);
        children.forEach(child => {
          const childAbsPos = getAbsPos(child);
          const childBottom = childAbsPos.y + childAbsPos.height;
          if (childBottom > maxBottom) maxBottom = childBottom;
        });
      });

      const padding = 200;
      const neededHeight = Math.max(minHeight, maxBottom + padding);
      const roundedHeight = Math.ceil(neededHeight / 50) * 50;

      // Mettre à jour seulement si la hauteur a changé de manière significative
      if (Math.abs(roundedHeight - lastHeight) > 10) {
        lastHeight = roundedHeight;
        if (roundedHeight > canvasHeight) {
          setCanvasHeight(roundedHeight + 50);
        } else if (canvasHeight - roundedHeight > 200) {
          setCanvasHeight(roundedHeight);
        }
      }

      animationFrameId = requestAnimationFrame(checkHeight);
    };

    animationFrameId = requestAnimationFrame(checkHeight);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [blocks, canvasHeight]);

  // ⭐⭐ NOUVEAU : Mettre à jour la hauteur du canvas quand les blocs changent
  useEffect(() => {
    const newHeight = calculateCanvasHeight();
    if (newHeight !== canvasHeight) {
      setCanvasHeight(newHeight);
    }
  }, [blocks, calculateCanvasHeight]);

  // ⭐⭐ NOUVEAU : Mettre à jour la hauteur quand la fenêtre est redimensionnée
  useEffect(() => {
    const handleResize = () => {
      const newHeight = calculateCanvasHeight();
      setCanvasHeight(newHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateCanvasHeight]);

  // ⭐⭐ NOUVEAU : Écouter l'événement pour agrandir le canvas
  useEffect(() => {
    const handleExpandCanvas = (event: CustomEvent) => {
      const height = event.detail?.height || 200;
      setCanvasHeight(prev => prev + height);
    };

    const handleFitCanvasToContent = () => {
      const newHeight = calculateCanvasHeight();
      setCanvasHeight(newHeight);
    };

    window.addEventListener('expandCanvas', handleExpandCanvas as EventListener);
    window.addEventListener('fitCanvasToContent', handleFitCanvasToContent);

    return () => {
      window.removeEventListener('expandCanvas', handleExpandCanvas as EventListener);
      window.removeEventListener('fitCanvasToContent', handleFitCanvasToContent);
    };
  }, [calculateCanvasHeight]);

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

  // ⭐⭐ NOUVEAU : Surveiller les changements de hauteur des produits
  useEffect(() => {
    const checkProductHeights = () => {
      let maxBottom = 0;
      const minHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      
      blocks.forEach(block => {
        if (block.type === 'products') {
          const height = productBlockHeights.current.get(block.id) || block.position?.height || 200;
          const absPos = getAbsolutePosition(block);
          const bottom = absPos.y + height;
          if (bottom > maxBottom) maxBottom = bottom;
        }
      });
      
      if (maxBottom > 0) {
        const padding = 200;
        const neededHeight = Math.max(minHeight, maxBottom + padding);
        const roundedHeight = Math.ceil(neededHeight / 50) * 50;
        
        if (roundedHeight > canvasHeight) {
          setCanvasHeight(roundedHeight + 50);
        }
      }
    };

    const timeoutId = setTimeout(checkProductHeights, 50);
    return () => clearTimeout(timeoutId);
  }, [blocks, canvasHeight]);

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

  // ⭐⭐ MODIFICATION : handleMouseMove avec contrainte du canvas
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

        // ⭐ Empêche de sortir du canevas (gauche/droite + haut)
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

  // ⭐⭐ MODIFICATION : handleResizeMove - gère le redimensionnement avec contraintes du canvas
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

      // ⭐ Pour les blocs products, on bloque le redimensionnement vertical manuel
      const isProductsBlock = block?.type === 'products';
      if (isProductsBlock) {
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
                       if (!isProductsBlock) newHeight = Math.max(MIN_PERCENT, startData.startHeight + dpy); 
                       break;
            case 'e':  newWidth = Math.max(MIN_PERCENT, startData.startWidth + dpx); break;
            case 's':  if (!isProductsBlock) newHeight = Math.max(MIN_PERCENT, startData.startHeight + dpy); break;
            case 'ne': newWidth = Math.max(MIN_PERCENT, startData.startWidth + dpx); 
                       if (!isProductsBlock) { newHeight = Math.max(MIN_PERCENT, startData.startHeight - dpy); newY = startData.startYpos + dpy; }
                       break;
            case 'nw': newWidth = Math.max(MIN_PERCENT, startData.startWidth - dpx); 
                       if (!isProductsBlock) { newHeight = Math.max(MIN_PERCENT, startData.startHeight - dpy); newX = startData.startXpos + dpx; newY = startData.startYpos + dpy; }
                       break;
            case 'sw': newWidth = Math.max(MIN_PERCENT, startData.startWidth - dpx); 
                       if (!isProductsBlock) { newHeight = Math.max(MIN_PERCENT, startData.startHeight + dpy); newX = startData.startXpos + dpx; }
                       break;
            case 'n':  if (!isProductsBlock) { newHeight = Math.max(MIN_PERCENT, startData.startHeight - dpy); newY = startData.startYpos + dpy; } break;
            case 'w':  newWidth = Math.max(MIN_PERCENT, startData.startWidth - dpx); newX = startData.startXpos + dpx; break;
          }
          newWidth = Math.max(MIN_PERCENT, Math.min(100 - newX, newWidth));
          if (!isProductsBlock) newHeight = Math.max(MIN_PERCENT, Math.min(100 - newY, newHeight));
          newX = Math.max(0, Math.min(100 - newWidth, newX));
          if (!isProductsBlock) newY = Math.max(0, Math.min(100 - newHeight, newY));
        }
      } else {
        switch (startData.direction) {
          case 'se': newWidth = Math.max(MIN_PX, startData.startWidth + dx); 
                     if (!isProductsBlock) newHeight = Math.max(MIN_PX, startData.startHeight + dy); 
                     break;
          case 'e':  newWidth = Math.max(MIN_PX, startData.startWidth + dx); break;
          case 's':  if (!isProductsBlock) newHeight = Math.max(MIN_PX, startData.startHeight + dy); break;
          case 'ne': newWidth = Math.max(MIN_PX, startData.startWidth + dx); 
                     if (!isProductsBlock) { newHeight = Math.max(MIN_PX, startData.startHeight - dy); newY = startData.startYpos + dy; }
                     break;
          case 'nw': newWidth = Math.max(MIN_PX, startData.startWidth - dx); 
                     if (!isProductsBlock) { newHeight = Math.max(MIN_PX, startData.startHeight - dy); newX = startData.startXpos + dx; newY = startData.startYpos + dy; }
                     break;
          case 'sw': newWidth = Math.max(MIN_PX, startData.startWidth - dx); 
                     if (!isProductsBlock) { newHeight = Math.max(MIN_PX, startData.startHeight + dy); newX = startData.startXpos + dx; }
                     break;
          case 'n':  if (!isProductsBlock) { newHeight = Math.max(MIN_PX, startData.startHeight - dy); newY = startData.startYpos + dy; } break;
          case 'w':  newWidth = Math.max(MIN_PX, startData.startWidth - dx); newX = startData.startXpos + dx; break;
        }

        // ⭐ Empêche le redimensionnement de sortir du canevas (gauche/droite + haut)
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

        if (!isProductsBlock && newY < 0) {
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

  // handleMouseUp avec refs
  const handleMouseUp = useCallback(() => {
    if (dragRafId.current) { cancelAnimationFrame(dragRafId.current); dragRafId.current = null; }
    if (resizeRafId.current) { cancelAnimationFrame(resizeRafId.current); resizeRafId.current = null; }
    lastUpdateRef.current = null;
    draggingBlockRef.current = null;
    setResizingBlock(null);
    setIsResizing(false);
  }, []);

  // Listeners montés UNE SEULE FOIS
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

  // handleMouseDown avec refs
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

  const handleResizeStart = (e: React.MouseEvent, blockId: string, block: any, direction: string) => {
    if (isCropperOpen) { e.stopPropagation(); return; }
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizingBlock(blockId);
    setResizeDirection(direction);
    originalPositionRef.current = { ...block.position };

    const startData = {
      startX: e.clientX, startY: e.clientY,
      startWidth: block.position.width, startHeight: block.position.height,
      startXpos: block.position.x, startYpos: block.position.y,
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

  // ⭐⭐ MODIFICATION AVEC setTimeout : handleTextBlur avec forceSave APRÈS la mise à jour du state
  const handleTextBlur = (blockId: string, newContent: string) => {
    console.log('📝 handleTextBlur appelé pour', blockId, 'nouveau contenu:', newContent);
    setEditingTextId(null);
    onUpdateBlock(blockId, { content: newContent });
    
    // ⭐ Force la sauvegarde APRÈS que le state soit mis à jour
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

  // ⭐ Mémoriser les valeurs pour éviter les re-rendus du GridProductsBlock
  const memoizedProductsList = useMemo(() => productsList, [productsList]);
  const memoizedGlobalProductCustomizations = useMemo(() => globalProductCustomizations, [globalProductCustomizations]);

  // ⭐ 2.2 - Callbacks stables avec blockId
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

  // ⭐ MODIFICATION 1: stableShop - ne dépend que des valeurs stables
  const stableShop = useMemo(() => ({
    id: shop?.id,
    name: shop?.name,
    slug: shop?.slug,
    ownerId: shop?.ownerId,
  }), [shop?.id, shop?.name, shop?.slug, shop?.ownerId]);

  // ⭐ FIX CRITIQUE: stableCustomization pour les blocs non-products
  const stableCustomizationForOtherBlocks = useMemo(() => ({
    primaryColor: customization?.primaryColor,
    backgroundColor: customization?.backgroundColor,
    textColor: customization?.textColor,
    backgroundType: customization?.backgroundType,
    backgroundValue: customization?.backgroundValue,
    headingFont: customization?.headingFont,
    bodyFont: customization?.bodyFont,
  }), [customization?.primaryColor, customization?.backgroundColor, customization?.textColor, customization?.backgroundType, customization?.backgroundValue, customization?.headingFont, customization?.bodyFont]);

  // ⭐ Callbacks stables
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
    
    // ⭐ Détecter si c'est un bloc products
    const isProductsBlock = block.type === 'products';
    
    // ⭐ Pour le bloc products, mettre à jour la ref avec la vraie logique (accès aux closures fraîches)
    if (isProductsBlock) {
      productsOnUpdateRef.current = (updates: any) => {
        if (updates._blockHeight) {
          const currentBlock = blocksRef.current.find(b => b.id === block.id);
          const newHeight = updates._blockHeight;
          
          // On stocke la hauteur réelle dans la ref
          productBlockHeights.current.set(block.id, newHeight);
          
          // Si la hauteur a significativement changé, on met à jour la position du bloc
          if (currentBlock && Math.abs(newHeight - (currentBlock.position?.height || 0)) > 5) {
            stableOnUpdateBlockPosition(block.id, {
              ...currentBlock.position,
              height: newHeight
            });
          }
          return;
        }
        stableOnUpdateBlock(block.id, updates);
      };
    }
    
    // ⭐ Props communes pour tous les blocs (shop et customization stables)
    const commonProps = {
      shop: stableShop,
      block,
      customization: isProductsBlock ? {} : stableCustomizationForOtherBlocks,
      isSelected: showSelectionRing,
      isEditing,
      textOpacity,
      isResizing,
      onSelect: () => {
        if (isCropperOpen) return;
        handleSelectBlockWithGroup(block.id, 'background');
      },
      onUpdate: isProductsBlock ? stableProductsOnUpdate : ((updates: any) => {
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
                      minHeight: '30px',
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
                          minHeight: '30px',
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
                // ⭐ 2.3 - Utiliser block.gridConfig et passer block.id
                gridConfig={block.gridConfig}
                onUpdateGridConfig={(config) => stableOnUpdateGridConfig(block.id, config)}
                productsList={memoizedProductsList}
                onLinkProduct={(slotId, product) => stableOnLinkProduct(block.id, slotId, product)}
                onOpenCustomization={stableOnOpenProductCustomization}
                globalProductCustomizations={memoizedGlobalProductCustomizations}
                onUpdateGlobalProductCustomization={stableOnUpdateGlobalProductCustomization}
                onOpenAssetPicker={stableOnOpenAssetPicker}
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

    // ⭐ Pour les blocs products, on utilise la hauteur stockée ou auto
    const blockHeight = isProductsBlock && productBlockHeights.current.has(block.id)
      ? productBlockHeights.current.get(block.id)
      : block.position.height;

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
          height: isProductsBlock ? 'auto' : blockHeight,
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
                  minHeight: '30px',
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
    // ⭐ 2.4 - Dépendances mises à jour
  }, [blocks, selectedBlockId, editingTextId, isCropperOpen, isResizing, getChildren, resizeForceUpdate, stableShop, stableOnUpdateBlock, stableOnDeleteBlock, stableOnDuplicateBlock, stableOnUpdateBlockPosition, stableProductsOnUpdate, handleSelectBlockWithGroup, handleTextDoubleClick, handleTextBlur, handleBlockClick, handleMouseDown, handleResizeStart, stableOnUpdateGridConfig, memoizedProductsList, stableOnLinkProduct, stableOnOpenProductCustomization, memoizedGlobalProductCustomizations, stableOnUpdateGlobalProductCustomization, stableOnOpenAssetPicker, onAddSlide, renderParentContent]);

  // ⭐⭐ MODIFICATION : Style du fond pour le canvas - avec minHeight et height: 100%
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
      {/* Fond */}
      <div style={backgroundStyle} />
      
      {/* Contenu du canvas */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 1, 
          width: '100%',
          height: '100%',
        }}
      >
        {rootBlocks.map(block => renderBlock(block))}
        
        {/* Indicateur de zone infinie */}
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