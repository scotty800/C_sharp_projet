'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { Product } from '@/types/product';
import { formatPrice } from '@/services/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
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

  if (layout === 'list') {
    return (
      <Link
        href={`/product/${product.id}`}
        className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-48 h-48 flex-shrink-0">
            <Image
              src={product.imageUrl || '/images/product-placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
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
                <h3 className="text-lg font-semibold text-gray-900 hover:underline" style={{ textDecorationColor: themeColor }}>
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
                <span className="text-2xl font-bold" style={{ color: themeColor }}>
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-white"
                style={{ 
                  backgroundColor: product.stock > 0 ? themeColor : '#9ca3af',
                }}
                onMouseEnter={(e) => {
                  if (product.stock > 0) e.currentTarget.style.backgroundColor = `${themeColor}CC`;
                }}
                onMouseLeave={(e) => {
                  if (product.stock > 0) e.currentTarget.style.backgroundColor = themeColor;
                }}
              >
                <FiShoppingCart />
                <span>{isAddingToCart ? '...' : 'Ajouter'}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="product-card group bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.imageUrl || '/images/product-placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center gap-3 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="bg-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: '#000' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeColor;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }}
          >
            <FiShoppingCart size={20} />
          </button>
          <button
            onClick={handleToggleFavorite}
            className="bg-white p-3 rounded-full transition-colors"
            style={{ color: '#000' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeColor;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }}
          >
            <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <Link
            href={`/product/${product.id}`}
            className="bg-white p-3 rounded-full transition-colors"
            style={{ color: '#000' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeColor;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }}
          >
            <FiEye size={20} />
          </Link>
        </div>

        {product.stock <= 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Rupture
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:underline" style={{ textDecorationColor: themeColor }}>
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold" style={{ color: themeColor }}>
            {formatPrice(product.price)}
          </span>
          {product.shop && (
            <span className="text-xs text-gray-500">
              {product.shop.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;