'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductDetails, ProductReviews } from '@/components/product';
import { ProductGrid } from '@/components/product';
import { productService } from '@/services/api/products';
import { reviewService } from '@/services/api/reviews';
import { Product } from '@/types/product';
import { Review } from '@/types/review';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const productId = Number(id);

        // 1. Récupérer le produit
        const productData = await productService.getProductById(productId);
        console.log('Produit:', productData);
        setProduct(productData);

        // 2. Récupérer les avis
        try {
          const reviewsData = await reviewService.getReviewsByProduct(productId);
          console.log('Avis reçus:', reviewsData);
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (error) {
          console.error('Erreur chargement avis:', error);
          setReviews([]);
        }

        // 3. Récupérer la note moyenne
        try {
          const ratingData = await reviewService.getProductRating(productId);
          setAverageRating(ratingData?.average || 0);
        } catch (error) {
          console.error('Erreur chargement note:', error);
          setAverageRating(0);
        }

        // 4. Récupérer produits similaires (par catégorie)
        try {
          const relatedData = await productService.getProducts({
            category: productData.category,
            pageSize: 4,
          });
          console.log('Produits similaires reçus:', relatedData);
          
          // Extraire les produits selon la structure
          let related: Product[] = [];
          const data: any = relatedData;
          
          if (Array.isArray(data)) {
            related = data;
          } else if (data.data && Array.isArray(data.data)) {
            related = data.data;
          } else if (data.items && Array.isArray(data.items)) {
            related = data.items;
          } else if (data.products && data.products.data && Array.isArray(data.products.data)) {
            related = data.products.data;
          }
          
          // Filtrer pour enlever le produit actuel
          setRelatedProducts(related.filter(p => p.id !== productId));
        } catch (error) {
          console.error('Erreur chargement produits similaires:', error);
          setRelatedProducts([]);
        }

      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Produit non trouvé</h1>
          <p className="text-gray-600 dark:text-gray-400">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Fil d'Ariane */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <li><a href="/" className="hover:text-primary transition-colors">Accueil</a></li>
            <li>/</li>
            <li><a href={`/categories/${product.category}`} className="hover:text-primary transition-colors">{product.category}</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Détails du produit */}
        <ProductDetails product={product} />

        {/* Avis */}
        <div className="mt-12">
          <ProductReviews
            productId={product.id}
            reviews={reviews}
            averageRating={averageRating}
            totalReviews={reviews.length}
          />
        </div>

        {/* Produits similaires */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Produits similaires</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
}