'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  FiDroplet, FiType, FiFilter, FiImage, FiLayout, 
  FiPackage, FiSettings, FiLayers, FiTrash2, FiMove,
  FiCamera, FiBox, FiCopy, FiMaximize, FiPlusSquare,
  FiEye, FiEyeOff, FiLock, FiUnlock, FiChevronDown, 
  FiChevronRight, FiMinimize2, FiEdit2,
  FiPlus
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

// ⭐ Interface pour les calques
interface Layer {
  id: string;
  name: string;
  type: string;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  children: Layer[];
  parentId: string | null;
  blockId: string;
  isExpanded: boolean;
  isInternal?: boolean;
}

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
];

const BlockChildrenService = {
  extractChildren(block: any): any[] {
    const children: any[] = [];
    const props = block.props || {};
    
    switch (block.type) {
      case 'banner':
      case 'screen-banner':
        break;
      case 'carousel-banner':
        if (props.slides && Array.isArray(props.slides)) {
          props.slides.forEach((slide: any, index: number) => {
            children.push({
              id: `${block.id}-slide-${index}`,
              type: 'carousel-slide',
              parentId: block.id,
              props: { 
                imageUrl: slide.imageUrl,
                title: slide.title,
                description: slide.description,
                buttonText: slide.buttonText,
              },
              order: index,
              isVisible: true,
              isInternal: true,
            });
          });
        }
        break;
      case 'products':
        if (props.title) {
          children.push({
            id: `${block.id}-title`,
            type: 'title',
            parentId: block.id,
            props: { content: props.title, fontSize: 32, fontWeight: 'bold' },
            order: 0,
            isVisible: true,
            isInternal: true,
          });
        }
        break;
    }
    
    return children;
  }
};

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
  onReparentLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onReorderLayers,
  onGroupLayers,
  onUngroupLayer,
  onUpdateInternalElement,
  onDeleteInternalElement,
  shopId 
}: Props) {
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'top' | 'bottom' | 'inside' | null>(null);

  useEffect(() => {
    if (selectedBlockId && !isBackgroundSelected) {
      const block = blocks.find(b => b.id === selectedBlockId);
      setSelectedBlock(block);
    } else {
      setSelectedBlock(null);
    }
  }, [selectedBlockId, blocks, isBackgroundSelected]);

  const getBlockIcon = (type: string, isInternal?: boolean) => {
    const icons: Record<string, string> = {
      banner: '🖼️', logo: '⭐', title: '📝', products: '📦',
      text: '🔤', image: '🖼️', button: '🔘', spacer: '⬜', 
      shape: '🔷', section: '📐', group: '📁',
      'carousel-slide': '📷'
    };
    const icon = icons[type] || '📄';
    return isInternal ? `└─ ${icon}` : icon;
  };

  const generateLayersFromBlocks = useCallback((): Layer[] => {
    const blockMap = new Map<string, any>();
    const childrenMap = new Map<string, string[]>();
    
    blocks.forEach(block => {
      blockMap.set(block.id, block);
      if (block.parentId) {
        if (!childrenMap.has(block.parentId)) {
          childrenMap.set(block.parentId, []);
        }
        childrenMap.get(block.parentId)!.push(block.id);
      }
    });
    
    blocks.forEach(block => {
      const internalChildren = BlockChildrenService.extractChildren(block);
      internalChildren.forEach(child => {
        if (!childrenMap.has(block.id)) {
          childrenMap.set(block.id, []);
        }
        childrenMap.get(block.id)!.push(child.id);
        blockMap.set(child.id, {
          ...child,
          type: child.type,
          props: child.props,
          position: { x: 0, y: 0, width: 200, height: 100, zIndex: child.order },
          order: child.order,
          isVisible: child.isVisible,
          parentId: block.id,
          isLocked: false,
          isInternal: child.isInternal || false,
        });
      });
    });
    
    const buildNode = (blockId: string): Layer => {
      const block = blockMap.get(blockId);
      const children = childrenMap.get(blockId) || [];
      
      const sortedChildren = [...children].sort((a, b) => {
        const blockA = blockMap.get(a);
        const blockB = blockMap.get(b);
        return (blockA?.position?.zIndex || 0) - (blockB?.position?.zIndex || 0);
      });
      
      return {
        id: block.id,
        name: block.props?.title || block.props?.text || block.props?.content || `${block.type} ${block.order + 1}`,
        type: block.type,
        zIndex: block.position?.zIndex || block.order,
        visible: block.isVisible !== false,
        locked: block.isLocked || false,
        children: sortedChildren.map(childId => buildNode(childId)),
        parentId: block.parentId || null,
        blockId: block.id,
        isExpanded: expandedLayers.has(block.id),
        isInternal: block.isInternal || false,
      };
    };
    
    const rootBlocks = blocks.filter(block => !block.parentId);
    const sortedRoots = [...rootBlocks].sort((a, b) => (a.position?.zIndex || 0) - (b.position?.zIndex || 0));
    
    return sortedRoots.map(block => buildNode(block.id));
  }, [blocks, expandedLayers]);

  const handlePanelChange = (panelId: string) => {
    const event = new CustomEvent('changePanel', { detail: panelId });
    window.dispatchEvent(event);
  };

  const handleUpdateBlock = (blockId: string, updates: any) => {
    onUpdateBlock(blockId, updates);
  };

  const handleSelectLayer = (layerId: string) => {
    const event = new CustomEvent('selectBlock', { detail: layerId });
    window.dispatchEvent(event);
  };

  const handleToggleLayerSelection = (layerId: string, checked: boolean) => {
    if (checked) {
      setSelectedLayers(prev => new Set(prev).add(layerId));
    } else {
      setSelectedLayers(prev => {
        const newSet = new Set(prev);
        newSet.delete(layerId);
        return newSet;
      });
    }
  };

  const handleGroupSelected = () => {
    if (selectedLayers.size > 1 && onGroupLayers) {
      onGroupLayers(Array.from(selectedLayers));
      setSelectedLayers(new Set());
    }
  };

  const handleDeleteSelected = () => {
    if (selectedLayers.size > 0) {
      if (confirm(`Supprimer ${selectedLayers.size} élément(s) ?`)) {
        selectedLayers.forEach(layerId => {
          onDeleteBlock(layerId);
        });
        setSelectedLayers(new Set());
      }
    }
  };

  const showGroupButton = selectedLayers.size > 1;

  // ⭐ Fonction pour trouver l'index d'un calque dans l'arborescence (layers)
  const getLayerIndexInParent = useCallback((targetLayerId: string, parentId: string | null, layersList: Layer[]): number => {
    const findIndex = (items: Layer[]): number => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === targetLayerId) return i;
        if (items[i].children.length > 0) {
          const childIndex = findIndex(items[i].children);
          if (childIndex !== -1) return childIndex;
        }
      }
      return -1;
    };
    
    if (parentId === null) {
      return findIndex(layersList);
    } else {
      const findParent = (items: Layer[]): Layer | null => {
        for (const item of items) {
          if (item.id === parentId) return item;
          if (item.children.length > 0) {
            const found = findParent(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      const parentLayer = findParent(layersList);
      if (parentLayer) {
        return parentLayer.children.findIndex(c => c.id === targetLayerId);
      }
      return -1;
    }
  }, []);

  // ⭐ RENDERLAYERITEM CORRIGÉ - Utilise l'index dans l'arborescence
  const renderLayerItem = (layer: Layer, depth: number = 0, parentId: string | null = null) => {
    const isSelected = selectedBlockId === layer.id;
    const isChecked = selectedLayers.has(layer.id);
    const isGroup = layer.type === 'group';
    const isInternal = layer.isInternal === true;
    const canHaveChildren = ['banner', 'screen-banner', 'carousel-banner', 'section', 'group'].includes(layer.type);
    const children = layer.children;
    const isDragOverThis = dragOverTarget === layer.id;
    
    return (
      <div key={layer.id} className="relative">
        {/* ⭐ ZONE DE DROP AU-DESSUS */}
        {!isInternal && (
          <div
            className={`h-0.5 rounded transition-all ${dragOverTarget === `top-${layer.id}` ? 'bg-primary h-1' : 'hover:bg-gray-700 h-0.5'}`}
            style={{ margin: '1px 0' }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'move';
              setDragOverTarget(`top-${layer.id}`);
              setDragOverPosition('top');
            }}
            onDragLeave={(e) => {
              setDragOverTarget(null);
              setDragOverPosition(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const draggedLayerId = e.dataTransfer.getData('text/plain');
              if (draggedLayerId && draggedLayerId !== layer.id && onReorderLayers) {
                const targetIndex = getLayerIndexInParent(layer.id, parentId, layers);
                const draggedIndex = getLayerIndexInParent(draggedLayerId, parentId, layers);
                if (draggedIndex !== -1 && targetIndex !== -1) {
                  const newIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
                  onReorderLayers(draggedIndex, Math.max(0, newIndex), parentId);
                }
              }
              setDragOverTarget(null);
              setDragOverPosition(null);
            }}
          />
        )}
        
        {/* Élément lui-même */}
        <div
          data-layer-id={layer.id}
          className={`flex items-center py-1 px-2 rounded cursor-pointer transition-colors ${
            isSelected ? 'bg-primary/30 border-l-2 border-primary' : 'hover:bg-gray-800'
          } ${isInternal ? 'opacity-80' : ''} ${isDragOverThis && dragOverPosition === 'inside' ? 'ring-2 ring-primary ring-inset' : ''}`}
          style={{ marginLeft: `${depth * 16}px` }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            setDragOverTarget(layer.id);
            setDragOverPosition('inside');
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = '#374151';
            target.style.outline = '2px solid #8B5CF6';
            target.style.outlineOffset = '-1px';
          }}
          onDragLeave={(e) => {
            setDragOverTarget(null);
            setDragOverPosition(null);
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = '';
            target.style.outline = '';
            target.style.outlineOffset = '';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const draggedLayerId = e.dataTransfer.getData('text/plain');
            if (draggedLayerId && draggedLayerId !== layer.id && onReparentLayer) {
              console.log(`📦 Drop: ${draggedLayerId} devient enfant de ${layer.id}`);
              onReparentLayer(draggedLayerId, layer.id);
            }
            setDragOverTarget(null);
            setDragOverPosition(null);
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = '';
            target.style.outline = '';
            target.style.outlineOffset = '';
          }}
        >
          {/* Drag handle */}
          {!isInternal && !layer.locked && (
            <div
              draggable={true}
              onDragStart={(e) => {
                console.log('🎯 Drag start - layerId:', layer.id);
                e.dataTransfer.setData('text/plain', layer.id);
                e.dataTransfer.effectAllowed = 'move';
                (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
              }}
              onDragEnd={(e) => {
                (e.currentTarget as HTMLElement).style.cursor = 'grab';
                setDragOverTarget(null);
                setDragOverPosition(null);
              }}
              className="cursor-grab mr-1"
            >
              <FiMove size={12} className="text-gray-500" />
            </div>
          )}
          {isInternal && <div className="w-4 mr-1" />}

          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => handleToggleLayerSelection(layer.id, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="mr-1 w-3 h-3 cursor-pointer"
          />

          <span className="mr-2 text-sm">
            {isInternal ? '└─ ' : ''}{getBlockIcon(layer.type, false)}
          </span>

          <span 
            className="flex-1 text-sm text-gray-300 truncate cursor-pointer"
            onClick={() => handleSelectLayer(layer.id)}
          >
            {layer.name}
          </span>

          {isGroup && children.length > 0 && (
            <span className="text-xs text-gray-500 mr-2 px-1 bg-gray-800 rounded">
              {children.length}
            </span>
          )}

          {!isInternal && (
            <span className="text-xs text-gray-500 mr-2 px-1 bg-gray-800 rounded">
              z:{layer.zIndex}
            </span>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onToggleLayerVisibility?.(layer.id); }}
            className="p-1 text-gray-500 hover:text-white"
            title={layer.visible ? 'Masquer' : 'Afficher'}
          >
            {layer.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
          </button>

          {!isInternal && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLayerLock?.(layer.id); }}
              className="p-1 text-gray-500 hover:text-white"
              title={layer.locked ? 'Déverrouiller' : 'Verrouiller'}
            >
              {layer.locked ? <FiLock size={14} /> : <FiUnlock size={14} />}
            </button>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 ml-1">
            {!isInternal && canHaveChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const event = new CustomEvent('openAddToParent', { 
                    detail: { 
                      parentId: layer.id, 
                      parentType: layer.type, 
                      parentName: layer.name 
                    }
                  });
                  window.dispatchEvent(event);
                }}
                className="p-1 text-gray-500 hover:text-green-400"
                title={`Ajouter un élément à l'intérieur de ${layer.name}`}
              >
                <FiPlus size={12} />
              </button>
            )}
            
            {isGroup && onUngroupLayer && (
              <button
                onClick={(e) => { e.stopPropagation(); onUngroupLayer(layer.id); }}
                className="p-1 text-gray-500 hover:text-yellow-400"
                title="Dégrouper"
              >
                <FiMinimize2 size={12} />
              </button>
            )}
            
            {!isInternal && (
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicateBlock(layer.id); }}
                className="p-1 text-gray-500 hover:text-green-400"
                title="Dupliquer"
              >
                <FiCopy size={12} />
              </button>
            )}
            
            {isInternal && onDeleteInternalElement && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteInternalElement(layer.id, layer.parentId!); }}
                className="p-1 text-gray-500 hover:text-red-400"
                title="Supprimer l'élément"
              >
                <FiTrash2 size={12} />
              </button>
            )}
            
            {!isInternal && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteBlock(layer.id); }}
                className="p-1 text-gray-500 hover:text-red-400"
                title="Supprimer"
              >
                <FiTrash2 size={12} />
              </button>
            )}
          </div>
        </div>
        
        {/* ⭐ ZONE DE DROP EN-DESSOUS */}
        {!isInternal && (
          <div
            className={`h-0.5 rounded transition-all ${dragOverTarget === `bottom-${layer.id}` ? 'bg-primary h-1' : 'hover:bg-gray-700 h-0.5'}`}
            style={{ margin: '1px 0' }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'move';
              setDragOverTarget(`bottom-${layer.id}`);
              setDragOverPosition('bottom');
            }}
            onDragLeave={(e) => {
              setDragOverTarget(null);
              setDragOverPosition(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const draggedLayerId = e.dataTransfer.getData('text/plain');
              if (draggedLayerId && draggedLayerId !== layer.id && onReorderLayers) {
                const targetIndex = getLayerIndexInParent(layer.id, parentId, layers);
                const draggedIndex = getLayerIndexInParent(draggedLayerId, parentId, layers);
                if (draggedIndex !== -1 && targetIndex !== -1) {
                  const newIndex = draggedIndex < targetIndex ? targetIndex : targetIndex + 1;
                  onReorderLayers(draggedIndex, newIndex, parentId);
                }
              }
              setDragOverTarget(null);
              setDragOverPosition(null);
            }}
          />
        )}
        
        {children.length > 0 && (
          <div>
            {children.map((child) => renderLayerItem(child, depth + 1, layer.id))}
          </div>
        )}
      </div>
    );
  };

  const layers = generateLayersFromBlocks();

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
                onAddBlock(textData.type, {
                  ...textData,
                  position: defaultPosition,
                });
              }} />
            )}
            
            {activePanel === 'assets' && <AssetsPanel onSelectAsset={(asset) => onAddBlock(asset.type, asset.defaultProps)} shopId={shopId} />}
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
            {activePanel === 'templates' && <TemplatesPanel onApplyTemplate={(template) => { if (template.configuration) onUpdateCustomization(template.configuration); }} />}
            {activePanel === 'products' && <ProductsPanel shopId={shopId} featuredProducts={[]} onUpdateFeatured={() => {}} />}
            {activePanel === 'snapshots' && <SnapshotsPanel shopId={shopId} onRestore={() => {}} />}
            {activePanel === 'settings' && <SettingsPanel customization={customization} onUpdate={onUpdateCustomization} />}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FiLayers /> Calques ({blocks.length})
              </h3>
            </div>
            
            <div className="flex gap-2 mb-3">
              {showGroupButton && onGroupLayers && (
                <button
                  onClick={handleGroupSelected}
                  className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary/80"
                >
                  🔗 Grouper ({selectedLayers.size})
                </button>
              )}
              {selectedLayers.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red/80"
                >
                  🗑️ Supprimer ({selectedLayers.size})
                </button>
              )}
            </div>
            
            <div
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors mb-2 ${
                isBackgroundSelected ? 'bg-primary/20 border-l-2 border-primary' : 'hover:bg-gray-800'
              }`}
              onClick={onSelectBackground}
            >
              <div className="flex items-center gap-2">
                <FiMaximize size={14} className="text-gray-500" />
                <span className="text-gray-300 text-sm">🖼️ Background</span>
              </div>
            </div>
            
            {/* ⭐ ZONE DE DROP POUR LA RACINE */}
            <div 
              className={`space-y-0.5 max-h-96 overflow-y-auto transition-colors ${isDragOverRoot ? 'bg-gray-800 ring-2 ring-primary ring-inset' : ''}`}
              onDragOver={(e) => {
                const target = e.target as HTMLElement;
                const isChild = target.closest('[data-layer-id]') !== null;
                
                if (!isChild) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setIsDragOverRoot(true);
                }
              }}
              onDragLeave={(e) => {
                setIsDragOverRoot(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverRoot(false);
                
                const target = e.target as HTMLElement;
                const isChild = target.closest('[data-layer-id]') !== null;
                
                if (!isChild) {
                  const draggedLayerId = e.dataTransfer.getData('text/plain');
                  if (draggedLayerId && onReparentLayer) {
                    console.log(`📦 Drop racine: ${draggedLayerId} devient indépendant (parent = null)`);
                    onReparentLayer(draggedLayerId, null);
                  }
                }
              }}
            >
              {layers.map((layer) => renderLayerItem(layer, 0, null))}
            </div>
            
            {blocks.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Aucun calque
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-800/50 rounded">
              💡 Astuces:
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-400">
                <li>🖱️ Glissez-déposez SUR un calque pour le rendre enfant</li>
                <li>🖱️ Glissez-déposez DANS L'ESPACE ENTRE deux calques pour réorganiser l'ordre</li>
                <li>🖱️ Glissez-déposez dans la zone vide pour rendre indépendant</li>
                <li>➕ Bouton + pour ajouter des éléments à l'intérieur des blocs parents</li>
                <li>Cochez plusieurs calques → Grouper / Supprimer</li>
                <li>👁️ Masquer/Afficher | 🔒 Verrouiller</li>
                <li>📋 Dupliquer | 🗑️ Supprimer</li>
                <li>📁 Dégrouper un groupe</li>
              </ul>
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