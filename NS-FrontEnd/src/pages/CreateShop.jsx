import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { shopsApi } from '../api/shops';
import './CreateShop.css';

const CreateShop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
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

  const categories = [
    'Mode',
    'Beauté',
    'Sports',
    'Sneakers',
    'Accessoire',
    'Vintage'
  ];

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

  const validateStep1 = () => {
    if (!formData.name) {
      setError('Le nom de la boutique est requis');
      return false;
    }
    if (!formData.category) {
      setError('La catégorie est requise');
      return false;
    }
    if (!formData.description) {
      setError('La description est requise');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email) {
      setError('L\'email est requis');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email invalide');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Créer la boutique
      const shop = await shopsApi.createShop(formData);

      // Upload logo si présent
      if (logo) {
        await shopsApi.uploadLogo(shop.id, logo);
      }

      // Upload banner si présente
      if (banner) {
        await shopsApi.uploadBanner(shop.id, banner);
      }

      navigate(`/shop/${shop.slug}`);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la boutique');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="create-shop-page"
    >
      <div className="container">
        <h1 className="create-shop-title">Créer votre boutique</h1>

        {/* Progress Steps */}
        <div className="creation-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-number">{step > 1 ? '✓' : '1'}</span>
            <span className="step-label">Informations</span>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-number">{step > 2 ? '✓' : '2'}</span>
            <span className="step-label">Contact</span>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`} />
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Médias</span>
          </div>
        </div>

        {error && (
          <div className="creation-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="creation-form">
            <h2>Informations de base</h2>
            
            <Input
              label="Nom de la boutique"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Ma super boutique"
              required
            />

            <div className="form-group">
              <label>URL personnalisée</label>
              <div className="slug-preview">
                <span className="slug-domain">votresite.com/shop/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="slug-input"
                  placeholder="ma-boutique"
                />
              </div>
              <small className="slug-hint">
                L'URL sera : /shop/{formData.slug || 'ma-boutique'}
              </small>
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
                placeholder="Décrivez votre boutique et ce que vous vendez..."
                rows="5"
                className="description-textarea"
                required
              />
              <small className="char-count">
                {formData.description.length}/500
              </small>
            </div>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="creation-form">
            <h2>Informations de contact</h2>
            
            <Input
              label="Email de contact"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@maboutique.com"
              required
            />

            <Input
              label="Téléphone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+33 1 23 45 67 89"
            />

            <Input
              label="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Rue du Commerce, 75001 Paris"
            />

            <h3 style={{ marginTop: 'var(--space-6)' }}>Personnalisation</h3>
            
            <div className="color-pickers">
              <div className="color-picker">
                <label>Couleur principale</label>
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
          </div>
        )}

        {/* Step 3: Media */}
        {step === 3 && (
          <div className="creation-form">
            <h2>Médias</h2>
            
            <div className="media-upload">
              <div className="upload-section">
                <label>Logo de la boutique</label>
                <div className="upload-area">
                  {logoPreview ? (
                    <div className="preview-container">
                      <img src={logoPreview} alt="Logo preview" />
                      <button 
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
                        <span>Cliquez pour uploader un logo</span>
                        <small>PNG, JPG ou SVG (max. 2MB)</small>
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="upload-section">
                <label>Bannière de la boutique</label>
                <div className="upload-area">
                  {bannerPreview ? (
                    <div className="preview-container">
                      <img src={bannerPreview} alt="Banner preview" />
                      <button 
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
                        <span>Cliquez pour uploader une bannière</span>
                        <small>PNG, JPG (max. 5MB, 1200x300px recommandé)</small>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="preview-note">
              <p>✨ Vous pourrez modifier ces éléments plus tard depuis votre tableau de bord.</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="creation-actions">
          {step > 1 && (
            <Button variant="outline" onClick={handlePreviousStep}>
              Retour
            </Button>
          )}
          
          {step < 3 ? (
            <Button onClick={handleNextStep}>
              Continuer
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Création...' : 'Créer ma boutique'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CreateShop;