'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiEye } from 'react-icons/fi';
import { OrderResponseDto } from '@/types/order';
import { formatPrice, formatDate } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';

interface OrderCardProps {
  order: OrderResponseDto;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // ✅ Fonction pour normaliser le statut en string
  const normalizeStatus = (status: string | number): string => {
    const statusMap: Record<number, string> = {
      0: 'Pending',
      1: 'Processing',
      2: 'Shipped',
      3: 'Delivered',
      4: 'Cancelled',
      5: 'Refunded',
      6: 'ReturnRequested'
    };
    
    if (typeof status === 'number') {
      return statusMap[status] || 'Pending';
    }
    return status;
  };

  const getStatusIcon = (status: string | number) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'Delivered':
        return <FiCheckCircle className="text-green-500" />;
      case 'Shipped':
        return <FiTruck className="text-blue-500" />;
      case 'Processing':
        return <FiPackage className="text-yellow-500" />;
      case 'Cancelled':
      case 'Refunded':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string | number) => {
    const normalizedStatus = normalizeStatus(status);
    const statusMap: Record<string, string> = {
      'Pending': 'En attente',
      'Processing': 'En traitement',
      'Shipped': 'Expédiée',
      'Delivered': 'Livrée',
      'Cancelled': 'Annulée',
      'Refunded': 'Remboursée',
      'ReturnRequested': 'Retour demandé'
    };
    return statusMap[normalizedStatus] || normalizedStatus;
  };

  const getStatusColor = (status: string | number) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'Delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Shipped':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Processing':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Fonction pour vérifier si le statut correspond à une valeur donnée
  const isStatus = (status: string | number, value: string): boolean => {
    const normalizedStatus = normalizeStatus(status);
    return normalizedStatus === value;
  };

  // Fonction pour obtenir l'URL de l'image
  const getProductImageUrl = (item: any) => {
    if (item.productImage) {
      return getImageUrl(item.productImage);
    }
    if (item.product?.imageUrl) {
      return getImageUrl(item.product.imageUrl);
    }
    return '/images/product-placeholder.svg';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* En-tête de la commande */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Commande #{order.orderNumber}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Passée le {formatDate(order.createdAt, 'long')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(order.finalAmount)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {order.items.length} article{order.items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Aperçu des produits */}
      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={item.id} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <Image
                src={getProductImageUrl(item)}
                alt={item.productName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold">
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
          
          {isStatus(order.status, 'Delivered') && (
            <button className="px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-colors dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-white">
              Écrire un avis
            </button>
          )}
          
          {isStatus(order.status, 'Pending') && (
            <button className="px-4 py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white">
              Annuler la commande
            </button>
          )}

          {order.trackingNumber && (
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Suivre mon colis
            </button>
          )}
        </div>
      </div>

      {/* Informations supplémentaires (expand) */}
      {isExpanded && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Détails de la commande</h4>
          
          {/* Adresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Adresse de livraison</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {order.shippingAddress}<br />
                {order.shippingPostalCode} {order.shippingCity}<br />
                {order.shippingCountry}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Adresse de facturation</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {order.billingAddress}<br />
                {order.billingPostalCode} {order.billingCity}<br />
                {order.billingCountry}
              </p>
            </div>
          </div>

          {/* Paiement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Méthode de paiement</p>
              <p className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Statut du paiement</p>
              <p className={`font-medium ${
                order.paymentStatus === 'Paid' 
                  ? 'text-green-600 dark:text-green-400' 
                  : order.paymentStatus === 'Pending'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {order.paymentStatus === 'Paid' ? 'Payé' : 
                 order.paymentStatus === 'Pending' ? 'En attente' : 
                 order.paymentStatus}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bouton pour expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-sm text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
      >
        {isExpanded ? 'Voir moins' : 'Voir plus de détails'}
      </button>
    </div>
  );
};

export default OrderCard;