'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FiDroplet, FiType, FiFilter, FiImage, FiLayout, 
  FiPackage, FiSettings, FiCamera, FiPlusSquare, FiLayers
} from 'react-icons/fi';
import ColorsPanel from './panels/ColorsPanel';
import FontsPanel from './panels/FontsPanel';
import FiltersPanel from './panels/FiltersPanel';
import AssetsPanel from './panels/AssetsPanel';
import TemplatesPanel from './panels/TemplatesPanel';
import SectionsPanel from './panels/SectionsPanel';
import ProductsPanel from './panels/ProductsPanel';
import SettingsPanel from './panels/SettingsPanel';
import SnapshotsPanel from './panels/SnapshotsPanel';
import TextPanel from './panels/TextPanel';
import GridManagerPanel from './panels/GridManagerPanel';
import ProductCustomizationSidebar from './panels/ProductCustomizationSidebar';
import { ProductGridConfig, ProductGridSlot, StudioProduct, ProductCustomization, CreateStudioProduct } from '@/types/studio';

interface Props {
  shop: any;
  blocks: any[];
  selectedBlockId: string | null;
  selectedTarget: 'text' | 'background';
  isBackgroundSelected: boolean;
  customization: any;
  filters: any;
  canvasFilters: any;
  activePanel: string;
  onAddBlock: (type: string, props: any, parentId?: string | null) => void;
  onUpdateBlock: (id: string, updates: any) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onUpdateCustomization: (updates: any) => void;
  onUpdateFilters: (updates: any) => void;
  onUpdateCanvasFilters: (updates: any) => void;
  onApplyToWholePage: (updates: any) => void;
  onSelectBackground: () => void;
  onReparentLayer?: (layerId: string, newParentId: string | null) => void;
  onToggleLayerVisibility?: (layerId: string) => void;
  onToggleLayerLock?: (layerId: string) => void;
  onReorderLayers?: (startIndex: number, endIndex: number, parentId?: string | null) => void;
  onGroupLayers?: (layerIds: string[]) => void;
  onUngroupLayer?: (layerId: string) => void;
  onUpdateInternalElement?: (elementId: string, parentId: string, updates: any) => void;
  onDeleteInternalElement?: (elementId: string, parentId: string) => void;
  shopId: number;
  onAddSlide?: (carouselBlockId: string) => void;
  gridConfig?: ProductGridConfig;
  onUpdateGrid?: (config: ProductGridConfig) => void;
  onSelectSlot?: (slotId: string) => void;
  onLinkProductToSlot?: (slotId: string, product: StudioProduct) => void;
  onUnlinkProductFromSlot?: (slotId: string) => void;
  onUpdateSlotConfig?: (slotId: string, config: Partial<ProductGridSlot>) => void;
  onSelectBlock?: (blockId: string | null, target?: 'text' | 'background') => void;
  onCreateProduct?: (product: CreateStudioProduct) => Promise<StudioProduct>;
  selectedProductForCustomization?: {
    id: number;
    name: string;
    customization: ProductCustomization;
    slideCount?: number;
  } | null;
  onUpdateProductCustomization?: (productId: number, updates: Partial<ProductCustomization>) => void;
  onCloseProductCustomization?: () => void;
  productsList?: StudioProduct[];
}

const PANELS = [
  { id: 'sections', label: 'Sections', icon: FiPlusSquare },
  { id: 'textes', label: 'Textes', icon: FiType },
  { id: 'colors', label: 'Couleurs', icon: FiDroplet },
  { id: 'fonts', label: 'Polices', icon: FiType },
  { id: 'filters', label: 'Filtres', icon: FiFilter },
  { id: 'assets', label: 'Assets', icon: FiImage },
  { id: 'templates', label: 'Templates', icon: FiLayout },
  { id: 'products', label: 'Produits', icon: FiPackage },
  { id: 'snapshots', label: 'Versions', icon: FiCamera },
  { id: 'settings', label: 'Paramètres', icon: FiSettings },
  { id: 'layers', label: 'Calques', icon: FiLayers },
];

export default function StudioSidebar({ 
  shop, 
  blocks, 
  selectedBlockId,
  selectedTarget,
  isBackgroundSelected,
  customization, 
  filters,
  canvasFilters,
  activePanel,
  onAddBlock,
  onUpdateBlock, 
  onDeleteBlock,
  onDuplicateBlock,
  onUpdateCustomization,
  onUpdateFilters,
  onUpdateCanvasFilters,
  onApplyToWholePage,
  onSelectBackground,
  shopId,
  onAddSlide,
  gridConfig,
  onUpdateGrid,
  onSelectSlot,
  onLinkProductToSlot,
  onUnlinkProductFromSlot,
  onUpdateSlotConfig,
  onSelectBlock,
  onCreateProduct,
  selectedProductForCustomization,
  onUpdateProductCustomization,
  onCloseProductCustomization,
  productsList = [],
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // ⭐ Pas besoin de state, on cherche le bloc directement dans blocks
  const getSelectedBlock = () => {
    if (!selectedBlockId || isBackgroundSelected) return null;
    return blocks.find(b => b.id === selectedBlockId) || null;
  };

  // ⭐ Le bloc sélectionné est calculé à chaque rendu
  const selectedBlock = getSelectedBlock();

  // ⭐ Écouter les changements de productsList
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('productsListUpdated', { 
      detail: { products: productsList }
    }));
  }, [productsList]);

  const handlePanelChange = (panelId: string) => {
    const event = new CustomEvent('changePanel', { detail: panelId });
    window.dispatchEvent(event);
  };

  const handleUpdateBlock = (blockId: string, updates: any) => {
    onUpdateBlock(blockId, updates);
  };

  const handleSelectSlot = (slotId: string) => {
    if (onSelectSlot) {
      onSelectSlot(slotId);
    }
    if (onSelectBlock) {
      onSelectBlock(slotId, 'background');
    }
  };

  return (
    <div className={`bg-gray-900 border-r border-gray-700 flex flex-col overflow-y-auto transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-2 top-20 z-10 bg-gray-800 rounded-full p-1 text-gray-400 hover:text-white"
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {!isCollapsed ? (
        <>
          <div className="p-3 border-b border-gray-700">
            <div className="grid grid-cols-3 gap-1">
              {PANELS.map(panel => (
                <button
                  key={panel.id}
                  onClick={() => handlePanelChange(panel.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    activePanel === panel.id ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <panel.icon size={18} />
                  <span className="text-[10px]">{panel.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {activePanel === 'sections' && <SectionsPanel onAddSection={onAddBlock} />}
            
            {activePanel === 'textes' && (
              <TextPanel onAddText={(textData) => {
                const defaultPosition = { x: 200, y: 200, width: 300, height: 100, zIndex: 10 };
                onAddBlock(textData.type, { ...textData, position: defaultPosition });
              }} />
            )}
            
            {activePanel === 'assets' && (
              <AssetsPanel
                onSelectAsset={(asset) => onAddBlock(asset.type, asset.defaultProps)}
                shopId={shopId}
              />
            )}
            
            {activePanel === 'colors' && (
              <ColorsPanel 
                selectedBlock={selectedBlock} 
                selectedTarget={selectedTarget} 
                isBackgroundSelected={isBackgroundSelected} 
                customization={customization} 
                onUpdateBlock={handleUpdateBlock} 
                onUpdateCustomization={onUpdateCustomization}
                shopId={shopId}
                onAddSlide={onAddSlide}
              />
            )}
            
            {activePanel === 'fonts' && (
              <FontsPanel
                selectedBlock={selectedBlock}
                selectedTarget={selectedTarget}
                isBackgroundSelected={isBackgroundSelected}
                customization={customization}
                onUpdateBlock={handleUpdateBlock}
                onUpdateCustomization={onUpdateCustomization}
              />
            )}

            {activePanel === 'filters' && (
              <FiltersPanel 
                selectedBlock={selectedBlock} 
                isBackgroundSelected={isBackgroundSelected} 
                filters={filters}
                canvasFilters={canvasFilters} 
                onUpdateBlock={handleUpdateBlock} 
                onUpdateFilters={onUpdateFilters}
                onUpdateCanvasFilters={onUpdateCanvasFilters} 
                onApplyToWholePage={onApplyToWholePage} 
              />
            )}

            {activePanel === 'templates' && (
              <TemplatesPanel
                onApplyTemplate={(template) => {
                  if (template.configuration) onUpdateCustomization(template.configuration);
                }}
              />
            )}

            {activePanel === 'products' && gridConfig && onUpdateGrid && (
              <GridManagerPanel
                gridConfig={gridConfig}
                products={productsList}
                selectedSlotId={selectedBlockId}
                onUpdateGrid={onUpdateGrid}
                onSelectSlot={handleSelectSlot}
                onLinkProduct={onLinkProductToSlot || (() => {})}
                onUnlinkProduct={onUnlinkProductFromSlot || (() => {})}
                onUpdateSlotConfig={onUpdateSlotConfig || (() => {})}
                onCreateProduct={onCreateProduct}
              />
            )}

            {activePanel === 'products' && !gridConfig && (
              <ProductsPanel 
                shopId={shopId} 
                featuredProducts={[]} 
                onUpdateFeatured={() => {}} 
                onCreateProduct={onCreateProduct}
              />
            )}

            {activePanel === 'snapshots' && (
              <SnapshotsPanel shopId={shopId} onRestore={() => {}} />
            )}

            {activePanel === 'settings' && (
              <SettingsPanel customization={customization} onUpdate={onUpdateCustomization} />
            )}

            {selectedProductForCustomization && (
              <div className="border-t border-gray-700 mt-4 pt-4">
                <ProductCustomizationSidebar
                  productId={selectedProductForCustomization.id}
                  productName={selectedProductForCustomization.name}
                  customization={selectedProductForCustomization.customization}
                  slideCount={selectedProductForCustomization.slideCount}
                  onUpdate={(updates) => {
                    onUpdateProductCustomization?.(selectedProductForCustomization.id, updates);
                  }}
                  onClose={onCloseProductCustomization || (() => {})}
                />
              </div>
            )}

            {activePanel === 'layers' && (
              <div className="p-2">
                <button
                  onClick={() => {
                    const event = new CustomEvent('toggleFloatingLayers');
                    window.dispatchEvent(event);
                  }}
                  className="w-full py-2 bg-primary text-white rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-primary/80 transition-colors"
                >
                  <FiLayers size={16} />
                  Ouvrir le panneau des calques
                </button>
                <p className="text-xs text-gray-400 mt-3 text-center border-t border-gray-700 pt-3">
                  💡 Raccourci : <kbd className="px-1 py-0.5 bg-gray-800 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-800 rounded">Shift</kbd> + <kbd className="px-1 py-0.5 bg-gray-800 rounded">L</kbd>
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 p-3">
          {PANELS.map(panel => (
            <button
              key={panel.id}
              onClick={() => handlePanelChange(panel.id)}
              className={`p-2 rounded-lg transition-colors ${
                activePanel === panel.id ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
              title={panel.label}
            >
              <panel.icon size={20} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}