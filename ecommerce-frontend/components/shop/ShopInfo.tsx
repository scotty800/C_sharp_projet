'use client';

import { useState } from 'react';
import { Shop } from '@/types/shop';
import { FiAward, FiClock, FiShield, FiTruck } from 'react-icons/fi';
import { formatDate } from '@/services/utils/formatters';

interface ShopInfoProps {
  shop: Shop;
  themeColor?: string;
}

const ShopInfo = ({ shop, themeColor = '#e50914' }: ShopInfoProps) => {
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'policy'>('about');

  const tabs = [
    { id: 'about', label: 'À propos' },
    { id: 'reviews', label: 'Avis' },
    { id: 'policy', label: 'Politique boutique' },
  ];

  return (
    <div 
      className="rounded-lg shadow-md overflow-hidden dark:shadow-gray-900/30"
      style={{ backgroundColor: shop.backgroundColor || '#ffffff' }}
    >
      {/* Onglets */}
      <div className="border-b" style={{ borderColor: `${themeColor}20` }}>
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex-1 px-6 py-4 text-sm font-medium transition-colors"
              style={{ 
                color: activeTab === tab.id ? themeColor : shop.textColor,
                borderBottom: activeTab === tab.id ? `2px solid ${themeColor}` : 'none',
                opacity: activeTab === tab.id ? 1 : 0.7
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6" style={{ color: shop.textColor }}>
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Description</h3>
              <p className="leading-relaxed opacity-80 text-gray-600 dark:text-gray-300">
                {shop.description || 'Aucune description disponible.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Détails</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FiClock style={{ color: themeColor }} />
                  <div>
                    <span className="text-sm opacity-75 text-gray-500 dark:text-gray-400">Membre depuis</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(shop.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiAward style={{ color: themeColor }} />
                  <div>
                    <span className="text-sm opacity-75 text-gray-500 dark:text-gray-400">Vendeur certifié</span>
                    <p className="font-medium text-gray-900 dark:text-white">✓ Vérifié</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center py-8 opacity-75 text-gray-500 dark:text-gray-400">
            <p>Les avis clients arrivent bientôt...</p>
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <FiTruck style={{ color: themeColor }} className="text-xl mt-1" />
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Livraison</h4>
                <p className="opacity-80 text-gray-600 dark:text-gray-300">
                  Livraison sous 2-5 jours ouvrés. Retours acceptés sous 14 jours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiShield style={{ color: themeColor }} className="text-xl mt-1" />
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Garantie</h4>
                <p className="opacity-80 text-gray-600 dark:text-gray-300">
                  Tous les produits sont garantis 2 ans contre les défauts de fabrication.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopInfo;