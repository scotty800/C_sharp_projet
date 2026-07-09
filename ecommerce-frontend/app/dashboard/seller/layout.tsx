'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { orderService } from '@/services/api/orders';
import { Shop, ShopResponse } from '@/types/shop';
import { FiRefreshCw, FiTruck, FiAlertCircle } from 'react-icons/fi';

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
  
  // ✅ États pour les notifications
  const [pendingReturnsCount, setPendingReturnsCount] = useState(0);
  const [pendingShipmentsCount, setPendingShipmentsCount] = useState(0);
  const [checkingNotifications, setCheckingNotifications] = useState(false);

  // ✅ Fonction pour vérifier les demandes de retour ET les livraisons en attente
  const checkNotifications = useCallback(async (shopId: number) => {
    if (!shopId) return;
    
    try {
      setCheckingNotifications(true);
      console.log('🔔 Vérification des notifications pour shop:', shopId);
      
      const orders = await orderService.getShopOrders(shopId);
      console.log('📦 Commandes du shop:', orders);
      
      // Compter les retours demandés (statut 6 ou 'ReturnRequested')
      const pendingReturnCount = orders.filter(order => {
        const statusStr = String(order.status);
        const statusNum = typeof order.status === 'number' ? order.status : parseInt(order.status as any);
        return statusStr === 'ReturnRequested' || statusNum === 6;
      }).length;
      
      // ⭐ MODIFICATION — Élargir le filtre des commandes à traiter
      const pendingShipmentCount = orders.filter(order => {
        const statusStr = String(order.status);
        const statusNum = typeof order.status === 'number' ? order.status : parseInt(order.status as any);
        return (
          statusStr === 'Pending' || statusNum === 0 ||
          statusStr === 'Processing' || statusNum === 1 ||
          statusStr === 'Shipped' || statusNum === 2
        );
      }).length;
      
      console.log('🔔 Retours en attente:', pendingReturnCount);
      console.log('🔔 Commandes en cours de traitement:', pendingShipmentCount);
      
      setPendingReturnsCount(pendingReturnCount);
      setPendingShipmentsCount(pendingShipmentCount);
    } catch (error) {
      console.error('❌ Erreur vérification notifications:', error);
    } finally {
      setCheckingNotifications(false);
    }
  }, []);

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
        
        const transformedShops = userShops.map(transformShopResponse);
        setShops(transformedShops);
        
        const shopIdFromUrl = searchParams.get('shopId');
        
        if (shopIdFromUrl) {
          const shopExists = transformedShops.some(s => s.id === Number(shopIdFromUrl));
          if (shopExists) {
            setSelectedShop(Number(shopIdFromUrl));
            checkNotifications(Number(shopIdFromUrl));
          } else if (transformedShops.length > 0) {
            setSelectedShop(transformedShops[0].id);
            router.replace(`/dashboard/seller?shopId=${transformedShops[0].id}`);
            checkNotifications(transformedShops[0].id);
          }
        } else if (transformedShops.length > 0) {
          setSelectedShop(transformedShops[0].id);
          checkNotifications(transformedShops[0].id);
        }
        
      } catch (error) {
        console.error('Erreur chargement boutiques:', error);
        setError('Impossible de charger vos boutiques');
      } finally {
        setLoadingShops(false);
      }
    };

    fetchShops();
  }, [user, searchParams, router, checkNotifications]);

  // ✅ POLLING : Vérifier les notifications toutes les 5 secondes
  useEffect(() => {
    if (!selectedShop) return;

    const pollInterval = setInterval(() => {
      console.log('🔄 Vérification auto des notifications...');
      checkNotifications(selectedShop);
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [selectedShop, checkNotifications]);

  const handleShopChange = useCallback((newShopId: number) => {
    setSelectedShop(newShopId);
    router.push(`/dashboard/seller?shopId=${newShopId}`);
    checkNotifications(newShopId);
  }, [router, checkNotifications]);

  if (authLoading || loadingShops) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de votre espace vendeur...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Une erreur est survenue</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
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

  if (shops.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Vous n'avez pas encore de boutique</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar shopId={selectedShop || undefined} />
      
      <div className="flex-1">
        {/* Barre de sélection de boutique avec badges de notification */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
          <div className="container mx-auto">
            {shops.length > 1 && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Boutique active :
                  </span>
                  <select
                    value={selectedShop || ''}
                    onChange={(e) => handleShopChange(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[200px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

            {/* ✅ Badges de notification */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Badge Demandes de retour */}
              {pendingReturnsCount > 0 && (
                <Link
                  href={`/dashboard/seller/returns?shopId=${selectedShop}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors relative animate-pulse"
                >
                  <FiRefreshCw size={18} />
                  Demandes de retour
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                    {pendingReturnsCount}
                  </span>
                </Link>
              )}

              {/* ⭐ MODIFICATION — Badge Commandes en cours de traitement */}
              {pendingShipmentsCount > 0 && (
                <Link
                  href={`/dashboard/seller/orders?shopId=${selectedShop}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors relative animate-pulse"
                >
                  <FiTruck size={18} />
                  Commandes en cours de traitement
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                    {pendingShipmentsCount}
                  </span>
                </Link>
              )}

              {/* Message si aucune notification */}
              {pendingReturnsCount === 0 && pendingShipmentsCount === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  ✅ Aucune action en attente
                </p>
              )}

              {/* Indicateur de rafraîchissement */}
              {checkingNotifications && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="animate-spin">
                    <FiRefreshCw size={14} />
                  </div>
                  Vérification...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <main className="p-8">
          {selectedShop ? (
            children
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Veuillez sélectionner une boutique</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}