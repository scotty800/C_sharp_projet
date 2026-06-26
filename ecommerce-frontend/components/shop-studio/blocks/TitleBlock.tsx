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
  ratio?: number;   // ← AJOUT
}

export function TitleBlock({
  shop, block, customization, isSelected, isEditing,
  onSelect, onUpdate, onDelete, onDuplicate,
  onDoubleClick, onTextBlur, textOpacity = 1, isResizing,
  ratio = 1,        // ← AJOUT avec valeur par défaut
}: Props) {
  const { props } = block;
  const textRef = useRef<HTMLDivElement>(null);
  // ⭐ Ref pour savoir si on est en train d'éditer (évite les syncs DOM intempestives)
  const isEditingRef = useRef(false);

  // ⭐ MODIFICATION : appliquer le ratio pour le scaling
  const rawFontSize = props.fontSize || 32;
  const fontSize = rawFontSize * ratio;   // ← MODIFICATION

  // ⭐ Étape 1 — Ajout des constantes de padding de base
  const BASE_PADDING_Y = 2;
  const BASE_PADDING_X = 4;

  // ⭐ Étape 2 — containerStyle avec padding adaptatif
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: props.textAlign === 'left' ? 'flex-start'
      : props.textAlign === 'right' ? 'flex-end' : 'center',
    // ⭐ Remplacé : padding fixe → padding adaptatif avec ratio
    padding: `${Math.max(1, BASE_PADDING_Y * ratio)}px ${Math.max(2, BASE_PADDING_X * ratio)}px`,
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,  // ← MODIFICATION : utilise fontSize calculé
    fontWeight: props.fontWeight || customization?.headingWeight || '700',
    textAlign: props.textAlign || 'center',
    fontFamily: props.fontFamily || customization?.headingFont || 'Poppins',
    lineHeight: 1.2,
    opacity: textOpacity,
    margin: 0,
    padding: 0,
    width: '100%',
    color: props.textColor || customization?.textColor || '#ffffff',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    overflow: 'visible',
  };

  // ⭐ FIX 1 : Initialiser le DOM une seule fois au montage
  useEffect(() => {
    if (textRef.current && !isEditingRef.current) {
      textRef.current.innerText = props.title || props.content || 'Nouveau titre';
    }
  }, []); // volontairement vide — montage uniquement

  // ⭐ FIX 2 : Sync externe (ex: undo/redo) UNIQUEMENT hors édition
  useEffect(() => {
    if (!isEditingRef.current && textRef.current) {
      const newContent = props.title || props.content || 'Nouveau titre';
      if (textRef.current.innerText !== newContent) {
        textRef.current.innerText = newContent;
      }
    }
  }, [props.title, props.content]);

  // ⭐ FIX 3 : Quand on entre en édition, focus + curseur à la fin
  useEffect(() => {
    if (isEditing && textRef.current) {
      isEditingRef.current = true;
      textRef.current.focus();

      // Placer le curseur à la fin (pas au début !)
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(textRef.current);
      range.collapse(false); // false = fin du contenu
      sel?.removeAllRanges();
      sel?.addRange(range);
    } else if (!isEditing) {
      isEditingRef.current = false;
    }
  }, [isEditing]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // On met à jour le state mais React ne va PAS réécrire le DOM
    // car on ne passe aucun enfant au div contentEditable
    onUpdate({ title: e.currentTarget.innerText });
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    isEditingRef.current = false;
    if (onTextBlur) {
      onTextBlur(newContent);
    } else {
      onUpdate({ title: newContent });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('forceSave'));
      }, 100);
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
          contentEditable={isEditing} // ← isEditing, pas isSelected
          onInput={handleInput}
          onBlur={handleBlur}
          suppressContentEditableWarning
          className="outline-none w-full"
          // ⭐ Pas d'enfant React ici — le DOM est géré manuellement via useEffect
        />
      </div>
    </div>
  );
}