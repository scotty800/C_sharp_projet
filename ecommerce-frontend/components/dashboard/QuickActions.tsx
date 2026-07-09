'use client';

import Link from 'next/link';
import { 
  FiSettings, 
  FiDownload,
  FiUpload,
  FiPercent
} from 'react-icons/fi';

interface QuickActionsProps {
  shopId?: number;
}

const QuickActions = ({ shopId }: QuickActionsProps) => {
  // ⭐ MODIFICATION — "Ajouter un produit" et "Gérer le stock" retirés
  const actions = [
    {
      icon: FiPercent,
      label: 'Promotions',
      href: `/dashboard/seller/promotions${shopId ? `?shopId=${shopId}` : ''}`,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: FiDownload,
      label: 'Exporter les ventes',
      href: '#',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('Export'),
    },
    {
      icon: FiUpload,
      label: 'Importer produits',
      href: '#',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => console.log('Import'),
    },
    {
      icon: FiSettings,
      label: 'Paramètres',
      href: `/dashboard/seller/settings${shopId ? `?shopId=${shopId}` : ''}`,
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link
            key={index}
            href={action.href}
            onClick={action.onClick}
            className={`${action.color} text-white rounded-lg p-4 text-center transition-all duration-200 group hover:scale-105`}
          >
            <Icon className="mx-auto mb-2 text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;