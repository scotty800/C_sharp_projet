'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/api/orders';
import { shopService } from '@/services/api/shops';
import { OrderResponseDto } from '@/types/order';
import { FiEye, FiArrowLeft, FiPackage } from 'react-icons/fi';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import toast from 'react-hot-toast';

export default function SellerOrdersPage() {
  const searchParams = useSearchParams();
  const shopId = Number(searchParams.get('shopId'));
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    if (!user || !shopId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const shop = await shopService.getShopById(shopId);
        setShopName(shop.name);

        const data = await orderService.getShopOrders(shopId);
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, user]);

  // ✅ Gérer status string ET number
  const getStatusColor = (status: string | number) => {
    const statusStr = String(status);
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

  const getStatusText = (status: string | number) => {
    const statusStr = String(status);
    const texts: Record<string, string> = {
      'Pending': 'En attente',
      'Processing': 'En traitement',
      'Shipped': 'Expédiée',
      'Delivered': 'Livrée',
      'Cancelled': 'Annulée',
      'Refunded': 'Remboursée',
      'ReturnRequested': 'Retour demandé',
      '0': 'En attente',
      '1': 'En traitement',
      '2': 'Expédiée',
      '3': 'Livrée',
      '4': 'Annulée',
      '5': 'Remboursée',
      '6': 'Retour demandé',
    };
    return texts[statusStr] || statusStr;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/seller?shopId=${shopId}`} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Commandes</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">Boutique : {shopName}</p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">Aucune commande pour cette boutique</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">N° commande</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">#{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{order.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-primary">
                      {formatPrice(order.finalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/dashboard/seller/orders/${order.id}?shopId=${shopId}`}
                        className="text-primary hover:text-primary-dark inline-flex items-center gap-1"
                      >
                        <FiEye size={18} />
                        <span className="text-sm">Détails</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}