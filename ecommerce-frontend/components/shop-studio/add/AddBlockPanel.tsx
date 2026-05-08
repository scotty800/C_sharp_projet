'use client';

import { 
  FiType, FiImage, FiGrid, FiMaximize2, 
  FiSquare, FiHeart, FiFileText, FiMousePointer,
  FiBox, FiCircle, FiTriangle, FiStar, FiPlus,
  FiShoppingBag, FiTag, FiVideo, FiMapPin, FiX
} from 'react-icons/fi';

interface Props {
  onClose: () => void;
  onAddBlock: (type: any, props: any) => void;
}

const BLOCKS = [
  // 📝 Textes
  { 
    type: 'title', 
    label: 'Titre H1', 
    icon: FiType, 
    defaultProps: { 
      title: 'Nouveau titre H1', 
      level: 'h1',
      fontSize: 48,
      textColor: '#000000'
    } 
  },
  { 
    type: 'title', 
    label: 'Titre H2', 
    icon: FiType, 
    defaultProps: { 
      title: 'Nouveau titre H2', 
      level: 'h2',
      fontSize: 36,
      textColor: '#000000'
    } 
  },
  { 
    type: 'title', 
    label: 'Titre H3', 
    icon: FiType, 
    defaultProps: { 
      title: 'Nouveau titre H3', 
      level: 'h3',
      fontSize: 28,
      textColor: '#000000'
    } 
  },
  { 
    type: 'text', 
    label: 'Paragraphe', 
    icon: FiFileText, 
    defaultProps: { 
      content: 'Saisissez votre texte ici...', 
      fontSize: 16,
      textColor: '#000000',
      fontFamily: 'Inter',
      textAlign: 'left'
    } 
  },
  
  // 🖼️ Images
  { 
    type: 'image', 
    label: 'Image simple', 
    icon: FiImage, 
    defaultProps: { 
      url: 'https://picsum.photos/300/200', 
      alt: 'Image',
      width: 300,
      height: 200,
      borderRadius: 8
    } 
  },
  { 
    type: 'image', 
    label: 'Logo', 
    icon: FiHeart, 
    defaultProps: { 
      url: 'https://picsum.photos/id/1/200/200', 
      alt: 'Logo',
      width: 80,
      height: 80,
      shape: 'rounded'
    } 
  },
  
  // 🔘 Boutons
  { 
    type: 'button', 
    label: 'Bouton', 
    icon: FiMousePointer, 
    defaultProps: { 
      text: 'Cliquez ici', 
      backgroundColor: '#2563EB', 
      textColor: '#FFFFFF',
      borderRadius: 8,
      fontSize: 16,
      paddingX: 20,
      paddingY: 10
    } 
  },
  
  // 📦 Produits
  { 
    type: 'products', 
    label: 'Grille produits', 
    icon: FiGrid, 
    defaultProps: { 
      title: 'Nos produits', 
      columns: 4, 
      limit: 8,
      showFilters: true,
      showPagination: true
    } 
  },
  { 
    type: 'products', 
    label: 'Produits vedettes', 
    icon: FiStar, 
    defaultProps: { 
      title: 'Produits vedettes', 
      columns: 3, 
      limit: 3,
      showFilters: false
    } 
  },
  
  // 📐 Sections
  { 
    type: 'banner', 
    label: 'Bannière', 
    icon: FiMaximize2, 
    defaultProps: { 
      title: 'Nouvelle bannière', 
      subtitle: 'Sous-titre', 
      buttonText: 'Découvrir',
      height: 400,
      overlayOpacity: 30,
      textPosition: 'center',
      backgroundColor: '#f3f4f6'
    } 
  },
  { 
    type: 'section', 
    label: 'Section', 
    icon: FiFileText, 
    defaultProps: { 
      title: 'Nouvelle section', 
      content: 'Contenu de la section',
      backgroundColor: '#f9fafb'
    } 
  },
  { 
    type: 'spacer', 
    label: 'Espaceur', 
    icon: FiMaximize2, 
    defaultProps: { 
      height: 50 
    } 
  },
  
  // 🎨 Formes
  { 
    type: 'shape', 
    label: 'Carré', 
    icon: FiSquare, 
    defaultProps: { 
      shape: 'square',
      width: 100,
      height: 100,
      backgroundColor: '#2563EB',
      borderRadius: 0,
      rotation: 0,
      opacity: 100
    } 
  },
  { 
    type: 'shape', 
    label: 'Rond', 
    icon: FiCircle, 
    defaultProps: { 
      shape: 'circle',
      width: 100,
      height: 100,
      backgroundColor: '#EC4899',
      borderRadius: 50,
      rotation: 0,
      opacity: 100
    } 
  },
  { 
    type: 'shape', 
    label: 'Rectangle arrondi', 
    icon: FiSquare, 
    defaultProps: { 
      shape: 'rounded',
      width: 150,
      height: 80,
      backgroundColor: '#10B981',
      borderRadius: 12,
      rotation: 0,
      opacity: 100
    } 
  },
  { 
    type: 'shape', 
    label: 'Triangle', 
    icon: FiTriangle, 
    defaultProps: { 
      shape: 'triangle',
      width: 100,
      height: 100,
      backgroundColor: '#F59E0B',
      rotation: 0,
      opacity: 100
    } 
  },
  { 
    type: 'shape', 
    label: 'Étoile', 
    icon: FiStar, 
    defaultProps: { 
      shape: 'star',
      width: 80,
      height: 80,
      backgroundColor: '#F59E0B',
      rotation: 0,
      opacity: 100
    } 
  },
];

export default function AddBlockPanel({ onClose, onAddBlock }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-xl font-semibold">Ajouter un élément</h3>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white px-3 py-1 bg-gray-700 rounded-lg text-sm transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {BLOCKS.map((block) => (
            <button
              key={`${block.type}-${block.label}`}
              onClick={() => onAddBlock(block.type, block.defaultProps)}
              className="flex flex-col items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all hover:scale-105"
            >
              <block.icon size={28} className="text-primary" />
              <span className="text-white text-xs">{block.label}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-xs">
            + de 20 éléments disponibles • Cliquez pour ajouter
          </p>
        </div>
      </div>
    </div>
  );
}