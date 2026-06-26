// components/studio/panels/ProductCustomizationSidebar.tsx

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  FiDroplet, FiZap, FiAward, FiStar, FiClock, 
  FiImage, FiBox, FiFilm, FiSliders, FiX, FiLayers, FiGlobe, FiCheck
} from 'react-icons/fi';
import { ProductCustomization, SlideCustomization } from '@/types/studio';

interface Props {
  productId: number;
  productName: string;
  customization: ProductCustomization;
  onUpdate: (updates: Partial<ProductCustomization>) => void;
  onClose: () => void;
  slideCount?: number;
}

// Backgrounds prédéfinis
const PRESET_BACKGROUNDS = [
  { id: 'white', name: 'Blanc', type: 'solid', value: '#FFFFFF' },
  { id: 'gray', name: 'Gris clair', type: 'solid', value: '#F3F4F6' },
  { id: 'black', name: 'Noir', type: 'solid', value: '#111827' },
  { id: 'gradient-1', name: 'Sunset', type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-2', name: 'Ocean', type: 'gradient', value: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)' },
  { id: 'gradient-3', name: 'Fire', type: 'gradient', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  { id: '3d-1', name: 'Papier', type: '3d', value: 'paper' },
  { id: '3d-2', name: 'Métal', type: '3d', value: 'metal' },
  { id: '3d-3', name: 'Verre', type: '3d', value: 'glass' },
  { id: '3d-4', name: 'Bois', type: '3d', value: 'wood' },
];

// Badges prédéfinis (gardés pour le mode global)
const PRESET_BADGES = [
  { id: 'sale', text: 'SALE -20%', bg: '#EF4444', color: '#FFFFFF' },
  { id: 'new', text: 'NOUVEAU', bg: '#10B981', color: '#FFFFFF' },
  { id: 'exclusive', text: 'EXCLUSIF', bg: '#8B5CF6', color: '#FFFFFF' },
  { id: 'limited', text: 'LIMITED', bg: '#F59E0B', color: '#FFFFFF' },
  { id: 'bestseller', text: '⭐ BEST-SELLER', bg: '#3B82F6', color: '#FFFFFF' },
];

// Petit composant interne : libellé de section, style "My favorites"
function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{children}</span>
      {action}
    </div>
  );
}

