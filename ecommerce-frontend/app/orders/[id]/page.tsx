'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderStatus, OrderItems, OrderSummary } from '@/components/orders';
import { orderService } from '@/services/api/orders';
import { OrderResponseDto } from '@/types/order';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(Number(id));
        setOrder(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la commande:', error);
        toast.error('Commande non trouvée');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Fil d'Ariane */}
        <div className="mb-6">
          <Link 
            href="/orders" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <FiArrowLeft />
            Retour à mes commandes
          </Link>
        </div>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Commande #{order.orderNumber}
          </h1>
          <p className="text-gray-600">
            Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Détails et articles */}
          <div className="lg:col-span-2 space-y-8">
            {/* Suivi de commande */}
            <OrderStatus 
              currentStatus={order.status}
              estimatedDelivery="24-26 janvier 2024"
              trackingNumber={order.trackingNumber}
            />

            {/* Articles */}
            <OrderItems items={order.items} showReviews={order.status === 'Delivered'} />
          </div>

          {/* Colonne de droite - Résumé */}
          <div className="lg:col-span-1">
            <OrderSummary order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}