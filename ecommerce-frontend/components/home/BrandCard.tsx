// components/home/BrandCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Shop } from '@/types/shop';

interface BrandCardProps {
  shop: Shop;
  variant?: 'default' | 'trending' | 'new';
  showTrend?: boolean;
  trendValue?: string;
}

const BrandCard = ({ shop, variant = 'default', showTrend = false, trendValue = '+245%' }: BrandCardProps) => {
  // Couleurs de fond style NOVERA (comme sur l'image)
  const getBgGradient = (name: string) => {
    const gradients = [
      'bg-gradient-to-br from-gray-900 to-gray-700',
      'bg-gradient-to-br from-amber-900 to-amber-700',
      'bg-gradient-to-br from-emerald-900 to-emerald-700',
      'bg-gradient-to-br from-indigo-900 to-indigo-700',
      'bg-gradient-to-br from-rose-900 to-rose-700',
      'bg-gradient-to-br from-purple-900 to-purple-700',
      'bg-gradient-to-br from-blue-900 to-blue-700',
      'bg-gradient-to-br from-pink-900 to-pink-700',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  return (
    <div className="flex-shrink-0 w-48 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Banner avec dégradé de couleur */}
      <div className={`${getBgGradient(shop.name)} h-32 flex flex-col items-center justify-center relative`}>
        {/* Logo ou nom */}
        {shop.logoUrl ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/50">
            <Image src={shop.logoUrl} alt={shop.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="text-white text-center">
            <div className="text-2xl font-bold tracking-tight">{shop.name.substring(0, 2).toUpperCase()}</div>
          </div>
        )}

        {/* Badge NEW */}
        {variant === 'new' && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
              NEW
            </span>
          </div>
        )}

        {/* Badge TRENDING avec pourcentage */}
        {showTrend && (
          <div className="absolute top-2 right-2">
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {trendValue}
            </span>
          </div>
        )}
      </div>

      {/* Informations de la boutique */}
      <div className="p-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 truncate">
          {shop.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {shop.products?.[0]?.category || 'Streetwear'}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-2">
          @{shop.slug || shop.name.toLowerCase().replace(/\s/g, '')}
        </p>
        
        {/* Bouton Follow */}
        <button className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium py-1.5 rounded-lg transition-colors">
          Follow
        </button>
      </div>

      {/* Lien vers la boutique */}
      <Link href={`/shop/${shop.slug}`} className="absolute inset-0 z-10" aria-label={`Voir ${shop.name}`} />
    </div>
  );
};

export default BrandCard;