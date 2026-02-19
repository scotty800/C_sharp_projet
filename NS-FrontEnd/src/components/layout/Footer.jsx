import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* About */}
          <div className="footer-section">
            <h3 className="footer-title">MarketPlace</h3>
            <p className="footer-description">
              La plateforme qui connecte les acheteurs avec les meilleures boutiques indépendantes. 
              Découvrez des produits uniques et soutenez les petits commerces.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span>📘</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span>📷</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span>🐦</span>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span>📌</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="footer-section">
            <h3 className="footer-title">Navigation</h3>
            <ul className="footer-links">
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/shops">Boutiques</Link></li>
              <li><Link to="/products">Produits</Link></li>
              <li><Link to="/categories">Catégories</Link></li>
              <li><Link to="/deals">Promotions</Link></li>
            </ul>
          </div>

          {/* Aide */}
          <div className="footer-section">
            <h3 className="footer-title">Aide</h3>
            <ul className="footer-links">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Livraison</Link></li>
              <li><Link to="/returns">Retours</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/size-guide">Guide des tailles</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div className="footer-section">
            <h3 className="footer-title">Légal</h3>
            <ul className="footer-links">
              <li><Link to="/terms">Conditions d'utilisation</Link></li>
              <li><Link to="/privacy">Politique de confidentialité</Link></li>
              <li><Link to="/cookies">Cookies</Link></li>
              <li><Link to="/legal">Mentions légales</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section newsletter">
            <h3 className="footer-title">Newsletter</h3>
            <p>Recevez nos offres exclusives et nouveautés</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="newsletter-input"
                aria-label="Email pour newsletter"
              />
              <button type="submit" className="newsletter-btn">
                S'abonner
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="payment-methods">
            <span className="payment-icon" title="Visa">💳 Visa</span>
            <span className="payment-icon" title="Mastercard">💳 Mastercard</span>
            <span className="payment-icon" title="PayPal">🅿️ PayPal</span>
            <span className="payment-icon" title="Apple Pay">🍎 Apple Pay</span>
            <span className="payment-icon" title="Google Pay">🇬 Google Pay</span>
          </div>

          <div className="copyright">
            &copy; {currentYear} MarketPlace. Tous droits réservés.
          </div>

          <div className="language-selector">
            <select className="language-select" aria-label="Sélectionner la langue">
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;