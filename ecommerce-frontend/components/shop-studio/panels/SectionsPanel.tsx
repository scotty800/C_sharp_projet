// components/shop-studio/panels/SectionsPanel.tsx
'use client';

import { FiMaximize2, FiGrid, FiFileText } from 'react-icons/fi';

interface Props {
  onAddSection: (type: string, props: any) => void;
}

const SECTIONS = [
  { 
    type: 'banner', 
    label: 'Bannière', 
    icon: FiMaximize2, 
    description: 'Bannière avec titre, sous-titre et bouton',
    defaultProps: { 
      title: 'Nouvelle bannière', 
      subtitle: 'Sous-titre de votre bannière', 
      buttonText: 'Découvrir',
      height: 300,
      textPosition: 'center'
    } 
  },
  { 
    type: 'products', 
    label: 'Grille produits', 
    icon: FiGrid, 
    description: 'Affiche vos produits en grille',
    defaultProps: { 
      title: 'Nos produits', 
      columns: 4, 
      limit: 8 
    } 
  },
];

export default function SectionsPanel({ onAddSection }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-white font-semibold mb-3">Ajouter une section</h3>
      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.type}
              onClick={() => {
                console.log('🖱️ Ajout section:', section.type);
                onAddSection(section.type, section.defaultProps);
              }}
              className="w-full flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all hover:scale-[1.02] text-left"
            >
              <div className="p-2 bg-primary/20 rounded-lg">
                <Icon size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{section.label}</div>
                <div className="text-gray-400 text-xs">{section.description}</div>
              </div>
              <div className="text-gray-500 text-xl">+</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}