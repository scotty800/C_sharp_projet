'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { shopCustomizationService } from '@/services/api/shopCustomization';
import { filterService } from '@/services/api/filters';
import { productService } from '@/services/api/products';
import StudioToolbar from './StudioToolbar';
import StudioCanvas from './StudioCanvas';
import StudioSidebar from './StudioSidebar';
import AddBlockPanel from './add/AddBlockPanel';
import AddToParentPanel from './add/AddToParentPanel';
import FloatingLayersPanel from './FloatingLayersPanel';
import StudioPagesBar from './Studiopagesbar';
import { GoogleFontsLoader } from './GoogleFontsLoader';
import { useGroupManager } from '@/hooks/useGroupManager';
import { createDefaultSlideProps } from './blocks/CarouselSlideBlock';
import { ProductGridConfig, ProductGridSlot, StudioProduct, ProductCustomization, CreateStudioProduct } from '@/types/studio';
import { normalizeStudioProducts } from '@/components/shop-studio/lib/normalizeProduct';

// ⭐ A) IMPORTS À AJOUTER EN HAUT DU FICHIER
import ProductPageSidebar from './panels/Productpagesidebar';
import { useProductPageBuilder } from '@/hooks/Useproductpagebuilder';
import { ProductPageConfig } from '../../types/Productpage';

export interface BlockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  positionType?: 'absolute' | 'relative' | 'fixed';
}

export interface GridSlot {
  id: string;
  row: number;
  col: number;
  productId: string | null;
  product?: any;
  customTitle?: string;
  customImage?: string;
  isEmpty: boolean;
}

