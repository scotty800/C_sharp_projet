'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/api/orders';
import { OrderResponseDto } from '@/types/order';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiEye, FiArrowRight } from 'react-icons/fi';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await orderService.getMyOrders();
        console.log('✅ Commandes reçues:', data);
        console.log('📦 Structure de la première commande:', JSON.stringify(data[0], null, 2));
        setOrders(data);
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
        toast.error('Impossible de charger vos commandes');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <FiCheckCircle className="text-green-500" size={20} />;
      case 'Shipped':
        return <FiTruck className="text-blue-500" size={20} />;
      case 'Processing':
        return <FiPackage className="text-yellow-500" size={20} />;
      default:
        return <FiClock className="text-gray-400" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      'Pending': 'En attente',
      'Processing': 'En traitement',
      'Shipped': 'Expédiée',
      'Delivered': 'Livrée',
      'Cancelled': 'Annulée',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemImage = (item: any, orderId: number, itemIndex: number) => {
    const imageKey = `${orderId}-${itemIndex}`;
    
    // Si l'image existe déjà, l'utiliser
    if (item.productImage) {
      return getImageUrl(item.productImage);
    }
    
    // Si erreur d'image, retourner le placeholder
    if (imageErrors[imageKey]) {
      return '/images/product-placeholder.svg';
    }
    
    // Essayer de trouver une image dans le produit
    if (item.product?.imageUrl) {
      return getImageUrl(item.product.imageUrl);
    }
    if (item.product?.imageUrl1) {
      return getImageUrl(item.product.imageUrl1);
    }
    
    return '/images/product-placeholder.svg';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mes commandes</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FiPackage className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-xl font-semibold mb-2">Aucune commande</h2>
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore passé de commande.
            </p>
            <Link
              href="/shops"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
            >
              Découvrir les boutiques
              <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* En-tête de commande */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold">
                          Commande #{order.orderNumber}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Passée le {formatDate(order.createdAt, 'long')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(order.finalAmount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Aperçu des articles */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-4 mb-4">
                    {order.items.slice(0, 3).map((item, index) => {
                      const imageUrl = getItemImage(item, order.id, index);
                      return (
                        <div key={item.id} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={imageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={() => {
                              setImageErrors(prev => ({
                                ...prev,
                                [`${order.id}-${index}`]: true
                              }));
                            }}
                          />
                        </div>
                      );
                    })}
                    {order.items.length > 3 && (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Détails rapides */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Livraison :</span>
                      <p className="font-medium line-clamp-1">{order.shippingAddress}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Paiement :</span>
                      <p className="font-medium">{order.paymentMethod}</p>
                      <p className={`text-xs ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.paymentStatus === 'Paid' ? 'Payé' : 'En attente'}
                      </p>
                    </div>
                  </div>

                  {/* Bouton voir détails */}
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium mt-2"
                  >
                    <FiEye size={18} />
                    Voir les détails
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