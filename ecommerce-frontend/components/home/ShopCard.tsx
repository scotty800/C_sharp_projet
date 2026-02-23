'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { Shop } from '@/types/shop';

interface ShopCardProps {
  shop: Shop;
  index?: number;
}

const ShopCard = ({ shop, index = 0 }: ShopCardProps) => {
  const delay = index * 0.1; // Animation delay based on index

  return (
    <div
      className="shop-card group"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Image de fond */}
      {shop.bannerUrl ? (
        <Image
          src={shop.bannerUrl}
          alt={shop.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/50 to-secondary" />
      )}

      {/* Overlay avec dégradé */}
      <div className="shop-card-overlay">
        {/* Logo de la boutique */}
        {shop.logoUrl && (
          <div className="absolute top-4 left-4 w-12 h-12 rounded-full overflow-hidden border-2 border-white">
            <Image
              src={shop.logoUrl}
              alt={shop.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Informations */}
        <div className="transform transition-transform duration-300 group-hover:translate-y-[-8px]">
          <h3 className="text-white font-bold text-lg mb-1">{shop.name}</h3>
          <p className="text-gray-300 text-sm mb-2 line-clamp-2">
            {shop.description || 'Aucune description'}
          </p>
          
          {/* Catégorie (à adapter selon tes données) */}
          <span className="inline-block bg-primary/80 text-white text-xs px-2 py-1 rounded-full mb-2">
            {shop.products?.[0]?.category || 'Général'}
          </span>

          {/* Statistiques */}
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <FiShoppingBag size={14} />
              {shop.productCount} produits
            </span>
          </div>
        </div>

        {/* Bouton favoris (hover) */}
        <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FiHeart className="text-white hover:text-primary transition-colors" size={20} />
        </button>

        {/* Lien vers la boutique */}
        <Link
          href={`/shop/${shop.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`Voir la boutique ${shop.name}`}
        />
      </div>
    </div>
  );
};

export default ShopCard;