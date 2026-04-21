'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { reviewService } from '@/services/api/reviews';
import { shopService } from '@/services/api/shops';
import { productService } from '@/services/api/products';
import { FiArrowLeft, FiStar, FiThumbsUp, FiMessageSquare } from 'react-icons/fi';
import { formatDate } from '@/services/utils/formatters';
import toast from 'react-hot-toast';

interface ReviewWithDetails {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
  };
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

export default function SellerReviewsPage() {
  const searchParams = useSearchParams();
  const shopId = Number(searchParams.get('shopId'));
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('');
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [filter, setFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !shopId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const shop = await shopService.getShopById(shopId);
        setShopName(shop.name);

        // Récupérer tous les produits de la boutique
        const productsResponse = await productService.getProductsByShop(shopId, { pageSize: 100 });
        
        // Extraction des produits avec gestion des différentes structures possibles
        let products: any[] = [];
        const data: any = productsResponse;
        
        if (data.products?.data && Array.isArray(data.products.data)) {
          products = data.products.data;
          console.log('✅ Produits récupérés (products.data):', products.length);
        } else if (data.data && Array.isArray(data.data)) {
          products = data.data;
          console.log('✅ Produits récupérés (data):', products.length);
        } else if (Array.isArray(data)) {
          products = data;
          console.log('✅ Produits récupérés (tableau):', products.length);
        } else if (data.products?.items && Array.isArray(data.products.items)) {
          products = data.products.items;
          console.log('✅ Produits récupérés (products.items):', products.length);
        }

        // Récupérer les avis pour chaque produit
        const allReviews: ReviewWithDetails[] = [];
        
        for (const product of products) {
          try {
            const productReviews = await reviewService.getReviewsByProduct(product.id);
            if (Array.isArray(productReviews)) {
              productReviews.forEach((review: any) => {
                allReviews.push({
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  createdAt: review.createdAt,
                  user: review.user || { id: 0, username: 'Anonyme' },
                  product: {
                    id: product.id,
                    name: product.name,
                    imageUrl: product.imageUrl,
                  },
                });
              });
            }
          } catch (error) {
            console.error(`Erreur chargement avis produit ${product.id}:`, error);
          }
        }

        // Trier par date (plus récent d'abord)
        allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setReviews(allReviews);
        
        // Calculer la note moyenne
        if (allReviews.length > 0) {
          const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
          setAverageRating(sum / allReviews.length);
        }
      } catch (error) {
        console.error('Erreur chargement avis:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, user]);

  const filteredReviews = filter
    ? reviews.filter(r => r.rating === filter)
    : reviews;

  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      dist[r.rating as keyof typeof dist] += 1;
    });
    return dist;
  };

  const distribution = getRatingDistribution();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/seller?shopId=${shopId}`} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Avis clients</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">Boutique : {shopName}</p>

      {/* Résumé des notes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-5xl font-bold text-primary">{averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">sur 5</p>
          </div>
          
          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFilter(filter === rating ? null : rating)}
                  className={`flex items-center gap-2 w-full p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    filter === rating ? 'bg-primary/10 dark:bg-primary/20' : ''
                  }`}
                >
                  <span className="text-sm w-8 text-gray-700 dark:text-gray-300">{rating} étoiles</span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${reviews.length > 0 ? (distribution[rating as keyof typeof distribution] / reviews.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-12">
                    {distribution[rating as keyof typeof distribution]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">avis totaux</p>
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <FiMessageSquare className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">Aucun avis pour cette boutique</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {review.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{review.user.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <Link 
                      href={`/product/${review.product.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {review.product.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        fill={i < review.rating ? 'currentColor' : 'none'}
                        size={16}
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                    <FiThumbsUp size={16} />
                    Utile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}