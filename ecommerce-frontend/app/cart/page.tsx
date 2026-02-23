'use client';

import { useCart } from '@/hooks/useCart';
import { CartItem, CartSummary, EmptyCart, CartRecommendations } from '@/components/cart';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function CartPage() {
  const { cart, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-6">
          <Link 
            href="/shops" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <FiArrowLeft />
            Continuer mes achats
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-4">
            Mon panier ({cart.items.length} article{cart.items.length > 1 ? 's' : ''})
          </h1>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Recommandations */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
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

        {/* Informations supplémentaires */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="font-semibold mb-2">🛡️ Paiement sécurisé</h3>
            <p className="text-sm text-gray-600">Vos données sont protégées</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="font-semibold mb-2">🚚 Livraison gratuite</h3>
            <p className="text-sm text-gray-600">Dès 50€ d'achat</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="font-semibold mb-2">🔄 Retours gratuits</h3>
            <p className="text-sm text-gray-600">Sous 14 jours</p>
          </div>
        </div>
      </div>
    </div>
  );
}