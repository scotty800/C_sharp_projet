'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { productService } from '@/services/api/products';
import { formatPrice } from '@/services/utils/formatters';
import AddToCartButton from '../product/AddToCartButton';

interface CartRecommendationsProps {
  currentItemIds: number[];
}

const CartRecommendations = ({ currentItemIds }: CartRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Récupérer des produits aléatoires ou basés sur le panier
        const response = await productService.getProducts({
          pageSize: 4,
        });
        
        // Filtrer les produits déjà dans le panier
        const filtered = response.data.filter(
          product => !currentItemIds.includes(product.id)
        );
        
        setRecommendations(filtered.slice(0, 4));
      } catch (error) {
        console.error('Erreur chargement recommandations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentItemIds]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!recommendations.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Complétez votre panier</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div key={product.id} className="group">
            <Link href={`/product/${product.id}`}>
              <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                <Image
                  src={product.imageUrl || '/images/product-placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                {product.name}
              </h4>
              <p className="text-sm text-primary font-semibold">
                {formatPrice(product.price)}
              </p>
            </Link>
            <AddToCartButton
              productId={product.id}
              quantity={1}
              className="w-full mt-2 text-sm py-2"
            >
              Ajouter
            </AddToCartButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartRecommendations;