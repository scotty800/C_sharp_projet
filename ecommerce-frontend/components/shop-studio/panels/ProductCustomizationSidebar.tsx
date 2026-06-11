// components/studio/panels/ProductCustomizationSidebar.tsx

'use client';

import { useState, useRef } from 'react';
import { 
  FiDroplet, FiZap, FiAward, FiStar, FiClock, 
  FiImage, FiBox, FiFilm, FiSliders, FiX
} from 'react-icons/fi';
import { ProductCustomization } from '@/types/studio';

interface Props {
  productId: number;
  productName: string;
  customization: ProductCustomization;
  onUpdate: (updates: Partial<ProductCustomization>) => void;
  onClose: () => void;
}

// Backgrounds prédéfinis
const PRESET_BACKGROUNDS = [
  { id: 'white', name: 'Blanc', type: 'solid', value: '#FFFFFF' },
  { id: 'gray', name: 'Gris clair', type: 'solid', value: '#F3F4F6' },
  { id: 'black', name: 'Noir', type: 'solid', value: '#111827' },
  { id: 'gradient-1', name: 'Dégradé Sunset', type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-2', name: 'Dégradé Ocean', type: 'gradient', value: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)' },
  { id: 'gradient-3', name: 'Dégradé Fire', type: 'gradient', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  { id: '3d-1', name: 'Carton', type: '3d', value: 'paper' },
  { id: '3d-2', name: 'Métal brossé', type: '3d', value: 'metal' },
  { id: '3d-3', name: 'Verre', type: '3d', value: 'glass' },
  { id: '3d-4', name: 'Bois', type: '3d', value: 'wood' },
];

// Badges prédéfinis
const PRESET_BADGES = [
  { id: 'sale', text: 'SALE -20%', bg: '#EF4444', color: '#FFFFFF' },
  { id: 'new', text: 'NOUVEAU', bg: '#10B981', color: '#FFFFFF' },
  { id: 'exclusive', text: 'EXCLUSIF', bg: '#8B5CF6', color: '#FFFFFF' },
  { id: 'limited', text: 'LIMITED', bg: '#F59E0B', color: '#FFFFFF' },
  { id: 'bestseller', text: '⭐ BEST-SELLER', bg: '#3B82F6', color: '#FFFFFF' },
];

// Animations prédéfinies
const PRESET_ANIMATIONS = [
  { id: 'fade', name: 'Fondu', duration: 500 },
  { id: 'slide-up', name: 'Glissement haut', duration: 500 },
  { id: 'slide-down', name: 'Glissement bas', duration: 500 },
  { id: 'slide-left', name: 'Glissement gauche', duration: 500 },
  { id: 'slide-right', name: 'Glissement droite', duration: 500 },
  { id: 'zoom-in', name: 'Zoom avant', duration: 400 },
  { id: 'bounce', name: 'Rebond', duration: 800 },
];

export default function ProductCustomizationSidebar({
  productId,
  productName,
  customization,
  onUpdate,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<'background' | 'hover' | 'badge' | 'featured' | 'animation'>('background');
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [gradientAngle, setGradientAngle] = useState(135);
  const [gradientColors, setGradientColors] = useState(['#667eea', '#764ba2']);

  const current = customization;

  const updateField = (field: keyof ProductCustomization, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }
    setImageUploading(true);
    try {
      const localUrl = URL.createObjectURL(file);
      updateField('backgroundImage', localUrl);
      updateField('backgroundType', 'image');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGradientChange = () => {
    const gradient = `linear-gradient(${gradientAngle}deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`;
    updateField('backgroundGradient', gradient);
    updateField('backgroundType', 'gradient');
    setShowGradientPicker(false);
  };

  const hoverEffects = [
    { id: 'zoom', name: 'Zoom', desc: 'Agrandissement' },
    { id: 'glow', name: 'Lueur', desc: 'Effet lumineux' },
    { id: 'slide', name: 'Glissement', desc: 'Déplacement' },
    { id: 'rotate', name: 'Rotation', desc: 'Tourne' },
    { id: 'none', name: 'Aucun', desc: 'Sans effet' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* En-tête */}
      <div className="p-4 border-b border-gray-700 bg-gray-900 sticky top-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FiZap size={16} className="text-purple-400" />
              Personnalisation
            </h3>
            <p className="text-gray-400 text-sm truncate">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Fermer"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {/* Onglets - sans l'onglet "Cadre" */}
      <div className="flex overflow-x-auto border-b border-gray-700 bg-gray-900 sticky top-[73px]">
        {[
          { id: 'background', label: 'Fond', icon: FiDroplet },
          { id: 'hover', label: 'Survol', icon: FiZap },
          { id: 'badge', label: 'Badge', icon: FiAward },
          { id: 'featured', label: 'Vedette', icon: FiStar },
          { id: 'animation', label: 'Animation', icon: FiClock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Panel Background */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm block mb-2">Type de fond</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'solid', name: 'Couleur', icon: FiDroplet },
                  { id: 'gradient', name: 'Dégradé', icon: FiSliders },
                  { id: 'image', name: 'Image', icon: FiImage },
                  { id: '3d', name: '3D', icon: FiBox },
                  { id: 'transparent', name: 'Transparent', icon: FiFilm },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => updateField('backgroundType', type.id as any)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      current.backgroundType === type.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <type.icon size={16} className="mx-auto mb-1" />
                    <span className="text-[10px]">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {current.backgroundType === 'solid' && (
              <div>
                <label className="text-white text-sm block mb-2">Couleur</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={current.backgroundColor || '#FFFFFF'}
                    onChange={(e) => updateField('backgroundColor', e.target.value)}
                    className="w-12 h-8 rounded cursor-pointer bg-gray-800 border border-gray-700"
                  />
                  <div className="flex-1 bg-gray-800 rounded-lg p-2">
                    <div className="w-full h-6 rounded" style={{ backgroundColor: current.backgroundColor }} />
                  </div>
                </div>
              </div>
            )}

            {current.backgroundType === 'gradient' && (
              <div>
                <button
                  onClick={() => setShowGradientPicker(!showGradientPicker)}
                  className="w-full py-2 bg-gray-800 text-white rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-gray-700 transition-colors"
                >
                  <FiSliders size={14} />
                  Créer un dégradé
                </button>
                {showGradientPicker && (
                  <div className="mt-3 p-3 bg-gray-800 rounded-lg space-y-3">
                    <div>
                      <label className="text-gray-400 text-xs">Angle: {gradientAngle}°</label>
                      <input type="range" min="0" max="360" value={gradientAngle} onChange={(e) => setGradientAngle(parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div className="flex gap-2">
                      <input type="color" value={gradientColors[0]} onChange={(e) => setGradientColors([e.target.value, gradientColors[1]])} className="flex-1 h-8 rounded" />
                      <input type="color" value={gradientColors[1]} onChange={(e) => setGradientColors([gradientColors[0], e.target.value])} className="flex-1 h-8 rounded" />
                    </div>
                    <button onClick={handleGradientChange} className="w-full py-1.5 bg-primary text-white rounded-lg text-xs">Appliquer</button>
                  </div>
                )}
              </div>
            )}

            {current.backgroundType === 'image' && (
              <div>
                <button onClick={() => fileInputRef.current?.click()} disabled={imageUploading} className="w-full py-2 bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm">
                  {imageUploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <>📷 Uploader</>}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                {current.backgroundImage && (
                  <div className="mt-2 relative h-16 rounded-lg overflow-hidden">
                    <img src={current.backgroundImage} alt="Background" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs">Opacité: {current.backgroundOpacity || 100}%</label>
                <input type="range" min="0" max="100" value={current.backgroundOpacity || 100} onChange={(e) => updateField('backgroundOpacity', parseInt(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Flou: {current.backgroundBlur || 0}px</label>
                <input type="range" min="0" max="20" value={current.backgroundBlur || 0} onChange={(e) => updateField('backgroundBlur', parseInt(e.target.value))} className="w-full" />
              </div>
            </div>

            {/* Section Bordure/Cadre - Gardée car c'est l'épaisseur/couleur/ombre */}
            <div className="border-t border-gray-700 pt-3 mt-2">
              <h4 className="text-white text-sm font-medium mb-3">Bordure & ombre</h4>
              
              <div className="mb-3">
                <label className="text-gray-400 text-xs">Épaisseur: {current.frameWidth || 2}px</label>
                <input type="range" min="0" max="10" value={current.frameWidth || 2} onChange={(e) => updateField('frameWidth', parseInt(e.target.value))} className="w-full" />
              </div>
              
              <div className="mb-3">
                <label className="text-gray-400 text-xs block mb-1">Couleur de la bordure</label>
                <input type="color" value={current.frameColor || '#E5E7EB'} onChange={(e) => updateField('frameColor', e.target.value)} className="w-full h-8 rounded" />
              </div>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300 text-sm">Ombre du cadre</span>
                <input type="checkbox" checked={current.frameShadow ?? true} onChange={(e) => updateField('frameShadow', e.target.checked)} className="toggle" />
              </label>
              
              {current.frameShadow && (
                <div className="mt-2">
                  <label className="text-gray-400 text-xs block mb-1">Couleur de l'ombre</label>
                  <input type="color" value={current.frameShadowColor || '#00000020'} onChange={(e) => updateField('frameShadowColor', e.target.value)} className="w-full h-8 rounded" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel Hover Effect */}
        {activeTab === 'hover' && (
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm block mb-2">Effet au survol</label>
              <div className="grid grid-cols-2 gap-2">
                {hoverEffects.map(effect => (
                  <button
                    key={effect.id}
                    onClick={() => updateField('hoverEffect', effect.id as any)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      current.hoverEffect === effect.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-sm">{effect.name}</span>
                    <span className="text-[10px] block text-gray-500">{effect.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {current.hoverEffect === 'zoom' && (
              <div>
                <label className="text-gray-400 text-xs">Niveau: {Math.round((current.hoverScale || 1.05) * 100)}%</label>
                <input type="range" min="1" max="1.5" step="0.01" value={current.hoverScale || 1.05} onChange={(e) => updateField('hoverScale', parseFloat(e.target.value))} className="w-full" />
              </div>
            )}

            {current.hoverEffect === 'glow' && (
              <>
                <div>
                  <label className="text-gray-400 text-xs">Couleur</label>
                  <input type="color" value={current.hoverGlowColor || '#3B82F6'} onChange={(e) => updateField('hoverGlowColor', e.target.value)} className="w-full h-8 rounded" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Intensité: {current.hoverGlowIntensity || 20}px</label>
                  <input type="range" min="0" max="50" value={current.hoverGlowIntensity || 20} onChange={(e) => updateField('hoverGlowIntensity', parseInt(e.target.value))} className="w-full" />
                </div>
              </>
            )}

            {current.hoverEffect === 'slide' && (
              <>
                <div>
                  <label className="text-gray-400 text-xs">Direction</label>
                  <div className="grid grid-cols-4 gap-1">
                    {['up', 'down', 'left', 'right'].map(dir => (
                      <button key={dir} onClick={() => updateField('hoverSlideDirection', dir as any)} className={`py-1.5 rounded text-xs capitalize ${current.hoverSlideDirection === dir ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'}`}>
                        {dir === 'up' ? '↑' : dir === 'down' ? '↓' : dir === 'left' ? '←' : '→'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Distance: {current.hoverSlideDistance || 10}px</label>
                  <input type="range" min="0" max="50" value={current.hoverSlideDistance || 10} onChange={(e) => updateField('hoverSlideDistance', parseInt(e.target.value))} className="w-full" />
                </div>
              </>
            )}

            {current.hoverEffect === 'rotate' && (
              <div>
                <label className="text-gray-400 text-xs">Rotation: {current.hoverRotate || 5}°</label>
                <input type="range" min="0" max="30" value={current.hoverRotate || 5} onChange={(e) => updateField('hoverRotate', parseInt(e.target.value))} className="w-full" />
              </div>
            )}
          </div>
        )}

        {/* Panel Badge */}
        {activeTab === 'badge' && (
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300 text-sm">Afficher un badge</span>
              <input type="checkbox" checked={!!current.badge} onChange={(e) => updateField('badge', e.target.checked ? { text: 'PROMO', backgroundColor: '#EF4444', textColor: '#FFFFFF', position: 'top-right', fontSize: 12, borderRadius: 4, animation: 'none' } : undefined)} className="toggle" />
            </label>

            {current.badge && (
              <>
                <div>
                  <label className="text-white text-sm block mb-2">Badges prédéfinis</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_BADGES.map(badge => (
                      <button key={badge.id} onClick={() => updateField('badge', { ...current.badge!, text: badge.text, backgroundColor: badge.bg, textColor: badge.color })} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: badge.bg, color: badge.color }}>
                        {badge.text}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-white text-xs">Texte</label>
                  <input type="text" value={current.badge.text} onChange={(e) => updateField('badge', { ...current.badge!, text: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-400 text-xs">Fond</label>
                    <input type="color" value={current.badge.backgroundColor} onChange={(e) => updateField('badge', { ...current.badge!, backgroundColor: e.target.value })} className="w-full h-8 rounded" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs">Texte</label>
                    <input type="color" value={current.badge.textColor} onChange={(e) => updateField('badge', { ...current.badge!, textColor: e.target.value })} className="w-full h-8 rounded" />
                  </div>
                </div>
                <div>
                  <label className="text-white text-xs">Position</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(pos => (
                      <button key={pos} onClick={() => updateField('badge', { ...current.badge!, position: pos })} className={`py-1 rounded text-xs capitalize ${current.badge?.position === pos ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'}`}>
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-400 text-xs">Animation</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['pulse', 'bounce', 'none'] as const).map(anim => (
                        <button key={anim} onClick={() => updateField('badge', { ...current.badge!, animation: anim })} className={`py-1 rounded text-xs ${current.badge?.animation === anim ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'}`}>
                          {anim}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs">Arrondi</label>
                    <input type="range" min="0" max="20" value={current.badge.borderRadius || 4} onChange={(e) => updateField('badge', { ...current.badge!, borderRadius: parseInt(e.target.value) })} className="w-full" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Panel Featured */}
        {activeTab === 'featured' && (
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-gray-300 text-sm">Mettre en vedette</span>
                <p className="text-gray-500 text-xs">Marquer comme produit vedette</p>
              </div>
              <input type="checkbox" checked={current.isFeatured} onChange={(e) => updateField('isFeatured', e.target.checked)} className="toggle" />
            </label>

            {current.isFeatured && (
              <>
                <div>
                  <label className="text-white text-xs">Ordre: {current.featuredOrder || 0}</label>
                  <input type="range" min="0" max="100" value={current.featuredOrder || 0} onChange={(e) => updateField('featuredOrder', parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-white text-xs">Badge vedette</label>
                  <input type="text" value={current.featuredBadge || '⭐ Vedette'} onChange={(e) => updateField('featuredBadge', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm mb-2" />
                  <input type="color" value={current.featuredBadgeColor || '#F59E0B'} onChange={(e) => updateField('featuredBadgeColor', e.target.value)} className="w-full h-8 rounded" />
                </div>
              </>
            )}
          </div>
        )}

        {/* Panel Animation */}
        {activeTab === 'animation' && (
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm block mb-2">Animation d'entrée</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_ANIMATIONS.map(anim => (
                  <button key={anim.id} onClick={() => { updateField('entranceAnimation', anim.id as any); updateField('animationDuration', anim.duration); }} className={`p-2 rounded-lg text-center transition-all ${current.entranceAnimation === anim.id ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'}`}>
                    <span className="text-xs">{anim.name}</span>
                    <span className="text-[10px] block opacity-70">{anim.duration}ms</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs">Durée: {current.animationDuration}ms</label>
              <input type="range" min="100" max="2000" step="50" value={current.animationDuration || 500} onChange={(e) => updateField('animationDuration', parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-gray-400 text-xs">Délai: {current.animationDelay}ms</label>
              <input type="range" min="0" max="1000" step="50" value={current.animationDelay || 0} onChange={(e) => updateField('animationDelay', parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-gray-400 text-xs">Courbe</label>
              <div className="grid grid-cols-3 gap-1">
                {(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'] as const).map(easing => (
                  <button key={easing} onClick={() => updateField('animationEasing', easing)} className={`py-1 rounded text-xs ${current.animationEasing === easing ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'}`}>
                    {easing}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 bg-gray-900 sticky bottom-0">
        <p className="text-xs text-center text-green-400">
          ✨ Modifications automatiques - Les changements sont visibles immédiatement
        </p>
      </div>
    </div>
  );
}