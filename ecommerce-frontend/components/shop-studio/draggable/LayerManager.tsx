'use client';

import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiUnlock, FiTrash2, FiMove } from 'react-icons/fi';

interface Layer {
  id: string;
  type: 'section' | 'asset' | 'product';
  name: string;
  zIndex: number;
  visible: boolean;
  locked: boolean;
}

interface Props {
  layers: Layer[];
  onSelectLayer: (layer: Layer) => void;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (layerId: string) => void;
  onReorderLayers: (layerIds: string[]) => void;
}

export default function LayerManager({ layers, onSelectLayer, onUpdateLayer, onDeleteLayer, onReorderLayers }: Props) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLayers = [...sortedLayers];
    const [draggedLayer] = newLayers.splice(draggedIndex, 1);
    newLayers.splice(index, 0, draggedLayer);
    
    // Mettre à jour les zIndex
    const reorderedLayers = newLayers.map((layer, idx) => ({
      ...layer,
      zIndex: newLayers.length - idx,
    }));
    
    onReorderLayers(reorderedLayers.map(l => l.id));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-1">
      <h4 className="text-white font-medium mb-3 text-sm">Calques</h4>
      {sortedLayers.map((layer, index) => (
        <div
          key={layer.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg cursor-move hover:bg-gray-700 transition-colors"
        >
          <FiMove className="text-gray-500 cursor-grab" size={14} />
          
          <button
            onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
            className="text-gray-400 hover:text-white"
          >
            {layer.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
          </button>
          
          <button
            onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked })}
            className="text-gray-400 hover:text-white"
          >
            {layer.locked ? <FiLock size={14} /> : <FiUnlock size={14} />}
          </button>
          
          <div
            className="flex-1 text-sm text-gray-300 truncate"
            onClick={() => onSelectLayer(layer)}
          >
            {layer.name}
          </div>
          
          <div className="text-xs text-gray-500">z: {layer.zIndex}</div>
          
          <button
            onClick={() => onDeleteLayer(layer.id)}
            className="text-gray-500 hover:text-red-400"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ))}
      
      {layers.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          Aucun calque
        </div>
      )}
    </div>
  );
}