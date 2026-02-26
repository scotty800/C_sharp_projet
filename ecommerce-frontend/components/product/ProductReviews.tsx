'use client';

import { useState } from 'react';
import { FiStar, FiThumbsUp, FiFlag } from 'react-icons/fi';
import { Review } from '@/types/review';
import { formatDate } from '@/services/utils/formatters';

interface ProductReviewsProps {
  productId: number;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const ProductReviews = ({ productId, reviews = [], averageRating, totalReviews }: ProductReviewsProps) => {
  const [filter, setFilter] = useState<number | null>(null);

  // S'assurer que reviews est un tableau
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const ratingDistribution = {
    5: safeReviews.filter(r => r?.rating === 5).length,
    4: safeReviews.filter(r => r?.rating === 4).length,
    3: safeReviews.filter(r => r?.rating === 3).length,
    2: safeReviews.filter(r => r?.rating === 2).length,
    1: safeReviews.filter(r => r?.rating === 1).length,
  };

  const filteredReviews = filter
    ? safeReviews.filter(r => r?.rating === filter)
    : safeReviews;

  const getPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Avis clients</h2>

      {/* Résumé des notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Note moyenne */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-primary mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center md:justify-start gap-1 text-yellow-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                fill={i < Math.round(averageRating) ? 'currentColor' : 'none'}
                size={20}
              />
            ))}
          </div>
          <p className="text-gray-500">Basé sur {totalReviews} avis</p>
        </div>

        {/* Distribution */}
        <div>
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => setFilter(filter === rating ? null : rating)}
              className={`flex items-center gap-2 w-full mb-2 p-2 rounded hover:bg-gray-50 transition-colors ${
                filter === rating ? 'bg-primary/10' : ''
              }`}
            >
              <span className="text-sm w-8">{rating} étoiles</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${getPercentage(ratingDistribution[rating as keyof typeof ratingDistribution])}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-12">
                {ratingDistribution[rating as keyof typeof ratingDistribution]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Aucun avis pour le moment</p>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="border-t pt-6 first:border-t-0 first:pt-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {review.user?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold">{review.user?.username || 'Anonyme'}</p>
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
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

              <p className="text-gray-700 mb-4">{review.comment}</p>

              <div className="flex items-center gap-4 text-sm">
                <button className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
                  <FiThumbsUp size={16} />
                  <span>Utile (0)</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
                  <FiFlag size={16} />
                  <span>Signaler</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bouton pour écrire un avis */}
      <div className="mt-8 text-center">
        <button className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors">
          Écrire un avis
        </button>
      </div>
    </div>
  );
};

export default ProductReviews;