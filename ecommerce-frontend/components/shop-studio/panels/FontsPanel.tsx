'use client';

import { useState, useEffect } from 'react';

interface Props {
  selectedBlock: any;
  selectedTarget?: 'text' | 'background';
  isBackgroundSelected: boolean;
  customization: any;
  onUpdateBlock: (id: string, updates: any) => void;
  onUpdateCustomization: (updates: any) => void;
}

// Liste étendue des polices Google Fonts qui fonctionnent
const POPULAR_FONTS = [
  { name: 'Inter', category: 'Sans-Serif', import: 'Inter' },
  { name: 'Poppins', category: 'Sans-Serif', import: 'Poppins' },
  { name: 'Roboto', category: 'Sans-Serif', import: 'Roboto' },
  { name: 'Open Sans', category: 'Sans-Serif', import: 'Open+Sans' },
  { name: 'Montserrat', category: 'Sans-Serif', import: 'Montserrat' },
  { name: 'Nunito', category: 'Sans-Serif', import: 'Nunito' },
  { name: 'Playfair Display', category: 'Serif', import: 'Playfair+Display' },
  { name: 'Merriweather', category: 'Serif', import: 'Merriweather' },
  { name: 'Lora', category: 'Serif', import: 'Lora' },
  { name: 'Cormorant', category: 'Serif', import: 'Cormorant' },
  { name: 'Pacifico', category: 'Display', import: 'Pacifico' },
  { name: 'Lobster', category: 'Display', import: 'Lobster' },
  { name: 'Bebas Neue', category: 'Display', import: 'Bebas+Neue' },
  { name: 'Anton', category: 'Display', import: 'Anton' },
  { name: 'JetBrains Mono', category: 'Monospace', import: 'JetBrains+Mono' },
  { name: 'Fira Code', category: 'Monospace', import: 'Fira+Code' },
  { name: 'DM Sans', category: 'Sans-Serif', import: 'DM+Sans' },
  { name: 'Work Sans', category: 'Sans-Serif', import: 'Work+Sans' },
  { name: 'Raleway', category: 'Sans-Serif', import: 'Raleway' },
  { name: 'Oswald', category: 'Sans-Serif', import: 'Oswald' },
  { name: 'Quicksand', category: 'Sans-Serif', import: 'Quicksand' },
  { name: 'Crimson Text', category: 'Serif', import: 'Crimson+Text' },
  { name: 'PT Serif', category: 'Serif', import: 'PT+Serif' },
];

