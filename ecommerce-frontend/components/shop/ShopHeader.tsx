'use client';

import Image from 'next/image';
import { FiShare2, FiHeart, FiFlag, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { Shop } from '@/types/shop';
import { formatNumber } from '@/services/utils/formatters';

interface ShopHeaderProps {
  shop: Shop;
  isOwner?: boolean;
}

const ShopHeader = ({ shop, isOwner = false }: ShopHeaderProps) => {
  return (
    <div className="relative">
      {/* Bannière */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
        {shop.bannerUrl ? (
          <Image
            src={shop.bannerUrl}
            alt={shop.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/50 to-secondary" />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Informations */}
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20 mb-8">
          {/* Logo */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white">
            {shop.logoUrl ? (
              <Image
                src={shop.logoUrl}
                alt={shop.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {shop.name.charAt(0)}
                </span>
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
              <div>
                <span className="font-semibold">2.5k</span>
                <span className="text-gray-300 ml-1">ventes</span>
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
              <a
                href={`/dashboard/seller/shops/${shop.id}`}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors font-semibold"
              >
                Gérer
              </a>
            )}
          </div>
        </div>

        {/* Informations de contact */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Informations boutique</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shop.email && (
              <div className="flex items-center gap-3 text-gray-600">
                <FiMail className="text-primary" />
                <a href={`mailto:${shop.email}`} className="hover:text-primary">
                  {shop.email}
                </a>
              </div>
            )}
            {shop.phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <FiPhone className="text-primary" />
                <a href={`tel:${shop.phone}`} className="hover:text-primary">
                  {shop.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <FiMapPin className="text-primary" />
              <span>France (par défaut)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;