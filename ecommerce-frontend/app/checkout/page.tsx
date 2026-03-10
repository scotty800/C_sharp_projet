'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { orderService } from '@/services/api/orders';
import { paymentService } from '@/services/api/payments';
import { productService } from '@/services/api/products';
import { Product } from '@/types/product';
import { PaymentMethod } from '@/types/order';
import { FiArrowLeft, FiCreditCard, FiTruck, FiMapPin, FiUser, FiMail } from 'react-icons/fi';
import { formatPrice } from '@/services/utils/formatters';
import { getProductImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, isLoading, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [itemsWithProducts, setItemsWithProducts] = useState<CartItemWithProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');

  // États du formulaire
  const [formData, setFormData] = useState({
    // Adresse de livraison
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingCountry: 'France',
    
    // Adresse de facturation (peut être la même)
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'France',
    
    // Méthode de paiement
    paymentMethod: 'Card' as PaymentMethod,
    
    // Notes
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !cart || itemsWithProducts.length === 0) return;

    try {
      setProcessing(true);

      // Calculer les montants
      const subtotal = cart.totalAmount;
      const shippingCost = subtotal > 50 ? 0 : 5.99;
      const taxAmount = subtotal * 0.2; // TVA 20%

      // 1. Créer la commande
      toast.loading('Création de votre commande...', { id: 'order' });
      
      const orderResponse = await orderService.createOrder({
        paymentMethod: formData.paymentMethod,
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

      toast.success('Commande créée !', { id: 'order' });
      console.log('✅ Commande créée:', orderResponse);

      // 2. Créer l'intention de paiement avec Stripe
      toast.loading('Préparation du paiement sécurisé...', { id: 'payment' });
      
      const paymentIntent = await paymentService.createPaymentIntent({
        orderId: orderResponse.orderId,
      });

      console.log('💰 PaymentIntent créé:', paymentIntent);
      toast.success('Paiement prêt !', { id: 'payment' });

      // 3. Rediriger vers la page de paiement Stripe
      // Note: Dans une vraie intégration, tu utiliserais Stripe Elements ou Stripe Checkout
      // Pour cet exemple, on simule un paiement réussi
      
      setStep('confirmation');
      
      toast.loading('Confirmation du paiement...', { id: 'confirm' });
      
      // Simuler un délai de paiement (remplacer par une vraie redirection Stripe)
      setTimeout(async () => {
        try {
          const confirmResponse = await paymentService.confirmPayment({
            orderId: orderResponse.orderId,
            paymentIntentId: paymentIntent.id,
          });

          if (confirmResponse.status === 'succeeded') {
            toast.success('Paiement réussi !', { id: 'confirm' });
            
            // Vider le panier
            await clearCart();
            
            // Rediriger vers la page de la commande
            setTimeout(() => {
              router.push(`/orders/${orderResponse.orderId}`);
            }, 1500);
          } else {
            toast.error('Le paiement est en attente', { id: 'confirm' });
          }
        } catch (error) {
          console.error('Erreur confirmation:', error);
          toast.error('Erreur lors de la confirmation', { id: 'confirm' });
        }
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erreur lors de la commande:', error);
      
      // Afficher le message d'erreur détaillé
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          'Erreur lors de la création de la commande';
      
      toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage), { id: 'error' });
      setProcessing(false);
    }
  };

  if (isLoading || !cart || loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const subtotal = cart.totalAmount;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.2;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6">
          <FiArrowLeft />
          Retour au panier
        </Link>

        <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

        {/* Barre de progression */}
        <div className="flex mb-8 max-w-3xl mx-auto">
          {['shipping', 'payment', 'confirmation'].map((s, index) => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full ${
                step === s ? 'bg-primary' : 
                ['shipping', 'payment'].indexOf(s) < ['shipping', 'payment'].indexOf(step) ? 'bg-green-500' : 'bg-gray-200'
              }`} />
              <p className="text-sm mt-2 text-center">
                {s === 'shipping' && 'Livraison'}
                {s === 'payment' && 'Paiement'}
                {s === 'confirmation' && 'Confirmation'}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Formulaire */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiTruck className="text-primary" />
                  Adresse de livraison
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Numéro et nom de rue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville *
                      </label>
                      <input
                        type="text"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal *
                      </label>
                      <input
                        type="text"
                        name="shippingPostalCode"
                        value={formData.shippingPostalCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays *
                    </label>
                    <select
                      name="shippingCountry"
                      value={formData.shippingCountry}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                    </select>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-4 flex items-center gap-2">
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
                    <span className="text-sm text-gray-700">
                      Utiliser la même adresse
                    </span>
                  </label>
                </div>

                {!formData.sameAsShipping && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse *
                      </label>
                      <input
                        type="text"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ville *
                        </label>
                        <input
                          type="text"
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Code postal *
                        </label>
                        <input
                          type="text"
                          name="billingPostalCode"
                          value={formData.billingPostalCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pays *
                      </label>
                      <select
                        name="billingCountry"
                        value={formData.billingCountry}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optionnel)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Instructions particulières pour la livraison..."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="w-full mt-6 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Continuer vers le paiement
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-primary" />
                  Mode de paiement
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Card"
                      checked={formData.paymentMethod === 'Card'}
                      onChange={handleInputChange}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium">Carte bancaire</span>
                      <p className="text-sm text-gray-500">Paiement sécurisé par Stripe</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PayPal"
                      checked={formData.paymentMethod === 'PayPal'}
                      onChange={handleInputChange}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium">PayPal</span>
                      <p className="text-sm text-gray-500">Paiement sécurisé avec PayPal</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BankTransfer"
                      checked={formData.paymentMethod === 'BankTransfer'}
                      onChange={handleInputChange}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium">Virement bancaire</span>
                      <p className="text-sm text-gray-500">Traitement sous 24-48h</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={processing}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Traitement...' : 'Payer maintenant'}
                  </button>
                </div>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Paiement en cours...</h2>
                <p className="text-gray-600 mb-8">
                  Votre paiement est en cours de traitement. Vous allez être redirigé.
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            )}
          </div>

          {/* Colonne de droite - Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Récapitulatif</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {itemsWithProducts.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product ? (
                        <Image
                          src={getProductImageUrl(item.product)}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Gratuite</span>
                  ) : (
                    <span>{formatPrice(shipping)}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>TVA (20%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {user && (
                <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiUser size={16} />
                    <span>{user.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail size={16} />
                    <span>{user.email}</span>
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