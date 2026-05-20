// components/shop-studio/LayerTree.tsx
'use client';

import { useState } from 'react';
import { 
  FiEye, FiEyeOff, FiLock, FiUnlock, FiTrash2, FiCopy, 
  FiChevronDown, FiChevronRight, FiArrowUp, FiArrowDown,
  FiMove, FiMinimize2
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
  isExpanded?: boolean;
}

interface Props {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
  onMoveLayerUp: (layerId: string) => void;
  onMoveLayerDown: (layerId: string) => void;
  onReparentLayer: (layerId: string, newParentId: string | null) => void;
  onGroupLayers?: (layerIds: string[]) => void;
  onUngroupLayer?: (layerId: string) => void;
}

// ⭐ COMPOSANT LAYERITEM AVEC DRAG & DROP SIMPLIFIÉ (une seule zone)
const LayerItem = ({ 
  layer, 
  depth, 
  selectedLayerId, 
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onDuplicateLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onReparentLayer,
  onGroupLayers,
  onUngroupLayer,
  selectedLayers,
  setSelectedLayers,
}: any) => {
  const [isExpanded, setIsExpanded] = useState(layer.isExpanded !== false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    if (layer.locked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', layerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // ⭐ DROP SIMPLIFIÉ : toujours au même niveau, jamais DANS
  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    const draggedLayerId = e.dataTransfer.getData('text/plain');
    
    if (draggedLayerId !== targetLayerId && !layer.locked && onMoveLayerUp && onMoveLayerDown) {
      // On récupère l'index de la cible
      // Pour simplifier, on utilise moveUp/moveDown pour réorganiser
      // Si on veut un déplacement plus précis, on peut utiliser l'ordre des calques
      
      // ⚠️ Pour l'instant, on utilise juste le bouton flèche, le drag & drop est désactivé
      // pour éviter les groupes intempestifs
      console.log(`Drop de ${draggedLayerId} vers ${targetLayerId} - Utilisez les flèches pour réorganiser`);
      
      // Option: utiliser onMoveLayerUp/Down plusieurs fois
      // Mais pour simplifier, on désactive le drop
    }
    setIsDragOver(false);
  };

  // Actions directes
  const handleMoveUp = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    if (onMoveLayerUp) onMoveLayerUp(layerId);
  };

  const handleMoveDown = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    if (onMoveLayerDown) onMoveLayerDown(layerId);
  };

  const handleDuplicate = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    if (onDuplicateLayer) onDuplicateLayer(layerId);
  };

  const handleDelete = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    if (confirm('Supprimer cet élément ?') && onDeleteLayer) {
      onDeleteLayer(layerId);
    }
  };

  const handleToggleVisibility = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    if (onToggleVisibility) onToggleVisibility(layerId);
  };

  const handleToggleLock = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    if (onToggleLock) onToggleLock(layerId);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, layerId: string) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedLayers((prev: Set<string>) => new Set(prev).add(layerId));
    } else {
      setSelectedLayers((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete(layerId);
        return newSet;
      });
    }
  };

  const getIcon = () => {
    const icons: Record<string, string> = {
      banner: '🖼️', logo: '⭐', title: '📝', products: '📦',
      text: '🔤', image: '🖼️', button: '🔘', shape: '🔷',
      spacer: '⬜', section: '📐', group: '📁'
    };
    return icons[layer.type] || '📄';
  };

  const isSelected = selectedLayerId === layer.id;

  return (
    <div>
      <div
        draggable={!layer.locked}
        onDragStart={(e) => handleDragStart(e, layer.id)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, layer.id)}
        className={`group flex items-center py-1 px-2 rounded cursor-pointer transition-all ${
          isSelected
            ? 'bg-primary/30 border-l-2 border-primary'
            : isDragOver
            ? 'bg-gray-700 ring-2 ring-primary'
            : 'hover:bg-gray-800'
        } ${layer.locked ? 'opacity-60' : ''}`}
        style={{ marginLeft: `${depth * 16}px` }}
        onClick={() => onSelectLayer(layer.id)}
      >
        {/* Checkbox pour sélection multiple */}
        <input
          type="checkbox"
          checked={selectedLayers.has(layer.id)}
          onChange={(e) => handleCheckboxChange(e, layer.id)}
          onClick={(e) => e.stopPropagation()}
          className="mr-1 w-3 h-3 cursor-pointer"
        />

        {/* Expand/Collapse */}
        {layer.children.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="mr-1 text-gray-500 hover:text-white w-4"
          >
            {isExpanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
          </button>
        )}
        {layer.children.length === 0 && <div className="w-4" />}

        {/* Drag handle */}
        <FiMove size={12} className={`mr-2 ${layer.locked ? 'text-gray-600' : 'text-gray-500 cursor-grab'}`} />

        {/* Icon */}
        <span className="mr-2 text-sm">{getIcon()}</span>

        {/* Name */}
        <span className="flex-1 text-sm text-gray-300 truncate">
          {layer.name}
        </span>

        {/* Z-index indicator */}
        <span className="text-xs text-gray-500 mr-2 px-1 bg-gray-800 rounded">
          z:{layer.zIndex}
        </span>

        {/* Bouton Dégrouper (pour les groupes) */}
        {layer.type === 'group' && onUngroupLayer && (
          <button
            onClick={(e) => { e.stopPropagation(); onUngroupLayer(layer.id); }}
            className="p-1 text-gray-500 hover:text-yellow-400"
            title="Dégrouper"
          >
            <FiMinimize2 size={12} />
          </button>
        )}

        {/* Visibility toggle */}
        <button
          onClick={(e) => handleToggleVisibility(e, layer.id)}
          className="p-1 text-gray-500 hover:text-white"
          title={layer.visible ? 'Masquer' : 'Afficher'}
        >
          {layer.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
        </button>

        {/* Lock toggle */}
        <button
          onClick={(e) => handleToggleLock(e, layer.id)}
          className="p-1 text-gray-500 hover:text-white"
          title={layer.locked ? 'Déverrouiller' : 'Verrouiller'}
        >
          {layer.locked ? <FiLock size={14} /> : <FiUnlock size={14} />}
        </button>

        {/* Actions (apparaissent au survol) */}
        <div className="hidden group-hover:flex items-center gap-1 ml-1">
          <button onClick={(e) => handleDuplicate(e, layer.id)} className="p-1 text-gray-500 hover:text-green-400" title="Dupliquer">
            <FiCopy size={12} />
          </button>
          <button onClick={(e) => handleMoveUp(e, layer.id)} className="p-1 text-gray-500 hover:text-white" title="Monter">
            <FiArrowUp size={12} />
          </button>
          <button onClick={(e) => handleMoveDown(e, layer.id)} className="p-1 text-gray-500 hover:text-white" title="Descendre">
            <FiArrowDown size={12} />
          </button>
          <button onClick={(e) => handleDelete(e, layer.id)} className="p-1 text-gray-500 hover:text-red-400" title="Supprimer">
            <FiTrash2 size={12} />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && layer.children.map((child: Layer) => (
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
          onMoveLayerUp={onMoveLayerUp}
          onMoveLayerDown={onMoveLayerDown}
          onReparentLayer={onReparentLayer}
          onGroupLayers={onGroupLayers}
          onUngroupLayer={onUngroupLayer}
          selectedLayers={selectedLayers}
          setSelectedLayers={setSelectedLayers}
        />
      ))}
    </div>
  );
};

