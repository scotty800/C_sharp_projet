import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleQuantityChange = (delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } catch (error) {
      setIsRemoving(false);
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className={`cart-item ${isRemoving ? 'removing' : ''}`}>
      <div className="cart-item-product">
        <div className="cart-item-image">
          <img 
            src={!imageError && item.imageUrl ? item.imageUrl : '/default-product.jpg'}
            alt={item.name}
            onError={() => setImageError(true)}
          />
        </div>
        
        <div className="cart-item-info">
          <Link to={`/product/${item.productId}`} className="cart-item-name">
            {item.name}
          </Link>
          
          {item.shopName && (
            <Link to={`/shop/${item.shopId}`} className="cart-item-shop">
              🏪 {item.shopName}
            </Link>
          )}
          
          {item.size && <span className="cart-item-variant">Taille: {item.size}</span>}
          {item.color && (
            <span className="cart-item-variant">
              Couleur: <span className="color-dot" style={{ backgroundColor: item.color }} />
            </span>
          )}
        </div>
      </div>

      <div className="cart-item-price">
        {item.discount > 0 ? (
          <>
            <span className="original-price">{item.price.toFixed(2)}€</span>
            <span className="discounted-price">
              {(item.price * (1 - item.discount / 100)).toFixed(2)}€
            </span>
          </>
        ) : (
          <span className="current-price">{item.price.toFixed(2)}€</span>
        )}
      </div>

      <div className="cart-item-quantity">
        <div className="quantity-controls">
          <button 
            onClick={() => handleQuantityChange(-1)}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span>{item.quantity}</span>
          <button 
            onClick={() => handleQuantityChange(1)}
            disabled={item.quantity >= item.stock}
          >
            +
          </button>
        </div>
        {item.quantity >= item.stock && (
          <span className="max-stock">Stock max</span>
        )}
      </div>

      <div className="cart-item-total">
        <span className="total-price">{itemTotal.toFixed(2)}€</span>
      </div>

      <button 
        className="cart-item-remove"
        onClick={handleRemove}
        disabled={isRemoving}
        aria-label="Supprimer"
      >
        {isRemoving ? '...' : '✕'}
      </button>
    </div>
  );
};

export default CartItem;