export default function FontsPanel({ 
  selectedBlock, 
  selectedTarget,
  isBackgroundSelected, 
  customization, 
  onUpdateBlock,
}: Props) {
  // ⭐ TOUS LES HOOKS ICI - AVANT LE RETURN
  const [search, setSearch] = useState('');
  const [target, setTarget] = useState<'text' | 'background'>(selectedTarget || 'text');

  // ⭐ Mettre à jour quand props.selectedTarget change
  useEffect(() => {
    if (selectedTarget) {
      setTarget(selectedTarget);
    }
  }, [selectedTarget]);

  // ⭐ Vérifier si le bloc a du texte modifiable
  const hasText = selectedBlock && ['text', 'title', 'banner', 'button', 'products'].includes(selectedBlock.type);
  
  // ⭐ Vérifier si le bloc a du fond modifiable
  const hasBackground = selectedBlock && ['banner', 'button', 'shape', 'section', 'products'].includes(selectedBlock.type);

  // ⭐ Forcer la cible si nécessaire
  useEffect(() => {
    if (selectedBlock) {
      if (!hasText && hasBackground) setTarget('background');
      else if (hasText && !hasBackground) setTarget('text');
    }
  }, [selectedBlock, hasText, hasBackground]);

  // ⭐ Fonction pour charger une police Google Font
  const loadGoogleFont = (fontName: string) => {
    if (!fontName || fontName === 'Inter') return;
    
    const font = POPULAR_FONTS.find(f => f.name === fontName);
    if (font && font.import) {
      const linkId = `google-font-${font.name.replace(/ /g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.href = `https://fonts.googleapis.com/css2?family=${font.import}:wght@300;400;500;600;700;800&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  };

  // ⭐ Charger les polices globales si nécessaire
  useEffect(() => {
    const fontsToLoad = [
      customization?.primaryFont,
      customization?.headingFont,
      customization?.bodyFont,
    ].filter(Boolean);
    
    fontsToLoad.forEach(loadGoogleFont);
  }, [customization?.primaryFont, customization?.headingFont, customization?.bodyFont]);

  // ⭐ Charger la police du bloc si nécessaire
  useEffect(() => {
    if (selectedBlock) {
      const currentFont = getCurrentFont();
      if (currentFont && currentFont !== 'Inter') {
        loadGoogleFont(currentFont);
      }
    }
  }, [selectedBlock, target]);

  // ⭐ Fonctions de mise à jour
  const handleFontChange = (font: string) => {
    if (!selectedBlock) return;
    
    const updates: any = {};
    
    switch (selectedBlock.type) {
      case 'text':
        updates.fontFamily = font;
        break;
      case 'title':
        updates.fontFamily = font;
        break;
      case 'banner':
        if (target === 'text') updates.titleFont = font;
        break;
      case 'button':
        updates.fontFamily = font;
        break;
      case 'products':
        if (target === 'text') updates.titleFont = font;
        break;
      default:
        updates.fontFamily = font;
    }
    
    onUpdateBlock(selectedBlock.id, updates);
    loadGoogleFont(font);
  };

  const handleSizeChange = (size: number) => {
    if (!selectedBlock) return;
    
    const updates: any = {};
    
    switch (selectedBlock.type) {
      case 'text':
        updates.fontSize = size;
        break;
      case 'title':
        updates.fontSize = size;
        break;
      case 'banner':
        if (target === 'text') updates.titleFontSize = size;
        break;
      case 'button':
        updates.fontSize = size;
        break;
      case 'products':
        if (target === 'text') updates.titleFontSize = size;
        break;
      default:
        updates.fontSize = size;
    }
    
    onUpdateBlock(selectedBlock.id, updates);
  };

  // ⭐ Récupérer la police actuelle
  const getCurrentFont = () => {
    if (!selectedBlock) return 'Inter';
    
    switch (selectedBlock.type) {
      case 'text': return selectedBlock.props?.fontFamily || 'Inter';
      case 'title': return selectedBlock.props?.fontFamily || 'Poppins';
      case 'banner': return target === 'text' 
        ? (selectedBlock.props?.titleFont || 'Poppins')
        : (selectedBlock.props?.fontFamily || 'Inter');
      case 'button': return selectedBlock.props?.fontFamily || 'Inter';
      case 'products': return target === 'text' 
        ? (selectedBlock.props?.titleFont || 'Poppins')
        : (selectedBlock.props?.fontFamily || 'Inter');
      default: return 'Inter';
    }
  };

  const getCurrentSize = () => {
    if (!selectedBlock) return 16;
    
    switch (selectedBlock.type) {
      case 'text': return selectedBlock.props?.fontSize || 16;
      case 'title': return selectedBlock.props?.fontSize || 36;
      case 'banner': return selectedBlock.props?.titleFontSize || 48;
      case 'button': return selectedBlock.props?.fontSize || 16;
      case 'products': return selectedBlock.props?.titleFontSize || 36;
      default: return 16;
    }
  };

  const filteredFonts = POPULAR_FONTS.filter(font =>
    font.name.toLowerCase().includes(search.toLowerCase())
  );

  const getTitle = () => {
    if (!selectedBlock) return 'Polices';
    if (target === 'text') return `Police du texte (${selectedBlock?.type})`;
    return `Police (${selectedBlock?.type})`;
  };

  // ⭐ RETOURS CONDITIONNELS - APRÈS TOUS LES HOOKS
  if (isBackgroundSelected) {
    return (
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-sm">Polices globales</h3>
        <p className="text-gray-400 text-xs">Sélectionnez un élément pour modifier ses polices</p>
      </div>
    );
  }

  if (!selectedBlock) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-xs">Sélectionnez un élément pour modifier ses polices</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold text-sm">{getTitle()}</h3>
        <span className="text-xs text-gray-500">{selectedBlock.type}</span>
      </div>

      {/* Sélecteur Texte/Fond pour les blocs qui ont les deux */}
      {hasText && hasBackground && (
        <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setTarget('text')}
            className={`flex-1 py-1 text-xs rounded transition-colors ${
              target === 'text' ? 'bg-primary text-white' : 'text-gray-400'
            }`}
          >
            📝 Texte
          </button>
          <button
            onClick={() => setTarget('background')}
            className={`flex-1 py-1 text-xs rounded transition-colors ${
              target === 'background' ? 'bg-primary text-white' : 'text-gray-400'
            }`}
          >
            🖼️ Fond
          </button>
        </div>
      )}

      {/* Recherche */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Rechercher une police</label>
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
        />
      </div>

      {/* Police */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Police</label>
        <select
          value={getCurrentFont()}
          onChange={(e) => handleFontChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
        >
          {filteredFonts.map(font => (
            <option key={font.name} value={font.name}>
              {font.name} ({font.category})
            </option>
          ))}
        </select>
      </div>

      {/* Taille - uniquement pour le texte */}
      {target === 'text' && (
        <div>
          <label className="text-xs text-gray-400 block mb-1">Taille: {getCurrentSize()}px</label>
          <input
            type="range"
            min="12"
            max="72"
            value={getCurrentSize()}
            onChange={(e) => handleSizeChange(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Alignement pour les textes */}
      {target === 'text' && (selectedBlock.type === 'text' || selectedBlock.type === 'title') && (
        <div>
          <label className="text-xs text-gray-400 block mb-1">Alignement</label>
          <div className="flex gap-1">
            {['left', 'center', 'right'].map(align => (
              <button
                key={align}
                onClick={() => onUpdateBlock(selectedBlock.id, { textAlign: align })}
                className={`flex-1 py-1 text-xs rounded ${
                  selectedBlock.props?.textAlign === align
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {align === 'left' ? '←' : align === 'center' ? '↔' : '→'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}