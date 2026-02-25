'use client';

import { useEffect, useState } from 'react';
import { OrderCard } from '@/components/orders';
import { orderService } from '@/services/api/orders';
import { OrderResponseDto } from '@/types/order';
import { FiPackage } from 'react-icons/fi';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <FiPackage className="text-gray-400" size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-4">Aucune commande</h1>
            <p className="text-gray-600 mb-8">
              Vous n'avez pas encore passé de commande. Découvrez nos boutiques et trouvez des produits qui vous plaisent !
            </p>
            <Link
              href="/shops"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Découvrir les boutiques
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Mes commandes</h1>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}