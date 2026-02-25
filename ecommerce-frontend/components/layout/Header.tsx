'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { FiShoppingCart, FiUser, FiMenu, FiSearch, FiPlusCircle } from 'react-icons/fi';
import MobileMenu from './MobileMenu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/95 backdrop-blur-md py-2'
            : 'bg-gradient-to-b from-black/80 to-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">MarketPlace</span>
            </Link>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center flex-1 max-w-xl mx-8"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Rechercher une boutique, un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-primary"
                >
                  <FiSearch size={20} />
                </button>
              </div>
            </form>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/shops"
                className="text-white hover:text-primary transition-colors"
              >
                Boutiques
              </Link>
              
              <Link
                href="/categories"
                className="text-white hover:text-primary transition-colors"
              >
                Catégories
              </Link>

              {/* Bouton Créer une boutique - visible si connecté */}
              {user && (
  <>
    <Link
      href="/shop/create"
      className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
    >
      Créer une boutique
    </Link>
    <Link
      href="/shop/my-shops"
      className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
    >
      Mes boutiques
    </Link>
  </>
)}
              {/* Cart */}
              <Link
                href="/cart"
                className="relative text-white hover:text-primary transition-colors"
              >
                <FiShoppingCart size={24} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <FiUser size={18} />
                    </div>
                    <span className="text-sm">{user.username}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-secondary rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                      >
                        Mon profil
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                      >
                        Mes commandes
                      </Link>
                      <Link
                        href="/shop/my-shops"
                        className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                      >
                        Mes boutiques
                      </Link>
                      <hr className="my-2 border-white/10" />
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/login"
                    className="text-white hover:text-primary transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-white hover:text-primary transition-colors"
            >
              <FiMenu size={28} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogout={logout}
        itemCount={itemCount}
      />

      <div className="h-16" />
    </>
  );
};

export default Header;