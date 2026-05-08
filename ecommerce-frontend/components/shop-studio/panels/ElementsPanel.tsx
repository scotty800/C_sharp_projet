'use client';

import { useState } from 'react';
import { 
  FiType, FiImage, FiGrid, FiMaximize2, 
  FiSquare, FiHeart, FiFileText, FiMousePointer,
  FiBox, FiCircle, FiTriangle, FiStar, FiPlus,
  FiShoppingBag, FiTag, FiLayout, FiUpload
} from 'react-icons/fi';

interface ElementItem {
  type: string;
  label: string;
  icon: any;
  defaultProps: any;
  isUpload?: boolean;
}

interface ElementCategory {
  label: string;
  icon: any;
  items: ElementItem[];
}

interface Props {
  onAddBlock: (type: string, props: any) => void;
}

// ⭐ 3 CATÉGORIES CLAIRES
const ELEMENTS: Record<string, ElementCategory> = {
  // Catégorie 1: SECTIONS (layout principal)
  sections: {
    label: '📐 Sections',
    icon: FiLayout,
    items: [
      { type: 'banner', label: 'Bannière', icon: FiMaximize2, defaultProps: { title: 'Bannière', subtitle: 'Sous-titre', buttonText: 'Découvrir', height: 300 } },
      { type: 'products', label: 'Grille produits', icon: FiShoppingBag, defaultProps: { title: 'Nos produits', columns: 4, limit: 8 } },
      { type: 'section', label: 'Section personnalisée', icon: FiFileText, defaultProps: { title: 'Ma section', content: 'Contenu de ma section...' } },
    ]
  },
  
  // Catégorie 2: ASSETS (formes, images, logos)
  assets: {
    label: '🎨 Assets',
    icon: FiBox,
    items: [
      { type: 'shape', label: 'Carré', icon: FiSquare, defaultProps: { shape: 'square', width: 100, height: 100, backgroundColor: '#2563EB' } },
      { type: 'shape', label: 'Cercle', icon: FiCircle, defaultProps: { shape: 'circle', width: 100, height: 100, backgroundColor: '#EC4899' } },
      { type: 'shape', label: 'Triangle', icon: FiTriangle, defaultProps: { shape: 'triangle', width: 100, height: 100, backgroundColor: '#F59E0B' } },
      { type: 'image', label: 'Image', icon: FiImage, defaultProps: { url: 'https://picsum.photos/300/200', alt: 'Image', width: 200, height: 150 } },
      { type: 'logo', label: 'Logo', icon: FiHeart, defaultProps: { size: 80, shape: 'rounded' }, isUpload: true },
    ]
  },
  
  // Catégorie 3: TYPOS (textes, titres, boutons)
  typos: {
    label: '✏️ Typos',
    icon: FiType,
    items: [
      { type: 'title', label: 'Titre', icon: FiType, defaultProps: { title: 'Nouveau titre', level: 'h2' } },
      { type: 'text', label: 'Texte', icon: FiFileText, defaultProps: { content: 'Saisissez votre texte ici...', fontSize: 16 } },
      { type: 'button', label: 'Bouton', icon: FiMousePointer, defaultProps: { text: 'Cliquez ici', backgroundColor: '#2563EB', textColor: '#FFFFFF' } },
    ]
  },
};

export default function ElementsPanel({ onAddBlock }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('sections');
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [pendingLogoItem, setPendingLogoItem] = useState<ElementItem | null>(null);

  const categories = Object.keys(ELEMENTS);

  const addElement = (item: ElementItem) => {
    // Position par défaut au centre visible
    const defaultPosition = { 
      x: 200, 
      y: 150, 
      width: item.defaultProps.width || 300, 
      height: item.defaultProps.height || (item.type === 'text' ? 100 : 200), 
      zIndex: Date.now(),
      rotation: 0,
    };
    
    onAddBlock(item.type, {
      ...item.defaultProps,
      position: defaultPosition,
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, item: ElementItem) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    
    try {
      const imageUrl = URL.createObjectURL(file);
      
      const defaultPosition = { 
        x: 200, 
        y: 150, 
        width: 80, 
        height: 80, 
        zIndex: Date.now(),
        rotation: 0,
      };
      
      onAddBlock(item.type, {
        ...item.defaultProps,
        imageUrl: imageUrl,
        url: imageUrl,
        position: defaultPosition,
      });
      
      setShowLogoUpload(false);
      setPendingLogoItem(null);
    } catch (error) {
      console.error('Erreur lors de l\'upload du logo:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleItemClick = (item: ElementItem) => {
    if (item.isUpload) {
      setPendingLogoItem(item);
      setShowLogoUpload(true);
    } else {
      addElement(item);
    }
  };

  return (
    <div className="space-y-4">
      {/* Catégories */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {categories.map(cat => {
          const Icon = ELEMENTS[cat].icon;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <Icon size={14} />
              {ELEMENTS[cat].label}
            </button>
          );
        })}
      </div>

      {/* Éléments de la catégorie */}
      <div className="grid grid-cols-2 gap-2 max-h-[calc(100vh-300px)] overflow-y-auto">
        {ELEMENTS[activeCategory].items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center gap-2 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all hover:scale-105 ${
                item.isUpload ? 'border-2 border-dashed border-primary/50' : ''
              }`}
            >
              {item.isUpload ? <FiUpload size={28} className="text-primary" /> : <Icon size={28} className="text-primary" />}
              <span className="text-white text-sm font-medium">{item.label}</span>
              {item.isUpload && (
                <span className="text-[10px] text-gray-500">(upload)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal d'upload de logo */}
      {showLogoUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-white font-semibold mb-4">Télécharger votre logo</h3>
            <p className="text-gray-400 text-sm mb-4">
              Sélectionnez une image pour votre logo (format PNG, JPG, SVG recommandé)
            </p>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <FiUpload size={40} className="mx-auto text-gray-500 mb-3" />
              <label className="cursor-pointer">
                <span className="bg-primary text-white px-4 py-2 rounded-lg inline-block hover:bg-primary/80 transition-colors">
                  {uploadingLogo ? 'Upload en cours...' : 'Choisir un fichier'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => pendingLogoItem && handleLogoUpload(e, pendingLogoItem)}
                  disabled={uploadingLogo}
                />
              </label>
              <p className="text-gray-500 text-xs mt-3">
                PNG, JPG ou SVG. Max 2MB.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowLogoUpload(false);
                  setPendingLogoItem(null);
                }}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (pendingLogoItem) {
                    addElement(pendingLogoItem);
                    setShowLogoUpload(false);
                    setPendingLogoItem(null);
                  }
                }}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Utiliser le logo par défaut
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-700">
        Cliquez sur un élément pour l'ajouter au canvas
      </div>
    </div>
  );
}