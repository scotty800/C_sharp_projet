'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/api/orders';
import { generateInvoice } from '@/services/api/invoice';
import { OrderResponseDto, OrderStatus } from '@/types/order';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiPrinter, FiSend, FiDownload } from 'react-icons/fi';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(Number(id));
        setOrder(data);
      } catch (error) {
        console.error('Erreur chargement commande:', error);
        toast.error('Impossible de charger la commande');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, user, router]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      setUpdating(true);
      await orderService.updateOrderStatus(order.id, { status: newStatus });
      
      // Mettre à jour localement
      setOrder({ ...order, status: newStatus });
      
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order || !user) return;
    
    try {
      generateInvoice(order, {
        id: order.userId,
        username: order.username,
        email: order.userEmail,
        role: 'user',
        createdAt: order.createdAt
      });
      toast.success('Facture téléchargée');
    } catch (error) {
      console.error('Erreur génération facture:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Fil d'Ariane */}
        <div className="mb-6">
          <Link href="/dashboard/seller/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary">
            <FiArrowLeft />
            Retour aux commandes
          </Link>
        </div>

        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Commande #{order.orderNumber}</h1>
              <p className="text-gray-600">
                Client: {order.username} • {order.userEmail}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Passée le {formatDate(order.createdAt, 'long')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                <FiDownload size={18} />
                Facture PDF
              </button>
            </div>
          </div>
        </div>

        {/* Actions vendeur */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Gestion de la commande</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleUpdateStatus(OrderStatus.Processing)}
              disabled={updating || order.status !== 'Pending'}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPackage size={18} />
              Confirmer la commande
            </button>
            
            <button
              onClick={() => handleUpdateStatus(OrderStatus.Shipped)}
              disabled={updating || order.status !== 'Processing'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTruck size={18} />
              Marquer comme expédiée
            </button>
            
            <button
              onClick={() => handleUpdateStatus(OrderStatus.Delivered)}
              disabled={updating || order.status !== 'Shipped'}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiCheckCircle size={18} />
              Marquer comme livrée
            </button>

            {order.status === 'Pending' && (
              <button
                onClick={() => handleUpdateStatus(OrderStatus.Cancelled)}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Annuler la commande
              </button>
            )}

            {order.status === 'Processing' && (
              <button
                onClick={() => toast.success('Fonctionnalité à venir')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <FiSend size={18} />
                Générer numéro de suivi
              </button>
            )}
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
                    src={getImageUrl(item.productImage)}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${item.productId}`} className="font-medium hover:text-primary">
                    {item.productName}
                  </Link>
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

        {/* Récapitulatif et adresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Récapitulatif */}
          <div className="bg-white rounded-lg shadow-lg p-6">
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Adresses</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Livraison</h3>
                <p className="text-gray-600">
                  {order.shippingAddress}<br />
                  {order.shippingPostalCode} {order.shippingCity}<br />
                  {order.shippingCountry}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Facturation</h3>
                <p className="text-gray-600">
                  {order.billingAddress}<br />
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