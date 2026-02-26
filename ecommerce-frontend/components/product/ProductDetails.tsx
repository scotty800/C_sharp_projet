'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiHeart, FiShoppingCart, FiTruck, FiShield, FiRotateCcw } from 'react-icons/fi';
import { Product } from '@/types/product';
import { formatPrice } from '@/services/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { getProductImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';
import ProductImages from './ProductImages';
import AddToCartButton from './AddToCartButton';

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    try {
      await addToCart(product.id, quantity);
      toast.success('Produit ajouté au panier');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const features = [
    {
      icon: FiTruck,
      title: 'Livraison gratuite',
      description: 'À partir de 50€ d\'achat',
    },
    {
      icon: FiShield,
      title: 'Paiement sécurisé',
      description: 'CB, PayPal, Virement',
    },
    {
      icon: FiRotateCcw,
      title: 'Retour gratuit',
      description: 'Sous 14 jours',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <ProductImages product={product} />

        {/* Infos produit */}
        <div>
          {/* Catégorie et boutique */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>{product.category}</span>
            <span>•</span>
            {product.shop && (
              <a href={`/shop/${product.shop.slug}`} className="hover:text-primary">
                {product.shop.name}
              </a>
            )}
          </div>

          {/* Titre */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Prix */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 ? (
              <span className="ml-4 text-sm text-green-600 font-semibold">
                En stock ({product.stock} disponibles)
              </span>
            ) : (
              <span className="ml-4 text-sm text-red-600 font-semibold">
                Rupture de stock
              </span>
            )}
          </div>

          {/* Description courte */}
          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          {/* Caractéristiques */}
          {(product.size || product.color) && (
            <div className="border-t border-b py-4 mb-6">
              {product.size && (
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-semibold w-20">Taille:</span>
                  <span>{product.size}</span>
                </div>
              )}
              {product.color && (
                <div className="flex items-center gap-4">
                  <span className="font-semibold w-20">Couleur:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border-2"
                      style={{ backgroundColor: product.color.toLowerCase() }}
                    />
                    <span>{product.color}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantité */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-semibold">Quantité:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <AddToCartButton
              productId={product.id}
              quantity={quantity}
              disabled={product.stock <= 0}
              className="flex-1"
            />
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                isFavorite
                  ? 'border-red-500 text-red-500 hover:bg-red-50'
                  : 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
              }`}
            >
              <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
              <span>{isFavorite ? 'Favori' : 'Ajouter aux favoris'}</span>
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <feature.icon className="mx-auto text-primary text-2xl mb-2" />
                <h4 className="font-semibold text-sm">{feature.title}</h4>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;