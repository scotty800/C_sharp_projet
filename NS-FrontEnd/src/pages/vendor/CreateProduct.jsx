import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { productsApi } from '../../api/products';
import { shopsApi } from '../../api/shops';
import './CreateProduct.css';

const CreateProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const initialShopId = queryParams.get('shop');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [shopSlug, setShopSlug] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    category: '',
    size: '',
    color: '',
    shopId: initialShopId
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = [
    'Mode', 'Électronique', 'Maison', 'Beauté', 
    'Sports', 'Livres', 'Artisanat', 'Vintage'
  ];

  useEffect(() => {
    const fetchShopSlug = async () => {
      if (!initialShopId) {
        setLoadingShop(false);
        return;
      }

      try {
        setLoadingShop(true);
        console.log('🔍 Fetching shop info for ID:', initialShopId);
        const shop = await shopsApi.getShopById(parseInt(initialShopId));
        console.log('✅ Shop found:', shop);
        setShopSlug(shop.slug);
      } catch (error) {
        console.error('❌ Error fetching shop slug:', error);
        setError('Impossible de récupérer les informations de la boutique');
      } finally {
        setLoadingShop(false);
      }
    };

    fetchShopSlug();
  }, [initialShopId]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.slice(0, 3 - images.length);
    setImages(prev => [...prev, ...newImages]);
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation
      if (!formData.name) throw new Error('Le nom du produit est requis');
      if (!formData.price) throw new Error('Le prix est requis');
      if (!formData.stock) throw new Error('Le stock est requis');
      if (!formData.category) throw new Error('La catégorie est requise');

      // 1. Créer le produit
      console.log('📝 Creating product for shop:', initialShopId);
      console.log('📦 Form data:', formData);
      
      const response = await productsApi.createForShop(initialShopId, formData);
      console.log('✅ Product created - Full response:', response);

      // ✅ Récupérer l'ID du produit (gestion des différents formats de réponse)
      let productId = null;
      
      if (response?.id) {
        productId = response.id;
      } else if (response?.productId) {
        productId = response.productId;
      } else if (response?.data?.id) {
        productId = response.data.id;
      } else if (typeof response === 'number') {
        productId = response;
      }

      if (!productId) {
        console.error('❌ Impossible de récupérer l\'ID du produit:', response);
        throw new Error('Impossible de récupérer l\'ID du produit créé');
      }

      console.log('✅ Product ID for upload:', productId);

      // 2. Uploader les images si présentes
      if (images.length > 0) {
        console.log('📸 Uploading', images.length, 'images for product:', productId);
        
        try {
          await productsApi.uploadImages(productId, images);
          console.log('✅ Images uploaded successfully');
        } catch (uploadError) {
          console.error('❌ Upload failed but product was created:', uploadError);
          setSuccess('✅ Produit créé mais erreur lors de l\'upload des images');
          // On continue malgré l'erreur d'upload
        }
      }

      setSuccess('✅ Produit créé avec succès !');

      // Redirection après 2 secondes
      setTimeout(() => {
        if (shopSlug) {
          navigate(`/shops/${shopSlug}`);
        } else {
          navigate('/shops/my-shops');
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Error creating product:', error);
      setError(error.message || 'Erreur lors de la création du produit');
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    if (shopSlug) {
      navigate(`/shops/${shopSlug}`);
    } else {
      navigate('/shops/my-shops');
    }
  };

  if (!initialShopId) {
    return (
      <div className="create-product-error">
        <h2>Erreur</h2>
        <p>ID de boutique manquant</p>
        <Button onClick={() => navigate('/dashboard')}>
          Retour au dashboard
        </Button>
      </div>
    );
  }

  if (loadingShop) {
    return (
      <div className="create-product-loading">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="create-product-page"
    >
      <div className="container">
        <div className="create-product-header">
          <div>
            <h1>Ajouter un produit</h1>
            {shopSlug && (
              <p className="shop-indicator">
                🏪 Pour la boutique : <Link to={`/shops/${shopSlug}`}>Voir la boutique</Link>
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleGoBack}>
            ← Retour à la boutique
          </Button>
        </div>

        {error && (
          <div className="alert error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert success">
            <span>✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-product-form">
          <div className="form-grid">
            <div className="form-column">
              <h2>Informations du produit</h2>

              <Input
                label="Nom du produit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: T-shirt en coton"
              />

              <div className="form-row">
                <Input
                  label="Prix (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="29.99"
                />

                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  placeholder="10"
                />
              </div>

              <div className="form-group">
                <label>Catégorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="category-select"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="5"
                  className="description-textarea"
                  required
                  placeholder="Description détaillée du produit..."
                />
              </div>

              <div className="form-row">
                <Input
                  label="Tailles (séparées par des virgules)"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="S, M, L, XL"
                />

                <Input
                  label="Couleurs (séparées par des virgules)"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Rouge, Bleu, Vert"
                />
              </div>
            </div>

            <div className="form-column">
              <h2>Images du produit</h2>
              <p className="image-hint">Vous pouvez ajouter jusqu'à 3 images (max 5MB chacune)</p>

              <div className="images-upload">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {images.length < 3 && (
                  <div className="upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="product-images"
                      multiple
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="product-images" className="upload-label">
                      <span className="upload-icon">📸</span>
                      <span>Ajouter des images</span>
                      <small>Cliquez pour sélectionner</small>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoBack}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
            >
              {saving ? <Spinner size="sm" /> : 'Créer le produit'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateProduct;