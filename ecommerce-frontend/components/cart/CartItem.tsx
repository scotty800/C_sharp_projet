'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiTrash2, FiHeart, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { CartItem as CartItemType } from '@/types/cart';
import { formatPrice } from '@/services/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { updateQuantity, removeFromCart, updateVariant } = useCart();

  const imageUrl = imgError || !item.productImage
    ? '/images/product-placeholder.svg'
    : getImageUrl(item.productImage);

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > (item.stock || 99)) return;

    try {
      setIsUpdating(true);
      await updateQuantity(item.id, newQuantity);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeFromCart(item.id);
      toast.success('Article retiré du panier');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleVariantSelect = (size?: string, color?: string) => {
    // Si la variante est déjà sélectionnée, on la désélectionne
    const newSize = (size && item.selectedSize === size) ? undefined : size;
    const newColor = (color && item.selectedColor === color) ? undefined : color;
    updateVariant(item.id, newSize, newColor);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 py-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {/* Image */}
      <Link href={`/product/${item.productId}`} className="sm:w-32 flex-shrink-0">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          <Image
            src={imageUrl}
            alt={item.productName}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            unoptimized
          />
        </div>
      </Link>

      {/* Infos produit */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <Link
              href={`/product/${item.productId}`}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors"
            >
              {item.productName}
            </Link>

            {item.shopSlug && (
              <Link
                href={`/shop/${item.shopSlug}`}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary block mt-1"
              >
                Vendu par {item.shopName}
              </Link>
            )}

            {/* ⭐ Affichage de la variante sélectionnée */}
            {item.selectedSize && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Taille : {item.selectedSize}
                {item.selectedColor && ` · Couleur : ${item.selectedColor}`}
              </p>
            )}
            {item.selectedColor && !item.selectedSize && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Couleur : {item.selectedColor}
              </p>
            )}

            {/* ⭐ Sélecteurs taille/couleur — toujours visibles, modifiables à tout moment */}
            {((item.size && item.size.length > 0) || (item.color && item.color.length > 0)) && (
              <div className="mt-2 space-y-2">
                {((item.size && item.size.length > 0 && !item.selectedSize) ||
                  (item.color && item.color.length > 0 && !item.selectedColor)) && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    ⚠️ Choisissez {item.size && item.size.length > 0 && !item.selectedSize && item.color && item.color.length > 0 && !item.selectedColor
                      ? 'une taille et une couleur'
                      : item.size && item.size.length > 0 && !item.selectedSize
                      ? 'une taille'
                      : 'une couleur'}
                  </p>
                )}

                {item.size && item.size.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Taille :</span>
                    {item.size.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleVariantSelect(s, undefined)}
                        className={`px-2.5 py-1 text-xs border rounded transition-colors ${
                          item.selectedSize === s
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {item.color && item.color.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Couleur :</span>
                    {item.color.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleVariantSelect(undefined, c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          item.selectedColor === c
                            ? 'border-primary ring-2 ring-primary ring-offset-1'
                            : 'border-white dark:border-gray-800 ring-1 ring-gray-300 hover:ring-primary'
                        }`}
                        style={{ backgroundColor: c.toLowerCase() }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prix unitaire */}
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {formatPrice(item.productPrice)}
            </div>
          </div>
        </div>

        {/* Actions et quantité */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Quantité:</span>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => handleUpdateQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                <FiChevronDown size={16} />
              </button>
              <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                {isUpdating ? '...' : item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                disabled={item.quantity >= (item.stock || 99) || isUpdating}
                className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                <FiChevronUp size={16} />
              </button>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              max {item.stock}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total:</span>
              <span className="ml-2 text-xl font-bold text-primary">
                {formatPrice(item.totalPrice)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Ajouter aux favoris"
              >
                <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleRemove}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Supprimer"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;