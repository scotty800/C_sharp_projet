'use client';

import { OrderResponseDto } from '@/types/order';
import { formatPrice } from '@/services/utils/formatters';
import { FiCreditCard, FiTruck, FiPackage, FiCalendar } from 'react-icons/fi';
// ⭐ AJOUT
import { orderService } from '@/services/api/orders';

interface OrderSummaryProps {
  order: OrderResponseDto;
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  // ⭐ MODIFICATION — Retrait de l'entrée Livraison
  const summaryItems = [
    {
      icon: FiPackage,
      label: 'Sous-total',
      value: formatPrice(order.totalAmount),
    },
    // ⭐ Supprimé : l'entrée Livraison est maintenant gérée dynamiquement
    {
      icon: FiCreditCard,
      label: 'TVA',
      value: formatPrice(order.taxAmount),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Récapitulatif</h3>

      {/* Détails */}
      <div className="space-y-4 mb-6">
        {summaryItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <item.icon className="text-primary" size={18} />
              <span>{item.label}</span>
            </div>
            <span className="text-gray-900 dark:text-white">{item.value}</span>
          </div>
        ))}

        {/* ⭐ NOUVEAU — Affichage dynamique des frais de livraison avec méthode et délai */}
        {order.shippingBreakdown && order.shippingBreakdown.length > 1 ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FiTruck className="text-primary" size={18} />
              <span>Livraison ({order.shippingBreakdown.length} boutiques)</span>
            </div>
            {order.shippingBreakdown.map(s => (
              <div key={s.shopId} className="flex justify-between text-sm pl-6 text-gray-500">
                <div>
                  <span>{s.shopName}</span>
                  <span className="text-xs block text-gray-400">
                    {s.shippingMethodName} · {s.minDays}-{s.maxDays} jours
                  </span>
                </div>
                <span>{formatPrice(s.shippingCost)}</span>
              </div>
            ))}
          </div>
        ) : order.shippingBreakdown && order.shippingBreakdown.length === 1 ? (
          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <FiTruck className="text-primary" size={18} />
              <div>
                <span>Livraison</span>
                <span className="text-xs block text-gray-400">
                  {order.shippingBreakdown[0].shippingMethodName} · {order.shippingBreakdown[0].minDays}-{order.shippingBreakdown[0].maxDays} jours
                </span>
              </div>
            </div>
            <span className="text-gray-900 dark:text-white">{formatPrice(order.shippingCost)}</span>
          </div>
        ) : (
          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <FiTruck className="text-primary" size={18} />
              <span>Livraison</span>
            </div>
            <span className="text-gray-900 dark:text-white">{formatPrice(order.shippingCost)}</span>
          </div>
        )}

        {order.discountAmount > 0 && (
          <div className="flex justify-between items-center text-green-600 dark:text-green-400">
            <div className="flex items-center gap-2">
              <span>Réduction</span>
            </div>
            <span>-{formatPrice(order.discountAmount)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="flex justify-between items-center font-bold text-lg">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-primary">{formatPrice(order.finalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Informations de paiement */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Méthode de paiement</span>
          <span className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Statut du paiement</span>
          <span className={`font-medium ${
            order.paymentStatus === 'Paid' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {order.paymentStatus === 'Paid' ? 'Payé' : 'En attente'}
          </span>
        </div>
        {order.paidAt && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Payé le</span>
            <span className="font-medium text-gray-900 dark:text-white">{new Date(order.paidAt).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
      </div>

      {/* ⭐ MODIFICATION — Boutons d'action avec téléchargement de facture */}
      <div className="mt-6 space-y-3">
        {order.status === 'Delivered' && (
          <button className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            Laisser un avis
          </button>
        )}
        
        {order.status === 'Pending' && (
          <button className="w-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white">
            Annuler la commande
          </button>
        )}

        {/* ⭐ MODIFICATION — Bouton de téléchargement de facture avec onClick */}
        <button
          onClick={() => orderService.downloadInvoice(order.id, order.orderNumber)}
          className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Télécharger la facture
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;