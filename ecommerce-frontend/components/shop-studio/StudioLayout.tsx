'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { shopCustomizationService } from '@/services/api/shopCustomization';
import { filterService } from '@/services/api/filters';
import StudioToolbar from './StudioToolbar';
import StudioCanvas from './StudioCanvas';
import StudioSidebar from './StudioSidebar';
import AddBlockPanel from './add/AddBlockPanel';
import AddToParentPanel from './add/AddToParentPanel';
import FloatingLayersPanel from './FloatingLayersPanel';
import { GoogleFontsLoader } from './GoogleFontsLoader';
import { useGroupManager } from '@/hooks/useGroupManager';
import { createDefaultSlideProps } from './blocks/CarouselSlideBlock';

export interface BlockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  positionType?: 'absolute' | 'relative' | 'fixed';
}

export interface BlockUI {
  id: string;
  type: string;
  props: any;
  position: BlockPosition;
  order: number;
  isVisible: boolean;
  parentId?: string | null;
  isLocked?: boolean;
  groupId?: string | null;
}

export interface StudioState {
  shop: any;
  blocks: BlockUI[];
  selectedBlockId: string | null;
  selectedTarget: 'text' | 'background';
  isBackgroundSelected: boolean;
  isDirty: boolean;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  showAddPanel: boolean;
  activePanel: string;
  customization: any;
  filters: any;
  canvasFilters: any;
  zoom: number;
}

const DEFAULT_POSITION: BlockPosition = {
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  zIndex: 1,
  rotation: 0,
  positionType: 'absolute',
};

const generateLayersFromBlocks = (blocks: BlockUI[], expandedLayers: Set<string>): any[] => {
  const blockMap = new Map<string, BlockUI>();
  const childrenMap = new Map<string, string[]>();
  const groupsByParent = new Map<string | null, string[]>();

  blocks.forEach(block => {
    blockMap.set(block.id, block);

    if (block.parentId) {
      if (!childrenMap.has(block.parentId)) childrenMap.set(block.parentId, []);
      childrenMap.get(block.parentId)!.push(block.id);
    }

    if (block.groupId) {
      const parentId = block.parentId || null;
      if (!groupsByParent.has(parentId)) groupsByParent.set(parentId, []);
      const arr = groupsByParent.get(parentId)!;
      if (!arr.includes(block.groupId)) arr.push(block.groupId);
    }
  });

  const buildGroupContainer = (groupId: string, parentId: string | null): any => {
    const members = blocks.filter(b => b.groupId === groupId);

    const sortedMembers = [...members].sort(
      (a, b) => (a.position?.zIndex || 0) - (b.position?.zIndex || 0)
    );

    const memberNodes = sortedMembers
      .map(m => buildNode(m.id))
      .filter(Boolean);

    return {
      id: groupId,
      name: `Groupe ${groupId.slice(-6)}`,
      type: "group-container",
      zIndex: sortedMembers.length
        ? Math.max(...sortedMembers.map(m => m.position?.zIndex || 0))
        : 0,
      visible: sortedMembers.every(m => m.isVisible !== false),
      locked: sortedMembers.every(m => m.isLocked === true),
      children: memberNodes,
      parentId,
      blockId: groupId,
      isExpanded: expandedLayers.has(groupId),
      isGroupContainer: true,
    };
  };

  const buildNode = (blockId: string): any => {
    const block = blockMap.get(blockId);
    if (!block) return null;
    if (block.type === 'group') return null;

    const rawChildrenIds = childrenMap.get(block.id) || [];

    const rawChildren = rawChildrenIds
      .map(id => blockMap.get(id))
      .filter((b): b is BlockUI => b !== undefined && b !== null);
    
    rawChildren.sort((a, b) => (a.order || 0) - (b.order || 0));

    const nonGroupedChildren = rawChildren
      .filter(child => !child.groupId && child.type !== 'group')
      .map(child => child.id);

    const groupChildrenIds = groupsByParent.get(block.id) || [];

    const childNodes = [
      ...nonGroupedChildren.map(id => buildNode(id)),
      ...groupChildrenIds.map(gid => buildGroupContainer(gid, block.id)),
    ].filter(Boolean);

    return {
      id: block.id,
      name:
        block.props?.title ||
        block.props?.text ||
        block.props?.content ||
        `${block.type} ${block.order + 1}`,
      type: block.type,
      zIndex: block.position?.zIndex || block.order,
      visible: block.isVisible !== false,
      locked: block.isLocked || false,
      children: childNodes,
      parentId: block.parentId || null,
      blockId: block.id,
      isExpanded: expandedLayers.has(block.id),
      groupId: block.groupId,
    };
  };

  const buildTree = (): any[] => {
    const root: any[] = [];

    const rootGroups = groupsByParent.get(null) || [];
    rootGroups.forEach(gid => root.push(buildGroupContainer(gid, null)));

    const rootBlocks = blocks
      .filter(b => !b.parentId && !b.groupId && b.type !== 'group')
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    rootBlocks.forEach(b => {
      const node = buildNode(b.id);
      if (node) root.push(node);
    });

    return root.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  };

  return buildTree();
};