export interface StudioPage {
  id: string;
  name: string;
  order: number;
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient';
  backgroundValue?: string | null;
  backgroundOpacity?: number;
  canvasX?: number;
  canvasY?: number;
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
  gridConfig?: ProductGridConfig;
  pageId?: string;
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
  pages: StudioPage[];
  currentPageId: string;
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

export const DEFAULT_PAGE_ID = 'page-1';
const PAGES_META_BLOCK_TYPE = '__pages_meta__';
const PAGES_META_BLOCK_ID = '__pages_meta__';
const generatePageId = () => `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const generateSlotId = () => `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const cloneFreshGridConfig = (): ProductGridConfig => ({
  ...DEFAULT_GRID_CONFIG,
  slots: DEFAULT_GRID_CONFIG.slots.map(slot => ({ ...slot, id: generateSlotId() })),
});

const DEFAULT_GRID_CONFIG: ProductGridConfig = {
  layoutType: 'grid',
  columns: { desktop: 4, tablet: 2, mobile: 1 },
  rows: 2,
  gap: 16,
  padding: 16,
  dimension: {
    width: 1200,
    height: 600,
    widthUnit: 'px',
    heightUnit: 'px',
  },
  slots: [
    {
      id: 'slot-1',
      order: 0,
      productId: null,
      displayMode: 'traditional',
      frameStyle: 'square',
      imageIndex: null,
      gridPosition: { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
    },
    {
      id: 'slot-2',
      order: 1,
      productId: null,
      displayMode: 'traditional',
      frameStyle: 'square',
      imageIndex: null,
      gridPosition: { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
    },
    {
      id: 'slot-3',
      order: 2,
      productId: null,
      displayMode: 'traditional',
      frameStyle: 'square',
      imageIndex: null,
      gridPosition: { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
    },
    {
      id: 'slot-4',
      order: 3,
      productId: null,
      displayMode: 'traditional',
      frameStyle: 'square',
      imageIndex: null,
      gridPosition: { row: 0, col: 3, rowSpan: 1, colSpan: 1 },
    },
  ],
};

const DEFAULT_CUSTOMIZATION: ProductCustomization = {
  backgroundType: 'solid',
  backgroundColor: '#FFFFFF',
  backgroundOpacity: 100,
  backgroundBlur: 0,
  frameColor: '#E5E7EB',
  frameWidth: 2,
  frameShadow: true,
  frameShadowColor: '#00000020',
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
    const sortedMembers = [...members].sort((a, b) => (a.position?.zIndex || 0) - (b.position?.zIndex || 0));
    const memberNodes = sortedMembers.map(m => buildNode(m.id)).filter(Boolean);

    return {
      id: groupId,
      name: `Groupe ${groupId.slice(-6)}`,
      type: "group-container",
      zIndex: sortedMembers.length ? Math.max(...sortedMembers.map(m => m.position?.zIndex || 0)) : 0,
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
    const rawChildren = rawChildrenIds.map(id => blockMap.get(id)).filter((b): b is BlockUI => b !== undefined && b !== null);
    rawChildren.sort((a, b) => (a.order || 0) - (b.order || 0));

    const nonGroupedChildren = rawChildren.filter(child => !child.groupId && child.type !== 'group').map(child => child.id);
    const groupChildrenIds = groupsByParent.get(block.id) || [];
    const childNodes = [
      ...nonGroupedChildren.map(id => buildNode(id)),
      ...groupChildrenIds.map(gid => buildGroupContainer(gid, block.id)),
    ].filter(Boolean);

    return {
      id: block.id,
      name: block.props?.title || block.props?.text || block.props?.content || `${block.type} ${block.order + 1}`,
      type: block.type,
      zIndex: block.position?.zIndex || block.order,
      visible: block.isVisible !== false,
      locked: block.isLocked || false,
      children: childNodes,
      parentId: block.parentId || null,
      blockId: block.id,
      isExpanded: expandedLayers.has(block.id),
      groupId: block.groupId,
      gridConfig: block.gridConfig,
    };
  };

  const buildTree = (): any[] => {
    const root: any[] = [];
    const rootGroups = groupsByParent.get(null) || [];
    rootGroups.forEach(gid => root.push(buildGroupContainer(gid, null)));
    const rootBlocks = blocks.filter(b => !b.parentId && !b.groupId && b.type !== 'group').sort((a, b) => (a.order || 0) - (b.order || 0));
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
    pages: [{ id: DEFAULT_PAGE_ID, name: 'Page 1', order: 0 }],
    currentPageId: DEFAULT_PAGE_ID,
  });

  const [activeProductsBlockId, setActiveProductsBlockId] = useState<string | null>(null);
  const activeProductsBlockIdRef = useRef<string | null>(null);
  useEffect(() => { activeProductsBlockIdRef.current = activeProductsBlockId; }, [activeProductsBlockId]);

  const activeProductsBlock = useMemo(
    () => state.blocks.find(b => b.id === activeProductsBlockId && b.type === 'products') || null,
    [state.blocks, activeProductsBlockId]
  );
  const gridConfig = activeProductsBlock?.gridConfig || DEFAULT_GRID_CONFIG;

  useEffect(() => {
    if (activeProductsBlockId && !state.blocks.some(b => b.id === activeProductsBlockId)) {
      setActiveProductsBlockId(null);
    }
  }, [state.blocks, activeProductsBlockId]);

  const [productsList, setProductsList] = useState<StudioProduct[]>([]);
  const [productsVersion, setProductsVersion] = useState(0);
  const [productsLoading, setProductsLoading] = useState(false);
  
  const [selectedProductForCustomization, setSelectedProductForCustomization] = useState<{
    id: number;
    name: string;
    customization: ProductCustomization;
    slideCount?: number;
  } | null>(null);
  
  const [globalProductCustomizations, setGlobalProductCustomizations] = useState<Map<number, ProductCustomization>>(new Map());
  const globalProductCustomizationsRef = useRef<Map<number, ProductCustomization>>(new Map());
  
  useEffect(() => {
    globalProductCustomizationsRef.current = globalProductCustomizations;
  }, [globalProductCustomizations]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [zIndexVersion, setZIndexVersion] = useState(0);
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);
  const [addToParentData, setAddToParentData] = useState<{ parentId: string; parentType: string; parentName: string } | null>(null);

  // ⭐ B) ÉTAT À AJOUTER
  const [showProductPageSidebar, setShowProductPageSidebar] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);

  const [pageContentHeights, setPageContentHeights] = useState<Record<string, number>>({});
  const pageFrameElsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const [pageHeightObserver] = useState<ResizeObserver | null>(() => {
    if (typeof ResizeObserver === 'undefined') return null;
    return new ResizeObserver((entries) => {
      setPageContentHeights(prev => {
        let changed = false;
        const next = { ...prev };
        for (const entry of entries) {
          const pageId = (entry.target as HTMLElement).getAttribute('data-page-frame-id');
          if (!pageId) continue;
          const h = entry.contentRect.height;
          if (Math.abs((next[pageId] || 0) - h) > 2) {
            next[pageId] = h;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    });
  });

  useEffect(() => {
    return () => pageHeightObserver?.disconnect();
  }, [pageHeightObserver]);

  const registerPageFrameRef = useCallback((pageId: string, el: HTMLDivElement | null) => {
    if (!pageHeightObserver) return;
    const prevEl = pageFrameElsRef.current.get(pageId);
    if (prevEl && prevEl !== el) pageHeightObserver.unobserve(prevEl);
    if (el) {
      pageFrameElsRef.current.set(pageId, el);
      pageHeightObserver.observe(el);
    } else {
      pageFrameElsRef.current.delete(pageId);
    }
  }, [pageHeightObserver]);
  
  const draggingPageRef = useRef<string | null>(null);
  const pageDragStartRef = useRef({ x: 0, y: 0 });
  const pageOriginalPosRef = useRef({ x: 0, y: 0 });
  const pageDragRafId = useRef<number | null>(null);
  
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const zoomTransformRef = useRef<HTMLDivElement>(null);
  const liveZoomRef = useRef(state.zoom);
  const zoomAnimationRef = useRef<number | null>(null);
  
  const zoomSliderRef = useRef<HTMLInputElement>(null);

  const sliderDragAnchorRef = useRef<{ contentX: number; contentY: number; viewportX: number; viewportY: number } | null>(null);

  const easeInOutQuint = (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

  const refreshCanvas = useCallback(() => {
    setZIndexVersion(prev => prev + 1);
  }, []);

  const currentPageBlocks = useMemo(
    () => state.blocks.filter(b => (b.pageId || DEFAULT_PAGE_ID) === state.currentPageId),
    [state.blocks, state.currentPageId]
  );

  const getCustomizationForPage = useCallback((pageId: string) => {
    const page = state.pages.find(p => p.id === pageId);
    return {
      ...state.customization,
      backgroundColor: page?.backgroundColor ?? state.customization?.backgroundColor ?? '#FFFFFF',
      backgroundType: page?.backgroundType ?? state.customization?.backgroundType ?? 'solid',
      backgroundValue: page?.backgroundValue ?? state.customization?.backgroundValue ?? null,
      backgroundOpacity: page?.backgroundOpacity ?? state.customization?.backgroundOpacity ?? 100,
    };
  }, [state.customization, state.pages]);

  const currentPageCustomization = useMemo(
    () => getCustomizationForPage(state.currentPageId),
    [getCustomizationForPage, state.currentPageId]
  );

  const sortedPages = useMemo(
    () => [...state.pages].sort((a, b) => a.order - b.order),
    [state.pages]
  );

  const workspaceBounds = useMemo(() => {
    const FRAME_WIDTH = state.previewMode === 'desktop' ? 1200 : state.previewMode === 'tablet' ? 768 : 375;
    const FRAME_HEIGHT_FALLBACK = typeof window !== 'undefined' ? window.innerHeight : 800;
    const PADDING = 400;

    if (state.pages.length === 0) {
      return { width: FRAME_WIDTH + PADDING, height: FRAME_HEIGHT_FALLBACK + PADDING };
    }

    let maxRight = 0;
    let maxBottom = 0;
    state.pages.forEach(page => {
      const right = (page.canvasX ?? 0) + FRAME_WIDTH;
      const measuredHeight = pageContentHeights[page.id];
      const frameHeight = measuredHeight && measuredHeight > 0 ? measuredHeight : FRAME_HEIGHT_FALLBACK;
      const bottom = (page.canvasY ?? 0) + frameHeight;
      if (right > maxRight) maxRight = right;
      if (bottom > maxBottom) maxBottom = bottom;
    });

    return {
      width: maxRight + PADDING,
      height: maxBottom + PADDING,
    };
  }, [state.pages, state.previewMode, pageContentHeights]);

  const workspaceBoundsRef = useRef(workspaceBounds);
  useEffect(() => { workspaceBoundsRef.current = workspaceBounds; }, [workspaceBounds]);

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

  // ⭐ DÉCLARATION DE animateZoomAndCenterOnPage AVANT useProductPageBuilder
  const getViewportCenterAnchor = useCallback(() => {
    const scrollEl = canvasScrollRef.current;
    if (!scrollEl) return null;

    const currentZoomFraction = liveZoomRef.current / 100;
    const viewportX = scrollEl.clientWidth / 2;
    const viewportY = scrollEl.clientHeight / 2;

    const contentX = (scrollEl.scrollLeft + viewportX) / currentZoomFraction;
    const contentY = (scrollEl.scrollTop + viewportY) / currentZoomFraction;

    return { contentX, contentY, viewportX, viewportY };
  }, []);

  const applyZoomToDOM = useCallback((
    zoomPercent: number,
    anchor?: { contentX: number; contentY: number; viewportX: number; viewportY: number } | null,
    pageId?: string
  ) => {
    const scrollEl = canvasScrollRef.current;
    const transformEl = zoomTransformRef.current;
    if (!scrollEl || !transformEl) return;

    const zoomFraction = zoomPercent / 100;
    transformEl.style.transform = `scale(${zoomFraction})`;

    const outerWidth = workspaceBoundsRef.current.width * zoomFraction;
    const outerHeight = workspaceBoundsRef.current.height * zoomFraction;
    const outerEl = scrollEl.firstElementChild as HTMLElement | null;
    if (outerEl) {
      outerEl.style.width = outerWidth + 'px';
      outerEl.style.height = outerHeight + 'px';
    }

    if (anchor) {
      const targetScrollLeft = anchor.contentX * zoomFraction - anchor.viewportX;
      const targetScrollTop = anchor.contentY * zoomFraction - anchor.viewportY;
      scrollEl.scrollLeft = Math.max(0, targetScrollLeft);
      scrollEl.scrollTop = Math.max(0, targetScrollTop);
    } else if (pageId) {
      const frame = scrollEl.querySelector(`[data-page-frame-id="${pageId}"]`) as HTMLElement | null;
      if (frame) {
        const targetScrollLeft = (frame.offsetLeft + frame.offsetWidth / 2) * zoomFraction - scrollEl.clientWidth / 2;
        const targetScrollTop = (frame.offsetTop + frame.offsetHeight / 2) * zoomFraction - scrollEl.clientHeight / 2;
        scrollEl.scrollLeft = Math.max(0, targetScrollLeft);
        scrollEl.scrollTop = Math.max(0, targetScrollTop);
      }
    }

    liveZoomRef.current = zoomPercent;
  }, []);

  const animateZoomAndCenterOnPage = useCallback((pageId: string, targetZoom: number, durationMs: number = 700) => {
    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current);
      zoomAnimationRef.current = null;
    }

    const startZoom = liveZoomRef.current;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeInOutQuint(t);
      const currentZoom = startZoom + (targetZoom - startZoom) * eased;

      applyZoomToDOM(currentZoom, null, pageId);

      if (t < 1) {
        zoomAnimationRef.current = requestAnimationFrame(step);
      } else {
        zoomAnimationRef.current = null;
        setState(prev => ({ ...prev, zoom: targetZoom }));
      }
    };

    zoomAnimationRef.current = requestAnimationFrame(step);
  }, [applyZoomToDOM]);

  const animateZoomInPlace = useCallback((targetZoom: number, durationMs: number = 700) => {
    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current);
      zoomAnimationRef.current = null;
    }

    const anchor = getViewportCenterAnchor();
    const startZoom = liveZoomRef.current;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeInOutQuint(t);
      const currentZoom = startZoom + (targetZoom - startZoom) * eased;

      applyZoomToDOM(currentZoom, anchor);

      if (t < 1) {
        zoomAnimationRef.current = requestAnimationFrame(step);
      } else {
        zoomAnimationRef.current = null;
        setState(prev => ({ ...prev, zoom: targetZoom }));
      }
    };

    zoomAnimationRef.current = requestAnimationFrame(step);
  }, [applyZoomToDOM, getViewportCenterAnchor]);

  // ⭐ C) CONNECTER useProductPageBuilder (APRÈS la déclaration de animateZoomAndCenterOnPage)
  const { buildProductPage, isGenerating: isGeneratingProductPage } = useProductPageBuilder({
    pages: state.pages,
    blocks: state.blocks,
    setPages: (updater) => setState(prev => ({ ...prev, pages: updater(prev.pages), isDirty: true })),
    setBlocks: (updater) => setState(prev => ({ ...prev, blocks: updater(prev.blocks), isDirty: true })),
    setCurrentPageId: (id) => setState(prev => ({ ...prev, currentPageId: id })),
    animateZoomAndCenterOnPage,
  });

  // ⭐ D) HANDLER POUR GÉNÉRER LA PAGE
  const handleGenerateProductPage = useCallback((config: ProductPageConfig) => {
    buildProductPage(config);
    setShowProductPageSidebar(false);
  }, [buildProductPage]);

  const selectPage = useCallback((pageId: string) => {
    setState(prev => prev.currentPageId === pageId ? prev : { ...prev, currentPageId: pageId });
    animateZoomAndCenterOnPage(pageId, stateRef.current.zoom, 850);
  }, [animateZoomAndCenterOnPage]);

  const addPage = useCallback(() => {
    setState(prev => {
      const FRAME_WIDTH = 1200;
      const GAP = 120;
      const lastPage = [...prev.pages].sort((a, b) => (b.canvasX ?? 0) - (a.canvasX ?? 0))[0];
      const nextX = (lastPage?.canvasX ?? 0) + FRAME_WIDTH + GAP;

      const newPage: StudioPage = {
        id: generatePageId(),
        name: `Page ${prev.pages.length + 1}`,
        order: prev.pages.length,
        backgroundColor: prev.customization?.backgroundColor,
        backgroundType: prev.customization?.backgroundType,
        backgroundValue: prev.customization?.backgroundValue,
        backgroundOpacity: prev.customization?.backgroundOpacity,
        canvasX: nextX,
        canvasY: 0,
      };
      return {
        ...prev,
        pages: [...prev.pages, newPage],
        currentPageId: newPage.id,
        selectedBlockId: null,
        selectedTarget: 'text',
        isBackgroundSelected: false,
        isDirty: true,
      };
    });
  }, []);

  const deletePage = useCallback((pageId: string) => {
    setState(prev => {
      if (prev.pages.length <= 1) return prev;

      const pageIndex = prev.pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1) return prev;

      const remainingPages = prev.pages
        .filter(p => p.id !== pageId)
        .sort((a, b) => a.order - b.order)
        .map((p, idx) => ({ ...p, order: idx }));

      const remainingBlocks = prev.blocks.filter(b => (b.pageId || DEFAULT_PAGE_ID) !== pageId);

      let nextCurrentPageId = prev.currentPageId;
      let nextSelectedBlockId = prev.selectedBlockId;
      let nextIsBackgroundSelected = prev.isBackgroundSelected;

      if (prev.currentPageId === pageId) {
        const fallbackIndex = Math.max(0, Math.min(pageIndex - 1, remainingPages.length - 1));
        nextCurrentPageId = remainingPages[fallbackIndex]?.id ?? remainingPages[0].id;
        nextSelectedBlockId = null;
        nextIsBackgroundSelected = false;
      }

      return {
        ...prev,
        pages: remainingPages,
        blocks: remainingBlocks,
        currentPageId: nextCurrentPageId,
        selectedBlockId: nextSelectedBlockId,
        isBackgroundSelected: nextIsBackgroundSelected,
        isDirty: true,
      };
    });
    refreshCanvas();
  }, [refreshCanvas]);

