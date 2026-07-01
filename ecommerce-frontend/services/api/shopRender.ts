import { shopCustomizationService } from './shopCustomization';
import { productService } from './products';
import { normalizeStudioProducts } from '@/components/shop-studio/lib/normalizeProduct';
import { parsePagesAndBlocks } from '@/components/shop-studio/lib/pagesMeta';
import { isNavbarBlockType } from '@/components/shop-studio/lib/navbar/navbarTemplates';
import { BlockUI, ProductCustomization, StudioPage, StudioProduct } from '@/types/studio';

const PAGES_META_BLOCK_TYPE = '__pages_meta__';

export interface ShopRenderData {
  shop: any;
  customization: any;
  canvasFilters: any;
  pages: StudioPage[];
  blocksByPage: Map<string, BlockUI[]>;
  globalBlocks: BlockUI[];
  hasStudioContent: boolean;
  productsList: StudioProduct[];
  globalProductCustomizations: Map<number, ProductCustomization>;
  usedFonts: string[];
}

function collectUsedFonts(customization: any, blocks: BlockUI[]): string[] {
  const fonts: string[] = [];

  if (customization?.headingFont) fonts.push(customization.headingFont);
  if (customization?.bodyFont) fonts.push(customization.bodyFont);
  if (customization?.primaryFont) fonts.push(customization.primaryFont);
  if (customization?.secondaryFont) fonts.push(customization.secondaryFont);
  if (customization?.accentFont) fonts.push(customization.accentFont);

  blocks.forEach(block => {
    const props = block.props || {};
    if (props.fontFamily) fonts.push(props.fontFamily);
    if (props.titleFont) fonts.push(props.titleFont);
    if (props.subtitleFont) fonts.push(props.subtitleFont);
    if (props.buttonFont) fonts.push(props.buttonFont);
    if (props.priceFont) fonts.push(props.priceFont);
    if (props.productNameFont) fonts.push(props.productNameFont);

    if (block.type === 'products' && block.gridConfig?.slots) {
      block.gridConfig.slots.forEach(slot => {
        const cc: any = slot.customConfig;
        if (cc?.traditionalConfig?.nameFont) fonts.push(cc.traditionalConfig.nameFont);
        if (cc?.traditionalConfig?.priceFont) fonts.push(cc.traditionalConfig.priceFont);
        if (cc?.interactiveConfig?.nameFont) fonts.push(cc.interactiveConfig.nameFont);
        if (cc?.interactiveConfig?.priceFont) fonts.push(cc.interactiveConfig.priceFont);
      });
    }

    if (isNavbarBlockType(block.type) && props.navConfig) {
      const nav = props.navConfig;
      if (nav.defaultButtonStyle?.fontFamily) fonts.push(nav.defaultButtonStyle.fontFamily);
      nav.buttons?.forEach((btn: any) => {
        if (btn.style?.fontFamily) fonts.push(btn.style.fontFamily);
      });
    }
  });

  return [...new Set(fonts.filter(f => f && f !== 'Inter'))];
}

export const shopRenderService = {
  async getRenderData(shop: any): Promise<ShopRenderData> {
    const shopId = shop.id;

    const [customization, blocksFromApi, canvasFilters, background, rawProducts] = await Promise.all([
      shopCustomizationService.getByShopId(shopId).catch(() => null),
      shopCustomizationService.getBlocks(shopId).catch(() => []),
      shopCustomizationService.getCanvasFilters(shopId).catch(() => ({
        globalCssFilter: 'none', globalBrightness: 1, globalContrast: 1, globalSaturation: 1, globalBlur: 0,
      })),
      shopCustomizationService.getBackground(shopId).catch(() => ({
        backgroundColor: '#FFFFFF', backgroundType: 'solid', backgroundValue: null, backgroundOpacity: 100,
      })),
      productService.getProductsByShopAll(shopId).catch(() => []),
    ]);

    // ⭐ Récupération de pageAnimationsConfig depuis le bloc meta
    let pageAnimationsConfig: any = null;
    const pagesMetaRaw = (blocksFromApi as any[]).find((b: any) => b.type === PAGES_META_BLOCK_TYPE);
    if (pagesMetaRaw?.settings?.pageAnimationsConfig) {
      try {
        const raw = pagesMetaRaw.settings.pageAnimationsConfig;
        pageAnimationsConfig = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        pageAnimationsConfig = null;
      }
    }

    // ⭐ parsePagesAndBlocks conserve linkedProductId
    const { pages, blocks, productCustomizations } = parsePagesAndBlocks(blocksFromApi as any[]);

    // ⭐ Isolation des Navbars (blocs globaux)
    const globalBlocks = blocks.filter(b => isNavbarBlockType(b.type));
    const pageScopedBlocks = blocks.filter(b => !isNavbarBlockType(b.type));

    const blocksByPage = new Map<string, BlockUI[]>();
    pages.forEach(p => blocksByPage.set(p.id, []));
    pageScopedBlocks.forEach(b => {
      const pid = b.pageId || pages[0].id;
      if (!blocksByPage.has(pid)) blocksByPage.set(pid, []);
      blocksByPage.get(pid)!.push(b);
    });

    const productsList = normalizeStudioProducts(rawProducts as any[]);
    const globalProductCustomizations = new Map<number, ProductCustomization>(
      Object.entries(productCustomizations).map(([k, v]) => [Number(k), v as ProductCustomization])
    );

    const finalCustomization = {
      ...(customization || {}),
      shopId,
      primaryColor: customization?.PrimaryColor || shop.themeColor || '#2563EB',
      backgroundColor: background?.backgroundColor || shop.backgroundColor || '#FFFFFF',
      textColor: customization?.TextColor || shop.textColor || '#1F2937',
      backgroundType: background?.backgroundType || 'solid',
      backgroundValue: background?.backgroundValue || null,
      backgroundOpacity: background?.backgroundOpacity ?? 100,
      pageAnimationsConfig,
    };

    const usedFonts = collectUsedFonts(finalCustomization, blocks);

    return {
      shop,
      customization: finalCustomization,
      canvasFilters,
      pages,
      blocksByPage,
      globalBlocks,
      hasStudioContent: blocks.length > 0,
      productsList,
      globalProductCustomizations,
      usedFonts,
    };
  },
};