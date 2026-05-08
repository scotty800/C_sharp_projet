'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import DraggableElement from '../draggable/DraggableElement';
import type { ElementType } from '../properties/ElementProperties';

interface Props {
  shop: any;
  customization: any;
  filters: any;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onSelectElement: (element: { type: ElementType; props: any } | null) => void;
}

const PREVIEW_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function LivePreview({ shop, customization, filters, previewMode, onSelectElement }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [filterStyle, setFilterStyle] = useState<string>('');

  // Construction du style CSS dynamique
  useEffect(() => {
    let cssFilter = filters?.globalCssFilter || 'none';
    
    if (filters?.globalBrightness) {
      cssFilter = `brightness(${filters.globalBrightness}) ${cssFilter === 'none' ? '' : cssFilter}`;
    }
    if (filters?.globalContrast) {
      cssFilter = `contrast(${filters.globalContrast}) ${cssFilter}`;
    }
    if (filters?.globalSaturation) {
      cssFilter = `saturate(${filters.globalSaturation}) ${cssFilter}`;
    }
    
    setFilterStyle(cssFilter);
  }, [filters]);

  const previewStyles = {
    backgroundColor: customization?.backgroundColor || '#ffffff',
    color: customization?.textColor || '#1F2937',
    fontFamily: customization?.bodyFont || 'Inter',
    filter: filterStyle,
  };

  const buttonStyles = {
    backgroundColor: customization?.primaryColor || '#2563EB',
    color: '#ffffff',
    fontFamily: customization?.primaryFont || 'Inter',
  };

  const headingStyles = {
    fontFamily: customization?.headingFont || 'Poppins',
    fontSize: customization?.headingSizeH1 || 48,
    textShadow: customization?.textShadow,
    background: customization?.textGradient,
    WebkitBackgroundClip: customization?.textGradient ? 'text' as const : undefined,
    WebkitTextFillColor: customization?.textGradient ? 'transparent' : undefined,
  };

  return (
    <div 
      ref={canvasRef}
      className="mx-auto transition-all duration-300"
      style={{ width: PREVIEW_WIDTHS[previewMode] }}
    >
      <div 
        className="rounded-xl shadow-2xl overflow-hidden"
        style={previewStyles}
      >
        {/* Bannière */}
        <div className="relative h-64 w-full bg-gray-200">
          {shop?.bannerUrl ? (
            <Image
              src={shop.bannerUrl}
              alt="Bannière"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div 
              className="w-full h-full"
              style={{ backgroundColor: customization?.primaryColor, opacity: 0.3 }}
            />
          )}
        </div>

        {/* Header avec logo */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 -mt-16 mb-6">
            <div 
              className="relative w-24 h-24 rounded-xl overflow-hidden border-4 border-white shadow-lg cursor-pointer"
              onClick={() => onSelectElement({ type: 'logo', props: shop })}
            >
              {shop?.logoUrl ? (
                <Image
                  src={shop.logoUrl}
                  alt={shop?.name || 'Boutique'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                  style={{ backgroundColor: customization?.primaryColor }}
                >
                  {shop?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              )}
            </div>
            <div>
              <h1 
                className="text-3xl font-bold cursor-pointer"
                style={headingStyles}
                onClick={() => onSelectElement({ type: 'title', props: shop })}
              >
                {shop?.name || 'Ma boutique'}
              </h1>
              <p className="text-gray-600 mt-1">{shop?.description}</p>
            </div>
          </div>

          {/* Bouton principal */}
          <button
            className="px-6 py-3 rounded-lg transition-transform hover:scale-105"
            style={buttonStyles}
            onClick={() => onSelectElement({ type: 'button', props: { label: 'Acheter maintenant' } })}
          >
            Commencer vos achats
          </button>
        </div>

        {/* Sections personnalisées */}
        {customization?.customSections?.map((section: any) => (
          <div 
            key={section.id}
            className="p-8 border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ backgroundColor: section.backgroundColor }}
            onClick={() => onSelectElement({ type: 'section', props: section })}
          >
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: customization?.headingFont }}
            >
              {section.title}
            </h2>
            <p className="text-gray-600">{section.content}</p>
            {section.imageUrl && (
              <div className="mt-4 relative h-48 w-full rounded-lg overflow-hidden">
                <Image src={section.imageUrl} alt={section.title} fill className="object-cover" unoptimized />
              </div>
            )}
          </div>
        ))}

        {/* Éléments déplaçables (CustomAssets) */}
        {customization?.customAssets?.map((asset: any) => (
          <DraggableElement
            key={asset.id}
            asset={asset}
            onSelect={() => onSelectElement({ type: 'asset', props: asset })}
            onUpdate={(updates: Record<string, any>) => {
              console.log('Update asset:', updates);
            }}
          />
        ))}
      </div>
    </div>
  );
}