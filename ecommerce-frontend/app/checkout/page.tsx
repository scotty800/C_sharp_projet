'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { paymentService } from '@/services/api/payments';
import { productService } from '@/services/api/products';
import { Product } from '@/types/product';
import { PaymentMethod } from '@/types/order';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';
import { FiArrowLeft, FiCreditCard, FiTruck, FiCheck, FiEdit2 } from 'react-icons/fi';
import { formatPrice } from '@/services/utils/formatters';
import { getProductImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';
// ⭐ NOUVEAUX IMPORTS
import { resolveProductDisplay, getResolvedImages } from '@/components/shop-studio/lib/resolveProductDisplay';
import { getImageUrl } from '@/utils/imageUtils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ⭐ INTERFACE ÉTENDUE
interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  product?: Product | null;
  selectedColor?: string;   // ⭐ AJOUT
  selectedSize?: string;    // ⭐ AJOUT
  productImage?: string;    // ⭐ AJOUT
}

const convertPaymentMethodToNumber = (method: PaymentMethod): number => {
  const map: Record<PaymentMethod, number> = { Card: 0, PayPal: 1, BankTransfer: 2 };
  return map[method] ?? 0;
};

interface AddressForm {
  email: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, isLoading, clearCart } = useCart();

  const [itemsWithProducts, setItemsWithProducts] = useState<CartItemWithProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ── Étape 1 : Adresse ──────────────────────────────────────────────
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [address, setAddress] = useState<AddressForm>({
    email: user?.email || '',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingCountry: 'France',
    notes: '',
  });

  // ── Étape 2 : Paiement ─────────────────────────────────────────────
  const [checkout, setCheckout] = useState<{
    clientSecret?: string;
    paymentIntentId?: string;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    total: number;
  } | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  // Redirection si pas connecté / panier vide (uniquement avant d'avoir commencé)
  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/auth/login?redirect=/checkout');
    }
    if (cart && cart.items.length === 0 && !isLoading && !addressConfirmed) {
      router.push('/cart');
    }
  }, [user, isLoading, cart, router, addressConfirmed]);

  // ⭐ Chargement des produits — le spread récupère déjà selectedColor/selectedSize/productImage
  useEffect(() => {
    const loadProducts = async () => {
      if (!cart) return;
      setLoadingProducts(true);
      const enriched = await Promise.all(
        cart.items.map(async (item) => {
          if (item.product) return { ...item, product: item.product };
          try {
            const product = await productService.getProductById(item.productId);
            return { ...item, product };
          } catch {
            return { ...item, product: null };
          }
        })
      );
      setItemsWithProducts(enriched);
      setLoadingProducts(false);
    };
    if (cart) loadProducts();
  }, [cart]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmAddress = async () => {
    if (!address.shippingAddress || !address.shippingCity || !address.shippingPostalCode) {
      toast.error('Merci de remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmittingAddress(true);
      toast.loading('Préparation du paiement...', { id: 'checkout' });

      const result = await paymentService.createCheckoutIntent({
        paymentMethod: convertPaymentMethodToNumber('Card' as PaymentMethod),
        shippingAddress: address.shippingAddress,
        shippingCity: address.shippingCity,
        shippingPostalCode: address.shippingPostalCode,
        shippingCountry: address.shippingCountry,
        notes: address.notes || undefined,
      });

      if (!result.requiresOnlinePayment && result.orderId) {
        toast.success('Commande confirmée !', { id: 'checkout' });
        router.push(`/orders/${result.orderId}`);
        return;
      }

      setCheckout({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        subtotal: result.subtotal,
        shippingCost: result.shippingCost,
        taxAmount: result.taxAmount,
        total: result.total,
      });
      setAddressConfirmed(true);
      toast.success('Adresse validée', { id: 'checkout' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la préparation du paiement", { id: 'checkout' });
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleEditAddress = () => {
    setAddressConfirmed(false);
    setCheckout(null);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setFinalizing(true);
      const result = await paymentService.finalizeOrder(paymentIntentId);

      try {
        await clearCart();
      } catch {
        // Le backend a déjà vidé le panier serveur ; ce n'est qu'un rafraîchissement local
      }

      toast.success('Commande confirmée !');
      router.push(`/orders/${result.orderId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la finalisation de la commande');
      setFinalizing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  if (isLoading || !cart || loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-6 transition-colors">
          <FiArrowLeft />
          Retour au panier
        </Link>

        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Paiement</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Colonne gauche : étapes ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── ÉTAPE 1 : ADRESSE ── */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  {addressConfirmed && <FiCheck className="text-green-500" />}
                  1. Adresse de livraison
                </h2>
                {addressConfirmed && (
                  <button
                    onClick={handleEditAddress}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <FiEdit2 size={14} /> Modifier
                  </button>
                )}
              </div>

              {!addressConfirmed ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse *</label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={address.shippingAddress}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Numéro et nom de rue"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville *</label>
                      <input
                        type="text"
                        name="shippingCity"
                        value={address.shippingCity}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code postal *</label>
                      <input
                        type="text"
                        name="shippingPostalCode"
                        value={address.shippingPostalCode}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pays *</label>
                    <select
                      name="shippingCountry"
                      value={address.shippingCountry}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optionnel)</label>
                    <textarea
                      name="notes"
                      value={address.notes}
                      onChange={handleAddressChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleConfirmAddress}
                    disabled={submittingAddress}
                    className="w-full mt-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submittingAddress ? 'Préparation...' : 'Continuer vers le paiement'}
                  </button>
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400 text-sm space-y-0.5">
                  <p>{address.shippingAddress}</p>
                  <p>{address.shippingPostalCode} {address.shippingCity}</p>
                  <p>{address.shippingCountry}</p>
                </div>
              )}
            </div>

            {/* ── ÉTAPE 2 : PAIEMENT ── */}
            {addressConfirmed && checkout?.clientSecret && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <FiCreditCard className="text-primary" />
                  2. Paiement
                </h2>

                {finalizing ? (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <p className="text-sm text-gray-500">Finalisation de votre commande...</p>
                  </div>
                ) : (
                  <Elements key={checkout.clientSecret} stripe={stripePromise} options={{ clientSecret: checkout.clientSecret }}>
                    <StripePaymentForm
                      clientSecret={checkout.clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                )}
              </div>
            )}
          </div>

          {/* ── Colonne droite : panier avec résolution d'image par variante ── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dans ton panier</h2>
                <Link href="/cart" className="text-sm text-primary hover:underline">Modifier</Link>
              </div>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {itemsWithProducts.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {/* ⭐ IMAGE AVEC RÉSOLUTION DE VARIANTE */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      {(() => {
                        // ⭐ Résout l'image selon la couleur choisie (variante), pas juste l'image par défaut
                        let imageUrl: string | null = null;

                        if (item.product) {
                          // ⭐ MODIFICATION — Ajout de isInStock pour le typage
                          const studioProduct = { ...item.product, isInStock: (item.product.stock ?? 0) > 0 } as any;
                          const display = resolveProductDisplay(studioProduct, item.selectedColor);
                          const images = getResolvedImages(display);
                          imageUrl = images[0] || null;
                        }

                        if (!imageUrl && item.productImage) {
                          imageUrl = item.productImage;
                        }

                        if (!imageUrl) {
                          return <div className="w-full h-full bg-gray-200 dark:bg-gray-600" />;
                        }

                        return (
                          <Image
                            src={getImageUrl(imageUrl)}
                            alt={item.product?.name || 'Produit'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        );
                      })()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-white">
                        {item.product?.name}
                        {item.selectedColor && (
                          <span className="text-xs text-gray-500 ml-1">({item.selectedColor})</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qté: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(checkout?.subtotal ?? cart.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Livraison</span>
                  <span className="text-gray-900 dark:text-white">
                    {checkout ? (checkout.shippingCost === 0 ? 'Gratuite' : formatPrice(checkout.shippingCost)) : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>TVA (20%)</span>
                  <span className="text-gray-900 dark:text-white">
                    {checkout ? formatPrice(checkout.taxAmount) : '—'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-primary">
                    {formatPrice(checkout?.total ?? cart.totalAmount)}
                  </span>
                </div>
              </div>

              {!checkout && (
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Le total final (avec livraison et taxes) s'affiche après validation de l'adresse.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}