import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import './ShopForm.css';

const ShopForm = ({ initialData = {}, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    slug: initialData.slug || '',
    description: initialData.description || '',
    category: initialData.category || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    themeColor: initialData.themeColor || '#2563eb',
    backgroundColor: initialData.backgroundColor || '#ffffff',
    textColor: initialData.textColor || '#000000',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'Mode', 'Électronique', 'Maison', 'Beauté', 
    'Sports', 'Livres', 'Artisanat', 'Vintage', 'Art'
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

  const validate = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Nom requis';
    if (!formData.category) newErrors.category = 'Catégorie requise';
    if (!formData.description) newErrors.description = 'Description requise';
    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="shop-form">
      <div className="shop-form-section">
        <h3>Informations générales</h3>
        
        <Input
          label="Nom de la boutique"
          value={formData.name}
          onChange={handleNameChange}
          error={errors.name}
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
            />
          </div>
        </div>

        <div className="form-group">
          <label>Catégorie</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={`category-select ${errors.category ? 'error' : ''}`}
          >
            <option value="">Sélectionner</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="5"
            className={`description-textarea ${errors.description ? 'error' : ''}`}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
          <small className="char-count">{formData.description.length}/500</small>
        </div>
      </div>

      <div className="shop-form-section">
        <h3>Contact</h3>
        
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
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

      <div className="shop-form-section">
        <h3>Personnalisation</h3>
        
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

      <div className="shop-form-actions">
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer la boutique'}
        </Button>
      </div>
    </form>
  );
};

export default ShopForm;