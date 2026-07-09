'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/services/utils/formatters';
import { FiTrendingUp } from 'react-icons/fi';
import { TopProduct } from '@/types';

// ⭐ MODIFICATION — Interface avec title et emptyMessage optionnels
interface TopProductsProps {
  products: TopProduct[];
  title?: string;
  emptyMessage?: string;
}

// ⭐ MODIFICATION — Props avec valeurs par défaut
const TopProducts = ({
  products = [],
  title = 'Produits les plus vendus',
  emptyMessage = 'Aucun produit vendu',
}: TopProductsProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* ⭐ MODIFICATION — Titre dynamique */}
      <div className="p-6 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {products.map((product, index) => {
          // ⭐ MODIFICATION — Utilisation de productId
          const productKey = product.productId || `product-${index}`;
          const altText = product.productName && product.productName.trim() 
            ? product.productName 
            : 'Produit image';

          return (
            <div key={productKey} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-4">
                {/* Rang */}
                <div className="w-8 text-center">
                  {index === 0 && <FiTrendingUp className="text-green-500" size={20} />}
                  {index > 0 && (
                    <span className="text-lg font-bold text-gray-400 dark:text-gray-500">#{index + 1}</span>
                  )}
                </div>

                {/* ⭐ MODIFICATION — Utilisation de productImage et productId */}
                <Link href={`/product/${product.productId}`} className="flex-shrink-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={product.productImage || '/images/product-placeholder.svg'}
                      alt={altText}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                </Link>

                {/* ⭐ MODIFICATION — Utilisation de productName et quantitySold */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/product/${product.productId}`}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1"
                  >
                    {product.productName}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.quantitySold} vendu{product.quantitySold > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Revenu */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {formatPrice(product.revenue)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPrice(product.price)}/unité
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopProducts;