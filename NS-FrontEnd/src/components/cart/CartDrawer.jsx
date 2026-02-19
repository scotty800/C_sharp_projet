import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';
import CartItem from './CartItem';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart } = useCart();

  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  ) || 0;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="cart-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
          >
            <div className="cart-drawer-header">
              <h3>Votre panier</h3>
              <button className="cart-drawer-close" onClick={onClose}>
                ✕
              </button>
            </div>

            {!cart?.items?.length ? (
              <div className="cart-drawer-empty">
                <span className="empty-icon">🛒</span>
                <p>Votre panier est vide</p>
                <Button variant="outline" onClick={onClose}>
                  Continuer mes achats
                </Button>
              </div>
            ) : (
              <>
                <div className="cart-drawer-items">
                  {cart.items.map(item => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      isDrawer
                    />
                  ))}
                </div>

                <div className="cart-drawer-footer">
                  <div className="cart-drawer-subtotal">
                    <span>Sous-total</span>
                    <span className="subtotal-amount">{subtotal.toFixed(2)}€</span>
                  </div>

                  <div className="cart-drawer-actions">
                    <Button 
                      variant="outline" 
                      fullWidth 
                      onClick={handleViewCart}
                    >
                      Voir le panier
                    </Button>
                    <Button 
                      fullWidth 
                      onClick={handleCheckout}
                    >
                      Commander
                    </Button>
                  </div>

                  <div className="cart-drawer-shipping">
                    {subtotal < 50 ? (
                      <p>
                        Plus que <strong>{(50 - subtotal).toFixed(2)}€</strong> pour la livraison gratuite
                      </p>
                    ) : (
                      <p className="free-shipping">✓ Livraison gratuite</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CartDrawer;