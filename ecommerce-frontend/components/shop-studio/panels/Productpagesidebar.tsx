'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FiX, FiCheck, FiChevronRight, FiLayout, FiSearch,
  FiSliders, FiEye, FiZap, FiGrid, FiMinimize2,
  FiImage,
} from 'react-icons/fi';
import { StudioProduct, ProductCustomization } from '@/types/studio';
import {
  ProductPageTemplate,
  ProductPageConfig,
  PRODUCT_PAGE_TEMPLATES,
  generateProductPageBlocks,
  ProductPageTemplateDefinition,
} from '../../../types/Productpage';

// ⭐ Aperçu plein-page WYSIWYG (remplace l'ancienne maquette CSS statique)
import ProductPageFullPreview from './ProductPageFullPreview';

interface Props {
  products: StudioProduct[];
  onClose: () => void;
  onGeneratePage: (config: ProductPageConfig) => void;
  isGenerating?: boolean;
}

const TemplateCard = ({
  template,
  isSelected,
  onClick,
}: {
  template: ProductPageTemplateDefinition;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const ICON_MAP: Record<ProductPageTemplate, React.ReactNode> = {
    classic: <FiLayout size={22} />,
    immersive: <FiEye size={22} />,
    gallery: <FiGrid size={22} />,
    minimal: <FiMinimize2 size={22} />,
  };

  const MiniPreview = () => {
    const { layout, primaryColor, accent } = template.preview;
    return (
      <div
        className="w-full rounded-md overflow-hidden mb-3"
        style={{ height: 90, backgroundColor: primaryColor, position: 'relative' }}
      >
        {layout === 'split' && (
          <>
            <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', backgroundColor: `${accent}25` }} />
            <div style={{ position: 'absolute', right: '8%', top: '15%', width: '36%', height: '70%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
            <div style={{ position: 'absolute', right: '8%', top: '25%', width: '28%', height: 6, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
            <div style={{ position: 'absolute', right: '8%', top: '40%', width: '20%', height: 4, backgroundColor: accent, borderRadius: 2 }} />
            <div style={{ position: 'absolute', right: '8%', bottom: '20%', width: '28%', height: 8, backgroundColor: accent, borderRadius: 2 }} />
          </>
        )}
        {layout === 'hero' && (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)' }} />
            <div style={{ position: 'absolute', left: '8%', top: '20%', width: 20, height: 2, backgroundColor: accent }} />
            <div style={{ position: 'absolute', left: '8%', top: '32%', width: '45%', height: 8, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 2 }} />
            <div style={{ position: 'absolute', left: '8%', top: '50%', width: '35%', height: 4, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
            <div style={{ position: 'absolute', left: '8%', bottom: '18%', width: '22%', height: 10, backgroundColor: accent, borderRadius: 2 }} />
            <div style={{ position: 'absolute', right: '8%', top: '22%', width: '25%', height: '55%', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 3, border: `1px solid ${accent}60` }} />
          </>
        )}
        {layout === 'grid' && (
          <>
            <div style={{ position: 'absolute', left: '3%', top: '5%', width: '57%', height: '60%', backgroundColor: `${accent}30`, borderRadius: 4 }} />
            <div style={{ position: 'absolute', left: '3%', bottom: '5%', width: '27%', height: '30%', backgroundColor: `${accent}20`, borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: '33%', bottom: '5%', width: '27%', height: '30%', backgroundColor: `${accent}20`, borderRadius: 3 }} />
            <div style={{ position: 'absolute', right: '3%', top: '5%', width: '35%', height: '90%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 6 }} />
            <div style={{ position: 'absolute', right: '6%', top: '22%', width: '24%', height: 5, backgroundColor: primaryColor, borderRadius: 2, opacity: 0.5 }} />
            <div style={{ position: 'absolute', right: '6%', top: '34%', width: '18%', height: 5, backgroundColor: accent, borderRadius: 2 }} />
            <div style={{ position: 'absolute', right: '6%', bottom: '18%', width: '24%', height: 8, backgroundColor: accent, borderRadius: 3 }} />
          </>
        )}
        {layout === 'centered' && (
          <>
            <div style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', width: '90%', height: 0.5, backgroundColor: 'rgba(0,0,0,0.15)' }} />
            <div style={{ position: 'absolute', left: '5%', top: '15%', width: '45%', height: '72%', backgroundColor: '#e8e8e8', borderRadius: 2 }} />
            <div style={{ position: 'absolute', right: '5%', top: '18%', width: '40%', height: 4, backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 2 }} />
            <div style={{ position: 'absolute', right: '5%', top: '28%', width: '34%', height: 8, backgroundColor: primaryColor === '#fafafa' ? '#222' : primaryColor, borderRadius: 1, opacity: 0.8 }} />
            <div style={{ position: 'absolute', right: '5%', bottom: '22%', width: '40%', height: 8, backgroundColor: accent, borderRadius: 0 }} />
            <div style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', width: '90%', height: 0.5, backgroundColor: 'rgba(0,0,0,0.15)' }} />
          </>
        )}
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-3 border-2 transition-all"
      style={{
        borderColor: isSelected ? '#6366f1' : 'transparent',
        backgroundColor: isSelected ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)',
      }}
    >
      <MiniPreview />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: isSelected ? '#818cf8' : '#9ca3af' }}>{ICON_MAP[template.id]}</span>
            <span className="font-semibold text-sm" style={{ color: isSelected ? '#c7d2fe' : '#e5e7eb' }}>
              {template.name}
            </span>
            {isSelected && (
              <span className="ml-auto">
                <FiCheck size={14} color="#818cf8" />
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
            {template.description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {template.tags.map(tag => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
              color: isSelected ? '#a5b4fc' : '#6b7280',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
};

const ProductItem = ({
  product,
  isSelected,
  onClick,
}: {
  product: StudioProduct;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left"
    style={{
      backgroundColor: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isSelected ? '#6366f1' : 'transparent'}`,
    }}
  >
    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
      {product.imageUrl1 ? (
        <img src={product.imageUrl1} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">📷</div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">{product.name}</p>
      <p className="text-xs text-gray-400">{product.price.toFixed(2)} €</p>
    </div>
    {isSelected && <FiCheck size={16} color="#818cf8" className="flex-shrink-0" />}
  </button>
);

const COLOR_PRESETS: Record<ProductPageTemplate, Array<{ label: string; accent: string; bg: string; text: string }>> = {
  classic: [
    { label: 'Rouge passion', accent: '#e94560', bg: '#ffffff', text: '#1a1a2e' },
    { label: 'Bleu marine', accent: '#1d4ed8', bg: '#f0f4ff', text: '#0f172a' },
    { label: 'Émeraude', accent: '#059669', bg: '#f0fdf4', text: '#064e3b' },
    { label: 'Or rosé', accent: '#d97706', bg: '#fffbeb', text: '#1c1917' },
  ],
  immersive: [
    { label: 'Or', accent: '#d4af37', bg: '#0f0f0f', text: '#ffffff' },
    { label: 'Argent', accent: '#94a3b8', bg: '#0a0a0a', text: '#f1f5f9' },
    { label: 'Corail', accent: '#f97316', bg: '#0c0c0c', text: '#fff7ed' },
    { label: 'Lavande', accent: '#a78bfa', bg: '#0d0d0d', text: '#ede9fe' },
  ],
  gallery: [
    { label: 'Forêt', accent: '#2d6a4f', bg: '#f8f5f0', text: '#1a1a1a' },
    { label: 'Terracotta', accent: '#c2552d', bg: '#faf6f1', text: '#1c1917' },
    { label: 'Indigo', accent: '#4338ca', bg: '#f5f3ff', text: '#1e1b4b' },
    { label: 'Ardoise', accent: '#475569', bg: '#f8fafc', text: '#0f172a' },
  ],
  minimal: [
    { label: 'Noir', accent: '#111111', bg: '#fafafa', text: '#111111' },
    { label: 'Graphite', accent: '#374151', bg: '#f9fafb', text: '#111827' },
    { label: 'Encre', accent: '#1e3a5f', bg: '#f8fafd', text: '#0f172a' },
    { label: 'Charbon', accent: '#292524', bg: '#fafaf9', text: '#1c1917' },
  ],
};

// ⭐ NOUVEAU : valeur et libellé par défaut du "panneau" pour chaque modèle.
// C'est ce qui rend chaque modèle réglable indépendamment : le Minimal n'a
// pas de panneau donc le contrôle est masqué pour lui.
const PANEL_COLOR_DEFAULTS: Record<ProductPageTemplate, string> = {
  classic: '#f8f8f8',
  gallery: '#ffffff',
  immersive: '#000000',
  minimal: '#fafafa',
};

const PANEL_COLOR_LABEL: Record<ProductPageTemplate, string> = {
  classic: "Couleur du panneau d'info (à droite)",
  gallery: 'Couleur de la carte produit',
  immersive: "Couleur du voile sur l'image",
  minimal: '',
};

export default function ProductPageSidebar({ products, onClose, onGeneratePage, isGenerating }: Props) {
  const [step, setStep] = useState<'template' | 'product' | 'customize'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProductPageTemplate>('classic');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [accentColor, setAccentColor] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [panelColor, setPanelColor] = useState(''); // ⭐ NOUVEAU
  const [search, setSearch] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(true);

  const [imageFrameStyle, setImageFrameStyle] = useState<'square' | 'rounded'>('square');
  const [imageBorderRadius, setImageBorderRadius] = useState<number>(16);
  const [imageBgColor, setImageBgColor] = useState<string>('');
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('contain');
  const [frameBorderColor, setFrameBorderColor] = useState<string>(''); // ⭐ NOUVEAU
  const [frameBorderWidth, setFrameBorderWidth] = useState<number>(2);  // ⭐ NOUVEAU

  const selectedProduct = products.find(p => p.id === selectedProductId) || null;
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const currentPresets = COLOR_PRESETS[selectedTemplate];

  const applyPreset = useCallback((preset: typeof currentPresets[0]) => {
    setAccentColor(preset.accent);
    setBgColor(preset.bg);
    setTextColor(preset.text);
  }, []);

  const buildImageStyle = useCallback(() => ({
    frameStyle: imageFrameStyle,
    borderRadius: imageFrameStyle === 'rounded' ? imageBorderRadius : 0,
    imageBackground: imageBgColor || undefined,
    fit: imageFit,
    frameBorderColor: frameBorderColor || undefined,
    frameBorderWidth: frameBorderColor ? frameBorderWidth : undefined,
  }), [imageFrameStyle, imageBorderRadius, imageBgColor, imageFit, frameBorderColor, frameBorderWidth]);

  // ⭐ MODIFICATION — handleGenerate avec panelColor conditionnel pour Minimal
  const handleGenerate = useCallback(() => {
    if (!selectedProduct) return;
    const templateDef = PRODUCT_PAGE_TEMPLATES.find(t => t.id === selectedTemplate)!;
    onGeneratePage({
      template: selectedTemplate,
      product: selectedProduct,
      accentColor: accentColor || templateDef.preview.accent,
      backgroundColor: bgColor || (selectedTemplate === 'classic' ? '#ffffff' : selectedTemplate === 'gallery' ? '#f8f5f0' : selectedTemplate === 'minimal' ? '#fafafa' : '#0f0f0f'),
      textColor: textColor || (selectedTemplate === 'immersive' ? '#ffffff' : '#111111'),
      // ⭐ MODIFICATION : le template Minimal n'a pas de panneau visible
      panelColor: selectedTemplate === 'minimal' ? undefined : (panelColor || PANEL_COLOR_DEFAULTS[selectedTemplate]),
      imageStyle: buildImageStyle(),
    });
  }, [selectedProduct, selectedTemplate, accentColor, bgColor, textColor, panelColor, buildImageStyle, onGeneratePage]);

  const canProceed = {
    template: !!selectedTemplate,
    product: !!selectedProductId,
    customize: true,
  };

  const stepLabels = ['Modèle', 'Produit', 'Couleurs'];
  const stepKeys: Array<'template' | 'product' | 'customize'> = ['template', 'product', 'customize'];
  const currentStepIndex = stepKeys.indexOf(step);

  return (
    <div
      className="flex flex-col h-full"
      style={{ width: 300, backgroundColor: '#111827', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <div>
          <h2 className="text-white font-semibold text-sm">Page Produit</h2>
          <p className="text-gray-500 text-xs mt-0.5">Générer depuis un template</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <FiX size={16} />
        </button>
      </div>

      <div className="flex items-center px-4 py-3 border-b border-white/5">
        {stepLabels.map((label, idx) => (
          <React.Fragment key={label}>
            <button
              onClick={() => {
                if (idx === 0) setStep('template');
                if (idx === 1 && canProceed.template) setStep('product');
                if (idx === 2 && canProceed.product) setStep('customize');
              }}
              className="flex items-center gap-1.5"
              disabled={idx > currentStepIndex && !canProceed[stepKeys[idx - 1] as keyof typeof canProceed]}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                style={{
                  backgroundColor: idx <= currentStepIndex ? '#6366f1' : 'rgba(255,255,255,0.08)',
                  color: idx <= currentStepIndex ? '#ffffff' : '#6b7280',
                }}
              >
                {idx < currentStepIndex ? <FiCheck size={10} /> : idx + 1}
              </span>
              <span className="text-xs" style={{ color: idx === currentStepIndex ? '#c7d2fe' : '#6b7280' }}>
                {label}
              </span>
            </button>
            {idx < stepLabels.length - 1 && (
              <FiChevronRight size={12} className="mx-1.5" color="#374151" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">

        {step === 'template' && (
          <>
            <p className="text-xs text-gray-500 px-1 mb-3">Choisissez la mise en page de votre page produit.</p>
            {PRODUCT_PAGE_TEMPLATES.map(tpl => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                isSelected={selectedTemplate === tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
              />
            ))}
          </>
        )}

        {step === 'product' && (
          <>
            <div className="relative mb-3">
              <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un produit…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-gray-500"
              />
            </div>
            {filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">Aucun produit trouvé</p>
            ) : (
              <div className="space-y-1.5">
                {filteredProducts.map(p => (
                  <ProductItem
                    key={p.id}
                    product={p}
                    isSelected={selectedProductId === p.id}
                    onClick={() => setSelectedProductId(p.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {step === 'customize' && (
          <>
            <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p className="text-xs text-indigo-400 font-medium mb-1">
                {PRODUCT_PAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.name} · {selectedProduct?.name}
              </p>
              <p className="text-xs text-gray-500">{selectedProduct?.price.toFixed(2)} €</p>
            </div>

            {/* ⭐ APERÇU PLEINE PAGE — rend les VRAIS blocs générés, donc 100% fidèle */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                  <FiEye size={11} /> Aperçu de la page complète
                </p>
                <button
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showLivePreview ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              {showLivePreview && (
                <div className="flex justify-center">
                  <ProductPageFullPreview
                    config={{
                      template: selectedTemplate,
                      product: selectedProduct,
                      accentColor: accentColor || currentPresets[0]?.accent,
                      backgroundColor: bgColor || currentPresets[0]?.bg,
                      textColor: textColor || currentPresets[0]?.text,
                      panelColor: panelColor || PANEL_COLOR_DEFAULTS[selectedTemplate],
                      imageStyle: buildImageStyle(),
                    }}
                    width={264}
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 font-medium px-1 mb-2 flex items-center gap-1.5">
                <FiZap size={11} /> Palettes prédéfinies
              </p>
              <div className="grid grid-cols-2 gap-2">
                {currentPresets.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-2 p-2 rounded-lg text-left transition-all"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${accentColor === preset.accent ? '#6366f1' : 'transparent'}`,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded flex-shrink-0"
                      style={{ backgroundColor: preset.bg, border: `2px solid ${preset.accent}` }}
                    />
                    <span className="text-xs text-gray-300 truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-medium px-1 flex items-center gap-1.5">
                <FiSliders size={11} /> Personnaliser
              </p>
              {[
                { label: 'Couleur accentuation', value: accentColor, onChange: setAccentColor },
                { label: 'Fond de page', value: bgColor, onChange: setBgColor },
                { label: 'Couleur du texte', value: textColor, onChange: setTextColor },
              ].map(({ label, value, onChange }) => (
                <div key={label} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={value || '#6366f1'}
                    onChange={e => onChange(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-gray-700 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-xs font-mono text-gray-600">{value || '—'}</p>
                  </div>
                </div>
              ))}

              {/* ⭐ NOUVEAU : réglage spécifique au modèle sélectionné.
                  Absent pour Minimal car ce modèle n'a pas de panneau/carte. */}
              {selectedTemplate !== 'minimal' && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={panelColor || PANEL_COLOR_DEFAULTS[selectedTemplate]}
                    onChange={e => setPanelColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-gray-700 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">{PANEL_COLOR_LABEL[selectedTemplate]}</p>
                    <p className="text-xs font-mono text-gray-600">{panelColor || 'Par défaut'}</p>
                  </div>
                  {panelColor && (
                    <button onClick={() => setPanelColor('')} className="text-[10px] text-gray-500 hover:text-gray-300">
                      Réinitialiser
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3 mt-5 pt-4 border-t border-white/5">
              <p className="text-xs text-gray-400 font-medium px-1 flex items-center gap-1.5">
                <FiImage size={11} /> Style des images
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(['contain', 'cover'] as const).map(fitOpt => (
                  <button
                    key={fitOpt}
                    onClick={() => setImageFit(fitOpt)}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: imageFit === fitOpt ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${imageFit === fitOpt ? '#6366f1' : 'transparent'}`,
                      color: imageFit === fitOpt ? '#c7d2fe' : '#9ca3af',
                    }}
                  >
                    {fitOpt === 'contain' ? 'Image entière' : 'Remplir le cadre'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 px-1">
                {imageFit === 'contain'
                  ? "L'image ne sera jamais recadrée, même si son format diffère du cadre."
                  : "L'image remplit tout l'espace disponible (peut être légèrement recadrée)."}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(['square', 'rounded'] as const).map(styleOpt => (
                  <button
                    key={styleOpt}
                    onClick={() => setImageFrameStyle(styleOpt)}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: imageFrameStyle === styleOpt ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${imageFrameStyle === styleOpt ? '#6366f1' : 'transparent'}`,
                      color: imageFrameStyle === styleOpt ? '#c7d2fe' : '#9ca3af',
                    }}
                  >
                    {styleOpt === 'square' ? 'Carré net' : 'Arrondi'}
                  </button>
                ))}
              </div>
              {imageFrameStyle === 'rounded' && (
                <div className="flex items-center gap-3 px-1">
                  <span className="text-xs text-gray-500 w-16">Rayon</span>
                  <input
                    type="range"
                    min={4}
                    max={48}
                    value={imageBorderRadius}
                    onChange={e => setImageBorderRadius(Number(e.target.value))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-xs text-gray-400 w-8 text-right">{imageBorderRadius}px</span>
                </div>
              )}
              <div className="flex items-center gap-3 px-1">
                <input
                  type="color"
                  value={imageBgColor || '#f0f0f0'}
                  onChange={e => setImageBgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border border-gray-700 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Fond derrière les images</p>
                  <p className="text-xs font-mono text-gray-600">{imageBgColor || 'Auto'}</p>
                </div>
                {imageBgColor && (
                  <button onClick={() => setImageBgColor('')} className="text-[10px] text-gray-500 hover:text-gray-300">
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* ⭐ NOUVEAU : bordure (cadre) réellement rendue désormais, via ImageBlock */}
              <div className="flex items-center gap-3 px-1 pt-2 border-t border-white/5 mt-2">
                <input
                  type="color"
                  value={frameBorderColor || '#ffffff'}
                  onChange={e => setFrameBorderColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border border-gray-700 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Bordure autour des images</p>
                  <p className="text-xs font-mono text-gray-600">{frameBorderColor ? `${frameBorderWidth}px` : 'Aucune'}</p>
                </div>
                {frameBorderColor && (
                  <button onClick={() => setFrameBorderColor('')} className="text-[10px] text-gray-500 hover:text-gray-300">
                    Réinitialiser
                  </button>
                )}
              </div>
              {frameBorderColor && (
                <div className="flex items-center gap-3 px-1">
                  <span className="text-xs text-gray-500 w-16">Épaisseur</span>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={frameBorderWidth}
                    onChange={e => setFrameBorderWidth(Number(e.target.value))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-xs text-gray-400 w-8 text-right">{frameBorderWidth}px</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="px-3 py-3 border-t border-white/5 space-y-2">
        {step !== 'customize' ? (
          <button
            onClick={() => {
              if (step === 'template') setStep('product');
              else if (step === 'product') setStep('customize');
            }}
            disabled={step === 'product' && !selectedProductId}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: (step === 'template' || selectedProductId) ? '#6366f1' : '#374151',
              color: (step === 'template' || selectedProductId) ? '#ffffff' : '#6b7280',
              cursor: (step === 'template' || selectedProductId) ? 'pointer' : 'not-allowed',
            }}
          >
            Continuer →
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedProduct}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              opacity: isGenerating ? 0.7 : 1,
            }}
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Génération…
              </>
            ) : (
              <>
                <FiZap size={15} />
                Générer la page
              </>
            )}
          </button>
        )}
        {step !== 'template' && (
          <button
            onClick={() => {
              if (step === 'product') setStep('template');
              if (step === 'customize') setStep('product');
            }}
            className="w-full py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Retour
          </button>
        )}
      </div>
    </div>
  );
}