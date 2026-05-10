'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { shopCustomizationService } from '@/services/api/shopCustomization';
import { filterService } from '@/services/api/filters';
import StudioToolbar from './StudioToolbar';
import StudioCanvas from './StudioCanvas';
import StudioSidebar from './StudioSidebar';
import AddBlockPanel from './add/AddBlockPanel';
import { GoogleFontsLoader } from './GoogleFontsLoader';

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

        console.log('📦📦📦 CUSTOMIZATION CHARGÉE DU BACKEND:', customization);
        console.log('📦📦📦 BACKGROUND CHARGÉ:', background);
        console.log('📦📦📦 BACKGROUND COLOR:', background?.backgroundColor);
        console.log('📦📦📦 BACKGROUND TYPE:', background?.backgroundType);
        console.log('📦📦📦 SHOP BACKGROUND COLOR:', shop?.backgroundColor);
        console.log('📦📦📦 SHOP THEME COLOR:', shop?.themeColor);

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
              x: b.position.x || 100,
              y: b.position.y || 100,
              width: b.position.width || 200,
              height: b.position.height || 100,
              zIndex: b.position.zIndex || 1,
              rotation: b.position.rotation || 0,
              positionType: b.position.positionType || 'absolute',
            } : { x: 100, y: 100, width: 200, height: 100, zIndex: 1, rotation: 0, positionType: 'absolute' },
            order: b.order || 0,
            isVisible: b.isVisible !== false,
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
          canvasFilters: canvasFilters,
        }));
        
        console.log('🎨 ÉTAT INITIAL APRÈS CHARGEMENT:', {
          backgroundColor: background?.backgroundColor || shop.backgroundColor,
          backgroundType: background?.backgroundType,
          primaryColor: customization?.PrimaryColor || shop.themeColor,
          textColor: customization?.TextColor || shop.textColor
        });
      } catch (error) {
        console.error('❌ Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id, user, router]);

  // ⭐ Gestionnaire pour ouvrir le sélecteur d'images pour le carrousel
  useEffect(() => {
    const handleOpenAssetPickerForCarousel = (event: CustomEvent) => {
      console.log('🎠 Ouverture du sélecteur d\'images pour le carrousel');
      // Ouvrir le panel assets et passer à l'onglet "Mes images"
      setState(prev => ({ ...prev, activePanel: 'assets' }));
      
      // Stocker le callback pour l'utiliser quand l'utilisateur sélectionne une image
      (window as any).pendingCarouselCallback = event.detail.callback;
    };
    
    window.addEventListener('openAssetPickerForCarousel', handleOpenAssetPickerForCarousel as EventListener);
    return () => window.removeEventListener('openAssetPickerForCarousel', handleOpenAssetPickerForCarousel as EventListener);
  }, []);

  const saveChanges = useCallback(async () => {
    console.log('💾 saveChanges appelée - isDirty:', state.isDirty);
    console.log('💾 saveChanges - backgroundColor:', state.customization?.backgroundColor);
    console.log('💾 saveChanges - blocks count:', state.blocks.length);
    
    if (!state.isDirty) return;

    setSaving(true);
    try {
      const blocksToSave = state.blocks.map(block => ({
        id: block.id,
        type: block.type,
        name: block.type,
        order: block.order,
        isVisible: block.isVisible,
        position: {
          x: block.position.x,
          y: block.position.y,
          width: block.position.width,
          height: block.position.height,
          zIndex: block.position.zIndex,
          rotation: block.position.rotation || 0,
          positionType: block.position.positionType || 'absolute',
        },
        settings: { ...block.props, position: block.position },
      }));

      console.log('💾 Sauvegarde des blocs en cours...');
      
      await Promise.all([
        shopCustomizationService.updateBlocks(Number(id), blocksToSave as any),
        shopCustomizationService.updateCanvasFilters(Number(id), {
          globalBrightness: state.canvasFilters?.globalBrightness ?? 1,
          globalContrast: state.canvasFilters?.globalContrast ?? 1,
          globalSaturation: state.canvasFilters?.globalSaturation ?? 1,
          globalBlur: state.canvasFilters?.globalBlur ?? 0,
          globalCssFilter: state.canvasFilters?.globalCssFilter || 'none',
        }),
        shopCustomizationService.updateBackground(Number(id), {
          backgroundColor: state.customization?.backgroundColor || '#FFFFFF',
          backgroundType: state.customization?.backgroundType || 'solid',
          backgroundValue: state.customization?.backgroundValue || null,
          backgroundOpacity: state.customization?.backgroundOpacity || 100,
        }),
      ]);
      
      setState(prev => ({ ...prev, isDirty: false }));
      console.log('✅ Sauvegarde effectuée (blocs, filtres, background)');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  }, [id, state.blocks, state.isDirty, state.canvasFilters, state.customization]);

  useEffect(() => {
    if (state.isDirty && !saving) {
      console.log('⏰ Déclenchement du timer - isDirty:', state.isDirty);
      console.log('⏰ Sauvegarde prévue dans 3 secondes...');
      
      const timer = setTimeout(() => {
        console.log('💾 Exécution de saveChanges APRÈS 3 SECONDES');
        saveChanges();
      }, 3000);
      
      return () => {
        console.log('❌ Timer annulé à cause d\'un nouveau changement');
        clearTimeout(timer);
      };
    }
  }, [state.isDirty, saving, saveChanges]);

  const updateCustomization = (updates: any) => {
    console.log('🔴🔴🔴 updateCustomization APPELEE avec:', updates);
    console.log('🔴 customization actuel:', state.customization);
    
    setState(prev => {
      const newCustomization = { ...prev.customization, ...updates };
      console.log('🔴 nouveau customization:', newCustomization);
      console.log('🔴 isDirty devient true');
      
      return {
        ...prev,
        customization: newCustomization,
        isDirty: true,
      };
    });
  };

  const addBlock = (type: string, props: any) => {
    console.log('➕ addBlock appelé:', { type, props });
    const newBlock: BlockUI = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      props,
      position: {
        x: 200 + state.blocks.length * 20,
        y: 100 + state.blocks.length * 30,
        width: props.width || 200,
        height: props.height || (type === 'text' ? 80 : 100),
        zIndex: state.blocks.length + 1,
        rotation: 0,
        positionType: 'absolute',
      },
      order: state.blocks.length,
      isVisible: true,
    };
    setState(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      isDirty: true,
      selectedBlockId: newBlock.id,
      selectedTarget: 'text',
      isBackgroundSelected: false,
    }));
  };

  const deleteBlock = (blockId: string) => {
    console.log('🗑️ deleteBlock appelé:', blockId);
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId),
      selectedBlockId: null,
      selectedTarget: 'text',
      isBackgroundSelected: false,
      isDirty: true,
    }));
  };

  const updateBlock = (blockId: string, updates: any) => {
    console.log('✏️ updateBlock appelé:', { blockId, updates });
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b =>
        b.id === blockId ? { ...b, props: { ...b.props, ...updates } } : b
      ),
      isDirty: true,
    }));
  };

  const updateBlockPosition = (blockId: string, position: Partial<BlockPosition>) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b =>
        b.id === blockId ? { ...b, position: { ...b.position, ...position } } : b
      ),
      isDirty: true,
    }));
  };

  const duplicateBlock = (blockId: string) => {
    const block = state.blocks.find(b => b.id === blockId);
    if (block) {
      const newBlock = {
        ...block,
        id: `${block.type}-${Date.now()}-${Math.random()}`,
        position: { ...block.position, x: block.position.x + 20, y: block.position.y + 20, zIndex: state.blocks.length + 1 },
        order: state.blocks.length,
      };
      setState(prev => ({
        ...prev,
        blocks: [...prev.blocks, newBlock],
        isDirty: true,
        selectedBlockId: newBlock.id,
        selectedTarget: 'text',
        isBackgroundSelected: false,
      }));
    }
  };

  const reorderBlocks = (startIndex: number, endIndex: number) => {
    const reordered = [...state.blocks];
    const [removed] = reordered.splice(startIndex, 1);
    reordered.splice(endIndex, 0, removed);
    const withNewOrder = reordered.map((block, idx) => ({ ...block, order: idx }));
    setState(prev => ({ ...prev, blocks: withNewOrder, isDirty: true }));
  };

  const updateFilters = (updates: any) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...updates },
      isDirty: true,
    }));
  };

  const updateCanvasFilters = (updates: any) => {
    setState(prev => ({
      ...prev,
      canvasFilters: { ...prev.canvasFilters, ...updates },
      isDirty: true,
    }));
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
        }
      })),
      isDirty: true,
    }));
  }, []);

  useEffect(() => {
    (window as any).applyFiltersToAllBlocks = applyFiltersToAllBlocks;
    return () => {
      delete (window as any).applyFiltersToAllBlocks;
    };
  }, [applyFiltersToAllBlocks]);

  const handlePreviewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setState(prev => ({ ...prev, previewMode: mode }));
  };

  const handleZoomIn = () => {
    setState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 10, 200) }));
  };

  const handleZoomOut = () => {
    setState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 10, 30) }));
  };

  const handleZoomReset = () => {
    setState(prev => ({ ...prev, zoom: 70 }));
  };

  const selectBackground = () => {
    setState(prev => ({ 
      ...prev, 
      selectedBlockId: null,
      selectedTarget: 'background',
      isBackgroundSelected: true 
    }));
  };

  const selectBlock = (blockId: string | null, target?: 'text' | 'background') => {
    setState(prev => ({ 
      ...prev, 
      selectedBlockId: blockId,
      selectedTarget: target || 'text',
      isBackgroundSelected: false 
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '+') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        handleZoomReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleChangePanel = (event: CustomEvent) => {
      setState(prev => ({ ...prev, activePanel: event.detail }));
    };
    
    const handleOpenAddPanel = () => {
      setState(prev => ({ ...prev, showAddPanel: true }));
    };
    
    window.addEventListener('changePanel', handleChangePanel as EventListener);
    window.addEventListener('openAddPanel', handleOpenAddPanel);
    
    return () => {
      window.removeEventListener('changePanel', handleChangePanel as EventListener);
      window.removeEventListener('openAddPanel', handleOpenAddPanel);
    };
  }, []);

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
          onAddBlock={() => setState(prev => ({ ...prev, showAddPanel: true }))}
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
            shopId={Number(id)}
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

        {state.showAddPanel && (
          <AddBlockPanel
            onClose={() => setState(prev => ({ ...prev, showAddPanel: false }))}
            onAddBlock={addBlock}
          />
        )}
      </div>
    </>
  );
}