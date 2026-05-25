'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FiUpload, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { assetsService } from '@/services/api/assets';
import { getImageUrl } from '@/utils/imageUtils';

interface Props {
  selectedBlock: any;
  isBackgroundSelected: boolean;
  customization: any;
  onUpdateBlock: (id: string, updates: any) => void;
  onUpdateCustomization: (updates: any) => void;
  selectedTarget?: 'text' | 'background';
  shopId?: number;
  onAddSlide?: (carouselBlockId: string) => void;
}

// ── 60 couleurs organisées par famille ──────────────────────────────────────
const QUICK_COLORS = [
  '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#000000',
  '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', '#450A0A',
  '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F', '#451A03',
  '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#022C22',
  '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A', '#172554',
  '#E9D5FF', '#D8B4FE', '#C084FC', '#A855F7', '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#2E1065',
];

const GRADIENTS = [
  { name: 'Violet',  value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Rose',    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Bleu',    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Vert',    value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Orange',  value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Nuit',    value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
];

// ── Helper: ouvre un input color natif ──────────────────────────────────────
function openNativeColorPicker(
  anchorEl: HTMLElement,
  initialColor: string,
  onChange: (color: string) => void,
) {
  const input = document.createElement('input');
  input.type = 'color';
  input.value = initialColor.startsWith('#') ? initialColor : '#ffffff';
  Object.assign(input.style, {
    position: 'fixed',
    left: `${anchorEl.getBoundingClientRect().left}px`,
    top:  `${anchorEl.getBoundingClientRect().bottom + 8}px`,
    width: '0', height: '0', opacity: '0', pointerEvents: 'none',
  });
  document.body.appendChild(input);
  input.addEventListener('input', (e) => onChange((e.target as HTMLInputElement).value));
  input.addEventListener('blur', () => document.body.removeChild(input));
  input.click();
}

// ── Sous-composant : sélecteur de couleur unie ──────────────────────────────
function SolidColorPicker({
  currentColor,
  onApply,
  showGradientHint = false,
}: {
  currentColor: string;
  onApply: (color: string) => void;
  showGradientHint?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const swatchRef = useRef<HTMLDivElement>(null);
  const displayed = showAll ? QUICK_COLORS : QUICK_COLORS.slice(0, 12);

  return (
    <div className="space-y-3">
      {/* Aperçu + hex input */}
      <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2">
          <div
            ref={swatchRef}
            className="w-8 h-8 rounded-lg border-2 border-gray-600 shadow-md cursor-pointer flex-shrink-0"
            style={{ backgroundColor: currentColor === 'transparent' ? '#e5e7eb' : currentColor }}
            onClick={(e) =>
              openNativeColorPicker(e.currentTarget, currentColor, onApply)
            }
          />
          <input
            type="text"
            value={currentColor === 'transparent' ? 'transparent' : currentColor}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'transparent' || v.match(/^#[0-9A-Fa-f]{6}$/)) onApply(v);
            }}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs font-mono"
            placeholder="#000000"
          />
          <button
            onClick={() => onApply('transparent')}
            className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300"
            title="Transparent"
          >
            🔲
          </button>
        </div>
      </div>

      {/* Toggle +48 couleurs */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {showAll ? 'Voir moins' : `Voir plus (+${QUICK_COLORS.length - 12})`}
        </button>
      </div>

      {/* Grille de couleurs */}
      <div className="grid grid-cols-6 gap-1.5">
        {displayed.map((color) => (
          <button
            key={color}
            className="w-7 h-7 rounded-lg border border-gray-600 hover:scale-110 transition-transform shadow-sm"
            style={{ backgroundColor: color }}
            onClick={() => onApply(color)}
            title={color}
          />
        ))}
      </div>

      {showGradientHint && (
        <p className="text-xs text-green-400">
          ✓ Dégradé actif — cliquez une couleur pour le remplacer
        </p>
      )}
    </div>
  );
}

// ── Sous-composant : sélecteur de dégradé ───────────────────────────────────
function GradientPicker({
  currentGradient,
  onApply,
  opacity,
  onOpacityChange,
  overlayOpacity,
  onOverlayOpacityChange,
  showOverlay = false,
}: {
  currentGradient: string | null;
  onApply: (gradient: string) => void;
  opacity?: number;
  onOpacityChange?: (v: number) => void;
  overlayOpacity?: number;
  onOverlayOpacityChange?: (v: number) => void;
  showOverlay?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {GRADIENTS.map((grad) => (
          <button
            key={grad.value}
            onClick={() => onApply(grad.value)}
            className={`h-10 rounded-lg border-2 transition-all hover:scale-105 ${
              currentGradient === grad.value
                ? 'border-primary ring-2 ring-primary/50'
                : 'border-gray-600'
            }`}
            style={{ background: grad.value }}
            title={grad.name}
          >
            <span className="text-white text-xs font-medium drop-shadow-md">{grad.name}</span>
          </button>
        ))}
      </div>

      {!currentGradient && (
        <p className="text-xs text-blue-400">
          ✓ Couleur unie active — cliquez un dégradé pour l'appliquer
        </p>
      )}

      {opacity !== undefined && onOpacityChange && (
        <div>
          <label className="text-xs text-gray-400 block mb-1">Opacité du fond : {opacity}%</label>
          <input
            type="range" min="0" max="100" value={opacity}
            onChange={(e) => onOpacityChange(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {showOverlay && overlayOpacity !== undefined && onOverlayOpacityChange && (
        <div>
          <label className="text-xs text-gray-400 block mb-1">Opacité overlay : {overlayOpacity}%</label>
          <input
            type="range" min="0" max="100" value={overlayOpacity}
            onChange={(e) => onOverlayOpacityChange(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

// ── Sous-composant : image de fond ──────────────────────────────────────────
function BackgroundImagePicker({
  currentImage,
  currentOpacity,
  onImageChange,
  onOpacityChange,
  shopId,
}: {
  currentImage: string | null;
  currentOpacity: number;
  onImageChange: (url: string | null) => void;
  onOpacityChange: (v: number) => void;
  shopId?: number;
}) {
  const handleUpload = async (files: FileList) => {
    if (!shopId) { toast.error('shopId manquant'); return; }
    for (const file of Array.from(files)) {
      try {
        const asset = await assetsService.uploadAsset(shopId, file, 'image', 'slide-bg');
        onImageChange(getImageUrl(asset.url));
        toast.success(`Image uploadée : ${asset.name}`);
      } catch {
        toast.error(`Erreur upload`);
      }
    }
  };

  const openAssetPicker = () => {
    const ev = new CustomEvent('openAssetPickerForCarousel', {
      detail: {
        callback: (asset: any) => onImageChange(getImageUrl(asset.url)),
      },
    });
    window.dispatchEvent(ev);
  };

  return (
    <div className="space-y-3">
      {currentImage ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-600">
          <img src={currentImage} alt="" className="w-full h-24 object-cover" />
          <button
            onClick={() => onImageChange(null)}
            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
          <FiUpload className="mx-auto text-gray-400 mb-2" size={22} />
          <p className="text-xs text-gray-400 mb-3">Image de fond de la slide</p>
          <div className="flex gap-2 justify-center">
            <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors">
              📁 Mon ordinateur
              <input
                type="file" className="hidden" accept="image/*"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
              />
            </label>
            <button
              onClick={openAssetPicker}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
            >
              📚 Bibliothèque
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Opacité de l'image : {currentOpacity}%
        </label>
        <input
          type="range" min="10" max="100" value={currentOpacity}
          onChange={(e) => onOpacityChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function ColorsPanel({
  selectedBlock,
  isBackgroundSelected,
  customization,
  onUpdateBlock,
  onUpdateCustomization,
  selectedTarget = 'text',
  shopId,
  onAddSlide,
}: Props) {
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'image'>('solid');

  const isCanvasSelected = isBackgroundSelected;
  const isBlockSelected  = !isCanvasSelected && selectedBlock !== null;
  const target           = selectedTarget;

  const isCarouselSlide  = selectedBlock?.type === 'carousel-slide';
  const isBanner         = selectedBlock?.type === 'banner';
  const isScreenBanner   = selectedBlock?.type === 'screen-banner';

  // ── Helpers génériques ────────────────────────────────────────────────────
  const applySolidColor = useCallback((color: string) => {
    if (isCanvasSelected) {
      onUpdateCustomization({ backgroundColor: color, backgroundType: 'solid', backgroundValue: null });
    } else if (isBlockSelected) {
      if (target === 'text') {
        const updates: Record<string, any> = {};
        switch (selectedBlock.type) {
          case 'text':    case 'title':  updates.textColor  = color; updates.textGradient  = null; break;
          case 'banner':  case 'screen-banner': updates.titleColor = color; updates.titleGradient = null; break;
          case 'button':  updates.textColor = color; updates.textGradient = null; break;
          case 'products': updates.titleColor = color; updates.titleGradient = null; break;
          default:        updates.textColor = color;
        }
        onUpdateBlock(selectedBlock.id, updates);
      } else {
        onUpdateBlock(selectedBlock.id, { backgroundColor: color, backgroundType: 'solid', backgroundValue: null });
      }
    }
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, onUpdateBlock, onUpdateCustomization]);

  const applyGradient = useCallback((gradient: string) => {
    if (isCanvasSelected) {
      onUpdateCustomization({ backgroundType: 'gradient', backgroundValue: gradient, backgroundColor: null });
    } else if (isBlockSelected) {
      if (target === 'text') {
        const updates: Record<string, any> = {};
        switch (selectedBlock.type) {
          case 'text':   case 'title':  updates.textGradient = gradient; updates.textColor = null; break;
          case 'banner': case 'screen-banner': updates.titleGradient = gradient; updates.titleColor = null; break;
          case 'button': updates.textGradient = gradient; updates.textColor = null; break;
          case 'products': updates.titleGradient = gradient; updates.titleColor = null; break;
          default: updates.textGradient = gradient;
        }
        onUpdateBlock(selectedBlock.id, updates);
      } else {
        onUpdateBlock(selectedBlock.id, { backgroundType: 'gradient', backgroundValue: gradient, backgroundColor: null });
      }
    }
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, onUpdateBlock, onUpdateCustomization]);

  // ── Couleur / dégradé courant ─────────────────────────────────────────────
  const currentSolidColor = useMemo(() => {
    if (isCanvasSelected) return customization?.backgroundColor || '#ffffff';
    if (!isBlockSelected) return '#000000';
    if (target === 'text') {
      switch (selectedBlock.type) {
        case 'text': case 'title': return selectedBlock.props?.textColor || '#000000';
        case 'banner': case 'screen-banner': return selectedBlock.props?.titleColor || '#ffffff';
        case 'button': return selectedBlock.props?.textColor || '#ffffff';
        case 'products': return selectedBlock.props?.titleColor || '#1F2937';
        default: return '#000000';
      }
    }
    // background
    return selectedBlock.props?.backgroundColor || '#ffffff';
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, customization]);

  const currentGradient = useMemo(() => {
    if (isCanvasSelected) return customization?.backgroundValue || null;
    if (!isBlockSelected) return null;
    if (target === 'text') {
      switch (selectedBlock.type) {
        case 'text': case 'title': return selectedBlock.props?.textGradient || null;
        case 'banner': case 'screen-banner': return selectedBlock.props?.titleGradient || null;
        case 'button': return selectedBlock.props?.textGradient || null;
        case 'products': return selectedBlock.props?.titleGradient || null;
        default: return null;
      }
    }
    return selectedBlock.props?.backgroundValue || null;
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, customization]);

  const currentOpacity = useMemo(() => {
    if (isCanvasSelected) return customization?.backgroundOpacity ?? 100;
    if (isBlockSelected && target === 'background') return selectedBlock.props?.opacity ?? 100;
    return 100;
  }, [isCanvasSelected, isBlockSelected, target, selectedBlock, customization]);

  const isGradientActive = !!currentGradient;

  const getTitle = () => {
    if (isCanvasSelected) return 'Fond du canvas';
    if (isCarouselSlide) return '🎠 Fond de la slide';
    if (target === 'text') return `Couleur du texte (${selectedBlock?.type})`;
    return `Couleur de fond (${selectedBlock?.type})`;
  };

  // ── Cas : rien de sélectionné ────────────────────────────────────────────
  if (!isCanvasSelected && !isBlockSelected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-xs">Sélectionnez un élément pour modifier ses couleurs</p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CAS SPÉCIAL : carousel-slide — fond uniquement
  // ════════════════════════════════════════════════════════════════════════════
  if (isCarouselSlide) {
    const slideProps = selectedBlock.props || {};
    // ✅ Récupère l'ID du carousel parent pour le bouton "Ajouter une slide"
    const parentCarouselId = selectedBlock.parentId;

    const applySlideColor = (color: string) => {
      onUpdateBlock(selectedBlock.id, {
        backgroundColor: color,
        backgroundType: 'solid',
        backgroundValue: null,
      });
    };

    const applySlideGradient = (gradient: string) => {
      onUpdateBlock(selectedBlock.id, {
        backgroundType: 'gradient',
        backgroundValue: gradient,
        backgroundColor: null,
      });
    };

    const applySlideImage = (url: string | null) => {
      onUpdateBlock(selectedBlock.id, { backgroundImage: url });
    };

    const slideColor    = slideProps.backgroundColor || '#1a1a2e';
    const slideGradient = slideProps.backgroundValue || null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">🎠 Fond de la slide</h3>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
            carousel-slide
          </span>
        </div>

        {/* ✅ BOUTON AJOUTER UNE SLIDE */}
        {onAddSlide && parentCarouselId && (
          <button
            onClick={() => onAddSlide(parentCarouselId)}
            className="w-full py-1.5 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <FiPlus size={12} /> Ajouter une slide
          </button>
        )}

        <p className="text-xs text-gray-400">
          Définissez le fond de cette slide. Ajoutez vos contenus (titre, texte, image…)
          directement en glissant des blocs dans la slide via le panneau de calques.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-700 pb-2">
          {(['solid', 'gradient', 'image'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1 text-xs rounded transition-colors ${
                activeTab === tab ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'solid' ? '🎨 Couleur' : tab === 'gradient' ? '🌈 Dégradé' : '🖼️ Image'}
            </button>
          ))}
        </div>

        {activeTab === 'solid' && (
          <SolidColorPicker
            currentColor={slideColor}
            onApply={applySlideColor}
            showGradientHint={!!slideGradient}
          />
        )}

        {activeTab === 'gradient' && (
          <GradientPicker
            currentGradient={slideGradient}
            onApply={applySlideGradient}
            showOverlay
            overlayOpacity={slideProps.overlayOpacity ?? 0}
            onOverlayOpacityChange={(v) => onUpdateBlock(selectedBlock.id, { overlayOpacity: v })}
          />
        )}

        {activeTab === 'image' && (
          <>
            <BackgroundImagePicker
              currentImage={slideProps.backgroundImage || null}
              currentOpacity={slideProps.backgroundImageOpacity ?? 100}
              onImageChange={applySlideImage}
              onOpacityChange={(v) => onUpdateBlock(selectedBlock.id, { backgroundImageOpacity: v })}
              shopId={shopId}
            />
            {slideProps.backgroundImage && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Overlay : {slideProps.overlayOpacity ?? 0}%
                </label>
                <input
                  type="range" min="0" max="100"
                  value={slideProps.overlayOpacity ?? 0}
                  onChange={(e) =>
                    onUpdateBlock(selectedBlock.id, { overlayOpacity: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CAS BANNER / SCREEN-BANNER (fond uniquement, sans carrousel interne)
  // ════════════════════════════════════════════════════════════════════════════
  if ((isBanner || isScreenBanner) && target === 'background') {
    return (
      <div className="space-y-3">
        <h3 className="text-white font-semibold text-sm">{getTitle()}</h3>

        <div className="flex gap-1 border-b border-gray-700 pb-2">
          {(['solid', 'gradient'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-1 text-xs rounded transition-colors ${
                activeTab === tab ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'solid' ? '🎨 Couleur unie' : '🌈 Dégradé'}
            </button>
          ))}
        </div>

        {activeTab === 'solid' && (
          <SolidColorPicker
            currentColor={currentSolidColor}
            onApply={applySolidColor}
            showGradientHint={isGradientActive}
          />
        )}

        {activeTab === 'gradient' && (
          <GradientPicker
            currentGradient={currentGradient}
            onApply={applyGradient}
            opacity={currentOpacity}
            onOpacityChange={(v) => {
              if (isCanvasSelected) onUpdateCustomization({ backgroundOpacity: v });
              else onUpdateBlock(selectedBlock.id, { opacity: v });
            }}
            showOverlay
            overlayOpacity={selectedBlock?.props?.overlayOpacity ?? 30}
            onOverlayOpacityChange={(v) => onUpdateBlock(selectedBlock.id, { overlayOpacity: v })}
          />
        )}

        {/* Options spécifiques screen-banner */}
        {isScreenBanner && (
          <div className="border-t border-gray-700 pt-3 space-y-3">
            <h4 className="text-white text-xs font-semibold">🖼️ Bordure</h4>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Épaisseur : {selectedBlock.props?.borderWidth || 4}px
              </label>
              <input type="range" min="0" max="20"
                value={selectedBlock.props?.borderWidth || 4}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { borderWidth: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Couleur de la bordure</label>
              <div className="flex items-center gap-2">
                <input type="color" value={selectedBlock.props?.borderColor || '#ffffff'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { borderColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input type="text" value={selectedBlock.props?.borderColor || '#ffffff'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { borderColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Style de bordure</label>
              <select value={selectedBlock.props?.borderStyle || 'solid'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { borderStyle: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
              >
                <option value="solid">Plein (solid)</option>
                <option value="dashed">Tirets (dashed)</option>
                <option value="dotted">Points (dotted)</option>
                <option value="double">Double</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Arrondi : {selectedBlock.props?.borderRadius || 16}px
              </label>
              <input type="range" min="0" max="50"
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

  // ════════════════════════════════════════════════════════════════════════════
  // CAS GÉNÉRAL (texte, titre, bouton, canvas, fond bloc quelconque)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-3">
      <h3 className="text-white font-semibold text-sm">{getTitle()}</h3>

      <div className="flex gap-1 border-b border-gray-700 pb-2">
        {(['solid', 'gradient'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-1 text-xs rounded transition-colors ${
              activeTab === tab ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'solid' ? '🎨 Couleur unie' : '🌈 Dégradé'}
          </button>
        ))}
      </div>

      {activeTab === 'solid' && (
        <SolidColorPicker
          currentColor={currentSolidColor}
          onApply={applySolidColor}
          showGradientHint={isGradientActive}
        />
      )}

      {activeTab === 'gradient' && (
        <GradientPicker
          currentGradient={currentGradient}
          onApply={applyGradient}
          opacity={target === 'background' ? currentOpacity : undefined}
          onOpacityChange={
            target === 'background'
              ? (v) => {
                  if (isCanvasSelected) onUpdateCustomization({ backgroundOpacity: v });
                  else onUpdateBlock(selectedBlock.id, { opacity: v });
                }
              : undefined
          }
        />
      )}
    </div>
  );
}