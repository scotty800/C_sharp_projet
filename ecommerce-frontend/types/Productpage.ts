import { StudioProduct, ProductCustomization, BlockUI } from '@/types/studio';

export type ProductPageTemplate = 'classic' | 'immersive' | 'gallery' | 'minimal';

export interface ProductImageStyleConfig {
  frameStyle?: 'square' | 'rounded';
  borderRadius?: number;
  imageBackground?: string;
  fit?: 'cover' | 'contain';
  frameBorderColor?: string;
  frameBorderWidth?: number;
}

export interface ProductPageConfig {
  template: ProductPageTemplate;
  product: StudioProduct | null;
  customization?: ProductCustomization;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  panelColor?: string;
  imageStyle?: ProductImageStyleConfig;
  showRelated?: boolean;
  showReviews?: boolean;
  showBreadcrumb?: boolean;
}

export interface ProductPageTemplateDefinition {
  id: ProductPageTemplate;
  name: string;
  description: string;
  tags: string[];
  preview: {
    primaryColor: string;
    accent: string;
    layout: 'split' | 'hero' | 'grid' | 'centered';
  };
}

export const PRODUCT_PAGE_TEMPLATES: ProductPageTemplateDefinition[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Disposition côte-à-côte : galerie à gauche, informations à droite. Idéal pour la mode et les accessoires.',
    tags: ['Mode', 'Accessoires', 'Universel'],
    preview: { primaryColor: '#1a1a2e', accent: '#e94560', layout: 'split' },
  },
  {
    id: 'immersive',
    name: 'Immersif',
    description: 'Hero plein écran avec image en fond, informations en overlay. Crée un impact visuel fort.',
    tags: ['Luxe', 'Art', 'Impact'],
    preview: { primaryColor: '#0f0f0f', accent: '#d4af37', layout: 'hero' },
  },
  {
    id: 'gallery',
    name: 'Galerie',
    description: "Mosaïque d'images en vedette avec prix et CTA flottants. Parfait pour les produits visuels.",
    tags: ['Déco', 'Art', 'Photo'],
    preview: { primaryColor: '#f8f5f0', accent: '#2d6a4f', layout: 'grid' },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Design épuré centré sur le produit. Typographie forte, espace blanc généreux.',
    tags: ['Tech', 'Design', 'Premium'],
    preview: { primaryColor: '#fafafa', accent: '#111111', layout: 'centered' },
  },
];

