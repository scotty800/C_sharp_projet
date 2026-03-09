'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiTrash2, FiHeart, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { CartItem as CartItemType } from '@/types/cart';
import { Product } from '@/types/product';
import { formatPrice } from '@/services/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { getProductImageUrl } from '@/utils/imageUtils';
import { productService } from '@/services/api/products';
import toast from 'react-hot-toast';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [product, setProduct] = useState<Product | null>(item.product || null);
  const [loadingProduct, setLoadingProduct] = useState(!item.product);
  const { updateQuantity, removeFromCart } = useCart();

  // Si le produit n'est pas inclus, le charger
  useEffect(() => {
    if (!item.product && item.productId) {
      const fetchProduct = async () => {
        try {
          setLoadingProduct(true);
          const data = await productService.getProductById(item.productId);
          setProduct(data);
        } catch (error) {
          console.error('Erreur chargement produit:', error);
        } finally {
          setLoadingProduct(false);
        }
      };
      fetchProduct();
    }
  }, [item.productId, item.product]);

  const imageUrl = imgError 
    ? '/images/product-placeholder.svg' 
    : getProductImageUrl(product || item.product);

  console.log('🛒 CartItem - produit:', product?.id || item.product?.id, 'imageUrl:', imageUrl);

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > ((product || item.product)?.stock || 99)) return;

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

  if (loadingProduct) {
    return (
      <div className="flex flex-col sm:flex-row gap-6 py-6 border-b last:border-b-0">
        <div className="sm:w-32 h-32 bg-gray-200 animate-pulse rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
        </div>
      </div>
    );
  }

  const currentProduct = product || item.product;

  if (!currentProduct) {
    return (
      <div className="flex flex-col sm:flex-row gap-6 py-6 border-b last:border-b-0">
        <div className="sm:w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">Produit introuvable</span>
        </div>
        <div className="flex-1">
          <p className="text-gray-500">Ce produit n'est plus disponible</p>
          <button
            onClick={handleRemove}
            className="mt-2 text-red-500 hover:text-red-600"
          >
            Retirer du panier
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 py-6 border-b last:border-b-0">
      {/* Image */}
      <Link href={`/product/${item.productId}`} className="sm:w-32 flex-shrink-0">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={currentProduct.name}
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
            {/* Nom et boutique */}
            <Link 
              href={`/product/${item.productId}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
            >
              {currentProduct.name}
            </Link>
            
            {currentProduct.shop && (
              <Link 
                href={`/shop/${currentProduct.shop.slug}`}
                className="text-sm text-gray-500 hover:text-primary block mt-1"
              >
                Vendu par {currentProduct.shop.name}
              </Link>
            )}

            {/* Caractéristiques */}
            {(currentProduct.size || currentProduct.color) && (
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                {currentProduct.size && (
                  <span>Taille: {currentProduct.size}</span>
                )}
                {currentProduct.color && (
                  <span className="flex items-center gap-1">
                    Couleur: 
                    <span 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: currentProduct.color.toLowerCase() }}
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
            {item.unitPrice !== currentProduct.price && (
              <div className="text-sm text-gray-400 line-through">
                {formatPrice(currentProduct.price || 0)}
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
                disabled={item.quantity >= (currentProduct.stock || 99) || isUpdating}
                className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronUp size={16} />
              </button>
            </div>
            <span className="text-sm text-gray-500">
              max {currentProduct.stock}
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