export default function ProductCustomizationSidebar({
  productId,
  productName,
  customization,
  onUpdate,
  onClose,
  slideCount,
}: Props) {
  const [activeTab, setActiveTab] = useState<'background' | 'badge' | 'hover' | 'featured' | 'animation'>('background');
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [gradientAngle, setGradientAngle] = useState(135);
  const [gradientColors, setGradientColors] = useState(['#667eea', '#764ba2']);

  // États pour le mode slide
  const [slideMode, setSlideMode] = useState<'global' | 'per-slide'>('global');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const current = customization;

  // Configuration active basée sur le mode
  const activeSlideConfig: ProductCustomization =
    slideMode === 'per-slide'
      ? { ...current, ...(current.slidesConfig?.[activeSlideIndex] || {}) }
      : current;

  // Fonction de mise à jour pour les champs qui ne sont pas background (badge, hover, etc.)
  const updateActiveField = (field: keyof ProductCustomization, value: any) => {
    if (slideMode === 'global') {
      onUpdate({ [field]: value });
    } else {
      const existing = current.slidesConfig?.[activeSlideIndex] || {};
      onUpdate({
        slidesConfig: {
          ...current.slidesConfig,
          [activeSlideIndex]: { ...existing, [field]: value },
        },
      });
    }
  };

  // Réinitialiser une slide
  const resetSlide = (index: number) => {
    const newConfig = { ...(current.slidesConfig || {}) };
    delete newConfig[index];
    onUpdate({ slidesConfig: newConfig });
  };

  // Vérifier si une slide a des surcharges
  const slideHasOverrides = (index: number) =>
    !!current.slidesConfig?.[index] &&
    Object.keys(current.slidesConfig[index]).length > 0;

  // ⭐ Gestionnaire d'upload d'image
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }
    
    setImageUploading(true);
    
    try {
      const localUrl = URL.createObjectURL(file);
      
      if (slideMode === 'global') {
        onUpdate({ 
          backgroundImage: localUrl,
          backgroundType: 'image' 
        });
      } else {
        const existing = current.slidesConfig?.[activeSlideIndex] || {};
        onUpdate({
          slidesConfig: {
            ...current.slidesConfig,
            [activeSlideIndex]: { 
              ...existing, 
              backgroundImage: localUrl,
              backgroundType: 'image' 
            },
          },
        });
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Erreur upload image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setImageUploading(false);
    }
  }, [slideMode, activeSlideIndex, current.slidesConfig, onUpdate]);

  // ⭐ Gestionnaire de dégradé personnalisé
  const handleGradientChange = useCallback(() => {
    const gradient = `linear-gradient(${gradientAngle}deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`;
    
    if (slideMode === 'global') {
      onUpdate({ 
        backgroundGradient: gradient,
        backgroundType: 'gradient' 
      });
    } else {
      const existing = current.slidesConfig?.[activeSlideIndex] || {};
      onUpdate({
        slidesConfig: {
          ...current.slidesConfig,
          [activeSlideIndex]: { 
            ...existing, 
            backgroundGradient: gradient,
            backgroundType: 'gradient' 
          },
        },
      });
    }
    
    setShowGradientPicker(false);
  }, [gradientAngle, gradientColors, slideMode, activeSlideIndex, current.slidesConfig, onUpdate]);

  // ⭐ Fonction pour ouvrir le sélecteur d'image (uniquement pour le bouton upload)
  const openImagePicker = () => {
    fileInputRef.current?.click();
  };

  // ⭐ Liste des onglets disponibles selon le mode - BADGE SUPPRIMÉ EN MODE PER-SLIDE
  const availableTabs = slideMode === 'global'
    ? [
        { id: 'background', label: 'Fond', icon: FiDroplet },
        { id: 'badge', label: 'Badge', icon: FiAward },
        { id: 'hover', label: 'Survol', icon: FiZap },
        { id: 'featured', label: 'Vedette', icon: FiStar },
        { id: 'animation', label: 'Animation', icon: FiClock },
      ]
    : [
        { id: 'background', label: 'Fond', icon: FiDroplet },
        // ⭐ Le badge n'est plus disponible en mode per-slide
      ];

  return (
    <div className="h-full flex flex-col bg-[#0d0e14] text-gray-200">
      {/* ⭐ INPUT FILE - Déclaré une seule fois en dehors de toute condition */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* En-tête */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5 sticky top-0 z-10 bg-[#0d0e14]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <FiZap size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white text-sm font-semibold leading-tight truncate">Personnalisation</h3>
              <p className="text-gray-500 text-xs truncate">{productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <FiX size={14} />
          </button>
        </div>

        {slideCount && slideCount > 1 && (
          <div className="mt-3 flex gap-1 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => { setSlideMode('global'); setActiveTab('background'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                slideMode === 'global' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <FiGlobe size={12} /> Global
            </button>
            <button
              onClick={() => { setSlideMode('per-slide'); setActiveTab('background'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                slideMode === 'per-slide' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <FiLayers size={12} /> Par slide
            </button>
          </div>
        )}

        {slideMode === 'per-slide' && slideCount && slideCount > 1 && (
          <div className="mt-2 flex gap-1 flex-wrap items-center">
            {Array.from({ length: slideCount }, (_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlideIndex(i)}
                className={`relative px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeSlideIndex === i ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500 hover:text-gray-300'
                }`}
              >
                {i + 1}
                {slideHasOverrides(i) && <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full" />}
              </button>
            ))}
            {slideHasOverrides(activeSlideIndex) && (
              <button
                onClick={() => resetSlide(activeSlideIndex)}
                className="px-2 py-1 rounded-lg text-xs text-gray-500 hover:text-red-400 bg-white/5 transition-colors ml-auto"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Indicateur de mode slide */}
      {slideMode === 'per-slide' && slideCount && slideCount > 1 && (
        <div className="flex items-center gap-2 px-3 py-2 mx-4 mt-3 rounded-lg bg-white/5 text-xs text-gray-400">
          <FiLayers size={12} className="text-purple-400" />
          <span>Slide {activeSlideIndex + 1} — fond uniquement</span>
          {!slideHasOverrides(activeSlideIndex) && <span className="ml-auto text-gray-600 italic">Hérite du global</span>}
        </div>
      )}

      {/* Navigation verticale */}
      <div className="px-3 py-3 space-y-0.5 border-b border-white/5">
        {availableTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <tab.icon size={15} className={activeTab === tab.id ? 'text-primary' : 'text-gray-500'} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Panel Background */}
        {activeTab === 'background' && (
          <div className="space-y-5">
            <div>
              <SectionLabel>Type de fond</SectionLabel>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { type: 'solid', icon: FiDroplet, label: 'Couleur' },
                  { type: 'gradient', icon: FiSliders, label: 'Dégradé' },
                  { type: 'image', icon: FiImage, label: 'Image' },
                  { type: '3d', icon: FiBox, label: '3D' },
                  { type: 'transparent', icon: FiFilm, label: 'Transp.' },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (slideMode === 'global') {
                        onUpdate({ backgroundType: type as any });
                      } else {
                        const existing = current.slidesConfig?.[activeSlideIndex] || {};
                        onUpdate({
                          slidesConfig: {
                            ...current.slidesConfig,
                            [activeSlideIndex]: { ...existing, backgroundType: type as any },
                          },
                        });
                      }
                    }}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                      activeSlideConfig.backgroundType === type
                        ? 'bg-white/10 text-white'
                        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                    }`}
                  >
                    <Icon size={15} className={activeSlideConfig.backgroundType === type ? 'text-primary' : ''} />
                    <span className="text-[10px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SOLID */}
            {activeSlideConfig.backgroundType === 'solid' && (
              <div>
                <SectionLabel>Couleurs prédéfinies</SectionLabel>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {PRESET_BACKGROUNDS.filter(b => b.type === 'solid').map(bg => {
                    const selected = activeSlideConfig.backgroundColor === bg.value;
                    return (
                      <button
                        key={bg.id}
                        onClick={() => {
                          if (slideMode === 'global') {
                            onUpdate({ backgroundColor: bg.value });
                          } else {
                            const existing = current.slidesConfig?.[activeSlideIndex] || {};
                            onUpdate({
                              slidesConfig: {
                                ...current.slidesConfig,
                                [activeSlideIndex]: { ...existing, backgroundColor: bg.value },
                              },
                            });
                          }
                        }}
                        className="group flex flex-col items-center gap-1.5"
                      >
                        <span
                          className={`relative w-full h-10 rounded-xl border flex items-center justify-center ${
                            selected ? 'border-primary ring-2 ring-primary/30' : 'border-white/10'
                          }`}
                          style={{ backgroundColor: bg.value }}
                        >
                          {selected && (
                            <FiCheck size={14} className={bg.value === '#FFFFFF' ? 'text-gray-800' : 'text-white'} />
                          )}
                        </span>
                        <span className="text-[11px] text-gray-500 group-hover:text-gray-300">{bg.name}</span>
                      </button>
                    );
                  })}
                </div>
                <SectionLabel>Couleur personnalisée</SectionLabel>
                <div className="flex gap-3 items-center bg-white/5 rounded-xl p-2">
                  <input
                    type="color"
                    value={activeSlideConfig.backgroundColor || '#FFFFFF'}
                    onChange={(e) => updateActiveField('backgroundColor', e.target.value)}
                    className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                  <div className="flex-1 h-6 rounded-lg" style={{ backgroundColor: activeSlideConfig.backgroundColor || '#FFFFFF' }} />
                </div>
              </div>
            )}

            {/* GRADIENT */}
            {activeSlideConfig.backgroundType === 'gradient' && (
              <div>
                <SectionLabel>Dégradés prédéfinis</SectionLabel>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {PRESET_BACKGROUNDS.filter(b => b.type === 'gradient').map(bg => {
                    const selected = activeSlideConfig.backgroundGradient === bg.value;
                    return (
                      <button
                        key={bg.id}
                        onClick={() => {
                          if (slideMode === 'global') {
                            onUpdate({ 
                              backgroundGradient: bg.value,
                              backgroundType: 'gradient' 
                            });
                          } else {
                            const existing = current.slidesConfig?.[activeSlideIndex] || {};
                            onUpdate({
                              slidesConfig: {
                                ...current.slidesConfig,
                                [activeSlideIndex]: { 
                                  ...existing, 
                                  backgroundGradient: bg.value,
                                  backgroundType: 'gradient' 
                                },
                              },
                            });
                          }
                        }}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <span
                          className={`relative w-full h-12 rounded-xl border flex items-center justify-center ${
                            selected ? 'border-primary ring-2 ring-primary/30' : 'border-white/10'
                          }`}
                          style={{ background: bg.value }}
                        >
                          {selected && <FiCheck size={14} className="text-white" />}
                        </span>
                        <span className="text-[11px] text-gray-500">{bg.name}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowGradientPicker(!showGradientPicker)}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <FiSliders size={14} /> Créer un dégradé personnalisé
                </button>
                {showGradientPicker && (
                  <div className="mt-3 p-3 bg-white/5 rounded-xl space-y-3">
                    <div>
                      <label className="text-gray-500 text-xs">Angle: {gradientAngle}°</label>
                      <input type="range" min="0" max="360" value={gradientAngle} onChange={(e) => setGradientAngle(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div className="flex gap-2">
                      <input type="color" value={gradientColors[0]} onChange={(e) => setGradientColors([e.target.value, gradientColors[1]])} className="flex-1 h-8 rounded-lg" />
                      <input type="color" value={gradientColors[1]} onChange={(e) => setGradientColors([gradientColors[0], e.target.value])} className="flex-1 h-8 rounded-lg" />
                    </div>
                    <button onClick={handleGradientChange} className="w-full py-1.5 bg-primary text-white rounded-xl text-xs font-medium">Appliquer</button>
                  </div>
                )}
              </div>
            )}

            {/* IMAGE */}
            {activeSlideConfig.backgroundType === 'image' && (
              <div>
                <button 
                  onClick={openImagePicker}
                  disabled={imageUploading} 
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  {imageUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>📷 {activeSlideConfig.backgroundImage ? 'Changer l\'image' : 'Uploader une image'}</>
                  )}
                </button>
                {activeSlideConfig.backgroundImage && (
                  <div className="mt-2 relative h-20 rounded-xl overflow-hidden border border-white/10">
                    <img 
                      src={activeSlideConfig.backgroundImage} 
                      alt="Background" 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      onClick={() => {
                        if (slideMode === 'global') {
                          onUpdate({ backgroundImage: undefined, backgroundType: 'solid', backgroundColor: '#FFFFFF' });
                        } else {
                          const existing = current.slidesConfig?.[activeSlideIndex] || {};
                          const { backgroundImage, ...rest } = existing;
                          onUpdate({
                            slidesConfig: {
                              ...current.slidesConfig,
                              [activeSlideIndex]: { ...rest, backgroundType: 'solid', backgroundColor: '#FFFFFF' },
                            },
                          });
                        }
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3D */}
            {activeSlideConfig.backgroundType === '3d' && (
              <div>
                <SectionLabel>Styles 3D</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_BACKGROUNDS.filter(b => b.type === '3d').map(bg => {
                    const selected = activeSlideConfig.backgroundValue === bg.value && activeSlideConfig.backgroundType === '3d';
                    return (
                      <button
                        key={bg.id}
                        onClick={() => {
                          if (slideMode === 'global') {
                            onUpdate({ 
                              backgroundValue: bg.value,
                              backgroundType: '3d' 
                            });
                          } else {
                            const existing = current.slidesConfig?.[activeSlideIndex] || {};
                            onUpdate({
                              slidesConfig: {
                                ...current.slidesConfig,
                                [activeSlideIndex]: { 
                                  ...existing, 
                                  backgroundValue: bg.value,
                                  backgroundType: '3d' 
                                },
                              },
                            });
                          }
                        }}
                        className={`p-2.5 rounded-xl text-center transition-colors border ${
                          selected ? 'border-primary bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className={`relative w-full h-12 rounded-lg mb-2 ${
                          bg.value === 'paper' ? 'bg-3d-paper' :
                          bg.value === 'metal' ? 'bg-3d-metal' :
                          bg.value === 'glass' ? 'bg-3d-glass' :
                          'bg-3d-wood'
                        }`}>
                          {selected && (
                            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <FiCheck size={10} className="text-white" />
                            </span>
                          )}
                        </div>
                        <span className="text-gray-300 text-xs">{bg.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 text-xs">Opacité: {activeSlideConfig.backgroundOpacity || 100}%</label>
                <input type="range" min="0" max="100" value={activeSlideConfig.backgroundOpacity || 100} onChange={(e) => updateActiveField('backgroundOpacity', parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-gray-500 text-xs">Flou: {activeSlideConfig.backgroundBlur || 0}px</label>
                <input type="range" min="0" max="20" value={activeSlideConfig.backgroundBlur || 0} onChange={(e) => updateActiveField('backgroundBlur', parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>

            {/* SECTION BORDURE & OMBRE - UNIQUEMENT EN MODE GLOBAL */}
            {slideMode === 'global' && (
              <div className="border-t border-white/5 pt-4">
                <SectionLabel>Bordure & ombre</SectionLabel>
                
                <div className="mb-3">
                  <label className="text-gray-500 text-xs">Épaisseur: {activeSlideConfig.frameWidth || 2}px</label>
                  <input type="range" min="0" max="10" value={activeSlideConfig.frameWidth || 2} onChange={(e) => updateActiveField('frameWidth', parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                
                <div className="mb-3">
                  <label className="text-gray-500 text-xs block mb-1">Couleur de la bordure</label>
                  <input type="color" value={activeSlideConfig.frameColor || '#E5E7EB'} onChange={(e) => updateActiveField('frameColor', e.target.value)} className="w-full h-8 rounded-lg" />
                </div>
                
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-gray-300 text-sm">Ombre du cadre</span>
                  <input type="checkbox" checked={activeSlideConfig.frameShadow ?? true} onChange={(e) => updateActiveField('frameShadow', e.target.checked)} className="toggle" />
                </label>
                
                {activeSlideConfig.frameShadow && (
                  <div className="mt-2">
                    <label className="text-gray-500 text-xs block mb-1">Couleur de l'ombre</label>
                    <input type="color" value={activeSlideConfig.frameShadowColor || '#00000020'} onChange={(e) => updateActiveField('frameShadowColor', e.target.value)} className="w-full h-8 rounded-lg" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Panel Badge - UNIQUEMENT EN MODE GLOBAL */}
        {slideMode === 'global' && activeTab === 'badge' && (
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300 text-sm">Afficher un badge</span>
              <input type="checkbox" checked={!!activeSlideConfig.badge} onChange={(e) => updateActiveField('badge', e.target.checked ? { text: 'PROMO', backgroundColor: '#EF4444', textColor: '#FFFFFF', position: 'top-right', fontSize: 12, borderRadius: 4, animation: 'none' } : undefined)} className="toggle" />
            </label>

            {activeSlideConfig.badge && (
              <>
                <div>
                  <SectionLabel>Badges prédéfinis</SectionLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_BADGES.map(badge => (
                      <button key={badge.id} onClick={() => updateActiveField('badge', { ...activeSlideConfig.badge!, text: badge.text, backgroundColor: badge.bg, textColor: badge.color })} className="px-2 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: badge.bg, color: badge.color }}>
                        {badge.text}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-xs">Texte</label>
                  <input type="text" value={activeSlideConfig.badge.text} onChange={(e) => updateActiveField('badge', { ...activeSlideConfig.badge!, text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-500 text-xs">Fond</label>
                    <input type="color" value={activeSlideConfig.badge.backgroundColor} onChange={(e) => updateActiveField('badge', { ...activeSlideConfig.badge!, backgroundColor: e.target.value })} className="w-full h-8 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs">Texte</label>
                    <input type="color" value={activeSlideConfig.badge.textColor} onChange={(e) => updateActiveField('badge', { ...activeSlideConfig.badge!, textColor: e.target.value })} className="w-full h-8 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-xs">Position</label>
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(pos => (
                      <button key={pos} onClick={() => updateActiveField('badge', { ...activeSlideConfig.badge!, position: pos })} className={`py-1.5 rounded-lg text-[10px] capitalize ${activeSlideConfig.badge?.position === pos ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500'}`}>
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-500 text-xs">Animation</label>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {(['pulse', 'bounce', 'none'] as const).map(anim => (
                        <button key={anim} onClick={() => updateActiveField('badge', { ...activeSlideConfig.badge!, animation: anim })} className={`py-1 rounded-lg text-[10px] ${activeSlideConfig.badge?.animation === anim ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500'}`}>
                          {anim}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs">Arrondi</label>
                    <input type="range" min="0" max="20" value={activeSlideConfig.badge.borderRadius || 4} onChange={(e) => updateActiveField('badge', { ...activeSlideConfig.badge!, borderRadius: parseInt(e.target.value) })} className="w-full accent-primary" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Panel Hover Effect - UNIQUEMENT EN MODE GLOBAL */}
        {slideMode === 'global' && activeTab === 'hover' && (
          <div className="space-y-4">
            <div>
              <SectionLabel>Effet au survol</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'zoom', name: 'Zoom', desc: 'Agrandissement' },
                  { id: 'glow', name: 'Lueur', desc: 'Effet lumineux' },
                  { id: 'slide', name: 'Glissement', desc: 'Déplacement' },
                  { id: 'rotate', name: 'Rotation', desc: 'Tourne' },
                  { id: 'none', name: 'Aucun', desc: 'Sans effet' },
                ].map(effect => (
                  <button
                    key={effect.id}
                    onClick={() => updateActiveField('hoverEffect', effect.id as any)}
                    className={`p-2.5 rounded-xl text-center transition-colors border ${
                      activeSlideConfig.hoverEffect === effect.id
                        ? 'border-primary bg-white/10 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm block">{effect.name}</span>
                    <span className="text-[10px] block text-gray-500">{effect.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeSlideConfig.hoverEffect === 'zoom' && (
              <div>
                <label className="text-gray-500 text-xs">Niveau: {Math.round((activeSlideConfig.hoverScale || 1.05) * 100)}%</label>
                <input type="range" min="1" max="1.5" step="0.01" value={activeSlideConfig.hoverScale || 1.05} onChange={(e) => updateActiveField('hoverScale', parseFloat(e.target.value))} className="w-full accent-primary" />
              </div>
            )}

            {activeSlideConfig.hoverEffect === 'glow' && (
              <>
                <div>
                  <label className="text-gray-500 text-xs">Couleur</label>
                  <input type="color" value={activeSlideConfig.hoverGlowColor || '#3B82F6'} onChange={(e) => updateActiveField('hoverGlowColor', e.target.value)} className="w-full h-8 rounded-lg" />
                </div>
                <div>
                  <label className="text-gray-500 text-xs">Intensité: {activeSlideConfig.hoverGlowIntensity || 20}px</label>
                  <input type="range" min="0" max="50" value={activeSlideConfig.hoverGlowIntensity || 20} onChange={(e) => updateActiveField('hoverGlowIntensity', parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
              </>
            )}

            {activeSlideConfig.hoverEffect === 'slide' && (
              <>
                <div>
                  <label className="text-gray-500 text-xs">Direction</label>
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {['up', 'down', 'left', 'right'].map(dir => (
                      <button key={dir} onClick={() => updateActiveField('hoverSlideDirection', dir as any)} className={`py-1.5 rounded-lg text-xs capitalize ${activeSlideConfig.hoverSlideDirection === dir ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500'}`}>
                        {dir === 'up' ? '↑' : dir === 'down' ? '↓' : dir === 'left' ? '←' : '→'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-xs">Distance: {activeSlideConfig.hoverSlideDistance || 10}px</label>
                  <input type="range" min="0" max="50" value={activeSlideConfig.hoverSlideDistance || 10} onChange={(e) => updateActiveField('hoverSlideDistance', parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
              </>
            )}

            {activeSlideConfig.hoverEffect === 'rotate' && (
              <div>
                <label className="text-gray-500 text-xs">Rotation: {activeSlideConfig.hoverRotate || 5}°</label>
                <input type="range" min="0" max="30" value={activeSlideConfig.hoverRotate || 5} onChange={(e) => updateActiveField('hoverRotate', parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
            )}
          </div>
        )}

        {/* Panel Featured - UNIQUEMENT EN MODE GLOBAL */}
        {slideMode === 'global' && activeTab === 'featured' && (
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-gray-300 text-sm">Mettre en vedette</span>
                <p className="text-gray-500 text-xs">Marquer comme produit vedette</p>
              </div>
              <input type="checkbox" checked={activeSlideConfig.isFeatured} onChange={(e) => updateActiveField('isFeatured', e.target.checked)} className="toggle" />
            </label>

            {activeSlideConfig.isFeatured && (
              <>
                <div>
                  <label className="text-gray-500 text-xs">Ordre: {activeSlideConfig.featuredOrder || 0}</label>
                  <input type="range" min="0" max="100" value={activeSlideConfig.featuredOrder || 0} onChange={(e) => updateActiveField('featuredOrder', parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-gray-500 text-xs">Badge vedette</label>
                  <input type="text" value={activeSlideConfig.featuredBadge || '⭐ Vedette'} onChange={(e) => updateActiveField('featuredBadge', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm mb-2 mt-1" />
                  <input type="color" value={activeSlideConfig.featuredBadgeColor || '#F59E0B'} onChange={(e) => updateActiveField('featuredBadgeColor', e.target.value)} className="w-full h-8 rounded-lg" />
                </div>
              </>
            )}
          </div>
        )}

        {/* Panel Animation - UNIQUEMENT EN MODE GLOBAL */}
        {slideMode === 'global' && activeTab === 'animation' && (
          <div className="space-y-4">
            <div>
              <SectionLabel>Animation d'entrée</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'fade', name: 'Fondu', duration: 500 },
                  { id: 'slide-up', name: 'Glissement haut', duration: 500 },
                  { id: 'slide-down', name: 'Glissement bas', duration: 500 },
                  { id: 'slide-left', name: 'Glissement gauche', duration: 500 },
                  { id: 'slide-right', name: 'Glissement droite', duration: 500 },
                  { id: 'zoom-in', name: 'Zoom avant', duration: 400 },
                  { id: 'bounce', name: 'Rebond', duration: 800 },
                ].map(anim => (
                  <button key={anim.id} onClick={() => { updateActiveField('entranceAnimation', anim.id as any); updateActiveField('animationDuration', anim.duration); }} className={`p-2.5 rounded-xl text-center transition-colors border ${activeSlideConfig.entranceAnimation === anim.id ? 'border-primary bg-white/10 text-white' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                    <span className="text-xs block">{anim.name}</span>
                    <span className="text-[10px] block opacity-60">{anim.duration}ms</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-xs">Durée: {activeSlideConfig.animationDuration}ms</label>
              <input type="range" min="100" max="2000" step="50" value={activeSlideConfig.animationDuration || 500} onChange={(e) => updateActiveField('animationDuration', parseInt(e.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-gray-500 text-xs">Délai: {activeSlideConfig.animationDelay}ms</label>
              <input type="range" min="0" max="1000" step="50" value={activeSlideConfig.animationDelay || 0} onChange={(e) => updateActiveField('animationDelay', parseInt(e.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-gray-500 text-xs">Courbe</label>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'] as const).map(easing => (
                  <button key={easing} onClick={() => updateActiveField('animationEasing', easing)} className={`py-1.5 rounded-lg text-[10px] ${activeSlideConfig.animationEasing === easing ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500'}`}>
                    {easing}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 sticky bottom-0 bg-[#0d0e14]">
        <p className="text-[11px] text-center text-gray-500">
          Les modifications sont appliquées instantanément
        </p>
        {slideMode === 'per-slide' && (
          <p className="text-[11px] text-center text-gray-600 mt-0.5">
            Seul le fond est personnalisable par slide
          </p>
        )}
      </div>
    </div>
  );
}