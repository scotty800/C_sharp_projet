import { shopCustomizationService } from './shopCustomization';
import { productService } from './products';
import { normalizeStudioProducts } from '@/components/shop-studio/lib/normalizeProduct';
import { parsePagesAndBlocks } from '@/components/shop-studio/lib/pagesMeta';
import { BlockUI, ProductCustomization, StudioPage, StudioProduct } from '@/types/studio';

export interface ShopRenderData {
  shop: any;
  customization: any;
  canvasFilters: any;
  pages: StudioPage[];
  blocksByPage: Map<string, BlockUI[]>;
  hasStudioContent: boolean;
  productsList: StudioProduct[];
  globalProductCustomizations: Map<number, ProductCustomization>;
  usedFonts: string[]; // ⭐ NOUVEAU
}

/**
 * Recense toutes les polices personnalisées utilisées dans la boutique :
 * customization globale + props des blocs + configs des slots produits
 * (traditionalConfig/interactiveConfig ne sont pas dans block.props, donc
 * il faut les inspecter à part).
 */
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

    // ⭐ Polices définies au niveau des slots (grille produits)
    if (block.type === 'products' && block.gridConfig?.slots) {
      block.gridConfig.slots.forEach(slot => {
        const cc: any = slot.customConfig;
        if (cc?.traditionalConfig?.nameFont) fonts.push(cc.traditionalConfig.nameFont);
        if (cc?.traditionalConfig?.priceFont) fonts.push(cc.traditionalConfig.priceFont);
        if (cc?.interactiveConfig?.nameFont) fonts.push(cc.interactiveConfig.nameFont);
        if (cc?.interactiveConfig?.priceFont) fonts.push(cc.interactiveConfig.priceFont);
      });
    }
  });

  return [...new Set(fonts.filter(f => f && f !== 'Inter'))];
}

export const shopRenderService = {
  /** `shop` doit déjà avoir été chargé (évite un double appel réseau). */
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

    const { pages, blocks, productCustomizations } = parsePagesAndBlocks(blocksFromApi as any[]);

    const blocksByPage = new Map<string, BlockUI[]>();
    pages.forEach(p => blocksByPage.set(p.id, []));
    blocks.forEach(b => {
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
    };

    // ⭐ Calcul des polices à charger
    const usedFonts = collectUsedFonts(finalCustomization, blocks);

    return {
      shop,
      customization: finalCustomization,
      canvasFilters,
      pages,
      blocksByPage,
      hasStudioContent: blocks.length > 0,
      productsList,
      globalProductCustomizations,
      usedFonts,
    };
  },
};