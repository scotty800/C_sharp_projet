'use client';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}

export function ShapeBlock({ block, customization, isSelected, onSelect, onUpdate }: Props) {
  const { props, position } = block;
  const shape = props.shape || 'square';
  const width = position.width || 100;
  const height = position.height || 100;
  const rotation = position.rotation || 0;

  // ⭐ STYLE UNIFIÉ AVEC SUPPORT DES DÉGRADÉS
  const shapeStyle = (() => {
    const hasGradient = props.backgroundType === 'gradient' && props.backgroundValue;
    const bgColor = hasGradient ? props.backgroundValue : (props.backgroundColor || '#2563EB');
    
    // Triangle (cas particulier)
    if (shape === 'triangle') {
      return {
        width: 0,
        height: 0,
        borderLeft: `${width / 2}px solid transparent`,
        borderRight: `${width / 2}px solid transparent`,
        borderBottom: `${height}px solid ${bgColor}`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
      };
    }

    // Étoile (cas particulier)
    if (shape === 'star') {
      return {
        width,
        height,
        background: bgColor,
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        transition: 'all 0.2s ease',
      };
    }

    // Carré, rectangle arrondi, cercle
    return {
      width,
      height,
      background: bgColor,
      borderRadius: shape === 'circle' ? '50%' : (props.borderRadius || 0),
      transform: `rotate(${rotation}deg)`,
      transformOrigin: 'center',
      transition: 'all 0.2s ease',
    };
  })();

  return (
    <div
      className={`w-full h-full flex items-center justify-center ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
      }`}
      onClick={onSelect}
    >
      <div style={shapeStyle} className="cursor-move" />
    </div>
  );
}