'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/api/orders';
import { shopService } from '@/services/api/shops';
import { FiArrowLeft, FiUsers, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Customer {
  id: number;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export default function SellerCustomersPage() {
  const searchParams = useSearchParams();
  const shopId = Number(searchParams.get('shopId'));
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!user || !shopId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const shop = await shopService.getShopById(shopId);
        setShopName(shop.name);

        // Récupérer les commandes pour extraire les clients
        const orders = await orderService.getShopOrders(shopId);
        
        // Grouper les commandes par client
        const customerMap = new Map<number, Customer>();
        
        orders.forEach((order: any) => {
          if (!customerMap.has(order.userId)) {
            customerMap.set(order.userId, {
              id: order.userId,
              username: order.username || 'Client',
              email: order.userEmail || 'email@exemple.com',
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: order.createdAt,
            });
          }
          
          const customer = customerMap.get(order.userId)!;
          customer.totalOrders += 1;
          customer.totalSpent += order.finalAmount;
          
          // Garder la date la plus récente
          if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
            customer.lastOrderDate = order.createdAt;
          }
        });

        setCustomers(Array.from(customerMap.values()));
      } catch (error) {
        console.error('Erreur chargement clients:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, user]);

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">Boutique : {shopName}</p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">Aucun client pour cette boutique</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Commandes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total dépensé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dernière commande</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {customer.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{customer.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiMail size={14} />
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-primary">
                      {customer.totalSpent.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(customer.lastOrderDate).toLocaleDateString('fr-FR')}
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