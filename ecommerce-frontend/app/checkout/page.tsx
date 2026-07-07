'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { orderService } from '@/services/api/orders';
import { paymentService } from '@/services/api/payments';
import { productService } from '@/services/api/products';
import { Product } from '@/types/product';
import { PaymentMethod } from '@/types/order';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';
import { FiArrowLeft, FiCreditCard, FiTruck, FiMapPin, FiUser, FiMail } from 'react-icons/fi';
import { formatPrice } from '@/services/utils/formatters';
import { getProductImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';
// ⭐ AJOUT
import { shippingService } from '@/services/api/shipping';
import { CartShippingSummary } from '@/types/shipping';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product | null;
}

// ✅ Conversion du PaymentMethod en numérique
const convertPaymentMethodToNumber = (method: PaymentMethod): number => {
  const map: Record<PaymentMethod, number> = {
    'Card': 0,
    'PayPal': 1,
    'BankTransfer': 2,
  };
  return map[method] || 0;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, isLoading, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [itemsWithProducts, setItemsWithProducts] = useState<CartItemWithProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  // ⭐ AJOUT
  const [shippingSummary, setShippingSummary] = useState<CartShippingSummary | null>(null);

  // États du formulaire
  const [formData, setFormData] = useState({
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingCountry: 'France',
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'France',
    paymentMethod: 'Card' as PaymentMethod,
    notes: '',
  });

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/auth/login?redirect=/checkout');
    }
    if (cart && cart.items.length === 0 && !isLoading) {
      router.push('/cart');
    }
  }, [user, isLoading, cart, router]);

  // ⭐ AJOUT — Chargement des frais de livraison
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      shippingService.getCartShippingSummary().then(setShippingSummary);
    }
  }, [cart]);

  // Charger les produits manquants
  useEffect(() => {
    const loadProducts = async () => {
      if (!cart) return;
      
      setLoadingProducts(true);
      const enrichedItems = await Promise.all(
        cart.items.map(async (item) => {
          if (item.product) {
            return { ...item, product: item.product };
          }
          
          try {
            const product = await productService.getProductById(item.productId);
            return { ...item, product };
          } catch (error) {
            console.error(`Erreur chargement produit ${item.productId}:`, error);
            return { ...item, product: null };
          }
        })
      );
      
      setItemsWithProducts(enrichedItems);
      setLoadingProducts(false);
    };

    if (cart) {
      loadProducts();
    }
  }, [cart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'sameAsShipping' && checked) {
      setFormData(prev => ({
        ...prev,
        billingAddress: prev.shippingAddress,
        billingCity: prev.shippingCity,
        billingPostalCode: prev.shippingPostalCode,
        billingCountry: prev.shippingCountry,
      }));
    }
  };

  // ⭐ MODIFICATION — handleSubmitOrder avec calcul de livraison depuis le serveur
  const handleSubmitOrder = async () => {
    if (!user || !cart || itemsWithProducts.length === 0) return;

    // ⭐ Vérification que toutes les boutiques ont configuré leur livraison
    if (!shippingSummary || !shippingSummary.allShopsConfigured) {
      toast.error('Certaines boutiques n\'ont pas encore configuré de livraison.');
      setProcessing(false);
      return;
    }

    try {
      setProcessing(true);

      // ⭐ Utilisation des valeurs calculées par le serveur
      const subtotal = cart.totalAmount;
      const shippingCost = shippingSummary.totalShipping;
      const taxAmount = subtotal * 0.2;

      // Créer la commande
      toast.loading('Création de votre commande...', { id: 'order' });
      
      console.log('📤 Envoi de la commande avec:', {
        paymentMethod: formData.paymentMethod,
        paymentMethodConverted: convertPaymentMethodToNumber(formData.paymentMethod),
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingPostalCode: formData.shippingPostalCode,
        shippingCountry: formData.shippingCountry,
        shippingCost: shippingCost,
      });

      const orderResponse = await orderService.createOrder({
        paymentMethod: convertPaymentMethodToNumber(formData.paymentMethod),
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingPostalCode: formData.shippingPostalCode,
        shippingCountry: formData.shippingCountry,
        billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
        billingCity: formData.sameAsShipping ? formData.shippingCity : formData.billingCity,
        billingPostalCode: formData.sameAsShipping ? formData.shippingPostalCode : formData.billingPostalCode,
        billingCountry: formData.sameAsShipping ? formData.shippingCountry : formData.billingCountry,
        taxAmount: taxAmount,
        shippingCost: shippingCost,
        discountAmount: 0,
        notes: formData.notes || undefined,
      });

      console.log('✅ Commande créée:', orderResponse);
      toast.success('Commande créée !', { id: 'order' });
      setOrderId(orderResponse.orderId);

      // Créer l'intention de paiement
      toast.loading('Préparation du paiement sécurisé...', { id: 'payment' });
      
      const paymentIntent = await paymentService.createPaymentIntent({
        orderId: orderResponse.orderId,
      });

      console.log('✅ Intention de paiement créée:', paymentIntent);
      setClientSecret(paymentIntent.clientSecret);
      toast.success('Paiement prêt !', { id: 'payment' });
      setStep('payment');
      setProcessing(false);

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      console.error('📤 Config:', error.config?.data);
      console.error('📥 Réponse:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la commande', { id: 'error' });
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    toast.success('Paiement réussi !', { id: 'confirm' });
    await clearCart();
    setTimeout(() => {
      router.push(`/orders/${orderId}`);
    }, 1500);
  };

  const handlePaymentError = (error: string) => {
    toast.error(error, { id: 'payment-error' });
    setProcessing(false);
  };

  if (isLoading || !cart || loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ⭐ MODIFICATION — Utilisation de shippingSummary pour le calcul
  const subtotal = cart.totalAmount;
  const shipping = shippingSummary?.totalShipping ?? 0;
  const tax = subtotal * 0.2;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-6 transition-colors">
          <FiArrowLeft />
          Retour au panier
        </Link>

        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Finaliser la commande</h1>

        <div className="flex mb-8 max-w-3xl mx-auto">
          {['shipping', 'payment', 'confirmation'].map((s, index) => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full ${
                step === s ? 'bg-primary' : 
                ['shipping', 'payment'].indexOf(s) < ['shipping', 'payment'].indexOf(step) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
              <p className="text-sm mt-2 text-center text-gray-600 dark:text-gray-400">
                {s === 'shipping' && 'Livraison'}
                {s === 'payment' && 'Paiement'}
                {s === 'confirmation' && 'Confirmation'}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <FiTruck className="text-primary" />
                  Adresse de livraison
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Numéro et nom de rue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ville *
                      </label>
                      <input
                        type="text"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Code postal *
                      </label>
                      <input
                        type="text"
                        name="shippingPostalCode"
                        value={formData.shippingPostalCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pays *
                    </label>
                    <select
                      name="shippingCountry"
                      value={formData.shippingCountry}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                    </select>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <FiMapPin className="text-primary" />
                  Adresse de facturation
                </h2>

                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="sameAsShipping"
                      checked={formData.sameAsShipping}
                      onChange={handleInputChange}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Utiliser la même adresse
                    </span>
                  </label>
                </div>

                {!formData.sameAsShipping && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Adresse *
                      </label>
                      <input
                        type="text"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ville *
                        </label>
                        <input
                          type="text"
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Code postal *
                        </label>
                        <input
                          type="text"
                          name="billingPostalCode"
                          value={formData.billingPostalCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pays *
                      </label>
                      <select
                        name="billingCountry"
                        value={formData.billingCountry}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Luxembourg">Luxembourg</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (optionnel)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Instructions particulières pour la livraison..."
                  />
                </div>

                {/* ⭐ MODIFICATION — Bouton désactivé si livraison non configurée */}
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={processing || (shippingSummary ? !shippingSummary.allShopsConfigured : false)}
                  className="w-full mt-6 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing ? 'Traitement...' : 'Continuer vers le paiement'}
                </button>
                {shippingSummary && !shippingSummary.allShopsConfigured && (
                  <p className="text-xs text-orange-500 mt-2 text-center">
                    Certaines boutiques n'ont pas configuré leur livraison.
                  </p>
                )}
              </div>
            )}

            {/* ✅ Section de paiement avec Stripe */}
            {step === 'payment' && clientSecret && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <FiCreditCard className="text-primary" />
                  Paiement sécurisé
                </h2>

                {clientSecret && (
                  <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      orderId={orderId || 0}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                )}
              </div>
            )}
          </div>

          {/* Colonne de droite - Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Récapitulatif</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {itemsWithProducts.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      {item.product ? (
                        <Image
                          src={getProductImageUrl(item.product)}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-white">{item.product?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qté: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>

                {/* ⭐ MODIFICATION — Affichage détaillé de la livraison par boutique */}
                {shippingSummary && shippingSummary.breakdown.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Livraison</span>
                      <span className="text-gray-900 dark:text-white">
                        {shipping === 0 ? 'Gratuite' : formatPrice(shipping)}
                      </span>
                    </div>
                    {shippingSummary.breakdown.length > 1 && shippingSummary.breakdown.map((item) => (
                      <div key={item.shopId} className="flex justify-between text-xs pl-3 text-gray-400">
                        <span>
                          {item.shopName} · {item.shippingMethodName} · {item.minDays}-{item.maxDays}j
                        </span>
                        <span>{item.shippingCost === 0 ? 'Gratuit' : formatPrice(item.shippingCost)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Livraison</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(shipping)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>TVA (20%)</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {user && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <FiUser size={16} />
                    <span className="text-gray-900 dark:text-white">{user.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail size={16} />
                    <span className="text-gray-900 dark:text-white">{user.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}