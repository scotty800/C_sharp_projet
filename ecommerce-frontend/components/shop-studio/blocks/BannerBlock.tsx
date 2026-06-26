'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number;
  isResizing?: boolean;
  ratio?: number;   // ← AJOUT
}

export function BannerBlock({ shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1, isResizing = false, ratio = 1 }: Props) {
  const { props } = block;
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  // ⭐ États pour l'affichage (maintenant gérés par les blocs enfants, gardés pour compatibilité)
  const [showTitle, setShowTitle] = useState(props.showTitle !== undefined ? props.showTitle : true);
  const [showSubtitle, setShowSubtitle] = useState(props.showSubtitle !== undefined ? props.showSubtitle : true);
  const [showButton, setShowButton] = useState(props.showButton !== undefined ? props.showButton : true);
  
  // ⭐ Références
  const editingImageIndexRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ⭐ Édition image
  const [isEditing, setIsEditing] = useState(false);
  const [editOffsetX, setEditOffsetX] = useState(0);
  const [editOffsetY, setEditOffsetY] = useState(0);
  const [editZoom, setEditZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  // ⭐ Récupérer la couleur de fond du bloc parent (définie dans ColorsPanel)
  const blockBackgroundColor = props.backgroundColor;
  const blockBackgroundType = props.backgroundType;
  const blockBackgroundValue = props.backgroundValue;

  // ⭐ Synchronisation
  useEffect(() => {
    setShowTitle(props.showTitle !== undefined ? props.showTitle : true);
    setShowSubtitle(props.showSubtitle !== undefined ? props.showSubtitle : true);
    setShowButton(props.showButton !== undefined ? props.showButton : true);
  }, [props]);

  // ⭐ Carrousel et crops
  const [savedCrops, setSavedCrops] = useState<Record<number, { x: number; y: number; scale: number }>>(() => {
    const crops: Record<number, { x: number; y: number; scale: number }> = {};
    if (props.isCarousel === true) {
      const imgList = props.images || [];
      imgList.forEach((img: any, idx: number) => {
        crops[idx] = img?.crop || { x: 0, y: 0, scale: 1 };
      });
    } else {
      crops[0] = props.crop || { x: 0, y: 0, scale: 1 };
    }
    return crops;
  });

  const isCarousel = props.isCarousel === true;
  const images = isCarousel ? (props.images || []) : [];
  const hasMultipleImages = images.length > 1;
  const singleImage = props.backgroundImage || shop?.bannerUrl;
  
  const autoPlay = props.autoPlay !== false && isCarousel && hasMultipleImages;
  const intervalTime = props.intervalTime || 5000;
  const showArrows = props.showArrows !== false && hasMultipleImages;
  const showDots = props.showDots !== false && hasMultipleImages;
  const transitionEffect = props.transitionEffect || 'fade';
  const transitionDuration = 300;

  useEffect(() => {
    if (!autoPlay || !hasMultipleImages || isHovered || isResizing || isEditing) return;
    const interval = setInterval(() => {
      if (!isEditing) setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [autoPlay, hasMultipleImages, intervalTime, isHovered, images.length, isResizing, isEditing]);

  const goToPrevious = useCallback(() => { if (isEditing) return; setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); }, [images.length, isEditing]);
  const goToNext = useCallback(() => { if (isEditing) return; setCurrentIndex((prev) => (prev + 1) % images.length); }, [images.length, isEditing]);
  const goToSlide = (index: number) => { if (isEditing) return; setCurrentIndex(index); };

  const getCurrentCrop = useCallback(() => savedCrops[currentIndex] || { x: 0, y: 0, scale: 1 }, [savedCrops, currentIndex]);
  const saveCurrentCrop = useCallback((x: number, y: number, scale: number) => {
    const newCrops = { ...savedCrops, [currentIndex]: { x, y, scale } };
    setSavedCrops(newCrops);
    if (isCarousel) {
      const newImages = [...images];
      newImages[currentIndex] = { ...newImages[currentIndex], crop: { x, y, scale } };
      onUpdate({ images: newImages });
    } else {
      onUpdate({ crop: { x, y, scale } });
    }
  }, [isCarousel, images, currentIndex, savedCrops, onUpdate]);

  const currentImageUrl = isCarousel && images[currentIndex]?.url ? images[currentIndex].url : singleImage;

  const handleDoubleClick = useCallback(() => {
    if (currentImageUrl && !imageErrors[isCarousel ? currentIndex : -1]) {
      const currentCrop = getCurrentCrop();
      setEditOffsetX(currentCrop.x);
      setEditOffsetY(currentCrop.y);
      setEditZoom(currentCrop.scale);
      editingImageIndexRef.current = currentIndex;
      setIsEditing(true);
    }
  }, [currentImageUrl, imageErrors, isCarousel, currentIndex, getCurrentCrop]);

  const exitEditMode = useCallback(() => {
    saveCurrentCrop(editOffsetX, editOffsetY, editZoom);
    setIsEditing(false);
    setIsDragging(false);
    editingImageIndexRef.current = null;
  }, [editOffsetX, editOffsetY, editZoom, saveCurrentCrop]);

  const cancelEditMode = useCallback(() => {
    setIsEditing(false);
    setIsDragging(false);
    editingImageIndexRef.current = null;
  }, []);

  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, startX: editOffsetX, startY: editOffsetY };
  };

  const handleImageMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setEditOffsetX(Math.max(-500, Math.min(500, dragStart.current.startX + dx)));
    setEditOffsetY(Math.max(-500, Math.min(500, dragStart.current.startY + dy)));
  }, [isDragging]);

  const handleImageMouseUp = useCallback(() => { if (isDragging) setIsDragging(false); }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleImageMouseMove);
      window.addEventListener('mouseup', handleImageMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleImageMouseMove);
        window.removeEventListener('mouseup', handleImageMouseUp);
      };
    }
  }, [isDragging, handleImageMouseMove, handleImageMouseUp]);

  const handleZoomIn = useCallback(() => setEditZoom(prev => Math.min(4, prev + 0.2)), []);
  const handleZoomOut = useCallback(() => setEditZoom(prev => Math.max(1, prev - 0.2)), []);
  const handleReset = useCallback(() => { setEditOffsetX(0); setEditOffsetY(0); setEditZoom(1); }, []);

  const getImageTransform = () => {
    if (isEditing) return `translate(-50%, -50%) translate(${editOffsetX}px, ${editOffsetY}px) scale(${editZoom})`;
    if (isResizing) return `translate(-50%, -50%) scale(1)`;
    const currentCrop = getCurrentCrop();
    return `translate(-50%, -50%) translate(${currentCrop.x}px, ${currentCrop.y}px) scale(${currentCrop.scale})`;
  };

  const imageStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    transform: getImageTransform(),
    objectFit: 'cover' as const,
    cursor: isEditing && isDragging ? 'grabbing' : (isEditing ? 'grab' : 'default'),
    transition: isResizing || isEditing ? 'none' : 'transform 0.2s ease',
    willChange: 'transform',
  };

  // ⭐ STYLE DE FOND PAR DÉFAUT POUR LA BANNIÈRE
  let defaultBackgroundStyle: React.CSSProperties = {};
  
  if (props.backgroundType === 'gradient' && props.backgroundValue) {
    defaultBackgroundStyle = { background: props.backgroundValue };
  } else if (props.backgroundColor && props.backgroundColor !== 'transparent') {
    defaultBackgroundStyle = { backgroundColor: props.backgroundColor };
  } else {
    defaultBackgroundStyle = { backgroundColor: customization?.primaryColor || '#2563EB' };
  }

  // ⭐ MODIFICATION : Scaling des tailles de police avec le ratio
  const titleSize = (props.titleFontSize || 32) * (ratio ?? 1);
  const subtitleSize = (props.subtitleFontSize || 18) * (ratio ?? 1);

  // ⭐ RENDER IMAGE - LOGIQUE SPÉCIFIQUE POUR LE CARROUSEL
  const renderImage = () => {
    if (isCarousel && images.length > 0) {
      const isFade = transitionEffect === 'fade';
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      const nextIndex = (currentIndex + 1) % images.length;
      
      return (
        <div className="absolute inset-0">
          {images.map((image: any, idx: number) => {
            // ⭐ CALCUL DU FOND SEULEMENT EN MODE CARROUSEL
            let backgroundStyle: React.CSSProperties = {};
            
            // ⭐ 1. Priorité au fond individuel de l'image
            if (image.backgroundType === 'gradient' && image.backgroundValue) {
              backgroundStyle = { background: image.backgroundValue };
            } else if (image.backgroundColor && image.backgroundColor !== 'transparent') {
              backgroundStyle = { backgroundColor: image.backgroundColor };
            }
            // ⭐ 2. Sinon, utiliser le fond du bloc parent
            else if (blockBackgroundType === 'gradient' && blockBackgroundValue) {
              backgroundStyle = { background: blockBackgroundValue };
            }
            else if (blockBackgroundColor && blockBackgroundColor !== 'transparent') {
              backgroundStyle = { backgroundColor: blockBackgroundColor };
            }
            // ⭐ 3. Sinon, transparent
            else {
              backgroundStyle = { backgroundColor: 'transparent' };
            }
            
            const isActive = idx === currentIndex;
            let transformStyle: React.CSSProperties = {};
            
            if (isFade) {
              transformStyle = {
                opacity: isActive ? 1 : 0,
                transition: `opacity ${transitionDuration}ms ease-in-out`,
              };
            } else {
              if (isActive) {
                transformStyle = {
                  transform: 'translateX(0)',
                  transition: `transform ${transitionDuration}ms ease-in-out`,
                };
              } else {
                if (idx === prevIndex) {
                  transformStyle = {
                    transform: 'translateX(-100%)',
                    transition: `transform ${transitionDuration}ms ease-in-out`,
                  };
                } else if (idx === nextIndex) {
                  transformStyle = {
                    transform: 'translateX(100%)',
                    transition: `transform ${transitionDuration}ms ease-in-out`,
                  };
                } else {
                  transformStyle = {
                    transform: 'translateX(100%)',
                    transition: 'none',
                  };
                }
              }
            }
            
            return (
              <div 
                key={idx} 
                className="absolute inset-0 w-full h-full"
                style={{ ...backgroundStyle, ...transformStyle }}
              >
                {!imageErrors[idx] && image.url ? (
                  <img 
                    src={image.url} 
                    alt={image.alt || `Slide ${idx + 1}`} 
                    style={imageStyle}
                    onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500" style={backgroundStyle}>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🖼️</div>
                      <div className="text-xs">Image {idx + 1}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    } else if (singleImage && !imageErrors[-1]) {
      // ⭐ Mode normal : l'image est superposée sur le fond du bloc
      return <img src={singleImage} alt="Bannière" style={imageStyle} onError={() => setImageErrors(prev => ({ ...prev, [-1]: true }))} draggable={false} />;
    } else {
      return null;
    }
  };

  const overlayOpacity = props.overlayOpacity || 30;
  const overlayColor = props.overlayColor || '#000000';
  const currentCrop = getCurrentCrop();
  const zoomPercent = Math.round((isEditing ? editZoom : currentCrop.scale) * 100);

  if (isCarousel && images.length === 0 && !isEditing) {
    return (
      <div className={`relative cursor-pointer transition-all w-full h-full bg-gray-800 flex items-center justify-center ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`} onClick={onSelect}>
        <div className="text-center text-gray-400 p-4">
          <div className="text-4xl mb-2">🎠</div>
          <p className="text-sm">Mode carrousel activé</p>
          <p className="text-xs mt-1">Ajoutez des images dans le panneau "Carrousel"</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative cursor-pointer transition-all w-full h-full overflow-hidden ${isSelected && !isEditing ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : isHovered && !isEditing ? 'ring-1 ring-gray-300 rounded-lg' : ''}`}
      onDoubleClick={handleDoubleClick}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ⭐ Conteneur principal */}
      <div className="relative w-full h-full" style={isCarousel ? { backgroundColor: 'transparent' } : defaultBackgroundStyle}>
        <div className="absolute inset-0 overflow-hidden" onMouseDown={handleImageMouseDown} style={{ cursor: isEditing ? 'grab' : 'default' }}>
          {renderImage()}
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: overlayColor, opacity: isEditing ? overlayOpacity / 200 : overlayOpacity / 100 }} />

        {isEditing && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-black/80 rounded-full p-1 shadow-lg">
            <button onMouseDown={(e) => { e.stopPropagation(); handleZoomOut(); }} className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full text-white font-bold text-lg">−</button>
            <div className="px-3 py-1 text-white text-sm">{zoomPercent}%</div>
            <button onMouseDown={(e) => { e.stopPropagation(); handleZoomIn(); }} className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full text-white font-bold text-lg">+</button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <button onMouseDown={(e) => { e.stopPropagation(); handleReset(); }} className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded-full text-white text-xs">Reset</button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <button onMouseDown={(e) => { e.stopPropagation(); exitEditMode(); }} className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-full text-white text-sm">✓ Terminer</button>
            <button onMouseDown={(e) => { e.stopPropagation(); cancelEditMode(); }} className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-full text-white text-sm">✕ Annuler</button>
          </div>
        )}

        {!isEditing && !isResizing && showArrows && hasMultipleImages && (
          <>
            <button onMouseDown={(e) => { e.stopPropagation(); goToPrevious(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"><FiChevronLeft size={24} /></button>
            <button onMouseDown={(e) => { e.stopPropagation(); goToNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"><FiChevronRight size={24} /></button>
          </>
        )}

        {!isEditing && !isResizing && showDots && hasMultipleImages && (
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
            {images.map((_: any, idx: number) => (
              <button key={idx} onMouseDown={(e) => { e.stopPropagation(); goToSlide(idx); }} className={`transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'} h-2 rounded-full`} />
            ))}
          </div>
        )}

        {/* ⭐ Note : Les titres, sous-titres et boutons sont maintenant gérés par des blocs enfants indépendants */}
      </div>

      {isSelected && !isEditing && !isResizing && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap flex gap-2">
          <span className="ml-1">{isCarousel ? `🎠 Carrousel (${images.length} images)` : (singleImage ? '🖼️ Bannière' : '🎨 Bannière')}</span>
          {currentCrop.scale !== 1 && <span className="ml-1 text-yellow-300">(Zoomé {Math.round(currentCrop.scale * 100)}%)</span>}
        </div>
      )}
    </div>
  );
}