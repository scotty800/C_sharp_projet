'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { shopService } from '@/services/api/shops';
import { ShopResponse } from '@/types/shop';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { getImageUrl } from '@/utils/imageUtils';
import { useDebounce } from '@/hooks/useDebounce';

// Interface pour la structure réelle de l'API
interface ShopsApiResponse {
  items: ShopResponse[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  pageSize: number;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchShops();
  }, [page, debouncedSearch]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await shopService.getShops({
        page,
        pageSize: 12,
        search: debouncedSearch || undefined,
      });
      
      console.log('📦 Données reçues:', response);
      
      // La structure est avec 'items' comme le montrent les logs
      const data = response as any;
      
      setShops({
        items: data.items || [],
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || page,
        totalCount: data.totalCount || 0,
        pageSize: data.pageSize || 12,
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement boutiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  if (loading && !shops) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const shopItems = shops?.items || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Toutes les boutiques</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez nos boutiques et trouvez des produits uniques
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="Rechercher une boutique..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          </div>
        </div>

        {/* Grille des boutiques */}
        {shopItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Aucune boutique trouvée</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {shopItems.map((shop: ShopResponse) => (
                <Link
                  key={shop.id}
                  href={`/shop/${shop.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Bannière */}
                  <div className="relative h-32 bg-gradient-to-r from-primary/30 to-primary/10">
                    {shop.bannerUrl && (
                      <Image
                        src={getImageUrl(shop.bannerUrl)}
                        alt={shop.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>

                  {/* Logo et infos */}
                  <div className="px-4 pb-4">
                    <div className="flex items-end -mt-8 mb-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 shadow-lg">
                        {shop.logoUrl ? (
                          <Image
                            src={getImageUrl(shop.logoUrl)}
                            alt={shop.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <span className="text-primary dark:text-primary text-xl font-bold">
                              {shop.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {shop.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {shop.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-500">
                        {shop.productCount} produit{shop.productCount > 1 ? 's' : ''}
                      </span>
                      <span className="text-primary font-medium inline-flex items-center gap-1">
                        Voir la boutique
                        <FiArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {shops && shops.totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Précédent
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {page} sur {shops.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(shops.totalPages, p + 1))}
                  disabled={page === shops.totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}