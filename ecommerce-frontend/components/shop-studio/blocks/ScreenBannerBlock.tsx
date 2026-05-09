'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number;
}

export function ScreenBannerBlock({ shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1 }: Props) {
  const { props } = block;
  const [isHovered, setIsHovered] = useState(false);

  // ⭐ STYLE ÉCRAN / CARTE AVEC BORDURES ÉPAISSES
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    // ⭐ Bordure épaisse personnalisable
    borderWidth: props.borderWidth || 4,
    borderStyle: props.borderStyle || 'solid',
    borderColor: props.borderColor || '#ffffff',
    borderRadius: props.borderRadius || 16,
    // ⭐ Ombre type écran / carte
    boxShadow: props.boxShadow || '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    // ⭐ Effet de fond type verre (glassmorphism)
    backdropFilter: props.backdropFilter || 'none',
    backgroundColor: props.glassEffect ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  };

  // ⭐ STYLE DU TITRE AVEC CONTOUR
  const titleStyle: React.CSSProperties = {
    fontFamily: props.titleFont || 'Poppins',
    fontSize: props.titleFontSize || '48px',
    fontWeight: props.titleFontWeight || '700',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    marginBottom: '1rem',
    opacity: textOpacity,
    // ⭐ Effet de contour épais
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

  const subtitleStyle = {
    fontSize: props.subtitleFontSize || '18px',
    fontFamily: props.subtitleFont || 'Inter',
    fontWeight: props.subtitleFontWeight || '400',
    color: props.subtitleColor || '#ffffff',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  };

  const buttonStyle = {
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

  let backgroundStyle: React.CSSProperties = {};

  if (props.backgroundType === 'gradient' && props.backgroundValue) {
    backgroundStyle = { background: props.backgroundValue };
  } else {
    backgroundStyle = { backgroundColor: props.backgroundColor || '#1e1e2f' };
  }

  return (
    <div
      className={`relative cursor-pointer transition-all w-full h-full ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : isHovered ? 'ring-1 ring-gray-300 rounded-lg' : ''
      }`}
      style={containerStyle}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Image de fond */}
        {props.backgroundImage ? (
          <Image src={props.backgroundImage} alt="Bannière" fill className="object-cover" unoptimized />
        ) : shop?.bannerUrl ? (
          <Image src={shop.bannerUrl} alt="Bannière" fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0" style={backgroundStyle} />
        )}

        {/* Overlay pour effet de verre */}
        {props.glassEffect && (
          <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        )}

        {/* Overlay standard */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: props.overlayColor || '#000000',
            opacity: (props.overlayOpacity || 20) / 100,
          }}
        />

        {/* Contenu */}
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
            {props.subtitle || shop?.description || 'Découvrez notre collection exclusive'}
          </p>
          <button
            className="inline-block"
            style={buttonStyle}
            contentEditable={isSelected}
            onBlur={handleButtonTextBlur}
            suppressContentEditableWarning
          >
            {props.buttonText || 'Explorer'}
          </button>
        </div>
      </div>

      {/* Badge "Écran" pour différencier */}
      {isSelected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap flex items-center gap-1">
          🖥️ Écran
        </div>
      )}
    </div>
  );
}