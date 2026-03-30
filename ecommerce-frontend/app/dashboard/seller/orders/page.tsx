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

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'Pending': 'En attente',
      'Processing': 'En traitement',
      'Shipped': 'Expédiée',
      'Delivered': 'Livrée',
      'Cancelled': 'Annulée',
    };
    return texts[status as keyof typeof texts] || status;
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
        <Link href={`/dashboard/seller?shopId=${shopId}`} className="text-gray-600 hover:text-primary">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Commandes</h1>
      </div>
      
      <p className="text-gray-600 mb-6">Boutique : {shopName}</p>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Aucune commande pour cette boutique</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° commande</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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