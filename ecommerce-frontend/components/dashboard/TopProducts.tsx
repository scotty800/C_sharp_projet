'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatPrice } from '@/services/utils/formatters';
import { FiTrendingUp, FiEye } from 'react-icons/fi';

interface TopProductsProps {
  products: (Product & { sales: number; revenue: number })[];
}

const TopProducts = ({ products = [] }: TopProductsProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Aucun produit vendu</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Produits les plus vendus</h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {products.map((product, index) => {
          // ✅ CLÉ UNIQUE : Utilisation de l'ID du produit avec fallback
          const productKey = product.id || `product-${index}`;
          // ✅ TEXTE ALTERNATIF : Validation pour éviter les alt vides
          const altText = product.name && product.name.trim() ? product.name : 'Produit image';

          return (
            <div key={productKey} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-4">
                {/* Rang (l'index est utilisé pour l'affichage, PAS pour la clé) */}
                <div className="w-8 text-center">
                  {index === 0 && <FiTrendingUp className="text-green-500" size={20} />}
                  {index > 0 && (
                    <span className="text-lg font-bold text-gray-400 dark:text-gray-500">#{index + 1}</span>
                  )}
                </div>

                {/* Image avec attribut ALT validé */}
                <Link href={`/product/${product.id}`} className="flex-shrink-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={product.imageUrl || '/images/product-placeholder.svg'}
                      alt={altText}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                </Link>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/product/${product.id}`}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.sales} ventes
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

                {/* Actions */}
                <Link
                  href={`/dashboard/seller/products/${product.id}`}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors"
                >
                  <FiEye size={18} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopProducts;