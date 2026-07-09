'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiPackage, 
  FiUsers, 
  FiSettings, 
  FiBarChart2,
  FiCreditCard,
  FiStar,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw
} from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  shopId?: number;
}

const Sidebar = ({ shopId }: SidebarProps) => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // ⭐ MODIFICATION — Ligne "Produits" retirée
  const menuItems = [
    { icon: FiHome, label: 'Aperçu', href: `/dashboard/seller${shopId ? `?shopId=${shopId}` : ''}` },
    { icon: FiPackage, label: 'Commandes', href: `/dashboard/seller/orders${shopId ? `?shopId=${shopId}` : ''}` },
    { icon: FiRefreshCw, label: 'Demandes de retour', href: `/dashboard/seller/returns${shopId ? `?shopId=${shopId}` : ''}` },
    { icon: FiUsers, label: 'Clients', href: `/dashboard/seller/customers${shopId ? `?shopId=${shopId}` : ''}` },
    { icon: FiBarChart2, label: 'Statistiques', href: `/dashboard/seller/stats${shopId ? `?shopId=${shopId}` : ''}` },
    { icon: FiCreditCard, label: 'Paiements', href: `/dashboard/seller/payments${shopId ? `?shopId=${shopId}` : ''}` },
    { icon: FiStar, label: 'Avis', href: `/dashboard/seller/reviews${shopId ? `?shopId=${shopId}` : ''}` },
    { icon: FiSettings, label: 'Paramètres', href: `/dashboard/seller/settings${shopId ? `?shopId=${shopId}` : ''}` },
  ];

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return pathname === href.split('?')[0];
    }
    return pathname === href;
  };

  return (
    <aside className={`bg-secondary text-white h-screen sticky top-0 transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo */}
      <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'px-6'} border-b border-white/10`}>
        {!collapsed && <span className="text-xl font-bold text-primary">Vendeur</span>}
        {collapsed && <span className="text-2xl font-bold text-primary">V</span>}
      </div>

      {/* Bouton collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-primary text-white p-1.5 rounded-full hover:bg-primary-dark transition-colors"
      >
        {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
      </button>

      {/* Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-colors ${
                    active 
                      ? 'bg-primary text-white' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <button
          onClick={logout}
          className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} w-full p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors`}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <FiLogOut size={20} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;