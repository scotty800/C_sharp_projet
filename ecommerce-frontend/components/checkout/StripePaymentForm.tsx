'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export const StripePaymentForm = ({ clientSecret, onSuccess, onError }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe non initialisé');
      return;
    }

    setIsLoading(true);
    toast.loading('Traitement du paiement...', { id: 'stripe-payment' });

    try {
      const cardElement = elements.getElement(CardElement) as any;
      if (!cardElement) {
        toast.error('CardElement non trouvé', { id: 'stripe-payment' });
        onError('CardElement non trouvé');
        setIsLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        toast.error(`Erreur: ${error.message}`, { id: 'stripe-payment' });
        onError(error.message || 'Erreur lors du paiement');
        setIsLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
        toast.success('Paiement validé, finalisation...', { id: 'stripe-payment' });
        // ⭐ Le backend fait toute la vérification dans /finalize-order.
        // On ne fait plus d'appel confirmPayment ici : on transmet juste l'ID.
        onSuccess(paymentIntent.id);
      } else {
        toast.error(`Statut inattendu: ${paymentIntent?.status}`, { id: 'stripe-payment' });
        onError('Paiement non confirmé');
        setIsLoading(false);
      }
    } catch (error: any) {
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