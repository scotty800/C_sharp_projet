// types/studio.ts

export interface CustomAsset {
  id: number;
  type: 'text' | 'image' | 'shape' | 'sticker';
  name: string;
  url?: string;
  content?: string;
  positionType: 'absolute' | 'relative';
  posX: number;
  posY: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  // Propriétés texte
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: string;
  fontStyle?: string;
  textShadow?: string;
  textGradient?: string;
  textStroke?: string;
  textGlow?: string;
  textBackground?: string;
  textBackgroundPadding?: number;
  textBackgroundRadius?: number;
  letterSpacing?: number;
  lineHeight?: number;
  maxWidth?: number;
  maxLines?: number;
  // Animations
  animation?: string;
  duration?: number;
  delay?: number;
  iterationCount?: string;
  // Visibilité
  isDraggable?: boolean;
  isResizable?: boolean;
  isVisible?: boolean;
  linkUrl?: string;
  openInNewTab?: boolean;
  // Responsive
  visibleOnMobile?: boolean;
  visibleOnTablet?: boolean;
  visibleOnDesktop?: boolean;
}

export interface CustomSection {
  id: number;
  type: 'hero' | 'features' | 'gallery' | 'testimonials' | 'custom';
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  backgroundColor?: string;
  order: number;
  isVisible: boolean;
  // Typographie spécifique
  titleFont?: string;
  titleFontSize?: number;
  titleFontWeight?: string;
  titleTextShadow?: string;
  titleTextGradient?: string;
  titleAnimation?: string;
  subtitleFont?: string;
  subtitleFontSize?: number;
  subtitleFontWeight?: string;
  subtitleTextShadow?: string;
  // Settings JSON
  settingsJson: string;
}

export interface ImageFilter {
  id: number;
  filterType: string;
  cssFilter?: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  blur: number;
  grayscale: number;
  sepia: number;
  opacity: number;
  invert: number;
  presetName?: string;
  target: 'global' | 'products' | 'background' | 'specific';
  order: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ProductImageFilter {
  id: number;
  shopId: number;
  productId: number;
  imageIndex: number;
  filterType: string;
  cssFilter?: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  blur: number;
  grayscale: number;
  sepia: number;
  opacity: number;
  overlayType?: 'color' | 'gradient' | 'none';
  overlayColor?: string;
  overlayOpacity: number;
  enableGlow: boolean;
  glowColor?: string;
  enableShadow: boolean;
  shadowColor?: string;
  updatedAt: Date;
}

export interface ShopProductCustomization {
  id: number;
  shopId: number;
  productId: number;
  productBackgroundType: 'white' | 'color' | 'gradient' | 'image' | 'none';
  productBackgroundValue?: string;
  productFrameStyle: 'rounded' | 'circle' | 'shadow' | 'border' | 'none';
  productShadow: boolean;
  productHoverEffect: 'zoom' | 'glow' | 'slide' | 'none';
  isFeatured: boolean;
  featuredOrder: number;
  customBadge?: string;
  customBadgeColor?: string;
  productAnimation?: string;
  animationDelay: number;
  updatedAt: Date;
}

export interface ShopFilter {
  id: number;
  shopId: number;
  globalFilter: string;
  globalCssFilter?: string;
  globalBrightness: number;
  globalContrast: number;
  globalSaturation: number;
  backgroundColor: string;
  backgroundFilter?: string;
  backgroundBlur: number;
  backgroundDarken: number;
  seasonalEffect?: string;
  seasonalEffectStart?: Date;
  seasonalEffectEnd?: Date;
  enableFilterAnimation: boolean;
  filterAnimation: string;
  animationDuration: number;
  isActive: boolean;
  updatedAt: Date;
}

export interface CustomizationSnapshot {
  id: number;
  shopId: number;
  name: string;
  configurationJson: string;
  createdAt: Date;
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  configurationJson: string;
  isPremium: boolean;
  price: number;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  category: string;
  url: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  isPremium: boolean;
  price: number;
  license?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  createdBy?: number;
}

// ⭐ Interface BlockPosition (pour le backend)
export interface BlockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  positionType?: 'absolute' | 'relative' | 'fixed';
  alignment?: 'top-left' | 'top-center' | 'center' | 'bottom-left' | 'bottom-right';
}

