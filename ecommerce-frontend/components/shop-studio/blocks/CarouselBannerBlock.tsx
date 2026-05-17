'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiMove, FiX, FiUpload, FiCopy } from 'react-icons/fi';
import { assetsService } from '@/services/api/assets';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

interface Slide {
  id: string;
  url: string;
  alt: string;
  imageWidth: number;
  imageHeight: number;
  imagePosition: { x: number; y: number };
  imageCrop?: { x: number; y: number; scale: number };
  title: string;
  titleFont: string;
  titleFontSize: number;
  titleFontWeight: string;
  titleColor: string;
  titleGradient?: string;
  titlePosition: { x: number; y: number };
  titleWidth: number;
  subtitle: string;
  subtitleFont: string;
  subtitleFontSize: number;
  subtitleFontWeight: string;
  subtitleColor: string;
  subtitlePosition: { x: number; y: number };
  subtitleWidth: number;
  buttonText: string;
  buttonFont: string;
  buttonFontSize: number;
  buttonFontWeight: string;
  buttonColor: string;
  buttonBackgroundColor: string;
  buttonBorderRadius: number;
  buttonPosition: { x: number; y: number };
  buttonWidth: number;
  overlayOpacity: number;
  overlayColor: string;
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient';
  backgroundValue?: string;
  textOpacity?: number;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showButton?: boolean;
}

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number;
  isResizing?: boolean;
  shopId?: number;
}

export function CarouselBannerBlock({ shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1, isResizing = false, shopId }: Props) {
  const { props } = block;
  const [isHovered, setIsHovered] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = props.currentIndex;
    return savedIndex !== undefined ? savedIndex : 0;
  });
  
  const lastSavedIndex = useRef(currentIndex);
  const pendingIndexRef = useRef<number | null>(null);
  const isMounted = useRef(true);
  
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  const slides: Slide[] = (props.images || props.slides || []).map((slide: any, index: number) => {
    return {
      id: slide.id || `slide-${Date.now()}-${index}-${Math.random()}`,
      url: slide.url || slide.imageUrl || '',
      alt: slide.alt || slide.imageAlt || '',
      imageWidth: slide.imageWidth || 200,
      imageHeight: slide.imageHeight || 200,
      imagePosition: slide.imagePosition || { x: 20, y: 50 },
      imageCrop: slide.imageCrop || { x: 0, y: 0, scale: 1 },
      title: slide.title || 'Titre de la slide',
      titleFont: slide.titleFont || 'Poppins',
      titleFontSize: slide.titleFontSize || 48,
      titleFontWeight: slide.titleFontWeight || '700',
      titleColor: slide.titleColor || '#ffffff',
      titleGradient: slide.titleGradient || undefined,
      titlePosition: slide.titlePosition || { x: 50, y: 30 },
      titleWidth: slide.titleWidth || 300,
      subtitle: slide.subtitle || 'Sous-titre de la slide',
      subtitleFont: slide.subtitleFont || 'Inter',
      subtitleFontSize: slide.subtitleFontSize || 18,
      subtitleFontWeight: slide.subtitleFontWeight || '400',
      subtitleColor: slide.subtitleColor || '#ffffff',
      subtitlePosition: slide.subtitlePosition || { x: 50, y: 50 },
      subtitleWidth: slide.subtitleWidth || 300,
      buttonText: slide.buttonText || 'Découvrir',
      buttonFont: slide.buttonFont || 'Inter',
      buttonFontSize: slide.buttonFontSize || 16,
      buttonFontWeight: slide.buttonFontWeight || '500',
      buttonColor: slide.buttonColor || '#ffffff',
      buttonBackgroundColor: slide.buttonBackgroundColor || '#2563EB',
      buttonBorderRadius: slide.buttonBorderRadius || 8,
      buttonPosition: slide.buttonPosition || { x: 50, y: 70 },
      buttonWidth: slide.buttonWidth || 200,
      overlayOpacity: slide.overlayOpacity ?? 30,
      overlayColor: slide.overlayColor || '#000000',
      backgroundColor: slide.backgroundColor || undefined,
      backgroundType: slide.backgroundType || 'solid',
      backgroundValue: slide.backgroundValue || undefined,
      textOpacity: slide.textOpacity ?? 100,
      showTitle: slide.showTitle !== false,
      showSubtitle: slide.showSubtitle !== false,
      showButton: slide.showButton !== false,
    };
  });
  
  const hasMultipleSlides = slides.length > 1;
  
  const saveCurrentIndex = useCallback((newIndex: number) => {
    if (lastSavedIndex.current !== newIndex && isMounted.current) {
      lastSavedIndex.current = newIndex;
      onUpdate({ currentIndex: newIndex });
    }
  }, [onUpdate]);
  
  useEffect(() => {
    if (pendingIndexRef.current !== null) {
      saveCurrentIndex(pendingIndexRef.current);
      pendingIndexRef.current = null;
    } else {
      saveCurrentIndex(currentIndex);
    }
  }, [currentIndex, saveCurrentIndex]);
  
  const [showSlideManager, setShowSlideManager] = useState(false);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizingImage, setIsResizingImage] = useState(false);
  const [imageResizeStart, setImageResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  
  const [resizingText, setResizingText] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ width: 0, fontSize: 0 });
  const [resizeMouseStart, setResizeMouseStart] = useState({ x: 0, y: 0 });
  
  const [isCropping, setIsCropping] = useState(false);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [cropZoom, setCropZoom] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const autoPlay = props.autoPlay !== false && hasMultipleSlides;
  const intervalTime = props.intervalTime || 5000;
  const showArrows = props.showArrows !== false && hasMultipleSlides;
  const showDots = props.showDots !== false && hasMultipleSlides;
  const transitionEffect = props.transitionEffect || 'fade';
  const transitionDuration = 500;
  
  useEffect(() => {
    if (!autoPlay || !hasMultipleSlides || isHovered || isResizing) return;
    const interval = setInterval(() => {
      const newIndex = (currentIndex + 1) % slides.length;
      pendingIndexRef.current = newIndex;
      setCurrentIndex(newIndex);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [autoPlay, hasMultipleSlides, intervalTime, isHovered, isResizing, slides.length, currentIndex]);
  
  useEffect(() => {
    const event = new CustomEvent('carouselIndexChange', { detail: currentIndex });
    window.dispatchEvent(event);
  }, [currentIndex]);
  
  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
    pendingIndexRef.current = newIndex;
    setCurrentIndex(newIndex);
  };
  
  const goToNext = () => {
    const newIndex = (currentIndex + 1) % slides.length;
    pendingIndexRef.current = newIndex;
    setCurrentIndex(newIndex);
  };
  
  const goToSlide = (index: number) => {
    pendingIndexRef.current = index;
    setCurrentIndex(index);
  };
  
  const currentSlide = slides.length > 0 ? slides[currentIndex] : null;
  
  // ⭐ RENDER IMAGE AVEC TRANSITIONS
  const renderImageWithTransition = () => {
    if (slides.length === 0) return null;
    
    const isFade = transitionEffect === 'fade';
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    const nextIndex = (currentIndex + 1) % slides.length;
    
    return (
      <div className="absolute inset-0">
        {slides.map((slide, idx) => {
          // ⭐ GESTION DU FOND - CORRIGÉE
          // Ne jamais mettre 'transparent' comme backgroundColor
          let backgroundStyle: React.CSSProperties = {};
          
          if (slide.backgroundType === 'gradient' && slide.backgroundValue) {
            backgroundStyle = { background: slide.backgroundValue };
          } else if (slide.backgroundColor && slide.backgroundColor !== 'transparent') {
            backgroundStyle = { backgroundColor: slide.backgroundColor };
          } else {
            // Utiliser la couleur par défaut de la customization ou une couleur sombre
            backgroundStyle = { backgroundColor: customization?.primaryColor || '#1a1a2e' };
          }
          
          const isActive = idx === currentIndex;
          let transformStyle: React.CSSProperties = {};
          
          if (isFade) {
            transformStyle = {
              opacity: isActive ? 1 : 0,
              transition: `opacity ${transitionDuration}ms ease-in-out`,
              pointerEvents: isActive ? 'auto' : 'none',
            };
          } else {
            if (isActive) {
              transformStyle = {
                transform: 'translateX(0)',
                transition: `transform ${transitionDuration}ms ease-in-out`,
                pointerEvents: 'auto',
              };
            } else {
              if (idx === prevIndex) {
                transformStyle = {
                  transform: 'translateX(-100%)',
                  transition: `transform ${transitionDuration}ms ease-in-out`,
                  pointerEvents: 'none',
                };
              } else if (idx === nextIndex) {
                transformStyle = {
                  transform: 'translateX(100%)',
                  transition: `transform ${transitionDuration}ms ease-in-out`,
                  pointerEvents: 'none',
                };
              } else {
                transformStyle = {
                  transform: 'translateX(100%)',
                  transition: 'none',
                  pointerEvents: 'none',
                  display: 'none',
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
              {!imageErrors[idx] && slide.url ? (
                <div className="relative w-full h-full">
                  {/* ⭐ CONTENEUR IMAGE DRAGGABLE */}
                  <div 
                    className="absolute image-drag-handle"
                    style={{
                      left: `${slide.imagePosition?.x || 20}%`,
                      top: `${slide.imagePosition?.y || 50}%`,
                      transform: 'translate(-50%, -50%)',
                      width: slide.imageWidth,
                      height: slide.imageHeight,
                      border: isSelected && isActive ? '2px solid #3b82f6' : 'none',
                      borderRadius: '8px',
                      cursor: isSelected && isActive ? (isResizingImage ? 'grabbing' : 'default') : 'default',
                    }}
                    onMouseDown={isSelected && isActive ? (e) => {
                      e.stopPropagation();
                      setDraggingElement('image');
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (rect) {
                        setDragOffset({
                          x: (e.clientX - rect.left) / rect.width * 100 - slide.imagePosition.x,
                          y: (e.clientY - rect.top) / rect.height * 100 - slide.imagePosition.y,
                        });
                      }
                    } : undefined}
                  >
                    <img
                      src={slide.url}
                      alt={slide.alt}
                      className="w-full h-full object-cover rounded-lg shadow-lg pointer-events-none"
                      style={{
                        transform: isCropping && isActive
                          ? `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropZoom})`
                          : slide.imageCrop
                            ? `translate(${slide.imageCrop.x}px, ${slide.imageCrop.y}px) scale(${slide.imageCrop.scale})`
                            : 'none',
                      }}
                      onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))}
                    />
                    
                    {/* Poignées de redimensionnement */}
                    {isSelected && isActive && !isCropping && (
                      <>
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize border-2 border-white shadow-lg z-30" 
                             onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); handleImageResizeStart(e, 'nw'); }} />
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize border-2 border-white shadow-lg z-30" 
                             onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); handleImageResizeStart(e, 'ne'); }} />
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize border-2 border-white shadow-lg z-30" 
                             onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); handleImageResizeStart(e, 'sw'); }} />
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize border-2 border-white shadow-lg z-30" 
                             onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); handleImageResizeStart(e, 'se'); }} />
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-n-resize border-2 border-white shadow-lg z-30" 
                             onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); handleImageResizeStart(e, 'n'); }} />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-s-resize border-2 border-white shadow-lg z-30" 
                             onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); handleImageResizeStart(e, 's'); }} />
                        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-w-resize border-2 border-white shadow-lg z-30" 
                             onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); handleImageResizeStart(e, 'w'); }} />
                        <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-e-resize border-2 border-white shadow-lg z-30" 
                             onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); handleImageResizeStart(e, 'e'); }} />
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🖼️</div>
                    <div className="text-xs">Image non trouvée</div>
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: slide.overlayColor || '#000000', opacity: (slide.overlayOpacity || 30) / 100 }} />
            </div>
          );
        })}
      </div>
    );
  };
  
  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}-${Math.random()}`,
      url: '',
      alt: '',
      imageWidth: 200,
      imageHeight: 200,
      imagePosition: { x: 20, y: 50 },
      title: `Slide ${slides.length + 1}`,
      titleFont: 'Poppins',
      titleFontSize: 48,
      titleFontWeight: '700',
      titleColor: '#ffffff',
      titleGradient: undefined,
      titlePosition: { x: 50, y: 30 },
      titleWidth: 300,
      subtitle: 'Sous-titre de la slide',
      subtitleFont: 'Inter',
      subtitleFontSize: 18,
      subtitleFontWeight: '400',
      subtitleColor: '#ffffff',
      subtitlePosition: { x: 50, y: 50 },
      subtitleWidth: 300,
      buttonText: 'Découvrir',
      buttonFont: 'Inter',
      buttonFontSize: 16,
      buttonFontWeight: '500',
      buttonColor: '#ffffff',
      buttonBackgroundColor: '#2563EB',
      buttonBorderRadius: 8,
      buttonPosition: { x: 50, y: 70 },
      buttonWidth: 200,
      overlayOpacity: 30,
      overlayColor: '#000000',
      backgroundColor: undefined,
      backgroundType: 'solid',
      backgroundValue: undefined,
      textOpacity: 100,
      showTitle: true,
      showSubtitle: true,
      showButton: true,
    };
    onUpdate({ images: [...slides, newSlide] });
  };
  
  const duplicateSlide = (slideId: string) => {
    const slideToCopy = slides.find(s => s.id === slideId);
    if (slideToCopy) {
      const copiedSlide = {
        ...slideToCopy,
        id: `slide-${Date.now()}-${Math.random()}`,
        title: `${slideToCopy.title} (copie)`,
      };
      onUpdate({ images: [...slides, copiedSlide] });
    }
  };
  
  const removeSlide = (slideId: string) => {
    const newSlides = slides.filter(s => s.id !== slideId);
    onUpdate({ images: newSlides });
    if (currentIndex >= newSlides.length && newSlides.length > 0) {
      const newIndex = newSlides.length - 1;
      pendingIndexRef.current = newIndex;
      setCurrentIndex(newIndex);
    }
  };
  
  const updateCurrentSlide = (updates: Partial<Slide>) => {
    if (!currentSlide) return;
    const newSlides = slides.map(slide =>
      slide.id === currentSlide.id ? { ...slide, ...updates } : slide
    );
    onUpdate({ images: newSlides });
  };
  
  const handleImageResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!currentSlide) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizingImage(true);
    setResizeDirection(direction);
    setImageResizeStart({
      width: currentSlide.imageWidth,
      height: currentSlide.imageHeight,
      x: e.clientX,
      y: e.clientY,
    });
  };
  
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (!currentSlide) return;
    e.stopPropagation();
    setDraggingElement('title');
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left) / rect.width * 100 - currentSlide.titlePosition.x,
        y: (e.clientY - rect.top) / rect.height * 100 - currentSlide.titlePosition.y,
      });
    }
  };
  
  const handleSubtitleMouseDown = (e: React.MouseEvent) => {
    if (!currentSlide) return;
    e.stopPropagation();
    setDraggingElement('subtitle');
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left) / rect.width * 100 - currentSlide.subtitlePosition.x,
        y: (e.clientY - rect.top) / rect.height * 100 - currentSlide.subtitlePosition.y,
      });
    }
  };
  
  const handleButtonMouseDown = (e: React.MouseEvent) => {
    if (!currentSlide) return;
    e.stopPropagation();
    setDraggingElement('button');
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left) / rect.width * 100 - currentSlide.buttonPosition.x,
        y: (e.clientY - rect.top) / rect.height * 100 - currentSlide.buttonPosition.y,
      });
    }
  };
  
  const handleTextResizeStart = (e: React.MouseEvent, element: string, direction: string) => {
    if (!currentSlide) return;
    e.stopPropagation();
    setResizingText(element);
    setResizeDirection(direction);
    
    let currentWidth = 0;
    let currentFontSize = 0;
    
    if (element === 'title') {
      currentWidth = currentSlide.titleWidth;
      currentFontSize = currentSlide.titleFontSize;
    } else if (element === 'subtitle') {
      currentWidth = currentSlide.subtitleWidth;
      currentFontSize = currentSlide.subtitleFontSize;
    } else {
      currentWidth = currentSlide.buttonWidth;
      currentFontSize = currentSlide.buttonFontSize;
    }
    
    setResizeStart({ width: currentWidth, fontSize: currentFontSize });
    setResizeMouseStart({ x: e.clientX, y: e.clientY });
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingElement && currentSlide) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          let newX = (e.clientX - rect.left) / rect.width * 100 - dragOffset.x;
          let newY = (e.clientY - rect.top) / rect.height * 100 - dragOffset.y;
          newX = Math.max(0, Math.min(100, newX));
          newY = Math.max(0, Math.min(100, newY));
          
          const updates: Partial<Slide> = {};
          if (draggingElement === 'title') updates.titlePosition = { x: newX, y: newY };
          else if (draggingElement === 'subtitle') updates.subtitlePosition = { x: newX, y: newY };
          else if (draggingElement === 'button') updates.buttonPosition = { x: newX, y: newY };
          else if (draggingElement === 'image') updates.imagePosition = { x: newX, y: newY };
          updateCurrentSlide(updates);
        }
      }
      
      if (isResizingImage && currentSlide && resizeDirection) {
        const dx = e.clientX - imageResizeStart.x;
        const dy = e.clientY - imageResizeStart.y;
        let newWidth = imageResizeStart.width;
        let newHeight = imageResizeStart.height;
        
        if (resizeDirection === 'se') {
          newWidth = Math.max(50, Math.min(500, imageResizeStart.width + dx));
          newHeight = Math.max(50, Math.min(500, imageResizeStart.height + dy));
        } else if (resizeDirection === 'e') {
          newWidth = Math.max(50, Math.min(500, imageResizeStart.width + dx));
        } else if (resizeDirection === 's') {
          newHeight = Math.max(50, Math.min(500, imageResizeStart.height + dy));
        } else if (resizeDirection === 'ne') {
          newWidth = Math.max(50, Math.min(500, imageResizeStart.width + dx));
          newHeight = Math.max(50, Math.min(500, imageResizeStart.height - dy));
        } else if (resizeDirection === 'nw') {
          newWidth = Math.max(50, Math.min(500, imageResizeStart.width - dx));
          newHeight = Math.max(50, Math.min(500, imageResizeStart.height - dy));
        } else if (resizeDirection === 'sw') {
          newWidth = Math.max(50, Math.min(500, imageResizeStart.width - dx));
          newHeight = Math.max(50, Math.min(500, imageResizeStart.height + dy));
        } else if (resizeDirection === 'n') {
          newHeight = Math.max(50, Math.min(500, imageResizeStart.height - dy));
        } else if (resizeDirection === 'w') {
          newWidth = Math.max(50, Math.min(500, imageResizeStart.width - dx));
        }
        
        updateCurrentSlide({ imageWidth: newWidth, imageHeight: newHeight });
      }
      
      if (resizingText && currentSlide && resizeDirection) {
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
          
          const updates: Partial<Slide> = {};
          if (resizingText === 'title') {
            updates.titleWidth = Math.round(newWidth);
            updates.titleFontSize = Math.round(newFontSize);
          } else if (resizingText === 'subtitle') {
            updates.subtitleWidth = Math.round(newWidth);
            updates.subtitleFontSize = Math.round(newFontSize);
          } else if (resizingText === 'button') {
            updates.buttonWidth = Math.round(newWidth);
            updates.buttonFontSize = Math.round(newFontSize);
          }
          updateCurrentSlide(updates);
        }
        else if (resizeDirection === 'e' || resizeDirection === 'w') {
          if (resizeDirection === 'e') {
            newWidth = Math.max(50, Math.min(3000, resizeStart.width + dx));
          } else if (resizeDirection === 'w') {
            newWidth = Math.max(50, Math.min(3000, resizeStart.width - dx));
          }
          
          const updates: Partial<Slide> = {};
          if (resizingText === 'title') updates.titleWidth = newWidth;
          else if (resizingText === 'subtitle') updates.subtitleWidth = newWidth;
          else if (resizingText === 'button') updates.buttonWidth = newWidth;
          updateCurrentSlide(updates);
        }
      }
    };
    
    const handleMouseUp = () => {
      setDraggingElement(null);
      setIsResizingImage(false);
      setResizingText(null);
      setResizeDirection(null);
    };
    
    if (draggingElement || isResizingImage || resizingText) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingElement, isResizingImage, resizingText, currentSlide, dragOffset, imageResizeStart, resizeDirection, resizeStart, resizeMouseStart]);
  
  const handleImageUpload = async (files: FileList) => {
    if (!shopId) {
      toast.error('ID de boutique non disponible');
      return;
    }
    for (const file of Array.from(files)) {
      try {
        const asset = await assetsService.uploadAsset(shopId, file, 'image', 'carousel');
        const fullUrl = getImageUrl(asset.url);
        updateCurrentSlide({ url: fullUrl, alt: asset.name });
        toast.success(`Image uploadée: ${asset.name}`);
      } catch (error) {
        toast.error(`Erreur lors de l'upload`);
      }
    }
  };
  
  const openAssetPicker = () => {
    const event = new CustomEvent('openAssetPickerForCarousel', {
      detail: { callback: (asset: any) => updateCurrentSlide({ url: getImageUrl(asset.url), alt: asset.name }) }
    });
    window.dispatchEvent(event);
  };
  
  const startCropping = () => {
    if (!currentSlide) return;
    setIsCropping(true);
    setCropOffsetX(currentSlide.imageCrop?.x || 0);
    setCropOffsetY(currentSlide.imageCrop?.y || 0);
    setCropZoom(currentSlide.imageCrop?.scale || 1);
  };
  
  const saveCrop = () => {
    updateCurrentSlide({ imageCrop: { x: cropOffsetX, y: cropOffsetY, scale: cropZoom } });
    setIsCropping(false);
  };
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  if (slides.length === 0) {
    return (
      <div className={`relative w-full h-full bg-gray-800 flex items-center justify-center ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`} onClick={onSelect}>
        <div className="text-center text-gray-400 p-4">
          <div className="text-4xl mb-2">🎠</div>
          <p className="text-sm">Carrousel personnalisé</p>
          <button onClick={(e) => { e.stopPropagation(); setShowSlideManager(true); }} className="mt-2 px-3 py-1 bg-primary text-white text-xs rounded-lg">+ Créer ma première slide</button>
        </div>
      </div>
    );
  }
  
  if (!currentSlide) {
    return (
      <div className={`relative w-full h-full bg-gray-800 flex items-center justify-center ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`} onClick={onSelect}>
        <div className="text-center text-gray-400 p-4">⚠️ Erreur de chargement de la slide</div>
      </div>
    );
  }
  
  const slideTextOpacity = (currentSlide.textOpacity ?? 100) / 100;
  
  return (
    <>
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden ${isSelected && !isCropping ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`}
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ⭐ FOND DE LA SLIDE - CORRIGÉ : Jamais transparent */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: currentSlide.backgroundColor || customization?.primaryColor || '#1a1a2e',
          }}
        />
        
        {renderImageWithTransition()}
        
        {/* ⭐ TITRE */}
        {currentSlide.showTitle !== false && currentSlide.title && (
          <div
            data-drag-handle
            className="absolute"
            style={{
              left: `${currentSlide.titlePosition.x}%`,
              top: `${currentSlide.titlePosition.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: isSelected ? 'default' : 'default',
            }}
            onMouseDown={isSelected ? handleTitleMouseDown : undefined}
          >
            <div 
              className="relative"
              style={{
                display: 'inline-block',
                width: `${currentSlide.titleWidth}px`,
                minWidth: '50px',
                maxWidth: '3000px',
                border: isSelected ? '1px dashed rgba(255,255,255,0.3)' : 'none',
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              <h1
                className="font-bold"
                style={{
                  display: 'block',
                  width: '100%',
                  fontFamily: currentSlide.titleFont || customization?.headingFont || 'Poppins',
                  fontSize: currentSlide.titleFontSize,
                  fontWeight: currentSlide.titleFontWeight,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: currentSlide.titleColor || '#ffffff',
                  opacity: slideTextOpacity,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  ...(currentSlide.titleGradient ? { 
                    backgroundImage: currentSlide.titleGradient, 
                    backgroundClip: 'text', 
                    WebkitBackgroundClip: 'text', 
                    color: 'transparent' 
                  } : {}),
                }}
                contentEditable={isSelected}
                onBlur={(e) => updateCurrentSlide({ title: e.currentTarget.innerText })}
                suppressContentEditableWarning
              >
                {currentSlide.title}
              </h1>
              
              {isSelected && (
                <>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'title', 'ne')} />
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'title', 'nw')} />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'title', 'se')} />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'title', 'sw')} />
                  
                  <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-e-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Ajuster la largeur" onMouseDown={(e) => handleTextResizeStart(e, 'title', 'e')} />
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-w-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Ajuster la largeur" onMouseDown={(e) => handleTextResizeStart(e, 'title', 'w')} />
                </>
              )}
            </div>
          </div>
        )}
        
        {/* ⭐ SOUS-TITRE */}
        {currentSlide.showSubtitle !== false && currentSlide.subtitle && (
          <div
            data-drag-handle
            className="absolute"
            style={{
              left: `${currentSlide.subtitlePosition.x}%`,
              top: `${currentSlide.subtitlePosition.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: isSelected ? 'default' : 'default',
            }}
            onMouseDown={isSelected ? handleSubtitleMouseDown : undefined}
          >
            <div 
              className="relative"
              style={{
                display: 'inline-block',
                width: `${currentSlide.subtitleWidth}px`,
                minWidth: '50px',
                maxWidth: '3000px',
                border: isSelected ? '1px dashed rgba(255,255,255,0.3)' : 'none',
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              <p
                className="whitespace-normal"
                style={{
                  display: 'block',
                  width: '100%',
                  fontFamily: currentSlide.subtitleFont || customization?.bodyFont || 'Inter',
                  fontSize: currentSlide.subtitleFontSize,
                  fontWeight: currentSlide.subtitleFontWeight,
                  color: currentSlide.subtitleColor,
                  opacity: slideTextOpacity,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
                contentEditable={isSelected}
                onBlur={(e) => updateCurrentSlide({ subtitle: e.currentTarget.innerText })}
                suppressContentEditableWarning
              >
                {currentSlide.subtitle}
              </p>
              
              {isSelected && (
                <>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'subtitle', 'ne')} />
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'subtitle', 'nw')} />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'subtitle', 'se')} />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'subtitle', 'sw')} />
                  
                  <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-e-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Ajuster la largeur" onMouseDown={(e) => handleTextResizeStart(e, 'subtitle', 'e')} />
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-w-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Ajuster la largeur" onMouseDown={(e) => handleTextResizeStart(e, 'subtitle', 'w')} />
                </>
              )}
            </div>
          </div>
        )}
        
        {/* ⭐ BOUTON */}
        {currentSlide.showButton !== false && currentSlide.buttonText && (
          <div
            data-drag-handle
            className="absolute"
            style={{
              left: `${currentSlide.buttonPosition.x}%`,
              top: `${currentSlide.buttonPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: isSelected ? 'default' : 'default',
            }}
            onMouseDown={isSelected ? handleButtonMouseDown : undefined}
          >
            <div 
              className="relative"
              style={{
                display: 'inline-block',
                width: `${currentSlide.buttonWidth}px`,
                minWidth: '50px',
                maxWidth: '3000px',
                border: isSelected ? '1px dashed rgba(255,255,255,0.3)' : 'none',
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              <button
                className="w-full"
                style={{
                  fontFamily: currentSlide.buttonFont || customization?.primaryFont || 'Inter',
                  fontSize: currentSlide.buttonFontSize,
                  fontWeight: currentSlide.buttonFontWeight,
                  backgroundColor: currentSlide.buttonBackgroundColor,
                  color: currentSlide.buttonColor,
                  padding: '0.75rem 1rem',
                  borderRadius: `${currentSlide.buttonBorderRadius}px`,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  opacity: slideTextOpacity,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
                contentEditable={isSelected}
                onBlur={(e) => updateCurrentSlide({ buttonText: e.currentTarget.innerText })}
                suppressContentEditableWarning
              >
                {currentSlide.buttonText}
              </button>
              
              {isSelected && (
                <>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'button', 'ne')} />
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'button', 'nw')} />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'button', 'se')} />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Agrandir la zone (texte proportionnel)" onMouseDown={(e) => handleTextResizeStart(e, 'button', 'sw')} />
                  
                  <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-e-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Ajuster la largeur" onMouseDown={(e) => handleTextResizeStart(e, 'button', 'e')} />
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-6 bg-green-500 rounded-full cursor-w-resize border border-white z-30 hover:scale-125 transition-transform" 
                       title="Ajuster la largeur" onMouseDown={(e) => handleTextResizeStart(e, 'button', 'w')} />
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Flèches de navigation */}
        {!isCropping && showArrows && hasMultipleSlides && (
          <>
            <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white">
              <FiChevronLeft size={24} />
            </button>
            <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white">
              <FiChevronRight size={24} />
            </button>
          </>
        )}
        
        {/* Dots de navigation */}
        {!isCropping && showDots && hasMultipleSlides && (
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                onClick={() => goToSlide(idx)}
                className={`transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'} h-2 rounded-full`}
              />
            ))}
          </div>
        )}
        
        {/* Barre d'outils */}
        {isSelected && !isCropping && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 rounded-lg shadow-lg z-40 flex gap-1 p-1 whitespace-nowrap">
            <button onClick={addSlide} className="px-2 py-1 bg-primary text-white text-xs rounded">+ Slide</button>
            <button onClick={() => duplicateSlide(currentSlide.id)} className="px-2 py-1 bg-gray-700 text-white text-xs rounded">📋 Dupliquer</button>
            <button onClick={() => removeSlide(currentSlide.id)} className="px-2 py-1 bg-red-600 text-white text-xs rounded">🗑️ Supprimer</button>
            <button onClick={() => setShowSlideManager(true)} className="px-2 py-1 bg-gray-700 text-white text-xs rounded">📋 Gérer</button>
            {currentSlide.url && (
              <button onClick={startCropping} className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">✂️ Recadrer</button>
            )}
            <button onClick={openAssetPicker} className="px-2 py-1 bg-purple-600 text-white text-xs rounded">🖼️ Image</button>
          </div>
        )}
        
        {/* Mode crop */}
        {isCropping && currentSlide.url && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
            <div className="relative w-96 h-96 bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={currentSlide.url}
                alt="Crop"
                className="w-full h-full object-contain cursor-grab"
                style={{ transform: `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropZoom})` }}
                onMouseDown={(e) => {
                  let startX = e.clientX, startY = e.clientY;
                  const startOffsetX = cropOffsetX, startOffsetY = cropOffsetY;
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    setCropOffsetX(startOffsetX + (moveEvent.clientX - startX));
                    setCropOffsetY(startOffsetY + (moveEvent.clientY - startY));
                  };
                  window.addEventListener('mousemove', onMouseMove);
                  window.addEventListener('mouseup', () => window.removeEventListener('mousemove', onMouseMove), { once: true });
                }}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setCropZoom(z => Math.max(1, z - 0.2))} className="px-4 py-2 bg-gray-700 rounded-lg text-white">- Zoom</button>
              <span className="px-4 py-2 text-white">{Math.round(cropZoom * 100)}%</span>
              <button onClick={() => setCropZoom(z => Math.min(3, z + 0.2))} className="px-4 py-2 bg-gray-700 rounded-lg text-white">+ Zoom</button>
              <button onClick={() => { setCropOffsetX(0); setCropOffsetY(0); setCropZoom(1); }} className="px-4 py-2 bg-yellow-600 rounded-lg text-white">Reset</button>
              <button onClick={saveCrop} className="px-4 py-2 bg-green-600 rounded-lg text-white">✓ Valider</button>
              <button onClick={() => setIsCropping(false)} className="px-4 py-2 bg-red-600 rounded-lg text-white">✕ Annuler</button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de gestion des slides */}
      {showSlideManager && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowSlideManager(false)}>
          <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Gérer les slides ({slides.length})</h3>
              <button onClick={() => setShowSlideManager(false)} className="text-gray-400 hover:text-white"><FiX size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {slides.map((slide, idx) => (
                <div key={slide.id} className={`p-3 rounded-lg border ${idx === currentIndex ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-700/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-600 rounded overflow-hidden">
                      {slide.url ? <img src={slide.url} alt={slide.alt} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">🖼️</div>}
                    </div>
                    <div className="flex-1">
                      <span className="text-white font-medium">Slide {idx + 1}</span>
                      <div className="text-gray-500 text-xs">{slide.title || 'Pas de titre'}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { pendingIndexRef.current = idx; setCurrentIndex(idx); setShowSlideManager(false); }} className="p-1 bg-blue-600 rounded text-white text-xs">Voir</button>
                      <button onClick={() => duplicateSlide(slide.id)} className="p-1 bg-gray-600 rounded text-white text-xs">📋</button>
                      <button onClick={() => removeSlide(slide.id)} className="p-1 bg-red-600 rounded text-white text-xs">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addSlide} className="w-full py-2 bg-primary text-white rounded-lg">+ Ajouter une slide</button>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
              <button onClick={() => setShowSlideManager(false)} className="px-4 py-2 bg-gray-700 rounded-lg">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}