'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTruck, FiShield, FiCreditCard, FiArrowRight } from 'react-icons/fi';
import { Cart } from '@/types/cart';
import { formatPrice } from '@/services/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface CartSummaryProps {
  cart: Cart;
}

const CartSummary = ({ cart }: CartSummaryProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.totalAmount;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.2; // TVA 20%
  const total = subtotal + shipping + tax;

  // ⭐ MODIFICATION — Vérification des variantes avant le paiement
  const handleCheckout = () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour finaliser votre commande');
      router.push('/auth/login?redirect=/cart');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    // ⭐ Vérifier si des articles nécessitent une variante (taille/couleur)
    const missingVariant = cart.items.find(
      (item) =>
        ((item.size && item.size.length > 0) && !item.selectedSize) ||
        ((item.color && item.color.length > 0) && !item.selectedColor)
    );
    if (missingVariant) {
      toast.error(`Veuillez choisir une taille/couleur pour "${missingVariant.productName}"`);
      return;
    }

    router.push('/checkout');
  };

  const shippingOptions = [
    { id: 'standard', label: 'Standard', price: 5.99, days: '3-5 jours' },
    { id: 'express', label: 'Express', price: 12.99, days: '1-2 jours' },
    { id: 'free', label: 'Gratuit', price: 0, days: '5-7 jours', condition: '> 50€' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Récapitulatif</h2>

      {/* Détails des prix */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Sous-total ({cart.items.length} article{cart.items.length > 1 ? 's' : ''})</span>
          <span className="text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Livraison</span>
          <div className="text-right">
            {shipping === 0 ? (
              <span className="text-green-600 dark:text-green-400 font-medium">Gratuite</span>
            ) : (
              <span className="text-gray-900 dark:text-white">{formatPrice(shipping)}</span>
            )}
          </div>
        </div>

        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>TVA (20%)</span>
          <span className="text-gray-900 dark:text-white">{formatPrice(tax)}</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <div className="flex justify-between font-bold text-lg">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Dont TVA {formatPrice(tax)}
          </p>
        </div>
      </div>

      {/* Code promo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Code promo
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="EXEMPLE20"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium">
            Appliquer
          </button>
        </div>
      </div>

      {/* Options de livraison */}
      <div className="mb-6">
        <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Mode de livraison</h3>
        <div className="space-y-2">
          {shippingOptions.map(option => (
            <label
              key={option.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  value={option.id}
                  defaultChecked={option.id === 'standard'}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{option.days}</span>
                  {option.condition && (
                    <span className="text-xs text-green-600 dark:text-green-400 block">
                      {option.condition}
                    </span>
                  )}
                </div>
              </div>
              <span className={option.price === 0 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                {option.price === 0 ? 'Gratuit' : formatPrice(option.price)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ⭐ Affichage d'un avertissement si des variantes manquent */}
      {cart.items.some(
        (item) =>
          ((item.size && item.size.length > 0) && !item.selectedSize) ||
          ((item.color && item.color.length > 0) && !item.selectedColor)
      ) && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-600 dark:text-orange-400">
            ⚠️ Certains articles nécessitent de choisir une taille ou une couleur.
          </p>
        </div>
      )}

      {/* Bouton de paiement */}
      <button
        onClick={handleCheckout}
        disabled={cart.items.length === 0 || isProcessing}
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
      >
        <span>{isProcessing ? 'Traitement...' : 'Passer la commande'}</span>
        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Paiements sécurisés */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiCreditCard className="text-primary" />
          <span>Paiement sécurisé (CB, PayPal, Apple Pay)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiShield className="text-primary" />
          <span>Protection acheteur incluse</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiTruck className="text-primary" />
          <span>Livraison suivie et garantie</span>
        </div>
      </div>

      {/* Moyens de paiement */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-center gap-3">
          <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
};

export default CartSummary;