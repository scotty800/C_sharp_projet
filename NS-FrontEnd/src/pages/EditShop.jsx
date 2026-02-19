import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import { shopsApi } from '../api/shops';
import './EditShop.css';

const EditShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    longDescription: '',
    category: '',
    email: '',
    phone: '',
    address: '',
    themeColor: '#2563eb',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  });

  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  const imageBaseUrl = 'http://127.0.0.1:5019';

  useEffect(() => {
    fetchShop();
  }, [id]);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const shop = await shopsApi.getShopById(id);
      
      // Vérifier que l'utilisateur est bien le propriétaire
      if (user.id !== shop.ownerId) {
        navigate('/dashboard');
        return;
      }

      setFormData({
        name: shop.name || '',
        slug: shop.slug || '',
        description: shop.description || '',
        longDescription: shop.longDescription || '',
        category: shop.category || '',
        email: shop.email || '',
        phone: shop.phone || '',
        address: shop.address || '',
        themeColor: shop.themeColor || '#2563eb',
        backgroundColor: shop.backgroundColor || '#ffffff',
        textColor: shop.textColor || '#000000'
      });

      if (shop.logoUrl) {
        setLogoPreview(shop.logoUrl.startsWith('http') ? shop.logoUrl : `${imageBaseUrl}${shop.logoUrl}`);
      }
      if (shop.bannerUrl) {
        setBannerPreview(shop.bannerUrl.startsWith('http') ? shop.bannerUrl : `${imageBaseUrl}${shop.bannerUrl}`);
      }

    } catch (error) {
      console.error('Error fetching shop:', error);
      setError('Impossible de charger la boutique');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Mettre à jour les informations du shop
      await shopsApi.updateShop(id, formData);

      // 2. Uploader le logo si un nouveau a été sélectionné
      if (logo) {
        await shopsApi.uploadLogo(id, logo);
      }

      // 3. Uploader la bannière si une nouvelle a été sélectionnée
      if (banner) {
        await shopsApi.uploadBanner(id, banner);
      }

      setSuccess('Boutique mise à jour avec succès !');
      
      // Rediriger vers la page du shop après 2 secondes
      setTimeout(() => {
        navigate(`/shop/${formData.slug}`);
      }, 2000);

    } catch (error) {
      console.error('Error updating shop:', error);
      setError('Erreur lors de la mise à jour de la boutique');
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    'Mode', 'Électronique', 'Maison', 'Beauté', 
    'Sports', 'Livres', 'Artisanat', 'Vintage', 'Art'
  ];

  if (loading) {
    return (
      <div className="edit-shop-loading">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="edit-shop-page"
    >
      <div className="container">
        <h1>Modifier la boutique</h1>

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

        <form onSubmit={handleSubmit} className="edit-shop-form">
          {/* Informations générales */}
          <div className="form-section">
            <h2>Informations générales</h2>
            
            <Input
              label="Nom de la boutique"
              value={formData.name}
              onChange={handleNameChange}
              required
            />

            <div className="form-group">
              <label>URL personnalisée</label>
              <div className="slug-preview">
                <span className="slug-domain">/shop/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="slug-input"
                  required
                />
              </div>
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
              <label>Description courte</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="description-textarea"
                maxLength="500"
              />
              <small className="char-count">{formData.description.length}/500</small>
            </div>

            <div className="form-group">
              <label>Description longue</label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                rows="5"
                className="description-textarea"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="form-section">
            <h2>Contact</h2>
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Téléphone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Personnalisation */}
          <div className="form-section">
            <h2>Personnalisation</h2>
            
            <div className="color-pickers">
              <div className="color-picker">
                <label>Couleur thème</label>
                <input
                  type="color"
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                />
              </div>
              
              <div className="color-picker">
                <label>Couleur de fond</label>
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                />
              </div>
              
              <div className="color-picker">
                <label>Couleur du texte</label>
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                />
              </div>
            </div>

            <div className="color-preview">
              <div 
                className="preview-box"
                style={{
                  backgroundColor: formData.backgroundColor,
                  color: formData.textColor,
                  borderLeft: `4px solid ${formData.themeColor}`
                }}
              >
                <span>Aperçu du style</span>
              </div>
            </div>
          </div>

          {/* Médias */}
          <div className="form-section">
            <h2>Médias</h2>
            
            <div className="media-upload">
              <div className="upload-section">
                <label>Logo</label>
                <div className="upload-area">
                  {logoPreview ? (
                    <div className="preview-container">
                      <img src={logoPreview} alt="Logo preview" />
                      <button 
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          setLogo(null);
                          setLogoPreview('');
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        id="logo-upload"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="logo-upload" className="upload-label">
                        <span className="upload-icon">📸</span>
                        <span>Changer le logo</span>
                        <small>PNG, JPG (max. 2MB)</small>
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="upload-section">
                <label>Bannière</label>
                <div className="upload-area">
                  {bannerPreview ? (
                    <div className="preview-container">
                      <img src={bannerPreview} alt="Banner preview" />
                      <button 
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          setBanner(null);
                          setBannerPreview('');
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        id="banner-upload"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="banner-upload" className="upload-label">
                        <span className="upload-icon">🖼️</span>
                        <span>Changer la bannière</span>
                        <small>PNG, JPG (max. 5MB)</small>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/shop/${formData.slug}`)}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditShop;