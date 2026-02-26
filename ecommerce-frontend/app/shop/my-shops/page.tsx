'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { ShopResponse } from '@/types/shop';
import { FiSettings, FiExternalLink, FiPlus, FiPackage } from 'react-icons/fi';

export default function MyShopsPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState<ShopResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const data = await shopService.getMyShops();
        setShops(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchShops();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Veuillez vous connecter</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes boutiques</h1>
          <Link
            href="/shop/create"
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus />
            Créer une boutique
          </Link>
        </div>

        {shops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiPackage className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 mb-4">Vous n'avez pas encore de boutique</p>
            <Link
              href="/shop/create"
              className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
            >
              Créer ma première boutique
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-2">{shop.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{shop.description}</p>
                <p className="text-sm text-gray-500 mb-4">{shop.productCount} produits</p>
                
                <div className="flex flex-wrap gap-3">
                  {/* Voir la boutique */}
                  <Link
                    href={`/shop/${shop.slug}`}
                    className="flex items-center gap-1 text-primary hover:text-primary-dark"
                  >
                    <FiExternalLink size={16} />
                    Voir
                  </Link>

                  {/* Personnaliser (couleurs, logo, bannière) */}
                  <Link
                    href={`/shop/customize/${shop.id}`}
                    className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
                  >
                    <FiSettings size={16} />
                    Personnaliser
                  </Link>

                  {/* Gérer les produits (NOUVEAU) */}
                  <Link
                    href={`/shop/manage/${shop.id}`}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700"
                  >
                    <FiPackage size={16} />
                    produits
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}