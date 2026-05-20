// components/shop-studio/AddToParentPanel.tsx
'use client';

import { useState } from 'react';
import { FiType, FiMousePointer, FiImage, FiSquare, FiX, FiAlignLeft, FiBold, FiHash } from 'react-icons/fi';

interface Props {
  parentId: string;
  parentType: string;
  parentName: string;
  onClose: () => void;
  onAddBlock: (type: string, props: any, parentId: string | null) => void;
}

// ⭐ TYPES DE BLOCS DISPONIBLES POUR LES ENFANTS
const CHILD_BLOCKS = [
  { 
    type: 'title', 
    label: 'Titre', 
    icon: FiBold,  // ⭐ Remplacé FiHeading par FiBold
    defaultProps: { 
      title: 'Nouveau titre', 
      level: 'h2',
      fontSize: 36,
      fontWeight: '700',
      textAlign: 'center',
      fontFamily: 'Poppins',
      textColor: '#ffffff'
    } 
  },
  { 
    type: 'text', 
    label: 'Texte', 
    icon: FiType, 
    defaultProps: { 
      content: 'Saisissez votre texte ici...', 
      fontSize: 16,
      fontFamily: 'Inter',
      fontWeight: '400',
      textAlign: 'left',
      textColor: '#ffffff'
    } 
  },
  { 
    type: 'button', 
    label: 'Bouton', 
    icon: FiMousePointer, 
    defaultProps: { 
      text: 'Cliquez ici', 
      backgroundColor: '#2563EB', 
      textColor: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      borderRadius: 8,
      paddingX: 20,
      paddingY: 10
    } 
  },
  { 
    type: 'image', 
    label: 'Image', 
    icon: FiImage, 
    defaultProps: { 
      url: 'https://picsum.photos/200/150', 
      alt: 'Image',
      width: 200,
      height: 150,
      borderRadius: 8
    } 
  },
  { 
    type: 'shape', 
    label: 'Forme', 
    icon: FiSquare, 
    defaultProps: { 
      shape: 'square', 
      width: 100, 
      height: 100, 
      backgroundColor: '#2563EB',
      borderRadius: 0
    } 
  },
];

export default function AddToParentPanel({ parentId, parentType, parentName, onClose, onAddBlock }: Props) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const handleAddBlock = (block: typeof CHILD_BLOCKS[0]) => {
    // Position par défaut relative au parent (en pourcentage)
    const defaultPosition = {
      x: 50,  // centré horizontalement
      y: 50,  // centré verticalement
      width: block.type === 'title' ? 300 : (block.type === 'text' ? 250 : 200),
      height: block.type === 'title' ? 80 : (block.type === 'text' ? 100 : 60),
      zIndex: 10,
      rotation: 0,
      positionType: 'relative', // Position relative au parent
    };
    
    onAddBlock(block.type, {
      ...block.defaultProps,
      position: defaultPosition,
    }, parentId);
    
    onClose();
  };

  // Afficher des conseils spécifiques selon le type de parent
  const getParentTips = () => {
    switch (parentType) {
      case 'banner':
      case 'screen-banner':
        return "💡 Astuce : Les éléments ajoutés ici peuvent être déplacés et redimensionnés librement sur la bannière.";
      case 'carousel-banner':
        return "💡 Astuce : Les éléments ajoutés apparaîtront sur toutes les slides du carrousel.";
      case 'section':
        return "💡 Astuce : Vous pouvez organiser vos blocs à l'intérieur de cette section.";
      case 'group':
        return "💡 Astuce : Ce groupe contient des blocs qui se déplacent ensemble.";
      default:
        return "💡 Astuce : Les éléments ajoutés ici seront positionnés à l'intérieur de ce conteneur.";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Ajouter à {parentName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={20} />
          </button>
        </div>
        
        <p className="text-gray-400 text-sm mb-2">
          Ajoutez un élément à l'intérieur de ce <span className="text-primary">{parentType}</span>
        </p>
        
        <p className="text-gray-500 text-xs mb-4">
          {getParentTips()}
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {CHILD_BLOCKS.map(block => {
            const Icon = block.icon;
            return (
              <button
                key={block.type}
                onClick={() => handleAddBlock(block)}
                onMouseEnter={() => setSelectedBlock(block.type)}
                onMouseLeave={() => setSelectedBlock(null)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                  selectedBlock === block.type 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Icon size={24} className={selectedBlock === block.type ? 'text-white' : 'text-primary'} />
                <span className="text-white text-sm">{block.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            ⚠️ Les éléments ajoutés seront positionnés au centre du parent.<br />
            Utilisez les poignées de redimensionnement et de déplacement pour les ajuster.
          </p>
        </div>
      </div>
    </div>
  );
}