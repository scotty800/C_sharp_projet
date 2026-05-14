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
  
  // ⭐ Dimensions des conteneurs
  const [titleWidth, setTitleWidth] = useState(props.titleWidth || 300);
  const [subtitleWidth, setSubtitleWidth] = useState(props.subtitleWidth || 300);
  const [buttonWidth, setButtonWidth] = useState(props.buttonWidth || 200);
  
  // ⭐ États pour le drag de chaque élément
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // ⭐ États pour le redimensionnement
  const [resizingText, setResizingText] = useState<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ width: 0, fontSize: 0 });
  const [resizeMouseStart, setResizeMouseStart] = useState({ x: 0, y: 0 });
  
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
    setTitleWidth(props.titleWidth || 300);
    setSubtitleWidth(props.subtitleWidth || 300);
    setButtonWidth(props.buttonWidth || 200);
  }, [props]);

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

  // ⭐ Fonctions pour mettre à jour les largeurs
  const updateTitleWidth = (width: number) => {
    setTitleWidth(width);
    onUpdate({ titleWidth: width });
  };
  
  const updateSubtitleWidth = (width: number) => {
    setSubtitleWidth(width);
    onUpdate({ subtitleWidth: width });
  };
  
  const updateButtonWidth = (width: number) => {
    setButtonWidth(width);
    onUpdate({ buttonWidth: width });
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

  // ⭐ GESTION DU REDIMENSIONNEMENT
  const handleResizeStart = (e: React.MouseEvent, element: string, direction: string) => {
    if (isEditing) return;
    e.stopPropagation();
    setResizingText(element);
    setResizeDirection(direction);
    
    let currentWidth = 0;
    let currentFontSize = 0;
    
    if (element === 'title') {
      currentWidth = titleWidth;
      currentFontSize = props.titleFontSize || 48;
    } else if (element === 'subtitle') {
      currentWidth = subtitleWidth;
      currentFontSize = props.subtitleFontSize || 18;
    } else {
      currentWidth = buttonWidth;
      currentFontSize = props.buttonFontSize || 16;
    }
    
    setResizeStart({ width: currentWidth, fontSize: currentFontSize });
    setResizeMouseStart({ x: e.clientX, y: e.clientY });
  };

  // ⭐ Mouvement global drag
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

  // ⭐ Mouvement global redimensionnement
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingText || !resizeDirection) return;
    
    const dx = e.clientX - resizeMouseStart.x;
    let newWidth = resizeStart.width;
    let newFontSize = resizeStart.fontSize;
    
    if (resizeDirection === 'ne' || resizeDirection === 'nw' || 
        resizeDirection === 'se' || resizeDirection === 'sw') {
      let ratio = 1;
      if (resizeDirection === 'ne' || resizeDirection === 'se') {
        ratio = (resizeStart.width + dx) / Math.max(1, resizeStart.width);
      } else if (resizeDirection === 'nw' || resizeDirection === 'sw') {
        ratio = (resizeStart.width - dx) / Math.max(1, resizeStart.width);
      }
      ratio = Math.max(0.3, Math.min(5, ratio));
      
      newWidth = Math.max(50, Math.min(3000, Math.floor(resizeStart.width * ratio)));
      newFontSize = Math.max(10, Math.min(200, Math.floor(resizeStart.fontSize * ratio)));
      
      if (resizingText === 'title') {
        updateTitleWidth(Math.round(newWidth));
        onUpdate({ titleFontSize: Math.round(newFontSize) });
      } else if (resizingText === 'subtitle') {
        updateSubtitleWidth(Math.round(newWidth));
        onUpdate({ subtitleFontSize: Math.round(newFontSize) });
      } else if (resizingText === 'button') {
        updateButtonWidth(Math.round(newWidth));
        onUpdate({ buttonFontSize: Math.round(newFontSize) });
      }
    }
    else if (resizeDirection === 'e' || resizeDirection === 'w') {
      if (resizeDirection === 'e') {
        newWidth = Math.max(50, Math.min(3000, resizeStart.width + dx));
      } else if (resizeDirection === 'w') {
        newWidth = Math.max(50, Math.min(3000, resizeStart.width - dx));
      }
      
      if (resizingText === 'title') {
        updateTitleWidth(newWidth);
      } else if (resizingText === 'subtitle') {
        updateSubtitleWidth(newWidth);
      } else if (resizingText === 'button') {
        updateButtonWidth(newWidth);
      }
    }
  }, [resizingText, resizeDirection, resizeMouseStart, resizeStart, onUpdate]);

  const handleGlobalMouseUp = useCallback(() => {
    setDraggingElement(null);
    setResizingText(null);
    setResizeDirection(null);
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

  useEffect(() => {
    if (resizingText) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [resizingText, handleResizeMove, handleGlobalMouseUp]);

  // ⭐ Valeurs sauvegardées par image
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
  const transitionDuration = 300;

  // ⭐ STYLE ÉCRAN / CARTE AVEC BORDURES
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

  // ⭐ STYLE DE FOND PAR DÉFAUT POUR L'ÉCRAN
  let defaultBackgroundStyle: React.CSSProperties = {};
  
  if (props.backgroundType === 'gradient' && props.backgroundValue) {
    defaultBackgroundStyle = { background: props.backgroundValue };
  } else if (props.backgroundColor && props.backgroundColor !== 'transparent') {
    defaultBackgroundStyle = { backgroundColor: props.backgroundColor };
  } else {
    defaultBackgroundStyle = { backgroundColor: '#1e1e2f' };
  }

  // ⭐ RENDER IMAGE AVEC FOND INDIVIDUEL POUR CHAQUE SLIDE
  const renderImage = () => {
    if (isCarousel && images.length > 0) {
      const isFade = transitionEffect === 'fade';
      
      // Pour le glissement, on a besoin des indices précédent et suivant
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      const nextIndex = (currentIndex + 1) % images.length;
      
      return (
        <div className="absolute inset-0">
          {images.map((image: any, idx: number) => {
            // ⭐ Style de fond individuel pour chaque image
            let slideBackgroundStyle: React.CSSProperties = {};
            
            if (image.backgroundType === 'gradient' && image.backgroundValue) {
              slideBackgroundStyle = { background: image.backgroundValue };
            } else if (image.backgroundColor && image.backgroundColor !== 'transparent') {
              slideBackgroundStyle = { backgroundColor: image.backgroundColor };
            } else {
              slideBackgroundStyle = { backgroundColor: 'transparent' };
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
                style={{ ...slideBackgroundStyle, ...transformStyle }}
              >
                {!imageErrors[idx] && image.url ? (
                  <img 
                    src={image.url} 
                    alt={image.alt || `Slide ${idx + 1}`} 
                    style={imageStyle}
                    onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))}
                    draggable={false}
                  />
                ) : !imageErrors[idx] && !image.url ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500" style={slideBackgroundStyle}>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🖼️</div>
                      <div className="text-xs">URL manquante</div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500" style={slideBackgroundStyle}>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🖼️</div>
                      <div className="text-xs">Image non trouvée</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    } else if (singleImage && !imageErrors[-1]) {
      return <img src={singleImage} alt="Bannière" style={imageStyle} onError={() => setImageErrors(prev => ({ ...prev, [-1]: true }))} draggable={false} />;
    } else {
      return null;
    }
  };

  const overlayOpacity = props.overlayOpacity || 30;
  const overlayColor = props.overlayColor || '#000000';
  const currentCrop = getCurrentCrop();
  const zoomPercent = Math.round((isEditing ? editZoom : currentCrop.scale) * 100);

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
      <div className="relative w-full h-full" style={defaultBackgroundStyle}>
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

        {/* ⭐ TEXTE AVEC CONTENEURS REDIMENSIONNABLES + CONTOUR DE TEXTE */}
        {!isEditing && (
          <>
            {/* TITRE */}
            {showTitle && (
              <div className="absolute" style={{ left: `${titlePosition.x}%`, top: `${titlePosition.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="relative" style={{ 
                  display: 'inline-block',
                  width: `${titleWidth}px`,
                  minWidth: '50px',
                  maxWidth: '3000px',
                  border: isSelected && !resizingText ? '1px dashed rgba(255,255,255,0.3)' : 'none',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: isResizing ? 'none' : 'all 0.1s ease',
                }}>
                  <h1 className="mb-0" style={{
                    display: 'block',
                    width: '100%',
                    fontFamily: props.titleFont || 'Poppins',
                    fontSize: `${props.titleFontSize || 48}px`,
                    fontWeight: props.titleFontWeight || '700',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    marginBottom: '0',
                    opacity: textOpacity,
                    cursor: 'default',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    transition: isResizing ? 'none' : 'all 0.1s ease',
                    WebkitTextStroke: props.textStrokeWidth ? `${props.textStrokeWidth}px ${props.textStrokeColor || '#000000'}` : '0px',
                    textShadow: props.textShadow || '2px 2px 4px rgba(0,0,0,0.3)',
                    ...(props?.titleGradient ? { backgroundImage: props.titleGradient, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' } : { color: props.titleColor || '#ffffff' }),
                  }}
                  contentEditable={isSelected && !isResizing && !resizingText}
                  onBlur={handleTitleBlur}
                  onMouseDown={isSelected && !isResizing && !resizingText ? handleTitleMouseDown : undefined}
                  suppressContentEditableWarning>
                    {props.title || shop?.name || 'Bienvenue'}
                  </h1>
                  
                  {isSelected && !isEditing && !isResizing && !resizingText && (
                    <>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'title', 'ne')} />
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'title', 'nw')} />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'title', 'se')} />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'title', 'sw')} />
                      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-e-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Ajuster la largeur" onMouseDown={(e) => handleResizeStart(e, 'title', 'e')} />
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-w-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Ajuster la largeur" onMouseDown={(e) => handleResizeStart(e, 'title', 'w')} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* SOUS-TITRE */}
            {showSubtitle && (
              <div className="absolute" style={{ left: `${subtitlePosition.x}%`, top: `${subtitlePosition.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="relative" style={{ 
                  display: 'inline-block',
                  width: `${subtitleWidth}px`,
                  minWidth: '50px',
                  maxWidth: '3000px',
                  border: isSelected && !resizingText ? '1px dashed rgba(255,255,255,0.3)' : 'none',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: isResizing ? 'none' : 'all 0.1s ease',
                }}>
                  <p className="mb-0" style={{
                    display: 'block',
                    width: '100%',
                    fontSize: `${props.subtitleFontSize || 18}px`,
                    fontFamily: props.subtitleFont || 'Inter',
                    fontWeight: props.subtitleFontWeight || '400',
                    color: props.subtitleColor || '#ffffff',
                    opacity: textOpacity,
                    cursor: 'default',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    transition: isResizing ? 'none' : 'all 0.1s ease',
                    WebkitTextStroke: props.subtitleTextStrokeWidth ? `${props.subtitleTextStrokeWidth}px ${props.subtitleTextStrokeColor || '#000000'}` : '0px',
                    textShadow: props.subtitleTextShadow || '1px 1px 2px rgba(0,0,0,0.3)',
                  }}
                  contentEditable={isSelected && !isResizing && !resizingText}
                  onBlur={handleSubtitleBlur}
                  onMouseDown={isSelected && !isResizing && !resizingText ? handleSubtitleMouseDown : undefined}
                  suppressContentEditableWarning>
                    {props.subtitle || shop?.description || 'Découvrez notre collection exclusive'}
                  </p>
                  
                  {isSelected && !isEditing && !isResizing && !resizingText && (
                    <>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'subtitle', 'ne')} />
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'subtitle', 'nw')} />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'subtitle', 'se')} />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'subtitle', 'sw')} />
                      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-e-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Ajuster la largeur" onMouseDown={(e) => handleResizeStart(e, 'subtitle', 'e')} />
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-w-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Ajuster la largeur" onMouseDown={(e) => handleResizeStart(e, 'subtitle', 'w')} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* BOUTON */}
            {showButton && (
              <div className="absolute" style={{ left: `${buttonPosition.x}%`, top: `${buttonPosition.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="relative" style={{ 
                  display: 'inline-block',
                  width: `${buttonWidth}px`,
                  minWidth: '50px',
                  maxWidth: '3000px',
                  border: isSelected && !resizingText ? '1px dashed rgba(255,255,255,0.3)' : 'none',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: isResizing ? 'none' : 'all 0.1s ease',
                }}>
                  <button className="inline-block w-full" style={{
                    fontFamily: props.buttonFont || 'Inter',
                    fontSize: `${props.buttonFontSize || 16}px`,
                    fontWeight: props.buttonFontWeight || '600',
                    backgroundColor: props.buttonBackgroundColor || '#2563EB',
                    color: props.buttonTextColor || '#ffffff',
                    padding: '0.75rem 1rem',
                    borderRadius: props.buttonBorderRadius || '2rem',
                    border: props.buttonBorder ? `2px solid ${props.buttonBorderColor || '#ffffff'}` : 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, background 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    opacity: textOpacity,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    WebkitTextStroke: props.buttonTextStrokeWidth ? `${props.buttonTextStrokeWidth}px ${props.buttonTextStrokeColor || '#000000'}` : '0px',
                    textShadow: props.buttonTextShadow || 'none',
                  }}
                  contentEditable={isSelected && !isResizing && !resizingText}
                  onBlur={handleButtonTextBlur}
                  onMouseDown={isSelected && !isResizing && !resizingText ? handleButtonMouseDown : undefined}
                  suppressContentEditableWarning>
                    {props.buttonText || 'Explorer'}
                  </button>
                  
                  {isSelected && !isEditing && !isResizing && !resizingText && (
                    <>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'button', 'ne')} />
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'button', 'nw')} />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'button', 'se')} />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleResizeStart(e, 'button', 'sw')} />
                      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-e-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Ajuster la largeur" onMouseDown={(e) => handleResizeStart(e, 'button', 'e')} />
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-w-resize border border-white z-30 hover:scale-125 transition-transform" 
                           title="Ajuster la largeur" onMouseDown={(e) => handleResizeStart(e, 'button', 'w')} />
                    </>
                  )}
                </div>
              </div>
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
          <span className="ml-1 text-yellow-300">🔵Zone+Police (max 200px) 🟢Largeur (max 3000px)</span>
          <span className="ml-1 text-yellow-300">(Double-clic)</span>
        </div>
      )}
    </div>
  );
}