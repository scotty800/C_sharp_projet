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

    router.push('/checkout');
  };

  const shippingOptions = [
    { id: 'standard', label: 'Standard', price: 5.99, days: '3-5 jours' },
    { id: 'express', label: 'Express', price: 12.99, days: '1-2 jours' },
    { id: 'free', label: 'Gratuit', price: 0, days: '5-7 jours', condition: '> 50€' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>

      {/* Détails des prix */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Sous-total ({cart.items.length} article{cart.items.length > 1 ? 's' : ''})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Livraison</span>
          <div className="text-right">
            {shipping === 0 ? (
              <span className="text-green-600 font-medium">Gratuite</span>
            ) : (
              <span>{formatPrice(shipping)}</span>
            )}
          </div>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>TVA (20%)</span>
          <span>{formatPrice(tax)}</span>
        </div>

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dont TVA {formatPrice(tax)}
          </p>
        </div>
      </div>

      {/* Code promo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Code promo
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="EXEMPLE20"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">
            Appliquer
          </button>
        </div>
      </div>

      {/* Options de livraison */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Mode de livraison</h3>
        <div className="space-y-2">
          {shippingOptions.map(option => (
            <label
              key={option.id}
              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors"
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
                  <span className="font-medium">{option.label}</span>
                  <span className="text-sm text-gray-500 ml-2">{option.days}</span>
                  {option.condition && (
                    <span className="text-xs text-green-600 block">
                      {option.condition}
                    </span>
                  )}
                </div>
              </div>
              <span className={option.price === 0 ? 'text-green-600 font-medium' : ''}>
                {option.price === 0 ? 'Gratuit' : formatPrice(option.price)}
              </span>
            </label>
          ))}
        </div>
      </div>

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
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiCreditCard className="text-primary" />
          <span>Paiement sécurisé (CB, PayPal, Apple Pay)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiShield className="text-primary" />
          <span>Protection acheteur incluse</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiTruck className="text-primary" />
          <span>Livraison suivie et garantie</span>
        </div>
      </div>

      {/* Moyens de paiement */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-center gap-3">
          <div className="w-10 h-6 bg-gray-200 rounded"></div>
          <div className="w-10 h-6 bg-gray-200 rounded"></div>
          <div className="w-10 h-6 bg-gray-200 rounded"></div>
          <div className="w-10 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;