'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BannerSettings {
  type: 'full_width' | 'boxed' | 'hero' | 'split';
  height: number;
  overlayOpacity: number;
  overlayColor: string;
  textPosition: 'left' | 'center' | 'right';
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

interface LogoSettings {
  position: 'left' | 'center' | 'right';
  size: number;
  shape: 'rounded' | 'circle' | 'square';
  border: boolean;
  borderColor: string;
}

interface Props {
  shop: any;
  customization: any;
  filters: any;
  selectedElement: { type: string; id: string; props: any } | null;
  onSelectElement: (element: { type: string; id: string; props: any } | null) => void;
  onUpdateElement: (type: string, id: string, updates: any) => void;
}

// Types de bannières disponibles
const BANNER_TYPES = {
  full_width: 'Pleine largeur',
  boxed: 'Encadrée',
  hero: 'Héros (plein écran)',
  split: 'Split (50/50)',
};

export function FullPageCanvas({ 
  shop, 
  customization, 
  filters, 
  selectedElement,
  onSelectElement,
  onUpdateElement 
}: Props) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Configuration par défaut
  const bannerSettings = customization?.bannerSettings || {
    type: customization?.headerStyle === 'full_banner' ? 'full_width' : 'boxed',
    height: 400,
    overlayOpacity: 0.3,
    overlayColor: '#000000',
    textPosition: 'center',
    title: shop?.name || 'Bienvenue dans notre boutique',
    subtitle: shop?.description || 'Découvrez nos produits',
    buttonText: 'Découvrir',
    buttonLink: `/shop/${shop?.slug}/products`,
  };

  const logoSettings = customization?.logoSettings || {
    position: 'left',
    size: 80,
    shape: 'rounded',
    border: true,
    borderColor: '#ffffff',
  };

  const globalStyle = {
    backgroundColor: customization?.backgroundColor || '#ffffff',
    color: customization?.textColor || '#1F2937',
    fontFamily: customization?.bodyFont || 'Inter',
  };

  // Fonction pour rendre un élément sélectionnable
  const SelectableElement = ({ type, id, props, children, className = '' }: any) => {
    const isSelected = selectedElement?.type === type && selectedElement?.id === id;
    const isHovered = hoveredElement === `${type}-${id}`;

    return (
      <div
        className={`relative group cursor-pointer transition-all ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement({ type, id, props });
        }}
        onMouseEnter={() => setHoveredElement(`${type}-${id}`)}
        onMouseLeave={() => setHoveredElement(null)}
      >
        {(isHovered || isSelected) && (
          <div className="absolute -inset-1 border-2 border-primary rounded-lg pointer-events-none z-10">
            <div className="absolute -top-3 left-2 bg-primary text-white text-xs px-2 py-0.5 rounded">
              {type === 'banner' ? 'Bannière' : 
               type === 'logo' ? 'Logo' :
               type === 'title' ? 'Titre' :
               type === 'button' ? 'Bouton' :
               type === 'product' ? 'Produit' : 'Section'}
            </div>
          </div>
        )}
        {children}
      </div>
    );
  };

  // Rendu de la bannière selon le type
  const renderBanner = () => {
    const banner = () => (
      <div 
        className="relative w-full overflow-hidden"
        style={{ height: bannerSettings.height }}
      >
        {/* Image de fond ou dégradé */}
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
            className="absolute inset-0"
            style={{ backgroundColor: customization?.primaryColor }}
          />
        )}
        
        {/* Overlay */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: bannerSettings.overlayColor,
            opacity: bannerSettings.overlayOpacity / 100
          }}
        />
        
        {/* Texte de la bannière */}
        <div className={`relative z-10 flex flex-col items-${bannerSettings.textPosition === 'center' ? 'center' : 'start'} justify-center h-full px-8`}>
          <h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: customization?.headingFont }}
          >
            {bannerSettings.title}
          </h1>
          <p className="text-xl text-white/90 mb-6 max-w-2xl">
            {bannerSettings.subtitle}
          </p>
          <button
            className="px-6 py-3 rounded-lg text-white font-semibold transition-transform hover:scale-105"
            style={{ backgroundColor: customization?.primaryColor }}
          >
            {bannerSettings.buttonText}
          </button>
        </div>
      </div>
    );

    if (bannerSettings.type === 'boxed') {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            {banner()}
          </div>
        </div>
      );
    }

    return banner();
  };

  // Rendu du logo
  const renderLogo = () => {
    if (!shop?.logoUrl && !shop?.name) return null;

    const logoStyle = {
      width: logoSettings.size,
      height: logoSettings.size,
      borderRadius: logoSettings.shape === 'circle' ? '50%' : 
                    logoSettings.shape === 'rounded' ? '12px' : '0',
      border: logoSettings.border ? `2px solid ${logoSettings.borderColor}` : 'none',
    };

    return (
      <div className={`flex justify-${logoSettings.position}`}>
        {shop?.logoUrl ? (
          <div style={logoStyle} className="overflow-hidden bg-white">
            <Image
              src={shop.logoUrl}
              alt={shop.name}
              width={logoSettings.size}
              height={logoSettings.size}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        ) : (
          <div 
            className="flex items-center justify-center text-white font-bold text-2xl"
            style={{ 
              ...logoStyle,
              backgroundColor: customization?.primaryColor
            }}
          >
            {shop?.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  // Rendu du header
  const renderHeader = () => {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <SelectableElement type="logo" id="logo" props={logoSettings}>
            {renderLogo()}
          </SelectableElement>
          
          <nav className="hidden md:flex gap-6">
            <a href="#" className="hover:opacity-70 transition-opacity">Accueil</a>
            <a href="#" className="hover:opacity-70 transition-opacity">Produits</a>
            <a href="#" className="hover:opacity-70 transition-opacity">Contact</a>
          </nav>
        </div>
      </div>
    );
  };

  // Rendu des sections personnalisées
  const renderSections = () => {
    const sections = customization?.customSections || [];
    return sections.map((section: any) => (
      <SelectableElement 
        key={section.id} 
        type="section" 
        id={String(section.id)} 
        props={section}
        className="py-12"
      >
        <div className="container mx-auto px-4">
          <h2 
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: customization?.headingFont }}
          >
            {section.title}
          </h2>
          <p className="text-gray-600 mb-6">{section.content}</p>
          {section.imageUrl && (
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
              <Image src={section.imageUrl} alt={section.title} fill className="object-cover" unoptimized />
            </div>
          )}
        </div>
      </SelectableElement>
    ));
  };

  // Rendu des produits
  const renderProducts = () => {
    const products = customization?.shopProductCustomizations || [];
    if (products.length === 0) return null;

    return (
      <div className="container mx-auto px-4 py-12">
        <h2 
          className="text-3xl font-bold text-center mb-8"
          style={{ fontFamily: customization?.headingFont }}
        >
          Nos produits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any, index: number) => (
            <SelectableElement
              key={product.productId || index}
              type="product"
              id={`product-${product.productId}`}
              props={product}
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {/* Image placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    🖼️
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">Produit {index + 1}</h3>
                  <p className="text-primary font-bold mt-2">29.99 €</p>
                </div>
              </div>
            </SelectableElement>
          ))}
        </div>
      </div>
    );
  };

  // Rendu des assets personnalisés (stickers, textes déplaçables)
  const renderCustomAssets = () => {
    const assets = customization?.customAssets || [];
    return assets.map((asset: any) => (
      <SelectableElement
        key={asset.id}
        type="asset"
        id={String(asset.id)}
        props={asset}
      >
        <div
          className="absolute"
          style={{
            left: asset.posX,
            top: asset.posY,
            width: asset.width,
            height: asset.height,
            transform: `rotate(${asset.rotation || 0}deg)`,
            zIndex: asset.zIndex || 10,
          }}
        >
          {asset.type === 'text' ? (
            <div
              className="p-2"
              style={{
                fontFamily: asset.fontFamily,
                fontSize: asset.fontSize,
                color: asset.textColor,
                textAlign: asset.textAlign,
                backgroundColor: asset.backgroundColor,
              }}
            >
              {asset.content || asset.name}
            </div>
          ) : asset.type === 'image' ? (
            <div className="relative w-full h-full">
              <Image src={asset.url} alt={asset.name} fill className="object-contain" unoptimized />
            </div>
          ) : (
            <div 
              className="w-full h-full"
              style={{ backgroundColor: asset.backgroundColor, borderRadius: '8px' }}
            />
          )}
        </div>
      </SelectableElement>
    ));
  };

  // Appliquer les filtres globaux
  const filterStyle = customization?.filtersEnabled ? {
    filter: `
      brightness(${filters?.globalBrightness || 1}) 
      contrast(${filters?.globalContrast || 1}) 
      saturate(${filters?.globalSaturation || 1})
    `,
  } : {};

  return (
    <div 
      className="min-h-screen relative"
      style={{ ...globalStyle, ...filterStyle }}
      onClick={() => onSelectElement(null)}
    >
      {/* Bannière sélectionnable */}
      <SelectableElement type="banner" id="banner" props={bannerSettings}>
        {renderBanner()}
      </SelectableElement>

      {/* Header avec logo */}
      {renderHeader()}

      {/* Sections personnalisées */}
      {renderSections()}

      {/* Produits */}
      {renderProducts()}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} {shop?.name}. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Assets déplaçables */}
      {renderCustomAssets()}
    </div>
  );
}