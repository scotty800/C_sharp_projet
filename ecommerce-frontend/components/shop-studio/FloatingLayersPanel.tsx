'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FiLayers, FiTrash2, FiCopy, FiMove, FiMaximize,
  FiEye, FiEyeOff, FiLock, FiUnlock, FiChevronDown, 
  FiChevronRight, FiMinimize2, FiPlus
} from 'react-icons/fi';

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
  layers: Layer[];
  selectedLayerId: string | null;
  isBackgroundSelected: boolean;
  blocksCount: number;
  onSelectLayer: (layerId: string) => void;
  onSelectBackground: () => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
  onGroupLayers?: (layerIds: string[]) => void;
  onUngroupLayer?: (layerId: string) => void;
  onReparentLayer?: (layerId: string, newParentId: string | null) => void;
  onReorderLayers?: (startIndex: number, endIndex: number, parentId?: string | null) => void;
  onDeleteInternalElement?: (elementId: string, parentId: string) => void;
  getLayerIndexInParent?: (targetLayerId: string, parentId: string | null, layersList: Layer[]) => number;
  onClose: () => void;
}

const LayerItem = ({ 
  layer, 
  depth, 
  selectedLayerId, 
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onDuplicateLayer,
  onGroupLayers,
  onUngroupLayer,
  onReparentLayer,
  onReorderLayers,
  onDeleteInternalElement,
  selectedLayers,
  setSelectedLayers,
  getLayerIndexInParent,
  layersList,
}: any) => {
  const [isExpanded, setIsExpanded] = useState(layer.isExpanded !== false);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'top' | 'bottom' | 'inside' | null>(null);

  const isSelected = selectedLayerId === layer.id;
  const isChecked = selectedLayers.has(layer.id);
  const isGroup = layer.type === 'group';
  const isInternal = layer.isInternal === true;
  const canHaveChildren = ['banner', 'screen-banner', 'carousel-banner', 'section', 'group'].includes(layer.type);
  const children = layer.children;

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    if (layer.locked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', layerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getBlockIcon = (type: string) => {
    const icons: Record<string, string> = {
      banner: '🖼️', logo: '⭐', title: '📝', products: '📦',
      text: '🔤', image: '🖼️', button: '🔘', spacer: '⬜', 
      shape: '🔷', section: '📐', group: '📁',
      'carousel-slide': '📷'
    };
    return icons[type] || '📄';
  };

  const primaryColor = '#8B5CF6';

  return (
    <div key={layer.id} className="relative">
      {/* Zone de drop au-dessus */}
      {!isInternal && !layer.locked && (
        <div
          className={`h-0.5 rounded transition-all ${dragOverTarget === `top-${layer.id}` ? 'h-1' : 'h-0.5'}`}
          style={{ 
            margin: '1px 0',
            backgroundColor: dragOverTarget === `top-${layer.id}` ? primaryColor : 'transparent',
            transition: 'all 0.2s ease',
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            setDragOverTarget(`top-${layer.id}`);
            setDragOverPosition('top');
          }}
          onDragLeave={() => {
            setDragOverTarget(null);
            setDragOverPosition(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const draggedLayerId = e.dataTransfer.getData('text/plain');
            if (draggedLayerId && draggedLayerId !== layer.id && onReorderLayers && getLayerIndexInParent) {
              const targetIndex = getLayerIndexInParent(layer.id, layer.parentId, layersList);
              const draggedIndex = getLayerIndexInParent(draggedLayerId, layer.parentId, layersList);
              if (draggedIndex !== -1 && targetIndex !== -1) {
                const newIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
                onReorderLayers(draggedIndex, Math.max(0, newIndex), layer.parentId);
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
        className={`flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors ${
          isSelected ? 'bg-primary/30 border-l-2 border-primary' : 'hover:bg-gray-800'
        } ${isInternal ? 'opacity-80' : ''}`}
        style={{ 
          marginLeft: `${depth * 16}px`,
          ...(dragOverTarget === layer.id && dragOverPosition === 'inside' && {
            outline: `2px solid ${primaryColor}`,
            outlineOffset: '-1px',
            backgroundColor: '#1e1b2e'
          })
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          setDragOverTarget(layer.id);
          setDragOverPosition('inside');
        }}
        onDragLeave={() => {
          setDragOverTarget(null);
          setDragOverPosition(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const draggedLayerId = e.dataTransfer.getData('text/plain');
          
          // ⭐ PLUS DE RESTRICTION - on peut déposer sur N'IMPORTE quel calque (même ceux qui n'ont pas canHaveChildren)
          if (draggedLayerId && draggedLayerId !== layer.id && onReparentLayer) {
            console.log(`📦 Drop: ${draggedLayerId} devient enfant de ${layer.id}`);
            // Appeler onReparentLayer pour changer le parent
            onReparentLayer(draggedLayerId, layer.id);
            // ⭐ Forcer l'expansion du parent pour voir l'enfant
            setIsExpanded(true);
          }
          setDragOverTarget(null);
          setDragOverPosition(null);
        }}
        onClick={() => onSelectLayer(layer.id)}
      >
        {/* Drag handle */}
        {!isInternal && !layer.locked && (
          <div
            draggable={true}
            onDragStart={(e) => handleDragStart(e, layer.id)}
            className="cursor-grab mr-1"
          >
            <FiMove size={12} className="text-gray-500" />
          </div>
        )}
        {isInternal && <div className="w-4 mr-1" />}

        {/* Checkbox pour sélection multiple */}
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.checked) {
              setSelectedLayers((prev: Set<string>) => new Set(prev).add(layer.id));
            } else {
              setSelectedLayers((prev: Set<string>) => {
                const newSet = new Set(prev);
                newSet.delete(layer.id);
                return newSet;
              });
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="mr-1 w-3 h-3 cursor-pointer"
        />

        {/* Expand/Collapse pour les groupes */}
        {children.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="mr-1 text-gray-500 hover:text-white w-4"
          >
            {isExpanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
          </button>
        )}
        {children.length === 0 && <div className="w-4" />}

        {/* Icon */}
        <span className="mr-2 text-sm">
          {isInternal ? '└─ ' : ''}{getBlockIcon(layer.type)}
        </span>

        {/* Name */}
        <span 
          className={`flex-1 text-sm truncate ${isSelected ? 'text-primary font-medium' : 'text-gray-300'}`}
        >
          {layer.name}
        </span>

        {/* Nombre d'enfants pour les groupes */}
        {isGroup && children.length > 0 && (
          <span className="text-xs text-gray-500 mr-2 px-1 bg-gray-800 rounded">
            {children.length}
          </span>
        )}

        {/* Z-index */}
        {!isInternal && (
          <span className="text-xs text-gray-500 mr-2 px-1 bg-gray-800 rounded">
            z:{layer.zIndex}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(layer.id); }}
            className="p-1 text-gray-500 hover:text-white transition-colors"
            title={layer.visible ? 'Masquer' : 'Afficher'}
          >
            {layer.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
          </button>

          {!isInternal && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLock?.(layer.id); }}
              className="p-1 text-gray-500 hover:text-white transition-colors"
              title={layer.locked ? 'Déverrouiller' : 'Verrouiller'}
            >
              {layer.locked ? <FiLock size={14} /> : <FiUnlock size={14} />}
            </button>
          )}

          {!isInternal && canHaveChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const event = new CustomEvent('openAddToParent', { 
                  detail: { parentId: layer.id, parentType: layer.type, parentName: layer.name }
                });
                window.dispatchEvent(event);
              }}
              className="p-1 text-gray-500 hover:text-green-400 transition-colors"
              title={`Ajouter un élément à l'intérieur de ${layer.name}`}
            >
              <FiPlus size={12} />
            </button>
          )}

          {isGroup && onUngroupLayer && (
            <button
              onClick={(e) => { e.stopPropagation(); onUngroupLayer(layer.id); }}
              className="p-1 text-gray-500 hover:text-yellow-400 transition-colors"
              title="Dégrouper"
            >
              <FiMinimize2 size={12} />
            </button>
          )}

          {!isInternal && (
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicateLayer(layer.id); }}
              className="p-1 text-gray-500 hover:text-green-400 transition-colors"
              title="Dupliquer"
            >
              <FiCopy size={12} />
            </button>
          )}

          {isInternal && onDeleteInternalElement && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteInternalElement(layer.id, layer.parentId!); }}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
              title="Supprimer l'élément"
            >
              <FiTrash2 size={12} />
            </button>
          )}

          {!isInternal && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
              title="Supprimer"
            >
              <FiTrash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Zone de drop en-dessous */}
      {!isInternal && !layer.locked && (
        <div
          className={`h-0.5 rounded transition-all ${dragOverTarget === `bottom-${layer.id}` ? 'h-1' : 'h-0.5'}`}
          style={{ 
            margin: '1px 0',
            backgroundColor: dragOverTarget === `bottom-${layer.id}` ? primaryColor : 'transparent',
            transition: 'all 0.2s ease',
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            setDragOverTarget(`bottom-${layer.id}`);
            setDragOverPosition('bottom');
          }}
          onDragLeave={() => {
            setDragOverTarget(null);
            setDragOverPosition(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const draggedLayerId = e.dataTransfer.getData('text/plain');
            if (draggedLayerId && draggedLayerId !== layer.id && onReorderLayers && getLayerIndexInParent) {
              const targetIndex = getLayerIndexInParent(layer.id, layer.parentId, layersList);
              const draggedIndex = getLayerIndexInParent(draggedLayerId, layer.parentId, layersList);
              if (draggedIndex !== -1 && targetIndex !== -1) {
                const newIndex = draggedIndex < targetIndex ? targetIndex : targetIndex + 1;
                onReorderLayers(draggedIndex, newIndex, layer.parentId);
              }
            }
            setDragOverTarget(null);
            setDragOverPosition(null);
          }}
        />
      )}

      {/* Enfants */}
      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child: Layer) => (
            <LayerItem
              key={child.id}
              layer={child}
              depth={depth + 1}
              selectedLayerId={selectedLayerId}
              onSelectLayer={onSelectLayer}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
              onDeleteLayer={onDeleteLayer}
              onDuplicateLayer={onDuplicateLayer}
              onGroupLayers={onGroupLayers}
              onUngroupLayer={onUngroupLayer}
              onReparentLayer={onReparentLayer}
              onReorderLayers={onReorderLayers}
              onDeleteInternalElement={onDeleteInternalElement}
              selectedLayers={selectedLayers}
              setSelectedLayers={setSelectedLayers}
              getLayerIndexInParent={getLayerIndexInParent}
              layersList={layersList}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FloatingLayersPanel({
  layers,
  selectedLayerId,
  isBackgroundSelected,
  blocksCount,
  onSelectLayer,
  onSelectBackground,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onDuplicateLayer,
  onGroupLayers,
  onUngroupLayer,
  onReparentLayer,
  onReorderLayers,
  onDeleteInternalElement,
  getLayerIndexInParent,
  onClose,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const primaryColor = '#8B5CF6';

  const rootLayers = layers.filter(layer => !layer.parentId);
  const showGroupButton = selectedLayers.size > 1;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
          onDeleteLayer(layerId);
        });
        setSelectedLayers(new Set());
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <>
      {/* Bouton toggle flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/80 transition-all"
        style={{ left: position.x - 10, top: position.y + 20 }}
      >
        <FiLayers size={20} />
      </button>

      {/* Panneau flottant */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed z-50 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 w-80 flex flex-col overflow-hidden"
          style={{ left: position.x, top: position.y }}
        >
          {/* Barre de titre avec drag handle */}
          <div
            className="drag-handle bg-gray-800 px-3 py-2 cursor-move flex items-center justify-between border-b border-gray-700"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <FiMove size={14} className="text-gray-400" />
              <h3 className="text-white font-semibold text-sm">
                <FiLayers className="inline mr-1" size={14} />
                Calques ({blocksCount})
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          {/* Contenu du panneau */}
          <div className="p-3 overflow-y-auto max-h-[70vh]">
            {/* Actions de groupe */}
            <div className="flex gap-2 mb-3">
              {showGroupButton && onGroupLayers && (
                <button
                  onClick={handleGroupSelected}
                  className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary/80 transition-colors"
                >
                  🔗 Grouper ({selectedLayers.size})
                </button>
              )}
              {selectedLayers.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red/80 transition-colors"
                >
                  🗑️ Supprimer ({selectedLayers.size})
                </button>
              )}
            </div>

            {/* Background Layer */}
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

            {/* Zone de drop pour la racine */}
            <div
              className={`space-y-0.5 transition-all rounded-lg ${isDragOverRoot ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''}`}
              onDragOver={(e) => {
                const target = e.target as HTMLElement;
                const isChild = target.closest('[data-layer-id]') !== null;
                if (!isChild) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setIsDragOverRoot(true);
                }
              }}
              onDragLeave={() => setIsDragOverRoot(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverRoot(false);
                const target = e.target as HTMLElement;
                const isChild = target.closest('[data-layer-id]') !== null;
                if (!isChild) {
                  const draggedLayerId = e.dataTransfer.getData('text/plain');
                  if (draggedLayerId && onReparentLayer) {
                    onReparentLayer(draggedLayerId, null);
                  }
                }
              }}
            >
              {rootLayers.map((layer) => (
                <LayerItem
                  key={layer.id}
                  layer={layer}
                  depth={0}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={onSelectLayer}
                  onToggleVisibility={onToggleVisibility}
                  onToggleLock={onToggleLock}
                  onDeleteLayer={onDeleteLayer}
                  onDuplicateLayer={onDuplicateLayer}
                  onGroupLayers={onGroupLayers}
                  onUngroupLayer={onUngroupLayer}
                  onReparentLayer={onReparentLayer}
                  onReorderLayers={onReorderLayers}
                  onDeleteInternalElement={onDeleteInternalElement}
                  selectedLayers={selectedLayers}
                  setSelectedLayers={setSelectedLayers}
                  getLayerIndexInParent={getLayerIndexInParent}
                  layersList={layers}
                />
              ))}
            </div>

            {blocksCount === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Aucun calque
              </div>
            )}

            {/* Instructions */}
            <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-800/50 rounded">
              💡 Astuces:
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-400">
                <li>🖱️ Glissez-déposez SUR un calque pour le rendre enfant</li>
                <li>🖱️ Glissez-déposez ENTRE deux calques pour réorganiser l'ordre</li>
                <li>🖱️ Glissez dans la zone vide pour rendre indépendant</li>
                <li>🔒 Les calques verrouillés ne peuvent pas être déplacés</li>
                <li>➕ Bouton + pour ajouter à l'intérieur des blocs parents</li>
                <li>Cochez plusieurs calques → Grouper / Supprimer</li>
                <li>👁️ Masquer/Afficher | 🔒 Verrouiller</li>
                <li>📋 Dupliquer | 🗑️ Supprimer</li>
                <li>📁 Dégrouper un groupe</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}