export default function StudioLayout() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [state, setState] = useState<StudioState>({
    shop: null,
    blocks: [],
    selectedBlockId: null,
    selectedTarget: 'text',
    isBackgroundSelected: false,
    isDirty: false,
    previewMode: 'desktop',
    showAddPanel: false,
    activePanel: 'elements',
    customization: null,
    filters: null,
    canvasFilters: { globalCssFilter: 'none', globalBrightness: 1, globalContrast: 1, globalSaturation: 1, globalBlur: 0 },
    zoom: 70,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [zIndexVersion, setZIndexVersion] = useState(0);
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);

  const [addToParentData, setAddToParentData] = useState<{ parentId: string; parentType: string; parentName: string } | null>(null);

  const refreshCanvas = useCallback(() => {
    setZIndexVersion(prev => prev + 1);
  }, []);

  const groupManager = useGroupManager({
    blocks: state.blocks,
    setBlocks: (blocksOrUpdater) => {
      setState(prev => ({
        ...prev,
        blocks: typeof blocksOrUpdater === 'function' ? blocksOrUpdater(prev.blocks) : blocksOrUpdater,
        isDirty: true,
      }));
    },
    refreshCanvas,
  });

  const deleteInternalElement = useCallback((elementId: string, parentBlockId: string) => {
    setState(prev => {
      const parentBlock = prev.blocks.find(b => b.id === parentBlockId);
      if (!parentBlock) return prev;

      let updatedProps = { ...parentBlock.props };

      switch (parentBlock.type) {
        case 'banner':
        case 'screen-banner':
          if (elementId.includes('title')) updatedProps.title = undefined;
          if (elementId.includes('subtitle')) updatedProps.subtitle = undefined;
          if (elementId.includes('button')) updatedProps.buttonText = undefined;
          break;
        case 'carousel-banner':
          if (elementId.includes('slide')) {
            const slideIndex = parseInt(elementId.split('-').pop() || '0');
            const slides = [...(updatedProps.slides || [])];
            slides.splice(slideIndex, 1);
            updatedProps.slides = slides;
          }
          break;
        case 'products':
          if (elementId.includes('title')) updatedProps.title = undefined;
          break;
      }

      const updatedBlocks = prev.blocks.map(b =>
        b.id === parentBlockId ? { ...b, props: updatedProps } : b
      );

      return { ...prev, blocks: updatedBlocks, isDirty: true };
    });
    refreshCanvas();
  }, [refreshCanvas]);

  const reparentLayer = useCallback((layerId: string, newParentId: string | null) => {
    setState(prev => {
      const blockToMove = prev.blocks.find(b => b.id === layerId);
      if (!blockToMove) return prev;

      if (blockToMove.type === 'carousel-slide') return prev;

      if (newParentId) {
        const newParent = prev.blocks.find(b => b.id === newParentId);
        if (newParent?.type === 'carousel-slide' && blockToMove.type === 'carousel-slide') {
          console.warn('❌ Impossible de mettre une slide dans une autre slide');
          return prev;
        }
      }

      let current = newParentId;
      while (current) {
        const parent = prev.blocks.find(b => b.id === current);
        if (parent?.parentId === layerId) {
          console.warn('❌ Cycle détecté - impossible');
          return prev;
        }
        current = parent?.parentId || null;
      }

      const oldParentId = blockToMove.parentId;
      const oldParent = oldParentId ? prev.blocks.find(b => b.id === oldParentId) : null;
      const newParent = newParentId ? prev.blocks.find(b => b.id === newParentId) : null;
      const isBannerType = blockToMove.type === 'banner' || blockToMove.type === 'screen-banner' || blockToMove.type === 'carousel-banner';

      let newPosition: BlockPosition;

      if (newParent) {
        if (isBannerType) {
          const currentWidth = blockToMove.position?.width ?? 200;
          const currentHeight = blockToMove.position?.height ?? 100;
          const relX = ((blockToMove.position?.x ?? 0) - newParent.position.x) / newParent.position.width * 100;
          const relY = ((blockToMove.position?.y ?? 0) - newParent.position.y) / newParent.position.height * 100;

          newPosition = {
            x: Math.max(0, Math.min(100 - (currentWidth / newParent.position.width * 100), relX)),
            y: Math.max(0, Math.min(100 - (currentHeight / newParent.position.height * 100), relY)),
            width: currentWidth,
            height: currentHeight,
            zIndex: blockToMove.position?.zIndex ?? 10,
            rotation: blockToMove.position?.rotation ?? 0,
            positionType: 'absolute',
          };
        } else {
          const defaultWidth = Math.min(blockToMove.position?.width ?? 80, 80);
          const defaultHeight = Math.min(blockToMove.position?.height ?? 60, 60);

          newPosition = {
            x: Math.max(0, Math.min(100 - defaultWidth, 50 - defaultWidth / 2)),
            y: 20,
            width: Math.max(10, Math.min(90, defaultWidth)),
            height: Math.max(10, Math.min(90, defaultHeight)),
            zIndex: blockToMove.position?.zIndex ?? 10,
            rotation: blockToMove.position?.rotation ?? 0,
            positionType: 'relative',
          };
        }
      } else if (oldParent) {
        const getAbsolutePosition = (block: BlockUI): { x: number; y: number; width: number; height: number } => {
          let absX = block.position?.x ?? 0;
          let absY = block.position?.y ?? 0;
          let absW = block.position?.width ?? 100;
          let absH = block.position?.height ?? 100;
          let currentParentId = block.parentId;

          while (currentParentId) {
            const parent = prev.blocks.find(b => b.id === currentParentId);
            if (!parent) break;

            if (isBannerType || block.type === 'group') {
              absX = parent.position.x + absX;
              absY = parent.position.y + absY;
            } else {
              absX = parent.position.x + (absX * parent.position.width / 100);
              absY = parent.position.y + (absY * parent.position.height / 100);
              absW = absW * parent.position.width / 100;
              absH = absH * parent.position.height / 100;
            }

            currentParentId = parent.parentId;
          }

          return { x: absX, y: absY, width: Math.max(10, absW), height: Math.max(10, absH) };
        };

        const absolutePos = getAbsolutePosition(blockToMove);
        let { x: absX, y: absY, width: absW, height: absH } = absolutePos;

        if (isBannerType) {
          absW = blockToMove.position?.width ?? absW;
          absH = blockToMove.position?.height ?? absH;
        }

        newPosition = {
          x: Math.max(20, Math.min(1200, absX)),
          y: Math.max(20, Math.min(800, absY)),
          width: Math.max(50, Math.min(800, absW)),
          height: Math.max(30, Math.min(600, absH)),
          zIndex: blockToMove.position?.zIndex ?? 1,
          rotation: blockToMove.position?.rotation ?? 0,
          positionType: 'absolute',
        };
      } else {
        newPosition = {
          ...blockToMove.position,
          x: Math.max(20, Math.min(1200, blockToMove.position?.x ?? 100)),
          y: Math.max(20, Math.min(800, blockToMove.position?.y ?? 100)),
          width: Math.max(50, Math.min(800, blockToMove.position?.width ?? 200)),
          height: Math.max(30, Math.min(600, blockToMove.position?.height ?? 100)),
          positionType: 'absolute',
        };
      }

      const updatedBlocks = prev.blocks.map(b =>
        b.id === layerId
          ? {
              ...b,
              parentId: newParentId,
              position: newPosition,
              groupId: null,
            }
          : b
      );

      return { ...prev, blocks: updatedBlocks, isDirty: true };
    });
    refreshCanvas();
  }, [refreshCanvas]);

  const deleteLayer = useCallback((layerId: string) => {
    const getChildrenIds = (id: string, blocksList: BlockUI[]): string[] => {
      const children = blocksList.filter(b => b.parentId === id);
      let allChildren: string[] = [...children.map(c => c.id)];
      children.forEach(child => {
        allChildren = [...allChildren, ...getChildrenIds(child.id, blocksList)];
      });
      return allChildren;
    };

    const childrenIds = getChildrenIds(layerId, state.blocks);
    const idsToDelete = [layerId, ...childrenIds];

    setState(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => !idsToDelete.includes(b.id)),
      selectedBlockId: null,
      isDirty: true,
    }));
    refreshCanvas();
  }, [state.blocks, refreshCanvas]);

  const toggleLayerVisibility = useCallback((layerId: string) => {
    setState(prev => {
      const block = prev.blocks.find(b => b.id === layerId);
      if (!block) return prev;

      const newVisibility = !block.isVisible;
      let updatedBlocks = [...prev.blocks];

      const updateChildren = (parentId: string, visible: boolean) => {
        updatedBlocks = updatedBlocks.map(b => {
          if (b.id === parentId) return { ...b, isVisible: visible };
          if (b.parentId === parentId) {
            updateChildren(b.id, visible);
            return { ...b, isVisible: visible };
          }
          return b;
        });
      };

      updateChildren(layerId, newVisibility);
      return { ...prev, blocks: updatedBlocks, isDirty: true };
    });
    refreshCanvas();
  }, [refreshCanvas]);

  const toggleLayerLock = useCallback((layerId: string) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b =>
        b.id === layerId ? { ...b, isLocked: !b.isLocked } : b
      ),
      isDirty: true,
    }));
    refreshCanvas();
  }, [refreshCanvas]);

  const reorderLayers = useCallback((startIndex: number, endIndex: number, parentId: string | null = null) => {
    setState(prev => {
      const siblings = prev.blocks
        .filter(b => (b.parentId ?? null) === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      if (siblings.length < 2) return prev;

      const clampedStart = Math.max(0, Math.min(startIndex, siblings.length - 1));
      const clampedEnd = Math.max(0, Math.min(endIndex, siblings.length - 1));
      if (clampedStart === clampedEnd) return prev;

      const reordered = [...siblings];
      const [removed] = reordered.splice(clampedStart, 1);
      reordered.splice(clampedEnd, 0, removed);

      const updatedSiblings = reordered.map((block, idx) => ({
        ...block,
        order: idx,
        position: { ...block.position, zIndex: idx + 1 },
      }));

      return {
        ...prev,
        blocks: prev.blocks.map(b => updatedSiblings.find(s => s.id === b.id) ?? b),
        isDirty: true,
      };
    });
    refreshCanvas();
  }, [refreshCanvas]);

  const getLayerIndexInParent = useCallback((targetLayerId: string, parentId: string | null, layersList: any[]): number => {
    const findIndex = (items: any[]): number => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === targetLayerId) return i;
        if (items[i].children?.length > 0) {
          const childIndex = findIndex(items[i].children);
          if (childIndex !== -1) return childIndex;
        }
      }
      return -1;
    };

    if (parentId === null) return findIndex(layersList);

    const findParent = (items: any[]): any => {
      for (const item of items) {
        if (item.id === parentId) return item;
        if (item.children?.length > 0) {
          const found = findParent(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const parentLayer = findParent(layersList);
    if (parentLayer?.children) {
      return parentLayer.children.findIndex((c: any) => c.id === targetLayerId);
    }
    return -1;
  }, []);

  useEffect(() => {
    const handleOpenAddToParent = (event: CustomEvent) => {
      setAddToParentData(event.detail);
    };
    window.addEventListener('openAddToParent', handleOpenAddToParent as EventListener);
    return () => window.removeEventListener('openAddToParent', handleOpenAddToParent as EventListener);
  }, []);

  const addSlide = useCallback((carouselBlockId: string) => {
    setState(prev => {
      const carouselBlock = prev.blocks.find(b => b.id === carouselBlockId);
      if (!carouselBlock || carouselBlock.type !== 'carousel-banner') return prev;

      const existingSlides = prev.blocks.filter(
        b => b.type === 'carousel-slide' && b.parentId === carouselBlockId
      );
      const slideIndex = existingSlides.length;

      const newSlide: BlockUI = {
        id: `carousel-slide-${Date.now()}-${Math.random()}`,
        type: 'carousel-slide',
        props: createDefaultSlideProps(slideIndex),
        position: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          zIndex: slideIndex + 1,
          rotation: 0,
          positionType: 'relative',
        },
        order: slideIndex,
        isVisible: true,
        parentId: carouselBlockId,
        isLocked: false,
        groupId: null,
      };

      return {
        ...prev,
        blocks: [...prev.blocks, newSlide],
        isDirty: true,
        selectedBlockId: carouselBlockId,
        selectedTarget: 'background',
        isBackgroundSelected: false,
      };
    });
    refreshCanvas();
  }, [refreshCanvas]);

  const addBlock = useCallback((type: string, props: any, parentId: string | null = null) => {
    let position: BlockPosition;

    if (parentId) {
      let defaultWidth = 40;
      if (type === 'title') defaultWidth = 60;
      else if (type === 'text') defaultWidth = 50;
      else if (type === 'button') defaultWidth = 30;
      else if (type === 'image') defaultWidth = 40;
      else if (type === 'shape') defaultWidth = 20;

      position = {
        x: 50 - defaultWidth / 2,
        y: 10,
        width: defaultWidth,
        height: 0,
        zIndex: 10,
        rotation: 0,
        positionType: 'relative',
      };
    } else {
      position = {
        x: 200 + state.blocks.length * 20,
        y: 100 + state.blocks.length * 30,
        width: props.width || 200,
        height: props.height || (type === 'text' ? 80 : 100),
        zIndex: state.blocks.length + 1,
        rotation: 0,
        positionType: 'absolute',
      };
    }

    const newBlock: BlockUI = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      props,
      position,
      order: parentId ? state.blocks.filter(b => b.parentId === parentId).length : state.blocks.length,
      isVisible: true,
      parentId,
      isLocked: false,
      groupId: null,
    };

    setState(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      isDirty: true,
      selectedBlockId: newBlock.id,
      selectedTarget: 'text',
      isBackgroundSelected: false,
    }));
    refreshCanvas();
  }, [state.blocks.length, refreshCanvas]);

  const getAllUsedFonts = useCallback(() => {
    const fonts: string[] = [];
    if (state.customization?.headingFont) fonts.push(state.customization.headingFont);
    if (state.customization?.bodyFont) fonts.push(state.customization.bodyFont);
    if (state.customization?.primaryFont) fonts.push(state.customization.primaryFont);
    state.blocks.forEach(block => {
      const props = block.props;
      if (props?.fontFamily) fonts.push(props.fontFamily);
      if (props?.titleFont) fonts.push(props.titleFont);
      if (props?.subtitleFont) fonts.push(props.subtitleFont);
      if (props?.buttonFont) fonts.push(props.buttonFont);
      if (props?.priceFont) fonts.push(props.priceFont);
      if (props?.productNameFont) fonts.push(props.productNameFont);
    });
    return [...new Set(fonts.filter(f => f && f !== 'Inter'))];
  }, [state.customization, state.blocks]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);

        const [shop, customization, filters, blocksFromApi, canvasFilters, background] = await Promise.all([
          shopService.getShopById(Number(id)),
          shopCustomizationService.getByShopId(Number(id)).catch(() => null),
          filterService.getShopFilter(Number(id)).catch(() => null),
          shopCustomizationService.getBlocks(Number(id)).catch(() => []),
          shopCustomizationService.getCanvasFilters(Number(id)).catch(() => ({ globalCssFilter: 'none', globalBrightness: 1, globalContrast: 1, globalSaturation: 1, globalBlur: 0 })),
          shopCustomizationService.getBackground(Number(id)).catch(() => ({ backgroundColor: '#FFFFFF', backgroundType: 'solid', backgroundValue: null, backgroundOpacity: 100 })),
        ]);

        if (shop.ownerId !== user.id) {
          router.push('/');
          return;
        }

        let savedBlocks: BlockUI[] = [];
        if (blocksFromApi.length > 0) {
          savedBlocks = blocksFromApi.map((b: any) => ({
            id: b.id,
            type: b.type,
            props: b.settings || {},
            position: b.position ? {
              x: b.position.x ?? (b.parentId ? 0 : 100),
              y: b.position.y ?? (b.parentId ? 0 : 100),
              width: b.position.width ?? (b.parentId ? 100 : 200),
              height: b.position.height ?? (b.parentId ? 100 : 100),
              zIndex: b.position.zIndex ?? 1,
              rotation: b.position.rotation ?? 0,
              positionType: (b.position.positionType as 'absolute' | 'relative' | 'fixed') || (b.parentId ? 'relative' : 'absolute'),
            } : {
              ...DEFAULT_POSITION,
              zIndex: b.order + 1,
              positionType: b.parentId ? 'relative' : 'absolute',
            },
            order: b.order ?? 0,
            isVisible: b.isVisible !== false,
            parentId: b.parentId ?? null,
            isLocked: b.isLocked ?? false,
            groupId: b.groupId ?? null,
          }));
        }

        setState(prev => ({
          ...prev,
          shop,
          blocks: savedBlocks,
          customization: {
            ...(customization || {}),
            shopId: shop.id,
            primaryColor: customization?.PrimaryColor || shop.themeColor || '#2563EB',
            backgroundColor: background?.backgroundColor || shop.backgroundColor || '#FFFFFF',
            textColor: customization?.TextColor || shop.textColor || '#1F2937',
            backgroundType: background?.backgroundType || 'solid',
            backgroundValue: background?.backgroundValue || null,
            backgroundOpacity: background?.backgroundOpacity ?? 100,
          },
          filters: filters || { shopId: shop.id, globalFilter: 'none' },
          canvasFilters,
        }));
      } catch (error) {
        console.error('❌ Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id, user, router]);

  useEffect(() => {
    const handleOpenAssetPickerForCarousel = (event: CustomEvent) => {
      setState(prev => ({ ...prev, activePanel: 'assets' }));
      (window as any).pendingCarouselCallback = event.detail.callback;
    };
    window.addEventListener('openAssetPickerForCarousel', handleOpenAssetPickerForCarousel as EventListener);
    return () => window.removeEventListener('openAssetPickerForCarousel', handleOpenAssetPickerForCarousel as EventListener);
  }, []);

  // 🔥 SANITIZER GLOBAL AVANT ENVOI AU BACKEND
  const sanitizeNumber = useCallback((v: any, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }, []);

  // ⭐⭐⭐ VERSION CORRIGÉE DE saveChanges - avec sanitizer global ⭐⭐⭐
  const saveChanges = useCallback(async () => {
    if (!state.isDirty) return;

    setSaving(true);
    try {
      const blocksToSave = state.blocks.map(block => {
        const isRelative = !!block.parentId || block.position?.positionType === 'relative';
        const pos = block.position || {};

        return {
          id: block.id,
          type: block.type,
          name: block.type,
          order: sanitizeNumber(block.order, 0),
          isVisible: !!block.isVisible,
          parentId: block.parentId || null,
          isLocked: !!block.isLocked,
          groupId: block.groupId || null,

          // ⭐ Position en PascalCase pour ASP.NET Core
          position: {
            X: sanitizeNumber(
              isRelative ? pos.x : Math.round(pos.x),
              0
            ),
            Y: sanitizeNumber(
              isRelative ? pos.y : Math.round(pos.y),
              0
            ),
            Width: sanitizeNumber(
              isRelative ? pos.width : Math.round(pos.width),
              100
            ),
            Height: sanitizeNumber(
              isRelative ? pos.height : Math.round(pos.height),
              100
            ),
            ZIndex: sanitizeNumber(pos.zIndex, 1),
            Rotation: sanitizeNumber(pos.rotation, 0),
            PositionType: pos.positionType || (block.parentId ? 'relative' : 'absolute'),
            ParentId: block.parentId || null,
            GroupId: block.groupId || null,
            IsLocked: !!block.isLocked,
            Alignment: "center",
          },

          // ⭐ Settings du bloc (props)
          settings: block.type === 'group' ? {} : { ...block.props },

          // ⭐ Champs obligatoires pour le backend (BlockDto)
          brightness: sanitizeNumber(block.props?.brightness, 1),
          contrast: sanitizeNumber(block.props?.contrast, 1),
          saturation: sanitizeNumber(block.props?.saturation, 1),
          blur: sanitizeNumber(block.props?.blur, 0),
          cssFilter: block.props?.cssFilter ?? "none",
        };
      });

      await Promise.all([
        shopCustomizationService.updateBlocks(Number(id), blocksToSave as any),
        shopCustomizationService.updateCanvasFilters(Number(id), {
          globalBrightness: sanitizeNumber(state.canvasFilters?.globalBrightness, 1),
          globalContrast: sanitizeNumber(state.canvasFilters?.globalContrast, 1),
          globalSaturation: sanitizeNumber(state.canvasFilters?.globalSaturation, 1),
          globalBlur: sanitizeNumber(state.canvasFilters?.globalBlur, 0),
          globalCssFilter: state.canvasFilters?.globalCssFilter || 'none',
        }),
        shopCustomizationService.updateBackground(Number(id), {
          backgroundColor: state.customization?.backgroundColor || '#FFFFFF',
          backgroundType: state.customization?.backgroundType || 'solid',
          backgroundValue: state.customization?.backgroundValue || null,
          backgroundOpacity: sanitizeNumber(state.customization?.backgroundOpacity, 100),
        }),
      ]);

      setState(prev => ({ ...prev, isDirty: false }));
      console.log('✅ Sauvegarde réussie');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  }, [id, state.blocks, state.isDirty, state.canvasFilters, state.customization, sanitizeNumber]);

  useEffect(() => {
    if (state.isDirty && !saving) {
      const timer = setTimeout(saveChanges, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.isDirty, saving, saveChanges]);

  const updateCustomization = (updates: any) => {
    setState(prev => ({ ...prev, customization: { ...prev.customization, ...updates }, isDirty: true }));
  };

  const deleteBlock = (blockId: string) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId),
      selectedBlockId: null,
      selectedTarget: 'text',
      isBackgroundSelected: false,
      isDirty: true,
    }));
    refreshCanvas();
  };

  const updateBlock = (blockId: string, updates: any) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b =>
        b.id === blockId ? { ...b, props: { ...b.props, ...updates } } : b
      ),
      isDirty: true,
    }));
    refreshCanvas();
  };

  const updateBlockPosition = useCallback((blockId: string, position: Partial<BlockPosition>) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b =>
        b.id === blockId ? { ...b, position: { ...(b.position ?? DEFAULT_POSITION), ...position } } : b
      ),
      isDirty: true,
    }));
  }, []);

  const duplicateBlock = (blockId: string) => {
    const block = state.blocks.find(b => b.id === blockId);
    if (block) {
      const newBlock: BlockUI = {
        ...block,
        id: `${block.type}-${Date.now()}-${Math.random()}`,
        position: {
          ...(block.position ?? DEFAULT_POSITION),
          x: (block.position?.x ?? 100) + 20,
          y: (block.position?.y ?? 100) + 20,
          zIndex: state.blocks.length + 1,
        },
        order: state.blocks.length,
        parentId: block.parentId || null,
        isLocked: false,
        groupId: null,
      };
      setState(prev => ({
        ...prev,
        blocks: [...prev.blocks, newBlock],
        isDirty: true,
        selectedBlockId: newBlock.id,
        selectedTarget: 'text',
        isBackgroundSelected: false,
      }));
      refreshCanvas();
    }
  };

  const reorderBlocks = (startIndex: number, endIndex: number) => {
    const reordered = [...state.blocks];
    const [removed] = reordered.splice(startIndex, 1);
    reordered.splice(endIndex, 0, removed);
    setState(prev => ({ ...prev, blocks: reordered.map((b, idx) => ({ ...b, order: idx })), isDirty: true }));
    refreshCanvas();
  };

  const updateFilters = (updates: any) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...updates }, isDirty: true }));
  };

  const updateCanvasFilters = (updates: any) => {
    setState(prev => ({ ...prev, canvasFilters: { ...prev.canvasFilters, ...updates }, isDirty: true }));
  };

  const applyFiltersToAllBlocks = useCallback((updates: any) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => ({
        ...block,
        props: {
          ...block.props,
          brightness: updates.brightness,
          contrast: updates.contrast,
          saturation: updates.saturation,
          blur: updates.blur,
          cssFilter: updates.cssFilter,
        },
      })),
      isDirty: true,
    }));
    refreshCanvas();
  }, [refreshCanvas]);

  useEffect(() => {
    (window as any).applyFiltersToAllBlocks = applyFiltersToAllBlocks;
    return () => { delete (window as any).applyFiltersToAllBlocks; };
  }, [applyFiltersToAllBlocks]);

  const handlePreviewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setState(prev => ({ ...prev, previewMode: mode }));
  };
  const handleZoomIn = () => setState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 10, 200) }));
  const handleZoomOut = () => setState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 10, 30) }));
  const handleZoomReset = () => setState(prev => ({ ...prev, zoom: 70 }));

  const selectBackground = () => {
    if (isCropperOpen) return;
    setState(prev => ({ ...prev, selectedBlockId: null, selectedTarget: 'background', isBackgroundSelected: true }));
  };

  const selectBlock = (blockId: string | null, target?: 'text' | 'background') => {
    if (isCropperOpen && blockId !== null) return;
    setState(prev => ({ ...prev, selectedBlockId: blockId, selectedTarget: target || 'text', isBackgroundSelected: false }));
  };

  const floatingLayers = generateLayersFromBlocks(state.blocks, expandedLayers);

  // ⭐ RACCOURCI CLAVIER POUR CTRL+SHIFT+L
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setShowFloatingLayers(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ⭐ ÉCOUTEUR D'ÉVÉNEMENT POUR OUVRIR LE PANNEAU DEPUIS LA SIDEBAR
  useEffect(() => {
    const handleToggleFloatingLayers = () => {
      setShowFloatingLayers(prev => !prev);
    };
    
    window.addEventListener('toggleFloatingLayers', handleToggleFloatingLayers);
    return () => window.removeEventListener('toggleFloatingLayers', handleToggleFloatingLayers);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '+') { e.preventDefault(); handleZoomIn(); }
      else if (e.ctrlKey && e.key === '-') { e.preventDefault(); handleZoomOut(); }
      else if (e.ctrlKey && e.key === '0') { e.preventDefault(); handleZoomReset(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleChangePanel = (event: CustomEvent) => {
      if (isCropperOpen) return;
      setState(prev => ({ ...prev, activePanel: event.detail }));
    };
    const handleOpenAddPanel = () => {
      if (isCropperOpen) return;
      setState(prev => ({ ...prev, showAddPanel: true }));
    };
    window.addEventListener('changePanel', handleChangePanel as EventListener);
    window.addEventListener('openAddPanel', handleOpenAddPanel);
    return () => {
      window.removeEventListener('changePanel', handleChangePanel as EventListener);
      window.removeEventListener('openAddPanel', handleOpenAddPanel);
    };
  }, [isCropperOpen]);

  const usedFonts = getAllUsedFonts();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <GoogleFontsLoader fonts={usedFonts} />

      <div className="fixed inset-0 flex flex-col bg-gray-900 overflow-hidden">
        <StudioToolbar
          shop={state.shop}
          saving={saving}
          onAddBlock={() => !isCropperOpen && setState(prev => ({ ...prev, showAddPanel: true }))}
          onSave={saveChanges}
          previewMode={state.previewMode}
          onPreviewModeChange={handlePreviewModeChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          zoom={state.zoom}
        />

        <div className="flex flex-1 overflow-hidden">
          <StudioSidebar
            shop={state.shop}
            blocks={state.blocks}
            selectedBlockId={state.selectedBlockId}
            selectedTarget={state.selectedTarget}
            isBackgroundSelected={state.isBackgroundSelected}
            customization={state.customization}
            filters={state.filters}
            canvasFilters={state.canvasFilters}
            activePanel={state.activePanel}
            onAddBlock={addBlock}
            onUpdateBlock={updateBlock}
            onDeleteBlock={deleteBlock}
            onDuplicateBlock={duplicateBlock}
            onUpdateCustomization={updateCustomization}
            onUpdateFilters={updateFilters}
            onUpdateCanvasFilters={updateCanvasFilters}
            onSelectBackground={selectBackground}
            onApplyToWholePage={applyFiltersToAllBlocks}
            onReparentLayer={reparentLayer}
            onToggleLayerVisibility={toggleLayerVisibility}
            onToggleLayerLock={toggleLayerLock}
            onGroupLayers={groupManager.createGroup}
            onUngroupLayer={groupManager.ungroup}
            onReorderLayers={reorderLayers}
            onDeleteInternalElement={deleteInternalElement}
            shopId={Number(id)}
            onAddSlide={addSlide}
          />

          <div className="flex-1 overflow-auto p-4 bg-gray-800 relative flex items-center justify-center">
            <div
              className="transition-all relative origin-center"
              style={{
                width: state.previewMode === 'desktop' ? '1200px' :
                  state.previewMode === 'tablet' ? '768px' : '375px',
                transform: `scale(${state.zoom / 100})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease',
              }}
            >
              <StudioCanvas
                key={zIndexVersion}
                shop={state.shop}
                blocks={state.blocks}
                customization={state.customization}
                filters={state.filters}
                canvasFilters={state.canvasFilters}
                selectedBlockId={state.selectedBlockId}
                isBackgroundSelected={state.isBackgroundSelected}
                onSelectBlock={selectBlock}
                onSelectBackground={selectBackground}
                onUpdateBlock={updateBlock}
                onUpdateBlockPosition={updateBlockPosition}
                onReorderBlocks={reorderBlocks}
                onDeleteBlock={deleteBlock}
                onDuplicateBlock={duplicateBlock}
                isCropperOpen={isCropperOpen}
                onMoveGroup={groupManager.moveGroup}
                getGroupMembers={groupManager.getGroupMembers}
                onResizeGroup={groupManager.resizeGroup}
                getGroupBounds={groupManager.getGroupBounds}
                onResizeGroupStart={groupManager.startGroupResize}
                onResizeGroupEnd={groupManager.endGroupResize}
                onAddSlide={addSlide}
              />
            </div>

            <div className="fixed bottom-4 right-4 flex gap-2 bg-gray-900 rounded-lg p-1 shadow-lg z-50">
              <button onClick={handleZoomOut} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white text-lg font-bold w-8">−</button>
              <span className="px-3 py-2 text-white text-sm min-w-[50px] text-center">{state.zoom}%</span>
              <button onClick={handleZoomIn} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white text-lg font-bold w-8">+</button>
              <button onClick={handleZoomReset} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white text-sm px-3">Reset</button>
            </div>
          </div>
        </div>

        {state.showAddPanel && !isCropperOpen && (
          <AddBlockPanel
            onClose={() => setState(prev => ({ ...prev, showAddPanel: false }))}
            onAddBlock={addBlock}
          />
        )}

        {addToParentData && (
          <AddToParentPanel
            parentId={addToParentData.parentId}
            parentType={addToParentData.parentType}
            parentName={addToParentData.parentName}
            onClose={() => setAddToParentData(null)}
            onAddBlock={addBlock}
          />
        )}

        {showFloatingLayers && (
          <FloatingLayersPanel
            layers={floatingLayers}
            selectedLayerId={state.selectedBlockId}
            isBackgroundSelected={state.isBackgroundSelected}
            blocksCount={state.blocks.length}
            onSelectLayer={(layerId: string) => selectBlock(layerId, 'background')}
            onSelectBackground={selectBackground}
            onToggleVisibility={toggleLayerVisibility}
            onToggleLock={toggleLayerLock}
            onDeleteLayer={deleteLayer}
            onDuplicateLayer={duplicateBlock}
            onReparentLayer={reparentLayer}
            onAddToGroup={groupManager.addToGroup}
            onReorderLayers={reorderLayers}
            onGroupLayers={groupManager.createGroup}
            onUngroupLayer={groupManager.ungroup}
            onDeleteInternalElement={deleteInternalElement}
            getLayerIndexInParent={getLayerIndexInParent}
            onClose={() => setShowFloatingLayers(false)}
          />
        )}
      </div>
    </>
  );
}