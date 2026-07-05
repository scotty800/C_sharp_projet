'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { CartItem as CartItemType } from '@/types/cart';
import { StudioProduct } from '@/types/studio';
import { formatPrice } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';
import { useCart } from '@/hooks/useCart';
import { useProductCardIdentity } from '@/hooks/useProductCardIdentity';
import { productService } from '@/services/api/products';
import { resolveProductDisplay, getResolvedImages } from '@/components/shop-studio/lib/resolveProductDisplay';

interface ProductQuickEditModalProps {
  item: CartItemType | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickEditModal = ({ item, isOpen, onClose }: ProductQuickEditModalProps) => {
  const identity = useProductCardIdentity(item?.shopId, item?.productId ?? 0);
  const { updateVariant } = useCart();

  const [product, setProduct] = useState<StudioProduct | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!isOpen || !item) return;

    setSelectedSize(item.selectedSize ?? undefined);
    setActiveImageIndex(0);
    setImgError(false);
    setProduct(null);

    setIsLoadingProduct(true);
    productService
      .getProductById(item.productId)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setIsLoadingProduct(false));
  }, [isOpen, item?.id]);

  if (!isOpen || !item) return null;

  const mutedColor = identity.mutedTextColor || identity.textColor + '80';

  // ⭐ La couleur reste celle déjà choisie sur la page produit — jamais modifiée ici
  const fixedColor = item.selectedColor ?? undefined;

  const display = product
    ? resolveProductDisplay(product, fixedColor)
    : {
        name: item.productName,
        stock: item.stock || 0,
        sizes: item.size || [],
        imageUrl1: item.productImage,
        imageUrl2: null,
        imageUrl3: null,
        variant: undefined,
      };

  const images = product ? getResolvedImages(display) : [item.productImage].filter(Boolean) as string[];
  const currentImage = images[activeImageIndex] || images[0];
  const imageUrl = imgError || !currentImage
    ? '/images/product-placeholder.svg'
    : getImageUrl(currentImage);

  const availableSizes = display.sizes;
  const outOfStock = display.stock <= 0;

  const hasChanges = selectedSize !== (item.selectedSize ?? undefined);

  const handleSizeSelect = (size: string) => {
    setSelectedSize((prev) => (prev === size ? undefined : size));
  };

  const handleUpdate = async () => {
    if (!hasChanges) return;
    try {
      setIsSaving(true);
      await updateVariant(item.id, selectedSize, fixedColor); // ⭐ couleur inchangée, envoyée telle quelle
      toast.success('Produit mis à jour');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

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
            alt={display.name}
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
                {display.name}
              </h2>
              {item.shopName && (
                <p className="text-sm mt-1" style={{ color: mutedColor }}>{item.shopName}</p>
              )}
              {fixedColor && (
                <p className="text-sm mt-1" style={{ color: mutedColor }}>Couleur : {fixedColor}</p>
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
            {formatPrice(item.productPrice)}
          </div>

          {availableSizes.length > 0 && (
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: mutedColor }}>
                Taille
              </span>
              <div className="grid grid-cols-6 gap-2">
                {availableSizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleSizeSelect(s)}
                      disabled={outOfStock}
                      className="py-2 text-sm border rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={
                        isSelected
                          ? { borderColor: identity.textColor, color: identity.textColor, fontWeight: 600 }
                          : { borderColor: identity.borderColor, color: identity.textColor }
                      }
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {outOfStock && (
            <p className="text-sm font-medium text-red-500 mb-4">Rupture de stock pour cette couleur</p>
          )}

          <div className="mt-auto pt-4 space-y-3" style={{ borderTop: `1px solid ${identity.borderColor}` }}>
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
            <button
              onClick={handleUpdate}
              disabled={!hasChanges || isSaving || isLoadingProduct}
              className="w-full py-3 rounded-lg font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: identity.textColor, color: identity.panelColor }}
            >
              {isSaving ? 'Mise à jour...' : 'Mise à jour du produit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickEditModal;