'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiTrash2, FiHeart, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { CartItem as CartItemType } from '@/types/cart';
import { formatPrice } from '@/services/utils/formatters';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { updateQuantity, removeFromCart } = useCart();

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > (item.product?.stock || 99)) return;

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

  return (
    <div className="flex flex-col sm:flex-row gap-6 py-6 border-b last:border-b-0">
      {/* Image */}
      <Link href={`/product/${item.productId}`} className="sm:w-32 flex-shrink-0">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={item.product?.imageUrl || '/images/product-placeholder.jpg'}
            alt={item.product?.name || 'Produit'}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Infos produit */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            {/* Nom et boutique */}
            <Link 
              href={`/product/${item.productId}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
            >
              {item.product?.name}
            </Link>
            
            {item.product?.shop && (
              <Link 
                href={`/shop/${item.product.shop.slug}`}
                className="text-sm text-gray-500 hover:text-primary block mt-1"
              >
                Vendu par {item.product.shop.name}
              </Link>
            )}

            {/* Caractéristiques */}
            {(item.product?.size || item.product?.color) && (
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                {item.product?.size && (
                  <span>Taille: {item.product.size}</span>
                )}
                {item.product?.color && (
                  <span className="flex items-center gap-1">
                    Couleur: 
                    <span 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: item.product.color.toLowerCase() }}
                    />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Prix unitaire */}
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {formatPrice(item.unitPrice)}
            </div>
            {item.unitPrice !== item.product?.price && (
              <div className="text-sm text-gray-400 line-through">
                {formatPrice(item.product?.price || 0)}
              </div>
            )}
          </div>
        </div>

        {/* Actions et quantité */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          {/* Sélecteur de quantité */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Quantité:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => handleUpdateQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronDown size={16} />
              </button>
              <span className="w-12 text-center font-medium">
                {isUpdating ? '...' : item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                disabled={item.quantity >= (item.product?.stock || 99) || isUpdating}
                className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronUp size={16} />
              </button>
            </div>
            <span className="text-sm text-gray-500">
              max {item.product?.stock}
            </span>
          </div>

          {/* Prix total */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="ml-2 text-xl font-bold text-primary">
                {formatPrice(item.totalPrice)}
              </span>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'text-red-500 hover:bg-red-50' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                }`}
                title="Ajouter aux favoris"
              >
                <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleRemove}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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