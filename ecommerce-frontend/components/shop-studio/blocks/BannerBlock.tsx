'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
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

export function BannerBlock({ shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1, isResizing = false }: Props) {
  const { props } = block;
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // ⭐ Récupérer les images (soit carrousel, soit image unique)
  const isCarousel = props.isCarousel === true;
  const images = isCarousel ? (props.images || []) : [];
  const hasMultipleImages = images.length > 1;
  
  // Image unique (pour le mode normal)
  const singleImage = props.backgroundImage || shop?.bannerUrl;
  
  // Options du carrousel
  const autoPlay = props.autoPlay !== false && isCarousel && hasMultipleImages;
  const intervalTime = props.intervalTime || 5000;
  const showArrows = props.showArrows !== false && hasMultipleImages;
  const showDots = props.showDots !== false && hasMultipleImages;
  const transitionEffect = props.transitionEffect || 'fade';

  // Auto-défilement
  useEffect(() => {
    if (!autoPlay || !hasMultipleImages || isHovered || isResizing) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalTime);
    
    return () => clearInterval(interval);
  }, [autoPlay, hasMultipleImages, intervalTime, isHovered, images.length, isResizing]);

  // Navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // ⭐ STYLE DU TITRE
  const titleStyle: React.CSSProperties = {
    fontFamily: props.titleFont || 'Poppins',
    fontSize: props.titleFontSize || '48px',
    fontWeight: props.titleFontWeight || '700',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    marginBottom: '1rem',
    opacity: textOpacity,
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
    opacity: textOpacity,
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

  const paddingClass = props.textPosition === 'center' ? 'text-center' : 'text-left';

  // ⭐ STYLE DE FOND POUR LE MODE NORMAL (uniquement si carrousel désactivé)
  let backgroundStyle: React.CSSProperties = {};

  if (!isCarousel) {
    if (singleImage && !imageErrors[-1]) {
      backgroundStyle = {
        backgroundImage: `url(${singleImage})`,
        backgroundSize: props.backgroundSize || 'cover',
        backgroundPosition: props.backgroundPosition || 'center',
        backgroundRepeat: 'no-repeat',
      };
    } else if (props.backgroundType === 'gradient' && props.backgroundValue) {
      backgroundStyle = { background: props.backgroundValue };
    } else {
      backgroundStyle = { backgroundColor: props.backgroundColor || '#2563EB' };
    }
  }

  // ⭐ RENDU DE L'IMAGE DE FOND (carrousel ou unique)
  const renderBackground = () => {
    // PRIORITÉ AU CARROUSEL si activé
    if (isCarousel && images.length > 0) {
      const currentImage = images[currentIndex];
      const transitionClass = transitionEffect === 'fade' ? 'transition-opacity duration-500' : 'transition-transform duration-500 ease-out';
      
      return (
        <div className="absolute inset-0">
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
              {!imageErrors[idx] && image.url ? (
                <img
                  src={image.url}
                  alt={image.alt || `Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🖼️</div>
                    <div className="text-xs">Image non trouvée</div>
                    <div className="text-[10px] text-gray-400 mt-1">{image.url?.substring(0, 30)}...</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    } else if (singleImage && !imageErrors[-1] && !isCarousel) {
      // Mode image unique (seulement si carrousel désactivé)
      return (
        <img
          src={singleImage}
          alt="Bannière"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImageErrors(prev => ({ ...prev, [-1]: true }))}
        />
      );
    } else if (!isCarousel) {
      // Mode couleur unie ou dégradé (seulement si carrousel désactivé)
      return <div className="absolute inset-0" style={backgroundStyle} />;
    }
    
    return null;
  };

  // ⭐ OVERLAY (visible dans tous les modes)
  const overlayOpacity = props.overlayOpacity || 30;
  const overlayColor = props.overlayColor || '#000000';

  // ⭐ AFFICHER UN MESSAGE SI CARROUSEL ACTIVÉ MAIS AUCUNE IMAGE
  if (isCarousel && images.length === 0) {
    return (
      <div
        className={`relative cursor-pointer transition-all w-full h-full bg-gray-800 flex items-center justify-center ${
          isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
        }`}
        onClick={onSelect}
      >
        <div className="text-center text-gray-400 p-4">
          <div className="text-4xl mb-2">🎠</div>
          <p className="text-sm">Mode carrousel activé</p>
          <p className="text-xs mt-1">Ajoutez des images dans le panneau "Carrousel"</p>
        </div>
        {isSelected && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap">
            Carrousel (0 image)
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative cursor-pointer transition-all w-full h-full ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : isHovered ? 'ring-1 ring-gray-300 rounded-lg' : ''
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Fond (carrousel ou image unique ou couleur) */}
        {renderBackground()}

        {/* Overlay - toujours présent mais plus transparent pour le carrousel */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: isCarousel ? overlayOpacity / 200 : overlayOpacity / 100,
          }}
        />

        {/* Flèches de navigation (carrousel seulement) */}
        {showArrows && hasMultipleImages && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
              style={{ opacity: (isHovered || isSelected) ? 1 : 0.5 }}
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
              style={{ opacity: (isHovered || isSelected) ? 1 : 0.5 }}
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Points de navigation (carrousel seulement) */}
        {showDots && hasMultipleImages && (
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

        {/* Contenu texte */}
        <div className={`relative z-10 flex flex-col ${paddingClass} justify-center items-${props.textPosition === 'center' ? 'center' : 'start'} h-full px-8`}>
          <h1
            className="mb-4"
            style={titleStyle}
            contentEditable={isSelected}
            onBlur={handleTitleBlur}
            suppressContentEditableWarning
          >
            {props.title || shop?.name || 'Bienvenue'}
          </h1>
          <p
            className="mb-6 max-w-2xl"
            style={subtitleStyle}
            contentEditable={isSelected}
            onBlur={handleSubtitleBlur}
            suppressContentEditableWarning
          >
            {props.subtitle || shop?.description || 'Découvrez nos produits'}
          </p>
          <button
            className="inline-block"
            style={buttonStyle}
            contentEditable={isSelected}
            onBlur={handleButtonTextBlur}
            suppressContentEditableWarning
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {props.buttonText || 'Découvrir'}
          </button>
        </div>
      </div>

      {/* Label de sélection */}
      {isSelected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap">
          {isCarousel ? `🎠 Carrousel (${images.length} images)` : (singleImage ? '🖼️ Bannière' : '🎨 Bannière')}
        </div>
      )}
    </div>
  );
}