import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { productsApi } from '../../api/products';
import './CreateProduct.css';

const CreateProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const shopId = new URLSearchParams(location.search).get('shop');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    category: '',
    size: '',
    color: '',
    shopId: shopId
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = [
    'Mode', 'Électronique', 'Maison', 'Beauté', 
    'Sports', 'Livres', 'Artisanat', 'Vintage'
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limiter à 3 images
    const newImages = files.slice(0, 3 - images.length);
    
    setImages(prev => [...prev, ...newImages]);

    // Créer les previews
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
      // 1. Créer le produit
      const product = await productsApi.createForShop(shopId, formData);

      // 2. Uploader les images si présentes
      if (images.length > 0) {
        await productsApi.uploadImages(product.id, images);
      }

      setSuccess('Produit créé avec succès !');

      // Rediriger vers la boutique après 2 secondes
      setTimeout(() => {
        navigate(`/shop/${shopId}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating product:', error);
      setError('Erreur lors de la création du produit');
    } finally {
      setSaving(false);
    }
  };

  if (!shopId) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="create-product-page"
    >
      <div className="container">
        <h1>Ajouter un produit</h1>

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
            {/* Colonne gauche */}
            <div className="form-column">
              <h2>Informations du produit</h2>

              <Input
                label="Nom du produit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
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
                />

                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
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
                  <option value="">Sélectionner</option>
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

            {/* Colonne droite */}
            <div className="form-column">
              <h2>Images du produit</h2>
              <p className="image-hint">Vous pouvez ajouter jusqu'à 3 images</p>

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
              onClick={() => navigate(`/dashboard?shop=${shopId}`)}
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