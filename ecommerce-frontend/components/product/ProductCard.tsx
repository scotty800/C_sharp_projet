'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { Product } from '@/types/product';
import { formatPrice } from '@/services/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { getProductImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
  themeColor?: string;
}

const ProductCard = ({ product, layout = 'grid', themeColor = '#e50914' }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, 1);
      toast.success('Produit ajouté au panier');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  // Utiliser l'utilitaire pour l'URL de l'image
  const imageUrl = imageError ? '/images/product-placeholder.svg' : getProductImageUrl(product);

  if (layout === 'list') {
    return (
      <div 
        className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer"
        onClick={() => window.location.href = `/product/${product.id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-48 h-48 flex-shrink-0 bg-gray-100">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold bg-red-500 px-3 py-1 rounded-full text-sm">
                  Rupture
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
              <button
                onClick={handleToggleFavorite}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.stock > 0 && (
                  <span className="text-sm text-gray-500 ml-2">
                    Stock: {product.stock}
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAddingToCart}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  product.stock > 0
                    ? 'bg-primary hover:bg-primary-dark text-white'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                }`}
              >
                <FiShoppingCart />
                <span>{isAddingToCart ? '...' : 'Ajouter'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="product-card group bg-white cursor-pointer"
      onClick={() => window.location.href = `/product/${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          onError={() => setImageError(true)}
          unoptimized
        />
        
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center gap-3 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
            disabled={product.stock <= 0}
            className="bg-white hover:bg-primary text-gray-900 hover:text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ajouter au panier"
          >
            <FiShoppingCart size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(e);
            }}
            className="bg-white hover:bg-primary text-gray-900 hover:text-white p-3 rounded-full transition-colors"
            title="Ajouter aux favoris"
          >
            <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/product/${product.id}`;
            }}
            className="bg-white hover:bg-primary text-gray-900 hover:text-white p-3 rounded-full transition-colors"
            title="Voir détails"
          >
            <FiEye size={20} />
          </button>
        </div>

        {product.stock <= 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Rupture
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.shop && (
            <span className="text-xs text-gray-500">
              {product.shop.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;