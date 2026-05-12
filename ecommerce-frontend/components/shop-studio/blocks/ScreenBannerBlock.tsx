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
}

export function ScreenBannerBlock({ shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1, isResizing = false }: Props) {
  const { props } = block;
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  // ⭐ États pour l'affichage du titre, sous-titre et bouton
  const [showTitle, setShowTitle] = useState(props.showTitle !== undefined ? props.showTitle : true);
  const [showSubtitle, setShowSubtitle] = useState(props.showSubtitle !== undefined ? props.showSubtitle : false);
  const [showButton, setShowButton] = useState(props.showButton !== undefined ? props.showButton : false);
  
  // ⭐ Positions individuelles des textes (en pourcentage)
  const [titlePosition, setTitlePosition] = useState(props.titlePosition || { x: 50, y: 30 });
  const [subtitlePosition, setSubtitlePosition] = useState(props.subtitlePosition || { x: 50, y: 50 });
  const [buttonPosition, setButtonPosition] = useState(props.buttonPosition || { x: 50, y: 70 });
  
  // ⭐ États pour le drag de chaque élément
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // ⭐ Référence du numéro d'image en cours d'édition
  const editingImageIndexRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ⭐ Édition
  const [isEditing, setIsEditing] = useState(false);
  const [editOffsetX, setEditOffsetX] = useState(0);
  const [editOffsetY, setEditOffsetY] = useState(0);
  const [editZoom, setEditZoom] = useState(1);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const imageDragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  // ⭐ Synchroniser avec les props
  useEffect(() => {
    setShowTitle(props.showTitle !== undefined ? props.showTitle : true);
    setShowSubtitle(props.showSubtitle !== undefined ? props.showSubtitle : false);
    setShowButton(props.showButton !== undefined ? props.showButton : false);
    setTitlePosition(props.titlePosition || { x: 50, y: 30 });
    setSubtitlePosition(props.subtitlePosition || { x: 50, y: 50 });
    setButtonPosition(props.buttonPosition || { x: 50, y: 70 });
  }, [props.showTitle, props.showSubtitle, props.showButton, props.titlePosition, props.subtitlePosition, props.buttonPosition]);

  // ⭐ Fonctions pour basculer l'affichage
  const toggleTitle = () => {
    const newValue = !showTitle;
    setShowTitle(newValue);
    onUpdate({ showTitle: newValue });
  };

  const toggleSubtitle = () => {
    const newValue = !showSubtitle;
    setShowSubtitle(newValue);
    onUpdate({ showSubtitle: newValue });
  };

  const toggleButton = () => {
    const newValue = !showButton;
    setShowButton(newValue);
    onUpdate({ showButton: newValue });
  };

  // ⭐ Fonctions pour mettre à jour les positions
  const updateTitlePosition = (x: number, y: number) => {
    const newPos = { x, y };
    setTitlePosition(newPos);
    onUpdate({ titlePosition: newPos });
  };

  const updateSubtitlePosition = (x: number, y: number) => {
    const newPos = { x, y };
    setSubtitlePosition(newPos);
    onUpdate({ subtitlePosition: newPos });
  };

  const updateButtonPosition = (x: number, y: number) => {
    const newPos = { x, y };
    setButtonPosition(newPos);
    onUpdate({ buttonPosition: newPos });
  };

  // ⭐ Gestion du drag pour le titre
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    setDraggingElement('title');
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left) / rect.width * 100 - titlePosition.x,
        y: (e.clientY - rect.top) / rect.height * 100 - titlePosition.y,
      });
    }
  };

  // ⭐ Gestion du drag pour le sous-titre
  const handleSubtitleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    setDraggingElement('subtitle');
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left) / rect.width * 100 - subtitlePosition.x,
        y: (e.clientY - rect.top) / rect.height * 100 - subtitlePosition.y,
      });
    }
  };

  // ⭐ Gestion du drag pour le bouton
  const handleButtonMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    setDraggingElement('button');
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left) / rect.width * 100 - buttonPosition.x,
        y: (e.clientY - rect.top) / rect.height * 100 - buttonPosition.y,
      });
    }
  };

  // ⭐ Mouvement global
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingElement || isEditing) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let newX = (e.clientX - rect.left) / rect.width * 100 - dragOffset.x;
    let newY = (e.clientY - rect.top) / rect.height * 100 - dragOffset.y;
    
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(95, newY));
    
    if (draggingElement === 'title') {
      updateTitlePosition(newX, newY);
    } else if (draggingElement === 'subtitle') {
      updateSubtitlePosition(newX, newY);
    } else if (draggingElement === 'button') {
      updateButtonPosition(newX, newY);
    }
  }, [draggingElement, isEditing, dragOffset]);

  const handleGlobalMouseUp = useCallback(() => {
    setDraggingElement(null);
  }, []);

  useEffect(() => {
    if (draggingElement && !isEditing) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [draggingElement, isEditing, handleGlobalMouseMove, handleGlobalMouseUp]);

  // ⭐ Valeurs sauvegardées par image - initialisation directe depuis props
  const [savedCrops, setSavedCrops] = useState<Record<number, { x: number; y: number; scale: number }>>(() => {
    const crops: Record<number, { x: number; y: number; scale: number }> = {};
    
    if (props.isCarousel === true) {
      const imgList = props.images || [];
      imgList.forEach((img: any, idx: number) => {
        if (img?.crop) {
          crops[idx] = { x: img.crop.x || 0, y: img.crop.y || 0, scale: img.crop.scale || 1 };
        } else {
          crops[idx] = { x: 0, y: 0, scale: 1 };
        }
      });
    } else {
      if (props.crop) {
        crops[0] = { x: props.crop.x || 0, y: props.crop.y || 0, scale: props.crop.scale || 1 };
      } else {
        crops[0] = { x: 0, y: 0, scale: 1 };
      }
    }
    
    return crops;
  });

  // ⭐ Mode carrousel
  const isCarousel = props.isCarousel === true;
  const images = isCarousel ? (props.images || []) : [];
  const hasMultipleImages = images.length > 1;
  const singleImage = props.backgroundImage || shop?.bannerUrl;
  const currentImageUrl = isCarousel && images[currentIndex]?.url ? images[currentIndex].url : singleImage;
  
  const autoPlay = props.autoPlay !== false && isCarousel && hasMultipleImages;
  const intervalTime = props.intervalTime || 5000;
  const showArrows = props.showArrows !== false && hasMultipleImages;
  const showDots = props.showDots !== false && hasMultipleImages;
  const transitionEffect = props.transitionEffect || 'fade';

  // ⭐ STYLE ÉCRAN / CARTE AVEC BORDURES ÉPAISSES
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderWidth: props.borderWidth || 4,
    borderStyle: props.borderStyle || 'solid',
    borderColor: props.borderColor || '#ffffff',
    borderRadius: props.borderRadius || 16,
    boxShadow: props.boxShadow || '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    backdropFilter: props.backdropFilter || 'none',
    backgroundColor: props.glassEffect ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  };

  // ⭐ Bloquer auto-défilement pendant l'édition
  useEffect(() => {
    if (!autoPlay || !hasMultipleImages || isHovered || isResizing || isEditing) return;
    const interval = setInterval(() => {
      if (!isEditing) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    }, intervalTime);
    return () => clearInterval(interval);
  }, [autoPlay, hasMultipleImages, intervalTime, isHovered, images.length, isResizing, isEditing]);

  // ⭐ Navigation - désactivée pendant l'édition
  const goToPrevious = useCallback(() => {
    if (isEditing) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length, isEditing]);
  
  const goToNext = useCallback(() => {
    if (isEditing) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length, isEditing]);
  
  const goToSlide = (index: number) => {
    if (isEditing) return;
    setCurrentIndex(index);
  };

  // ⭐ Récupérer le crop pour l'image courante
  const getCurrentCrop = useCallback(() => {
    return savedCrops[currentIndex] || { x: 0, y: 0, scale: 1 };
  }, [savedCrops, currentIndex]);

  // ⭐ Sauvegarder le crop pour l'image courante
  const saveCurrentCrop = useCallback((x: number, y: number, scale: number) => {
    const newCrops = { ...savedCrops, [currentIndex]: { x, y, scale } };
    setSavedCrops(newCrops);
    
    if (isCarousel) {
      const newImages = [...images];
      newImages[currentIndex] = {
        ...newImages[currentIndex],
        crop: { x, y, scale }
      };
      onUpdate({ images: newImages });
    } else {
      onUpdate({ crop: { x, y, scale } });
    }
  }, [isCarousel, images, currentIndex, savedCrops, onUpdate]);

  // ⭐ Initialiser l'édition avec le crop de l'image courante
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

  // ⭐ Sauvegarder et quitter
  const exitEditMode = useCallback(() => {
    saveCurrentCrop(editOffsetX, editOffsetY, editZoom);
    setIsEditing(false);
    setIsImageDragging(false);
    editingImageIndexRef.current = null;
  }, [editOffsetX, editOffsetY, editZoom, saveCurrentCrop]);

  // ⭐ Annuler
  const cancelEditMode = useCallback(() => {
    setIsEditing(false);
    setIsImageDragging(false);
    editingImageIndexRef.current = null;
  }, []);

  // ⭐ Déplacement image
  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    e.preventDefault();
    setIsImageDragging(true);
    imageDragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startX: editOffsetX,
      startY: editOffsetY,
    };
  };

  const handleImageMouseMove = useCallback((e: MouseEvent) => {
    if (!isImageDragging) return;
    const dx = e.clientX - imageDragStart.current.x;
    const dy = e.clientY - imageDragStart.current.y;
    let newX = imageDragStart.current.startX + dx;
    let newY = imageDragStart.current.startY + dy;
    const limit = 500;
    newX = Math.max(-limit, Math.min(limit, newX));
    newY = Math.max(-limit, Math.min(limit, newY));
    setEditOffsetX(newX);
    setEditOffsetY(newY);
  }, [isImageDragging]);

  const handleImageMouseUp = useCallback(() => {
    if (isImageDragging) {
      setIsImageDragging(false);
    }
  }, [isImageDragging]);

  useEffect(() => {
    if (isImageDragging) {
      window.addEventListener('mousemove', handleImageMouseMove);
      window.addEventListener('mouseup', handleImageMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleImageMouseMove);
        window.removeEventListener('mouseup', handleImageMouseUp);
      };
    }
  }, [isImageDragging, handleImageMouseMove, handleImageMouseUp]);

  // ⭐ Zoom
  const handleZoomIn = useCallback(() => {
    setEditZoom(prev => Math.min(4, prev + 0.2));
  }, []);
  const handleZoomOut = useCallback(() => {
    setEditZoom(prev => Math.max(1, prev - 0.2));
  }, []);
  const handleReset = useCallback(() => {
    setEditOffsetX(0);
    setEditOffsetY(0);
    setEditZoom(1);
  }, []);

  // ⭐ Transformation de l'image
  const getImageTransform = () => {
    if (isEditing) {
      return `translate(-50%, -50%) translate(${editOffsetX}px, ${editOffsetY}px) scale(${editZoom})`;
    } else if (isResizing) {
      return `translate(-50%, -50%) scale(1)`;
    } else {
      const currentCrop = getCurrentCrop();
      return `translate(-50%, -50%) translate(${currentCrop.x}px, ${currentCrop.y}px) scale(${currentCrop.scale})`;
    }
  };

  const imageStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    transform: getImageTransform(),
    objectFit: 'cover' as const,
    cursor: isEditing && isImageDragging ? 'grabbing' : (isEditing ? 'grab' : 'default'),
    transition: isResizing || isEditing ? 'none' : 'transform 0.2s ease',
    willChange: 'transform',
  };

  // ⭐ RENDU DE L'IMAGE
  const renderImage = () => {
    if (isCarousel && images.length > 0) {
      const transitionClass = transitionEffect === 'fade' ? 'transition-opacity duration-500' : 'transition-transform duration-500 ease-out';
      return (
        <div className="absolute inset-0">
          {images.map((image: any, idx: number) => {
            const isActive = idx === currentIndex;
            return (
              <div key={idx} className={`absolute inset-0 w-full h-full ${transitionClass}`} style={{
                opacity: transitionEffect === 'fade' ? (isActive ? 1 : 0) : 1,
                transform: transitionEffect === 'slide' ? `translateX(${(idx - currentIndex) * 100}%)` : 'none',
                transition: 'all 0.5s ease-out',
              }}>
                {isActive && !imageErrors[idx] && image.url ? (
                  <img src={image.url} alt={image.alt || `Slide ${idx + 1}`} style={imageStyle} onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))} draggable={false} />
                ) : isActive && imageErrors[idx] ? (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">
                    <div className="text-center"><div className="text-2xl mb-1">🖼️</div><div className="text-xs">Image non trouvée</div></div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      );
    } else if (singleImage && !imageErrors[-1]) {
      return <img src={singleImage} alt="Bannière" style={imageStyle} onError={() => setImageErrors(prev => ({ ...prev, [-1]: true }))} draggable={false} />;
    } else {
      let bgStyle: React.CSSProperties = {};
      if (props.backgroundType === 'gradient' && props.backgroundValue) {
        bgStyle = { background: props.backgroundValue };
      } else {
        bgStyle = { backgroundColor: props.backgroundColor || '#1e1e2f' };
      }
      return <div className="absolute inset-0" style={bgStyle} />;
    }
  };

  const overlayOpacity = props.overlayOpacity || 30;
  const overlayColor = props.overlayColor || '#000000';
  const currentCrop = getCurrentCrop();
  const zoomPercent = Math.round((isEditing ? editZoom : currentCrop.scale) * 100);

  // ⭐ STYLE DU TITRE
  const titleStyle: React.CSSProperties = {
    fontFamily: props.titleFont || 'Poppins',
    fontSize: props.titleFontSize || '48px',
    fontWeight: props.titleFontWeight || '700',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    marginBottom: '0',
    opacity: textOpacity,
    position: 'absolute',
    left: `${titlePosition.x}%`,
    top: `${titlePosition.y}%`,
    transform: 'translate(-50%, -50%)',
    cursor: 'default',
    width: 'auto',
    whiteSpace: 'nowrap',
    WebkitTextStroke: props.textStrokeWidth ? `${props.textStrokeWidth}px` : '0px',
    WebkitTextStrokeColor: props.textStrokeColor || '#000000',
    textShadow: props.textShadow || '2px 2px 4px rgba(0,0,0,0.3)',
  };
  if (props?.titleGradient) {
    titleStyle.backgroundImage = props.titleGradient;
    titleStyle.backgroundClip = 'text';
    titleStyle.WebkitBackgroundClip = 'text';
    titleStyle.color = 'transparent';
  } else {
    titleStyle.color = props.titleColor || '#ffffff';
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: props.subtitleFontSize || '18px',
    fontFamily: props.subtitleFont || 'Inter',
    fontWeight: props.subtitleFontWeight || '400',
    color: props.subtitleColor || '#ffffff',
    opacity: textOpacity,
    position: 'absolute',
    left: `${subtitlePosition.x}%`,
    top: `${subtitlePosition.y}%`,
    transform: 'translate(-50%, -50%)',
    cursor: 'default',
    width: 'auto',
    whiteSpace: 'nowrap',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  };

  const buttonStyle: React.CSSProperties = {
    fontFamily: props.buttonFont || 'Inter',
    fontSize: props.buttonFontSize || '16px',
    fontWeight: props.buttonFontWeight || '600',
    backgroundColor: props.buttonBackgroundColor || '#2563EB',
    color: props.buttonTextColor || '#ffffff',
    padding: '0.75rem 1.5rem',
    borderRadius: props.buttonBorderRadius || '2rem',
    border: props.buttonBorder ? `2px solid ${props.buttonBorderColor || '#ffffff'}` : 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, background 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    opacity: textOpacity,
    position: 'absolute',
    left: `${buttonPosition.x}%`,
    top: `${buttonPosition.y}%`,
    transform: 'translate(-50%, -50%)',
    whiteSpace: 'nowrap',
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => onUpdate({ title: e.currentTarget.innerText });
  const handleSubtitleBlur = (e: React.FocusEvent<HTMLParagraphElement>) => onUpdate({ subtitle: e.currentTarget.innerText });
  const handleButtonTextBlur = (e: React.FocusEvent<HTMLButtonElement>) => onUpdate({ buttonText: e.currentTarget.innerText });

  // Message si carrousel sans images
  if (isCarousel && images.length === 0 && !isEditing) {
    return (
      <div className={`relative cursor-pointer transition-all w-full h-full bg-gray-800 flex items-center justify-center ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`} style={containerStyle} onClick={onSelect}>
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
      style={containerStyle}
      onDoubleClick={handleDoubleClick}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full">
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden" onMouseDown={handleImageMouseDown} style={{ cursor: isEditing ? 'grab' : 'default' }}>
          {renderImage()}
        </div>

        {/* Overlay pour effet de verre */}
        {props.glassEffect && !isEditing && (
          <div className="absolute inset-0 backdrop-blur-md pointer-events-none" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        )}

        {/* Overlay standard */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: overlayColor, opacity: isEditing ? overlayOpacity / 200 : overlayOpacity / 100 }} />

        {/* Contrôles de zoom */}
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

        {/* Flèches */}
        {!isEditing && !isResizing && showArrows && hasMultipleImages && (
          <>
            <button onMouseDown={(e) => { e.stopPropagation(); goToPrevious(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"><FiChevronLeft size={24} /></button>
            <button onMouseDown={(e) => { e.stopPropagation(); goToNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"><FiChevronRight size={24} /></button>
          </>
        )}

        {/* Points */}
        {!isEditing && !isResizing && showDots && hasMultipleImages && (
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
            {images.map((_: any, idx: number) => (
              <button key={idx} onMouseDown={(e) => { e.stopPropagation(); goToSlide(idx); }} className={`transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'} h-2 rounded-full`} />
            ))}
          </div>
        )}

        {/* ⭐ TEXTE - Reste visible pendant le redimensionnement */}
        {!isEditing && (
          <>
            {showTitle && (
              <h1
                className="mb-0"
                style={titleStyle}
                contentEditable={isSelected && !isResizing}
                onBlur={handleTitleBlur}
                onMouseDown={isSelected && !isResizing ? handleTitleMouseDown : undefined}
                suppressContentEditableWarning
              >
                {props.title || shop?.name || 'Bienvenue'}
              </h1>
            )}
            {showSubtitle && (
              <p
                className="mb-0 max-w-2xl"
                style={subtitleStyle}
                contentEditable={isSelected && !isResizing}
                onBlur={handleSubtitleBlur}
                onMouseDown={isSelected && !isResizing ? handleSubtitleMouseDown : undefined}
                suppressContentEditableWarning
              >
                {props.subtitle || shop?.description || 'Découvrez notre collection exclusive'}
              </p>
            )}
            {showButton && (
              <button
                className="inline-block"
                style={buttonStyle}
                contentEditable={isSelected && !isResizing}
                onBlur={handleButtonTextBlur}
                onMouseDown={isSelected && !isResizing ? handleButtonMouseDown : undefined}
                suppressContentEditableWarning
              >
                {props.buttonText || 'Explorer'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Badge "Écran" avec toggles */}
      {isSelected && !isEditing && !isResizing && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap flex gap-2">
          <span className="px-1 py-0.5 bg-white/20 rounded cursor-pointer hover:bg-white/30" onClick={(e) => { e.stopPropagation(); toggleTitle(); }} title="Afficher/Masquer le titre">
            {showTitle ? '📝 Titre' : '📝 (masqué)'}
          </span>
          <span className="px-1 py-0.5 bg-white/20 rounded cursor-pointer hover:bg-white/30" onClick={(e) => { e.stopPropagation(); toggleSubtitle(); }} title="Afficher/Masquer le sous-titre">
            {showSubtitle ? '📄 Sous-titre' : '📄 (masqué)'}
          </span>
          <span className="px-1 py-0.5 bg-white/20 rounded cursor-pointer hover:bg-white/30" onClick={(e) => { e.stopPropagation(); toggleButton(); }} title="Afficher/Masquer le bouton">
            {showButton ? '🔘 Bouton' : '🔘 (masqué)'}
          </span>
          <span className="ml-1">🖥️ Écran {isCarousel ? `🎠 (${images.length} images)` : (singleImage ? '🖼️' : '🎨')}</span>
          {currentCrop.scale !== 1 && <span className="ml-1 text-yellow-300">(Zoomé {Math.round(currentCrop.scale * 100)}%)</span>}
          <span className="ml-1 text-yellow-300">(Double-clic)</span>
        </div>
      )}
    </div>
  );
}