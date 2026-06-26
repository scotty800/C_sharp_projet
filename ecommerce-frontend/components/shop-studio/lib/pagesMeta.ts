import { BlockUI, BlockPosition, ProductGridConfig, StudioPage } from '@/types/studio';

export const DEFAULT_PAGE_ID = 'page-1';
export const PAGES_META_BLOCK_TYPE = '__pages_meta__';

const DEFAULT_GRID_SLOTS = [0, 1, 2, 3].map(i => ({
  id: `slot-${i + 1}`,
  order: i,
  productId: null,
  displayMode: 'traditional' as const,
  frameStyle: 'square' as const,
  imageIndex: null,
  gridPosition: { row: 0, col: i, rowSpan: 1, colSpan: 1 },
}));

export const DEFAULT_GRID_CONFIG: ProductGridConfig = {
  layoutType: 'grid',
  columns: { desktop: 4, tablet: 2, mobile: 1 },
  rows: 2,
  gap: 16,
  padding: 16,
  dimension: { width: 1200, height: 600, widthUnit: 'px', heightUnit: 'px' },
  slots: DEFAULT_GRID_SLOTS,
};

export function normalizeGridConfig(raw: any): ProductGridConfig {
  return {
    layoutType: raw?.layoutType || 'grid',
    columns: raw?.columns || { desktop: 4, tablet: 2, mobile: 1 },
    rows: raw?.rows || 2,
    gap: raw?.gap ?? 16,
    padding: raw?.padding ?? 16,
    dimension: raw?.dimension || DEFAULT_GRID_CONFIG.dimension,
    uniformSize: raw?.uniformSize,
    slots:
      raw?.slots?.length > 0
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
        : DEFAULT_GRID_CONFIG.slots,
  };
}

/** Sépare les métadonnées de pages des blocs de contenu réels, et résout le pageId de chaque bloc. */
export function parsePagesAndBlocks(blocksFromApi: any[]): {
  pages: StudioPage[];
  blocks: BlockUI[];
  productCustomizations: Record<string, any>;
} {
  const pagesMetaRaw = blocksFromApi.find((b: any) => b.type === PAGES_META_BLOCK_TYPE);
  const realBlocksFromApi = blocksFromApi.filter((b: any) => b.type !== PAGES_META_BLOCK_TYPE);

  let pages: StudioPage[] = [];
  if (pagesMetaRaw) {
    try {
      const raw = pagesMetaRaw.settings?.pages;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        pages = parsed
          .filter((p: any) => p?.id)
          .map((p: any, idx: number) => ({
            id: String(p.id),
            name: p.name || `Page ${idx + 1}`,
            order: typeof p.order === 'number' ? p.order : idx,
            backgroundColor: p.backgroundColor,
            backgroundType: p.backgroundType,
            backgroundValue: p.backgroundValue,
            backgroundOpacity: p.backgroundOpacity,
          }));
      }
    } catch {
      /* métadonnées corrompues -> fallback ci-dessous */
    }
  }
  if (pages.length === 0) pages = [{ id: DEFAULT_PAGE_ID, name: 'Page 1', order: 0 }];
  pages.sort((a, b) => a.order - b.order);

  const validPageIds = new Set(pages.map(p => p.id));
  const fallbackPageId = pages[0].id;

  const productCustomizations: Record<string, any> = {};
  realBlocksFromApi
    .filter((b: any) => b.type === 'products')
    .forEach((b: any) => {
      const c = b.settings?.productCustomizations ?? b.gridConfig?.productCustomizations;
      if (c && typeof c === 'object') Object.assign(productCustomizations, c);
    });

  const blocks: BlockUI[] = realBlocksFromApi.map((b: any) => {
    const blockGridConfig = b.gridConfig || b.settings?.gridConfig || null;
    const pos = b.position || {};
    const isParent = !!b.parentId;
    const rawPageId = b.settings?.pageId;
    const resolvedPageId =
      typeof rawPageId === 'string' && validPageIds.has(rawPageId) ? rawPageId : fallbackPageId;

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
        positionType: pos.positionType ?? pos.PositionType ?? (isParent ? 'relative' : 'absolute'),
      } as BlockPosition,
      order: b.order ?? 0,
      isVisible: b.isVisible !== false,
      parentId: b.parentId ?? null,
      isLocked: b.isLocked ?? false,
      groupId: b.groupId ?? null,
      gridConfig: b.type === 'products' ? normalizeGridConfig(blockGridConfig) : blockGridConfig,
      pageId: resolvedPageId,
    };
  });

  return { pages, blocks, productCustomizations };
}

export function getCustomizationForPage(pages: StudioPage[], pageId: string, globalCustomization: any) {
  const page = pages.find(p => p.id === pageId);
  return {
    ...globalCustomization,
    backgroundColor: page?.backgroundColor ?? globalCustomization?.backgroundColor ?? '#FFFFFF',
    backgroundType: page?.backgroundType ?? globalCustomization?.backgroundType ?? 'solid',
    backgroundValue: page?.backgroundValue ?? globalCustomization?.backgroundValue ?? null,
    backgroundOpacity: page?.backgroundOpacity ?? globalCustomization?.backgroundOpacity ?? 100,
  };
}