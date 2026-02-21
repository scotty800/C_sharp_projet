'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiChevronDown } from 'react-icons/fi';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Accueil',
    href: '/',
  },
  {
    label: 'Boutiques',
    href: '/shops',
    children: [
      { label: 'Toutes les boutiques', href: '/shops' },
      { label: 'Nouvelles boutiques', href: '/shops/new' },
      { label: 'Top boutiques', href: '/shops/top' },
      { label: 'Ouvrir une boutique', href: '/shop/create' },
    ],
  },
  {
    label: 'Catégories',
    href: '/categories',
    children: [
      { label: 'Mode', href: '/categories/mode' },
      { label: 'Électronique', href: '/categories/electronique' },
      { label: 'Maison', href: '/categories/maison' },
      { label: 'Sport', href: '/categories/sport' },
      { label: 'Beauté', href: '/categories/beaute' },
      { label: 'Jeux', href: '/categories/jeux' },
    ],
  },
  {
    label: 'Promotions',
    href: '/deals',
  },
  {
    label: 'Vendre',
    href: '/sell',
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <ul className="flex items-center space-x-1">
          {navItems.map((item) => (
            <li
              key={item.href}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {item.children ? (
                <>
                  <button
                    className={`flex items-center space-x-1 px-4 py-3 text-sm font-medium transition-colors ${
                      pathname.startsWith(item.href)
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    <span>{item.label}</span>
                    <FiChevronDown
                      className={`transition-transform duration-200 ${
                        activeDropdown === item.label ? 'rotate-180' : ''
                      }`}
                      size={16}
                    />
                  </button>

                  {/* Dropdown menu */}
                  <div
                    className={`absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 transition-all duration-200 ${
                      activeDropdown === item.label
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-2'
                    }`}
                  >
                    <div className="py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            pathname === child.href
                              ? 'bg-primary/10 text-primary'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`inline-block px-4 py-3 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}

          {/* Barre de recherche rapide */}
          <li className="ml-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-64 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;