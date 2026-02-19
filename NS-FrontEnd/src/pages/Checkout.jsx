import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { ordersApi } from '../api/orders';
import { paymentsApi } from '../api/payments';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: ''
  });
  
  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!cart || cart.items?.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  if (!cart || cart.items?.length === 0) {
    return null;
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.2;
  const total = subtotal + shipping + tax;

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!shippingAddress.firstName) newErrors.firstName = 'Prénom requis';
    if (!shippingAddress.lastName) newErrors.lastName = 'Nom requis';
    if (!shippingAddress.address) newErrors.address = 'Adresse requise';
    if (!shippingAddress.city) newErrors.city = 'Ville requise';
    if (!shippingAddress.postalCode) newErrors.postalCode = 'Code postal requis';
    if (!shippingAddress.phone) newErrors.phone = 'Téléphone requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (!billingAddress.sameAsShipping) {
      const newErrors = {};
      
      if (!billingAddress.firstName) newErrors.billingFirstName = 'Prénom requis';
      if (!billingAddress.lastName) newErrors.billingLastName = 'Nom requis';
      if (!billingAddress.address) newErrors.billingAddress = 'Adresse requise';
      if (!billingAddress.city) newErrors.billingCity = 'Ville requise';
      if (!billingAddress.postalCode) newErrors.billingPostalCode = 'Code postal requis';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      
      // Create order
      const orderData = {
        shippingAddress: {
          ...shippingAddress,
          fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`
        },
        billingAddress: billingAddress.sameAsShipping
          ? {
              ...shippingAddress,
              fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`
            }
          : {
              ...billingAddress,
              fullName: `${billingAddress.firstName} ${billingAddress.lastName}`
            },
        paymentMethod,
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        shipping,
        tax,
        total
      };

      const order = await ordersApi.createOrder(orderData);
      
      // Create payment intent
      const paymentIntentData = await paymentsApi.createPaymentIntent({
        orderId: order.id,
        amount: total,
        currency: 'EUR'
      });
      
      setPaymentIntent(paymentIntentData);
      
      // Redirect to payment page or process payment
      // For demo, we'll simulate successful payment
      setTimeout(() => {
        handlePaymentSuccess(order.id);
      }, 2000);
      
    } catch (error) {
      console.error('Error placing order:', error);
      setErrors({ submit: error.message });
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (orderId) => {
    try {
      await paymentsApi.confirmPayment({
        orderId,
        paymentIntentId: paymentIntent.id
      });
      
      await clearCart();
      navigate('/order-confirmation', { state: { orderId } });
    } catch (error) {
      console.error('Error confirming payment:', error);
      setErrors({ submit: error.message });
      setProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="checkout-page"
    >
      <div className="container">
        <h1 className="checkout-title">Finaliser la commande</h1>

        <div className="checkout-grid">
          {/* Checkout Form */}
          <div className="checkout-form">
            {/* Progress Steps */}
            <div className="checkout-steps">
              <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <span className="step-number">{step > 1 ? '✓' : '1'}</span>
                <span className="step-label">Livraison</span>
              </div>
              <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
              <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <span className="step-number">{step > 2 ? '✓' : '2'}</span>
                <span className="step-label">Paiement</span>
              </div>
              <div className={`step-line ${step >= 3 ? 'active' : ''}`} />
              <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Confirmation</span>
              </div>
            </div>

            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <div className="checkout-step-content">
                <h2>Adresse de livraison</h2>
                
                <div className="form-row">
                  <Input
                    label="Prénom"
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                    error={errors.firstName}
                    required
                  />
                  <Input
                    label="Nom"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                    error={errors.lastName}
                    required
                  />
                </div>

                <Input
                  label="Adresse"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  error={errors.address}
                  required
                />

                <div className="form-row">
                  <Input
                    label="Ville"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    error={errors.city}
                    required
                  />
                  <Input
                    label="Code postal"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    error={errors.postalCode}
                    required
                  />
                </div>

                <div className="form-row">
                  <Input
                    label="Pays"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    disabled
                  />
                  <Input
                    label="Téléphone"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    error={errors.phone}
                    required
                  />
                </div>

                <div className="form-actions">
                  <Button variant="outline" onClick={() => navigate('/cart')}>
                    Retour au panier
                  </Button>
                  <Button onClick={handleNextStep}>
                    Continuer vers le paiement
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="checkout-step-content">
                <h2>Mode de paiement</h2>
                
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-method-content">
                      <span className="payment-icon">💳</span>
                      <div>
                        <strong>Carte bancaire</strong>
                        <small>Visa, Mastercard, American Express</small>
                      </div>
                    </div>
                  </label>

                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-method-content">
                      <span className="payment-icon">🅿️</span>
                      <div>
                        <strong>PayPal</strong>
                        <small>Paiement sécurisé avec PayPal</small>
                      </div>
                    </div>
                  </label>

                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="applepay"
                      checked={paymentMethod === 'applepay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-method-content">
                      <span className="payment-icon">🍎</span>
                      <div>
                        <strong>Apple Pay</strong>
                        <small>Paiement rapide avec Apple Pay</small>
                      </div>
                    </div>
                  </label>
                </div>

                <h2 style={{ marginTop: 'var(--space-6)' }}>Adresse de facturation</h2>
                
                <label className="same-address-checkbox">
                  <input
                    type="checkbox"
                    checked={billingAddress.sameAsShipping}
                    onChange={(e) => setBillingAddress({ ...billingAddress, sameAsShipping: e.target.checked })}
                  />
                  <span>Utiliser la même adresse que pour la livraison</span>
                </label>

                {!billingAddress.sameAsShipping && (
                  <div className="billing-address-form">
                    <div className="form-row">
                      <Input
                        label="Prénom"
                        value={billingAddress.firstName}
                        onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })}
                        error={errors.billingFirstName}
                        required
                      />
                      <Input
                        label="Nom"
                        value={billingAddress.lastName}
                        onChange={(e) => setBillingAddress({ ...billingAddress, lastName: e.target.value })}
                        error={errors.billingLastName}
                        required
                      />
                    </div>

                    <Input
                      label="Adresse"
                      value={billingAddress.address}
                      onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                      error={errors.billingAddress}
                      required
                    />

                    <div className="form-row">
                      <Input
                        label="Ville"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                        error={errors.billingCity}
                        required
                      />
                      <Input
                        label="Code postal"
                        value={billingAddress.postalCode}
                        onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                        error={errors.billingPostalCode}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Retour
                  </Button>
                  <Button onClick={handleNextStep}>
                    Continuer
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="checkout-step-content">
                <h2>Confirmer votre commande</h2>
                
                <div className="confirmation-section">
                  <h3>Adresse de livraison</h3>
                  <p>
                    {shippingAddress.firstName} {shippingAddress.lastName}<br />
                    {shippingAddress.address}<br />
                    {shippingAddress.postalCode} {shippingAddress.city}<br />
                    {shippingAddress.country}<br />
                    Tél: {shippingAddress.phone}
                  </p>
                </div>

                <div className="confirmation-section">
                  <h3>Mode de paiement</h3>
                  <p>
                    {paymentMethod === 'card' && '💳 Carte bancaire'}
                    {paymentMethod === 'paypal' && '🅿️ PayPal'}
                    {paymentMethod === 'applepay' && '🍎 Apple Pay'}
                  </p>
                </div>

                <div className="confirmation-section">
                  <h3>Récapitulatif de la commande</h3>
                  <div className="confirmation-items">
                    {cart.items.map(item => (
                      <div key={item.id} className="confirmation-item">
                        <span className="item-name">{item.name} x{item.quantity}</span>
                        <span className="item-price">{(item.price * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                </div>

                {errors.submit && (
                  <div className="error-message">{errors.submit}</div>
                )}

                <div className="form-actions">
                  <Button variant="outline" onClick={handlePreviousStep} disabled={processing}>
                    Retour
                  </Button>
                  <Button 
                    onClick={handlePlaceOrder} 
                    disabled={processing}
                    loading={processing}
                  >
                    {processing ? 'Traitement en cours...' : `Payer ${total.toFixed(2)}€`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h2>Votre commande</h2>
            
            <div className="summary-items">
              {cart.items.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="summary-item-info">
                    <span className="summary-item-name">{item.name}</span>
                    <span className="summary-item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="summary-item-price">
                    {(item.price * item.quantity).toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              
              <div className="summary-row">
                <span>Livraison</span>
                {shipping === 0 ? (
                  <span className="free-shipping">Gratuite</span>
                ) : (
                  <span>{shipping.toFixed(2)}€</span>
                )}
              </div>
              
              <div className="summary-row">
                <span>TVA (20%)</span>
                <span>{tax.toFixed(2)}€</span>
              </div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
            </div>

            <div className="security-badge">
              <span>🔒</span>
              <div>
                <strong>Paiement 100% sécurisé</strong>
                <small>Vos informations sont cryptées</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;