// ⭐ Interface Block (pour le backend)
export interface Block {
  id: string;
  type: string;
  name: string;
  order: number;
  isVisible: boolean;
  position?: BlockPosition;
  settings?: Record<string, any>;
  children?: Block[];
}

// ⭐ Interface BlockUI (pour le frontend - transformation)
export interface BlockUI {
  id: string;
  type: 'banner' | 'logo' | 'title' | 'products' | 'section' | 'text' | 'image' | 'button' | 'spacer';
  props: any;
  order: number;
  position?: { x: number; y: number; width?: number; height?: number; zIndex?: number };
  isVisible?: boolean;
}

// Interface principale SHOP CUSTOMIZATION (mise à jour avec blocks)
export interface ShopCustomization {
  id: number;
  shopId: number;
  // Layout
  layoutType?: string;
  headerStyle: string;
  productDisplayStyle: string;
  // Background
  backgroundType: string;
  backgroundValue?: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  backgroundSize: string;
  backgroundFixed: boolean;
  // Couleurs
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  // Effets
  enable3DEffect: boolean;
  animationEffect?: string;
  hoverEffect: string;
  pageTransition: string;
  // Typographie
  primaryFont: string;
  secondaryFont: string;
  headingFont: string;
  bodyFont: string;
  accentFont: string;
  headingSizeH1: number;
  headingSizeH2: number;
  headingSizeH3: number;
  headingSizeH4: number;
  bodySize: number;
  baseFontSize: number;
  smallSize: number;
  headingWeight: string;
  bodyWeight: string;
  headingLineHeight: number;
  bodyLineHeight: number;
  letterSpacingHeading: number;
  letterSpacingBody: number;
  textTransformHeading: string;
  textTransformBody: string;
  textShadow?: string;
  textGradient?: string;
  textStroke?: string;
  textGlow?: string;
  textAnimation?: string;
  textBackground: string;
  textBackgroundPadding: number;
  textBackgroundRadius: number;
  textAnimationDuration: number;
  textAnimationDelay: string;
  // Custom
  customCss?: string;
  customJs?: string;
  // Template
  templateId?: number;
  // Relations
  customSections: CustomSection[];
  customAssets: CustomAsset[];
  // ⭐ Blocks pour l'éditeur visuel (backend format)
  blocks?: Block[];
  // Publication
  isPublished: boolean;
  updatedAt: Date;
  version: number;
  // Filtres
  filtersEnabled: boolean;
  activeShopFilterId?: number;
  showFilterPanel: boolean;
  defaultImageFilter: string;
  enableFiltersPanel: boolean;
  imageFilters: ImageFilter[];
  activeShopFilter?: ImageFilter;
  // Product customization
  shopProductCustomizations?: ShopProductCustomization[];
  // Dates
  createdAt: Date;
  publishedAt?: Date;
  unpublishedAt?: Date;
}

// Type pour l'état du studio (mis à jour avec blocks)
export interface StudioState {
  shop: any | null;
  customization: ShopCustomization | null;
  blocks: BlockUI[];
  filters: ShopFilter | null;
  activePanel: 'colors' | 'fonts' | 'filters' | 'assets' | 'templates' | 'sections' | 'products' | 'snapshots' | 'settings';
  previewMode: 'desktop' | 'tablet' | 'mobile';
  showPreview: boolean;
  isDirty: boolean;
  selectedBlockId: string | null;
  selectedElement: { type: string; props: any } | null;
  history: any[];
  historyIndex: number;
}

// DTOs pour les requêtes API
export interface CreateTemplateDto {
  name: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  sourceShopId: number;
  isPremium?: boolean;
  price?: number;
}

export interface AddAssetDto {
  name: string;
  type: string;
  category: string;
  url?: string;
  file?: File;
  isPremium?: boolean;
  price?: number;
  license?: string;
}

