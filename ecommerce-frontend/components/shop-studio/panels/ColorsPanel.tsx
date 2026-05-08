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
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');

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
        case 'button': return selectedBlock.props?.textColor || '#ffffff';
        case 'products': return selectedBlock.props?.titleColor || '#1F2937';
        case 'image': return selectedBlock.props?.backgroundColor || '#000000';
        default: return '#000000';
      }
    }
    if (isBlockSelected && target === 'background') {
      return selectedBlock.props?.backgroundColor || 
        (selectedBlock.type === 'banner' ? '#2563EB' : 
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
          className={`flex-1 py-1 text-xs rounded transition-colors ${
            activeTab === 'solid' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          🎨 Couleur unie
        </button>
        <button
          onClick={() => setActiveTab('gradient')}
          className={`flex-1 py-1 text-xs rounded transition-colors ${
            activeTab === 'gradient' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
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

          {/* ⭐ OPACITÉ DU TEXTE (quand target === 'text') */}
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

          {/* ⭐ OPACITÉ DU FOND (visible seulement pour le background) */}
          {(isCanvasSelected || (isBlockSelected && target === 'background')) && (
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
          )}

          {/* ⭐ Dégradés - visible pour le background */}
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

      {/* Dégradés - mode gradient */}
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

          {/* ⭐ OPACITÉ DU TEXTE (quand target === 'text') */}
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

          {/* ⭐ OPACITÉ DU FOND (visible seulement pour le background - même en mode dégradé) */}
          {(isCanvasSelected || (isBlockSelected && target === 'background')) && (
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
          )}
        </div>
      )}
    </div>
  );
}