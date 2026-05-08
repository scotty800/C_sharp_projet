// services/api/shopCustomization.ts
import api from './axios';
import { Block, BlockPosition } from '@/types/studio';

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

export const shopCustomizationService = {
  async getByShopId(shopId: number): Promise<any | null> {
    try {
      const response = await api.get(`/shops/${shopId}/customization`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Endpoint customization non trouvé, utilisation des valeurs par défaut');
        return null;
      }
      console.error('Erreur getByShopId:', error.response?.status, error.response?.data);
      return null;
    }
  },

  // ⭐ Initialiser les blocs par défaut
  async initDefaultBlocks(shopId: number): Promise<any> {
    try {
      const response = await api.post(`/shops/${shopId}/customization/blocks/init`);
      console.log('✅ Blocs initialisés avec succès');
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur initDefaultBlocks:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  async getBlocks(shopId: number): Promise<Block[]> {
    try {
      const response = await api.get(`/shops/${shopId}/customization/blocks`);
      console.log('📦 Blocs reçus du backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur getBlocks:', error.response?.status, error.response?.data);
      return this.getDefaultBlocks();
    }
  },

  async updateBlocks(shopId: number, blocks: Block[]): Promise<void> {
    try {
      await api.put(`/shops/${shopId}/customization/blocks`, blocks);
      console.log('✅ Blocs sauvegardés avec succès');
    } catch (error: any) {
      console.error('❌ Erreur updateBlocks:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  // ⭐ AJOUTER CETTE MÉTHODE POUR RÉCUPÉRER LES FILTRES DU CANVAS
  async getCanvasFilters(shopId: number): Promise<any> {
    try {
      const response = await api.get(`/shops/${shopId}/customization/canvas-filters`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur getCanvasFilters:', error.response?.status);
      return { 
        globalBrightness: 1, 
        globalContrast: 1, 
        globalSaturation: 1, 
        globalBlur: 0, 
        globalCssFilter: 'none' 
      };
    }
  },

  // ⭐ AJOUTER CETTE MÉTHODE POUR SAUVEGARDER LES FILTRES DU CANVAS
  async updateCanvasFilters(shopId: number, data: any): Promise<any> {
    try {
      const response = await api.put(`/shops/${shopId}/customization/canvas-filters`, data);
      console.log('✅ Filtres du canvas sauvegardés avec succès');
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur updateCanvasFilters:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  // Blocs par défaut (fallback)
  getDefaultBlocks(): Block[] {
    return [
      {
        id: crypto.randomUUID(),
        type: 'banner',
        name: 'Bannière',
        order: 0,
        isVisible: true,
        position: { 
          x: 0, 
          y: 0, 
          width: 1200, 
          height: 400, 
          zIndex: 1, 
          positionType: 'relative' 
        },
        settings: {
          title: 'Bienvenue dans ma boutique',
          subtitle: 'Découvrez nos produits',
          buttonText: 'Acheter maintenant',
        },
      },
      {
        id: crypto.randomUUID(),
        type: 'text',
        name: 'Texte promotionnel',
        order: 1,
        isVisible: true,
        position: { 
          x: 100, 
          y: 200, 
          width: 300, 
          height: 60, 
          zIndex: 10, 
          positionType: 'absolute' 
        },
        settings: {
          content: 'Texte déplaçable - Cliquez pour modifier',
          fontSize: 18,
          textColor: '#000000',
          fontFamily: 'Inter',
        },
      },
      {
        id: crypto.randomUUID(),
        type: 'button',
        name: 'Bouton',
        order: 2,
        isVisible: true,
        position: { 
          x: 300, 
          y: 400, 
          width: 150, 
          height: 45, 
          zIndex: 10, 
          positionType: 'absolute' 
        },
        settings: {
          text: 'Cliquez ici',
          backgroundColor: '#2563EB',
          textColor: '#FFFFFF',
          borderRadius: 8,
        },
      },
    ];
  },

  async createOrUpdate(shopId: number, data: any): Promise<any> {
    try {
      const cleanData = {
        layoutType: data.layoutType || 'full_width',
        headerStyle: data.headerStyle || 'full_banner',
        productDisplayStyle: data.productDisplayStyle || 'grid_4',
        backgroundType: data.backgroundType || 'color',
        backgroundValue: data.backgroundValue || '#ffffff',
        backgroundPosition: data.backgroundPosition || 'center',
        backgroundRepeat: data.backgroundRepeat || 'no-repeat',
        backgroundSize: data.backgroundSize || 'cover',
        backgroundFixed: data.backgroundFixed || false,
        primaryColor: data.primaryColor || '#2563EB',
        secondaryColor: data.secondaryColor || '#7C3AED',
        accentColor: data.accentColor || '#F59E0B',
        textColor: data.textColor || '#1F2937',
        enable3DEffect: data.enable3DEffect || false,
        animationEffect: data.animationEffect || null,
        hoverEffect: data.hoverEffect || 'scale',
        pageTransition: data.pageTransition || 'fade',
        primaryFont: data.primaryFont || 'Inter',
        secondaryFont: data.secondaryFont || 'Inter',
        headingFont: data.headingFont || 'Poppins',
        bodyFont: data.bodyFont || 'Inter',
        accentFont: data.accentFont || 'Playfair Display',
        headingSizeH1: data.headingSizeH1 || 48,
        headingSizeH2: data.headingSizeH2 || 36,
        headingSizeH3: data.headingSizeH3 || 28,
        headingSizeH4: data.headingSizeH4 || 20,
        bodySize: data.bodySize || 16,
        baseFontSize: data.baseFontSize || 14,
        smallSize: data.smallSize || 12,
        headingWeight: data.headingWeight || '700',
        bodyWeight: data.bodyWeight || '400',
        headingLineHeight: data.headingLineHeight || 1.2,
        bodyLineHeight: data.bodyLineHeight || 1.5,
        letterSpacingHeading: data.letterSpacingHeading || 0,
        letterSpacingBody: data.letterSpacingBody || 0,
        textTransformHeading: data.textTransformHeading || 'none',
        textTransformBody: data.textTransformBody || 'none',
        textShadow: data.textShadow || null,
        textGradient: data.textGradient || null,
        textStroke: data.textStroke || null,
        textGlow: data.textGlow || null,
        textAnimation: data.textAnimation || null,
        textBackground: data.textBackground || 'transparent',
        textBackgroundPadding: data.textBackgroundPadding || 0,
        textBackgroundRadius: data.textBackgroundRadius || 0,
        textAnimationDuration: data.textAnimationDuration || 500,
        textAnimationDelay: data.textAnimationDelay || '0',
        customCss: data.customCss || null,
        customJs: data.customJs || null,
        filtersEnabled: data.filtersEnabled !== undefined ? data.filtersEnabled : true,
        activeShopFilterId: data.activeShopFilterId || null,
        showFilterPanel: data.showFilterPanel !== undefined ? data.showFilterPanel : true,
        defaultImageFilter: data.defaultImageFilter || 'none',
        enableFiltersPanel: data.enableFiltersPanel !== undefined ? data.enableFiltersPanel : false,
        isPublished: data.isPublished || false,
        version: data.version || 1,
        customSections: Array.isArray(data.customSections) ? data.customSections.map((s: any) => ({
          type: s.type,
          title: s.title || null,
          subtitle: s.subtitle || null,
          content: s.content || null,
          imageUrl: s.imageUrl || null,
          backgroundColor: s.backgroundColor || null,
          order: s.order || 0,
          isVisible: s.isVisible !== false,
          titleFont: s.titleFont || null,
          titleFontSize: s.titleFontSize || 24,
          titleFontWeight: s.titleFontWeight || '700',
          titleTextShadow: s.titleTextShadow || null,
          titleTextGradient: s.titleTextGradient || null,
          titleAnimation: s.titleAnimation || null,
          subtitleFont: s.subtitleFont || null,
          subtitleFontSize: s.subtitleFontSize || 16,
          subtitleFontWeight: s.subtitleFontWeight || '400',
          subtitleTextShadow: s.subtitleTextShadow || null,
          settingsJson: s.settingsJson || '{}'
        })) : [],
        customAssets: Array.isArray(data.customAssets) ? data.customAssets.map((a: any) => ({
          type: a.type || 'image',
          name: a.name || '',
          url: a.url || null,
          content: a.content || null,
          positionType: a.positionType || 'absolute',
          posX: a.posX || 0,
          posY: a.posY || 0,
          width: a.width || 200,
          height: a.height || 100,
          rotation: a.rotation || 0,
          zIndex: a.zIndex || 0,
          backgroundColor: a.backgroundColor || null,
          textColor: a.textColor || null,
          fontSize: a.fontSize || 16,
          fontFamily: a.fontFamily || null,
          textAlign: a.textAlign || 'center',
          fontWeight: a.fontWeight || '400',
          fontStyle: a.fontStyle || 'normal',
          textShadow: a.textShadow || null,
          textGradient: a.textGradient || null,
          textStroke: a.textStroke || null,
          textGlow: a.textGlow || null,
          textBackground: a.textBackground || null,
          textBackgroundPadding: a.textBackgroundPadding || 0,
          textBackgroundRadius: a.textBackgroundRadius || 0,
          textDecoration: a.textDecoration || null,
          textTransform: a.textTransform || null,
          letterSpacing: a.letterSpacing || 0,
          lineHeight: a.lineHeight || 1.5,
          maxWidth: a.maxWidth || 0,
          maxLines: a.maxLines || 0,
          animation: a.animation || null,
          duration: a.duration || 300,
          delay: a.delay || 0,
          iterationCount: a.iterationCount || null,
          isDraggable: a.isDraggable !== false,
          isResizable: a.isResizable !== false,
          isVisible: a.isVisible !== false,
          linkUrl: a.linkUrl || null,
          openInNewTab: a.openInNewTab || false,
          visibleOnMobile: a.visibleOnMobile !== false,
          visibleOnTablet: a.visibleOnTablet !== false,
          visibleOnDesktop: a.visibleOnDesktop !== false
        })) : []
      };
      
      const response = await api.put(`/shops/${shopId}/customization`, cleanData);
      return response.data;
    } catch (error: any) {
      console.error('❌ [SHOP CUSTOMIZATION ERROR]');
      console.error('  Status:', error.response?.status);
      
      if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
        console.error('  ❌ Validation Errors:');
        Object.entries(error.response.data.errors).forEach(([field, messages]: any) => {
          const messageStr = Array.isArray(messages) ? messages.join(', ') : messages;
          console.error(`    - ${field}: ${messageStr}`);
        });
      }
      
      throw error;
    }
  },

  async delete(shopId: number): Promise<void> {
    try {
      await api.delete(`/shops/${shopId}/customization`);
    } catch (error: any) {
      console.error('Erreur delete:', error.response?.data);
      throw error;
    }
  },

  async getSections(shopId: number): Promise<any[]> {
    try {
      const response = await api.get(`/shops/${shopId}/customization/sections`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async addSection(shopId: number, section: any): Promise<any> {
    const response = await api.post(`/shops/${shopId}/customization/sections`, section);
    return response.data;
  },

  async updateSection(shopId: number, sectionId: number, section: any): Promise<any> {
    const response = await api.put(`/shops/${shopId}/customization/sections/${sectionId}`, section);
    return response.data;
  },

  async deleteSection(shopId: number, sectionId: number): Promise<void> {
    await api.delete(`/shops/${shopId}/customization/sections/${sectionId}`);
  },

  async reorderSections(shopId: number, sectionIds: number[]): Promise<void> {
    await api.post(`/shops/${shopId}/customization/sections/reorder`, sectionIds);
  },

  async getAssets(shopId: number): Promise<any[]> {
    try {
      const response = await api.get(`/shops/${shopId}/customization/assets`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async addAsset(shopId: number, asset: any): Promise<any> {
    const response = await api.post(`/shops/${shopId}/customization/assets`, asset);
    return response.data;
  },

  async updateAsset(shopId: number, assetId: number, asset: any): Promise<any> {
    const response = await api.put(`/shops/${shopId}/customization/assets/${assetId}`, asset);
    return response.data;
  },

  async deleteAsset(shopId: number, assetId: number): Promise<void> {
    await api.delete(`/shops/${shopId}/customization/assets/${assetId}`);
  },

  async getProductCustomizations(shopId: number): Promise<any[]> {
    try {
      const response = await api.get(`/shops/${shopId}/customization/products`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async updateBackground(shopId: number, data: any): Promise<any> {
    const response = await api.put(`/shops/${shopId}/customization/background`, data);
    return response.data;
  },

  async getBackground(shopId: number): Promise<any> {
  try {
    const response = await api.get(`/shops/${shopId}/customization/background`);
    return response.data;
  } catch (error) {
    console.error('Erreur getBackground:', error);
    return { backgroundColor: '#FFFFFF', backgroundType: 'solid', backgroundOpacity: 100 };
  }
},

  async getFeaturedProducts(shopId: number, limit: number = 10): Promise<any[]> {
    try {
      const response = await api.get(`/shops/${shopId}/customization/products/featured`, { params: { limit } });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async getTemplates(category?: string): Promise<any[]> {
    try {
      const response = await api.get('/assets/templates', { params: { category } });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async applyTemplate(shopId: number, templateId: number, overrideExisting: boolean = false): Promise<any> {
    const response = await api.post(`/shops/${shopId}/customization/templates/apply/${templateId}`, null, {
      params: { overrideExisting },
    });
    return response.data;
  },

  async createTemplate(shopId: number, data: any): Promise<any> {
    const response = await api.post(`/shops/${shopId}/customization/templates`, data);
    return response.data;
  },

  async saveSnapshot(shopId: number, name: string): Promise<any> {
    const response = await api.post(`/shops/${shopId}/customization/snapshots/${encodeURIComponent(name)}`);
    return response.data;
  },

  async restoreSnapshot(shopId: number, name: string): Promise<any> {
    const response = await api.post(`/shops/${shopId}/customization/snapshots/${encodeURIComponent(name)}/restore`);
    return response.data;
  },

  async getSnapshots(shopId: number): Promise<any[]> {
    try {
      const response = await api.get(`/shops/${shopId}/customization/snapshots`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async deleteSnapshot(shopId: number, name: string): Promise<void> {
    await api.delete(`/shops/${shopId}/customization/snapshots/${encodeURIComponent(name)}`);
  },

  async publish(shopId: number): Promise<void> {
    await api.post(`/shops/${shopId}/customization/publish`);
  },

  async unpublish(shopId: number): Promise<void> {
    await api.post(`/shops/${shopId}/customization/unpublish`);
  },

  async getPreviewHtml(shopId: number): Promise<string> {
    try {
      const response = await api.get(`/shops/${shopId}/customization/preview/html`);
      return response.data;
    } catch (error) {
      return '<html><body>Erreur de prévisualisation</body></html>';
    }
  },

  async getPreviewScreenshot(shopId: number): Promise<string> {
    try {
      const response = await api.get(`/shops/${shopId}/customization/preview/screenshot`);
      return response.data.screenshotUrl;
    } catch (error) {
      return '';
    }
  },

  async getStats(shopId: number): Promise<any> {
    try {
      const response = await api.get(`/shops/${shopId}/customization/stats`);
      return response.data;
    } catch (error) {
      return { sectionsCount: 0, assetsCount: 0, filtersCount: 0, isPublished: false };
    }
  },
};