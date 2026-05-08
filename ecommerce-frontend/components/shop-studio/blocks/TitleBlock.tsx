'use client';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number;
}

export function TitleBlock({ shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1 }: Props) {
  const { props } = block;
  const level = props.level || 'h2';

  // ⭐ Style avec opacité et userSelect conditionnel
  const titleStyle: React.CSSProperties = {
    fontSize: props.fontSize ? `${props.fontSize}px` : 
               level === 'h1' ? '48px' : 
               level === 'h2' ? '36px' : 
               level === 'h3' ? '28px' : '24px',
    fontWeight: props.fontWeight || '700',
    textAlign: props.textAlign || 'center',
    marginBottom: '1rem',
    fontFamily: props.fontFamily || 'Poppins',
    lineHeight: 1.2,
    opacity: textOpacity,
    userSelect: isSelected ? 'text' : 'none',
    WebkitUserSelect: isSelected ? 'text' : 'none',
  };

  const isGradient = props?.textGradient && props?.textGradient !== '';
  
  if (isGradient) {
    titleStyle.backgroundImage = props.textGradient;
    titleStyle.backgroundClip = 'text';
    titleStyle.WebkitBackgroundClip = 'text';
    titleStyle.color = 'transparent';
  } else {
    titleStyle.color = props.textColor || '#000000';
  }

  // ⭐ SOLUTION: utiliser `any` pour éviter les conflits de types
  const handleBlur = (e: any) => {
    onUpdate({ title: e.currentTarget.innerText });
  };

  const Tag = level as keyof JSX.IntrinsicElements;

  return (
    <div
      className={`relative w-full h-full cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="w-full h-full flex items-center justify-center p-4">
        <Tag
          style={titleStyle}
          contentEditable={isSelected}
          onBlur={handleBlur}
          suppressContentEditableWarning
          className="w-full outline-none"
        >
          {props.title || 'Nouveau titre'}
        </Tag>
      </div>

      {isSelected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap">
          Titre - {level.toUpperCase()} {isGradient ? '(Dégradé)' : ''} {textOpacity !== 1 ? `(Opacité: ${Math.round(textOpacity * 100)}%)` : ''}
        </div>
      )}
    </div>
  );
}