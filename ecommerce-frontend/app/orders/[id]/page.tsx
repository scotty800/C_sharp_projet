'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/api/orders';
import { paymentService } from '@/services/api/payments';
import { OrderResponseDto, OrderStatus } from '@/types/order';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [requestingReturn, setRequestingReturn] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ✅ Calculer si le délai de rétractation est dépassé (14 jours)
  const isReturnPeriodExpired = (orderDate: string): boolean => {
    const orderDateObj = new Date(orderDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 14;
  };

  // ✅ Vérifier si la commande peut être annulée/remboursée
  const canBeCancelledOrRefunded = (): { can: boolean; reason: string } => {
    if (!order) return { can: false, reason: '' };

    const statusStr = String(order.status);
    const statusNum = typeof order.status === 'number' ? order.status : parseInt(order.status as any);

    // Déjà annulée ou remboursée
    if (statusStr === 'Cancelled' || statusNum === 4) {
      return { can: false, reason: 'Cette commande est déjà annulée' };
    }
    if (statusStr === 'Refunded' || statusNum === 5) {
      return { can: false, reason: 'Cette commande a déjà été remboursée' };
    }
    if (statusStr === 'ReturnRequested' || statusNum === 6) {
      return { can: false, reason: 'Une demande de retour est déjà en cours' };
    }

    // Cas 1: Commande en attente ou en traitement (non expédiée)
    if ((statusStr === 'Pending' || statusNum === 0) || (statusStr === 'Processing' || statusNum === 1)) {
      return { can: true, reason: 'annulation' };
    }

    // Cas 2: Commande livrée - Vérifier délai de 14 jours
    if ((statusStr === 'Delivered' || statusNum === 3)) {
      if (isReturnPeriodExpired(order.createdAt)) {
        return { can: false, reason: 'Le délai de rétractation de 14 jours est dépassé' };
      }
      return { can: true, reason: 'retour' };
    }

    // Cas 3: Commande expédiée mais pas encore livrée
    if ((statusStr === 'Shipped' || statusNum === 2)) {
      return { can: true, reason: 'annulation_avant_livraison' };
    }

    return { can: false, reason: 'Cette commande ne peut pas être annulée' };
  };

  // ✅ Fonction pour annuler la commande
  const handleCancelOrder = async () => {
    if (!order) return;

    const { can, reason } = canBeCancelledOrRefunded();
    if (!can) {
      toast.error(reason);
      return;
    }

    let confirmMessage = '';
    if (reason === 'annulation') {
      confirmMessage = 'Êtes-vous sûr de vouloir annuler cette commande ?';
    } else if (reason === 'retour') {
      confirmMessage = 'Êtes-vous sûr de vouloir demander un remboursement ?\n\nVous avez 14 jours après réception pour retourner le produit.';
    } else if (reason === 'annulation_avant_livraison') {
      confirmMessage = 'Votre commande est déjà expédiée.\n\nSouhaitez-vous demander un retour et remboursement ?';
    }

    if (!confirm(confirmMessage)) return;

    try {
      setCancelling(true);
      toast.loading('Traitement en cours...', { id: 'cancel' });

      // Appeler l'API d'annulation
      const result = await orderService.cancelOrder(order.id);
      
      toast.success(result.message || 'Commande annulée avec succès', { id: 'cancel' });

      // Recharger la commande
      await fetchOrder();

      // Rediriger vers la liste des commandes après 2 secondes
      setTimeout(() => {
        router.push('/orders');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erreur annulation:', error);
      const errorMessage = error.response?.data?.message || 'Impossible d\'annuler la commande';
      toast.error(errorMessage, { id: 'cancel' });
    } finally {
      setCancelling(false);
    }
  };

  // ✅ Fonction pour demander un retour
  const handleRequestReturn = async () => {
    if (!order) return;

    const confirmMessage = 'Souhaitez-vous demander un retour ?\n\n' +
      'Un e-mail avec l\'étiquette de retour vous sera envoyé.\n' +
      'Vous devrez renvoyer le produit sous 14 jours.';

    if (!confirm(confirmMessage)) return;

    try {
      setRequestingReturn(true);
      toast.loading('Demande de retour en cours...', { id: 'return' });

      // Appeler l'API pour demander un retour
      await orderService.requestReturn(order.id);

      toast.success('Demande de retour envoyée ! Un e-mail vous a été adressé.', { id: 'return' });
      
      // Recharger la commande
      await fetchOrder();
    } catch (error: any) {
      console.error('❌ Erreur demande de retour:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la demande de retour';
      toast.error(errorMessage, { id: 'return' });
    } finally {
      setRequestingReturn(false);
    }
  };

  // ✅ Fonction pour charger la commande
  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderById(Number(id));
      console.log('✅ Commande mise à jour:', data);
      setOrder(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur chargement commande:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!id) return;

    // Charger la commande au démarrage
    const loadOrder = async () => {
      try {
        setLoading(true);
        await fetchOrder();
      } finally {
        setLoading(false);
      }
    };

    loadOrder();

    // ✅ POLLING : Recharger toutes les 5 secondes pour les mises à jour en temps réel
    const interval = setInterval(() => {
      console.log('🔄 Vérification de mise à jour...');
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [id, user, router]);

  const getStatusIcon = (status: any) => {
    const statusStr = String(status);
    const statusNum = typeof status === 'number' ? status : parseInt(status as any);
    
    if (statusStr === 'Delivered' || statusNum === 3) {
      return <FiCheckCircle className="text-green-500" size={24} />;
    } else if (statusStr === 'Shipped' || statusNum === 2) {
      return <FiTruck className="text-blue-500" size={24} />;
    } else if (statusStr === 'Processing' || statusNum === 1) {
      return <FiPackage className="text-yellow-500" size={24} />;
    } else if (statusStr === 'Cancelled' || statusNum === 4 || statusStr === 'Refunded' || statusNum === 5) {
      return <FiXCircle className="text-red-500" size={24} />;
    } else if (statusStr === 'ReturnRequested' || statusNum === 6) {
      return <FiRefreshCw className="text-orange-500" size={24} />;
    }
    return <FiClock className="text-gray-400" size={24} />;
  };

  const getStatusText = (status: any): string => {
    const statusStr = String(status);
    const map: Record<string, string> = {
      'Pending': 'En attente de confirmation',
      'Processing': 'En traitement',
      'Shipped': 'Expédiée',
      'Delivered': 'Livrée',
      'Cancelled': 'Annulée',
      'Refunded': 'Remboursée',
      'ReturnRequested': 'Retour demandé',
      '0': 'En attente de confirmation',
      '1': 'En traitement',
      '2': 'Expédiée',
      '3': 'Livrée',
      '4': 'Annulée',
      '5': 'Remboursée',
      '6': 'Retour demandé',
    };
    return map[statusStr] || statusStr;
  };

  const getStatusColor = (status: any): string => {
    const statusStr = String(status);
    const statusNum = typeof status === 'number' ? status : parseInt(status as any);
    
    if (statusStr === 'Delivered' || statusNum === 3) {
      return 'bg-green-100 text-green-800';
    } else if (statusStr === 'Shipped' || statusNum === 2) {
      return 'bg-blue-100 text-blue-800';
    } else if (statusStr === 'Processing' || statusNum === 1) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusStr === 'Pending' || statusNum === 0) {
      return 'bg-gray-100 text-gray-800';
    } else if (statusStr === 'Cancelled' || statusNum === 4 || statusStr === 'Refunded' || statusNum === 5) {
      return 'bg-red-100 text-red-800';
    } else if (statusStr === 'ReturnRequested' || statusNum === 6) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusDescription = (status: any): string => {
    const statusStr = String(status);
    const statusNum = typeof status === 'number' ? status : parseInt(status as any);
    
    if (statusStr === 'Pending' || statusNum === 0) {
      return 'Le vendeur examine votre commande';
    } else if (statusStr === 'Processing' || statusNum === 1) {
      return 'Votre commande est en préparation';
    } else if (statusStr === 'Shipped' || statusNum === 2) {
      return 'Votre commande est en route vers vous';
    } else if (statusStr === 'Delivered' || statusNum === 3) {
      return 'Votre commande a été livrée';
    } else if (statusStr === 'Cancelled' || statusNum === 4) {
      return 'Votre commande a été annulée';
    } else if (statusStr === 'Refunded' || statusNum === 5) {
      return 'Votre commande a été remboursée';
    } else if (statusStr === 'ReturnRequested' || statusNum === 6) {
      return 'Demande de retour en attente de validation';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Commande non trouvée</p>
      </div>
    );
  }

  const statusStr = String(order.status);
  const statusNum = typeof order.status === 'number' ? order.status : parseInt(order.status as any);
  
  const isPending = statusStr === 'Pending' || statusNum === 0;
  const isProcessing = statusStr === 'Processing' || statusNum === 1;
  const isShipped = statusStr === 'Shipped' || statusNum === 2;
  const isDelivered = statusStr === 'Delivered' || statusNum === 3;
  const isCancelled = statusStr === 'Cancelled' || statusNum === 4;
  const isRefunded = statusStr === 'Refunded' || statusNum === 5;
  const isReturnRequested = statusStr === 'ReturnRequested' || statusNum === 6;

  const cancelInfo = canBeCancelledOrRefunded();
  const daysSinceOrder = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Fil d'Ariane */}
        <div className="mb-6">
          <Link href="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary">
            <FiArrowLeft />
            Retour à mes commandes
          </Link>
        </div>

        {/* En-tête avec boutons d'action */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Commande #{order.orderNumber}</h1>
              <p className="text-sm text-gray-500">
                Passée le {formatDate(order.createdAt, 'long')}
              </p>
              {lastUpdate && (
                <p className="text-xs text-gray-400 mt-1">
                  Mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              
              {/* ✅ Bouton d'annulation (pour commandes en attente/traitement) */}
              {cancelInfo.can && cancelInfo.reason === 'annulation' && !isCancelled && !isRefunded && !isReturnRequested && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <FiRefreshCw size={16} />
                  {cancelling ? 'Traitement...' : 'Annuler la commande'}
                </button>
              )}

              {/* ✅ Bouton pour demander un retour (pour commandes livrées dans les 14 jours) */}
              {isDelivered && daysSinceOrder <= 14 && !isCancelled && !isRefunded && !isReturnRequested && (
                <button
                  onClick={handleRequestReturn}
                  disabled={requestingReturn}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw size={16} />
                  {requestingReturn ? 'Envoi...' : 'Demander un retour'}
                </button>
              )}

              {/* Message d'information sur le délai de rétractation */}
              {isDelivered && daysSinceOrder <= 14 && !isCancelled && !isRefunded && !isReturnRequested && (
                <p className="text-xs text-green-600 mt-1">
                  ⚡ Délai de rétractation: {14 - daysSinceOrder} jours restants
                </p>
              )}
              {isDelivered && daysSinceOrder > 14 && !isCancelled && !isRefunded && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ Délai de rétractation dépassé ({daysSinceOrder} jours)
                </p>
              )}
              {isReturnRequested && (
                <p className="text-xs text-orange-600 mt-1">
                  ⏳ Demande de retour en attente de validation
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Suivi de la commande - Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Suivi de votre commande</h2>

          {/* Statut actuel avec icône */}
          <div className={`mb-8 p-4 rounded-lg flex items-start gap-4 ${
            isCancelled || isRefunded ? 'bg-red-50 border border-red-200' : 
            isReturnRequested ? 'bg-orange-50 border border-orange-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex-shrink-0">
              {getStatusIcon(order.status)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{getStatusText(order.status)}</h3>
              <p className="text-gray-600 text-sm mt-1">{getStatusDescription(order.status)}</p>
              {isRefunded && (
                <p className="text-sm text-green-600 mt-2">💰 Le remboursement a été effectué</p>
              )}
              {isReturnRequested && (
                <p className="text-sm text-orange-600 mt-2">
                  📦 Le vendeur traite votre demande de retour
                </p>
              )}
            </div>
          </div>

          {!isCancelled && !isRefunded ? (
            /* Timeline normale pour commande non annulée */
            <div className="space-y-6">
              {/* Étape 1: Confirmée */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    !isPending ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    ✓
                  </div>
                  <div className={`w-1 h-12 ${!isPending ? 'bg-primary' : 'bg-gray-200'}`} />
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold">Commande confirmée</h3>
                  <p className="text-sm text-gray-500">Le vendeur a reçu votre commande</p>
                </div>
              </div>

              {/* Étape 2: En traitement */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    isProcessing || isShipped || isDelivered ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <div className={`w-1 h-12 ${isProcessing || isShipped || isDelivered ? 'bg-primary' : 'bg-gray-200'}`} />
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold">En préparation</h3>
                  <p className="text-sm text-gray-500">Votre commande est en cours de préparation</p>
                  {isProcessing && <p className="text-xs text-primary font-semibold mt-1">🔄 En cours...</p>}
                </div>
              </div>

              {/* Étape 3: Expédiée */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    isShipped || isDelivered ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    3
                  </div>
                  <div className={`w-1 h-12 ${isShipped || isDelivered ? 'bg-primary' : 'bg-gray-200'}`} />
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold">Expédiée</h3>
                  <p className="text-sm text-gray-500">Votre colis est en route</p>
                  {isShipped && <p className="text-xs text-primary font-semibold mt-1">🚚 En livraison...</p>}
                  {order.trackingNumber && (
                    <p className="text-xs text-gray-600 mt-1">Numéro de suivi: {order.trackingNumber}</p>
                  )}
                </div>
              </div>

              {/* Étape 4: Livrée */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    isDelivered ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    ✓
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold">Livrée</h3>
                  <p className="text-sm text-gray-500">Votre commande vous a été livrée</p>
                  {isDelivered && (
                    <div className="mt-2">
                      <p className="text-xs text-green-600 font-semibold">✅ Livraison terminée!</p>
                      {daysSinceOrder <= 14 && !isReturnRequested && (
                        <p className="text-xs text-blue-600 mt-1">
                          🕒 Vous avez {14 - daysSinceOrder} jours pour demander un retour
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Message pour commande annulée/remboursée */
            <div className="text-center py-8">
              {isRefunded ? (
                <>
                  <FiRefreshCw className="mx-auto text-green-500 mb-4" size={48} />
                  <p className="text-gray-600">Cette commande a été remboursée.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Le remboursement a été effectué sur votre moyen de paiement.
                  </p>
                </>
              ) : (
                <>
                  <FiXCircle className="mx-auto text-red-500 mb-4" size={48} />
                  <p className="text-gray-600">Cette commande a été annulée.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Aucun paiement n'a été débité.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Articles commandés */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Articles commandés</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={getImageUrl(item.productImage) || '/images/product-placeholder.svg'}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  {item.shopName && (
                    <p className="text-sm text-gray-500">Boutique: {item.shopName}</p>
                  )}
                  <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Livraison</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">TVA (20%)</span>
              <span>{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.finalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Adresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Adresse de livraison</h2>
            <p className="text-gray-600">
              {order.shippingAddress || 'Adresse non renseignée'}<br />
              {order.shippingPostalCode} {order.shippingCity}<br />
              {order.shippingCountry}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Adresse de facturation</h2>
            <p className="text-gray-600">
              {order.billingAddress || 'Adresse non renseignée'}<br />
              {order.billingPostalCode} {order.billingCity}<br />
              {order.billingCountry}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}