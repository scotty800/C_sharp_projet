import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import Button from "../common/Button";
import './Header.css';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSeach = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/seach?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <span className="logo-text">MarketPlace</span> 
                </Link>

                {/* Desktop Navigation */}
                <nav className="header-nav desktop-nav">
                    <Link to="/shops" className="nav-link">Boutiques</Link>
                    <Link to="/products" className="nav-link">Produits</Link>
                    <Link to="/categories" className="nav-link">Catégories</Link>
                    <Link to="/deals" className="nav-link">Promotions</Link>
                </nav>

                {/* Search Bar */}
                <form onSubmit={handleSeach} className="header-search">
                    <input
                        type="text"
                        placeholder="Rechercher un produit, une boutique..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        🔍
                    </button>
                </form>

                {/* Right Section */}
                <div className="header-right">
                    {/* Cart Icon */}
                    <Link to="/cart" className="cart-icon">
                        🛒
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>

                    {/* User Menu */}
                    {user ? (
                        <div className="user-menu">
                            <button
                            className="user-menu-button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <div className="user-avatar">
                                    {user.username?.[0]?.toUpperCase()}
                                </div>
                                <span className="user-name">{user.username}</span>
                            </button>

                            {isMobileMenuOpen && (
                                <div className="user-dropdown">
                                    <Link to="/profile" className="dropdown-item">
                                        <span>👤</span> Mon profile
                                    </Link>
                                    <Link to="/dashboard" className="dropdown-item">
                                        <span>📊</span> Dashboard
                                    </Link>
                                    <Link to="/orders" className="dropdown-item">
                                        <span>📦</span> Mes commandes
                                    </Link>
                                    <Link to="/shops/my-shops" className="dropdown-item">
                                        <span>🏪</span> Mes boutiques
                                    </Link>
                                    <hr className="dropdown-item"/>
                                    <button onClick={logout} className="dropdown-item logout">
                                        <span>🚪</span> Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                                Connexion
                            </Button>
                            <Button size="sm" onClick={() => navigate('/register')}>
                                Inscription
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="hamburger"></span>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <Link to="/shops" className="mobile-link">Boutiques</Link>
                    <Link to="/products" className="mobile-link">Produits</Link>
                    <Link to="/categories" className="mobile-link">Catégories</Link>
                    <Link to="/deals" className="mobile-link">Promotions</Link>

                    {user && (
                        <>
                        <hr className="mobile-divider" />
                        <Link to="/profile" className="mobile-link">Mon profil</Link>
                        <Link to="/dashboard" className="mobile-link">Dashboard</Link>
                        <Link to="/orders" className="mobile-link">Mes commandes</Link>
                        <Link to="/shops/my-shops" className="mobile-link">Mes boutiques</Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;