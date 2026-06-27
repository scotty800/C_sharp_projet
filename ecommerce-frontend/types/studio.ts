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
  rotation?: number;
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
  type: 'banner' | 'screen-banner' | 'carousel-banner' | 'carousel-slide' | 'logo' | 'title' | 'products' | 'section' | 'text' | 'image' | 'button' | 'spacer' 
      | 'products-grid' | 'product-slot' | 'shape' | 'custom' | 'group' | 'navbar-horizontal' | 'navbar-hero' | 'navbar-sidebar';
  props: any;
  order: number;
  isVisible?: boolean;
  parentId?: string | null;
  isLocked?: boolean;
  position?: BlockPosition;
  children?: BlockUI[];
  gridConfig?: ProductGridConfig;
  pageId?: string;
  groupId?: string | null;
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

// ==================== TYPES POUR LES PRODUITS ====================

export interface ProductVariant {
  id: number;
  size?: string;
  color?: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface StudioProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  category: string;
  sizes?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  isInStock: boolean;
  createdAt: string;
}

export interface CreateStudioProduct {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  imageUrl?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
  isInStock?: boolean;
}

// ==================== TYPES POUR LE CONTENU PERSONNALISÉ DES SLOTS ====================

export interface CustomSlotContent {
  customTitle?: string;
  customImage?: string;
  customLink?: string;
  customDescription?: string;
}

// ==================== TYPES POUR LES SLOTS PRODUITS ====================

export interface ProductSlotData {
  productId: number | null;
  displayMode: 'traditional' | 'interactive';

  // ⭐ Frame style (peut être défini ici aussi pour override)
  frameStyle?: 'square' | 'horizontal' | 'vertical' | 'circle' | 'rounded';
  
  // Configuration pour mode interactif
  interactiveConfig?: {
    showPriceOnClick: boolean;
    showDescriptionOnClick: boolean;
    showSizeSelector: boolean;
    showColorSelector: boolean;
    showStockStatus: boolean;
    showAddToCart: boolean;
    overlayStyle: 'modal' | 'tooltip' | 'slide' | 'fade';
    overlayBackground: string;
    overlayBlur: number;
    animationDuration: number;
    triggerType: 'click' | 'hover';
    
    showNameOnClick?: boolean;
    namePosition?: string;
    pricePosition?: string;
    buttonPosition?: string;
    descriptionPosition?: string;
    nameColor?: string;
    priceColor?: string;
    cartButtonText?: string;
  };
  
  // Configuration pour mode traditionnel
  traditionalConfig?: {
    showImage: boolean;
    showName: boolean;
    showPrice: boolean;
    showDescription: boolean;
    showSizeSelector: boolean;
    showColorSelector: boolean;
    showStockStatus: boolean;
    showAddToCart: boolean;
    imagePosition: 'top' | 'left' | 'right';
    cardStyle: 'default' | 'minimal' | 'compact' | 'detailed';
    buttonStyle: 'primary' | 'outline' | 'text';
  };
  
  // Liaison du produit
  linkedProduct?: StudioProduct;
  
  // Customisation visuelle
  customStyles?: {
    backgroundColor?: string;
    borderRadius?: number;
    shadow?: string;
    padding?: number;
    gap?: number;
  };
}

export interface SlotPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
}

export interface ProductSlotBlock extends BlockUI {
  type: 'product-slot';
  props: ProductSlotData;
}

// ==================== TYPES POUR LA GRILLE DE PRODUITS ====================

export interface ProductGridConfig {
  // Structure de grille
  layoutType: 'grid' | 'flex' | 'masonry';
  columns: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  rows: number;
  gap: number;
  padding: number;

  // ⭐ Dimension globale de la grille (comme un bloc)
  dimension: Dimension;
  uniformSize?: UniformSize;
  
  // Slots individuels
  slots: ProductGridSlot[];
}

export interface ProductGridSlot {
  id: string;
  order: number;
  productId: number | null;
  linkedProduct?: StudioProduct;
  displayMode: 'traditional' | 'interactive';
  // ⭐ NOUVEAU : Frame style au niveau du slot (pour les deux modes)
  frameStyle?: 'square' | 'horizontal' | 'vertical' | 'circle' | 'rounded';
  // ⭐ NOUVEAU : Index de l'image à afficher (1, 2, 3 ou null pour l'image par défaut)
  imageIndex?: number | null;

  // ⭐ Dimension individuelle du slot (override la grille)
  customSize?: Dimension;

  carouselConfig?: {
    enabled: boolean;
    interval: number;      // en millisecondes (ex: 3000 = 3 secondes)
    animation: 'fade' | 'slide';
    stopOnHover: boolean;
    showDots: boolean;
    showArrows: boolean;
    currentImageIndex?: number;  // pour suivre l'image actuelle
  };

  // Configuration spécifique au slot (peut surcharger la config globale)
  customConfig?: Partial<ProductSlotData> & CustomSlotContent;
  // Position dans la grille
  gridPosition: {
    row: number;
    col: number;
    rowSpan?: number;
    colSpan?: number;
  };
}

export interface Dimension {
  width: number;
  height: number;
  widthUnit: 'px' | 'auto';
  heightUnit: 'px' | 'auto';
}

export interface UniformSize {
  enabled: boolean;
  width: number;
  height: number;
}

// ==================== TYPES POUR LA PERSONNALISATION DES PRODUITS ====================

// ⭐ Interface Badge (partagée entre ProductCustomization et SlideCustomization)
export interface ProductBadge {
  text: string;
  backgroundColor: string;
  textColor: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  fontSize?: number;
  borderRadius?: number;
  animation?: 'pulse' | 'bounce' | 'none';
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

// ⭐ Type pour la configuration d'une slide (tous les champs sont optionnels car une slide peut hériter du global)
export interface SlideCustomization {
  // Background
  backgroundType?: 'solid' | 'gradient' | 'image' | '3d' | 'transparent';
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  backgroundBlur?: number;
  backgroundValue?: string;
  
  // Frame / Cadre
  frameColor?: string;
  frameWidth?: number;
  frameShadow?: boolean;
  frameShadowColor?: string;
  
  // Hover effect
  hoverEffect?: 'zoom' | 'glow' | 'slide' | 'rotate' | 'none';
  hoverScale?: number;
  hoverGlowColor?: string;
  hoverGlowIntensity?: number;
  hoverSlideDirection?: 'up' | 'down' | 'left' | 'right';
  hoverSlideDistance?: number;
  hoverRotate?: number;
  
  // Badge (optionnel car peut hériter du global)
  badge?: ProductBadge;
  
  // Featured (optionnel car peut hériter du global)
  isFeatured?: boolean;
  featuredOrder?: number;
  featuredBadge?: string;
  featuredBadgeColor?: string;
  
  // Animation
  entranceAnimation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'bounce' | 'none';
  animationDuration?: number;
  animationDelay?: number;
  animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

// ⭐ Configuration globale du produit (tous les champs requis ont des valeurs par défaut)
export interface ProductCustomization {
  // Background
  backgroundType: 'solid' | 'gradient' | 'image' | '3d' | 'transparent';
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  backgroundBlur?: number;
  backgroundValue?: string;
  
  // Frame / Cadre
  frameColor?: string;
  frameWidth?: number;
  frameShadow?: boolean;
  frameShadowColor?: string;
  
  // Hover effect
  hoverEffect: 'zoom' | 'glow' | 'slide' | 'rotate' | 'none';
  hoverScale?: number;
  hoverGlowColor?: string;
  hoverGlowIntensity?: number;
  hoverSlideDirection?: 'up' | 'down' | 'left' | 'right';
  hoverSlideDistance?: number;
  hoverRotate?: number;
  
  // Badge
  badge?: ProductBadge;
  
