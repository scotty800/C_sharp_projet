'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiShare2, FiHeart, FiMail, FiPhone, FiMapPin, FiSettings } from 'react-icons/fi';
import { Shop } from '@/types/shop';
import { formatNumber } from '@/services/utils/formatters';
import { useState } from 'react';

interface ShopHeaderProps {
  shop: Shop;
  isOwner?: boolean;
}

const ShopHeader = ({ shop, isOwner = false }: ShopHeaderProps) => {
  const [logoError, setLogoError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  // Construire l'URL complète pour les images
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Si l'URL est relative, utiliser l'API_URL ou localhost
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:5019';
    return `${baseUrl}${url}`;
  };

  const bannerUrl = getImageUrl(shop.bannerUrl);
  const logoUrl = getImageUrl(shop.logoUrl);

  return (
    <div className="relative">
      {/* Bannière */}
      <div 
        className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden"
        style={{ backgroundColor: shop.backgroundColor || '#f3f4f6' }}
      >
        {bannerUrl && !bannerError ? (
          <Image
            src={bannerUrl}
            alt={shop.name}
            fill
            className="object-cover"
            priority
            onError={() => setBannerError(true)}
            unoptimized // Important pour les images uploadées
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{ backgroundColor: shop.themeColor || '#e50914', opacity: 0.3 }}
          />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Informations */}
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20 mb-8">
          {/* Logo */}
          <div 
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg"
            style={{ backgroundColor: shop.backgroundColor || '#ffffff' }}
          >
            {logoUrl && !logoError ? (
              <Image
                src={logoUrl}
                alt={shop.name}
                fill
                className="object-cover"
                onError={() => setLogoError(true)}
                unoptimized // Important pour les images uploadées
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-3xl font-bold"
                style={{ 
                  backgroundColor: shop.themeColor || '#e50914',
                  color: '#ffffff'
                }}
              >
                {shop.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Infos boutique */}
          <div className="flex-1 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{shop.name}</h1>
            <p className="text-gray-200 mb-4 max-w-2xl">{shop.description}</p>
            
            {/* Statistiques */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-semibold">{formatNumber(shop.productCount)}</span>
                <span className="text-gray-300 ml-1">produits</span>
              </div>
              <div>
                <span className="font-semibold">4.8</span>
                <span className="text-gray-300 ml-1">note moyenne</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
              <FiHeart />
              <span className="hidden sm:inline">Favoris</span>
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
              <FiShare2 />
              <span className="hidden sm:inline">Partager</span>
            </button>
            {isOwner && (
              <Link
                href={`/shop/customize/${shop.id}`}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
              >
                <FiSettings />
                <span className="hidden sm:inline">Personnaliser</span>
              </Link>
            )}
          </div>
        </div>

        {/* Informations de contact */}
        <div 
          className="rounded-lg shadow-md p-6 mb-8"
          style={{ 
            backgroundColor: shop.backgroundColor || '#ffffff',
            color: shop.textColor || '#000000'
          }}
        >
          <h2 className="text-lg font-semibold mb-4">Informations boutique</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shop.email && (
              <div className="flex items-center gap-3">
                <FiMail style={{ color: shop.themeColor || '#e50914' }} />
                <a href={`mailto:${shop.email}`} className="hover:underline">
                  {shop.email}
                </a>
              </div>
            )}
            {shop.phone && (
              <div className="flex items-center gap-3">
                <FiPhone style={{ color: shop.themeColor || '#e50914' }} />
                <a href={`tel:${shop.phone}`} className="hover:underline">
                  {shop.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3">
              <FiMapPin style={{ color: shop.themeColor || '#e50914' }} />
              <span>France</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;