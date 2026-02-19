import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';
import ProductCarousel from './ProductCarousel';
import './QuickView.css';

const QuickView = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!isOpen) return null;

  const images = [
    product.imageUrl,
    product.imageUrl1,
    product.imageUrl2,
    product.imageUrl3
  ].filter(Boolean);

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="quickview-overlay" onClick={onClose}>
          <motion.div 
            className="quickview-modal"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="quickview-close" onClick={onClose}>
              ✕
            </button>

            <div className="quickview-content">
              {/* Images */}
              <div className="quickview-images">
                <ProductCarousel images={images} productName={product.name} />
              </div>

              {/* Info */}
              <div className="quickview-info">
                <h2 className="quickview-title">{product.name}</h2>
                
                <div className="quickview-meta">
                  <span className="quickview-price">
                    {product.discount > 0 ? (
                      <>
                        <span className="original-price">
                          {product.price.toFixed(2)}€
                        </span>
                        <span className="discounted-price">
                          {(product.price * (1 - product.discount / 100)).toFixed(2)}€
                        </span>
                      </>
                    ) : (
                      <span className="current-price">
                        {product.price.toFixed(2)}€
                      </span>
                    )}
                  </span>
                  
                  <span className="quickview-rating">
                    {'⭐'.repeat(Math.floor(product.rating || 0))}
                    <span className="rating-count">({product.reviewCount || 0})</span>
                  </span>
                </div>

                <p className="quickview-description">
                  {product.description}
                </p>

                {/* Variants */}
                {(product.size || product.color) && (
                  <div className="quickview-variants">
                    {product.size && (
                      <div className="variant-group">
                        <label>Taille</label>
                        <div className="variant-options">
                          {product.size.split(',').map(size => (
                            <button key={size} className="variant-option">
                              {size.trim()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.color && (
                      <div className="variant-group">
                        <label>Couleur</label>
                        <div className="variant-options">
                          {product.color.split(',').map(color => (
                            <button 
                              key={color} 
                              className="variant-option color"
                              style={{ backgroundColor: color.trim() }}
                              title={color.trim()}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity */}
                <div className="quickview-quantity">
                  <label>Quantité</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(q + 1, product.stock))}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="quickview-actions">
                  <Button 
                    fullWidth 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    Ajouter au panier
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    fullWidth
                    onClick={() => {
                      onClose();
                      window.location.href = `/product/${product.id}`;
                    }}
                  >
                    Voir détails
                  </Button>
                </div>

                {/* Stock Status */}
                <div className="quickview-stock">
                  {product.stock > 0 ? (
                    <span className="in-stock">✓ En stock ({product.stock} disponibles)</span>
                  ) : (
                    <span className="out-of-stock">✗ Rupture de stock</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default QuickView;