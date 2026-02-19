import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { usersApi } from '../api/users';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile form
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    avatar: null
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    newsletter: true,
    orderUpdates: true,
    promotions: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || null
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await usersApi.updateUser(user.id, profileData);
      updateUser(updatedUser);
      setSuccess('Profil mis à jour avec succès');
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      await usersApi.updatePassword(user.id, passwordData);
      setSuccess('Mot de passe mis à jour avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="profile-page"
    >
      <div className="container">
        <h1 className="profile-title">Mon profil</h1>

        <div className="profile-grid">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt={profileData.username} />
                ) : (
                  <span className="avatar-placeholder">
                    {profileData.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <label className="avatar-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <span className="upload-button">Changer la photo</span>
              </label>
            </div>

            <nav className="profile-nav">
              <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span className="nav-icon">👤</span>
                Informations personnelles
              </button>
              <button
                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <span className="nav-icon">🔒</span>
                Sécurité
              </button>
              <button
                className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                <span className="nav-icon">⚙️</span>
                Préférences
              </button>
              <button
                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <span className="nav-icon">📍</span>
                Adresses
              </button>
            </nav>

            <div className="profile-stats">
              <div className="stat-card">
                <span className="stat-value">{user?.orderCount || 0}</span>
                <span className="stat-label">Commandes</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{user?.reviewCount || 0}</span>
                <span className="stat-label">Avis</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{user?.memberSince || '2024'}</span>
                <span className="stat-label">Membre depuis</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-content">
            {success && (
              <div className="alert success">
                <span>✓</span>
                {success}
              </div>
            )}
            
            {error && (
              <div className="alert error">
                <span>✗</span>
                {error}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <h2>Informations personnelles</h2>
                
                <Input
                  label="Nom d'utilisateur"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />

                <Input
                  label="Téléphone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />

                <Button type="submit" disabled={loading}>
                  {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                </Button>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordUpdate} className="profile-form">
                <h2>Changer le mot de passe</h2>
                
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />

                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                />

                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />

                <div className="password-requirements">
                  <p>Le mot de passe doit contenir :</p>
                  <ul>
                    <li className={passwordData.newPassword.length >= 8 ? 'valid' : ''}>
                      Au moins 8 caractères
                    </li>
                    <li className={/[A-Z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                      Une lettre majuscule
                    </li>
                    <li className={/[0-9]/.test(passwordData.newPassword) ? 'valid' : ''}>
                      Un chiffre
                    </li>
                  </ul>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </Button>
              </form>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="preferences-form">
                <h2>Préférences de communication</h2>
                
                <label className="preference-item">
                  <input
                    type="checkbox"
                    checked={preferences.newsletter}
                    onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                  />
                  <div>
                    <strong>Newsletter</strong>
                    <small>Recevez nos offres et actualités</small>
                  </div>
                </label>

                <label className="preference-item">
                  <input
                    type="checkbox"
                    checked={preferences.orderUpdates}
                    onChange={(e) => setPreferences({ ...preferences, orderUpdates: e.target.checked })}
                  />
                  <div>
                    <strong>Mises à jour des commandes</strong>
                    <small>Notifications sur l'état de vos commandes</small>
                  </div>
                </label>

                <label className="preference-item">
                  <input
                    type="checkbox"
                    checked={preferences.promotions}
                    onChange={(e) => setPreferences({ ...preferences, promotions: e.target.checked })}
                  />
                  <div>
                    <strong>Offres personnalisées</strong>
                    <small>Recevez des promotions adaptées à vos goûts</small>
                  </div>
                </label>

                <Button onClick={() => setSuccess('Préférences mises à jour')}>
                  Enregistrer les préférences
                </Button>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="addresses-form">
                <h2>Mes adresses</h2>
                
                <div className="address-list">
                  {/* Address items would be mapped here */}
                  <div className="address-item">
                    <div className="address-content">
                      <strong>Adresse par défaut</strong>
                      <p>123 Rue Example, 75001 Paris, France</p>
                    </div>
                    <div className="address-actions">
                      <button className="edit-btn">✎</button>
                      <button className="delete-btn">✕</button>
                    </div>
                  </div>
                </div>

                <Button variant="outline">
                  + Ajouter une nouvelle adresse
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;