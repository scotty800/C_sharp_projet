'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface Props {
  asset: any;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}

export default function DraggableElement({ asset, onSelect, onUpdate }: Props) {
  const [position, setPosition] = useState({ x: asset.posX || 0, y: asset.posY || 0 });
  const [size, setSize] = useState({ width: asset.width || 200, height: asset.height || 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number }>({
    startX: 0, startY: 0, startLeft: 0, startTop: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: position.x,
      startTop: position.y,
    };
    onSelect();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = dragRef.current.startLeft + dx;
      const newY = dragRef.current.startTop + dy;
      setPosition({ x: newX, y: newY });
      onUpdate({ posX: newX, posY: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useState(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return (
    <div
      className="absolute cursor-move"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: asset.zIndex || 10,
        transform: `rotate(${asset.rotation || 0}deg)`,
      }}
      onMouseDown={handleMouseDown}
    >
      {asset.type === 'text' ? (
        <div
          className="w-full h-full flex items-center justify-center p-4"
          style={{
            fontFamily: asset.fontFamily,
            fontSize: asset.fontSize,
            color: asset.textColor,
            textAlign: asset.textAlign as any,
            backgroundColor: asset.backgroundColor,
            textShadow: asset.textShadow,
          }}
        >
          {asset.content || asset.name}
        </div>
      ) : asset.type === 'image' ? (
        <div className="relative w-full h-full">
          <Image src={asset.url} alt={asset.name} fill className="object-contain" unoptimized />
        </div>
      ) : (
        <div
          className="w-full h-full"
          style={{ backgroundColor: asset.backgroundColor, borderRadius: '8px' }}
        />
      )}

      {/* Poignées de redimensionnement */}
      {isDragging && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize" />
        </>
      )}
    </div>
  );
}