  // Featured
  isFeatured: boolean;
  featuredOrder?: number;
  featuredBadge?: string;
  featuredBadgeColor?: string;
  
  // Animation d'apparition
  entranceAnimation: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'bounce' | 'none';
  animationDuration: number;
  animationDelay: number;
  animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

  // ⭐ Configuration par slide (optionnelle)
  slidesConfig?: {
    [slideIndex: number]: SlideCustomization;
  };

  selectedSize?: string;
  selectedColor?: string;
}

export interface ProductSlotCustomization extends ProductCustomization {
  slotId: string;
  productId: number | null;
}

// Backgrounds prédéfinis
export interface PresetBackground {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'image' | '3d';
  value: string;
  thumbnail?: string;
  preview?: string;
}

// Badges prédéfinis
export interface PresetBadge {
  id: string;
  name: string;
  text: string;
  backgroundColor: string;
  textColor: string;
}

// Animations d'entrée prédéfinies
export interface PresetAnimation {
  id: string;
  name: string;
  cssClass: string;
  duration: number;
  easing: string;
}

// types/studio.ts — AJOUTS

// ──────────────── NAVBAR ────────────────

export type NavbarVariant = 'horizontal' | 'hero' | 'sidebar'; // ⭐ extensible : ajouter un id ici + un composant + une entrée au registre

export type NavLinkTarget =
  | { type: 'page'; pageId: string }
  | { type: 'url'; url: string; openInNewTab?: boolean }
  | { type: 'none' };

export interface NavIcon {
  type: 'preset' | 'custom' | 'none';
  presetName?: string; // ex: 'FiHome', 'FiShoppingBag' (cf NAV_ICON_PRESETS)
  url?: string;         // pour 'custom' (asset uploadé)
}

export interface NavButtonStyle {
  textColor?: string;
  textColorHover?: string;
  textColorActive?: string;
  backgroundColor?: string;
  backgroundColorHover?: string;
  backgroundColorActive?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  letterSpacing?: number;
  borderWidth?: number;
  borderColor?: string;
  borderColorHover?: string;
  borderRadius?: number;
  paddingX?: number;
  paddingY?: number;
  gapIcon?: number;
}

export interface NavButtonAnimation {
  hoverEffect?: 'none' | 'underline' | 'background' | 'scale' | 'glow' | 'slide-underline';
  transitionDuration?: number; // ms
  transitionEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  entrance?: 'none' | 'fade' | 'slide-down' | 'slide-up';
}

export interface NavButton {
  id: string;
  label: string;
  icon?: NavIcon;
  iconPosition?: 'left' | 'right' | 'only';
  order: number;
  isVisible: boolean;
  link: NavLinkTarget;
  style?: Partial<NavButtonStyle>;       // override du style par défaut de la navbar
  animation?: Partial<NavButtonAnimation>;
  isActiveOverride?: boolean;            // pour prévisualiser l'état "actif" dans le Studio
}

export interface NavbarConfig {
  variant: NavbarVariant;
  buttons: NavButton[];

  alignment?: 'left' | 'center' | 'right' | 'space-between';
  gap?: number;
  sticky?: boolean;

  showLogo?: boolean;
  logoUrl?: string;
  logoLinkPageId?: string | null;

  defaultButtonStyle: NavButtonStyle;
  defaultButtonAnimation: NavButtonAnimation;

  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient' | 'transparent';
  backgroundValue?: string;
  backgroundOpacity?: number;

  borderBottomWidth?: number;
  borderBottomColor?: string;

  sidebar?: {
    width?: number;
    position?: 'left' | 'right';
    isOpenByDefault?: boolean;
    overlayOnMobile?: boolean;
    toggleButtonColor?: string;
  };

  hero?: {
    height?: number;
    showTagline?: boolean;
    tagline?: string;
  };

  collapseBreakpoint?: 'mobile' | 'tablet' | 'none';
  mobileMenuStyle?: 'drawer' | 'fullscreen' | 'dropdown';
}