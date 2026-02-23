'use client';

import { Shop } from '@/types/shop';
import { FiStar, FiUsers, FiShoppingBag, FiCalendar } from 'react-icons/fi';
import { formatDate, formatNumber } from '@/services/utils/formatters';

interface ShopSidebarProps {
  shop: Shop;
}

const ShopSidebar = ({ shop }: ShopSidebarProps) => {
  const stats = [
    {
      icon: FiShoppingBag,
      label: 'Produits',
      value: formatNumber(shop.productCount),
    },
    {
      icon: FiUsers,
      label: 'Vendeur',
      value: shop.owner?.username || 'Anonyme',
    },
    {
      icon: FiCalendar,
      label: 'Membre depuis',
      value: formatDate(shop.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">À propos</h3>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <stat.icon className="text-primary text-xl" />
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="font-medium">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note moyenne */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Note moyenne</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} fill={i < 4 ? 'currentColor' : 'none'} />
            ))}
          </div>
          <span className="font-semibold">4.8</span>
          <span className="text-gray-500">(128 avis)</span>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-8">{rating} étoiles</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400"
                  style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 5}%` }}
                />
              </div>
              <span className="w-8 text-gray-500">
                {rating === 5 ? '70%' : rating === 4 ? '20%' : '5%'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bouton contact */}
      <button className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors">
        Contacter le vendeur
      </button>
    </div>
  );
};

export default ShopSidebar;