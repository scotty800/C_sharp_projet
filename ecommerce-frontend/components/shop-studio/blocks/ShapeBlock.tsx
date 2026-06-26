'use client';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  ratio?: number; // ⭐ AJOUT : ratio de scaling pour la boutique
}

export function ShapeBlock({ block, customization, isSelected, onSelect, onUpdate, ratio = 1 }: Props) {
  const { props, position } = block;
  const shape = props.shape || 'square';
  
  // ⭐ Appliquer le ratio aux dimensions
  const rawWidth = position.width || 100;
  const rawHeight = position.height || 100;
  const rotation = position.rotation || 0;

  // ⭐ STYLE UNIFIÉ AVEC SCALING
  const shapeStyle = (() => {
    const hasGradient = props.backgroundType === 'gradient' && props.backgroundValue;
    const bgColor = hasGradient ? props.backgroundValue : (props.backgroundColor || '#2563EB');
    const borderRadius = props.borderRadius || 0;
    const opacity = props.opacity !== undefined ? props.opacity / 100 : 1;

    // ⭐ Appliquer le ratio aux dimensions
    const w = typeof rawWidth === 'number' ? rawWidth * ratio : rawWidth;
    const h = typeof rawHeight === 'number' ? rawHeight * ratio : rawHeight;

    // Base commune
    const base = {
      transform: `rotate(${rotation}deg)`,
      transformOrigin: 'center',
      transition: 'all 0.2s ease',
      opacity,
      flexShrink: 0,
    };

    // Triangle
    if (shape === 'triangle') {
      const wNum = typeof w === 'number' ? w : 100;
      const hNum = typeof h === 'number' ? h : 100;
      return {
        ...base,
        width: 0,
        height: 0,
        borderLeft: `${wNum / 2}px solid transparent`,
        borderRight: `${wNum / 2}px solid transparent`,
        borderBottom: `${hNum}px solid ${bgColor}`,
        background: 'transparent',
      };
    }

    // Étoile
    if (shape === 'star') {
      return {
        ...base,
        width: typeof w === 'number' ? w : '100%',
        height: typeof h === 'number' ? h : '100%',
        background: bgColor,
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      };
    }

    // Cercle
    if (shape === 'circle') {
      const size = Math.min(
        typeof w === 'number' ? w : 100,
        typeof h === 'number' ? h : 100
      );
      return {
        ...base,
        width: size,
        height: size,
        background: bgColor,
        borderRadius: '50%',
      };
    }

    // Carré / Rectangle (avec arrondi éventuel)
    return {
      ...base,
      width: typeof w === 'number' ? w : '100%',
      height: typeof h === 'number' ? h : '100%',
      background: bgColor,
      borderRadius: typeof borderRadius === 'number' ? borderRadius * ratio : borderRadius,
    };
  })();

  // ⭐ Détecter si le bloc est en position relative (enfant)
  const isRelative = position.positionType === 'relative' || block.parentId;

  return (
    <div
      className={`w-full h-full flex items-center justify-center ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
      }`}
      onClick={onSelect}
      style={{
        position: isRelative ? 'relative' : 'absolute',
        inset: isRelative ? 0 : undefined,
        overflow: 'visible',
        pointerEvents: 'auto',
      }}
    >
      <div 
        style={shapeStyle} 
        className="cursor-move"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}