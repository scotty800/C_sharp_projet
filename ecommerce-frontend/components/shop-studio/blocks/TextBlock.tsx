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
}

export function TextBlock({ block, customization, isSelected, onSelect, onUpdate, textOpacity = 1, isResizing }: Props) {
  const { props, position } = block;
  const textRef = useRef<HTMLDivElement>(null);
  const [localContent, setLocalContent] = useState(props?.content || 'Saisissez votre texte ici...');
  const [fontSize, setFontSize] = useState(props?.fontSize || 16);

  // ⭐ Redimensionner le texte quand la taille du bloc change
  useEffect(() => {
    if (props.fontSize) {
      setFontSize(Math.min(props.fontSize, position?.height * 0.8));
      return;
    }
    
    const blockHeight = position?.height || 100;
    
    let newSize = Math.min(blockHeight * 0.4, 24);
    newSize = Math.max(12, Math.min(24, newSize));
    
    setFontSize(newSize);
  }, [position?.height, props.fontSize]);

  // ⭐ Style du conteneur
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: props?.textAlign === 'left' ? 'flex-start' : props?.textAlign === 'right' ? 'flex-end' : 'center',
    padding: '8px 12px',
    boxSizing: 'border-box',
    overflow: 'hidden', // ⭐ Empêche le débordement
  };

  // ⭐ Style du texte
  let textStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: props?.fontWeight || '400',
    textAlign: props?.textAlign || 'left',
    fontFamily: props?.fontFamily || 'Inter',
    lineHeight: 1.5,
    opacity: textOpacity,
    margin: 0,
    padding: 0,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    width: '100%',
    color: props?.textColor || '#000000',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 6, // ⭐ Limite à 6 lignes maximum
    WebkitBoxOrient: 'vertical',
  };

  // Gestion du dégradé
  const isGradient = props?.textGradient && props?.textGradient !== '';
  
  if (isGradient) {
    textStyle.backgroundImage = props.textGradient;
    textStyle.backgroundClip = 'text';
    textStyle.WebkitBackgroundClip = 'text';
    textStyle.color = 'transparent';
  } else {
    textStyle.color = props?.textColor || '#000000';
    textStyle.backgroundColor = props?.backgroundColor || 'transparent';
  }

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    setLocalContent(newContent);
    onUpdate({ content: newContent });
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
          onBlur={handleBlur}
          suppressContentEditableWarning
          className="outline-none w-full"
        >
          {localContent}
        </div>
      </div>

      {/* ⭐ TAG SUPPRIMÉ - Plus aucun badge flottant */}
    </div>
  );
}