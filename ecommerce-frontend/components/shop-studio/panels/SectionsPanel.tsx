// components/shop-studio/panels/SectionsPanel.tsx
'use client';

import { FiMaximize2, FiGrid, FiFileText, FiMonitor, FiImage } from 'react-icons/fi';

interface Props {
  onAddSection: (type: string, props: any) => void;
}

const SECTIONS = [
  { 
    type: 'banner', 
    label: 'Bannière classique', 
    icon: FiMaximize2, 
    description: 'Bannière standard avec titre, sous-titre et bouton',
    defaultProps: { 
      title: 'Nouvelle bannière', 
      subtitle: 'Sous-titre de votre bannière', 
      buttonText: 'Découvrir',
      height: 300,
      textPosition: 'center'
    } 
  },
  { 
    type: 'screen-banner', 
    label: 'Bannière Écran', 
    icon: FiMonitor, 
    description: 'Style écran avec bordures épaisses, design moderne',
    defaultProps: { 
      title: 'Style Écran',
      subtitle: 'Bordures épaisses, design moderne',
      buttonText: 'Découvrir',
      height: 400,
      borderWidth: 4,
      borderColor: '#ffffff',
      borderRadius: 16,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      textStrokeWidth: 1,
      textStrokeColor: '#000000',
      glassEffect: false,
      backgroundColor: '#1e1e2f'
    } 
  },
  { 
    type: 'carousel-banner', 
    label: 'Carrousel', 
    icon: FiImage, 
    description: 'Bannière avec images qui défilent',
    defaultProps: { 
      title: 'Notre galerie',
      subtitle: 'Découvrez nos créations',
      buttonText: 'En savoir plus',
      height: 500,
      images: [
        { url: 'https://picsum.photos/id/1015/1200/500', alt: 'Image 1' },
        { url: 'https://picsum.photos/id/1018/1200/500', alt: 'Image 2' },
        { url: 'https://picsum.photos/id/104/1200/500', alt: 'Image 3' }
      ],
      autoPlay: true,
      intervalTime: 5000,
      showArrows: true,
      showDots: true,
      transitionEffect: 'fade',
      overlayOpacity: 30
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