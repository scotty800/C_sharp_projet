'use client';

import { useCallback, useMemo, useState } from 'react';

interface Props {
  selectedBlock: any;
  isBackgroundSelected: boolean;
  customization: any;
  onUpdateBlock: (id: string, updates: any) => void;
  onUpdateCustomization: (updates: any) => void;
  selectedTarget?: 'text' | 'background';
}

export default function ColorsPanel({ 
  selectedBlock, 
  isBackgroundSelected, 
  customization, 
  onUpdateBlock, 
  onUpdateCustomization,
  selectedTarget = 'text'
}: Props) {
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'carousel'>('solid');

  const gradients = [
    { name: 'Violet', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Rose', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Bleu', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Vert', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { name: 'Orange', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { name: 'Nuit', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  ];

  // ==================== SAVOIR CE QUI EST SÉLECTIONNÉ ====================
  
  const isCanvasSelected = isBackgroundSelected;
  const isBlockSelected = !isCanvasSelected && selectedBlock !== null;
  const target = selectedTarget;
  const isBanner = selectedBlock?.type === 'banner';
  const isCarousel = selectedBlock?.props?.isCarousel || false;
  const images = selectedBlock?.props?.images || [];

  // ==================== GESTIONNAIRES AVEC LOGS ====================
  
  const applySolidColor = useCallback((color: string) => {
    console.log('🟢🟢🟢 applySolidColor appelée avec:', color);
    console.log('🟢🟢🟢 isCanvasSelected:', isCanvasSelected);
    console.log('🟢🟢🟢 isBlockSelected:', isBlockSelected);
    console.log('🟢🟢🟢 target:', target);
    console.log('🟢🟢🟢 selectedBlock:', selectedBlock?.type);
    console.log('🟢🟢🟢 onUpdateCustomization existe?', !!onUpdateCustomization);
    console.log('🟢🟢🟢 onUpdateBlock existe?', !!onUpdateBlock);
    
    if (isCanvasSelected) {
      console.log('🟢🟢🟢 Appel de onUpdateCustomization (canvas) avec:', { 
        backgroundColor: color,
        backgroundType: 'solid',
        backgroundValue: null
      });
      onUpdateCustomization({ 
        backgroundColor: color,
        backgroundType: 'solid',
        backgroundValue: null
      });
    } else if (isBlockSelected) {
      if (target === 'text') {
        console.log('🟢🟢🟢 Cible: TEXTE du bloc');
        const updates: any = {};
        switch (selectedBlock.type) {
          case 'text': updates.textColor = color; updates.textGradient = null; break;
          case 'title': updates.textColor = color; updates.textGradient = null; break;
          case 'banner': updates.titleColor = color; updates.titleGradient = null; break;
          case 'screen-banner': updates.titleColor = color; updates.titleGradient = null; break;
          case 'carousel-banner': updates.titleColor = color; updates.titleGradient = null; break;
          case 'button': updates.textColor = color; updates.textGradient = null; break;
          case 'products': updates.titleColor = color; updates.titleGradient = null; break;
          default: updates.textColor = color;
        }
        console.log('🟢🟢🟢 Appel de onUpdateBlock avec updates:', updates);
        onUpdateBlock(selectedBlock.id, updates);
      } else if (target === 'background') {
        console.log('🟢🟢🟢 Cible: BACKGROUND du bloc');
        console.log('🟢🟢🟢 Appel de onUpdateBlock avec:', { 
          backgroundColor: color,
          backgroundType: 'solid',
          backgroundValue: null
        });
        onUpdateBlock(selectedBlock.id, { 
          backgroundColor: color,
          backgroundType: 'solid',
          backgroundValue: null
        });
      }
    } else {
      console.log('🟢🟢🟢 Aucune cible valide - aucun appel effectué');
    }
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, onUpdateBlock, onUpdateCustomization]);

  const applyGradient = useCallback((gradient: string) => {
    console.log('🌈🌈🌈 applyGradient appelée avec:', gradient);
    console.log('🌈🌈🌈 isCanvasSelected:', isCanvasSelected);
    console.log('🌈🌈🌈 isBlockSelected:', isBlockSelected);
    console.log('🌈🌈🌈 target:', target);
    
    if (isCanvasSelected) {
      console.log('🌈🌈🌈 Appel de onUpdateCustomization (canvas) avec:', { 
        backgroundType: 'gradient',
        backgroundValue: gradient,
        backgroundColor: null
      });
      onUpdateCustomization({ 
        backgroundType: 'gradient',
        backgroundValue: gradient,
        backgroundColor: null
      });
    } else if (isBlockSelected) {
      if (target === 'text') {
        console.log('🌈🌈🌈 Cible: TEXTE du bloc');
        const updates: any = {};
        switch (selectedBlock.type) {
          case 'text': updates.textGradient = gradient; updates.textColor = null; break;
          case 'title': updates.textGradient = gradient; updates.textColor = null; break;
          case 'banner': updates.titleGradient = gradient; updates.titleColor = null; break;
          case 'screen-banner': updates.titleGradient = gradient; updates.titleColor = null; break;
          case 'carousel-banner': updates.titleGradient = gradient; updates.titleColor = null; break;
          case 'button': updates.textGradient = gradient; updates.textColor = null; break;
          case 'products': updates.titleGradient = gradient; updates.titleColor = null; break;
          default: updates.textGradient = gradient;
        }
        console.log('🌈🌈🌈 Appel de onUpdateBlock avec updates:', updates);
        onUpdateBlock(selectedBlock.id, updates);
      } else if (target === 'background') {
        console.log('🌈🌈🌈 Cible: BACKGROUND du bloc');
        console.log('🌈🌈🌈 Appel de onUpdateBlock avec:', { 
          backgroundType: 'gradient',
          backgroundValue: gradient,
          backgroundColor: null
        });
        onUpdateBlock(selectedBlock.id, { 
          backgroundType: 'gradient',
          backgroundValue: gradient,
          backgroundColor: null
        });
      }
    } else {
      console.log('🌈🌈🌈 Aucune cible valide - aucun appel effectué');
    }
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, onUpdateBlock, onUpdateCustomization]);

  // ==================== VALEURS ACTUELLES ====================
  
  const currentSolidColor = useMemo(() => {
    if (isCanvasSelected) {
      return customization?.backgroundColor || '#ffffff';
    }
    if (isBlockSelected && target === 'text') {
      switch (selectedBlock.type) {
        case 'text': return selectedBlock.props?.textColor || '#000000';
        case 'title': return selectedBlock.props?.textColor || '#000000';
        case 'banner': return selectedBlock.props?.titleColor || '#ffffff';
        case 'screen-banner': return selectedBlock.props?.titleColor || '#ffffff';
        case 'carousel-banner': return selectedBlock.props?.titleColor || '#ffffff';
        case 'button': return selectedBlock.props?.textColor || '#ffffff';
        case 'products': return selectedBlock.props?.titleColor || '#1F2937';
        case 'image': return selectedBlock.props?.backgroundColor || '#000000';
        default: return '#000000';
      }
    }
    if (isBlockSelected && target === 'background') {
      return selectedBlock.props?.backgroundColor || 
        (selectedBlock.type === 'banner' ? '#2563EB' : 
         selectedBlock.type === 'screen-banner' ? '#1e1e2f' :
         selectedBlock.type === 'carousel-banner' ? '#1e1e2f' :
         selectedBlock.type === 'button' ? '#2563EB' : 
         selectedBlock.type === 'image' ? '#f3f4f6' : '#ffffff');
    }
    return '#000000';
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, customization]);

  const currentGradient = useMemo(() => {
    if (isCanvasSelected) {
      return customization?.backgroundValue;
    }
    if (isBlockSelected && target === 'text') {
      switch (selectedBlock.type) {
        case 'text': return selectedBlock.props?.textGradient;
        case 'title': return selectedBlock.props?.textGradient;
        case 'banner': return selectedBlock.props?.titleGradient;
        case 'screen-banner': return selectedBlock.props?.titleGradient;
        case 'carousel-banner': return selectedBlock.props?.titleGradient;
        case 'button': return selectedBlock.props?.textGradient;
        case 'products': return selectedBlock.props?.titleGradient;
        default: return null;
      }
    }
    if (isBlockSelected && target === 'background') {
      return selectedBlock.props?.backgroundValue;
    }
    return null;
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, customization]);

  const isGradientActive = currentGradient !== null && currentGradient !== undefined;

  // ==================== OPACITÉ ====================
  
  const currentBackgroundOpacity = useMemo(() => {
    if (isCanvasSelected) {
      return customization?.backgroundOpacity !== undefined ? customization.backgroundOpacity : 100;
    }
    if (isBlockSelected && target === 'background') {
      return selectedBlock.props?.opacity !== undefined ? selectedBlock.props.opacity : 100;
    }
    return 100;
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, customization]);

  const currentTextOpacity = useMemo(() => {
    if (isBlockSelected && target === 'text') {
      return selectedBlock.props?.textOpacity !== undefined ? selectedBlock.props.textOpacity : 100;
    }
    return 100;
  }, [isBlockSelected, target, selectedBlock]);

  const handleBackgroundOpacityChange = useCallback((opacity: number) => {
    console.log('📊 handleBackgroundOpacityChange:', opacity);
    if (isCanvasSelected) {
      onUpdateCustomization({ backgroundOpacity: opacity });
    } else if (isBlockSelected && target === 'background') {
      onUpdateBlock(selectedBlock.id, { opacity });
    }
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, onUpdateBlock, onUpdateCustomization]);

  const handleTextOpacityChange = useCallback((opacity: number) => {
    console.log('📊 handleTextOpacityChange:', opacity);
    if (isBlockSelected && target === 'text') {
      onUpdateBlock(selectedBlock.id, { textOpacity: opacity });
    }
  }, [isBlockSelected, target, selectedBlock, onUpdateBlock]);

  // ==================== TITRE DYNAMIQUE ====================
  
  const getTitle = () => {
    if (isCanvasSelected) return 'Fond du canvas';
    if (target === 'text') return `Couleur du texte (${selectedBlock?.type})`;
    if (target === 'background') return `Couleur de fond (${selectedBlock?.type})`;
    return 'Couleurs';
  };

  // ==================== RENDU ====================
  
  if (!isCanvasSelected && !isBlockSelected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-xs">Sélectionnez un élément pour modifier ses couleurs</p>
      </div>
    );
  }

  // ⭐ POUR LE BLOC BANNER AVEC FOND
  if (isBanner && target === 'background') {
    return (
      <div className="space-y-3">
        {/* Titre */}
        <h3 className="text-white font-semibold text-sm">{getTitle()}</h3>

        {/* Onglets: Couleur unie / Dégradé / Carrousel */}
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('solid')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'solid' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            🎨 Couleur unie
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'gradient' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            🌈 Dégradé
          </button>
          <button
            onClick={() => setActiveTab('carousel')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'carousel' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            🎠 Carrousel
          </button>
        </div>

        {/* ==================== ONGLET COULEUR UNIE ==================== */}
        {activeTab === 'solid' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Couleur de fond</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentSolidColor}
                  onChange={(e) => applySolidColor(e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={currentSolidColor}
                  onChange={(e) => applySolidColor(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Opacité du fond: {currentBackgroundOpacity}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={currentBackgroundOpacity}
                onChange={(e) => handleBackgroundOpacityChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Opacité overlay: {selectedBlock.props?.overlayOpacity || 30}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedBlock.props?.overlayOpacity || 30}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { overlayOpacity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* ==================== ONGLET DÉGRADÉ ==================== */}
        {activeTab === 'gradient' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Dégradés pour le fond</label>
              <div className="grid grid-cols-2 gap-1">
                {gradients.map((grad, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyGradient(grad.value)}
                    className={`h-10 rounded border transition-all hover:scale-105 ${
                      isGradientActive && currentGradient === grad.value
                        ? 'border-primary ring-1 ring-primary'
                        : 'border-gray-700'
                    }`}
                    style={{ background: grad.value }}
                    title={grad.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Opacité du fond: {currentBackgroundOpacity}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={currentBackgroundOpacity}
                onChange={(e) => handleBackgroundOpacityChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Opacité overlay: {selectedBlock.props?.overlayOpacity || 30}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedBlock.props?.overlayOpacity || 30}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { overlayOpacity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* ==================== ONGLET CARROUSEL ==================== */}
        {activeTab === 'carousel' && (
          <div className="space-y-3">
            {/* BOUTON ACTIVER CARROUSEL */}
            {!isCarousel && (
              <button
                onClick={() => {
                  onUpdateBlock(selectedBlock.id, { 
                    isCarousel: true, 
                    images: [
                      { url: 'https://picsum.photos/1200/500?random=1', alt: 'Image 1' },
                      { url: 'https://picsum.photos/1200/500?random=2', alt: 'Image 2' },
                      { url: 'https://picsum.photos/1200/500?random=3', alt: 'Image 3' }
                    ] 
                  });
                  setActiveTab('carousel');
                }}
                className="w-full py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🎠 Activer le carrousel
              </button>
            )}

            {/* CONTENU CARROUSEL */}
            {isCarousel && (
              <>
                <div className="flex justify-between items-center">
                  <h4 className="text-white text-xs font-semibold">Images du carrousel</h4>
                  <button
                    onClick={() => onUpdateBlock(selectedBlock.id, { isCarousel: false, images: [] })}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    ✕ Désactiver
                  </button>
                </div>

                {/* Gestion des images */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {images.map((img: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                      <div className="w-12 h-12 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                        <img 
                          src={img.url || 'https://picsum.photos/50/50'} 
                          alt={img.alt} 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/50/50'; }}
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={img.url || ''}
                          onChange={(e) => {
                            const newImages = [...images];
                            newImages[idx] = { ...img, url: e.target.value };
                            onUpdateBlock(selectedBlock.id, { images: newImages });
                          }}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                          placeholder="URL de l'image"
                        />
                        <input
                          type="text"
                          value={img.alt || ''}
                          onChange={(e) => {
                            const newImages = [...images];
                            newImages[idx] = { ...img, alt: e.target.value };
                            onUpdateBlock(selectedBlock.id, { images: newImages });
                          }}
                          className="w-full mt-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                          placeholder="Texte alternatif"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newImages = images.filter((_: any, i: number) => i !== idx);
                          onUpdateBlock(selectedBlock.id, { images: newImages });
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    const newImages = [...images, { url: `https://picsum.photos/1200/500?random=${images.length + 1}`, alt: 'Nouvelle image' }];
                    onUpdateBlock(selectedBlock.id, { images: newImages });
                  }}
                  className="w-full py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white flex items-center justify-center gap-1"
                >
                  + Ajouter une image
                </button>

                {/* Options du carrousel */}
                <div className="border-t border-gray-700 pt-3 mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Défilement automatique</label>
                    <input 
                      type="checkbox" 
                      checked={selectedBlock.props?.autoPlay !== false} 
                      onChange={(e) => onUpdateBlock(selectedBlock.id, { autoPlay: e.target.checked })} 
                    />
                  </div>
                  
                  {selectedBlock.props?.autoPlay !== false && (
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Intervalle: {selectedBlock.props?.intervalTime || 5000}ms</label>
                      <input 
                        type="range" 
                        min="1000" 
                        max="10000" 
                        step="500" 
                        value={selectedBlock.props?.intervalTime || 5000} 
                        onChange={(e) => onUpdateBlock(selectedBlock.id, { intervalTime: parseInt(e.target.value) })} 
                        className="w-full" 
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Afficher les flèches</label>
                    <input 
                      type="checkbox" 
                      checked={selectedBlock.props?.showArrows !== false} 
                      onChange={(e) => onUpdateBlock(selectedBlock.id, { showArrows: e.target.checked })} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Afficher les points</label>
                    <input 
                      type="checkbox" 
                      checked={selectedBlock.props?.showDots !== false} 
                      onChange={(e) => onUpdateBlock(selectedBlock.id, { showDots: e.target.checked })} 
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Effet de transition</label>
                    <select
                      value={selectedBlock.props?.transitionEffect || 'fade'}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, { transitionEffect: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value="fade">Fondu (fade)</option>
                      <option value="slide">Glissement (slide)</option>
                    </select>
                  </div>
                </div>

                {/* Indicateur du nombre d'images */}
                <div className="text-center text-xs text-gray-500">
                  {images.length} image(s) dans le carrousel
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ⭐ RENDU NORMAL POUR TOUS LES AUTRES CAS
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold text-sm">{getTitle()}</h3>
        <span className="text-xs text-gray-500">
          {isGradientActive ? 'Dégradé' : 'Couleur unie'}
        </span>
      </div>

      {/* Onglets Couleur unie / Dégradé */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('solid')}
          className={`flex-1 py-1 text-xs rounded ${activeTab === 'solid' ? 'bg-primary text-white' : 'text-gray-400'}`}
        >
          🎨 Couleur unie
        </button>
        <button
          onClick={() => setActiveTab('gradient')}
          className={`flex-1 py-1 text-xs rounded ${activeTab === 'gradient' ? 'bg-primary text-white' : 'text-gray-400'}`}
        >
          🌈 Dégradé
        </button>
      </div>

      {/* Couleur unie */}
      {activeTab === 'solid' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              {target === 'text' ? 'Couleur du texte' : 'Couleur'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentSolidColor}
                onChange={(e) => applySolidColor(e.target.value)}
                className="w-8 h-8 rounded border-0 cursor-pointer"
              />
              <input
                type="text"
                value={currentSolidColor}
                onChange={(e) => applySolidColor(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
              />
            </div>
            {isGradientActive && (
              <p className="text-xs text-green-400 mt-1">✓ Dégradé actif - cliquez sur une couleur unie pour le remplacer</p>
            )}
          </div>

          {target === 'text' && (
            <div className="border-t border-gray-700 pt-3 mt-2">
              <label className="text-xs text-gray-400 block mb-1">Opacité du texte: {currentTextOpacity}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={currentTextOpacity}
                onChange={(e) => handleTextOpacityChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {(isCanvasSelected || (isBlockSelected && target === 'background')) && (
            <div>
              <label className="text-xs text-gray-400 block mb-1">Dégradés</label>
              <div className="grid grid-cols-2 gap-1">
                {gradients.map((grad, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyGradient(grad.value)}
                    className={`h-8 rounded border transition-all hover:scale-105 ${
                      isGradientActive && currentGradient === grad.value
                        ? 'border-primary ring-1 ring-primary'
                        : 'border-gray-700'
                    }`}
                    style={{ background: grad.value }}
                    title={grad.name}
                  />
                ))}
              </div>
              <button
                onClick={() => applySolidColor(currentSolidColor)}
                className="w-full mt-2 text-xs text-gray-400 hover:text-white"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dégradé */}
      {activeTab === 'gradient' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              {target === 'text' ? 'Dégradés pour le texte' : 'Dégradés'}
            </label>
            <div className="grid grid-cols-2 gap-1">
              {gradients.map((grad, idx) => (
                <button
                  key={idx}
                  onClick={() => applyGradient(grad.value)}
                  className={`h-10 rounded border transition-all hover:scale-105 ${
                    isGradientActive && currentGradient === grad.value
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-gray-700'
                  }`}
                  style={{ background: grad.value }}
                  title={grad.name}
                />
              ))}
            </div>
            {!isGradientActive && (
              <p className="text-xs text-blue-400 mt-1">✓ Couleur unie active - cliquez sur un dégradé pour le remplacer</p>
            )}
            <button
              onClick={() => applySolidColor(currentSolidColor)}
              className="w-full mt-2 text-xs text-gray-400 hover:text-white"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Options de bordure pour screen-banner */}
      {selectedBlock?.type === 'screen-banner' && target === 'background' && (
        <div className="border-t border-gray-700 pt-3 mt-2 space-y-3">
          <h4 className="text-white text-xs font-semibold">🎨 Bordure</h4>
          
          <div>
            <label className="text-xs text-gray-400 block mb-1">Épaisseur: {selectedBlock.props?.borderWidth || 4}px</label>
            <input
              type="range"
              min="0"
              max="20"
              value={selectedBlock.props?.borderWidth || 4}
              onChange={(e) => onUpdateBlock(selectedBlock.id, { borderWidth: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 block mb-1">Couleur de la bordure</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedBlock.props?.borderColor || '#ffffff'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { borderColor: e.target.value })}
                className="w-8 h-8 rounded border-0 cursor-pointer"
              />
              <input
                type="text"
                value={selectedBlock.props?.borderColor || '#ffffff'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { borderColor: e.target.value })}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-400 block mb-1">Arrondi: {selectedBlock.props?.borderRadius || 16}px</label>
            <input
              type="range"
              min="0"
              max="50"
              value={selectedBlock.props?.borderRadius || 16}
              onChange={(e) => onUpdateBlock(selectedBlock.id, { borderRadius: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}