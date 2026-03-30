'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/api/orders';
import { OrderResponseDto, OrderStatus } from '@/types/order';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ✅ Fonction pour charger la commande
  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderById(Number(id));
      console.log('✅ Commande mise à jour:', data);
      console.log('   Status reçu:', data.status, '(type:', typeof data.status, ')');
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
      '0': 'En attente de confirmation',
      '1': 'En traitement',
      '2': 'Expédiée',
      '3': 'Livrée',
      '4': 'Annulée',
      '5': 'Remboursée',
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

  // ✅ Gérer les deux formats: string ET number
  const statusStr = String(order.status);
  const statusNum = typeof order.status === 'number' ? order.status : parseInt(order.status as any);
  
  const isPending = statusStr === 'Pending' || statusNum === 0;
  const isProcessing = statusStr === 'Processing' || statusNum === 1;
  const isShipped = statusStr === 'Shipped' || statusNum === 2;
  const isDelivered = statusStr === 'Delivered' || statusNum === 3;
  const isCancelled = statusStr === 'Cancelled' || statusNum === 4;

  console.log('🔍 Status check:', { statusStr, statusNum, isPending, isProcessing, isShipped, isDelivered, isCancelled });

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

        {/* En-tête */}
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
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Suivi de la commande - Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Suivi de votre commande</h2>

          {/* Statut actuel avec icône */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-4">
            <div className="flex-shrink-0">
              {getStatusIcon(order.status)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{getStatusText(order.status)}</h3>
              <p className="text-gray-600 text-sm mt-1">{getStatusDescription(order.status)}</p>
            </div>
          </div>

          {/* Timeline visuelle */}
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
                {isDelivered && <p className="text-xs text-green-600 font-semibold mt-1">✅ Livraison terminée!</p>}
              </div>
            </div>
          </div>
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