'use client';

import Link from 'next/link';
import { OrderResponseDto } from '@/types/order';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import { FiEye } from 'react-icons/fi';

interface RecentOrdersProps {
  orders: OrderResponseDto[];
}

const RecentOrders = ({ orders = [] }: RecentOrdersProps) => {
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
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'ReturnRequested':
      case '6':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string | number) => {
    const statusStr = String(status);
    const statusMap: Record<string, string> = {
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
    return statusMap[statusStr] || statusStr;
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Aucune commande récente</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Commandes récentes</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                N° commande
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-900 dark:text-white">#{order.orderNumber}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                  {order.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-primary dark:text-primary">
                  {formatPrice(order.finalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/dashboard/seller/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-primary hover:text-primary-dark transition-colors"
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

      <div className="p-6 border-t dark:border-gray-700 text-center">
        <Link
          href="/dashboard/seller/orders"
          className="text-primary hover:text-primary-dark font-semibold transition-colors"
        >
          Voir toutes les commandes
        </Link>
      </div>
    </div>
  );
};

export default RecentOrders;