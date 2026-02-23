'use client';

import { useState } from 'react';
import { Shop } from '@/types/shop';
import { FiAward, FiClock, FiShield, FiTruck } from 'react-icons/fi';
import { formatDate } from '@/services/utils/formatters';

interface ShopInfoProps {
  shop: Shop;
}

const ShopInfo = ({ shop }: ShopInfoProps) => {
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'policy'>('about');

  const tabs = [
    { id: 'about', label: 'À propos' },
    { id: 'reviews', label: 'Avis' },
    { id: 'policy', label: 'Politique boutique' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Onglets */}
      <div className="border-b">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {shop.description || 'Aucune description disponible.'}
              </p>
            </div>

            {/* Informations boutique */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Détails</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <FiClock className="text-primary" />
                  <div>
                    <span className="text-sm text-gray-500">Membre depuis</span>
                    <p className="font-medium">{formatDate(shop.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FiAward className="text-primary" />
                  <div>
                    <span className="text-sm text-gray-500">Vendeur certifié</span>
                    <p className="font-medium">✓ Vérifié</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center py-8 text-gray-500">
            <p>Les avis clients arrivent bientôt...</p>
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="space-y-6">
            {/* Politiques de la boutique */}
            <div className="flex items-start gap-4">
              <FiTruck className="text-primary text-xl mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Livraison</h4>
                <p className="text-gray-600">
                  Livraison sous 2-5 jours ouvrés. Retours acceptés sous 14 jours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiShield className="text-primary text-xl mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Garantie</h4>
                <p className="text-gray-600">
                  Tous les produits sont garantis 2 ans contre les défauts de fabrication.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiAward className="text-primary text-xl mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Paiement sécurisé</h4>
                <p className="text-gray-600">
                  Paiement 100% sécurisé via notre plateforme.
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