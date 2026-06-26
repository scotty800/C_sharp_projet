'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number;
  isResizing?: boolean;
  ratio?: number;
}

export function TextBlock({ block, customization, isSelected, onSelect, onUpdate, textOpacity = 1, isResizing, ratio = 1 }: Props) {
  const { props, position } = block;
  const textRef = useRef<HTMLDivElement>(null);
  const [localContent, setLocalContent] = useState(props?.content || 'Saisissez votre texte ici...');
  const [fontSize, setFontSize] = useState(props?.fontSize || 16);

  useEffect(() => {
    const rawSize = props.fontSize || 16;

    if (props.fontSize) {
      setFontSize(rawSize * ratio);
      return;
    }

    const blockHeight = (position?.height || 100) * ratio;
    let newSize = Math.min(blockHeight * 0.4, 24 * ratio);
    newSize = Math.max(12, Math.min(24 * ratio, newSize));
    setFontSize(newSize);
  }, [position?.height, props.fontSize, ratio]);

  // ⭐ Resynchronise le texte affiché si props.content change depuis l'extérieur
  // (régénération de page produit, changement de produit) tant qu'on n'est pas
  // en train d'éditer ce bloc précis.
  useEffect(() => {
    if (document.activeElement !== textRef.current) {
      setLocalContent(props?.content || 'Saisissez votre texte ici...');
    }
  }, [props?.content]);

  // ⭐⭐ FIX PRINCIPAL : mode "pastille" (badge).
  // Avant : tout texte avait un padding fixe de 8px/12px quelle que soit la
  // hauteur du bloc → les petits labels (badges, "Couleurs disponibles"...)
  // débordaient de leur boîte. borderRadius/paddingX/paddingY étaient en plus
  // totalement ignorés, donc les badges "PRODUIT", "En stock" etc. ne
  // ressemblaient jamais à des pastilles.
  // Maintenant : si le bloc a un borderRadius OU un paddingX/paddingY, il
  // devient une pastille qui s'ajuste à son contenu (comme un vrai badge).
  // Sinon, c'est du texte normal, avec un padding minimal qui ne déborde
  // plus des petites hauteurs de bloc.
  const isPill = props?.borderRadius !== undefined || props?.paddingX !== undefined || props?.paddingY !== undefined;

  // ⭐ Étape 1 — Ajout des constantes de padding de base
  const BASE_PADDING_Y = 1;
  const BASE_PADDING_X = 3;

  // ⭐ Étape 2 — containerStyle avec padding adaptatif
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: props?.textAlign === 'left' ? 'flex-start' : props?.textAlign === 'right' ? 'flex-end' : (isPill ? 'flex-start' : 'center'),
    // ⭐ Remplacé : padding adaptatif avec ratio
    padding: isPill ? '0' : `${Math.max(1, BASE_PADDING_Y * ratio)}px ${Math.max(2, BASE_PADDING_X * ratio)}px`,
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const isGradient = props?.textGradient && props?.textGradient !== '';

  // ⭐ Étape 3 — textStyle avec lineHeight ajusté
  let textStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: props?.fontWeight || '400',
    textAlign: props?.textAlign || 'left',
    fontFamily: props?.fontFamily || 'Inter',
    // ⭐ Remplacé : lineHeight 1.5 → 1.3
    lineHeight: props?.lineHeight || 1.3,
    letterSpacing: props?.letterSpacing !== undefined ? `${props.letterSpacing}px` : undefined,
    opacity: textOpacity,
    margin: 0,
    padding: 0,
  };

  if (isGradient) {
    textStyle.backgroundImage = props.textGradient;
    textStyle.backgroundClip = 'text';
    textStyle.WebkitBackgroundClip = 'text';
    textStyle.color = 'transparent';
  } else {
    textStyle.color = props?.textColor || '#000000';
  }

  if (isPill) {
    Object.assign(textStyle, {
      display: 'inline-block',
      width: 'fit-content',
      whiteSpace: 'nowrap',
      backgroundColor: props?.backgroundColor || 'transparent',
      borderRadius: `${props?.borderRadius ?? 999}px`,
      padding: `${props?.paddingY ?? 4}px ${props?.paddingX ?? 10}px`,
      boxSizing: 'border-box',
    });
  } else {
    Object.assign(textStyle, {
      width: '100%',
      backgroundColor: props?.backgroundColor || 'transparent',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 6,
      WebkitBoxOrient: 'vertical',
    });
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    setLocalContent(newContent);
    onUpdate({ content: newContent });
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    setLocalContent(newContent);
    onUpdate({ content: newContent });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceSave'));
    }, 100);
  };

  return (
    <div 
      className={`relative w-full h-full cursor-text transition-all ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
      }`}
      onClick={onSelect}
    >
      <div style={containerStyle}>
        <div 
          ref={textRef}
          style={textStyle}
          contentEditable={isSelected}
          onInput={handleInput}
          onBlur={handleBlur}
          suppressContentEditableWarning
          className="outline-none"
        >
          {localContent}
        </div>
      </div>
    </div>
  );
}