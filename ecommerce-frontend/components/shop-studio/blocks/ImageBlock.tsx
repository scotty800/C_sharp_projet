// components/shop-studio/blocks/ImageBlock.tsx
'use client';

import { useState, useEffect } from 'react';
import { ImageCropper } from '../tools/ImageCropper';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number;
  isResizing?: boolean;
}

export function ImageBlock({ shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1, isResizing = false }: Props) {
  const { props } = block;
  const [imageError, setImageError] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  const getCleanImageUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('127.0.0.1:5019') || url.includes('localhost:5019')) {
      const match = url.match(/\/(uploads|api)\/.*/);
      if (match) return match[0];
    }
    if (url && !url.startsWith('/') && !url.startsWith('http')) {
      return '/' + url;
    }
    return url;
  };

  const handleDoubleClick = () => {
    if (props.url && !imageError) {
      setShowCropper(true);
    }
  };

  const handleCroppedSave = (croppedImageUrl: string) => {
    console.log('📸 Image recadrée sauvegardée:', croppedImageUrl);
    onUpdate({ url: croppedImageUrl });
    setShowCropper(false);
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: props.backgroundColor || '#f3f4f6',
    opacity: textOpacity,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: props.objectFit || 'cover',
    objectPosition: props.objectPosition || 'center',
    transition: 'all 0.2s ease',
    pointerEvents: isSelected ? 'auto' : 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  };

  const borderRadius = props.borderRadius !== undefined ? props.borderRadius : 0;
  const hasShadow = props.shadow !== false;
  const imageOpacity = props.opacity !== undefined ? props.opacity / 100 : 1;

  const imageContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: `${borderRadius}px`,
    overflow: 'hidden',
    boxShadow: hasShadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
    opacity: imageOpacity,
  };

  const imageFilter = props.cssFilter || 'none';

  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onUpdate({ url: getCleanImageUrl(e.target.value) });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  const cleanImageUrl = getCleanImageUrl(props.url);

  // ⭐ Pendant le cadrage, on désactive complètement l'image dans le canvas
  if (showCropper) {
    return (
      <>
        {/* Image floutée en arrière-plan, non interactive */}
        <div className="relative w-full h-full opacity-40 blur-sm pointer-events-none" style={containerStyle}>
          {cleanImageUrl && !imageError ? (
            <div style={imageContainerStyle}>
              <img
                src={cleanImageUrl}
                alt={props.alt || 'Image'}
                style={{ ...imageStyle, filter: imageFilter }}
                onDragStart={handleDragStart}
                draggable={false}
              />
            </div>
          ) : null}
        </div>

        {/* Cropper modal */}
        <ImageCropper
          imageUrl={props.url}
          assetId={props.assetId}
          shopId={shop?.id || 0}
          onSave={handleCroppedSave}
          onCancel={() => setShowCropper(false)}
        />
      </>
    );
  }

  // Mode édition (sélectionné sans cropper)
  if (isSelected) {
    return (
      <div 
        className="relative w-full h-full cursor-pointer"
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
        style={containerStyle}
      >
        {cleanImageUrl && !imageError ? (
          <div style={imageContainerStyle}>
            <img
              src={cleanImageUrl}
              alt={props.alt || 'Image'}
              style={{ ...imageStyle, filter: imageFilter }}
              onError={() => setImageError(true)}
              onDragStart={handleDragStart}
              draggable={false}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100" style={{ borderRadius: `${borderRadius}px` }}>
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Double-cliquez pour ajouter une image</span>
            {!props.url && (
              <input
                type="text"
                placeholder="URL de l'image..."
                className="mt-3 px-3 py-1 text-sm bg-white border border-gray-300 rounded w-48 text-black"
                onBlur={handleUrlBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUrlBlur(e as any);
                  }
                }}
              />
            )}
          </div>
        )}
        
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap">
          🖼️ Image - Double-clic pour recadrer
        </div>
      </div>
    );
  }

  // Rendu normal (non sélectionné)
  return (
    <div 
      className="relative w-full h-full cursor-grab active:cursor-grabbing"
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      style={containerStyle}
    >
      {cleanImageUrl && !imageError ? (
        <div style={imageContainerStyle}>
          <img
            src={cleanImageUrl}
            alt={props.alt || 'Image'}
            style={{ ...imageStyle, filter: imageFilter }}
            onError={() => setImageError(true)}
            onDragStart={handleDragStart}
            draggable={false}
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100" style={{ borderRadius: `${borderRadius}px` }}>
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
}