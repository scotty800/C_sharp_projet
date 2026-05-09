'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiCircle } from 'react-icons/fi';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number;
}

export function CarouselBannerBlock({ shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1 }: Props) {
  const { props } = block;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Récupérer les images du carrousel
  const images = props.images || [];
  const hasImages = images.length > 0;
  const autoPlay = props.autoPlay !== false;
  const intervalTime = props.intervalTime || 5000;
  const showArrows = props.showArrows !== false;
  const showDots = props.showDots !== false;
  const transitionEffect = props.transitionEffect || 'fade'; // fade, slide

  // Auto-défilement
  useEffect(() => {
    if (!autoPlay || !hasImages || isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalTime);
    
    return () => clearInterval(interval);
  }, [autoPlay, hasImages, intervalTime, isHovered]);

  // Navigation manuelle
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Style conteneur
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };

  // Style du contenu (texte superposé)
  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: props.textPosition === 'center' ? 'center' : 'flex-start',
    padding: '0 2rem',
    color: '#ffffff',
    textAlign: props.textPosition === 'center' ? 'center' : 'left',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: props.titleFont || 'Poppins',
    fontSize: props.titleFontSize || '48px',
    fontWeight: props.titleFontWeight || '700',
    lineHeight: 1.2,
    marginBottom: '1rem',
    opacity: textOpacity,
    color: props.titleColor || '#ffffff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: props.subtitleFontSize || '18px',
    fontFamily: props.subtitleFont || 'Inter',
    fontWeight: props.subtitleFontWeight || '400',
    color: props.subtitleColor || '#ffffff',
    marginBottom: '1.5rem',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  };

  const buttonStyle: React.CSSProperties = {
    fontFamily: props.buttonFont || 'Inter',
    fontSize: props.buttonFontSize || '16px',
    fontWeight: props.buttonFontWeight || '500',
    backgroundColor: props.buttonBackgroundColor || '#2563EB',
    color: props.buttonTextColor || '#ffffff',
    padding: '0.75rem 1.5rem',
    borderRadius: props.buttonBorderRadius || '0.5rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    display: 'inline-block',
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
    onUpdate({ title: e.currentTarget.innerText });
  };

  const handleSubtitleBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
    onUpdate({ subtitle: e.currentTarget.innerText });
  };

  const handleButtonTextBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    onUpdate({ buttonText: e.currentTarget.innerText });
  };

  // Si pas d'images, afficher un placeholder
  if (!hasImages) {
    return (
      <div
        className={`relative cursor-pointer transition-all w-full h-full bg-gray-800 flex items-center justify-center ${
          isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
        }`}
        onClick={onSelect}
        style={containerStyle}
      >
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-sm">Ajoutez des images au carrousel</p>
          {isSelected && (
            <p className="text-xs mt-2 text-primary">Cliquez sur "Gérer les images" dans les propriétés</p>
          )}
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const transitionClass = transitionEffect === 'fade' ? 'transition-opacity duration-500' : 'transition-transform duration-500 ease-out';

  return (
    <div
      className={`relative cursor-pointer transition-all w-full h-full ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
      }`}
      style={containerStyle}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Images du carrousel */}
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image: any, idx: number) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full ${transitionClass}`}
            style={{
              opacity: transitionEffect === 'fade' ? (idx === currentIndex ? 1 : 0) : 1,
              transform: transitionEffect === 'slide' ? `translateX(${(idx - currentIndex) * 100}%)` : 'none',
              transition: 'all 0.5s ease-out',
            }}
          >
            {!imageErrors[idx] ? (
              <img
                src={image.url}
                alt={image.alt || `Slide ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))}
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">
                Image non trouvée
              </div>
            )}
            
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: props.overlayColor || '#000000',
                opacity: (props.overlayOpacity || 30) / 100,
              }}
            />
          </div>
        ))}
      </div>

      {/* Flèches de navigation */}
      {showArrows && hasImages && images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
            style={{ opacity: isHovered || isSelected ? 1 : 0.5 }}
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
            style={{ opacity: isHovered || isSelected ? 1 : 0.5 }}
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      {/* Points de navigation (dots) */}
      {showDots && hasImages && images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
          {images.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
              className={`transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'} h-2 rounded-full`}
            />
          ))}
        </div>
      )}

      {/* Contenu texte superposé */}
      <div style={contentStyle}>
        <h2
          className="mb-4"
          style={titleStyle}
          contentEditable={isSelected}
          onBlur={handleTitleBlur}
          suppressContentEditableWarning
        >
          {props.title || shop?.name || 'Bienvenue'}
        </h2>
        <p
          className="mb-6 max-w-2xl"
          style={subtitleStyle}
          contentEditable={isSelected}
          onBlur={handleSubtitleBlur}
          suppressContentEditableWarning
        >
          {props.subtitle || shop?.description || 'Découvrez notre sélection'}
        </p>
        <button
          style={buttonStyle}
          contentEditable={isSelected}
          onBlur={handleButtonTextBlur}
          suppressContentEditableWarning
        >
          {props.buttonText || 'Découvrir'}
        </button>
      </div>

      {/* Label de sélection */}
      {isSelected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full z-40 whitespace-nowrap">
          🎠 Carrousel ({images.length} images)
        </div>
      )}
    </div>
  );
}