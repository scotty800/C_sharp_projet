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
// ⭐ NOUVEAUX IMPORTS
import { resolveProductDisplay, getResolvedImages } from '@/components/shop-studio/lib/resolveProductDisplay';
import { productService } from '@/services/api/products';
// ⭐ NOUVEAU IMPORT
import OrderProductViewModal from '@/components/orders/OrderProductViewModal';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  // ⭐ NOUVEAU ÉTAT
  const [productsById, setProductsById] = useState<Record<number, any>>({});
  // ⭐ NOUVEAU ÉTAT — pour la popup
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // ⭐ MODIFICATION — fetchOrders avec chargement des produits
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

        // ⭐ Charger les produits pour la résolution d'images par variante
        // On charge uniquement les premiers produits de chaque commande pour optimiser
        const uniqueIds = [...new Set(
          data.flatMap((order) => order.items.slice(0, 3).map((item) => item.productId))
        )];
        const entries = await Promise.all(
          uniqueIds.map(async (pid) => {
            try {
              const p = await productService.getProductById(pid);
              return [pid, p] as const;
            } catch {
              return [pid, null] as const;
            }
          })
        );
        setProductsById(Object.fromEntries(entries.filter(([, p]) => p)));
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

  // ✅ Fonction pour convertir le statut en string
  const getStatusString = (status: string | number): string => {
    return String(status);
  };

  const getStatusIcon = (status: string | number) => {
    const statusStr = getStatusString(status);
    switch (statusStr) {
      case 'Delivered':
      case '3':
        return <FiCheckCircle className="text-green-500" size={20} />;
      case 'Shipped':
      case '2':
        return <FiTruck className="text-blue-500" size={20} />;
      case 'Processing':
      case '1':
        return <FiPackage className="text-yellow-500" size={20} />;
      default:
        return <FiClock className="text-gray-400" size={20} />;
    }
  };

  const getStatusText = (status: string | number): string => {
    const statusStr = getStatusString(status);
    const map: Record<string, string> = {
      'Pending': 'En attente',
      '0': 'En attente',
      'Processing': 'En traitement',
      '1': 'En traitement',
      'Shipped': 'Expédiée',
      '2': 'Expédiée',
      'Delivered': 'Livrée',
      '3': 'Livrée',
      'Cancelled': 'Annulée',
      '4': 'Annulée',
      'Refunded': 'Remboursée',
      '5': 'Remboursée',
      'ReturnRequested': 'Retour demandé',
      '6': 'Retour demandé',
    };
    return map[statusStr] || statusStr;
  };

  const getStatusColor = (status: string | number): string => {
    const statusStr = getStatusString(status);
    switch (statusStr) {
      case 'Delivered':
      case '3':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Shipped':
      case '2':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Processing':
      case '1':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Pending':
      case '0':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case 'Cancelled':
      case '4':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'Refunded':
      case '5':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'ReturnRequested':
      case '6':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // ✅ Affichage du statut de paiement
  const getPaymentStatusText = (status: any): string => {
    const statusStr = String(status);
    const map: Record<string, string> = {
      'Pending': 'En attente',
      'Paid': 'Payé',
      'Failed': 'Échec',
      'Refunded': 'Remboursé',
      '0': 'En attente',
      '1': 'Payé',
      '2': 'Échec',
      '3': 'Remboursé',
    };
    return map[statusStr] || statusStr;
  };

  const getPaymentStatusColor = (status: any): string => {
    const statusStr = String(status);
    if (statusStr === 'Paid' || statusStr === '1') {
      return 'text-green-600 dark:text-green-400';
    } else if (statusStr === 'Failed' || statusStr === '2') {
      return 'text-red-600 dark:text-red-400';
    } else if (statusStr === 'Refunded' || statusStr === '3') {
      return 'text-purple-600 dark:text-purple-400';
    }
    return 'text-yellow-600 dark:text-yellow-400';
  };

  // ⭐ MODIFICATION — getItemImage avec résolution par variante
  const getItemImage = (item: any, orderId: number, itemIndex: number) => {
    const imageKey = `${orderId}-${itemIndex}`;

    // ⭐ Vérifier si cette image a déjà échoué
    if (imageErrors[imageKey]) {
      return '/images/product-placeholder.svg';
    }

    // ⭐ Résoudre l'image selon la couleur choisie (variante)
    const product = productsById[item.productId];
    if (product) {
      const studioProduct = { ...product, isInStock: (product.stock ?? 0) > 0 } as any;
      const display = resolveProductDisplay(studioProduct, item.selectedColor);
      const images = getResolvedImages(display);
      if (images[0]) return getImageUrl(images[0]);
    }

    // ⭐ Fallback sur l'image du produit
    if (item.productImage) {
      return getImageUrl(item.productImage);
    }
    if (item.product?.imageUrl) {
      return getImageUrl(item.product.imageUrl);
    }
    return '/images/product-placeholder.svg';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Mes commandes</h1>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <FiPackage className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Aucune commande</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
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
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* En-tête de commande */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Commande #{order.orderNumber}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Passée le {formatDate(order.createdAt, 'long')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(order.finalAmount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ⭐ MODIFICATION — Aperçu des articles avec bouton cliquable */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-4 mb-4">
                    {order.items.slice(0, 3).map((item, index) => {
                      const imageUrl = getItemImage(item, order.id, index);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:ring-2 hover:ring-primary transition-all"
                        >
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
                        </button>
                      );
                    })}
                    {order.items.length > 3 && (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Détails rapides */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Livraison :</span>
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{order.shippingAddress}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Paiement :</span>
                      <p className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</p>
                      <p className={`text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentStatusText(order.paymentStatus)}
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

      {/* ⭐ NOUVEAU — Popup de visualisation du produit */}
      <OrderProductViewModal
        item={selectedItem}
        product={selectedItem ? productsById[selectedItem.productId] : null}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}