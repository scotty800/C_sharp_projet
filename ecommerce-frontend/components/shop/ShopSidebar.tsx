'use client';

import { Shop } from '@/types/shop';
import { FiStar, FiUsers, FiShoppingBag, FiCalendar } from 'react-icons/fi';
import { formatDate, formatNumber } from '@/services/utils/formatters';

interface ShopSidebarProps {
  shop: Shop;
  themeColor?: string;
}

const ShopSidebar = ({ shop, themeColor = '#e50914' }: ShopSidebarProps) => {
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
      <div 
        className="rounded-lg shadow-md p-6 dark:shadow-gray-900/30"
        style={{ backgroundColor: shop.backgroundColor || '#ffffff' }}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white" style={{ color: shop.textColor }}>À propos</h3>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <stat.icon style={{ color: themeColor }} />
              <div>
                <p className="text-sm opacity-75 text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="font-medium text-gray-900 dark:text-white" style={{ color: shop.textColor }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note moyenne */}
      <div 
        className="rounded-lg shadow-md p-6 dark:shadow-gray-900/30"
        style={{ backgroundColor: shop.backgroundColor || '#ffffff' }}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white" style={{ color: shop.textColor }}>Note moyenne</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex" style={{ color: themeColor }}>
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} fill={i < 4 ? 'currentColor' : 'none'} />
            ))}
          </div>
          <span className="font-semibold text-gray-900 dark:text-white" style={{ color: shop.textColor }}>4.8</span>
          <span className="opacity-75 text-gray-500 dark:text-gray-400">(128 avis)</span>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-8 opacity-75 text-gray-600 dark:text-gray-400">{rating} étoiles</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${themeColor}20` }}>
                <div 
                  className="h-full"
                  style={{ 
                    backgroundColor: themeColor,
                    width: `${rating === 5 ? 70 : rating === 4 ? 20 : 5}%` 
                  }}
                />
              </div>
              <span className="w-8 opacity-75 text-gray-500 dark:text-gray-400">
                {rating === 5 ? '70%' : rating === 4 ? '20%' : '5%'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bouton contact */}
      <button 
        className="w-full font-semibold py-3 px-4 rounded-lg transition-colors text-white"
        style={{ backgroundColor: themeColor }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${themeColor}CC`}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeColor}
      >
        Contacter le vendeur
      </button>
    </div>
  );
};

export default ShopSidebar;