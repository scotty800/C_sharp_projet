'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { FiUpload } from 'react-icons/fi';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onUploadLogo?: (file: File) => Promise<void>;
}

export function LogoBlock({ shop, block, customization, isSelected, onSelect, onUploadLogo }: Props) {
  const { props } = block;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: props.shape === 'circle' ? '50%' : props.shape === 'rounded' ? '12px' : '0',
    // ⭐ Plus de fond forcé ici — transparent par défaut
  };

  const logoStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: props.objectFit || 'contain',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadLogo) return;
    setUploading(true);
    try {
      await onUploadLogo(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`relative w-full h-full transition-all group ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onSelect}
    >
      <div style={containerStyle}>
        {shop?.logoUrl ? (
          <Image
            key={shop.logoUrl} // ⭐ AJOUT — force le re-render au changement d'URL
            src={shop.logoUrl}
            alt={shop.name}
            width={400}
            height={400}
            style={logoStyle}
            className="w-full h-full"
            unoptimized
          />
        ) : (
          <div
            className="flex items-center justify-center text-white font-bold w-full h-full text-2xl shadow-sm" // ⭐ shadow déplacé ici
            style={{ backgroundColor: customization?.primaryColor || '#2563EB' }}
          >
            {shop?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
        )}

        {onUploadLogo && (
          <div
            className="absolute inset-0 bg-black/0 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : (
              <FiUpload size={20} className="text-white" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}