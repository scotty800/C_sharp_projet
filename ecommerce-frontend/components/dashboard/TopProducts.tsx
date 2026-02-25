'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatPrice } from '@/services/utils/formatters';
import { FiTrendingUp, FiEye } from 'react-icons/fi';

interface TopProductsProps {
  products: (Product & { sales: number; revenue: number })[];
}

const TopProducts = ({ products }: TopProductsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Produits les plus vendus</h3>
      </div>

      <div className="divide-y">
        {products.map((product, index) => (
          <div key={product.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center gap-4">
              {/* Rang */}
              <div className="w-8 text-center">
                {index === 0 && <FiTrendingUp className="text-green-500" size={20} />}
                {index > 0 && (
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                )}
              </div>

              {/* Image */}
              <Link href={`/product/${product.id}`} className="flex-shrink-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image
                    src={product.imageUrl || '/images/product-placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/product/${product.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-primary transition-colors line-clamp-1"
                >
                  {product.name}
                </Link>
                <p className="text-sm text-gray-500">
                  {product.sales} ventes
                </p>
              </div>

              {/* Revenu */}
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">
                  {formatPrice(product.revenue)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatPrice(product.price)}/unité
                </p>
              </div>

              {/* Actions */}
              <Link
                href={`/dashboard/seller/products/${product.id}`}
                className="p-2 text-gray-400 hover:text-primary transition-colors"
              >
                <FiEye size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune vente pour le moment</p>
        </div>
      )}
    </div>
  );
};

export default TopProducts;