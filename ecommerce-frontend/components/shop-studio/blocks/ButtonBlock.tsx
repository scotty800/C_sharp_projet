'use client';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number; // ⭐ AJOUTÉ
}

export function ButtonBlock({ block, customization, isSelected, onSelect, onUpdate, textOpacity = 1 }: Props) {
  const { props } = block;

  // ⭐ STYLE SIMPLIFIÉ - uniquement à partir des props du bloc
  const buttonStyle: React.CSSProperties = {
    backgroundColor: props?.backgroundColor || '#2563EB',
    fontFamily: props?.fontFamily || 'Inter',
    fontSize: `${props?.fontSize || 16}px`,
    fontWeight: props?.fontWeight || '600',
    borderRadius: props?.borderRadius || 8,
    paddingLeft: props?.paddingX || 20,
    paddingRight: props?.paddingX || 20,
    paddingTop: props?.paddingY || 10,
    paddingBottom: props?.paddingY || 10,
    border: props?.border || 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    height: '100%',
    opacity: textOpacity, // ⭐ Application de l'opacité
  };

  // ⭐ Appliquer le dégradé sur le texte si présent (prioritaire)
  const isGradient = props?.textGradient && props?.textGradient !== '';
  
  if (isGradient) {
    buttonStyle.backgroundImage = props.textGradient;
    buttonStyle.backgroundClip = 'text';
    buttonStyle.WebkitBackgroundClip = 'text';
    buttonStyle.color = 'transparent';
  } else {
    buttonStyle.color = props?.textColor || '#FFFFFF';
  }

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    onUpdate({ text: e.currentTarget.innerText });
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
      className={`relative w-full h-full cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onSelect}
    >
      <button
        style={buttonStyle}
        contentEditable={isSelected}
        onBlur={handleBlur}
        suppressContentEditableWarning
        className="w-full h-full"
      >
        {props?.text || 'Cliquez ici'}
      </button>

      {/* Label de sélection */}
      {isSelected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap">
          Bouton{getGradientLabel()}{getOpacityLabel()}
        </div>
      )}
    </div>
  );
}