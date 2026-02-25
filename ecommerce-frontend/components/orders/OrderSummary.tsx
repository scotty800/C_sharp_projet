'use client';

import { OrderResponseDto } from '@/types/order';
import { formatPrice } from '@/services/utils/formatters';
import { FiCreditCard, FiTruck, FiPackage, FiCalendar } from 'react-icons/fi';

interface OrderSummaryProps {
  order: OrderResponseDto;
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const summaryItems = [
    {
      icon: FiPackage,
      label: 'Sous-total',
      value: formatPrice(order.totalAmount),
    },
    {
      icon: FiTruck,
      label: 'Livraison',
      value: formatPrice(order.shippingCost),
    },
    {
      icon: FiCreditCard,
      label: 'TVA',
      value: formatPrice(order.taxAmount),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Récapitulatif</h3>

      {/* Détails */}
      <div className="space-y-4 mb-6">
        {summaryItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-gray-600">
            <div className="flex items-center gap-2">
              <item.icon className="text-primary" size={18} />
              <span>{item.label}</span>
            </div>
            <span>{item.value}</span>
          </div>
        ))}

        {order.discountAmount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <div className="flex items-center gap-2">
              <span>Réduction</span>
            </div>
            <span>-{formatPrice(order.discountAmount)}</span>
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatPrice(order.finalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Informations de paiement */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Méthode de paiement</span>
          <span className="font-medium">{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Statut du paiement</span>
          <span className={`font-medium ${
            order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {order.paymentStatus === 'Paid' ? 'Payé' : 'En attente'}
          </span>
        </div>
        {order.paidAt && (
          <div className="flex justify-between">
            <span className="text-gray-600">Payé le</span>
            <span className="font-medium">{new Date(order.paidAt).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="mt-6 space-y-3">
        {order.status === 'Delivered' && (
          <button className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            Laisser un avis
          </button>
        )}
        
        {order.status === 'Pending' && (
          <button className="w-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            Annuler la commande
          </button>
        )}

        <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors">
          Télécharger la facture
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;