export interface ShopCustomizationDto {
  layoutType?: string;
  headerStyle?: string;
  productDisplayStyle?: string;
  backgroundType?: string;
  backgroundValue?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundSize?: string;
  backgroundFixed?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  enable3DEffect?: boolean;
  animationEffect?: string;
  hoverEffect?: string;
  pageTransition?: string;
  primaryFont?: string;
  secondaryFont?: string;
  headingFont?: string;
  bodyFont?: string;
  accentFont?: string;
  headingSizeH1?: number;
  headingSizeH2?: number;
  headingSizeH3?: number;
  bodySize?: number;
  headingWeight?: string;
  bodyWeight?: string;
  textShadow?: string;
  textGradient?: string;
  textStroke?: string;
  textGlow?: string;
  textAnimation?: string;
  customCss?: string;
  customJs?: string;
  filtersEnabled?: boolean;
  activeShopFilterId?: number;
  showFilterPanel?: boolean;
  defaultImageFilter?: string;
  imageFilterIds?: number[];
  customSections?: CustomSectionDto[];
  customAssets?: CustomAssetDto[];
  blocks?: BlockDto[];
}

export interface BlockDto {
  id: string;
  type: string;
  name: string;
  order: number;
  isVisible: boolean;
  settings?: Record<string, any>;
  children?: BlockDto[];
  position?: BlockPosition;
}

export interface CustomSectionDto {
  id?: number;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  backgroundColor?: string;
  order?: number;
  isVisible?: boolean;
  settings?: Record<string, any>;
}

export interface CustomAssetDto {
  id?: number;
  type: string;
  name: string;
  url?: string;
  content?: string;
  posX?: number;
  posY?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  animation?: string;
  duration?: number;
  delay?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  isVisible?: boolean;
  linkUrl?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  textColor?: string;
  textShadow?: string;
  textGradient?: string;
  textStroke?: string;
  textGlow?: string;
  letterSpacing?: number;
  lineHeight?: number;
}

export interface ShopFilterDto {
  globalFilter?: string;
  globalCssFilter?: string;
  globalBrightness?: number;
  globalContrast?: number;
  globalSaturation?: number;
  backgroundFilter?: string;
  backgroundBlur?: number;
  backgroundDarken?: number;
  seasonalEffect?: string;
  seasonalEffectStart?: Date;
  seasonalEffectEnd?: Date;
  enableFilterAnimation?: boolean;
  filterAnimation?: string;
  animationDuration?: number;
}

export interface ImageFilterDto {
  filterType: string;
  cssFilter?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hueRotate?: number;
  blur?: number;
  grayscale?: number;
  sepia?: number;
  opacity?: number;
  invert?: number;
  presetName?: string;
  target?: string;
  order?: number;
}

export interface ProductImageFilterDto {
  productId: number;
  imageIndex?: number;
  filterType?: string;
  cssFilter?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hueRotate?: number;
  blur?: number;
  grayscale?: number;
  sepia?: number;
  opacity?: number;
  overlayType?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  enableGlow?: boolean;
  glowColor?: string;
  enableShadow?: boolean;
  shadowColor?: string;
}

export interface ShopProductCustomizationDto {
  productId: number;
  productBackgroundType?: string;
  productBackgroundValue?: string;
  productFrameStyle?: string;
  productShadow?: boolean;
  productHoverEffect?: string;
  isFeatured?: boolean;
  featuredOrder?: number;
  customBadge?: string;
  customBadgeColor?: string;
  productAnimation?: string;
  animationDelay?: number;
}

export interface FilterPresetDto {
  id: string;
  name: string;
  description: string;
  cssFilter: string;
  category?: string;
  thumbnailUrl?: string;
}

export interface TemplateDto {
  id: number;
  name: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  isPremium: boolean;
  price: number;
  usageCount: number;
}

export interface AssetDto {
  id: number;
  name: string;
  type: string;
  category: string;
  url: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  isPremium: boolean;
  price: number;
  usageCount: number;
}

export interface ShopCustomizationStatsDto {
  sectionsCount: number;
  assetsCount: number;
  filtersCount: number;
  isPublished: boolean;
  lastModified: Date;
  version: number;
  totalViews: number;
  totalEdits: number;
}