export default function LayerTree({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onDuplicateLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onReparentLayer,
  onGroupLayers,
  onUngroupLayer,
}: Props) {
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());
  const rootLayers = layers.filter(layer => !layer.parentId);

  if (layers.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Aucun calque
      </div>
    );
  }

  const showGroupButton = selectedLayers.size > 1;

  return (
    <div className="space-y-2">
      {/* Bouton Grouper (affiché uniquement si plusieurs calques sélectionnés) */}
      {showGroupButton && onGroupLayers && (
        <div className="flex justify-center mb-2">
          <button
            onClick={() => onGroupLayers(Array.from(selectedLayers))}
            className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-1"
          >
            <FiMinimize2 size={12} />
            Grouper ({selectedLayers.size} calques)
          </button>
        </div>
      )}
      
      {/* Arborescence des calques */}
      <div className="space-y-0.5">
        {rootLayers.map(layer => (
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
            onMoveLayerUp={onMoveLayerUp}
            onMoveLayerDown={onMoveLayerDown}
            onReparentLayer={onReparentLayer}
            onGroupLayers={onGroupLayers}
            onUngroupLayer={onUngroupLayer}
            selectedLayers={selectedLayers}
            setSelectedLayers={setSelectedLayers}
          />
        ))}
      </div>
      
      {/* Info pour le drag & drop */}
      <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-800/50 rounded text-center">
        ⚠️ Pour réorganiser les calques, utilisez les flèches ⬆️/⬇️
      </div>
    </div>
  );
}