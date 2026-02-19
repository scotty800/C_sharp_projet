import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import './CartSummary.css';

const CartSummary = ({ cart, onCheckout }) => {
  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  ) || 0;
  
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.2; // 20% TVA
  const total = subtotal + shipping + tax;

  return (
    <div className="cart-summary">
      <h3>Récapitulatif</h3>
      
      <div className="summary-items">
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
      </div>

      {/* Free shipping progress */}
      {subtotal < 50 && (
        <div className="shipping-progress">
          <p>Plus que <strong>{(50 - subtotal).toFixed(2)}€</strong> pour la livraison gratuite !</p>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(subtotal / 50) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Promo code */}
      <div className="promo-section">
        <input 
          type="text" 
          placeholder="Code promo"
          className="promo-input"
        />
        <button className="promo-btn">Appliquer</button>
      </div>

      {/* Total */}
      <div className="summary-total">
        <span>Total</span>
        <span className="total-amount">{total.toFixed(2)}€</span>
      </div>

      {/* Checkout button */}
      <Button 
        size="lg" 
        fullWidth 
        onClick={onCheckout}
        disabled={!cart?.items?.length}
      >
        Passer la commande
      </Button>

      {/* Payment methods */}
      <div className="payment-methods">
        <p>Paiement sécurisé par :</p>
        <div className="payment-icons">
          <span className="payment-icon visa">Visa</span>
          <span className="payment-icon mastercard">Mastercard</span>
          <span className="payment-icon paypal">PayPal</span>
          <span className="payment-icon apple">Apple Pay</span>
        </div>
      </div>

      {/* Continue shopping */}
      <Link to="/products" className="continue-shopping">
        ← Continuer mes achats
      </Link>
    </div>
  );
};

export default CartSummary;