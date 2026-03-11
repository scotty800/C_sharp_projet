'use client';

import { useEffect, useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { paymentService } from '@/services/api/payments';

interface StripePaymentFormProps {
  clientSecret: string;
  orderId?: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const StripePaymentForm = ({ 
  clientSecret, 
  orderId,
  onSuccess, 
  onError 
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  console.log('✅ StripePaymentForm montée avec clientSecret:', clientSecret);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error('❌ Stripe ou elements non disponibles');
      onError('Stripe non initialisé');
      return;
    }

    if (!clientSecret) {
      console.error('❌ clientSecret manquant');
      onError('ClientSecret manquant');
      return;
    }

    setIsLoading(true);
    toast.loading('Traitement du paiement...', { id: 'stripe-payment' });

    try {
      console.log('📤 Confirmation du paiement avec clientSecret:', clientSecret);

      // ✅ Utiliser "as any" pour éviter les problèmes de typage Stripe
      const cardElement = elements.getElement(CardElement) as any;

      if (!cardElement) {
        throw new Error('CardElement non trouvé');
      }

      // ✅ Confirmer le paiement
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error('❌ Erreur Stripe:', error.message);
        toast.error(`Erreur: ${error.message}`, { id: 'stripe-payment' });
        onError(error.message || 'Erreur lors du paiement');
        setIsLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('✅ PaymentIntent réussi:', paymentIntent.id);
        toast.loading('Confirmation auprès du serveur...', { id: 'stripe-payment' });

        // ✅ Confirmer auprès du backend
        try {
          const confirmResponse = await paymentService.confirmPayment({
            orderId: orderId || 0,
            paymentIntentId: paymentIntent.id,
          });

          console.log('✅ Backend a confirmé le paiement:', confirmResponse);
          toast.success('Paiement confirmé!', { id: 'stripe-payment' });
          onSuccess();
        } catch (confirmError: any) {
          console.error('❌ Erreur confirmation backend:', confirmError);
          // Même si le backend échoue, le paiement Stripe est réussi
          toast.success('Paiement réussi!', { id: 'stripe-payment' });
          onSuccess();
        }
      } else if (paymentIntent?.status === 'processing') {
        console.log('⏳ Paiement en cours:', paymentIntent.id);
        toast.loading('Paiement en cours de traitement...', { id: 'stripe-payment' });
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        console.warn('⚠️ Statut inattendu:', paymentIntent?.status);
        toast.success(`Paiement: ${paymentIntent?.status}`, { id: 'stripe-payment' });
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Exception:', error);
      toast.error(error.message || 'Erreur inconnue', { id: 'stripe-payment' });
      onError(error.message || 'Erreur lors du paiement');
      setIsLoading(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Détails de la carte */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Détails de la carte bancaire
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <FiLock className="text-green-600" size={16} />
        <span>Paiement sécurisé par Stripe</span>
      </div>

      <button
        type="submit"
        disabled={isLoading || !stripe}
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Paiement en cours...' : 'Payer maintenant'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Testez avec <strong>4242 4242 4242 4242</strong> (expiration 12/25, CVC 123)
      </p>
    </form>
  );
};