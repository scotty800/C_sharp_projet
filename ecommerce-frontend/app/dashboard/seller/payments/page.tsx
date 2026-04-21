'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/api/orders';
import { shopService } from '@/services/api/shops';
import { FiArrowLeft, FiCreditCard, FiDownload, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import toast from 'react-hot-toast';

interface Payment {
  id: number;
  orderNumber: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  method: string;
  date: string;
  customerName: string;
}

export default function SellerPaymentsPage() {
  const searchParams = useSearchParams();
  const shopId = Number(searchParams.get('shopId'));
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (!user || !shopId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const shop = await shopService.getShopById(shopId);
        setShopName(shop.name);

        const orders = await orderService.getShopOrders(shopId);
        
        const paymentsData: Payment[] = orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          amount: order.finalAmount,
          status: order.paymentStatus?.toLowerCase() || 'pending',
          method: order.paymentMethod || 'Carte bancaire',
          date: order.createdAt,
          customerName: order.username,
        }));

        setPayments(paymentsData);
        
        const total = paymentsData.reduce((sum, p) => sum + p.amount, 0);
        setTotalRevenue(total);
      } catch (error) {
        console.error('Erreur chargement paiements:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <FiCheckCircle className="text-green-500" />;
      case 'pending':
        return <FiCreditCard className="text-yellow-500" />;
      case 'failed':
        return <FiXCircle className="text-red-500" />;
      case 'refunded':
        return <FiXCircle className="text-orange-500" />;
      default:
        return <FiCreditCard className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const texts = {
      'paid': 'Payé',
      'pending': 'En attente',
      'failed': 'Échoué',
      'refunded': 'Remboursé',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'paid': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      'failed': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      'refunded': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paiements</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">Boutique : {shopName}</p>

      {/* Résumé */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Chiffre d'affaires total</p>
            <p className="text-3xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            <FiDownload size={18} />
            Exporter
          </button>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <FiCreditCard className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">Aucun paiement pour cette boutique</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Commande</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Méthode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      #{payment.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-primary">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {payment.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {getStatusText(payment.status)}
                      </span>
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