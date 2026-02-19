import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import CartItem from '../components/cart/CartItem';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  if (!cart || cart.items?.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="cart-page empty-cart"
      >
        <div className="container">
          <div className="empty-cart-content">
            <div className="empty-cart-icon">🛒</div>
            <h1>Votre panier est vide</h1>
            <p>Découvrez nos produits et trouvez votre bonheur !</p>
            <Button size="lg" onClick={() => navigate('/products')}>
              Découvrir les produits
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.2; // 20% TVA
  const discount = promoApplied ? subtotal * 0.1 : 0; // 10% de réduction
  const total = subtotal + shipping + tax - discount;

  const handlePromoSubmit = (e) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === 'PROMO10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Code promo invalide');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="cart-page"
    >
      <div className="container">
        <h1 className="cart-title">Votre panier</h1>

        <div className="cart-grid">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-header">
              <span className="cart-header-product">Produit</span>
              <span className="cart-header-price">Prix</span>
              <span className="cart-header-quantity">Quantité</span>
              <span className="cart-header-total">Total</span>
            </div>

            <div className="cart-items">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            <div className="cart-actions">
              <Button variant="outline" onClick={() => navigate('/products')}>
                Continuer mes achats
              </Button>
              <Button variant="ghost" onClick={clearCart}>
                Vider le panier
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h2>Récapitulatif</h2>

            {/* Promo Code */}
            <form onSubmit={handlePromoSubmit} className="promo-form">
              <input
                type="text"
                placeholder="Code promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={promoApplied}
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={promoApplied || !promoCode}
              >
                {promoApplied ? 'Appliqué' : 'Appliquer'}
              </Button>
              {promoError && <span className="promo-error">{promoError}</span>}
              {promoApplied && (
                <span className="promo-success">Code promo appliqué !</span>
              )}
            </form>

            {/* Price Breakdown */}
            <div className="summary-details">
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
              
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Réduction</span>
                  <span>-{discount.toFixed(2)}€</span>
                </div>
              )}
              
              <div className="summary-row total">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
            </div>

            {/* Shipping Info */}
            {subtotal < 50 && (
              <div className="shipping-info">
                <p>Plus que {(50 - subtotal).toFixed(2)}€ pour la livraison gratuite !</p>
                <div className="shipping-progress">
                  <div 
                    className="shipping-progress-bar"
                    style={{ width: `${(subtotal / 50) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <Button 
              size="lg" 
              fullWidth 
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Chargement...' : 'Passer la commande'}
            </Button>

            {/* Payment Methods */}
            <div className="payment-methods">
              <p>Paiement sécurisé par :</p>
              <div className="payment-icons">
                <span>💳 Visa</span>
                <span>💳 Mastercard</span>
                <span>💳 PayPal</span>
                <span>💳 Apple Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;