  const renamePage = useCallback((pageId: string, name: string) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => (p.id === pageId ? { ...p, name: name.trim() || p.name } : p)),
      isDirty: true,
    }));
  }, []);

  const movePageTo = useCallback((pageId: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === pageId ? { ...p, canvasX: x, canvasY: y } : p),
      isDirty: true,
    }));
  }, []);

  const handlePageMouseDown = useCallback((e: React.MouseEvent, page: StudioPage) => {
    e.stopPropagation();
    draggingPageRef.current = page.id;
    pageDragStartRef.current = { x: e.clientX, y: e.clientY };
    pageOriginalPosRef.current = { x: page.canvasX ?? 0, y: page.canvasY ?? 0 };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingPageRef.current) return;
      if (pageDragRafId.current) return;

      pageDragRafId.current = requestAnimationFrame(() => {
        const pageId = draggingPageRef.current;
        if (!pageId) { pageDragRafId.current = null; return; }

        const zoom = stateRef.current.zoom / 100;
        const dx = (e.clientX - pageDragStartRef.current.x) / zoom;
        const dy = (e.clientY - pageDragStartRef.current.y) / zoom;

        const newX = pageOriginalPosRef.current.x + dx;
        const newY = Math.max(0, pageOriginalPosRef.current.y + dy);

        setState(prev => ({
          ...prev,
          pages: prev.pages.map(p => p.id === pageId ? { ...p, canvasX: newX, canvasY: newY } : p),
          isDirty: true,
        }));

        pageDragRafId.current = null;
      });
    };

    const handleMouseUp = () => {
      if (pageDragRafId.current) { 
        cancelAnimationFrame(pageDragRafId.current); 
        pageDragRafId.current = null; 
      }
      draggingPageRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const [displayZoom, setDisplayZoom] = useState(Math.round(state.zoom));
  
  useEffect(() => {
    setDisplayZoom(Math.round(state.zoom));
  }, [state.zoom]);

  useEffect(() => {
    if (zoomSliderRef.current) {
      zoomSliderRef.current.value = String(Math.round(state.zoom));
    }
  }, [state.zoom]);

  const handleZoomSliderInput = useCallback((newZoom: number) => {
    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current);
      zoomAnimationRef.current = null;
    }
    if (!sliderDragAnchorRef.current) {
      sliderDragAnchorRef.current = getViewportCenterAnchor();
    }
    setDisplayZoom(Math.round(newZoom));
    applyZoomToDOM(newZoom, sliderDragAnchorRef.current);
  }, [applyZoomToDOM, getViewportCenterAnchor]);

  const handleZoomSliderCommit = useCallback((newZoom: number) => {
    const anchor = sliderDragAnchorRef.current ?? getViewportCenterAnchor();
    sliderDragAnchorRef.current = null;

    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current);
      zoomAnimationRef.current = null;
    }

    const startZoom = liveZoomRef.current;
    const startTime = performance.now();
    const durationMs = 200;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeInOutQuint(t);
      const currentZoom = startZoom + (newZoom - startZoom) * eased;
      applyZoomToDOM(currentZoom, anchor);
      if (t < 1) {
        zoomAnimationRef.current = requestAnimationFrame(step);
      } else {
        zoomAnimationRef.current = null;
        setState(prev => ({ ...prev, zoom: newZoom }));
      }
    };
    zoomAnimationRef.current = requestAnimationFrame(step);
  }, [applyZoomToDOM, getViewportCenterAnchor]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(stateRef.current.zoom + 10, 200);
    animateZoomInPlace(newZoom);
  }, [animateZoomInPlace]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(stateRef.current.zoom - 10, 30);
    animateZoomInPlace(newZoom);
  }, [animateZoomInPlace]);

  const handleZoomReset = useCallback(() => {
    animateZoomAndCenterOnPage(stateRef.current.currentPageId, 70, 700);
  }, [animateZoomAndCenterOnPage]);

  useEffect(() => {
    return () => {
      if (zoomAnimationRef.current) {
        cancelAnimationFrame(zoomAnimationRef.current);
      }
    };
  }, []);

  const updateCustomization = useCallback((updates: any) => {
    const bgKeys = ['backgroundColor', 'backgroundType', 'backgroundValue', 'backgroundOpacity'];
    const isBackgroundUpdate = Object.keys(updates).some(k => bgKeys.includes(k));

    setState(prev => {
      if (isBackgroundUpdate) {
        return {
          ...prev,
          pages: prev.pages.map(p =>
            p.id === prev.currentPageId ? { ...p, ...updates } : p
          ),
          isDirty: true,
        };
      }
      return { ...prev, customization: { ...prev.customization, ...updates }, isDirty: true };
    });
  }, []);

  const handleOpenProductCustomization = useCallback((productId: number, productName: string, customization: ProductCustomization, slideCount?: number) => {
    setSelectedProductForCustomization({
      id: productId,
      name: productName,
      customization: { ...customization },
      slideCount,
    });
    setState(prev => ({ ...prev, activePanel: 'products' }));
  }, []);

  const handleCloseProductCustomization = useCallback(() => {
    setSelectedProductForCustomization(null);
  }, []);

  const updateGlobalProductCustomization = useCallback((productId: number, updates: Partial<ProductCustomization>) => {
    setGlobalProductCustomizations(prev => {
      const current = prev.get(productId) || DEFAULT_CUSTOMIZATION;
      const updated = { ...current, ...updates };
      const newMap = new Map(prev);
      newMap.set(productId, updated);
      return newMap;
    });
    setSelectedProductForCustomization(prev => {
      if (!prev || prev.id !== productId) return prev;
      return { ...prev, customization: { ...prev.customization, ...updates } };
    });
    setState(prev => ({ ...prev, isDirty: true }));
  }, []);

  const updateProductCustomizationRealtime = useCallback((productId: number, updates: Partial<ProductCustomization>) => {
    updateGlobalProductCustomization(productId, updates);
  }, [updateGlobalProductCustomization]);

  const linkProductToSlot = useCallback((blockId: string, slotId: string, product: StudioProduct) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => {
        if (block.id !== blockId || block.type !== 'products' || !block.gridConfig) return block;
        const nextSlots = block.gridConfig.slots.map(slot =>
          slot.id === slotId ? { ...slot, productId: product.id, linkedProduct: product } : slot
        );
        return { ...block, gridConfig: { ...block.gridConfig, slots: nextSlots } };
      }),
      isDirty: true,
    }));
  }, []);

  const stableHandleLinkProduct = useCallback((slotId: string, product: StudioProduct) => {
    if (!activeProductsBlockIdRef.current) return;
    linkProductToSlot(activeProductsBlockIdRef.current, slotId, product);
  }, [linkProductToSlot]);

  const unlinkProductFromSlot = useCallback((blockId: string, slotId: string) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => {
        if (block.id !== blockId || block.type !== 'products' || !block.gridConfig) return block;
        const nextSlots = block.gridConfig.slots.map(slot =>
          slot.id === slotId ? { ...slot, productId: null, linkedProduct: undefined } : slot
        );
        return { ...block, gridConfig: { ...block.gridConfig, slots: nextSlots } };
      }),
      isDirty: true,
    }));
  }, []);

  const stableUnlinkProductFromSlot = useCallback((slotId: string) => {
    if (!activeProductsBlockIdRef.current) return;
    unlinkProductFromSlot(activeProductsBlockIdRef.current, slotId);
  }, [unlinkProductFromSlot]);

  const updateSlotConfig = useCallback((blockId: string, slotId: string, config: Partial<ProductGridSlot>) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => {
        if (block.id !== blockId || block.type !== 'products' || !block.gridConfig) return block;
        const nextSlots = block.gridConfig.slots.map(slot => {
          if (slot.id !== slotId) return slot;
          if (config.customConfig) {
            const existingCustomConfig = slot.customConfig || {};
            const newCustomConfig = config.customConfig;
            const mergedCustomConfig = {
              ...existingCustomConfig,
              ...newCustomConfig,
              ...(newCustomConfig.traditionalConfig ? {
                traditionalConfig: { ...(existingCustomConfig.traditionalConfig || {}), ...newCustomConfig.traditionalConfig }
              } : {}),
              ...(newCustomConfig.interactiveConfig ? {
                interactiveConfig: { ...(existingCustomConfig.interactiveConfig || {}), ...newCustomConfig.interactiveConfig }
              } : {}),
            };
            return { ...slot, ...config, customConfig: mergedCustomConfig };
          }
          return { ...slot, ...config };
        });
        return { ...block, gridConfig: { ...block.gridConfig, slots: nextSlots } };
      }),
      isDirty: true,
    }));
  }, []);

  const stableHandleUpdateSlotConfig = useCallback((slotId: string, config: Partial<ProductGridSlot>) => {
    if (!activeProductsBlockIdRef.current) return;
    updateSlotConfig(activeProductsBlockIdRef.current, slotId, config);
  }, [updateSlotConfig]);

  const updateBlockGridConfig = useCallback((blockId: string, config: ProductGridConfig) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId && block.type === 'products' ? { ...block, gridConfig: config } : block
      ),
      isDirty: true,
    }));
  }, []);

  const stableHandleUpdateGrid = useCallback((config: ProductGridConfig) => {
    if (!activeProductsBlockIdRef.current) return;
    updateBlockGridConfig(activeProductsBlockIdRef.current, config);
  }, [updateBlockGridConfig]);

  const rehydrateAllProductBlocks = useCallback((products: StudioProduct[]) => {
    setState(prev => {
      let anyChange = false;
      const updatedBlocks = prev.blocks.map(block => {
        if (block.type !== 'products' || !block.gridConfig) return block;
        let blockChanged = false;
        const updatedSlots = block.gridConfig.slots.map(slot => {
          if (slot.productId == null) {
            if (slot.linkedProduct !== undefined) { blockChanged = true; return { ...slot, linkedProduct: undefined }; }
            return slot;
          }
          const product = products.find(p => p.id === slot.productId);
          if (!product) {
            if (slot.linkedProduct !== undefined) blockChanged = true;
            return { ...slot, linkedProduct: undefined };
          }
          const cur = slot.linkedProduct;
          if (!cur ||
              cur.imageUrl1 !== product.imageUrl1 || cur.imageUrl2 !== product.imageUrl2 || cur.imageUrl3 !== product.imageUrl3 ||
              cur.price !== product.price || cur.name !== product.name || cur.stock !== product.stock ||
              cur.sizes?.join(',') !== product.sizes?.join(',') || cur.colors?.join(',') !== product.colors?.join(',')) {
            blockChanged = true;
            return { ...slot, linkedProduct: product };
          }
          return slot;
        });
        if (!blockChanged) return block;
        anyChange = true;
        return { ...block, gridConfig: { ...block.gridConfig, slots: updatedSlots } };
      });
      return anyChange ? { ...prev, blocks: updatedBlocks } : prev;
    });
  }, []);

  const loadAllProducts = useCallback(async () => {
    if (!id) return;
    setProductsLoading(true);
    try {
      console.log('📦 Chargement de TOUS les produits pour le shop:', id);
      
      const products: any[] = await productService.getProductsByShopAll(Number(id));
      
      const normalizedProducts: StudioProduct[] = products.map((p: any) => {
        let sizesArray: string[] = [];
        if (Array.isArray(p.sizes)) {
          sizesArray = p.sizes;
        } else if (typeof p.sizes === 'string') {
          sizesArray = p.sizes ? (p.sizes as string).split(',').filter(Boolean) : [];
        } else if (typeof p.size === 'string') {
          sizesArray = p.size ? p.size.split(',').filter(Boolean) : [];
        } else if (Array.isArray(p.size)) {
          sizesArray = p.size;
        }
        
        let colorsArray: string[] = [];
        if (Array.isArray(p.colors)) {
          colorsArray = p.colors;
        } else if (typeof p.colors === 'string') {
          colorsArray = p.colors ? (p.colors as string).split(',').filter(Boolean) : [];
        } else if (typeof p.color === 'string') {
          colorsArray = p.color ? p.color.split(',').filter(Boolean) : [];
        } else if (Array.isArray(p.color)) {
          colorsArray = p.color;
        }
        
        const imageUrl1 = p.imageUrl1 || p.imageUrl || '';
        const imageUrl2 = p.imageUrl2 || '';
        const imageUrl3 = p.imageUrl3 || '';
        
        return {
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          stock: p.stock || 0,
          category: p.category || '',
          sizes: sizesArray,
          colors: colorsArray,
          imageUrl: imageUrl1,
          imageUrl1: imageUrl1,
          imageUrl2: imageUrl2,
          imageUrl3: imageUrl3,
          isInStock: (p.stock || 0) > 0,
          createdAt: p.createdAt,
        };
      });
      
      setProductsList(normalizedProducts);
      setProductsVersion(prev => prev + 1);
      
      rehydrateAllProductBlocks(normalizedProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits:', error);
      try {
        const response = await productService.getProductsByShop(Number(id), { pageSize: 100 });
        let extractedProducts: any[] = [];
        const data: any = response;
        if (data.products?.items) extractedProducts = data.products.items;
        else if (data.items) extractedProducts = data.items;
        else if (Array.isArray(data)) extractedProducts = data;
        
        const normalizedFallback: StudioProduct[] = extractedProducts.map((p: any) => {
          let sizesArray: string[] = [];
          if (Array.isArray(p.sizes)) {
            sizesArray = p.sizes;
          } else if (typeof p.sizes === 'string') {
            sizesArray = p.sizes ? (p.sizes as string).split(',').filter(Boolean) : [];
          } else if (typeof p.size === 'string') {
            sizesArray = p.size ? p.size.split(',').filter(Boolean) : [];
          } else if (Array.isArray(p.size)) {
            sizesArray = p.size;
          }
          
          let colorsArray: string[] = [];
          if (Array.isArray(p.colors)) {
            colorsArray = p.colors;
          } else if (typeof p.colors === 'string') {
            colorsArray = p.colors ? (p.colors as string).split(',').filter(Boolean) : [];
          } else if (typeof p.color === 'string') {
            colorsArray = p.color ? p.color.split(',').filter(Boolean) : [];
          } else if (Array.isArray(p.color)) {
            colorsArray = p.color;
          }
          
          const imageUrl1 = p.imageUrl1 || p.imageUrl || '';
          const imageUrl2 = p.imageUrl2 || '';
          const imageUrl3 = p.imageUrl3 || '';
          
          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: p.price,
            stock: p.stock || 0,
            category: p.category || '',
            sizes: sizesArray,
            colors: colorsArray,
            imageUrl: imageUrl1,
            imageUrl1: imageUrl1,
            imageUrl2: imageUrl2,
            imageUrl3: imageUrl3,
            isInStock: (p.stock || 0) > 0,
            createdAt: p.createdAt,
          };
        });
        
        setProductsList(normalizedFallback);
        setProductsVersion(prev => prev + 1);
        
        rehydrateAllProductBlocks(normalizedFallback);
        
      } catch (fallbackError) {
        console.error('❌ Erreur fallback:', fallbackError);
      }
    } finally {
      setProductsLoading(false);
    }
  }, [id, rehydrateAllProductBlocks]);

  const refreshProducts = useCallback(async () => {
    await loadAllProducts();
  }, [loadAllProducts]);

  useEffect(() => {
    const handleProductUpdated = (event: CustomEvent) => {
      const { productId, updates, timestamp } = event.detail;
      
      setProductsList(prev => {
        const newList = prev.map(p => {
          if (p.id === productId) {
            let sizesArray = p.sizes;
            if (updates.sizes !== undefined) {
              if (Array.isArray(updates.sizes)) {
                sizesArray = updates.sizes;
              } else if (typeof updates.sizes === 'string') {
                sizesArray = updates.sizes ? (updates.sizes as string).split(',').filter(Boolean) : [];
              } else {
                sizesArray = [];
              }
            } else if ((updates as any).size !== undefined) {
              const sizeValue = (updates as any).size;
              if (typeof sizeValue === 'string') {
                sizesArray = sizeValue ? sizeValue.split(',').filter(Boolean) : [];
              } else if (Array.isArray(sizeValue)) {
                sizesArray = sizeValue;
              } else {
                sizesArray = [];
              }
            }
            
            let colorsArray = p.colors;
            if (updates.colors !== undefined) {
              if (Array.isArray(updates.colors)) {
                colorsArray = updates.colors;
              } else if (typeof updates.colors === 'string') {
                colorsArray = updates.colors ? (updates.colors as string).split(',').filter(Boolean) : [];
              } else {
                colorsArray = [];
              }
            } else if ((updates as any).color !== undefined) {
              const colorValue = (updates as any).color;
              if (typeof colorValue === 'string') {
                colorsArray = colorValue ? colorValue.split(',').filter(Boolean) : [];
              } else if (Array.isArray(colorValue)) {
                colorsArray = colorValue;
              } else {
                colorsArray = [];
              }
            }
            
            const updatedProduct: StudioProduct = { 
              ...p, 
              ...updates,
              sizes: sizesArray,
              colors: colorsArray,
              imageUrl1: updates.imageUrl1 !== undefined ? updates.imageUrl1 : p.imageUrl1,
              imageUrl2: updates.imageUrl2 !== undefined ? updates.imageUrl2 : p.imageUrl2,
              imageUrl3: updates.imageUrl3 !== undefined ? updates.imageUrl3 : p.imageUrl3,
            };
            return updatedProduct;
          }
          return p;
        });
        return newList;
      });
      setProductsVersion(prev => prev + 1);
      
      window.dispatchEvent(new CustomEvent('productDataChanged', { 
        detail: { productId, updates, timestamp: Date.now() }
      }));
    };
    
    window.addEventListener('productUpdated', handleProductUpdated as EventListener);
    return () => window.removeEventListener('productUpdated', handleProductUpdated as EventListener);
  }, []);

  useEffect(() => {
    const handleRefreshProducts = () => {
      loadAllProducts();
    };
    
    window.addEventListener('refreshProducts', handleRefreshProducts);
    return () => window.removeEventListener('refreshProducts', handleRefreshProducts);
  }, [loadAllProducts]);

  useEffect(() => {
    const handleProductsChanged = () => {
      loadAllProducts();
    };
    
    window.addEventListener('productsChanged', handleProductsChanged);
    return () => window.removeEventListener('productsChanged', handleProductsChanged);
  }, [loadAllProducts]);

  useEffect(() => {
    const handleProductsListChanged = (event: CustomEvent) => {
      const { productId, updates } = event.detail;
      
      setProductsList(prev => {
        const newList = prev.map(p => {
          if (p.id === productId) {
            const updatedProduct = { 
              ...p, 
              ...updates,
              imageUrl1: updates.imageUrl1 !== undefined ? updates.imageUrl1 : p.imageUrl1,
              imageUrl2: updates.imageUrl2 !== undefined ? updates.imageUrl2 : p.imageUrl2,
              imageUrl3: updates.imageUrl3 !== undefined ? updates.imageUrl3 : p.imageUrl3,
            };
            return updatedProduct;
          }
          return p;
        });
        return newList;
      });
      
      setState(prev => {
        let anyChange = false;
        const updatedBlocks = prev.blocks.map(block => {
          if (block.type !== 'products' || !block.gridConfig) return block;
          let blockChanged = false;
          const updatedSlots = block.gridConfig.slots.map(slot => {
            if (slot.linkedProduct && slot.linkedProduct.id === productId) {
              blockChanged = true;
              return {
                ...slot,
                linkedProduct: {
                  ...slot.linkedProduct,
                  ...updates,
                  imageUrl1: updates.imageUrl1 !== undefined ? updates.imageUrl1 : slot.linkedProduct.imageUrl1,
                  imageUrl2: updates.imageUrl2 !== undefined ? updates.imageUrl2 : slot.linkedProduct.imageUrl2,
                  imageUrl3: updates.imageUrl3 !== undefined ? updates.imageUrl3 : slot.linkedProduct.imageUrl3,
                }
              };
            }
            return slot;
          });
          if (!blockChanged) return block;
          anyChange = true;
          return { ...block, gridConfig: { ...block.gridConfig, slots: updatedSlots } };
        });
        return anyChange ? { ...prev, blocks: updatedBlocks } : prev;
      });
      
      setProductsVersion(prev => prev + 1);
    };
    
    window.addEventListener('productsListChanged', handleProductsListChanged as EventListener);
    return () => window.removeEventListener('productsListChanged', handleProductsListChanged as EventListener);
  }, []);

  useEffect(() => {
    if (productsList.length === 0) return;
    rehydrateAllProductBlocks(productsList);
  }, [productsList, rehydrateAllProductBlocks]);

  const stableHandleCreateProduct = useCallback(async (product: CreateStudioProduct) => {
    const response = await productService.createProductForShop(Number(id), product);

    await loadAllProducts();
    window.dispatchEvent(new CustomEvent('productsChanged'));

    return response as unknown as StudioProduct;
  }, [id, loadAllProducts]);

  useEffect(() => {
    if (id) {
      loadAllProducts();
    }
  }, [id, loadAllProducts]);

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
      const updatedBlocks = prev.blocks.map(b => b.id === parentBlockId ? { ...b, props: updatedProps } : b);
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
          return prev;
        }
      }
      let current = newParentId;
      while (current) {
        const parent = prev.blocks.find(b => b.id === current);
        if (parent?.parentId === layerId) {
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
          // ⭐ CORRECTIF : pour les blocs de type texte (text, title, button)
          // on met height: 0 → auto pour qu'ils s'ajustent à leur contenu
          const isTextLikeBlock = ['text', 'title', 'button'].includes(blockToMove.type);
          
          // ⭐ Convertit la largeur héritée en px en un vrai pourcentage
          // du nouveau parent, au lieu de réutiliser la valeur px comme
          // si c'était déjà un %.
          const getAbsoluteWidth = (b: BlockUI): number => {
            if (!b.parentId) return b.position?.width ?? 1200;
            const p = prev.blocks.find(bl => bl.id === b.parentId);
            if (!p) return b.position?.width ?? 1200;
            return ((b.position?.width ?? 100) / 100) * getAbsoluteWidth(p);
          };
          const newParentAbsWidth = getAbsoluteWidth(newParent);
          const rawWidthPx = blockToMove.position?.width ?? 200;
          const convertedWidthPercent = newParentAbsWidth > 0
            ? (rawWidthPx / newParentAbsWidth) * 100
            : 40;

          const defaultWidth = isTextLikeBlock
            ? Math.max(10, Math.min(60, convertedWidthPercent))
            : Math.min(blockToMove.position?.width ?? 80, 80);

          newPosition = {
            x: Math.max(0, Math.min(100 - defaultWidth, 50 - defaultWidth / 2)),
            y: 20,
            width: Math.max(10, Math.min(90, defaultWidth)),
            height: isTextLikeBlock
              ? 0
              : Math.max(10, Math.min(90, Math.min(blockToMove.position?.height ?? 60, 60))),
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
        b.id === layerId ? { ...b, parentId: newParentId, position: newPosition, groupId: null } : b
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
      blocks: prev.blocks.map(b => b.id === layerId ? { ...b, isLocked: !b.isLocked } : b),
      isDirty: true,
    }));
    refreshCanvas();
  }, [refreshCanvas]);

  const reorderLayers = useCallback((startIndex: number, endIndex: number, parentId: string | null = null) => {
    setState(prev => {
      const siblings = prev.blocks
        .filter(b => (b.parentId ?? null) === parentId && (parentId !== null || (b.pageId || DEFAULT_PAGE_ID) === prev.currentPageId))
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
      const existingSlides = prev.blocks.filter(b => b.type === 'carousel-slide' && b.parentId === carouselBlockId);
      const slideIndex = existingSlides.length;
      const newSlide: BlockUI = {
        id: `carousel-slide-${Date.now()}-${Math.random()}`,
        type: 'carousel-slide',
        props: createDefaultSlideProps(slideIndex),
        position: { x: 0, y: 0, width: 100, height: 100, zIndex: slideIndex + 1, rotation: 0, positionType: 'relative' },
        order: slideIndex,
        isVisible: true,
        parentId: carouselBlockId,
        isLocked: false,
        groupId: null,
        pageId: carouselBlock.pageId || prev.currentPageId,
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
    const newBlockId = `${type}-${Date.now()}-${Math.random()}`;
    setState(prev => {
      const pageBlocks = prev.blocks.filter(b => (b.pageId || DEFAULT_PAGE_ID) === prev.currentPageId);

      let position: BlockPosition;
      if (parentId) {
        let defaultWidth = 40;
        if (type === 'title') defaultWidth = 60;
        else if (type === 'text') defaultWidth = 50;
        else if (type === 'button') defaultWidth = 30;
        else if (type === 'image') defaultWidth = 40;
        else if (type === 'shape') defaultWidth = 20;
        position = { x: 50 - defaultWidth / 2, y: 10, width: defaultWidth, height: 0, zIndex: 10, rotation: 0, positionType: 'relative' };
      } else {
        position = {
          x: 200 + pageBlocks.length * 20,
          y: 100 + pageBlocks.length * 30,
          width: props.width || 200,
          height: props.height || (type === 'text' ? 80 : 100),
          zIndex: pageBlocks.length + 1,
          rotation: 0,
          positionType: 'absolute',
        };
      }
      const newBlock: BlockUI = {
        id: newBlockId,
        type,
        props,
        position,
        order: parentId ? prev.blocks.filter(b => b.parentId === parentId).length : pageBlocks.length,
        isVisible: true,
        parentId,
        isLocked: false,
        groupId: null,
        gridConfig: type === 'products' ? cloneFreshGridConfig() : undefined,
        pageId: prev.currentPageId,
      };
      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
        isDirty: true,
        selectedBlockId: newBlock.id,
        selectedTarget: 'text',
        isBackgroundSelected: false,
      };
    });
    if (type === 'products') {
      setActiveProductsBlockId(newBlockId);
    }
    refreshCanvas();
  }, [refreshCanvas]);

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

  // ⭐ loadData avec Promise.all incluant rawProducts
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      try {
        setLoading(true);
        const [shop, customization, filters, blocksFromApi, canvasFilters, background, rawProducts] = await Promise.all([
          shopService.getShopById(Number(id)),
          shopCustomizationService.getByShopId(Number(id)).catch(() => null),
          filterService.getShopFilter(Number(id)).catch(() => null),
          shopCustomizationService.getBlocks(Number(id)).catch(() => []),
          shopCustomizationService.getCanvasFilters(Number(id)).catch(() => ({ globalCssFilter: 'none', globalBrightness: 1, globalContrast: 1, globalSaturation: 1, globalBlur: 0 })),
          shopCustomizationService.getBackground(Number(id)).catch(() => ({ backgroundColor: '#FFFFFF', backgroundType: 'solid', backgroundValue: null, backgroundOpacity: 100 })),
          productService.getProductsByShopAll(Number(id)).catch(() => []),
        ]);
        if (shop.ownerId !== user.id) {
          router.push('/');
          return;
        }

        let savedBlocks: BlockUI[] = [];

        console.log('📦 Blocs reçus du backend:', blocksFromApi);

        const pagesMetaRaw = (blocksFromApi as any[]).find((b: any) => b.type === PAGES_META_BLOCK_TYPE);
        const realBlocksFromApi = (blocksFromApi as any[]).filter((b: any) => b.type !== PAGES_META_BLOCK_TYPE);

        let loadedPages: StudioPage[] = [];
        if (pagesMetaRaw) {
          try {
            const raw = pagesMetaRaw.settings?.pages;
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (Array.isArray(parsed)) {
              loadedPages = parsed
                .filter((p: any) => p && p.id)
                .map((p: any, idx: number) => ({
                  id: String(p.id),
                  name: p.name || `Page ${idx + 1}`,
                  order: typeof p.order === 'number' ? p.order : idx,
                  backgroundColor: p.backgroundColor,
                  backgroundType: p.backgroundType,
                  backgroundValue: p.backgroundValue,
                  backgroundOpacity: p.backgroundOpacity,
                  canvasX: typeof p.canvasX === 'number' ? p.canvasX : idx * 1320,
                  canvasY: typeof p.canvasY === 'number' ? p.canvasY : 0,
                }));
            }
          } catch (e) {
            console.error('❌ Erreur parsing des pages:', e);
          }
        }
        if (loadedPages.length === 0) {
          loadedPages = [{ id: DEFAULT_PAGE_ID, name: 'Page 1', order: 0, canvasX: 0, canvasY: 0 }];
        }
        loadedPages.sort((a, b) => a.order - b.order);
        const validPageIds = new Set(loadedPages.map(p => p.id));
        const fallbackPageId = loadedPages[0].id;

        console.log('📄 Pages chargées:', loadedPages);

        const normalizeGridConfig = (raw: any): ProductGridConfig => ({
          layoutType: raw?.layoutType || 'grid',
          columns: raw?.columns || { desktop: 4, tablet: 2, mobile: 1 },
          rows: raw?.rows || 2,
          gap: raw?.gap ?? 16,
          padding: raw?.padding ?? 16,
          dimension: raw?.dimension || DEFAULT_GRID_CONFIG.dimension,
          uniformSize: raw?.uniformSize,
          slots: (raw?.slots && raw.slots.length > 0
            ? raw.slots.map((slot: any) => ({
                id: slot.id,
                order: slot.order ?? 0,
                productId: slot.productId ?? null,
                displayMode: slot.displayMode || 'traditional',
                frameStyle: slot.frameStyle || 'square',
                imageIndex: slot.imageIndex ?? null,
                gridPosition: slot.gridPosition || { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
                customSize: slot.customSize || undefined,
                carouselConfig: slot.carouselConfig || undefined,
                customConfig: slot.customConfig || undefined,
                linkedProduct: undefined,
              }))
            : DEFAULT_GRID_CONFIG.slots),
        });

        const mergedCustomizations: Record<string, any> = {};
        (realBlocksFromApi as any[]).filter((b: any) => b.type === 'products').forEach((b: any) => {
          const c = b.settings?.productCustomizations ?? b.gridConfig?.productCustomizations;
          if (c && typeof c === 'object') Object.assign(mergedCustomizations, c);
        });
        if (Object.keys(mergedCustomizations).length > 0) {
          const restoredMap = new Map<number, ProductCustomization>(
            Object.entries(mergedCustomizations).map(([k, v]) => [Number(k), v as ProductCustomization])
          );
          setGlobalProductCustomizations(restoredMap);
          globalProductCustomizationsRef.current = restoredMap;
          console.log('✅ Customisations produits restaurées:', restoredMap.size);
        }

        if (realBlocksFromApi.length > 0) {
          savedBlocks = (realBlocksFromApi as any[]).map((b: any) => {
            const blockGridConfig = b.gridConfig || b.settings?.gridConfig || null;
            
            const pos = b.position || {};
            const isParent = !!b.parentId;

            const rawPageId = b.settings?.pageId;
            const resolvedPageId = (typeof rawPageId === 'string' && validPageIds.has(rawPageId))
              ? rawPageId
              : fallbackPageId;
            
            return {
              id: b.id,
              type: b.type,
              props: b.settings || {},
              position: {
                x: pos.x ?? pos.X ?? (isParent ? 0 : 100),
                y: pos.y ?? pos.Y ?? (isParent ? 0 : 100),
                width: pos.width ?? pos.Width ?? (isParent ? 100 : 200),
                height: pos.height ?? pos.Height ?? (isParent ? 100 : 100),
                zIndex: pos.zIndex ?? pos.ZIndex ?? 1,
                rotation: pos.rotation ?? pos.Rotation ?? 0,
                positionType: (pos.positionType ?? pos.PositionType ?? (isParent ? 'relative' : 'absolute')),
              },
              order: b.order ?? 0,
              isVisible: b.isVisible !== false,
              parentId: b.parentId ?? null,
              isLocked: b.isLocked ?? false,
              groupId: b.groupId ?? null,
              gridConfig: b.type === 'products' ? normalizeGridConfig(blockGridConfig) : blockGridConfig,
              pageId: resolvedPageId,
            };
          });
          
          console.log(`📐 ${savedBlocks.length} blocs restaurés`);
        }

        // Normaliser et hydrater les produits dans les slots en une seule passe
        const normalizedProducts: StudioProduct[] = normalizeStudioProducts(rawProducts as any[]);

        const hydratedBlocks = savedBlocks.map(block => {
          if (block.type !== 'products' || !block.gridConfig) return block;
          const hydratedSlots = block.gridConfig.slots.map(slot => {
            if (slot.productId == null) return slot;
            const product = normalizedProducts.find(p => p.id === slot.productId);
            return product ? { ...slot, linkedProduct: product } : slot;
          });
          return { ...block, gridConfig: { ...block.gridConfig, slots: hydratedSlots } };
        });

        setProductsList(normalizedProducts);
        setProductsVersion(prev => prev + 1);

        setState(prev => ({
          ...prev,
          shop,
          blocks: hydratedBlocks,
          pages: loadedPages,
          currentPageId: fallbackPageId,
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

  useEffect(() => {
    const handleOpenAssetPicker = (event: CustomEvent) => {
      const { callback } = event.detail;
      setState(prev => ({ ...prev, activePanel: 'assets' }));
      (window as any).pendingAssetCallback = callback;
    };
    window.addEventListener('openAssetPicker', handleOpenAssetPicker as EventListener);
    return () => window.removeEventListener('openAssetPicker', handleOpenAssetPicker as EventListener);
  }, []);

  const sanitizeNumber = useCallback((v: any, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }, []);

  const saveChanges = useCallback(async () => {
    if (!state.isDirty) return;
    setSaving(true);
    try {
      const blocksToSave = state.blocks.map(block => {
        const isRelative = !!block.parentId || block.position?.positionType === 'relative';
        const pos = block.position || {};
        
        let settings = block.type === 'group' ? {} : { ...block.props };
        let blockGridConfig: any = undefined;

        settings.pageId = block.pageId || DEFAULT_PAGE_ID;
        
        if (block.type === 'products') {
          const currentGridConfig = block.gridConfig || DEFAULT_GRID_CONFIG;
          
          const cleanedGridConfig = {
            layoutType: currentGridConfig.layoutType || 'grid',
            columns: currentGridConfig.columns || { desktop: 4, tablet: 2, mobile: 1 },
            rows: currentGridConfig.rows || 2,
            gap: currentGridConfig.gap ?? 16,
            padding: currentGridConfig.padding ?? 16,
            dimension: currentGridConfig.dimension || DEFAULT_GRID_CONFIG.dimension,
            slots: currentGridConfig.slots.map(slot => ({
              id: slot.id,
              order: slot.order ?? 0,
              productId: slot.productId ?? null,
              displayMode: slot.displayMode || 'traditional',
              frameStyle: slot.frameStyle || 'square',
              imageIndex: slot.imageIndex ?? null,
              gridPosition: slot.gridPosition || { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
              customSize: slot.customSize || undefined,
              carouselConfig: slot.carouselConfig || undefined,
              ...(slot.customConfig ? { customConfig: slot.customConfig } : {}),
            })),
          };
          
          blockGridConfig = cleanedGridConfig;
          settings.gridConfig = cleanedGridConfig;
          
          const customizationsObj = Object.fromEntries(globalProductCustomizationsRef.current);
          const filteredCustomizations: Record<string, any> = {};
          Object.entries(customizationsObj).forEach(([key, value]) => {
            if (value && Object.keys(value).length > 0) {
              const isDefault = JSON.stringify(value) === JSON.stringify(DEFAULT_CUSTOMIZATION);
              if (!isDefault) {
                filteredCustomizations[key] = value;
              }
            }
          });
          
          if (Object.keys(filteredCustomizations).length > 0) {
            settings.productCustomizations = filteredCustomizations;
          }
        }
        
        return {
          id: block.id,
          type: block.type,
          name: block.type,
          order: sanitizeNumber(block.order, 0),
          isVisible: !!block.isVisible,
          parentId: block.parentId || null,
          isLocked: !!block.isLocked,
          groupId: block.groupId || null,
          gridConfig: blockGridConfig ?? null,
          position: {
            X: sanitizeNumber(isRelative ? pos.x : Math.round(pos.x), 0),
            Y: sanitizeNumber(isRelative ? pos.y : Math.round(pos.y), 0),
            Width: sanitizeNumber(isRelative ? pos.width : Math.round(pos.width), 100),
            Height: sanitizeNumber(isRelative ? pos.height : Math.round(pos.height), 100),
            ZIndex: sanitizeNumber(pos.zIndex, 1),
            Rotation: sanitizeNumber(pos.rotation, 0),
            PositionType: pos.positionType || (block.parentId ? 'relative' : 'absolute'),
            ParentId: block.parentId || null,
            GroupId: block.groupId || null,
            IsLocked: !!block.isLocked,
            Alignment: "center",
          },
          settings: settings,
          brightness: sanitizeNumber(block.props?.brightness, 1),
          contrast: sanitizeNumber(block.props?.contrast, 1),
          saturation: sanitizeNumber(block.props?.saturation, 1),
          blur: sanitizeNumber(block.props?.blur, 0),
          cssFilter: block.props?.cssFilter ?? "none",
        };
      });

      const pagesMetaBlock = {
        id: PAGES_META_BLOCK_ID,
        type: PAGES_META_BLOCK_TYPE,
        name: PAGES_META_BLOCK_TYPE,
        order: -1,
        isVisible: false,
        parentId: null,
        isLocked: false,
        groupId: null,
        gridConfig: null,
        position: {
          X: 0, Y: 0, Width: 1, Height: 1, ZIndex: 0, Rotation: 0,
          PositionType: 'absolute', ParentId: null, GroupId: null, IsLocked: false, Alignment: 'center',
        },
        settings: { pages: JSON.stringify(state.pages) },
        brightness: 1, contrast: 1, saturation: 1, blur: 0, cssFilter: 'none',
      };
      
      console.log('📄 Pages sauvegardées:', state.pages.length);
      
      await shopCustomizationService.updateBlocks(Number(id), [...blocksToSave, pagesMetaBlock] as any);
      await shopCustomizationService.updateCanvasFilters(Number(id), {
        globalBrightness: sanitizeNumber(state.canvasFilters?.globalBrightness, 1),
        globalContrast: sanitizeNumber(state.canvasFilters?.globalContrast, 1),
        globalSaturation: sanitizeNumber(state.canvasFilters?.globalSaturation, 1),
        globalBlur: sanitizeNumber(state.canvasFilters?.globalBlur, 0),
        globalCssFilter: state.canvasFilters?.globalCssFilter || 'none',
      });
      
      setState(prev => ({ ...prev, isDirty: false }));
      console.log('✅ Sauvegarde réussie');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  }, [id, state.blocks, state.isDirty, state.canvasFilters, state.pages, sanitizeNumber]);

  useEffect(() => {
    const handleForceSave = () => {
      console.log('🔥 forceSave déclenché ! isDirty:', state.isDirty, 'saving:', saving);
      if (state.isDirty && !saving) {
        console.log('💾 Sauvegarde forcée du texte');
        saveChanges();
      } else {
        console.log('⚠️ Sauvegarde ignorée : isDirty=', state.isDirty, 'saving=', saving);
      }
    };
    
    window.addEventListener('forceSave', handleForceSave);
    return () => window.removeEventListener('forceSave', handleForceSave);
  }, [state.isDirty, saving, saveChanges]);

  useEffect(() => {
    if (state.isDirty && !saving) {
      console.log('⏳ Timer de sauvegarde démarré');
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
      saveTimerRef.current = setTimeout(() => {
        console.log('💾 Sauvegarde automatique (timer)');
        saveChanges();
        saveTimerRef.current = null;
      }, 1500);
    }
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [state.isDirty, saving, saveChanges]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        console.log('🚪 Sauvegarde avant de quitter la page');
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }
        
        e.preventDefault();
        e.returnValue = '';
        
        saveChanges();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.isDirty, saveChanges]);

  useEffect(() => {
    (window as any).saveChanges = saveChanges;
    return () => {
      delete (window as any).saveChanges;
    };
  }, [saveChanges]);

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
    console.log('📝 updateBlock appelé pour', blockId, updates);
    setState(prev => {
      const newBlocks = prev.blocks.map(b => b.id === blockId ? { ...b, props: { ...b.props, ...updates } } : b);
      return {
        ...prev,
        blocks: newBlocks,
        isDirty: true,
      };
    });
  };

  const updateBlockPosition = useCallback((blockId: string, position: Partial<BlockPosition>) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, position: { ...(b.position ?? DEFAULT_POSITION), ...position } } : b),
      isDirty: true,
    }));
  }, []);

  const duplicateBlock = (blockId: string) => {
    const block = state.blocks.find(b => b.id === blockId);
    if (block) {
      const newBlock: BlockUI = {
        ...block,
        id: `${block.type}-${Date.now()}-${Math.random()}`,
        position: { ...(block.position ?? DEFAULT_POSITION), x: (block.position?.x ?? 100) + 20, y: (block.position?.y ?? 100) + 20, zIndex: currentPageBlocks.length + 1 },
        order: currentPageBlocks.length,
        parentId: block.parentId || null,
        isLocked: false,
        groupId: null,
        gridConfig: block.gridConfig
          ? { ...block.gridConfig, slots: block.gridConfig.slots.map(s => ({ ...s, id: generateSlotId() })) }
          : block.gridConfig,
        pageId: block.pageId || state.currentPageId,
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
    setState(prev => {
      const pageBlocks = prev.blocks.filter(b => (b.pageId || DEFAULT_PAGE_ID) === prev.currentPageId);
      const otherBlocks = prev.blocks.filter(b => (b.pageId || DEFAULT_PAGE_ID) !== prev.currentPageId);
      const reordered = [...pageBlocks];
      const [removed] = reordered.splice(startIndex, 1);
      reordered.splice(endIndex, 0, removed);
      const reorderedWithOrder = reordered.map((b, idx) => ({ ...b, order: idx }));
      return { ...prev, blocks: [...otherBlocks, ...reorderedWithOrder], isDirty: true };
    });
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
        props: { ...block.props, brightness: updates.brightness, contrast: updates.contrast, saturation: updates.saturation, blur: updates.blur, cssFilter: updates.cssFilter },
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

  const selectBackground = () => {
    if (isCropperOpen) return;
    setState(prev => ({ ...prev, selectedBlockId: null, selectedTarget: 'background', isBackgroundSelected: true }));
  };

  const selectBlock = (blockId: string | null, target?: 'text' | 'background') => {
    if (isCropperOpen && blockId !== null) return;
    setState(prev => {
      const block = blockId ? prev.blocks.find(b => b.id === blockId) : null;
      const newPageId = block?.pageId || prev.currentPageId;
      return {
        ...prev,
        selectedBlockId: blockId,
        selectedTarget: target || 'text',
        isBackgroundSelected: false,
        currentPageId: newPageId,
      };
    });
    const matched = blockId ? stateRef.current.blocks.find(b => b.id === blockId) : null;
    if (matched?.type === 'products') {
      setActiveProductsBlockId(blockId);
    }
  };

  const floatingLayers = generateLayersFromBlocks(currentPageBlocks, expandedLayers);

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
  }, [handleZoomIn, handleZoomOut, handleZoomReset]);

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

  const memoizedProductsList = useMemo(() => productsList, [productsList, productsVersion]);
  const memoizedGlobalProductCustomizations = useMemo(() => globalProductCustomizations, [globalProductCustomizations]);

  const stableSelectBlock = useCallback((blockId: string | null, target?: 'text' | 'background') => {
    selectBlock(blockId, target);
  }, [selectBlock]);

  const stableSelectBackground = useCallback(() => {
    selectBackground();
  }, [selectBackground]);

  const stableOnUpdateBlock = useCallback((id: string, updates: any) => {
    updateBlock(id, updates);
  }, [updateBlock]);

  const stableOnUpdateBlockPosition = useCallback((id: string, position: any) => {
    updateBlockPosition(id, position);
  }, [updateBlockPosition]);

  const stableOnReorderBlocks = useCallback((startIndex: number, endIndex: number) => {
    reorderBlocks(startIndex, endIndex);
  }, [reorderBlocks]);

  const stableOnDeleteBlock = useCallback((id: string) => {
    deleteBlock(id);
  }, [deleteBlock]);

  const stableOnDuplicateBlock = useCallback((id: string) => {
    duplicateBlock(id);
  }, [duplicateBlock]);

  const stableOnMoveGroup = useCallback((movedBlockId: string, deltaX: number, deltaY: number) => {
    groupManager.moveGroup(movedBlockId, deltaX, deltaY);
  }, [groupManager.moveGroup]);

  const stableGetGroupMembers = useCallback((groupId: string) => {
    return groupManager.getGroupMembers(groupId);
  }, [groupManager.getGroupMembers]);

  const stableOnResizeGroup = useCallback((groupId: string, bounds: { x: number; y: number; width: number; height: number }) => {
    groupManager.resizeGroup(groupId, bounds);
  }, [groupManager.resizeGroup]);

  const stableGetGroupBounds = useCallback((groupId: string) => {
    return groupManager.getGroupBounds(groupId);
  }, [groupManager.getGroupBounds]);

  const stableOnResizeGroupStart = useCallback((groupId: string) => {
    groupManager.startGroupResize(groupId);
  }, [groupManager.startGroupResize]);

  const stableOnResizeGroupEnd = useCallback(() => {
    groupManager.endGroupResize();
  }, [groupManager.endGroupResize]);

  const stableOnAddSlide = useCallback((carouselBlockId: string) => {
    addSlide(carouselBlockId);
  }, [addSlide]);

  const stableHandleOpenProductCustomization = useCallback((productId: number, productName: string, customization: ProductCustomization, slideCount?: number) => {
    handleOpenProductCustomization(productId, productName, customization, slideCount);
  }, [handleOpenProductCustomization]);

  const stableHandleUpdateGlobalProductCustomization = useCallback((productId: number, updates: Partial<ProductCustomization>) => {
    updateGlobalProductCustomization(productId, updates);
  }, [updateGlobalProductCustomization]);

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
        {/* ⭐ E) AJOUT DE onOpenProductPage DANS StudioToolbar */}
        <StudioToolbar
          shop={state.shop}
          saving={saving}
          onSave={saveChanges}
          previewMode={state.previewMode}
          onPreviewModeChange={handlePreviewModeChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          zoom={state.zoom}
          onOpenProductPage={() => setShowProductPageSidebar(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          <StudioSidebar
            shop={state.shop}
            blocks={currentPageBlocks}
            selectedBlockId={state.selectedBlockId}
            selectedTarget={state.selectedTarget}
            isBackgroundSelected={state.isBackgroundSelected}
            customization={currentPageCustomization}
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
            gridConfig={gridConfig}
            onUpdateGrid={stableHandleUpdateGrid}
            onSelectSlot={(slotId) => selectBlock(slotId, 'background')}
            onLinkProductToSlot={stableHandleLinkProduct}
            onUnlinkProductFromSlot={stableUnlinkProductFromSlot}
            onUpdateSlotConfig={stableHandleUpdateSlotConfig}
            onSelectBlock={selectBlock}
            onCreateProduct={stableHandleCreateProduct}
            selectedProductForCustomization={selectedProductForCustomization}
            onUpdateProductCustomization={updateProductCustomizationRealtime}
            onCloseProductCustomization={handleCloseProductCustomization}
            productsList={memoizedProductsList}
          />

          <div ref={canvasScrollRef} className="flex-1 overflow-auto p-4 bg-gray-800 relative">
            <div
              style={{
                position: 'relative',
                width: workspaceBounds.width * (state.zoom / 100) + 'px',
                height: workspaceBounds.height * (state.zoom / 100) + 'px',
              }}
            >
              <div
                ref={zoomTransformRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: workspaceBounds.width + 'px',
                  height: workspaceBounds.height + 'px',
                  transform: `scale(${state.zoom / 100})`,
                  transformOrigin: 'top left',
                }}
              >
                {sortedPages.map(page => {
                  const pageBlocks = state.blocks.filter(b => (b.pageId || DEFAULT_PAGE_ID) === page.id);
                  const frameWidth = state.previewMode === 'desktop' ? 1200 : state.previewMode === 'tablet' ? 768 : 375;
                  return (
                    <div
                      key={page.id}
                      data-page-frame-id={page.id}
                      ref={(el) => registerPageFrameRef(page.id, el)}
                      style={{
                        position: 'absolute',
                        left: (page.canvasX ?? 0) + 'px',
                        top: (page.canvasY ?? 0) + 'px',
                        width: frameWidth + 'px',
                      }}
                      className="flex flex-col gap-2"
                    >
                      <span
                        className="text-gray-400 text-xs font-medium cursor-grab active:cursor-grabbing select-none w-fit px-2 py-1 rounded hover:bg-gray-700/50 hover:text-white transition-colors"
                        onMouseDown={(e) => handlePageMouseDown(e, page)}
                        title="Glisser pour déplacer la page"
                      >
                        ⠿ {page.name}
                      </span>
                      <StudioCanvas
                        shop={state.shop}
                        blocks={pageBlocks}
                        customization={getCustomizationForPage(page.id)}
                        filters={state.filters}
                        canvasFilters={state.canvasFilters}
                        selectedBlockId={state.selectedBlockId}
                        isBackgroundSelected={state.isBackgroundSelected}
                        onSelectBlock={stableSelectBlock}
                        onSelectBackground={stableSelectBackground}
                        onUpdateBlock={stableOnUpdateBlock}
                        onUpdateBlockPosition={stableOnUpdateBlockPosition}
                        onReorderBlocks={stableOnReorderBlocks}
                        onDeleteBlock={stableOnDeleteBlock}
                        onDuplicateBlock={stableOnDuplicateBlock}
                        isCropperOpen={isCropperOpen}
                        onMoveGroup={stableOnMoveGroup}
                        getGroupMembers={stableGetGroupMembers}
                        onResizeGroup={stableOnResizeGroup}
                        getGroupBounds={stableGetGroupBounds}
                        onResizeGroupStart={stableOnResizeGroupStart}
                        onResizeGroupEnd={stableOnResizeGroupEnd}
                        onAddSlide={stableOnAddSlide}
                        onUpdateGridConfig={updateBlockGridConfig}
                        productsList={memoizedProductsList}
                        onLinkProduct={linkProductToSlot}
                        onOpenProductCustomization={stableHandleOpenProductCustomization}
                        globalProductCustomizations={memoizedGlobalProductCustomizations}
                        onUpdateGlobalProductCustomization={stableHandleUpdateGlobalProductCustomization}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="fixed bottom-4 right-4 flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-2 shadow-lg z-50">
              <input
                ref={zoomSliderRef}
                type="range"
                min={30}
                max={200}
                step={1}
                defaultValue={Math.round(state.zoom)}
                onInput={(e) => handleZoomSliderInput(Number((e.target as HTMLInputElement).value))}
                onChange={(e) => handleZoomSliderCommit(Number((e.target as HTMLInputElement).value))}
                className="w-40 accent-primary cursor-pointer"
              />
              <span className="text-white text-sm min-w-[42px] text-center tabular-nums">{displayZoom}%</span>
              <button onClick={handleZoomReset} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white text-sm px-3">Reset</button>
            </div>

            <StudioPagesBar
              pages={state.pages}
              currentPageId={state.currentPageId}
              allBlocks={state.blocks}
              backgroundColor={currentPageCustomization.backgroundColor}
              onSelectPage={selectPage}
              onAddPage={addPage}
              onDeletePage={deletePage}
            />
          </div>
        </div>

        {state.showAddPanel && !isCropperOpen && (
          <AddBlockPanel onClose={() => setState(prev => ({ ...prev, showAddPanel: false }))} onAddBlock={addBlock} />
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
            blocksCount={currentPageBlocks.length}
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

        {/* ⭐ F) AFFICHAGE DE LA SIDEBAR PRODUCT PAGE (overlay) */}
        {showProductPageSidebar && (
          <div className="fixed inset-y-0 left-14 z-[200] flex">
            <ProductPageSidebar
              products={memoizedProductsList}
              onClose={() => setShowProductPageSidebar(false)}
              onGeneratePage={handleGenerateProductPage}
              isGenerating={isGeneratingProductPage}
            />
          </div>
        )}
      </div>
    </>
  );
}