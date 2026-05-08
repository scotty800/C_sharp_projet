'use client';

import Image from 'next/image';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}

export function LogoBlock({ shop, block, customization, isSelected, onSelect, onUpdate }: Props) {
  const { props } = block;

  // ⭐ STYLE DU CONTENEUR PRINCIPAL - prend toute la place
  const containerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: props.position === 'left' ? 'flex-start' : props.position === 'center' ? 'center' : 'flex-end',
    padding: '0.5rem',
  };

  // ⭐ STYLE DU LOGO - s'adapte à la taille du conteneur
  const logoStyle = {
    width: `${props.size || 80}px`,
    height: `${props.size || 80}px`,
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const,
    borderRadius: props.shape === 'circle' ? '50%' : props.shape === 'rounded' ? '12px' : '0',
    cursor: 'pointer',
  };

  return (
    <div
      className={`relative w-full h-full transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onSelect}
    >
      <div style={containerStyle}>
        {shop?.logoUrl ? (
          <div style={logoStyle} className="overflow-hidden bg-white shadow-sm">
            <Image
              src={shop.logoUrl}
              alt={shop.name}
              width={props.size || 80}
              height={props.size || 80}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="flex items-center justify-center text-white font-bold text-2xl shadow-sm"
            style={{ ...logoStyle, backgroundColor: customization?.primaryColor || '#2563EB' }}
          >
            {shop?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
        )}
      </div>
    </div>
  );
}