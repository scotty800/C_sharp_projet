import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { shopsApi } from '../api/shops';
import { productsApi } from '../api/products';
import './ShopDetail.css';

const ShopDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]); // ✅ Toujours un tableau
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  // URL de base pour les images
  const imageBaseUrl = 'http://127.0.0.1:5019';

  useEffect(() => {
    fetchShopData();
  }, [slug]);

  useEffect(() => {
    if (shop?.id) {
      fetchProducts();
    }
  }, [shop, productPage]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      setError(null);
      const shopData = await shopsApi.getShopBySlug(slug);
      setShop(shopData);
    } catch (error) {
      console.error('Error fetching shop:', error);
      setError('Impossible de charger la boutique');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!shop?.id) return;
    
    try {
      setLoadingProducts(true);
      const response = await productsApi.getProductsByShop(shop.id, {
        page: productPage,
        pageSize: 12
      });

      // ✅ Gestion robuste des différents formats de réponse
      let productsData = [];
      
      if (response?.data) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      } else if (response?.items) {
        productsData = response.items;
      } else if (response?.products) {
        productsData = response.products;
      }

      // ✅ S'assurer que productsData est un tableau
      if (!Array.isArray(productsData)) {
        console.warn('Products data is not an array:', productsData);
        productsData = [];
      }

      // ✅ Mettre à jour l'état
      if (productPage === 1) {
        setProducts(productsData);
      } else {
        setProducts(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, ...productsData];
        });
      }

      setHasMoreProducts(productsData.length === 12);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      // ✅ En cas d'erreur, garder un tableau vide
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadMoreProducts = () => {
    setProductPage(prev => prev + 1);
  };

  const handleEditShop = () => {
    navigate(`/edit-shop/${shop.id}`);
  };

  const handleAddProduct = () => {
    navigate(`/dashboard/products/new?shop=${shop.id}`);
  };

  const isOwner = user && shop && user.id === shop.ownerId;

  // Fonction pour formater l'URL de l'image
  const getImageUrl = (path) => {
    if (!path) return '/default-shop-banner.jpg';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) return `${imageBaseUrl}${path}`;
    return `${imageBaseUrl}${path}`;
  };

  if (loading) {
    return (
      <div className="shop-detail-loading">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-error">
        <h2>Erreur</h2>
        <p>{error}</p>
        <Link to="/shops">
          <Button>Retour aux boutiques</Button>
        </Link>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="shop-not-found">
        <h2>Boutique non trouvée</h2>
        <p>La boutique que vous recherchez n'existe pas ou a été supprimée.</p>
        <Link to="/shops">
          <Button>Voir toutes les boutiques</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="shop-detail-page"
      style={{
        '--theme-color': shop.themeColor || '#2563eb',
        '--bg-color': shop.backgroundColor || '#ffffff',
        '--text-color': shop.textColor || '#000000'
      }}
    >
      {/* Banner */}
      <div className="shop-banner">
        <img 
          src={getImageUrl(shop.bannerUrl)} 
          alt={shop.name}
          className="banner-image"
          onError={(e) => {
            e.target.src = '/default-banner.jpg';
          }}
        />
        <div className="banner-overlay" />
      </div>

      {/* Shop Info */}
      <div className="shop-info-section">
        <div className="container">
          <div className="shop-info-grid">
            <div className="shop-logo">
              {shop.logoUrl ? (
                <img 
                  src={getImageUrl(shop.logoUrl)} 
                  alt={shop.name}
                  onError={(e) => {
                    e.target.src = '/default-logo.png';
                  }}
                />
              ) : (
                <span className="logo-placeholder">{shop.name?.[0] || 'S'}</span>
              )}
            </div>

            <div className="shop-details">
              <h1 className="shop-name">{shop.name}</h1>
              <p className="shop-category">{shop.category || 'Boutique'}</p>
              
              <div className="shop-stats">
                <div className="stat">
                  <span className="stat-value">{shop.productCount || 0}</span>
                  <span className="stat-label">Produits</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{shop.rating || 'Nouveau'}</span>
                  <span className="stat-label">Note</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{shop.followers || 0}</span>
                  <span className="stat-label">Abonnés</span>
                </div>
              </div>

              <p className="shop-description">{shop.description}</p>

              {isOwner && (
                <div className="shop-owner-actions">
                  <Button variant="outline" size="sm" onClick={handleEditShop}>
                    Modifier la boutique
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAddProduct}>
                    Ajouter un produit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="shop-tabs">
        <div className="container">
          <div className="tabs-list">
            <button
              className={`tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Produits ({shop.productCount || 0})
            </button>
            <button
              className={`tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              À propos
            </button>
            <button
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Avis ({shop.reviewCount || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <div className="container">
          {activeTab === 'products' && (
            <div className="products-section">
              {/* ✅ Vérification robuste pour products */}
              {(!products || !Array.isArray(products) || products.length === 0) && !loadingProducts ? (
                <div className="no-products">
                  <p>Aucun produit dans cette boutique pour le moment.</p>
                  {isOwner && (
                    <Button variant="outline" onClick={handleAddProduct}>
                      Ajouter votre premier produit
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="products-grid">
                    {/* ✅ Vérification que products est un tableau avant map */}
                    {Array.isArray(products) && products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {loadingProducts && (
                    <div className="products-loading">
                      <Spinner />
                    </div>
                  )}

                  {hasMoreProducts && !loadingProducts && products.length > 0 && (
                    <div className="load-more">
                      <Button variant="outline" onClick={loadMoreProducts}>
                        Voir plus de produits
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-section">
              <div className="about-card">
                <h3>À propos de {shop.name}</h3>
                <p>{shop.longDescription || shop.description || 'Aucune description disponible.'}</p>

                <div className="shop-contact">
                  <h4>Contact</h4>
                  {shop.email && <p>📧 {shop.email}</p>}
                  {shop.phone && <p>📞 {shop.phone}</p>}
                  {shop.address && <p>📍 {shop.address}</p>}
                </div>

                <div className="shop-meta">
                  <p>🕐 Membre depuis {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString() : 'N/A'}</p>
                  <p>🏷️ Catégorie: {shop.category || 'Non spécifiée'}</p>
                </div>

                {/* Aperçu des couleurs personnalisées */}
                <div className="shop-colors-preview">
                  <h4>Personnalisation</h4>
                  <div className="color-demo">
                    <div className="color-item">
                      <span className="color-label">Couleur thème</span>
                      <div className="color-box" style={{ backgroundColor: shop.themeColor || '#2563eb' }} />
                    </div>
                    <div className="color-item">
                      <span className="color-label">Fond</span>
                      <div className="color-box" style={{ backgroundColor: shop.backgroundColor || '#ffffff', border: '1px solid #ccc' }} />
                    </div>
                    <div className="color-item">
                      <span className="color-label">Texte</span>
                      <div className="color-box" style={{ backgroundColor: shop.textColor || '#000000' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <p>Section avis en cours de développement...</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShopDetail;