'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dashboard';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { Shop, ShopResponse } from '@/types/shop';

// Fonction pour transformer ShopResponse en Shop
const transformShopResponse = (response: ShopResponse): Shop => ({
  id: response.id,
  name: response.name,
  slug: response.slug,
  description: response.description,
  logoUrl: response.logoUrl,
  bannerUrl: response.bannerUrl,
  themeColor: '#e50914',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  email: null,
  phone: null,
  productCount: response.productCount,
  createdAt: new Date().toISOString(),
  ownerId: response.ownerId,
  owner: undefined,
  products: []
});

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<number | null>(null);
  const [loadingShops, setLoadingShops] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirection si non connecté
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/dashboard/seller');
    }
  }, [user, authLoading, router]);

  // Chargement des boutiques
  useEffect(() => {
    const fetchShops = async () => {
      if (!user) return;
      
      try {
        setLoadingShops(true);
        setError(null);
        
        const userShops = await shopService.getMyShops();
        
        if (!Array.isArray(userShops)) {
          throw new Error('Format de réponse invalide');
        }
        
        // Transformation des données
        const transformedShops = userShops.map(transformShopResponse);
        setShops(transformedShops);
        
        // Gestion de la sélection
        const shopIdFromUrl = searchParams.get('shopId');
        
        if (shopIdFromUrl) {
          const shopExists = transformedShops.some(s => s.id === Number(shopIdFromUrl));
          if (shopExists) {
            setSelectedShop(Number(shopIdFromUrl));
          } else if (transformedShops.length > 0) {
            // Si l'ID n'existe pas, prendre la première boutique
            setSelectedShop(transformedShops[0].id);
            router.replace(`/dashboard/seller?shopId=${transformedShops[0].id}`);
          }
        } else if (transformedShops.length > 0) {
          setSelectedShop(transformedShops[0].id);
        }
        
      } catch (error) {
        console.error('Erreur chargement boutiques:', error);
        setError('Impossible de charger vos boutiques');
      } finally {
        setLoadingShops(false);
      }
    };

    fetchShops();
  }, [user, searchParams, router]);

  // Changement de boutique
  const handleShopChange = useCallback((newShopId: number) => {
    setSelectedShop(newShopId);
    router.push(`/dashboard/seller?shopId=${newShopId}`);
  }, [router]);

  // Affichage du chargement
  if (authLoading || loadingShops) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre espace vendeur...</p>
        </div>
      </div>
    );
  }

  // Si non connecté
  if (!user) {
    return null;
  }

  // Si erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Si pas de boutique
  if (shops.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Vous n'avez pas encore de boutique</h2>
          <p className="text-gray-600 mb-8">
            Créez votre première boutique pour commencer à vendre et gérer vos produits
          </p>
          <a
            href="/shop/create"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Créer une boutique
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar shopId={selectedShop || undefined} />
      
      <div className="flex-1">
        {/* Barre de sélection de boutique */}
        {shops.length > 1 && (
          <div className="bg-white border-b p-4 sticky top-0 z-10">
            <div className="container mx-auto flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Boutique active :
              </span>
              <select
                value={selectedShop || ''}
                onChange={(e) => handleShopChange(Number(e.target.value))}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[200px]"
                aria-label="Sélectionner une boutique"
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <main className="p-8">
          {selectedShop ? (
            children
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Veuillez sélectionner une boutique</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}