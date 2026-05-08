'use client';

import { useState, useEffect } from 'react';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number;
}

export function TextBlock({ block, customization, isSelected, onSelect, onUpdate, textOpacity = 1 }: Props) {
  const { props } = block;
  const [localContent, setLocalContent] = useState(props?.content || 'Saisissez votre texte ici...');

  useEffect(() => {
    setLocalContent(props?.content || 'Saisissez votre texte ici...');
  }, [props?.content]);

  // ⭐ STYLE DE BASE (avec opacité et userSelect conditionnel)
  const textStyle: React.CSSProperties = {
    fontFamily: props?.fontFamily || 'Inter',
    fontSize: `${props?.fontSize || 16}px`,
    fontWeight: props?.fontWeight || '400',
    textAlign: props?.textAlign || 'left',
    lineHeight: 1.5,
    padding: '8px',
    width: '100%',
    height: '100%',
    overflow: 'auto',
    opacity: textOpacity,
    userSelect: isSelected ? 'text' : 'none',
    WebkitUserSelect: isSelected ? 'text' : 'none',
  };

  // ⭐ Vérifier si c'est un dégradé (prioritaire)
  const isGradient = props?.textGradient && props?.textGradient !== '';
  
  if (isGradient) {
    textStyle.backgroundImage = props.textGradient;
    textStyle.backgroundClip = 'text';
    textStyle.WebkitBackgroundClip = 'text';
    textStyle.color = 'transparent';
    delete textStyle.backgroundColor;
  } else {
    textStyle.color = props?.textColor || '#000000';
    textStyle.backgroundColor = props?.backgroundColor || 'transparent';
    delete textStyle.backgroundImage;
    delete textStyle.backgroundClip;
    delete textStyle.WebkitBackgroundClip;
  }

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    setLocalContent(newContent);
    onUpdate({ content: newContent });
  };

  const getOpacityLabel = () => {
    if (textOpacity !== 1) {
      return ` (Opacité: ${Math.round(textOpacity * 100)}%)`;
    }
    return '';
  };

  const getGradientLabel = () => {
    if (isGradient) {
      return ' (Dégradé)';
    }
    return '';
  };

  return (
    <div 
      className={`relative w-full h-full cursor-text ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded' : ''}`}
      onClick={onSelect}
    >
      <div 
        style={textStyle}
        contentEditable={isSelected}
        onBlur={handleBlur}
        suppressContentEditableWarning
      >
        {localContent}
      </div>

      {isSelected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap">
          Texte{getGradientLabel()}{getOpacityLabel()}
        </div>
      )}
    </div>
  );
}