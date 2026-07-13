'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { OrderItemDto } from '@/types/order';
import { formatPrice } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';
import { useProductCardIdentity } from '@/hooks/useProductCardIdentity';
import { resolveProductDisplay, getResolvedImages } from '@/components/shop-studio/lib/resolveProductDisplay';

interface OrderProductViewModalProps {
  item: OrderItemDto | null;
  product: any | null; // produit complet déjà chargé côté page, ou null
  isOpen: boolean;
  onClose: () => void;
}

const OrderProductViewModal = ({ item, product, isOpen, onClose }: OrderProductViewModalProps) => {
  const identity = useProductCardIdentity(item?.shopId, item?.productId ?? 0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  if (!isOpen || !item) return null;

  const mutedColor = identity.mutedTextColor || identity.textColor + '80';

  const display = product
    ? resolveProductDisplay(
        { ...product, isInStock: (product.stock ?? 0) > 0 } as any,
        item.selectedColor
      )
    : {
        name: item.productName,
        stock: 0,
        sizes: [],
        imageUrl1: item.productImage,
        imageUrl2: null,
        imageUrl3: null,
        variant: undefined,
      };

  const images = product
    ? getResolvedImages(display)
    : ([item.productImage].filter(Boolean) as string[]);
  const currentImage = images[activeImageIndex] || images[0];
  const imageUrl = imgError || !currentImage
    ? '/images/product-placeholder.svg'
    : getImageUrl(currentImage);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        className="relative w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 overflow-hidden"
        style={{
          backgroundColor: identity.panelColor,
          borderRadius: `${identity.borderRadius}px`,
          boxShadow: identity.boxShadow,
          border: identity.source === 'product-page' ? `1px solid ${identity.borderColor}` : '1px solid #eeeeee',
        }}
      >
        <div className="relative aspect-square sm:aspect-auto bg-gray-100 dark:bg-gray-800 min-h-[280px]">
          <Image
            src={imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIndex((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
                aria-label="Image précédente"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={() => setActiveImageIndex((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
                aria-label="Image suivante"
              >
                <FiChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        <div className="p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2
                className="text-xl leading-tight"
                style={{ fontFamily: identity.fontFamily, fontWeight: identity.headingWeight, color: identity.textColor }}
              >
                {item.productName}
              </h2>
              {item.shopName && (
                <p className="text-sm mt-1" style={{ color: mutedColor }}>{item.shopName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
              style={{ color: identity.textColor }}
              aria-label="Fermer"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="text-2xl font-bold mb-6" style={{ color: identity.textColor }}>
            {formatPrice(item.unitPrice)}
          </div>

          {/* ⭐ Variante achetée — affichage lecture seule, jamais modifiable */}
          {(item.selectedSize || item.selectedColor) && (
            <div className="mb-6 space-y-2">
              {item.selectedSize && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide block mb-1" style={{ color: mutedColor }}>
                    Taille achetée
                  </span>
                  <span
                    className="inline-block px-3 py-1.5 text-sm border rounded-lg"
                    style={{ borderColor: identity.textColor, color: identity.textColor, fontWeight: 600 }}
                  >
                    {item.selectedSize}
                  </span>
                </div>
              )}
              {item.selectedColor && (
                <p className="text-sm" style={{ color: mutedColor }}>
                  Couleur : {item.selectedColor}
                </p>
              )}
            </div>
          )}

          <p className="text-sm mb-6" style={{ color: mutedColor }}>
            Quantité commandée : {item.quantity}
          </p>

          <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${identity.borderColor}` }}>
            {item.shopSlug && (
              <Link
                href={`/shop/${item.shopSlug}?product=${item.productId}`}
                onClick={onClose}
                className="block text-sm font-medium underline text-center hover:opacity-70 transition-opacity"
                style={{ color: identity.textColor }}
              >
                Voir le produit en entier
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderProductViewModal;