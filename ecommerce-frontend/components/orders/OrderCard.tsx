'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiEye } from 'react-icons/fi';
import { OrderResponseDto } from '@/types/order';
import { formatPrice, formatDate } from '@/services/utils/formatters';

interface OrderCardProps {
  order: OrderResponseDto;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <FiCheckCircle className="text-green-500" />;
      case 'Shipped':
        return <FiTruck className="text-blue-500" />;
      case 'Processing':
        return <FiPackage className="text-yellow-500" />;
      case 'Cancelled':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'Pending': 'En attente',
      'Processing': 'En traitement',
      'Shipped': 'Expédiée',
      'Delivered': 'Livrée',
      'Cancelled': 'Annulée',
      'Refunded': 'Remboursée'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* En-tête de la commande */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">
                Commande #{order.orderNumber}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Passée le {formatDate(order.createdAt, 'long')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(order.finalAmount)}
            </p>
            <p className="text-sm text-gray-500">
              {order.items.length} article{order.items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Aperçu des produits */}
      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="relative w-16 h-16 rounded-lg overflow-hidden">
              <Image
                src={item.productImage || '/images/product-placeholder.svg'} // ← .svg
                alt={item.productName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold">
              +{order.items.length - 3}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/orders/${order.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            <FiEye size={18} />
            Voir détails
          </Link>
          
          {order.status === 'Delivered' && (
            <button className="px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-colors">
              Écrire un avis
            </button>
          )}
          
          {order.status === 'Pending' && (
            <button className="px-4 py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
              Annuler la commande
            </button>
          )}

          {order.trackingNumber && (
            <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Suivre mon colis
            </button>
          )}
        </div>
      </div>

      {/* Informations supplémentaires (expand) */}
      {isExpanded && (
        <div className="p-6 bg-gray-50 border-t">
          <h4 className="font-semibold mb-4">Détails de la commande</h4>
          
          {/* Adresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Adresse de livraison</p>
              <p className="font-medium">
                {order.shippingAddress}<br />
                {order.shippingPostalCode} {order.shippingCity}<br />
                {order.shippingCountry}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Adresse de facturation</p>
              <p className="font-medium">
                {order.billingAddress}<br />
                {order.billingPostalCode} {order.billingCity}<br />
                {order.billingCountry}
              </p>
            </div>
          </div>

          {/* Paiement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Méthode de paiement</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut du paiement</p>
              <p className="font-medium">{order.paymentStatus}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bouton pour expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-sm text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors border-t"
      >
        {isExpanded ? 'Voir moins' : 'Voir plus de détails'}
      </button>
    </div>
  );
};

export default OrderCard;