'use client';

import React from 'react';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  isVisible?: boolean;
  shopId?: number;
}

/**
 * CarouselSlideBlock
 *
 * Bloc de type `carousel-slide`, enfant direct d'un `carousel-banner`.
 * Il ne contient aucun contenu propre : il est uniquement un conteneur
 * de fond (couleur unie, dégradé ou image) dans lequel l'utilisateur
 * glisse ses propres blocs (titre, texte, image, bouton…) via le
 * système de calques.
 *
 * Rendu dans le canvas : ce bloc n'est PAS rendu directement comme un
 * bloc autonome. C'est le CarouselBannerBlock qui affiche son fond,
 * et le StudioCanvas qui rend ses blocs enfants par-dessus uniquement
 * quand la slide est active.
 *
 * Ce composant est utilisé UNIQUEMENT dans la sidebar / ColorsPanel
 * pour lire et écrire les props de fond de la slide sélectionnée.
 */
export function CarouselSlideBlock({
  block,
  customization,
  isSelected,
  onSelect,
  onUpdate,
}: Props) {
  const { props } = block;

  // Fond calculé
  let backgroundStyle: React.CSSProperties = {};
  if (props.backgroundType === 'gradient' && props.backgroundValue) {
    backgroundStyle = { background: props.backgroundValue };
  } else if (props.backgroundColor && props.backgroundColor !== 'transparent') {
    backgroundStyle = { backgroundColor: props.backgroundColor };
  } else {
    backgroundStyle = { backgroundColor: customization?.primaryColor || '#1a1a2e' };
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded ${
        isSelected ? 'ring-2 ring-primary ring-offset-1' : ''
      }`}
      style={backgroundStyle}
      onClick={onSelect}
    >
      {/* Image de fond */}
      {props.backgroundImage && (
        <img
          src={props.backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: (props.backgroundImageOpacity ?? 100) / 100 }}
        />
      )}

      {/* Overlay */}
      {(props.overlayOpacity ?? 0) > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: props.overlayColor || '#000000',
            opacity: (props.overlayOpacity ?? 0) / 100,
          }}
        />
      )}

      {/* Indicateur visuel pour la sidebar/canvas */}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-black/40 text-white text-xs px-2 py-1 rounded">
            🎠 Slide — modifiez le fond via le panneau Couleurs
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Valeurs par défaut pour créer une nouvelle slide
 */
export function createDefaultSlideProps(index: number = 0) {
  const defaults = [
    { backgroundColor: '#1a1a2e', backgroundType: 'solid' },
    { backgroundColor: '#0f3460', backgroundType: 'solid' },
    { backgroundType: 'gradient', backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { backgroundType: 'gradient', backgroundValue: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { backgroundColor: '#1e3a5f', backgroundType: 'solid' },
  ];
  const preset = defaults[index % defaults.length];
  return {
    ...preset,
    backgroundImage: null,
    backgroundImageOpacity: 100,
    overlayOpacity: 0,
    overlayColor: '#000000',
    backgroundColor: (preset as any).backgroundColor ?? null,
    backgroundValue: (preset as any).backgroundValue ?? null,
  };
}