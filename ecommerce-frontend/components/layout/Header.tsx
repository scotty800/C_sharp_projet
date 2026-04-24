// components/layout/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { FiShoppingCart, FiUser, FiMenu, FiSearch, FiPlusCircle, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import MobileMenu from './MobileMenu';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Header - Une seule ligne */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo + NOVAERA avec SOCIETY centré en dessous */}
            <div className="flex flex-col items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-white tracking-wide">NOVAERA</span>
              </Link>
              <span className="text-[10px] text-white/70 font-medium tracking-[0.2em] mt-0.5">
                S O C I E T Y
              </span>
            </div>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for brands, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#B82BFF] transition-colors text-sm"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#B82BFF]">
                  <FiSearch size={18} />
                </button>
              </div>
            </form>

            {/* Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-300 hover:text-[#B82BFF] transition-colors text-sm">
                Home
              </Link>
              
              <Link href="/shops" className="text-gray-300 hover:text-[#B82BFF] transition-colors text-sm">
                Boutiques
              </Link>

              <Link href="/categories" className="text-gray-300 hover:text-[#B82BFF] transition-colors text-sm">
                Categories
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative text-gray-300 hover:text-[#B82BFF] transition-colors">
                <FiShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#B82BFF] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-[#B82BFF] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#B82BFF]/20 flex items-center justify-center">
                      <FiUser size={14} />
                    </div>
                    <span className="text-sm">{user.username}</span>
                  </button>

                  <div className={`absolute right-0 mt-2 w-56 bg-gray-900 rounded-lg shadow-xl transition-all duration-200 z-50 overflow-hidden border border-gray-800 ${
                    isUserMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}>
                    <div className="py-2">
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        <FiUser size={14} /> Mon profil
                      </Link>
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        <FiPackage size={14} /> Mes commandes
                      </Link>
                      <Link href="/shop/my-shops" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        <FiSettings size={14} /> Mes boutiques
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        <FiSettings size={14} /> Paramètres
                      </Link>
                      <Link href="/shop/create" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-t border-gray-800 mt-1">
                        <FiPlusCircle size={14} /> Créer une boutique
                      </Link>
                      <hr className="my-2 border-gray-800" />
                      <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors">
                        <FiLogOut size={14} /> Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login" className="text-gray-300 hover:text-[#B82BFF] transition-colors text-sm">
                    Connexion
                  </Link>
                  <Link href="/auth/register" className="bg-[#B82BFF] hover:bg-[#9A00DD] text-white px-3 py-1.5 rounded-lg transition-colors text-sm">
                    Inscription
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-300 hover:text-[#B82BFF] transition-colors">
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogout={logout}
        itemCount={itemCount}
      />
    </>
  );
};

export default Header;