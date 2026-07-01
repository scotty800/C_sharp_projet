'use client';

import { useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { FRAME_SHAPES } from '../lib/frameShapes';

interface Props {
  block: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}

export function FrameBlock({ block, isSelected, onSelect, onUpdate }: Props) {
  const { props } = block;
  const [isDragOver, setIsDragOver] = useState(false);

  const shape = FRAME_SHAPES[props.shape as string] || FRAME_SHAPES.square;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderWidth: props.borderWidth || 4,
    borderColor: isDragOver ? '#3b82f6' : (props.borderColor || '#FFFFFF'),
    borderStyle: props.borderStyle || 'solid',
    borderRadius: shape.borderRadius,
    clipPath: shape.clipPath,
    backgroundColor: props.backgroundColor || '#1e1e2f',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.15s ease',
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data?.url) {
        onUpdate({ url: data.url, alt: data.name || '', assetId: data.assetId });
      }
    } catch {
      // payload invalide, on ignore
    }
  };

  return (
    <div
      className={`relative w-full h-full transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onSelect}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div style={containerStyle}>
        {props.url ? (
          <img
            src={props.url}
            alt={props.alt || 'Photo'}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 pointer-events-none px-2 text-center">
            <FiImage size={28} />
            <span className="text-xs">Glissez une photo ici</span>
          </div>
        )}
      </div>
    </div>
  );
}