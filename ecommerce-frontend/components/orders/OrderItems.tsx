'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiStar } from 'react-icons/fi';
import { OrderItemDto } from '@/types/order';
import { formatPrice } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';

interface OrderItemsProps {
  items: OrderItemDto[];
  showReviews?: boolean;
}

const OrderItems = ({ items, showReviews = false }: OrderItemsProps) => {
  // Fonction pour obtenir l'URL de l'image
  const getProductImageUrl = (item: OrderItemDto) => {
    if (item.productImage) {
      return getImageUrl(item.productImage);
    }
    return '/images/product-placeholder.svg';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Articles commandés</h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item) => (
          <div key={item.id} className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Image */}
              <Link href={`/product/${item.productId}`} className="sm:w-24 flex-shrink-0">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={getProductImageUrl(item)}
                    alt={item.productName}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                    unoptimized
                  />
                </div>
              </Link>

              {/* Infos */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <Link 
                      href={`/product/${item.productId}`}
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors"
                    >
                      {item.productName}
                    </Link>
                    
                    {item.shopName && (
                      <Link 
                        href={`/shop/${item.shopId}`}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary block mt-1"
                      >
                        Vendu par {item.shopName}
                      </Link>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {formatPrice(item.totalPrice)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatPrice(item.unitPrice)} x {item.quantity}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/product/${item.productId}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Voir le produit
                  </Link>

                  {showReviews && !item.isReviewed && (
                    <button className="flex items-center gap-1 text-sm bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors">
                      <FiStar size={14} />
                      Écrire un avis
                    </button>
                  )}

                  {showReviews && item.isReviewed && (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <FiStar className="fill-current" size={14} />
                      Avis laissé
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItems;