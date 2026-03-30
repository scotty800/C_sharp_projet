'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/api/orders';
import { OrderResponseDto } from '@/types/order';
import { FiPackage, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import toast from 'react-hot-toast';

export default function SellerReturnsPage() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');
  const { user } = useAuth();
  const [returnRequests, setReturnRequests] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !shopId) {
      setLoading(false);
      return;
    }

    const fetchReturns = async () => {
      try {
        setLoading(true);
        console.log('📦 Récupération des commandes pour shopId:', shopId);
        
        const orders = await orderService.getShopOrders(Number(shopId));
        console.log('📦 Toutes les commandes reçues:', orders);
        
        // Afficher les statuts de chaque commande pour déboguer
        orders.forEach(order => {
          console.log(`📦 Commande ${order.orderNumber} - Statut: ${order.status} (type: ${typeof order.status})`);
        });
        
        // ✅ CORRECTION : Filtrer les commandes avec statut 6 (ReturnRequested)
        const returns = orders.filter(order => {
          // Le statut est un nombre (6 pour ReturnRequested)
          if (typeof order.status === 'number') {
            const isReturnRequested = order.status === 6;
            if (isReturnRequested) {
              console.log(`✅ Commande ${order.orderNumber} en demande de retour`);
            }
            return isReturnRequested;
          }
          // Si c'est une chaîne, vérifier aussi
          if (typeof order.status === 'string') {
            const isReturnRequested = order.status === 'ReturnRequested';
            if (isReturnRequested) {
              console.log(`✅ Commande ${order.orderNumber} en demande de retour`);
            }
            return isReturnRequested;
          }
          return false;
        });
        
        console.log('📦 Retours en attente:', returns.length);
        setReturnRequests(returns);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des demandes');
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [user, shopId]);

  const handleApproveReturn = async (orderId: number) => {
    if (!confirm('Approuver ce retour ? Le client sera remboursé.')) return;

    try {
      await orderService.approveReturn(orderId);
      toast.success('Retour approuvé, remboursement en cours');
      setReturnRequests(prev => prev.filter(o => o.id !== orderId));
    } catch (error) {
      console.error('Erreur approbation:', error);
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleRejectReturn = async (orderId: number) => {
    if (!confirm('Refuser ce retour ?')) return;

    try {
      await orderService.rejectReturn(orderId);
      toast.success('Retour refusé');
      setReturnRequests(prev => prev.filter(o => o.id !== orderId));
    } catch (error) {
      console.error('Erreur refus:', error);
      toast.error('Erreur lors du refus');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!shopId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">Aucun shop sélectionné</p>
          <Link href="/dashboard/seller" className="text-primary hover:underline mt-4 inline-block">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Fil d'Ariane */}
        <div className="mb-6">
          <Link href={`/dashboard/seller/orders?shopId=${shopId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-primary">
            <FiArrowLeft />
            Retour aux commandes
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Demandes de retour</h1>

        {returnRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FiPackage className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Aucune demande de retour en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {returnRequests.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Commande #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">Demandé le {formatDate(order.createdAt)}</p>
                    <p className="text-sm text-gray-500">Montant: {formatPrice(order.finalAmount)}</p>
                    <div className="mt-2 text-sm text-gray-600">
                      {order.items.map(item => (
                        <p key={item.id}>• {item.productName} x{item.quantity}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveReturn(order.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                    >
                      <FiCheck size={16} />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleRejectReturn(order.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    >
                      <FiX size={16} />
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}