export function generateProductPageBlocks(
  config: ProductPageConfig,
  pageId: string,
  startZIndex: number = 1
): BlockUI[] {
  const { template, product } = config;
  if (!product) return [];

  const base = {
    isVisible: true,
    isLocked: false,
    groupId: null,
    parentId: null,
    pageId,
  };

  switch (template) {
    case 'classic':
      return generateClassicBlocks(product, config, base, startZIndex);
    case 'immersive':
      return generateImmersiveBlocks(product, config, base, startZIndex);
    case 'gallery':
      return generateGalleryBlocks(product, config, base, startZIndex);
    case 'minimal':
      return generateMinimalBlocks(product, config, base, startZIndex);
    default:
      return generateClassicBlocks(product, config, base, startZIndex);
  }
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ──────────────────────────────────────────────────────────────────────────
// HELPERS PARTAGÉS
// ──────────────────────────────────────────────────────────────────────────

function getProductImages(product: StudioProduct): string[] {
  return [product.imageUrl1, product.imageUrl2, product.imageUrl3].filter(
    (u): u is string => !!u && u.trim() !== ''
  );
}

function imgSrc(src: string) {
  return { src, url: src, imageUrl: src, image: src };
}

function titleProps(text: string) {
  return { title: text, text, content: text };
}

function getImageFrameProps(
  imageStyle: ProductImageStyleConfig | undefined,
  fallbackRadius: number,
  defaultBackground: string
) {
  let borderRadius = fallbackRadius;
  if (imageStyle?.frameStyle === 'square') borderRadius = 0;
  else if (imageStyle?.frameStyle === 'rounded') borderRadius = imageStyle.borderRadius ?? 12;

  return {
    objectFit: imageStyle?.fit === 'cover' ? 'cover' : 'contain',
    objectPosition: 'center',
    borderRadius,
    backgroundColor: imageStyle?.imageBackground || defaultBackground,
  };
}

function getBorderStyle(imageStyle: ProductImageStyleConfig | undefined, fallback?: string) {
  if (imageStyle?.frameBorderColor && imageStyle?.frameBorderWidth) {
    return { border: `${imageStyle.frameBorderWidth}px solid ${imageStyle.frameBorderColor}` };
  }
  return fallback ? { border: fallback } : {};
}

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const FRENCH_COLOR_MAP: Record<string, string> = {
  rouge: '#e53e3e', bleu: '#3182ce', vert: '#38a169', jaune: '#ecc94b',
  noir: '#1a1a1a', blanc: '#ffffff', gris: '#a0aec0', grise: '#a0aec0',
  rose: '#ed64a6', violet: '#805ad5', orange: '#ed8936', marron: '#92400e',
  beige: '#e8dcc8', or: '#d4af37', 'doré': '#d4af37', dore: '#d4af37',
  argent: '#c0c0c0', 'argenté': '#c0c0c0', marine: '#1e3a5f', turquoise: '#2dd4bf',
  kaki: '#7c7c4a', bordeaux: '#7c2d3e', corail: '#ff7f6b', ivoire: '#fffff0',
};

export function resolveColorValue(raw: string): string {
  if (!raw) return '#cccccc';
  const trimmed = raw.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return trimmed;
  if (/^rgb/i.test(trimmed)) return trimmed;
  const key = trimmed.toLowerCase();
  if (FRENCH_COLOR_MAP[key]) return FRENCH_COLOR_MAP[key];
  return trimmed;
}

// ⭐ MODIFICATION — generateSizeAndColorBlocks avec boutons interactifs ET boundField
function generateSizeAndColorBlocks(
  product: StudioProduct,
  startX: number,
  startY: number,
  base: any,
  z: number,
  textColor: string,
  labelColor: string,
  width: number = 380,
  accentColor: string = '#111111'
): { blocks: BlockUI[]; endY: number } {
  const blocks: BlockUI[] = [];
  let y = startY;

  if (product.sizes && product.sizes.length > 0) {
    blocks.push({
      ...base,
      id: uid('sizelabel'),
      type: 'text',
      order: 500,
      position: { x: startX, y, width, height: 14, zIndex: z, rotation: 0, positionType: 'absolute' },
      props: {
        content: 'Taille',
        fontSize: 9,
        fontFamily: 'Inter',
        fontWeight: '600',
        textColor: labelColor,
        letterSpacing: 0.8,
      },
    });
    y += 20;

    const btnSize = 34;
    const gapPx = 8;
    product.sizes.slice(0, 8).forEach((size, i) => {
      blocks.push({
        ...base,
        id: uid('sizebtn'),
        type: 'button',
        order: 501 + i,
        position: {
          x: startX + i * (btnSize + gapPx),
          y,
          width: btnSize,
          height: btnSize,
          zIndex: z + 1,
          rotation: 0,
          positionType: 'absolute',
        },
        props: {
          text: size,
          action: 'selectSize',
          variantValue: size,
          boundField: 'sizeButton',
          backgroundColor: 'transparent',
          textColor,
          fontSize: 11,
          fontFamily: 'Inter',
          fontWeight: '600',
          borderRadius: 4,
          border: `1px solid ${textColor}40`,
        },
      });
    });
    y += btnSize + 16;
  }

  if (product.colors && product.colors.length > 0) {
    blocks.push({
      ...base,
      id: uid('colorlabel'),
      type: 'text',
      order: 520,
      position: { x: startX, y, width, height: 14, zIndex: z, rotation: 0, positionType: 'absolute' },
      props: {
        content: 'Couleur',
        fontSize: 9,
        fontFamily: 'Inter',
        fontWeight: '600',
        textColor: labelColor,
        letterSpacing: 0.8,
      },
    });
    y += 20;

    const swatchSize = 22;
    const gapPx = 8;
    product.colors.slice(0, 10).forEach((color, i) => {
      blocks.push({
        ...base,
        id: uid('swatch'),
        type: 'shape',
        order: 521 + i,
        position: {
          x: startX + i * (swatchSize + gapPx),
          y,
          width: swatchSize,
          height: swatchSize,
          zIndex: z + 1,
          rotation: 0,
          positionType: 'absolute',
        },
        props: {
          shapeType: 'rectangle',
          backgroundColor: resolveColorValue(color),
          opacity: 100,
          borderRadius: swatchSize / 2,
          border: '2px solid #ffffff',
          action: 'selectColor',
          variantValue: color,
        },
      });
    });
    y += swatchSize + 12;
  }

  return { blocks, endY: y };
}

// ──────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — CLASSIQUE
// Canvas : 1100 × 700
// ──────────────────────────────────────────────────────────────────────────

function generateClassicBlocks(
  product: StudioProduct,
  config: ProductPageConfig,
  base: any,
  z: number
): BlockUI[] {
  const accent = config.accentColor || '#111111';
  const bg = config.backgroundColor || '#ffffff';
  const text = config.textColor || '#111111';
  const panelColor = config.panelColor || '#fafafa';
  const images = getProductImages(product);
  const imgStyle = config.imageStyle;
  let order = 0;
  const next = () => order++;

  const blocks: BlockUI[] = [
    // Fond
    {
      ...base, id: uid('bg'), type: 'shape', order: next(),
      position: { x: 0, y: 0, width: 1100, height: 700, zIndex: z, rotation: 0, positionType: 'absolute' },
      props: { shapeType: 'rectangle', backgroundColor: bg, opacity: 100 },
    },
    // ⭐ Image principale — boundField: 'mainImage'
    {
      ...base, id: uid('img-main'), type: 'image', order: next(),
      position: { x: 24, y: 24, width: 580, height: 580, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
      props: { ...imgSrc(images[0] || ''), boundField: 'mainImage', ...getImageFrameProps(imgStyle, 0, '#f4f4f4'), ...getBorderStyle(imgStyle) },
    },
  ];

  // ⭐ Vignettes — TOUJOURS 2 SLOTS (plus conditionné)
  for (let i = 0; i < 2; i++) {
    blocks.push({
      ...base, id: uid('thumb'), type: 'image', order: next(),
      position: { x: 24 + i * 194, y: 612, width: 184, height: 64, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
      props: { ...imgSrc(images[i + 1] || ''), boundField: `thumbImage:${i}`, ...getImageFrameProps(imgStyle, 0, '#f4f4f4'), ...getBorderStyle(imgStyle, '1px solid #e5e5e5') },
    });
  }

  // Séparateur
  blocks.push({
    ...base, id: uid('sep'), type: 'shape', order: next(),
    position: { x: 616, y: 24, width: 1, height: 652, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { shapeType: 'rectangle', backgroundColor: '#ebebeb', opacity: 100 },
  });

  // Panel droit
  blocks.push({
    ...base, id: uid('panel'), type: 'shape', order: next(),
    position: { x: 628, y: 0, width: 472, height: 700, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { shapeType: 'rectangle', backgroundColor: panelColor, opacity: 100 },
  });

  // Catégorie
  blocks.push({
    ...base, id: uid('cat'), type: 'text', order: next(),
    position: { x: 660, y: 40, width: 400, height: 14, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: {
      content: product.category?.toUpperCase() || 'PRODUIT',
      fontSize: 9,
      fontFamily: 'Inter',
      fontWeight: '500',
      textColor: '#999999',
      letterSpacing: 2,
    },
  });

  // ⭐ Titre — boundField: 'productName'
  blocks.push({
    ...base, id: uid('title'), type: 'title', order: next(),
    position: { x: 660, y: 62, width: 400, height: 70, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: { ...titleProps(product.name), boundField: 'productName', fontSize: 22, fontFamily: 'Inter', fontWeight: '600', textColor: text, lineHeight: 1.25 },
  });

  // Prix
  blocks.push({
    ...base, id: uid('price'), type: 'text', order: next(),
    position: { x: 660, y: 142, width: 200, height: 32, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: { content: `${product.price.toFixed(2)} €`, fontSize: 24, fontFamily: 'Inter', fontWeight: '700', textColor: text },
  });

  // Divider
  blocks.push({
    ...base, id: uid('div1'), type: 'shape', order: next(),
    position: { x: 660, y: 184, width: 400, height: 1, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: { shapeType: 'rectangle', backgroundColor: '#e5e5e5', opacity: 100 },
  });

  // Description
  blocks.push({
    ...base, id: uid('desc'), type: 'text', order: next(),
    position: { x: 660, y: 198, width: 400, height: 60, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: {
      content: product.description || 'Description du produit.',
      fontSize: 12,
      fontFamily: 'Inter',
      fontWeight: '400',
      textColor: '#555555',
      lineHeight: 1.6,
    },
  });

  // ⭐ Stock — boundField: 'stockStatus'
  if (product.stock > 0) {
    blocks.push({
      ...base, id: uid('stock'), type: 'text', order: next(),
      position: { x: 660, y: 272, width: 200, height: 20, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
      props: {
        content: `✓ En stock (${product.stock})`,
        boundField: 'stockStatus',
        fontSize: 10,
        fontFamily: 'Inter',
        fontWeight: '500',
        textColor: '#16a34a',
      },
    });
  }

  // ⭐ Tailles & couleurs
  const { blocks: extraBlocks, endY } = generateSizeAndColorBlocks(
    product, 660, 302, base, z + 2,
    '#666666', '#888888', 400, accent
  );
  blocks.push(...extraBlocks);

  const ctaY = Math.max(endY + 8, 410);

  // CTA
  blocks.push({
    ...base, id: uid('cta'), type: 'button', order: next(),
    position: { x: 660, y: ctaY, width: 400, height: 42, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: {
      text: 'Ajouter au panier',
      action: 'addToCart',
      backgroundColor: text,
      textColor: bg === '#ffffff' ? '#ffffff' : bg,
      fontSize: 12,
      fontFamily: 'Inter',
      fontWeight: '600',
      borderRadius: 4,
    },
  });

  // Favoris
  blocks.push({
    ...base, id: uid('wish'), type: 'button', order: next(),
    position: { x: 660, y: ctaY + 50, width: 400, height: 38, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: { text: 'Ajouter aux favoris ♡', backgroundColor: 'transparent', textColor: text, fontSize: 11, fontFamily: 'Inter', fontWeight: '500', borderRadius: 4, border: `1px solid ${text}25` },
  });

  // Livraison
  blocks.push({
    ...base, id: uid('shipping'), type: 'text', order: next(),
    position: { x: 660, y: ctaY + 100, width: 400, height: 14, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: {
      content: '🚚 Livraison gratuite dès 50€',
      fontSize: 10,
      fontFamily: 'Inter',
      fontWeight: '400',
      textColor: '#888888',
    },
  });

  return blocks;
}

// ──────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — IMMERSIF
// Canvas : 1100 × 700
// ──────────────────────────────────────────────────────────────────────────

function generateImmersiveBlocks(
  product: StudioProduct,
  config: ProductPageConfig,
  base: any,
  z: number
): BlockUI[] {
  const accent = config.accentColor || '#d4af37';
  const text = config.textColor || '#ffffff';
  const panel = config.panelColor || '#0f0f0f';
  const images = getProductImages(product);
  const imgStyle = config.imageStyle;
  let order = 0;
  const next = () => order++;

  const blocks: BlockUI[] = [
    // ⭐ Image héro — boundField: 'mainImage'
    {
      ...base, id: uid('hero'), type: 'image', order: next(),
      position: { x: 0, y: 0, width: 1100, height: 700, zIndex: z, rotation: 0, positionType: 'absolute' },
      props: { ...imgSrc(images[0] || ''), boundField: 'mainImage', ...getImageFrameProps(imgStyle, 0, panel), objectFit: 'cover', ...getBorderStyle(imgStyle) },
    },
    // Overlay
    {
      ...base, id: uid('overlay'), type: 'shape', order: next(),
      position: { x: 0, y: 0, width: 1100, height: 700, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
      props: {
        shapeType: 'rectangle',
        backgroundColor: `linear-gradient(105deg, ${hexToRgba(panel, 0.88)} 0%, ${hexToRgba(panel, 0.5)} 45%, ${hexToRgba(panel, 0.05)} 75%, transparent 100%)`,
        opacity: 100,
      },
    },
    // Ligne verticale
    {
      ...base, id: uid('vline'), type: 'shape', order: next(),
      position: { x: 48, y: 56, width: 2, height: 240, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
      props: { shapeType: 'rectangle', backgroundColor: accent, opacity: 100 },
    },
    // Catégorie
    {
      ...base, id: uid('cat'), type: 'text', order: next(),
      position: { x: 64, y: 56, width: 240, height: 16, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
      props: { content: (product.category || 'Collection').toUpperCase(), fontSize: 9, fontFamily: 'Inter', fontWeight: '500', textColor: accent, letterSpacing: 3 },
    },
    // ⭐ Nom — boundField: 'productName'
    {
      ...base, id: uid('name'), type: 'title', order: next(),
      position: { x: 64, y: 82, width: 440, height: 160, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
      props: { ...titleProps(product.name), boundField: 'productName', fontSize: 42, fontFamily: 'Inter', fontWeight: '800', textColor: text, lineHeight: 1.05, letterSpacing: -1 },
    },
    // Description
    {
      ...base, id: uid('desc'), type: 'text', order: next(),
      position: { x: 64, y: 254, width: 360, height: 48, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
      props: {
        content: product.description?.slice(0, 100) || "Une pièce d'exception.",
        fontSize: 12,
        fontFamily: 'Inter',
        fontWeight: '300',
        textColor: 'rgba(255,255,255,0.7)',
        lineHeight: 1.6,
      },
    },
    // Prix
    {
      ...base, id: uid('price'), type: 'text', order: next(),
      position: { x: 64, y: 316, width: 200, height: 44, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
      props: { content: `${product.price.toFixed(2)} €`, fontSize: 30, fontFamily: 'Inter', fontWeight: '700', textColor: accent },
    },
    // CTA
    {
      ...base, id: uid('cta'), type: 'button', order: next(),
      position: { x: 64, y: 372, width: 200, height: 42, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
      props: {
        text: 'Acheter',
        action: 'addToCart',
        backgroundColor: accent,
        textColor: '#000000',
        fontSize: 12,
        fontFamily: 'Inter',
        fontWeight: '700',
        borderRadius: 2,
      },
    },
    // ⭐ Stock — boundField: 'stockStatus'
    {
      ...base, id: uid('stock'), type: 'text', order: next(),
      position: { x: 64, y: 424, width: 240, height: 16, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
      props: {
        content: product.stock > 0 ? `● En stock (${product.stock})` : '● Rupture',
        boundField: 'stockStatus',
        fontSize: 10,
        fontFamily: 'Inter',
        fontWeight: '400',
        textColor: product.stock > 0 ? '#4ade80' : '#f87171',
      },
    },
  ];

  // ⭐ Panneau droit — TOUJOURS PRÉSENT
  blocks.push({
    ...base, id: uid('rpanel'), type: 'shape', order: next(),
    position: { x: 830, y: 0, width: 270, height: 700, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: {
      shapeType: 'rectangle',
      backgroundColor: hexToRgba(panel, 0.45),
      opacity: 100,
    },
  });

  // ⭐ Images secondaires — TOUJOURS 2 SLOTS
  for (let i = 0; i < 2; i++) {
    const h = 300;
    const yPos = 50 + i * (h + 16);
    blocks.push({
      ...base, id: uid('img2'), type: 'image', order: next(),
      position: { x: 840, y: yPos, width: 250, height: h, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
      props: { ...imgSrc(images[i + 1] || ''), boundField: `secondaryImage:${i}`, opacity: 90, ...getImageFrameProps(imgStyle, 2, panel), ...getBorderStyle(imgStyle, `1px solid ${accent}25`) },
    });
  }

  // ⭐ Tailles & couleurs
  const { blocks: extraBlocks } = generateSizeAndColorBlocks(
    product, 64, 454, base, z + 2,
    'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.5)', 320, accent
  );
  blocks.push(...extraBlocks);

  return blocks;
}

// ──────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — GALERIE
// Canvas : 1100 × 700
// ──────────────────────────────────────────────────────────────────────────

function generateGalleryBlocks(
  product: StudioProduct,
  config: ProductPageConfig,
  base: any,
  z: number
): BlockUI[] {
  const accent = config.accentColor || '#2d6a4f';
  const bg = config.backgroundColor || '#f8f5f0';
  const text = config.textColor || '#1a1a1a';
  const panelColor = config.panelColor || '#ffffff';
  const images = getProductImages(product);
  const imgStyle = config.imageStyle;
  let order = 0;
  const next = () => order++;

  const blocks: BlockUI[] = [
    {
      ...base, id: uid('bg'), type: 'shape', order: next(),
      position: { x: 0, y: 0, width: 1100, height: 700, zIndex: z, rotation: 0, positionType: 'absolute' },
      props: { shapeType: 'rectangle', backgroundColor: bg, opacity: 100 },
    },
  ];

  const frame = (r: number) => ({
    ...getImageFrameProps(imgStyle, r, '#e8e5e0'),
    ...getBorderStyle(imgStyle),
  });

  // ⭐ DISPOSITION FIXE À 3 IMAGES — plus conditionné
  blocks.push({
    ...base, id: uid('img1'), type: 'image', order: next(),
    position: { x: 20, y: 20, width: 640, height: 400, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { ...imgSrc(images[0] || ''), boundField: 'galleryImage:0', ...frame(8) },
  });
  blocks.push({
    ...base, id: uid('img2'), type: 'image', order: next(),
    position: { x: 20, y: 428, width: 310, height: 252, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { ...imgSrc(images[1] || ''), boundField: 'galleryImage:1', ...frame(8) },
  });
  blocks.push({
    ...base, id: uid('img3'), type: 'image', order: next(),
    position: { x: 342, y: 428, width: 318, height: 252, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { ...imgSrc(images[2] || ''), boundField: 'galleryImage:2', ...frame(8) },
  });

  // Fiche produit
  blocks.push({
    ...base, id: uid('card'), type: 'shape', order: next(),
    position: { x: 676, y: 0, width: 424, height: 700, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { shapeType: 'rectangle', backgroundColor: panelColor, opacity: 100 },
  });

  // Accent line
  blocks.push({
    ...base, id: uid('accentline'), type: 'shape', order: next(),
    position: { x: 710, y: 44, width: 28, height: 2, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: { shapeType: 'rectangle', backgroundColor: accent, opacity: 100 },
  });

  // Catégorie
  blocks.push({
    ...base, id: uid('cat'), type: 'text', order: next(),
    position: { x: 750, y: 38, width: 320, height: 16, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: { content: product.category || 'Collection', fontSize: 9, fontFamily: 'Inter', fontWeight: '500', textColor: accent, letterSpacing: 1.5 },
  });

  // ⭐ Nom — boundField: 'productName'
  blocks.push({
    ...base, id: uid('name'), type: 'title', order: next(),
    position: { x: 710, y: 64, width: 360, height: 80, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: { ...titleProps(product.name), boundField: 'productName', fontSize: 20, fontFamily: 'Inter', fontWeight: '700', textColor: text, lineHeight: 1.2 },
  });

  // Prix
  blocks.push({
    ...base, id: uid('price'), type: 'text', order: next(),
    position: { x: 710, y: 156, width: 200, height: 36, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: { content: `${product.price.toFixed(2)} €`, fontSize: 26, fontFamily: 'Inter', fontWeight: '700', textColor: accent },
  });

  // Separateur
  blocks.push({
    ...base, id: uid('hr'), type: 'shape', order: next(),
    position: { x: 710, y: 202, width: 360, height: 1, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: { shapeType: 'rectangle', backgroundColor: '#e5e5e5', opacity: 100 },
  });

  // Description
  blocks.push({
    ...base, id: uid('desc'), type: 'text', order: next(),
    position: { x: 710, y: 214, width: 360, height: 72, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: {
      content: product.description || "Une création unique.",
      fontSize: 11,
      fontFamily: 'Inter',
      fontWeight: '400',
      textColor: '#666666',
      lineHeight: 1.7,
    },
  });

  // ⭐ Tailles & couleurs
  const { blocks: extraBlocks, endY } = generateSizeAndColorBlocks(
    product, 710, 298, base, z + 2,
    '#888888', '#888888', 360, accent
  );
  blocks.push(...extraBlocks);

  const ctaY = Math.max(endY + 8, 430);

  // CTA
  blocks.push({
    ...base, id: uid('cta'), type: 'button', order: next(),
    position: { x: 710, y: ctaY, width: 360, height: 42, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: {
      text: 'Ajouter au panier',
      action: 'addToCart',
      backgroundColor: accent,
      textColor: '#ffffff',
      fontSize: 12,
      fontFamily: 'Inter',
      fontWeight: '600',
      borderRadius: 4,
    },
  });

  // ⭐ Stock — boundField: 'stockStatus'
  blocks.push({
    ...base, id: uid('stock'), type: 'text', order: next(),
    position: { x: 710, y: ctaY + 50, width: 360, height: 16, zIndex: z + 2, rotation: 0, positionType: 'absolute' },
    props: {
      content: product.stock > 0 ? `✓ ${product.stock} en stock` : 'Rupture',
      boundField: 'stockStatus',
      fontSize: 10,
      fontFamily: 'Inter',
      fontWeight: '500',
      textColor: product.stock > 0 ? '#16a34a' : '#dc2626',
      textAlign: 'center',
    },
  });

  return blocks;
}

// ──────────────────────────────────────────────────────────────────────────
// TEMPLATE 4 — MINIMAL
// Canvas : 1100 × 700
// ──────────────────────────────────────────────────────────────────────────

function generateMinimalBlocks(
  product: StudioProduct,
  config: ProductPageConfig,
  base: any,
  z: number
): BlockUI[] {
  const accent = config.accentColor || '#111111';
  const bg = config.backgroundColor || '#ffffff';
  const text = config.textColor || '#111111';
  const images = getProductImages(product);
  const imgStyle = config.imageStyle;
  let order = 0;
  const next = () => order++;

  const blocks: BlockUI[] = [
    {
      ...base, id: uid('bg'), type: 'shape', order: next(),
      position: { x: 0, y: 0, width: 1100, height: 700, zIndex: z, rotation: 0, positionType: 'absolute' },
      props: { shapeType: 'rectangle', backgroundColor: bg, opacity: 100 },
    },
    // ⭐ Image — boundField: 'mainImage'
    {
      ...base, id: uid('img'), type: 'image', order: next(),
      position: { x: 0, y: 0, width: 560, height: 700, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
      props: { ...imgSrc(images[0] || ''), boundField: 'mainImage', ...getImageFrameProps(imgStyle, 0, '#f2f2f2'), ...getBorderStyle(imgStyle) },
    },
  ];

  // ⭐ Vignettes — TOUJOURS 2 SLOTS
  const thumbW = Math.floor((560 - 6) / 2);
  for (let i = 0; i < 2; i++) {
    blocks.push({
      ...base, id: uid('mthumb'), type: 'image', order: next(),
      position: { x: i * (thumbW + 6), y: 714, width: thumbW, height: 58, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
      props: { ...imgSrc(images[i + 1] || ''), boundField: `thumbImage:${i}`, ...getImageFrameProps(imgStyle, 0, '#f2f2f2'), ...getBorderStyle(imgStyle) },
    });
  }

  // Top line
  blocks.push({
    ...base, id: uid('topline'), type: 'shape', order: next(),
    position: { x: 590, y: 44, width: 460, height: 1, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { shapeType: 'rectangle', backgroundColor: text, opacity: 12 },
  });

  // Catégorie
  blocks.push({
    ...base, id: uid('cat'), type: 'text', order: next(),
    position: { x: 590, y: 60, width: 460, height: 14, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { content: (product.category || 'Produit').toUpperCase(), fontSize: 8, fontFamily: 'Inter', fontWeight: '500', textColor: '#aaaaaa', letterSpacing: 2.5 },
  });

  // ⭐ Titre — boundField: 'productName'
  blocks.push({
    ...base, id: uid('title'), type: 'title', order: next(),
    position: { x: 590, y: 84, width: 460, height: 120, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { ...titleProps(product.name), boundField: 'productName', fontSize: 34, fontFamily: 'Inter', fontWeight: '200', textColor: text, lineHeight: 1.1, letterSpacing: -1.5 },
  });

  // Ligne
  blocks.push({
    ...base, id: uid('titleline'), type: 'shape', order: next(),
    position: { x: 590, y: 214, width: 460, height: 1, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { shapeType: 'rectangle', backgroundColor: text, opacity: 10 },
  });

  // Prix
  blocks.push({
    ...base, id: uid('price'), type: 'text', order: next(),
    position: { x: 590, y: 228, width: 200, height: 36, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { content: `${product.price.toFixed(2)} €`, fontSize: 26, fontFamily: 'Inter', fontWeight: '300', textColor: text, letterSpacing: -0.5 },
  });

  // Description
  blocks.push({
    ...base, id: uid('desc'), type: 'text', order: next(),
    position: { x: 590, y: 278, width: 460, height: 80, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: {
      content: product.description || 'Conçu avec précision. Construit pour durer.',
      fontSize: 11,
      fontFamily: 'Inter',
      fontWeight: '300',
      textColor: '#666666',
      lineHeight: 1.8,
    },
  });

  // ⭐ Tailles & couleurs
  const { blocks: extraBlocks, endY } = generateSizeAndColorBlocks(
    product, 590, 370, base, z + 1,
    '#aaaaaa', '#999999', 460, accent
  );
  blocks.push(...extraBlocks);

  const ctaY = Math.max(endY + 8, 480);

  // CTA
  blocks.push({
    ...base, id: uid('cta'), type: 'button', order: next(),
    position: { x: 590, y: ctaY, width: 460, height: 42, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: {
      text: 'Acheter',
      action: 'addToCart',
      backgroundColor: accent,
      textColor: bg,
      fontSize: 11,
      fontFamily: 'Inter',
      fontWeight: '500',
      borderRadius: 0,
      letterSpacing: 1.5,
    },
  });

  // ⭐ Stock — boundField: 'stockStatus'
  blocks.push({
    ...base, id: uid('stock'), type: 'text', order: next(),
    position: { x: 590, y: ctaY + 50, width: 460, height: 14, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: {
      content: product.stock > 0 ? `Disponible (${product.stock})` : 'Rupture',
      boundField: 'stockStatus',
      fontSize: 9,
      fontFamily: 'Inter',
      fontWeight: '400',
      textColor: '#aaaaaa',
      letterSpacing: 0.3,
    },
  });

  // Bottom line
  blocks.push({
    ...base, id: uid('botline'), type: 'shape', order: next(),
    position: { x: 590, y: ctaY + 74, width: 460, height: 1, zIndex: z + 1, rotation: 0, positionType: 'absolute' },
    props: { shapeType: 'rectangle', backgroundColor: text, opacity: 10 },
  });

  return blocks;
}