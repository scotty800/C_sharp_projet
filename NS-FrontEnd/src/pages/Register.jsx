import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Nom d'utilisateur requis";
    } else if (formData.username.length < 3) {
      newErrors.username = "Minimum 3 caractères";
    }

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      navigate('/');
    } catch (err) {
      setErrors({ submit: err.message || "Erreur lors de l'inscription" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="auth-page"
    >
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Inscription</h1>
            <p>Rejoignez notre communauté</p>
          </div>

          {errors.submit && (
            <div className="auth-error">
              <span>⚠️</span>
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Nom d'utilisateur"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={errors.username}
              required
              placeholder="Jean Dupont"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
              placeholder="jean@email.com"
            />

            <Input
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
              placeholder="••••••••"
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
              placeholder="••••••••"
            />

            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              />
              <span>
                J'accepte les <Link to="/terms">conditions d'utilisation</Link> et la{' '}
                <Link to="/privacy">politique de confidentialité</Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <span className="terms-error">{errors.acceptTerms}</span>
            )}

            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              disabled={loading}
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </Button>
          </form>

          <div className="auth-footer">
            <p>Déjà un compte ?</p>
            <Link to="/login" className="auth-link">
              Se connecter
            </Link>
          </div>

          <div className="password-requirements">
            <p>Le mot de passe doit contenir :</p>
            <ul>
              <li className={formData.password.length >= 8 ? 'valid' : ''}>
                ✓ Au moins 8 caractères
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                ✓ Une lettre majuscule
              </li>
              <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                ✓ Un chiffre
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;