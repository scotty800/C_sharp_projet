'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/api/orders';
import { OrderResponseDto, OrderStatus } from '@/types/order';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

// Constantes pour les statuts (correspondent aux valeurs du backend)
const ORDER_STATUS = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: 4,
  REFUNDED: 5
};

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const shopId = Number(searchParams.get('shopId'));
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user || !shopId) {
      router.push('/auth/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        console.log('📦 Récupération des commandes du shop:', shopId);
        
        const allOrders = await orderService.getShopOrders(shopId);
        console.log('📦 Commandes du shop:', allOrders);
        
        const foundOrder = allOrders.find(o => o.id === Number(id));
        
        if (!foundOrder) {
          console.error('❌ Commande non trouvée dans ce shop');
          toast.error('Commande non trouvée');
          return;
        }
        
        console.log('✅ Commande trouvée:', foundOrder);
        setOrder(foundOrder);
      } catch (error) {
        console.error('❌ Erreur chargement commande:', error);
        toast.error('Impossible de charger la commande');
      } finally {
        setLoading(false);
      }
    };

    if (id && shopId) {
      fetchOrder();
    }
  }, [id, shopId, user, router]);

  const handleUpdateStatus = async (newStatus: number) => {
    if (!order) return;

    let confirmMessage = '';
    let successMessage = '';

    switch (newStatus) {
      case ORDER_STATUS.PROCESSING:
        confirmMessage = 'Confirmer cette commande ?';
        successMessage = 'Commande confirmée ✅';
        break;
      case ORDER_STATUS.SHIPPED:
        confirmMessage = 'Marquer cette commande comme expédiée ?';
        successMessage = 'Commande marquée comme expédiée 🚚';
        break;
      case ORDER_STATUS.DELIVERED:
        confirmMessage = 'Marquer cette commande comme livrée ?';
        successMessage = 'Commande marquée comme livrée 📦';
        break;
      case ORDER_STATUS.CANCELLED:
        confirmMessage = 'Êtes-vous sûr d\'annuler cette commande ?';
        successMessage = 'Commande annulée ❌';
        break;
      default:
        confirmMessage = 'Confirmer cette action ?';
        successMessage = 'Action effectuée';
    }

    if (!confirm(confirmMessage)) return;

    try {
      setUpdating(true);
      console.log('📤 Mise à jour statut - OrderId:', order.id, 'Nouveau statut:', newStatus);
      
      await orderService.updateOrderStatus(order.id, { status: newStatus as any });
      
      // Mettre à jour localement avec la valeur numérique
      setOrder({ ...order, status: newStatus as any });
      
      console.log('✅ Statut mis à jour avec succès');
      toast.success(successMessage);
    } catch (error: any) {
      console.error('❌ Erreur mise à jour:', error);
      console.error('  Status:', error.response?.status);
      console.error('  Message:', error.response?.data?.message);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusText = (status: number): string => {
    const map: Record<number, string> = {
      [ORDER_STATUS.PENDING]: 'En attente',
      [ORDER_STATUS.PROCESSING]: 'En traitement',
      [ORDER_STATUS.SHIPPED]: 'Expédiée',
      [ORDER_STATUS.DELIVERED]: 'Livrée',
      [ORDER_STATUS.CANCELLED]: 'Annulée',
      [ORDER_STATUS.REFUNDED]: 'Remboursée',
    };
    return map[status] || 'Inconnu';
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case ORDER_STATUS.DELIVERED:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case ORDER_STATUS.SHIPPED:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case ORDER_STATUS.PROCESSING:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case ORDER_STATUS.PENDING:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case ORDER_STATUS.CANCELLED:
      case ORDER_STATUS.REFUNDED:
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Commande non trouvée</p>
          <Link href={`/dashboard/seller/orders?shopId=${shopId}`} className="text-primary hover:text-primary-dark">
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Utilisation des constantes numériques pour les comparaisons
  const statusNum = typeof order.status === 'number' ? order.status : parseInt(order.status as any);
  const isPending = statusNum === ORDER_STATUS.PENDING;
  const isProcessing = statusNum === ORDER_STATUS.PROCESSING;
  const isShipped = statusNum === ORDER_STATUS.SHIPPED;
  const isDelivered = statusNum === ORDER_STATUS.DELIVERED;
  const isCancelled = statusNum === ORDER_STATUS.CANCELLED;
  const isCompleted = isDelivered || isCancelled;

  console.log('🔍 Status debug:', {
    orderStatus: statusNum,
    isPending,
    isProcessing,
    isShipped,
    isDelivered,
    isCancelled,
    isCompleted
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Fil d'Ariane */}
        <div className="mb-6">
          <Link href={`/dashboard/seller/orders?shopId=${shopId}`} className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
            <FiArrowLeft />
            Retour aux commandes
          </Link>
        </div>

        {/* En-tête */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Commande #{order.orderNumber}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Client: {order.username || 'Client'} • {order.userEmail || 'Email non fourni'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Passée le {formatDate(order.createdAt, 'long')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(statusNum)}`}>
                {getStatusText(statusNum)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions vendeur */}
        {!isCompleted && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Gestion de la commande</h2>
            <div className="flex flex-wrap gap-3">
              {isPending && (
                <button
                  onClick={() => handleUpdateStatus(ORDER_STATUS.PROCESSING)}
                  disabled={updating}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <FiPackage size={18} />
                  {updating ? 'Traitement...' : '✅ Confirmer la commande'}
                </button>
              )}
              
              {isProcessing && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(ORDER_STATUS.SHIPPED)}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <FiTruck size={18} />
                    {updating ? 'Traitement...' : '🚚 Marquer comme expédiée'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(ORDER_STATUS.CANCELLED)}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <FiXCircle size={18} />
                    {updating ? 'Traitement...' : '❌ Annuler la commande'}
                  </button>
                </>
              )}
              
              {isShipped && (
                <button
                  onClick={() => handleUpdateStatus(ORDER_STATUS.DELIVERED)}
                  disabled={updating}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <FiCheckCircle size={18} />
                  {updating ? 'Traitement...' : '📦 Marquer comme livrée'}
                </button>
              )}
            </div>

            {/* Message d'information */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
              {isPending && "📌 Étape 1/4: Confirmez la commande pour commencer le traitement."}
              {isProcessing && "📌 Étape 2/4: Préparez la commande, puis marquez-la comme expédiée."}
              {isShipped && "📌 Étape 3/4: La commande est en cours de livraison. Marquez-la comme livrée une fois reçue."}
            </div>
          </div>
        )}

        {/* Message si commande terminée */}
        {isCompleted && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 text-center">
            <FiCheckCircle className="mx-auto text-green-500 dark:text-green-400 mb-2" size={32} />
            <p className="text-gray-600 dark:text-gray-400">
              {isDelivered ? '✅ Cette commande est livrée. Aucune action supplémentaire n\'est requise.' : '❌ Cette commande est annulée.'}
            </p>
          </div>
        )}

        {/* Timeline des étapes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Suivi de la commande</h2>
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                !isPending ? 'bg-primary text-white' : 'bg-primary text-white'
              }`}>
                1
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Confirmée</span>
            </div>
            <div className={`w-12 h-0.5 ${!isPending ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                isProcessing || isShipped || isDelivered ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                2
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Préparée</span>
            </div>
            <div className={`w-12 h-0.5 ${isShipped || isDelivered ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                isShipped || isDelivered ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                3
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Expédiée</span>
            </div>
            <div className={`w-12 h-0.5 ${isDelivered ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                isDelivered ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                4
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Livrée</span>
            </div>
          </div>
        </div>

        {/* Articles commandés */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Articles commandés</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  <Image
                    src={getImageUrl(item.productImage) || '/images/product-placeholder.svg'}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                  {item.shopName && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Boutique: {item.shopName}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quantité: {item.quantity}</p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Récapitulatif et adresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Récapitulatif</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                <span className="text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Livraison</span>
                <span className="text-gray-900 dark:text-white">{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                <span className="text-gray-900 dark:text-white">{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-primary">{formatPrice(order.finalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Adresses</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">Livraison</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress || 'Adresse non renseignée'}<br />
                  {order.shippingPostalCode} {order.shippingCity}<br />
                  {order.shippingCountry}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">Facturation</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.billingAddress || 'Adresse non renseignée'}<br />
                  {order.billingPostalCode} {order.billingCity}<br />
                  {order.billingCountry}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}