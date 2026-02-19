import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import Button from '../components/common/Button';
import ProductCard from '../components/products/ProductCard';
import { productsApi } from '../api/products';
import { reviewsApi } from '../api/reviews';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const [productData, reviewsData, relatedData] = await Promise.all([
        productsApi.getProductById(id),
        reviewsApi.getReviewsByProduct(id),
        productsApi.getRelatedProducts(id)
      ]);
      
      setProduct(productData);
      setReviews(reviewsData);
      setRelatedProducts(relatedData);
      
      // Check if user has already reviewed
      if (user) {
        const userReviewData = reviewsData.find(r => r.userId === user.id);
        setUserReview(userReviewData);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    // Optional: Show success message or open cart drawer
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity);
    navigate('/checkout');
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product.stock)));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="container">
          <div className="loading-grid">
            <div className="skeleton-gallery" />
            <div className="skeleton-info">
              <div className="skeleton-line large" />
              <div className="skeleton-line" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line" />
              <div className="skeleton-price" />
              <div className="skeleton-actions" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Produit non trouvé</h2>
        <p>Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link to="/products">
          <Button>Voir tous les produits</Button>
        </Link>
      </div>
    );
  }

  const images = [
    product.imageUrl,
    product.imageUrl1,
    product.imageUrl2,
    product.imageUrl3
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="product-detail-page"
    >
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Accueil</Link>
          <span className="separator">/</span>
          <Link to="/products">Produits</Link>
          <span className="separator">/</span>
          <Link to={`/category/${product.category}`}>{product.category}</Link>
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </div>

        {/* Product Main */}
        <div className="product-main">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img 
                src={images[selectedImage] || '/default-product.jpg'} 
                alt={product.name}
              />
            </div>
            
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              
              <div className="product-meta">
                <Link to={`/shop/${product.shopId}`} className="shop-link">
                  <span className="shop-icon">🏪</span>
                  {product.shopName}
                </Link>
                
                <div className="product-rating">
                  <span className="stars">
                    {'⭐'.repeat(Math.floor(calculateAverageRating()))}
                  </span>
                  <span className="rating-value">{calculateAverageRating()}</span>
                  <span className="review-count">({reviews.length} avis)</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="product-price-section">
              {product.discount > 0 ? (
                <>
                  <span className="original-price">
                    {product.price.toFixed(2)}€
                  </span>
                  <span className="discounted-price">
                    {(product.price * (1 - product.discount / 100)).toFixed(2)}€
                  </span>
                  <span className="discount-badge">-{product.discount}%</span>
                </>
              ) : (
                <span className="current-price">
                  {product.price.toFixed(2)}€
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {product.stock > 0 ? (
                <>
                  <span className="in-stock">✓ En stock</span>
                  <span className="stock-count">({product.stock} disponibles)</span>
                </>
              ) : (
                <span className="out-of-stock">✗ Rupture de stock</span>
              )}
            </div>

            {/* Variants */}
            {(product.size || product.color) && (
              <div className="product-variants">
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
            <div className="quantity-selector">
              <label>Quantité</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <Button 
                size="lg" 
                fullWidth
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                Ajouter au panier
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                fullWidth
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Acheter maintenant
              </Button>
            </div>

            {/* Features */}
            <div className="product-features">
              <div className="feature">
                <span className="feature-icon">🚚</span>
                <div className="feature-text">
                  <strong>Livraison gratuite</strong>
                  <small>À partir de 50€ d'achat</small>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">🔄</span>
                <div className="feature-text">
                  <strong>Retour gratuit</strong>
                  <small>Sous 30 jours</small>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <div className="feature-text">
                  <strong>Paiement sécurisé</strong>
                  <small>CB, PayPal, Apple Pay</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Détails
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Avis ({reviews.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-tab">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="details-tab">
                <table className="details-table">
                  <tbody>
                    <tr>
                      <th>Catégorie</th>
                      <td>{product.category}</td>
                    </tr>
                    {product.size && (
                      <tr>
                        <th>Tailles disponibles</th>
                        <td>{product.size}</td>
                      </tr>
                    )}
                    {product.color && (
                      <tr>
                        <th>Couleurs disponibles</th>
                        <td>{product.color}</td>
                      </tr>
                    )}
                    <tr>
                      <th>Stock</th>
                      <td>{product.stock} unités</td>
                    </tr>
                    <tr>
                      <th>Référence</th>
                      <td>REF-{product.id}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                {/* Reviews section will be implemented separately */}
                <p>Section avis en cours de développement...</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2 className="section-title">Produits similaires</h2>
            <div className="related-grid">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductDetail;