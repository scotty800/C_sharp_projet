import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import './MobileNav.css';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const navItems = [
    { path: '/', icon: '🏠', label: 'Accueil' },
    { path: '/shops', icon: '🏪', label: 'Boutiques' },
    { path: '/products', icon: '📦', label: 'Produits' },
    { path: '/categories', icon: '📑', label: 'Catégories' },
    { path: '/cart', icon: '🛒', label: 'Panier', badge: cartCount }
  ];

  const userItems = user ? [
    { path: '/profile', icon: '👤', label: 'Profil' },
    { path: '/orders', icon: '📦', label: 'Commandes' },
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/shops/my-shops', icon: '🏪', label: 'Mes boutiques' }
  ] : [];

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="mobile-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
            {item.badge > 0 && (
              <span className="mobile-nav-badge">{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Menu Button */}
      <button 
        className={`mobile-menu-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Side Menu */}
      <div className={`mobile-menu-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)} />
      <div className={`mobile-menu-panel ${isOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          {user ? (
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <strong>{user.username}</strong>
                <small>{user.email}</small>
              </div>
            </div>
          ) : (
            <div className="mobile-auth">
              <Link to="/login" className="mobile-login" onClick={() => setIsOpen(false)}>
                Connexion
              </Link>
              <Link to="/register" className="mobile-register" onClick={() => setIsOpen(false)}>
                Inscription
              </Link>
            </div>
          )}
        </div>

        <div className="mobile-menu-items">
          {userItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="mobile-menu-item"
              onClick={() => setIsOpen(false)}
            >
              <span className="mobile-menu-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {user && (
          <button className="mobile-logout" onClick={() => { logout(); setIsOpen(false); }}>
            <span>🚪</span>
            Déconnexion
          </button>
        )}
      </div>
    </>
  );
};

export default MobileNav;