import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { ordersApi } from '../api/orders';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = location.state?.orderId;
    if (!orderId) {
      navigate('/');
      return;
    }

    fetchOrder(orderId);
  }, [location, navigate]);

  const fetchOrder = async (orderId) => {
    try {
      const orderData = await ordersApi.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-confirmation-loading">
        <div className="container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <h2>Commande non trouvée</h2>
        <Link to="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="order-confirmation-page"
    >
      <div className="container">
        {/* Success Animation */}
        <div className="confirmation-header">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
          
          <h1 className="confirmation-title">Merci pour votre commande !</h1>
          <p className="confirmation-subtitle">
            Votre commande a été confirmée et sera traitée dans les plus brefs délais.
          </p>
        </div>

        {/* Order Info */}
        <div className="order-info-card">
          <div className="order-info-header">
            <h2>Récapitulatif de la commande</h2>
            <span className="order-number">Commande #{order.orderNumber}</span>
          </div>

          <div className="order-info-grid">
            <div className="info-section">
              <h3>Statut</h3>
              <div className="status-badge success">
                <span>✓</span>
                Confirmée
              </div>
            </div>

            <div className="info-section">
              <h3>Date</h3>
              <p>{new Date(order.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            <div className="info-section">
              <h3>Total payé</h3>
              <p className="total-price">{order.finalAmount?.toFixed(2)}€</p>
            </div>

            <div className="info-section">
              <h3>Mode de paiement</h3>
              <p>
                {order.paymentMethod === 'card' && '💳 Carte bancaire'}
                {order.paymentMethod === 'paypal' && '🅿️ PayPal'}
                {order.paymentMethod === 'applepay' && '🍎 Apple Pay'}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping & Billing */}
        <div className="addresses-grid">
          <div className="address-card">
            <h3>
              <span className="address-icon">🚚</span>
              Adresse de livraison
            </h3>
            <p>
              {order.shippingAddress?.fullName}<br />
              {order.shippingAddress?.address}<br />
              {order.shippingAddress?.postalCode} {order.shippingAddress?.city}<br />
              {order.shippingAddress?.country}
            </p>
          </div>

          <div className="address-card">
            <h3>
              <span className="address-icon">📄</span>
              Adresse de facturation
            </h3>
            <p>
              {order.billingAddress?.fullName}<br />
              {order.billingAddress?.address}<br />
              {order.billingAddress?.postalCode} {order.billingAddress?.city}<br />
              {order.billingAddress?.country}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items-card">
          <h3>Détail des articles</h3>
          
          <div className="order-items-list">
            {order.items?.map((item) => (
              <div key={item.id} className="order-item">
                <div className="order-item-image">
                  <img 
                    src={item.productImage || '/default-product.jpg'} 
                    alt={item.productName}
                  />
                </div>
                
                <div className="order-item-info">
                  <Link to={`/product/${item.productId}`} className="order-item-name">
                    {item.productName}
                  </Link>
                  <span className="order-item-shop">{item.shopName}</span>
                  {!item.isReviewed && (
                    <Link 
                      to={`/product/${item.productId}?writeReview=true`}
                      className="write-review-link"
                    >
                      ✍️ Écrire un avis
                    </Link>
                  )}
                </div>
                
                <div className="order-item-details">
                  <span className="order-item-quantity">x{item.quantity}</span>
                  <span className="order-item-price">
                    {(item.unitPrice * item.quantity).toFixed(2)}€
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Sous-total</span>
              <span>{order.totalAmount?.toFixed(2)}€</span>
            </div>
            <div className="total-row">
              <span>Livraison</span>
              <span>{order.shippingCost?.toFixed(2)}€</span>
            </div>
            <div className="total-row">
              <span>TVA (20%)</span>
              <span>{order.taxAmount?.toFixed(2)}€</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="total-row discount">
                <span>Réduction</span>
                <span>-{order.discountAmount?.toFixed(2)}€</span>
              </div>
            )}
            <div className="total-row grand-total">
              <span>Total</span>
              <span>{order.finalAmount?.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="confirmation-actions">
          <Button variant="outline" onClick={() => navigate('/orders')}>
            Voir mes commandes
          </Button>
          <Button onClick={() => navigate('/products')}>
            Continuer mes achats
          </Button>
        </div>

        {/* Email Confirmation */}
        <div className="email-confirmation">
          <span className="email-icon">📧</span>
          <p>
            Un email de confirmation a été envoyé à <strong>{order.userEmail}</strong>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderConfirmation;