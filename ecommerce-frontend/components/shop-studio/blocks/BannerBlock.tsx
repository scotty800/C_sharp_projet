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
  textOpacity?: number; // ⭐ AJOUTÉ
}

export function BannerBlock({ shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1 }: Props) {
  const { props } = block;
  const [isHovered, setIsHovered] = useState(false);

  // ⭐ LOG DE DÉBOGAGE
  console.log('🎨 BannerBlock - textOpacity reçu:', textOpacity);

  // ⭐ STYLE DU TITRE avec opacité
  const titleStyle: React.CSSProperties = {
    fontFamily: `${props.titleFont || 'Poppins'}, 'Poppins', sans-serif`,
    fontSize: props.titleFontSize || '48px',
    fontWeight: props.titleFontWeight || '700',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    marginBottom: '1rem',
    opacity: textOpacity, // ⭐ AJOUT DE L'OPACITÉ
  };

  // ⭐ FORCER l'application de la police avec !important via une classe CSS
  const titleClassName = props.titleFont 
    ? `font-${props.titleFont.toLowerCase().replace(/ /g, '-')}`
    : '';

  // ⭐ CORRECTION : Utiliser backgroundImage au lieu de background
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
    opacity: textOpacity, // ⭐ Optionnel: opacité sur le sous-titre aussi
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
    opacity: textOpacity, // ⭐ Optionnel: opacité sur le bouton aussi
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

  // ⭐ DÉTERMINER LE STYLE DE FOND (couleur unie ou dégradé)
  let backgroundStyle: React.CSSProperties = {};

  if (props.backgroundType === 'gradient' && props.backgroundValue) {
    backgroundStyle = { background: props.backgroundValue };
  } else {
    backgroundStyle = { backgroundColor: props.backgroundColor || '#2563EB' };
  }

  return (
    <div
      className={`relative cursor-pointer transition-all w-full h-full ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : isHovered ? 'ring-1 ring-gray-300 rounded-lg' : ''
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Image de fond - priorité aux props du bloc */}
        {props.backgroundImage ? (
          <Image src={props.backgroundImage} alt="Bannière" fill className="object-cover" unoptimized />
        ) : shop?.bannerUrl ? (
          <Image src={shop.bannerUrl} alt="Bannière" fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0" style={backgroundStyle} />
        )}

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: props.overlayColor || '#000000',
            opacity: (props.overlayOpacity || 30) / 100,
          }}
        />

        {/* Contenu */}
        <div className={`relative z-10 flex flex-col ${paddingClass} justify-center items-${props.textPosition === 'center' ? 'center' : 'start'} h-full px-8`}>
          <h1
            className={`mb-4 ${titleClassName}`}
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

      {/* Label de sélection avec opacité */}
      {isSelected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap">
          Bannière {textOpacity !== 1 ? `(Opacité: ${Math.round(textOpacity * 100)}%)` : ''}
        </div>
      )}
    </div>
  );
}