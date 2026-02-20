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
  
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const imageBaseUrl = 'http://127.0.0.1:5019';

  useEffect(() => {
    const fetchShopData = async () => {
      if (!slug) {
        setError('Slug manquant');
        setLoading(false);
        return;
      }

      const reservedSlugs = ['my-shops', 'create', 'edit', 'dashboard', 'admin'];
      if (reservedSlugs.includes(slug)) {
        setError('Page non trouvée');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching shop with slug:', slug);
        const shopData = await shopsApi.getShopBySlug(slug);
        
        console.log('✅ Shop data received:', shopData);
        setShop(shopData);
        
        // Une fois le shop chargé, on charge les produits
        if (shopData?.id) {
          await fetchProducts(shopData.id, 1, true);
        }
      } catch (error) {
        console.error('❌ Error fetching shop:', error);
        if (error.response?.status === 404) {
          setError(`La boutique "${slug}" n'existe pas`);
        } else {
          setError('Impossible de charger la boutique');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [slug]);

  // ✅ Fonction pour charger les produits (corrigée)
  const fetchProducts = async (shopId, page = 1, reset = false) => {
    if (!shopId) return;
    
    try {
      setLoadingProducts(true);
      console.log(`📦 Fetching products for shop ${shopId}, page ${page}`);
      
      const response = await productsApi.getProductsByShop(shopId, {
        page: page,
        pageSize: 12
      });

      console.log('✅ Products response:', response);

      // ✅ Gestion du format de réponse de ton API
      let productsData = [];
      let total = 0;

      // Format: { products: { items: [...], totalItems: X, ... } }
      if (response?.products?.items && Array.isArray(response.products.items)) {
        productsData = response.products.items;
        total = response.products.totalItems || 0;
        setHasMoreProducts(productsData.length === 12 && page < response.products.totalPages);
      }
      // Format: { products: [...] } (tableau direct)
      else if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
        total = response.products.length;
        setHasMoreProducts(false);
      }
      // Format: { data: [...] }
      else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
        total = response.data.length;
        setHasMoreProducts(false);
      }
      // Format: tableau direct
      else if (Array.isArray(response)) {
        productsData = response;
        total = response.length;
        setHasMoreProducts(false);
      }

      console.log(`📦 ${productsData.length} produits chargés sur ${total} total`);

      if (reset) {
        setProducts(productsData);
        setTotalProducts(total);
      } else {
        setProducts(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, ...productsData];
        });
      }

      setProductPage(reset ? 2 : page + 1);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      if (reset) {
        setProducts([]);
        setTotalProducts(0);
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  // Charger plus de produits
  const loadMoreProducts = () => {
    if (shop?.id) {
      fetchProducts(shop.id, productPage, false);
    }
  };

  // Rafraîchir la liste des produits
  const refreshProducts = () => {
    if (shop?.id) {
      console.log('🔄 Refreshing products list');
      fetchProducts(shop.id, 1, true);
    }
  };

  const isOwner = user && shop && user.id === shop.ownerId;

  const handleEditShop = () => {
    navigate(`/edit-shop/${shop.id}`);
  };

  const handleAddProduct = () => {
    navigate(`/dashboard/products/new?shop=${shop.id}`);
  };

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
        <h2>😕 Oups !</h2>
        <p>{error}</p>
        <div className="shop-error-actions">
          <Link to="/shops">
            <Button>Voir toutes les boutiques</Button>
          </Link>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Retour
          </Button>
        </div>
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
                  <span className="stat-value">{totalProducts || shop.productCount || 0}</span>
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
                  <Button variant="outline" size="sm" onClick={refreshProducts}>
                    🔄 Rafraîchir
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
              Produits ({products.length || 0})
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