'use client';

import { useState, useEffect } from 'react';
import { 
  FiDroplet, FiType, FiFilter, FiImage, FiLayout, 
  FiPackage, FiSettings, FiLayers, FiTrash2, FiMove,
  FiCamera, FiBox, FiCopy, FiMaximize, FiPlusSquare
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
  onAddBlock: (type: string, props: any) => void;
  onUpdateBlock: (id: string, updates: any) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onUpdateCustomization: (updates: any) => void;
  onUpdateFilters: (updates: any) => void;
  onUpdateCanvasFilters: (updates: any) => void;
  onApplyToWholePage: (updates: any) => void;
  onSelectBackground: () => void;
  shopId: number;
}

const PANELS = [
  { id: 'sections', label: 'Sections', icon: FiPlusSquare },
  { id: 'colors', label: 'Couleurs', icon: FiDroplet },
  { id: 'fonts', label: 'Polices', icon: FiType },
  { id: 'filters', label: 'Filtres', icon: FiFilter },
  { id: 'assets', label: 'Assets', icon: FiImage },
  { id: 'templates', label: 'Templates', icon: FiLayout },
  { id: 'products', label: 'Produits', icon: FiPackage },
  { id: 'snapshots', label: 'Versions', icon: FiCamera },
  { id: 'settings', label: 'Paramètres', icon: FiSettings },
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
  shopId 
}: Props) {
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (selectedBlockId && !isBackgroundSelected) {
      const block = blocks.find(b => b.id === selectedBlockId);
      setSelectedBlock(block);
      console.log('🎨 Bloc sélectionné pour édition:', {
        id: block?.id,
        type: block?.type,
        selectedTarget,
        props: block?.props
      });
    } else {
      setSelectedBlock(null);
    }
  }, [selectedBlockId, blocks, isBackgroundSelected, selectedTarget]);

  const getBlockIcon = (type: string) => {
    const icons: Record<string, string> = {
      banner: '🖼️', logo: '⭐', title: '📝', products: '📦',
      text: '🔤', image: '🖼️', button: '🔘', spacer: '⬜', shape: '🔷'
    };
    return icons[type] || '📄';
  };

  const handlePanelChange = (panelId: string) => {
    console.log('🎨 Changement de panel vers:', panelId);
    const event = new CustomEvent('changePanel', { detail: panelId });
    window.dispatchEvent(event);
  };

  const handleUpdateBlock = (blockId: string, updates: any) => {
    console.log('🎨 Mise à jour du bloc:', { blockId, updates });
    onUpdateBlock(blockId, updates);
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
            
            {activePanel === 'assets' && <AssetsPanel onSelectAsset={(asset) => onAddBlock(asset.type, asset.defaultProps)} shopId={shopId} />}
            
            {/* ⭐ AJOUT DE shopId DANS ColorsPanel */}
            {activePanel === 'colors' && (
              <ColorsPanel 
                selectedBlock={selectedBlock} 
                selectedTarget={selectedTarget} 
                isBackgroundSelected={isBackgroundSelected} 
                customization={customization} 
                onUpdateBlock={handleUpdateBlock} 
                onUpdateCustomization={onUpdateCustomization}
                shopId={shopId}
              />
            )}
            
            {activePanel === 'fonts' && <FontsPanel selectedBlock={selectedBlock} selectedTarget={selectedTarget} isBackgroundSelected={isBackgroundSelected} customization={customization} onUpdateBlock={handleUpdateBlock} onUpdateCustomization={onUpdateCustomization} />}
            {activePanel=== 'filters' && (
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
            {activePanel === 'templates' && <TemplatesPanel onApplyTemplate={(template) => { if (template.configuration) onUpdateCustomization(template.configuration); }} />}
            {activePanel === 'products' && <ProductsPanel shopId={shopId} featuredProducts={[]} onUpdateFeatured={() => {}} />}
            {activePanel === 'snapshots' && <SnapshotsPanel shopId={shopId} onRestore={() => {}} />}
            {activePanel === 'settings' && <SettingsPanel customization={customization} onUpdate={onUpdateCustomization} />}
          </div>

          <div className="p-4 border-t border-gray-700">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FiLayers /> Calques ({blocks.length})
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <div
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  isBackgroundSelected ? 'bg-primary/20 border-l-2 border-primary' : 'hover:bg-gray-800'
                }`}
                onClick={onSelectBackground}
              >
                <div className="flex items-center gap-2">
                  <FiMaximize size={14} className="text-gray-500" />
                  <span className="text-gray-300 text-sm capitalize">🖼️ Background</span>
                </div>
              </div>
              
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedBlockId === block.id ? 'bg-primary/20 border-l-2 border-primary' : 'hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    const event = new CustomEvent('selectBlock', { detail: block.id });
                    window.dispatchEvent(event);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FiMove size={14} className="text-gray-500" />
                    <span className="text-gray-300 text-sm capitalize">
                      {getBlockIcon(block.type)} {block.type}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateBlock(block.id);
                      }}
                      className="text-gray-500 hover:text-green-400"
                      title="Dupliquer"
                    >
                      <FiCopy size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBlock(block.id);
                      }}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedBlock && !isBackgroundSelected && (
            <div className="p-4 border-t border-gray-700">
              <h3 className="text-white font-semibold mb-3">Propriétés</h3>
            </div>
          )}
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