'use client';

import { useCart } from '@/hooks/useCart';
import { CartItem, CartSummary, EmptyCart, CartRecommendations } from '@/components/cart';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function CartPage() {
  // ⭐ MODIFICATION — Ajout de isMutating
  const { cart, isLoading, isMutating } = useCart();

  // ⭐ MODIFICATION — Skeleton structurel au lieu du spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-32 animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-80 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-6">
          <Link 
            href="/shops" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <FiArrowLeft />
            Continuer mes achats
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-4 text-gray-900 dark:text-white">
            Mon panier ({cart.items.length} article{cart.items.length > 1 ? 's' : ''})
          </h1>
        </div>

        {/* ⭐ AJOUT — wrapper avec effet visuel pendant une mutation */}
        <div className={isMutating ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Recommandations */}
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <CartRecommendations 
                  currentItemIds={cart.items.map(item => item.productId)} 
                />
              </div>
            </div>

            {/* Résumé */}
            <div className="lg:col-span-1">
              <CartSummary cart={cart} />
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">🛡️ Paiement sécurisé</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vos données sont protégées</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">🚚 Livraison gratuite</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dès 50€ d'achat</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">🔄 Retours gratuits</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sous 14 jours</p>
          </div>
        </div>
      </div>
    </div>
  );
}