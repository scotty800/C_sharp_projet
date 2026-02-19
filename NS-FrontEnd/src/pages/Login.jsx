import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
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
            <h1>Connexion</h1>
            <p>Bienvenue ! Connectez-vous pour continuer</p>
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="votre@email.com"
            />

            <Input
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
            />

            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>Pas encore de compte ?</p>
            <Link to="/register" className="auth-link">
              Créer un compte
            </Link>
          </div>

          <div className="auth-divider">
            <span>Ou</span>
          </div>

          <div className="social-login">
            <button className="social-btn google">
              <span>G</span>
              Google
            </button>
            <button className="social-btn facebook">
              <span>f</span>
              Facebook
            </button>
          </div>
        </div>

        <div className="auth-features">
          <h2>Pourquoi créer un compte ?</h2>
          <ul>
            <li>
              <span className="feature-icon">🛒</span>
              <div>
                <strong>Passer commande</strong>
                <small>Achetez en quelques clics</small>
              </div>
            </li>
            <li>
              <span className="feature-icon">❤️</span>
              <div>
                <strong>Liste de souhaits</strong>
                <small>Gardez vos produits favoris</small>
              </div>
            </li>
            <li>
              <span className="feature-icon">🚚</span>
              <div>
                <strong>Suivi des commandes</strong>
                <small>Suivez vos colis en temps réel</small>
              </div>
            </li>
            <li>
              <span className="feature-icon">⭐</span>
              <div>
                <strong>Avis et recommandations</strong>
                <small>Partagez votre expérience</small>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;