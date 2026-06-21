'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  selectedBlock: any;
  isBackgroundSelected: boolean;
  customization: any;
  onUpdateBlock: (id: string, updates: any) => void;
  onUpdateCustomization: (updates: any) => void;
  selectedTarget?: 'text' | 'background';
}

export default function FontsPanel({ 
  selectedBlock, 
  isBackgroundSelected, 
  customization, 
  onUpdateBlock, 
  onUpdateCustomization,
  selectedTarget = 'text'
}: Props) {
  const [activeTab, setActiveTab] = useState<'fonts' | 'text-effects'>('fonts');
  
  // ⭐ ÉTATS POUR LE CARROUSEL (comme dans ColorsPanel)
  const currentSlideIndexRef = useRef(0);
  const [currentSlide, setCurrentSlide] = useState<any>(null);
  const [, forceUpdate] = useState(0);

  const isBanner = selectedBlock?.type === 'banner';
  const isScreenBanner = selectedBlock?.type === 'screen-banner';
  const isCarouselBanner = selectedBlock?.type === 'carousel-banner';
  const isTextBlock = selectedBlock?.type === 'text';
  const isTitleBlock = selectedBlock?.type === 'title';
  const isButtonBlock = selectedBlock?.type === 'button';
  const isGridProducts = selectedBlock?.type === 'products';
  
  const isCanvasSelected = isBackgroundSelected;
  const isBlockSelected = !isCanvasSelected && selectedBlock !== null;
  const target = selectedTarget;

  // ⭐ Fonction pour mettre à jour l'état local à partir du bloc
  const updateFromBlock = useCallback(() => {
    if (!selectedBlock?.props?.images) return;
    
    const savedIndex = selectedBlock.props.currentIndex;
    if (savedIndex !== undefined && savedIndex !== currentSlideIndexRef.current) {
      currentSlideIndexRef.current = savedIndex;
    }
    
    const slide = selectedBlock.props.images[currentSlideIndexRef.current];
    if (slide) {
      setCurrentSlide(slide);
    }
    forceUpdate(prev => prev + 1);
  }, [selectedBlock]);

  // ⭐ Mettre à jour quand le bloc change (changement de slide via le carrousel)
  useEffect(() => {
    updateFromBlock();
  }, [updateFromBlock, selectedBlock?.props?.images, selectedBlock?.props?.currentIndex]);

  // ⭐ Écouter l'index de la slide courante
  useEffect(() => {
    const handleCarouselIndexChange = (event: CustomEvent) => {
      const newIndex = event.detail;
      currentSlideIndexRef.current = newIndex;
      
      const slides = selectedBlock?.props?.images || [];
      const slide = slides[newIndex];
      if (slide) {
        setCurrentSlide(slide);
      }
      forceUpdate(prev => prev + 1);
    };
    window.addEventListener('carouselIndexChange', handleCarouselIndexChange as EventListener);
    return () => window.removeEventListener('carouselIndexChange', handleCarouselIndexChange as EventListener);
  }, [selectedBlock]);

  // ⭐ Fonction pour mettre à jour la slide courante - ÉVITER LA BOUCLE INFINIE
  const updateCurrentSlide = useCallback((updates: any) => {
    if (!isCarouselBanner || !selectedBlock) return;
    
    const slides = [...(selectedBlock.props?.images || [])];
    const currentIdx = currentSlideIndexRef.current;
    if (slides[currentIdx]) {
      const newSlides = [...slides];
      newSlides[currentIdx] = { ...slides[currentIdx], ...updates };
      // ⭐ Appel direct sans créer de nouvelle référence inutile
      onUpdateBlock(selectedBlock.id, { images: newSlides });
      
      // ⭐ Mettre à jour l'état local sans déclencher de nouveau rendu
      setCurrentSlide((prev: any) => {
        if (prev && prev.id === slides[currentIdx].id) {
          return { ...prev, ...updates };
        }
        return prev;
      });
    }
  }, [isCarouselBanner, selectedBlock, onUpdateBlock]);

  // Polices disponibles
  const fonts = [
    'Inter', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans', 
    'Playfair Display', 'Pacifico', 'Dancing Script', 'Lato', 'Raleway'
  ];

  const fontWeights = [
    { value: '300', label: 'Léger (300)' },
    { value: '400', label: 'Normal (400)' },
    { value: '500', label: 'Moyen (500)' },
    { value: '600', label: 'Semi-gras (600)' },
    { value: '700', label: 'Gras (700)' },
    { value: '800', label: 'Extra-gras (800)' },
  ];

  // Vérifier si au moins un texte est visible
  const hasAnyTextVisible = () => {
    if (isBanner || isCarouselBanner || isScreenBanner) {
      if (isCarouselBanner && currentSlide) {
        return (currentSlide.showTitle !== false) || 
               (currentSlide.showSubtitle !== false) || 
               (currentSlide.showButton !== false);
      }
      return (selectedBlock.props?.showTitle !== false) || 
             (selectedBlock.props?.showSubtitle !== false) || 
             (selectedBlock.props?.showButton !== false);
    }
    return true;
  };

  // ==================== POUR LE CANVAS (fond de page) ====================
  if (isCanvasSelected) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Police par défaut</label>
          <select
            value={customization?.primaryFont || 'Inter'}
            onChange={(e) => onUpdateCustomization({ primaryFont: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Police des titres</label>
          <select
            value={customization?.headingFont || 'Poppins'}
            onChange={(e) => onUpdateCustomization({ headingFont: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Police du texte</label>
          <select
            value={customization?.bodyFont || 'Inter'}
            onChange={(e) => onUpdateCustomization({ bodyFont: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // ==================== POUR LE BLOC GRID-PRODUCTS ====================
  if (isBlockSelected && isGridProducts && target === 'text') {
    const blockProps = selectedBlock.props || {};

    return (
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          <button 
            onClick={() => setActiveTab('fonts')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'fonts' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            📝 Polices
          </button>
          <button 
            onClick={() => setActiveTab('text-effects')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'text-effects' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            🎨 Couleurs
          </button>
        </div>

        {activeTab === 'fonts' && (
          <>
            {/* ── Nom du produit ── */}
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
              <h4 className="text-white text-xs font-semibold">🏷️ Nom du produit</h4>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Police</label>
                <select
                  value={blockProps.productNameFont || 'Inter'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { productNameFont: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Taille : {blockProps.productNameSize
                    ? parseInt(blockProps.productNameSize)
                    : 14}px
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="200" 
                  step="1"
                  value={blockProps.productNameSize ? parseInt(blockProps.productNameSize) : 14}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { productNameSize: `${e.target.value}px` })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Graisse</label>
                <select
                  value={blockProps.productNameWeight || '600'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { productNameWeight: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fontWeights.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
            </div>

            {/* ── Prix ── */}
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
              <h4 className="text-white text-xs font-semibold">💰 Prix</h4>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Police</label>
                <select
                  value={blockProps.priceFont || 'Inter'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { priceFont: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Taille : {blockProps.priceSize
                    ? parseInt(blockProps.priceSize)
                    : 14}px
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="200" 
                  step="1"
                  value={blockProps.priceSize ? parseInt(blockProps.priceSize) : 14}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { priceSize: `${e.target.value}px` })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Graisse</label>
                <select
                  value={blockProps.priceWeight || '700'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { priceWeight: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fontWeights.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {activeTab === 'text-effects' && (
          <>
            {/* ── Couleur nom ── */}
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
              <h4 className="text-white text-xs font-semibold">🏷️ Couleur du nom</h4>
              <div className="flex items-center gap-2">
                <input 
                  type="color"
                  value={blockProps.productNameColor || '#1F2937'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { productNameColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input 
                  type="text"
                  value={blockProps.productNameColor || '#1F2937'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { productNameColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* ── Couleur prix ── */}
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
              <h4 className="text-white text-xs font-semibold">💰 Couleur du prix</h4>
              <div className="flex items-center gap-2">
                <input 
                  type="color"
                  value={blockProps.priceColor || '#2563EB'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { priceColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input 
                  type="text"
                  value={blockProps.priceColor || '#2563EB'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { priceColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>
          </>
        )}

        <div className="text-center py-2 bg-blue-900/30 rounded-lg">
          <p className="text-blue-300 text-xs">
            💡 Ces réglages s'appliquent au mode traditionnel.<br/>
            Mode interactif : couleurs gérées dans le panel Grille → Style du slot
          </p>
        </div>
      </div>
    );
  }

  // ==================== POUR LE BLOC BANNER / CARROUSEL - QUAND ON CLIQUE SUR LE FOND ====================
  if ((isBanner || isCarouselBanner || isScreenBanner) && target === 'background') {
    const hasCarousel = isCarouselBanner;
    const currentSlideData = hasCarousel ? currentSlide : null;
    const blockProps = hasCarousel ? (currentSlideData || {}) : (selectedBlock.props || {});
    
    return (
      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
          <h4 className="text-white text-xs font-semibold">👁️ Éléments visibles</h4>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">📝 Titre</label>
            <button
              onClick={() => {
                if (hasCarousel && currentSlide) {
                  updateCurrentSlide({ showTitle: currentSlide.showTitle === false ? true : false });
                } else {
                  onUpdateBlock(selectedBlock.id, { showTitle: blockProps.showTitle === false ? true : false });
                }
              }}
              className={`px-3 py-1 rounded text-xs ${blockProps.showTitle !== false ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              {blockProps.showTitle !== false ? '✓ Activé' : '✗ Désactivé'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">📄 Sous-titre</label>
            <button
              onClick={() => {
                if (hasCarousel && currentSlide) {
                  updateCurrentSlide({ showSubtitle: currentSlide.showSubtitle === false ? true : false });
                } else {
                  onUpdateBlock(selectedBlock.id, { showSubtitle: blockProps.showSubtitle === false ? true : false });
                }
              }}
              className={`px-3 py-1 rounded text-xs ${blockProps.showSubtitle !== false ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              {blockProps.showSubtitle !== false ? '✓ Activé' : '✗ Désactivé'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">🔘 Bouton</label>
            <button
              onClick={() => {
                if (hasCarousel && currentSlide) {
                  updateCurrentSlide({ showButton: currentSlide.showButton === false ? true : false });
                } else {
                  onUpdateBlock(selectedBlock.id, { showButton: blockProps.showButton === false ? true : false });
                }
              }}
              className={`px-3 py-1 rounded text-xs ${blockProps.showButton !== false ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              {blockProps.showButton !== false ? '✓ Activé' : '✗ Désactivé'}
            </button>
          </div>
        </div>

        <div className="text-center py-2 bg-blue-900/30 rounded-lg">
          <p className="text-blue-300 text-xs">
            💡 Cliquez directement sur le texte pour modifier les polices et les effets
          </p>
        </div>
        
        {hasCarousel && (
          <div className="text-xs text-gray-500 text-center">
            Slide {currentSlideIndexRef.current + 1} / {selectedBlock?.props?.images?.length || 0}
          </div>
        )}
      </div>
    );
  }

  // ==================== POUR LE BLOC BANNER / CARROUSEL - QUAND ON CLIQUE SUR LE TEXTE ====================
  if ((isBanner || isCarouselBanner) && target === 'text') {
    // ⭐ Pour le carrousel, on utilise currentSlide
    const blockProps = isCarouselBanner ? (currentSlide || {}) : (selectedBlock.props || {});
    const hasTitle = blockProps.showTitle !== false;
    const hasSubtitle = blockProps.showSubtitle !== false;
    const hasButton = blockProps.showButton !== false;

    // ⭐ Fonctions helper pour les valeurs
    const getTitleValue = (key: string, defaultValue: any) => {
      return blockProps[key] ?? defaultValue;
    };

    const getSubtitleValue = (key: string, defaultValue: any) => {
      return blockProps[key] ?? defaultValue;
    };

    const getButtonValue = (key: string, defaultValue: any) => {
      return blockProps[key] ?? defaultValue;
    };

    const getGlobalValue = (key: string, defaultValue: any) => {
      return blockProps[key] ?? defaultValue;
    };

    const handleTitleUpdate = (updates: any) => {
      if (isCarouselBanner) {
        updateCurrentSlide(updates);
      } else {
        onUpdateBlock(selectedBlock.id, updates);
      }
    };

    const handleSubtitleUpdate = (updates: any) => {
      if (isCarouselBanner) {
        updateCurrentSlide(updates);
      } else {
        onUpdateBlock(selectedBlock.id, updates);
      }
    };

    const handleButtonUpdate = (updates: any) => {
      if (isCarouselBanner) {
        updateCurrentSlide(updates);
      } else {
        onUpdateBlock(selectedBlock.id, updates);
      }
    };

    const handleGlobalUpdate = (updates: any) => {
      if (isCarouselBanner) {
        updateCurrentSlide(updates);
      } else {
        onUpdateBlock(selectedBlock.id, updates);
      }
    };

    return (
      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
          <h4 className="text-white text-xs font-semibold">👁️ Éléments visibles</h4>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">📝 Titre</label>
            <button
              onClick={() => {
                if (isCarouselBanner && currentSlide) {
                  updateCurrentSlide({ showTitle: currentSlide.showTitle === false ? true : false });
                } else {
                  onUpdateBlock(selectedBlock.id, { showTitle: blockProps.showTitle === false ? true : false });
                }
              }}
              className={`px-3 py-1 rounded text-xs ${hasTitle ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              {hasTitle ? '✓ Activé' : '✗ Désactivé'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">📄 Sous-titre</label>
            <button
              onClick={() => {
                if (isCarouselBanner && currentSlide) {
                  updateCurrentSlide({ showSubtitle: currentSlide.showSubtitle === false ? true : false });
                } else {
                  onUpdateBlock(selectedBlock.id, { showSubtitle: blockProps.showSubtitle === false ? true : false });
                }
              }}
              className={`px-3 py-1 rounded text-xs ${hasSubtitle ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              {hasSubtitle ? '✓ Activé' : '✗ Désactivé'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">🔘 Bouton</label>
            <button
              onClick={() => {
                if (isCarouselBanner && currentSlide) {
                  updateCurrentSlide({ showButton: currentSlide.showButton === false ? true : false });
                } else {
                  onUpdateBlock(selectedBlock.id, { showButton: blockProps.showButton === false ? true : false });
                }
              }}
              className={`px-3 py-1 rounded text-xs ${hasButton ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              {hasButton ? '✓ Activé' : '✗ Désactivé'}
            </button>
          </div>
        </div>

        {hasAnyTextVisible() && (
          <>
            <div className="flex gap-2 border-b border-gray-700 pb-2">
              <button onClick={() => setActiveTab('fonts')} className={`flex-1 py-1 text-xs rounded ${activeTab === 'fonts' ? 'bg-primary text-white' : 'text-gray-400'}`}>📝 Polices</button>
              <button onClick={() => setActiveTab('text-effects')} className={`flex-1 py-1 text-xs rounded ${activeTab === 'text-effects' ? 'bg-primary text-white' : 'text-gray-400'}`}>✨ Effets texte</button>
            </div>

            {activeTab === 'fonts' && (
              <>
                {hasTitle && (
                  <>
                    <div><label className="text-xs text-gray-400 block mb-1">Police du titre</label><select value={getTitleValue('titleFont', 'Poppins')} onChange={(e) => handleTitleUpdate({ titleFont: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fonts.map(font => (<option key={font} value={font}>{font}</option>))}</select></div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Taille du titre: {getTitleValue('titleFontSize', 48)}px</label>
                      <input type="range" min="24" max="200" step="1" value={getTitleValue('titleFontSize', 48)} onChange={(e) => handleTitleUpdate({ titleFontSize: parseInt(e.target.value) })} className="w-full" />
                    </div>
                    <div><label className="text-xs text-gray-400 block mb-1">Poids du titre</label><select value={getTitleValue('titleFontWeight', '700')} onChange={(e) => handleTitleUpdate({ titleFontWeight: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fontWeights.map(w => (<option key={w.value} value={w.value}>{w.label}</option>))}</select></div>
                  </>
                )}

                {hasSubtitle && (
                  <div className="border-t border-gray-700 pt-3 mt-2">
                    <h4 className="text-white text-xs font-semibold mb-2">Sous-titre</h4>
                    <div><label className="text-xs text-gray-400 block mb-1">Police du sous-titre</label><select value={getSubtitleValue('subtitleFont', 'Inter')} onChange={(e) => handleSubtitleUpdate({ subtitleFont: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fonts.map(font => (<option key={font} value={font}>{font}</option>))}</select></div>
                    <div className="mt-2">
                      <label className="text-xs text-gray-400 block mb-1">Taille du sous-titre: {getSubtitleValue('subtitleFontSize', 18)}px</label>
                      <input type="range" min="12" max="200" step="1" value={getSubtitleValue('subtitleFontSize', 18)} onChange={(e) => handleSubtitleUpdate({ subtitleFontSize: parseInt(e.target.value) })} className="w-full" />
                    </div>
                    <div className="mt-2"><label className="text-xs text-gray-400 block mb-1">Poids du sous-titre</label><select value={getSubtitleValue('subtitleFontWeight', '400')} onChange={(e) => handleSubtitleUpdate({ subtitleFontWeight: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fontWeights.map(w => (<option key={w.value} value={w.value}>{w.label}</option>))}</select></div>
                  </div>
                )}

                {hasButton && (
                  <div className="border-t border-gray-700 pt-3 mt-2">
                    <h4 className="text-white text-xs font-semibold mb-2">Bouton</h4>
                    <div><label className="text-xs text-gray-400 block mb-1">Police du bouton</label><select value={getButtonValue('buttonFont', 'Inter')} onChange={(e) => handleButtonUpdate({ buttonFont: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fonts.map(font => (<option key={font} value={font}>{font}</option>))}</select></div>
                    <div className="mt-2">
                      <label className="text-xs text-gray-400 block mb-1">Taille du bouton: {getButtonValue('buttonFontSize', 16)}px</label>
                      <input type="range" min="12" max="200" step="1" value={getButtonValue('buttonFontSize', 16)} onChange={(e) => handleButtonUpdate({ buttonFontSize: parseInt(e.target.value) })} className="w-full" />
                    </div>
                    <div className="mt-2"><label className="text-xs text-gray-400 block mb-1">Poids du bouton</label><select value={getButtonValue('buttonFontWeight', '500')} onChange={(e) => handleButtonUpdate({ buttonFontWeight: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fontWeights.map(w => (<option key={w.value} value={w.value}>{w.label}</option>))}</select></div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'text-effects' && (
              <>
                {hasTitle && (
                  <>
                    <div><label className="text-xs text-gray-400 block mb-1">Couleur du titre</label><div className="flex items-center gap-2"><input type="color" value={getTitleValue('titleColor', '#ffffff')} onChange={(e) => handleTitleUpdate({ titleColor: e.target.value, titleGradient: null })} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" value={getTitleValue('titleColor', '#ffffff')} onChange={(e) => handleTitleUpdate({ titleColor: e.target.value, titleGradient: null })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono" /></div></div>
                    <div><label className="text-xs text-gray-400 block mb-1">Dégradé pour le titre</label><div className="grid grid-cols-3 gap-1">{['linear-gradient(135deg, #667eea 0%, #764ba2 100%)','linear-gradient(135deg, #f093fb 0%, #f5576c 100%)','linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)','linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)','linear-gradient(135deg, #fa709a 0%, #fee140 100%)','linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'].map((grad, idx) => (<button key={idx} onClick={() => handleTitleUpdate({ titleGradient: grad, titleColor: null })} className={`h-8 rounded border transition-all hover:scale-105 ${getTitleValue('titleGradient', null) === grad ? 'border-primary ring-1 ring-primary' : 'border-gray-700'}`} style={{ background: grad }} title={`Dégradé ${idx + 1}`} />))}</div>{getTitleValue('titleGradient', null) && <button onClick={() => handleTitleUpdate({ titleGradient: null, titleColor: '#ffffff' })} className="w-full mt-2 text-xs text-gray-400 hover:text-white">✕ Supprimer le dégradé</button>}</div>
                  </>
                )}

                {hasSubtitle && (
                  <div className="border-t border-gray-700 pt-3 mt-2"><label className="text-xs text-gray-400 block mb-1">Couleur du sous-titre</label><div className="flex items-center gap-2"><input type="color" value={getSubtitleValue('subtitleColor', '#ffffff')} onChange={(e) => handleSubtitleUpdate({ subtitleColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" value={getSubtitleValue('subtitleColor', '#ffffff')} onChange={(e) => handleSubtitleUpdate({ subtitleColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono" /></div></div>
                )}

                {hasButton && (
                  <>
                    <div className="border-t border-gray-700 pt-3 mt-2"><label className="text-xs text-gray-400 block mb-1">Couleur du bouton</label><div className="flex items-center gap-2"><input type="color" value={getButtonValue('buttonBackgroundColor', '#2563EB')} onChange={(e) => handleButtonUpdate({ buttonBackgroundColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" value={getButtonValue('buttonBackgroundColor', '#2563EB')} onChange={(e) => handleButtonUpdate({ buttonBackgroundColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono" /></div></div>
                    <div><label className="text-xs text-gray-400 block mb-1">Texte du bouton</label><div className="flex items-center gap-2"><input type="color" value={getButtonValue('buttonTextColor', '#ffffff')} onChange={(e) => handleButtonUpdate({ buttonTextColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" value={getButtonValue('buttonTextColor', '#ffffff')} onChange={(e) => handleButtonUpdate({ buttonTextColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono" /></div></div>
                    <div><label className="text-xs text-gray-400 block mb-1">Arrondi du bouton: {getButtonValue('buttonBorderRadius', 8)}px</label><input type="range" min="0" max="50" value={getButtonValue('buttonBorderRadius', 8)} onChange={(e) => handleButtonUpdate({ buttonBorderRadius: parseInt(e.target.value) })} className="w-full" /></div>
                  </>
                )}

                <div><label className="text-xs text-gray-400 block mb-1">Opacité du texte: {getGlobalValue('textOpacity', 100)}%</label><input type="range" min="0" max="100" value={getGlobalValue('textOpacity', 100)} onChange={(e) => handleGlobalUpdate({ textOpacity: parseInt(e.target.value) })} className="w-full" /></div>
                
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Position du texte</label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map(pos => {
                      let xValue = pos === 'left' ? 15 : pos === 'center' ? 50 : 85;
                      return (
                        <button
                          key={pos}
                          onClick={() => {
                            const updates: any = {};
                            if (hasTitle) updates.titlePosition = { x: xValue, y: getTitleValue('titlePosition', {}).y || 30 };
                            if (hasSubtitle) updates.subtitlePosition = { x: xValue, y: getSubtitleValue('subtitlePosition', {}).y || 50 };
                            if (hasButton) updates.buttonPosition = { x: xValue, y: getButtonValue('buttonPosition', {}).y || 70 };
                            updates.textPosition = pos;
                            handleGlobalUpdate(updates);
                          }}
                          className={`flex-1 py-1 rounded text-xs ${getGlobalValue('textPosition', 'center') === pos ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                          {pos === 'left' ? '← Gauche' : pos === 'center' ? '↔ Centre' : '→ Droite'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {!hasAnyTextVisible() && (
          <div className="text-center py-4 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400 text-xs mb-2">⚠️ Tous les textes sont masqués</p>
            <p className="text-gray-500 text-xs">Utilisez les boutons "Éléments visibles" ci-dessus pour réactiver le titre, le sous-titre ou le bouton</p>
          </div>
        )}
        
        {isCarouselBanner && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
            Slide {currentSlideIndexRef.current + 1} / {selectedBlock?.props?.images?.length || 0}
          </div>
        )}
      </div>
    );
  }

  // ==================== POUR LE BLOC SCREEN-BANNER (TEXTE) ====================
  if (isScreenBanner && target === 'text') {
    const blockProps = selectedBlock.props || {};
    const hasTitle = blockProps.showTitle !== false;
    const hasSubtitle = blockProps.showSubtitle !== false;
    const hasButton = blockProps.showButton !== false;

    return (
      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
          <h4 className="text-white text-xs font-semibold">👁️ Éléments visibles</h4>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">📝 Titre</label>
            <button
              onClick={() => onUpdateBlock(selectedBlock.id, { showTitle: blockProps.showTitle === false ? true : false })}
              className={`px-3 py-1 rounded text-xs ${hasTitle ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              {hasTitle ? '✓ Activé' : '✗ Désactivé'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">📄 Sous-titre</label>
            <button
              onClick={() => onUpdateBlock(selectedBlock.id, { showSubtitle: blockProps.showSubtitle === false ? true : false })}
              className={`px-3 py-1 rounded text-xs ${hasSubtitle ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              {hasSubtitle ? '✓ Activé' : '✗ Désactivé'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">🔘 Bouton</label>
            <button
              onClick={() => onUpdateBlock(selectedBlock.id, { showButton: blockProps.showButton === false ? true : false })}
              className={`px-3 py-1 rounded text-xs ${hasButton ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              {hasButton ? '✓ Activé' : '✗ Désactivé'}
            </button>
          </div>
        </div>

        {hasAnyTextVisible() && (
          <>
            <div className="flex gap-2 border-b border-gray-700 pb-2">
              <button onClick={() => setActiveTab('fonts')} className={`flex-1 py-1 text-xs rounded ${activeTab === 'fonts' ? 'bg-primary text-white' : 'text-gray-400'}`}>📝 Polices</button>
              <button onClick={() => setActiveTab('text-effects')} className={`flex-1 py-1 text-xs rounded ${activeTab === 'text-effects' ? 'bg-primary text-white' : 'text-gray-400'}`}>✨ Effets texte</button>
            </div>

            {activeTab === 'fonts' && (
              <>
                {hasTitle && (
                  <>
                    <div><label className="text-xs text-gray-400 block mb-1">Police du titre</label><select value={blockProps.titleFont || 'Poppins'} onChange={(e) => onUpdateBlock(selectedBlock.id, { titleFont: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fonts.map(font => (<option key={font} value={font}>{font}</option>))}</select></div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Taille du titre: {blockProps.titleFontSize || 48}px</label>
                      <input type="range" min="24" max="200" step="1" value={blockProps.titleFontSize || 48} onChange={(e) => onUpdateBlock(selectedBlock.id, { titleFontSize: parseInt(e.target.value) })} className="w-full" />
                    </div>
                    <div><label className="text-xs text-gray-400 block mb-1">Poids du titre</label><select value={blockProps.titleFontWeight || '700'} onChange={(e) => onUpdateBlock(selectedBlock.id, { titleFontWeight: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fontWeights.map(w => (<option key={w.value} value={w.value}>{w.label}</option>))}</select></div>
                  </>
                )}

                {hasSubtitle && (
                  <div className="border-t border-gray-700 pt-3 mt-2">
                    <h4 className="text-white text-xs font-semibold mb-2">Sous-titre</h4>
                    <div><label className="text-xs text-gray-400 block mb-1">Police du sous-titre</label><select value={blockProps.subtitleFont || 'Inter'} onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleFont: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fonts.map(font => (<option key={font} value={font}>{font}</option>))}</select></div>
                    <div className="mt-2">
                      <label className="text-xs text-gray-400 block mb-1">Taille du sous-titre: {blockProps.subtitleFontSize || 18}px</label>
                      <input type="range" min="12" max="200" step="1" value={blockProps.subtitleFontSize || 18} onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleFontSize: parseInt(e.target.value) })} className="w-full" />
                    </div>
                    <div className="mt-2"><label className="text-xs text-gray-400 block mb-1">Poids du sous-titre</label><select value={blockProps.subtitleFontWeight || '400'} onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleFontWeight: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fontWeights.map(w => (<option key={w.value} value={w.value}>{w.label}</option>))}</select></div>
                  </div>
                )}

                {hasButton && (
                  <div className="border-t border-gray-700 pt-3 mt-2">
                    <h4 className="text-white text-xs font-semibold mb-2">Bouton</h4>
                    <div><label className="text-xs text-gray-400 block mb-1">Police du bouton</label><select value={blockProps.buttonFont || 'Inter'} onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonFont: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fonts.map(font => (<option key={font} value={font}>{font}</option>))}</select></div>
                    <div className="mt-2">
                      <label className="text-xs text-gray-400 block mb-1">Taille du bouton: {blockProps.buttonFontSize || 16}px</label>
                      <input type="range" min="12" max="200" step="1" value={blockProps.buttonFontSize || 16} onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonFontSize: parseInt(e.target.value) })} className="w-full" />
                    </div>
                    <div className="mt-2"><label className="text-xs text-gray-400 block mb-1">Poids du bouton</label><select value={blockProps.buttonFontWeight || '500'} onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonFontWeight: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fontWeights.map(w => (<option key={w.value} value={w.value}>{w.label}</option>))}</select></div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'text-effects' && (
              <>
                {hasTitle && (
                  <>
                    <div><label className="text-xs text-gray-400 block mb-1">Couleur du titre</label><div className="flex items-center gap-2"><input type="color" value={blockProps.titleColor || '#ffffff'} onChange={(e) => onUpdateBlock(selectedBlock.id, { titleColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" value={blockProps.titleColor || '#ffffff'} onChange={(e) => onUpdateBlock(selectedBlock.id, { titleColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono" /></div></div>
                    <div><label className="text-xs text-gray-400 block mb-1">Dégradé pour le titre</label><div className="grid grid-cols-3 gap-1">{['linear-gradient(135deg, #667eea 0%, #764ba2 100%)','linear-gradient(135deg, #f093fb 0%, #f5576c 100%)','linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)','linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)','linear-gradient(135deg, #fa709a 0%, #fee140 100%)','linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'].map((grad, idx) => (<button key={idx} onClick={() => onUpdateBlock(selectedBlock.id, { titleGradient: grad, titleColor: null })} className={`h-8 rounded border transition-all hover:scale-105 ${blockProps.titleGradient === grad ? 'border-primary ring-1 ring-primary' : 'border-gray-700'}`} style={{ background: grad }} title={`Dégradé ${idx + 1}`} />))}</div>{blockProps.titleGradient && <button onClick={() => onUpdateBlock(selectedBlock.id, { titleGradient: null, titleColor: '#ffffff' })} className="w-full mt-2 text-xs text-gray-400 hover:text-white">✕ Supprimer le dégradé</button>}</div>
                  </>
                )}

                {hasSubtitle && (
                  <div className="border-t border-gray-700 pt-3 mt-2"><label className="text-xs text-gray-400 block mb-1">Couleur du sous-titre</label><div className="flex items-center gap-2"><input type="color" value={blockProps.subtitleColor || '#ffffff'} onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" value={blockProps.subtitleColor || '#ffffff'} onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono" /></div></div>
                )}

                {hasButton && (
                  <>
                    <div className="border-t border-gray-700 pt-3 mt-2"><label className="text-xs text-gray-400 block mb-1">Couleur du bouton</label><div className="flex items-center gap-2"><input type="color" value={blockProps.buttonBackgroundColor || '#2563EB'} onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonBackgroundColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" value={blockProps.buttonBackgroundColor || '#2563EB'} onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonBackgroundColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono" /></div></div>
                    <div><label className="text-xs text-gray-400 block mb-1">Texte du bouton</label><div className="flex items-center gap-2"><input type="color" value={blockProps.buttonTextColor || '#ffffff'} onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonTextColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" value={blockProps.buttonTextColor || '#ffffff'} onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonTextColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono" /></div></div>
                    <div><label className="text-xs text-gray-400 block mb-1">Arrondi du bouton: {blockProps.buttonBorderRadius || 8}px</label><input type="range" min="0" max="50" value={blockProps.buttonBorderRadius || 8} onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonBorderRadius: parseInt(e.target.value) })} className="w-full" /></div>
                  </>
                )}

                <div><label className="text-xs text-gray-400 block mb-1">Contour du texte: {blockProps.textStrokeWidth || 0}px</label><input type="range" min="0" max="5" step="0.5" value={blockProps.textStrokeWidth || 0} onChange={(e) => onUpdateBlock(selectedBlock.id, { textStrokeWidth: parseFloat(e.target.value) })} className="w-full" /></div>
                {blockProps.textStrokeWidth > 0 && (<div><label className="text-xs text-gray-400 block mb-1">Couleur du contour</label><div className="flex items-center gap-2"><input type="color" value={blockProps.textStrokeColor || '#000000'} onChange={(e) => onUpdateBlock(selectedBlock.id, { textStrokeColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" value={blockProps.textStrokeColor || '#000000'} onChange={(e) => onUpdateBlock(selectedBlock.id, { textStrokeColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono" /></div></div>)}
                <div><label className="text-xs text-gray-400 block mb-1">Ombre du texte</label><select value={blockProps.textShadow || 'none'} onChange={(e) => onUpdateBlock(selectedBlock.id, { textShadow: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"><option value="none">Aucune</option><option value="2px 2px 4px rgba(0,0,0,0.3)">Légère</option><option value="0px 0px 10px rgba(0,0,0,0.5)">Lueur</option><option value="4px 4px 8px rgba(0,0,0,0.4)">Forte</option></select></div>
                <div className="border-t border-gray-700 pt-3 mt-2"><label className="text-xs text-gray-400 block mb-1">Opacité du texte: {blockProps.textOpacity || 100}%</label><input type="range" min="0" max="100" value={blockProps.textOpacity || 100} onChange={(e) => onUpdateBlock(selectedBlock.id, { textOpacity: parseInt(e.target.value) })} className="w-full" /></div>
                
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Position du texte</label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map(pos => {
                      let xValue = pos === 'left' ? 15 : pos === 'center' ? 50 : 85;
                      return (
                        <button
                          key={pos}
                          onClick={() => {
                            const updates: any = {};
                            if (hasTitle) updates.titlePosition = { x: xValue, y: blockProps.titlePosition?.y || 30 };
                            if (hasSubtitle) updates.subtitlePosition = { x: xValue, y: blockProps.subtitlePosition?.y || 50 };
                            if (hasButton) updates.buttonPosition = { x: xValue, y: blockProps.buttonPosition?.y || 70 };
                            updates.textPosition = pos;
                            onUpdateBlock(selectedBlock.id, updates);
                          }}
                          className={`flex-1 py-1 rounded text-xs ${blockProps.textPosition === pos ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                          {pos === 'left' ? '← Gauche' : pos === 'center' ? '↔ Centre' : '→ Droite'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {!hasAnyTextVisible() && (
          <div className="text-center py-4 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400 text-xs mb-2">⚠️ Tous les textes sont masqués</p>
            <p className="text-gray-500 text-xs">Utilisez les boutons "Éléments visibles" ci-dessus pour réactiver le titre, le sous-titre ou le bouton</p>
          </div>
        )}
      </div>
    );
  }

  // ==================== POUR LES BLOCS TEXTE, TITRE, BOUTON ====================
  if (isBlockSelected && (isTextBlock || isTitleBlock || isButtonBlock) && target === 'text') {
    const blockProps = selectedBlock.props || {};
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          <button onClick={() => setActiveTab('fonts')} className={`flex-1 py-1 text-xs rounded ${activeTab === 'fonts' ? 'bg-primary text-white' : 'text-gray-400'}`}>📝 Police</button>
          <button onClick={() => setActiveTab('text-effects')} className={`flex-1 py-1 text-xs rounded ${activeTab === 'text-effects' ? 'bg-primary text-white' : 'text-gray-400'}`}>✨ Effets</button>
        </div>

        {activeTab === 'fonts' && (
          <>
            <div><label className="text-xs text-gray-400 block mb-1">Police</label><select value={blockProps.fontFamily || customization?.bodyFont || 'Inter'} onChange={(e) => onUpdateBlock(selectedBlock.id, { fontFamily: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fonts.map(font => (<option key={font} value={font}>{font}</option>))}</select></div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Taille: {blockProps.fontSize || 32}px</label>
              <input type="range" min="8" max="200" step="1" value={blockProps.fontSize || 32} onChange={(e) => onUpdateBlock(selectedBlock.id, { fontSize: parseInt(e.target.value) })} className="w-full" />
            </div>
            <div><label className="text-xs text-gray-400 block mb-1">Poids</label><select value={blockProps.fontWeight || '700'} onChange={(e) => onUpdateBlock(selectedBlock.id, { fontWeight: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs">{fontWeights.map(w => (<option key={w.value} value={w.value}>{w.label}</option>))}</select></div>
          </>
        )}

        {activeTab === 'text-effects' && (
          <>
            <div><label className="text-xs text-gray-400 block mb-1">Couleur</label><div className="flex items-center gap-2"><input type="color" value={blockProps.textColor || '#ffffff'} onChange={(e) => onUpdateBlock(selectedBlock.id, { textColor: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" value={blockProps.textColor || '#ffffff'} onChange={(e) => onUpdateBlock(selectedBlock.id, { textColor: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono" /></div></div>
            <div><label className="text-xs text-gray-400 block mb-1">Alignement</label><div className="flex gap-2">{['left', 'center', 'right'].map(align => (<button key={align} onClick={() => onUpdateBlock(selectedBlock.id, { textAlign: align })} className={`flex-1 py-1 rounded text-xs ${blockProps.textAlign === align ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}>{align === 'left' ? '← Gauche' : align === 'center' ? '↔ Centre' : '→ Droite'}</button>))}</div></div>
            <div><label className="text-xs text-gray-400 block mb-1">Opacité: {blockProps.textOpacity || 100}%</label><input type="range" min="0" max="100" value={blockProps.textOpacity || 100} onChange={(e) => onUpdateBlock(selectedBlock.id, { textOpacity: parseInt(e.target.value) })} className="w-full" /></div>
          </>
        )}
      </div>
    );
  }

  // ==================== RENDU NORMAL POUR LES AUTRES BLOCS ====================
  return (
    <div className="text-center py-8">
      <p className="text-gray-400 text-xs">Sélectionnez un élément pour modifier sa police</p>
    </div>
  );
}