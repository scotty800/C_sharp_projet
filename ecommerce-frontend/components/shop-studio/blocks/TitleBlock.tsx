'use client';

import { useRef, useEffect } from 'react';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  isEditing?: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onTextBlur?: (content: string) => void;
  textOpacity?: number;
  isResizing?: boolean;
}

export function TitleBlock({ 
  shop, 
  block, 
  customization, 
  isSelected, 
  isEditing, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onDoubleClick, 
  onTextBlur, 
  textOpacity = 1,
  isResizing 
}: Props) {
  const { props, position } = block;
  const level = props.level || 'h2';
  const textRef = useRef<HTMLDivElement>(null);

  // ⭐ Style du conteneur avec overflow caché
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: props.textAlign === 'left' ? 'flex-start' : props.textAlign === 'right' ? 'flex-end' : 'center',
    padding: '4px 8px',
    boxSizing: 'border-box',
    overflow: 'hidden', // ⭐ Empêche le débordement
  };

  // ⭐ Taille de police limitée pour éviter le débordement
  let fontSize: number;
  
  if (props.fontSize) {
    fontSize = Math.min(props.fontSize, position?.height * 0.8);
  } else {
    const blockHeight = position?.height || 100;
    const textLength = (props.title || props.content || 'Nouveau titre').length;
    
    let newSize = Math.min(blockHeight * 0.6, 48);
    newSize = Math.max(12, Math.min(48, newSize));
    fontSize = newSize;
  }

  const titleStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: props.fontWeight || customization?.headingWeight || '700',
    textAlign: props.textAlign || 'center',
    fontFamily: props.fontFamily || customization?.headingFont || 'Poppins',
    lineHeight: 1.3,
    opacity: textOpacity,
    margin: 0,
    padding: 0,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    width: '100%',
    color: props.textColor || customization?.textColor || '#ffffff',
    overflow: 'hidden', // ⭐ Cache le texte qui dépasse
    textOverflow: 'ellipsis', // ⭐ Ajoute des points de suspension si besoin
    display: '-webkit-box',
    WebkitLineClamp: 3, // ⭐ Limite à 3 lignes maximum
    WebkitBoxOrient: 'vertical',
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    if (onTextBlur) {
      onTextBlur(newContent);
    } else {
      onUpdate({ title: newContent });
    }
  };

  return (
    <div
      className={`relative w-full h-full cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
      }`}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      <div style={containerStyle}>
        <div
          ref={textRef}
          style={titleStyle}
          contentEditable={isSelected}
          onBlur={handleBlur}
          suppressContentEditableWarning
          className="outline-none w-full"
        >
          {props.title || props.content || 'Nouveau titre'}
        </div>
      </div>

      {/* ⭐ TAG SUPPRIMÉ - Plus aucun badge flottant */}
    </div>
  );
}