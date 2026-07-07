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
import { useProductCardIdentity } from '@/hooks/useProductCardIdentity';
import ProductQuickEditModal from '@/components/cart/ProductQuickEditModal';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { updateQuantity, removeFromCart } = useCart();

  const identity = useProductCardIdentity(item.shopId, item.productId);

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

  const mutedColor = identity.mutedTextColor || identity.textColor + '80';

  return (
    // ⭐ MODIFICATION — ajout de transition dans le style inline
    <div
      className="flex flex-col sm:flex-row gap-5 p-5 mb-4 last:mb-0"
      style={{
        backgroundColor: identity.panelColor,
        borderRadius: `${identity.borderRadius}px`,
        boxShadow: identity.boxShadow,
        border: identity.source === 'product-page' ? `1px solid ${identity.borderColor}` : '1px solid #eeeeee',
        transition: 'background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease',   // ⭐ AJOUT
      }}
    >
      {/* Image — ouvre le popup */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="sm:w-32 flex-shrink-0 text-left"
      >
        <div
          className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700"
          style={{ borderRadius: `${Math.max(identity.borderRadius - 2, 0)}px` }}
        >
          <Image
            src={imageUrl}
            alt={item.productName}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            unoptimized
          />
        </div>
      </button>

      {/* Infos produit */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            {/* Nom du produit — ouvre le popup */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-lg text-left hover:opacity-70 transition-opacity"
              style={{
                fontFamily: identity.fontFamily,
                fontWeight: identity.headingWeight,
                color: identity.textColor,
              }}
            >
              {item.productName}
            </button>

            {/* Vendu par */}
            {item.shopSlug && (
              <Link
                href={`/shop/${item.shopSlug}`}
                className="text-sm block mt-1 hover:opacity-70 transition-opacity"
                style={{ color: mutedColor }}
              >
                Vendu par {item.shopName}
              </Link>
            )}

            {/* Affichage en lecture seule de la variante sélectionnée */}
            {item.selectedSize && (
              <p className="text-sm mt-1" style={{ color: mutedColor }}>
                Taille : {item.selectedSize}
                {item.selectedColor && ` · Couleur : ${item.selectedColor}`}
              </p>
            )}
            {item.selectedColor && !item.selectedSize && (
              <p className="text-sm mt-1" style={{ color: mutedColor }}>
                Couleur : {item.selectedColor}
              </p>
            )}
          </div>

          {/* Prix unitaire */}
          <div className="text-right">
            <div className="text-lg font-bold" style={{ color: identity.textColor }}>
              {formatPrice(item.productPrice)}
            </div>
          </div>
        </div>

        {/* Actions et quantité */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: mutedColor }}>Quantité:</span>
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
            <span className="text-sm" style={{ color: mutedColor }}>
              max {item.stock}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm" style={{ color: mutedColor }}>Total:</span>
              <span className="ml-2 text-xl font-bold" style={{ color: identity.textColor }}>
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

      <ProductQuickEditModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default CartItem;