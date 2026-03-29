'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { FiX, FiShoppingCart, FiUser, FiHome, FiGrid, FiShoppingBag, FiLogOut, FiPackage, FiSettings, FiPlusCircle } from 'react-icons/fi';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  onLogout: () => void;
  itemCount: number;
}

const MobileMenu = ({ isOpen, onClose, user, onLogout, itemCount }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-secondary shadow-xl transform transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-white font-semibold">Menu</span>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="flex items-center space-x-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={onClose}
              >
                <FiHome size={20} />
                <span>Accueil</span>
              </Link>
            </li>

            <li>
              <Link
                href="/shops"
                className="flex items-center space-x-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={onClose}
              >
                <FiGrid size={20} />
                <span>Boutiques</span>
              </Link>
            </li>

            <li>
              <Link
                href="/categories"
                className="flex items-center space-x-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={onClose}
              >
                <FiGrid size={20} />
                <span>Catégories</span>
              </Link>
            </li>

            <li>
              <Link
                href="/cart"
                className="flex items-center space-x-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={onClose}
              >
                <div className="relative">
                  <FiShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span>Panier</span>
              </Link>
            </li>

            {user ? (
              <>
                <li className="pt-4 border-t border-white/10">
                  <div className="p-3 text-white/70 text-sm">
                    Connecté en tant que
                    <span className="block text-white font-semibold">{user.username}</span>
                  </div>
                </li>

                <li>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    <FiUser size={20} />
                    <span>Mon profil</span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="/orders"
                    className="flex items-center space-x-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    <FiPackage size={20} />
                    <span>Mes commandes</span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="/shop/my-shops"
                    className="flex items-center space-x-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    <FiSettings size={20} />
                    <span>Mes boutiques</span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="/shop/create"
                    className="flex items-center space-x-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    <FiPlusCircle size={20} />
                    <span>Créer une boutique</span>
                  </Link>
                </li>

                <li className="pt-4">
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FiLogOut size={20} />
                    <span>Déconnexion</span>
                  </button>
                </li>
              </>
            ) : (
              <li className="pt-4 border-t border-white/10">
                <Link
                  href="/auth/login"
                  className="block p-3 text-center bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors mb-2"
                  onClick={onClose}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="block p-3 text-center border border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
                  onClick={onClose}
                >
                  Inscription
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;