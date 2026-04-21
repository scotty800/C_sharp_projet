'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { productService } from '@/services/api/products';

const categories = [
  { id: 'mode', name: 'Mode', icon: '👕', color: 'bg-pink-500' },
  { id: 'electronique', name: 'Électronique', icon: '📱', color: 'bg-blue-500' },
  { id: 'maison', name: 'Maison', icon: '🏠', color: 'bg-green-500' },
  { id: 'sport', name: 'Sport', icon: '⚽', color: 'bg-orange-500' },
  { id: 'beaute', name: 'Beauté', icon: '💄', color: 'bg-purple-500' },
  { id: 'jeux', name: 'Jeux', icon: '🎮', color: 'bg-red-500' },
  { id: 'livres', name: 'Livres', icon: '📚', color: 'bg-yellow-600' },
  { id: 'automobile', name: 'Automobile', icon: '🚗', color: 'bg-gray-600' },
  { id: 'alimentation', name: 'Alimentation', icon: '🍎', color: 'bg-green-600' },
];

export default function CategoriesPage() {
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const counts: Record<string, number> = {};

        await Promise.all(
          categories.map(async (category) => {
            try {
              const response = await productService.getProducts({
                category: category.id,
                pageSize: 1,
              });
              
              const data: any = response;
              counts[category.id] = data.totalCount || data.totalItems || 0;
            } catch (error) {
              console.error(`Erreur pour ${category.id}:`, error);
              counts[category.id] = 0;
            }
          })
        );

        setProductCounts(counts);
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Catégories</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Parcourez les produits par catégorie
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`relative h-40 w-full ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-5xl mb-2 transform group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <h2 className="text-2xl font-bold mb-1">{category.name}</h2>
                  
                  {loading ? (
                    <div className="h-5 w-16 bg-white/30 rounded animate-pulse" />
                  ) : (
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span>{productCounts[category.id] || 0} produits</span>
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}