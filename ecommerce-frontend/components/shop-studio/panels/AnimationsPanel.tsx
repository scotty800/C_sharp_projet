'use client';
// ============================================================
// components/shop-studio/panels/AnimationsPanel.tsx
// ============================================================
// RÈGLES :
//  - Aucune animation n'est appliquée dans le Studio
//  - La preview s'exécute sur le vrai élément du canvas
//  - En mode Shop, useBlockAnimation applique tout
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FiPlay, FiTrash2, FiPlus, FiChevronDown, FiChevronUp,
  FiEye, FiEyeOff, FiCopy, FiZap, FiX, FiLayers,
  FiMove, FiMousePointer, FiRepeat, FiSliders,
} from 'react-icons/fi';

import type {
  AnimationParams,
  AnimationCategory,
  BlockAnimationsConfig,
  EasingPreset,
  AnimationTrigger,
} from '@/types/animations';

import {
  PRESETS_BY_CATEGORY,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  instantiatePreset,
  ALL_PRESETS,
} from '@/components/shop-studio/lib/animations/presets';

import { usePreviewOnRealElement } from '@/hooks/useBlockAnimation';

// ─────────────────────────────────────────────────────────────
// CONSTANTES UI
// ─────────────────────────────────────────────────────────────

const EASING_OPTIONS: { value: EasingPreset; label: string }[] = [
  { value: 'none',          label: 'Linéaire' },
  { value: 'power1.out',    label: 'Rapide → Lent (léger)' },
  { value: 'power2.out',    label: 'Rapide → Lent' },
  { value: 'power3.out',    label: 'Rapide → Lent (fort)' },
  { value: 'power4.out',    label: 'Rapide → Lent (max)' },
  { value: 'power1.in',     label: 'Lent → Rapide (léger)' },
  { value: 'power2.in',     label: 'Lent → Rapide' },
  { value: 'power3.in',     label: 'Lent → Rapide (fort)' },
  { value: 'power2.inOut',  label: 'Lent → Rapide → Lent' },
  { value: 'back.out',      label: 'Recul puis rebond' },
  { value: 'back.inOut',    label: 'Recul double' },
  { value: 'bounce.out',    label: 'Rebond' },
  { value: 'elastic.out',   label: 'Élastique' },
  { value: 'circ.out',      label: 'Circulaire' },
  { value: 'expo.out',      label: 'Exponentiel' },
  { value: 'sine.inOut',    label: 'Sinusoïdal doux' },
];

const TRIGGER_OPTIONS: { value: AnimationTrigger; label: string; icon: string }[] = [
  { value: 'onLoad',      label: 'Au chargement',       icon: '⚡' },
  { value: 'onEnterView', label: 'Entrée dans la vue',  icon: '👁' },
  { value: 'onScroll',    label: 'Au défilement',       icon: '📜' },
  { value: 'onHover',     label: 'Au survol',           icon: '🖱' },
  { value: 'onClick',     label: 'Au clic',             icon: '👆' },
];

const CATEGORIES_ORDER: AnimationCategory[] = [
  'entrance', 'scroll', 'hover', 'loop', 'exit',
];

const CATEGORY_META: Record<AnimationCategory, { icon: string; color: string; desc: string }> = {
  entrance:   { icon: '✨', color: '#7C3AED', desc: 'Apparition' },
  scroll:     { icon: '📜', color: '#0EA5E9', desc: 'Scroll' },
  hover:      { icon: '🖱',  color: '#10B981', desc: 'Survol' },
  click:      { icon: '👆', color: '#F59E0B', desc: 'Clic' },
  loop:       { icon: '🔁', color: '#EC4899', desc: 'Boucle' },
  exit:       { icon: '👋', color: '#EF4444', desc: 'Sortie' },
};

// ─────────────────────────────────────────────────────────────
// PROPS DU COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

interface Props {
  blockId: string;
  blockType?: string;
  /** null = aucune config = onglet "Toute la page" si blockId === '__page__' */
  config: BlockAnimationsConfig | null;
  onChange: (config: BlockAnimationsConfig) => void;
  /** Mode page : affiche les animations globales */
  isPageMode?: boolean;
  /** Id de la page réellement éditée — nécessaire pour cibler le vrai cadre de page en Studio. */
  pageId?: string;
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function AnimationsPanel({
  blockId,
  blockType,
  config,
  onChange,
  isPageMode = false,
  pageId,
}: Props) {
  const [activeTab, setActiveTab]           = useState<'active' | 'library' | 'settings'>('active');
  const [selectedCategory, setSelectedCategory] = useState<AnimationCategory>('entrance');
  const [expandedAnimId, setExpandedAnimId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [previewingId, setPreviewingId]     = useState<string | null>(null);

  const animations = config?.animations ?? [];
  const activeCount = animations.filter(a => a.enabled).length;

  // ⭐ La cible réelle de prévisualisation : le bloc sélectionné,
  // ou le vrai cadre de la page en cours d'édition.
  const previewTargetId = isPageMode && pageId ? `page-${pageId}` : blockId;
  const { play: playPreview, stop: stopPreview } = usePreviewOnRealElement(previewTargetId);

  const visibleCategories = CATEGORIES_ORDER;

  // ── Ajouter depuis preset ────────────────────────────────────
  const handleAddFromPreset = useCallback(
    (presetId: string) => {
      const preset = ALL_PRESETS.find(p => p.id === presetId);
      if (!preset) return;

      const newAnim = instantiatePreset(preset);
      onChange({
        animations: [...animations, newAnim],
        disabled: config?.disabled ?? false,
        respectReducedMotion: config?.respectReducedMotion ?? true,
      });
      setExpandedAnimId(newAnim.id);
      setActiveTab('active');
    },
    [animations, config, onChange]
  );

  // ── CRUD animations ──────────────────────────────────────────
  const handleDelete = useCallback((animId: string) => {
    onChange({ ...config, animations: animations.filter(a => a.id !== animId) } as BlockAnimationsConfig);
    if (expandedAnimId === animId) setExpandedAnimId(null);
  }, [animations, config, onChange, expandedAnimId]);

  const handleDuplicate = useCallback((anim: AnimationParams) => {
    const copy: AnimationParams = {
      ...anim,
      id: `anim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: `${anim.name ?? anim.type} (copie)`,
    };
    onChange({ ...config, animations: [...animations, copy] } as BlockAnimationsConfig);
  }, [animations, config, onChange]);

  const handleToggleEnabled = useCallback((animId: string) => {
    onChange({
      ...config,
      animations: animations.map(a => a.id === animId ? { ...a, enabled: !a.enabled } : a),
    } as BlockAnimationsConfig);
  }, [animations, config, onChange]);

  const handleUpdateAnim = useCallback((animId: string, patch: Partial<AnimationParams>) => {
    onChange({
      ...config,
      animations: animations.map(a => a.id === animId ? { ...a, ...patch } : a),
    } as BlockAnimationsConfig);
  }, [animations, config, onChange]);

  // ── Filtrage bibliothèque ────────────────────────────────────
  const filteredPresets = searchQuery.trim()
    ? ALL_PRESETS.filter(p =>
        p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : PRESETS_BY_CATEGORY[selectedCategory] ?? [];

  return (
    <div className="flex flex-col gap-0 h-full">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">
            {isPageMode ? 'Animations de page' : 'Animations'}
          </span>
          {activeCount > 0 && (
            <span className="text-[10px] text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full font-medium border border-purple-500/20">
              {activeCount} active{activeCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {isPageMode && (
          <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
            <FiLayers size={10} className="inline mr-1" />
            Toute la page
          </span>
        )}
      </div>

      {/* ── Onglets ── */}
      <div className="flex rounded-xl bg-[#0a0b10] p-1 gap-0.5 mb-4 border border-gray-800/50">
        {[
          { id: 'active',   label: 'Actives',   count: animations.length },
          { id: 'library',  label: 'Ajouter' },
          { id: 'settings', label: 'Options' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-[#1a1b26] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold ${
                activeTab === tab.id ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB ACTIVES                                               */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'active' && (
        <div className="flex flex-col gap-2">
          {animations.length === 0 ? (
            <EmptyState onGoToLibrary={() => setActiveTab('library')} />
          ) : (
            animations.map(anim => (
              <AnimationCard
                key={anim.id}
                anim={anim}
                isExpanded={expandedAnimId === anim.id}
                isPreviewing={previewingId === anim.id}
                onToggleExpand={() => setExpandedAnimId(p => p === anim.id ? null : anim.id)}
                onToggleEnabled={() => handleToggleEnabled(anim.id)}
                onUpdate={patch => handleUpdateAnim(anim.id, patch)}
                onDelete={() => handleDelete(anim.id)}
                onDuplicate={() => handleDuplicate(anim)}
                onPreviewStart={() => setPreviewingId(anim.id)}
                onPreviewEnd={() => setPreviewingId(null)}
                onPreviewAnimation={playPreview}
              />
            ))
          )}

          {animations.length > 0 && (
            <button
              onClick={() => setActiveTab('library')}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-700/60 text-gray-500 hover:border-purple-500/50 hover:text-purple-400 text-[11px] font-medium transition-all"
            >
              <FiPlus size={13} />
              Ajouter une animation
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB BIBLIOTHÈQUE                                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'library' && (
        <div className="flex flex-col gap-3">

          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="search"
              placeholder="Rechercher…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0b10] border border-gray-800 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 pr-8"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
              >
                <FiX size={12} />
              </button>
            )}
          </div>

          {/* ⭐ Catégories pills filtrées */}
          {!searchQuery && (
            <div className="flex flex-wrap gap-1.5">
              {visibleCategories.map(cat => {
                const meta = CATEGORY_META[cat];
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${
                      isActive
                        ? 'text-white border-transparent'
                        : 'bg-[#0a0b10] text-gray-400 hover:text-white border-gray-800'
                    }`}
                    style={isActive ? { backgroundColor: meta.color + '33', borderColor: meta.color + '66', color: 'white' } : {}}
                  >
                    <span>{meta.icon}</span>
                    {meta.desc}
                  </button>
                );
              })}
            </div>
          )}

          {/* Grille de presets */}
          <div className="grid grid-cols-2 gap-2">
            {filteredPresets.map(preset => {
              const alreadyAdded = animations.some(a => a.type === preset.type && a.category === preset.category);
              return (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  alreadyAdded={alreadyAdded}
                  onAdd={() => handleAddFromPreset(preset.id)}
                />
              );
            })}
          </div>

          {filteredPresets.length === 0 && (
            <p className="text-center text-[11px] text-gray-600 py-6">
              Aucun résultat pour « {searchQuery} »
            </p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB OPTIONS                                               */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-4">
          <ToggleRow
            label="Désactiver toutes les animations"
            sublabel="Aucune animation ne sera jouée sur cet élément"
            checked={config?.disabled ?? false}
            onChange={v => onChange({ ...(config ?? { animations: [] }), disabled: v })}
          />
          <ToggleRow
            label="Respecter « Réduire les animations »"
            sublabel="Désactive les animations si l'utilisateur l'a activé dans son OS"
            checked={config?.respectReducedMotion ?? true}
            onChange={v => onChange({ ...(config ?? { animations: [] }), respectReducedMotion: v })}
          />
          {animations.length > 0 && (
            <button
              onClick={() => onChange({ ...(config ?? { animations: [] }), animations: [] })}
              className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <FiTrash2 size={12} />
              Tout supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRESET CARD — avec mini-preview CSS au survol
// ─────────────────────────────────────────────────────────────

function PresetCard({
  preset,
  alreadyAdded,
  onAdd,
}: {
  preset: any;
  alreadyAdded: boolean;
  onAdd: () => void;
}) {
  const [isHovered, setIsHovered]     = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Preview CSS inline déclenchée au survol
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsAnimating(true);
    timerRef.current = setTimeout(() => setIsAnimating(false), 1200);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Génère le style CSS de preview pour chaque type
  const getPreviewStyle = (): React.CSSProperties => {
    if (!isAnimating) return { opacity: 1, transform: 'none', filter: 'none', transition: 'none' };

    const dur = '0.7s';
    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

    switch (preset.type) {
      case 'fadeIn':        return { animation: `fadeIn ${dur} ${ease}` };
      case 'fadeOut':       return { animation: `fadeOut ${dur} ${ease}` };
      case 'slideUp':       return { animation: `slideUp ${dur} ${ease}` };
      case 'slideDown':     return { animation: `slideDown ${dur} ${ease}` };
      case 'slideLeft':     return { animation: `slideLeft ${dur} ${ease}` };
      case 'slideRight':    return { animation: `slideRight ${dur} ${ease}` };
      case 'zoomIn':        return { animation: `zoomIn ${dur} ${ease}` };
      case 'zoomOut':       return { animation: `zoomOut ${dur} ${ease}` };
      case 'rotateIn':      return { animation: `rotateIn ${dur} ${ease}` };
      case 'bounceIn':      return { animation: `bounceIn 0.9s cubic-bezier(0.215, 0.61, 0.355, 1)` };
      case 'elasticIn':     return { animation: `elasticIn 1s cubic-bezier(0.68, -0.55, 0.27, 1.55)` };
      case 'blurIn':        return { animation: `blurIn ${dur} ${ease}` };
      case 'flipX':         return { animation: `flipX ${dur} ${ease}` };
      case 'skewIn':        return { animation: `skewIn ${dur} ${ease}` };
      case 'float':         return { animation: `float 2s ease-in-out infinite alternate` };
      case 'pulse':         return { animation: `pulse 0.8s ease-in-out infinite alternate` };
      case 'spin':          return { animation: `spin 1.2s linear infinite` };
      case 'swing':         return { animation: `swing 1s ease-in-out infinite alternate` };
      case 'blink':         return { animation: `blink 0.6s ease-in-out infinite alternate` };
      case 'hoverScale':    return { transform: 'scale(1.18)', transition: `transform ${dur} ${ease}` };
      case 'hoverSlideUp':  return { transform: 'translateY(-8px)', transition: `transform ${dur} ${ease}` };
      case 'hoverRotate':   return { transform: 'rotate(12deg)', transition: `transform ${dur} ${ease}` };
      case 'hoverGlow':     return { boxShadow: '0 0 16px 4px rgba(124,58,237,0.6)', transition: `box-shadow ${dur} ${ease}` };
      case 'hoverPulse':    return { animation: `pulse 0.5s ease-in-out infinite alternate` };
      case 'hoverShake':    return { animation: `shake 0.4s ease-in-out` };
      case 'hoverTilt':     return { transform: 'rotate(-6deg) scale(1.05)', transition: `transform ${dur} ${ease}` };
      case 'parallax':
      case 'fadeInOnScroll':
      case 'slideUpOnScroll':
      case 'slideLeftOnScroll':
      case 'slideRightOnScroll':
      case 'zoomInOnScroll':
        return { animation: `slideUp ${dur} ${ease}` };
      case 'stagger':       return { animation: `fadeIn ${dur} ${ease}` };
      default:              return { animation: `fadeIn ${dur} ${ease}` };
    }
  };

  const meta = CATEGORY_META[preset.category as AnimationCategory] ?? { color: '#7C3AED' };

  return (
    <>
      {/* Keyframes globaux — injectés une seule fois */}
      <style>{PREVIEW_KEYFRAMES}</style>

      <button
        onClick={onAdd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all group overflow-hidden ${
          alreadyAdded
            ? 'border-purple-500/30 bg-purple-500/5'
            : 'border-gray-800 bg-[#0a0b10] hover:border-gray-600/60 hover:bg-[#0f1018]'
        }`}
      >
        {/* Mini preview zone */}
        <div className="w-full h-10 rounded-lg flex items-center justify-center mb-1"
             style={{ backgroundColor: meta.color + '10', border: `1px solid ${meta.color}20` }}>
          <div
            className="w-8 h-4 rounded"
            style={{ backgroundColor: meta.color + '80', ...getPreviewStyle() }}
          />
        </div>

        <span className="text-[11px] font-semibold text-white leading-tight">{preset.label}</span>
        <span className="text-[9px] text-gray-500 leading-tight">{preset.description}</span>

        {alreadyAdded && (
          <span className="absolute top-2 right-2 text-[8px] text-purple-400 font-bold bg-purple-500/20 px-1.5 py-0.5 rounded-full">
            ✓ Ajoutée
          </span>
        )}

        {/* Badge catégorie */}
        <span
          className="absolute bottom-2 right-2 text-[8px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: meta.color + '25', color: meta.color }}
        >
          {meta.icon} {meta.desc}
        </span>
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ANIMATION CARD — carte d'une animation active
// ⭐ Prévisualisation sur le canvas réel + auto-replay
// ─────────────────────────────────────────────────────────────

interface AnimationCardProps {
  anim: AnimationParams;
  isExpanded: boolean;
  isPreviewing: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: () => void;
  onUpdate: (patch: Partial<AnimationParams>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPreviewStart: () => void;
  onPreviewEnd: () => void;
  /** ⭐ Joue réellement l'animation sur l'élément sélectionné du canvas. */
  onPreviewAnimation: (anim: AnimationParams) => Promise<void>;
}

function AnimationCard({
  anim,
  isExpanded,
  isPreviewing,
  onToggleExpand,
  onToggleEnabled,
  onUpdate,
  onDelete,
  onDuplicate,
  onPreviewStart,
  onPreviewEnd,
  onPreviewAnimation,
}: AnimationCardProps) {
  const [isPreviewRunning, setIsPreviewRunning] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSerializedRef = useRef<string>('');

  const preset = ALL_PRESETS.find(p => p.type === anim.type && p.category === anim.category);
  const meta   = CATEGORY_META[anim.category] ?? { color: '#7C3AED', icon: '✨', desc: '' };
  const label  = anim.name ?? preset?.label ?? anim.type;

  const runPreview = useCallback(() => {
    setIsPreviewRunning(true);
    onPreviewStart();
    onPreviewAnimation(anim).finally(() => {
      setIsPreviewRunning(false);
      onPreviewEnd();
    });
  }, [anim, onPreviewAnimation, onPreviewStart, onPreviewEnd]);

  const handlePreviewClick = useCallback(() => {
    if (!isPreviewRunning) runPreview();
  }, [isPreviewRunning, runPreview]);

  // ⭐ Prévisualisation instantanée : à chaque changement de paramètre
  // pendant l'édition, on rejoue automatiquement (avec un léger debounce).
  useEffect(() => {
    if (!isExpanded) return;
    const serialized = JSON.stringify(anim);
    if (lastSerializedRef.current === serialized) return;
    const isFirstRun = lastSerializedRef.current === '';
    lastSerializedRef.current = serialized;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runPreview, isFirstRun ? 50 : 350);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim, isExpanded]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const triggerMeta = TRIGGER_OPTIONS.find(t => t.value === anim.trigger);

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      anim.enabled
        ? 'border-gray-700/60 bg-[#0d0e14]'
        : 'border-gray-800/40 bg-[#0a0b10] opacity-40'
    }`}>
      {/* En-tête */}
      <div className="flex items-center gap-2 px-3 py-2.5">

        {/* Icône catégorie colorée */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
          style={{ backgroundColor: meta.color + '20', border: `1px solid ${meta.color}40` }}
        >
          {meta.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-white truncate">{label}</div>
          <div className="text-[9px] text-gray-500 flex items-center gap-1.5 mt-0.5">
            <span>{triggerMeta?.icon} {triggerMeta?.label ?? anim.trigger}</span>
            <span className="text-gray-700">·</span>
            <span>{anim.duration}s</span>
            <span className="text-gray-700">·</span>
            <span style={{ color: meta.color + 'cc' }}>{meta.desc}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <ActionBtn title="Prévisualiser sur le canvas" onClick={handlePreviewClick} active={isPreviewRunning}>
            <FiPlay size={11} />
          </ActionBtn>
          <ActionBtn title={anim.enabled ? 'Désactiver' : 'Activer'} onClick={onToggleEnabled}>
            {anim.enabled ? <FiEye size={11} /> : <FiEyeOff size={11} />}
          </ActionBtn>
          <ActionBtn title="Dupliquer" onClick={onDuplicate}>
            <FiCopy size={11} />
          </ActionBtn>
          <ActionBtn title="Supprimer" onClick={onDelete} danger>
            <FiTrash2 size={11} />
          </ActionBtn>
          <button
            onClick={onToggleExpand}
            className="p-1.5 text-gray-600 hover:text-white transition-colors"
          >
            {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* ⭐ Remplace l'ancienne mini-boîte CSS isolée par un simple indicateur :
          la vraie animation se joue désormais sur le bloc/la page sélectionnée. */}
      <div className="mx-3 mb-2.5">
        <div
          className={`flex items-center justify-center gap-2 h-8 rounded-lg text-[10px] font-medium transition-colors ${
            isPreviewRunning ? 'bg-purple-500/15 text-purple-300' : 'bg-[#08090f] text-gray-600'
          }`}
          style={{ border: `1px solid ${meta.color}18` }}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isPreviewRunning ? 'bg-purple-400 animate-pulse' : 'bg-gray-700'}`} />
          {isPreviewRunning ? "Lecture sur l'élément sélectionné…" : 'Aperçu joué directement sur le canvas'}
        </div>
      </div>

      {/* Paramètres (expanded) */}
      {isExpanded && (
        <div className="border-t border-gray-800/60 px-3 py-3 flex flex-col gap-3">
          <style>{PREVIEW_KEYFRAMES}</style>

          {/* Nom */}
          <Field label="Nom de l'animation">
            <input
              type="text"
              value={anim.name ?? ''}
              onChange={e => onUpdate({ name: e.target.value })}
              placeholder={anim.type}
              className="input-field"
            />
          </Field>

          {/* Déclencheur */}
          <Field label="Déclencheur">
            <div className="grid grid-cols-2 gap-1.5">
              {TRIGGER_OPTIONS.map(t => (
                <button
                  key={t.value}
                  onClick={() => onUpdate({ trigger: t.value })}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] font-medium border transition-all ${
                    anim.trigger === t.value
                      ? 'border-purple-500/50 bg-purple-500/15 text-purple-300'
                      : 'border-gray-800 bg-[#0a0b10] text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-3">
            <SliderField
              label="Durée"
              value={anim.duration}
              min={0.1} max={4} step={0.05}
              unit="s"
              onChange={v => onUpdate({ duration: v })}
            />
            <SliderField
              label="Délai"
              value={anim.delay}
              min={0} max={3} step={0.05}
              unit="s"
              onChange={v => onUpdate({ delay: v })}
            />
          </div>

          {/* Easing */}
          <Field label="Easing">
            <select
              value={anim.ease}
              onChange={e => onUpdate({ ease: e.target.value as EasingPreset })}
              className="input-field"
            >
              {EASING_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          {/* Répétitions */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Répétitions">
              <select
                value={anim.repeatCount}
                onChange={e => onUpdate({ repeatCount: Number(e.target.value) })}
                className="input-field"
              >
                <option value={0}>Aucune</option>
                <option value={1}>1×</option>
                <option value={2}>2×</option>
                <option value={3}>3×</option>
                <option value={5}>5×</option>
                <option value={-1}>∞ Infini</option>
              </select>
            </Field>
            {anim.repeatCount !== 0 && (
              <Field label="Yoyo">
                <select
                  value={anim.yoyo ? 'yes' : 'no'}
                  onChange={e => onUpdate({ yoyo: e.target.value === 'yes' })}
                  className="input-field"
                >
                  <option value="no">Non</option>
                  <option value="yes">Aller-retour</option>
                </select>
              </Field>
            )}
          </div>

          {/* Transformations */}
          <TransformParams anim={anim} onUpdate={onUpdate} />

          {/* ⭐ Option rejouer — disponible pour entrance avec onEnterView */}
          {(anim.category === 'entrance' && anim.trigger === 'onEnterView') && (
            <ToggleRow
              label="Rejouer à chaque passage"
              sublabel="L'animation se rejoue à chaque fois que l'élément entre dans la vue"
              checked={anim.replayOnScroll ?? false}
              onChange={v => onUpdate({ replayOnScroll: v })}
            />
          )}

          {/* Scroll */}
          {anim.category === 'scroll' && <ScrollParams anim={anim} onUpdate={onUpdate} />}

          {/* Hover */}
          {anim.category === 'hover' && <HoverParams anim={anim} onUpdate={onUpdate} />}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PARAMÈTRES TRANSFORMATION
// ─────────────────────────────────────────────────────────────

function TransformParams({ anim, onUpdate }: { anim: AnimationParams; onUpdate: (p: Partial<AnimationParams>) => void }) {
  return (
    <div className="rounded-xl border border-gray-800/60 bg-[#08090f] overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-800/40 flex items-center gap-2">
        <FiMove size={11} className="text-gray-500" />
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Transformation</span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2.5">
        <OptionalSlider label="Opacité départ" value={anim.fromOpacity} min={0} max={1} step={0.05}
          onChange={v => onUpdate({ fromOpacity: v })} />
        <OptionalSlider label="Opacité fin" value={anim.toOpacity} min={0} max={1} step={0.05}
          onChange={v => onUpdate({ toOpacity: v })} />
        <OptionalSlider label="X départ (px)" value={anim.fromX} min={-300} max={300} step={5}
          onChange={v => onUpdate({ fromX: v })} />
        <OptionalSlider label="X fin (px)" value={anim.toX} min={-300} max={300} step={5}
          onChange={v => onUpdate({ toX: v })} />
        <OptionalSlider label="Y départ (px)" value={anim.fromY} min={-300} max={300} step={5}
          onChange={v => onUpdate({ fromY: v })} />
        <OptionalSlider label="Y fin (px)" value={anim.toY} min={-300} max={300} step={5}
          onChange={v => onUpdate({ toY: v })} />
        <OptionalSlider label="Échelle départ" value={anim.fromScale} min={0} max={3} step={0.05}
          onChange={v => onUpdate({ fromScale: v })} />
        <OptionalSlider label="Échelle fin" value={anim.toScale} min={0} max={3} step={0.05}
          onChange={v => onUpdate({ toScale: v })} />
        <OptionalSlider label="Rotation départ (°)" value={anim.fromRotation} min={-720} max={720} step={5}
          onChange={v => onUpdate({ fromRotation: v })} />
        <OptionalSlider label="Rotation fin (°)" value={anim.toRotation} min={-720} max={720} step={5}
          onChange={v => onUpdate({ toRotation: v })} />
        {(anim.type === 'blurIn' || anim.fromBlur !== undefined) && (
          <>
            <OptionalSlider label="Flou départ (px)" value={anim.fromBlur} min={0} max={40} step={1}
              onChange={v => onUpdate({ fromBlur: v })} />
            <OptionalSlider label="Flou fin (px)" value={anim.toBlur} min={0} max={40} step={1}
              onChange={v => onUpdate({ toBlur: v })} />
          </>
        )}
      </div>
    </div>
  );
}

function ScrollParams({ anim, onUpdate }: { anim: AnimationParams; onUpdate: (p: Partial<AnimationParams>) => void }) {
  return (
    <div className="rounded-xl border border-gray-800/60 bg-[#08090f] overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-800/40 flex items-center gap-2">
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Scroll</span>
      </div>
      <div className="p-3 flex flex-col gap-2.5">
        <Field label="Début (ex: top 80%)">
          <input type="text" value={anim.scrollStart ?? 'top 85%'}
            onChange={e => onUpdate({ scrollStart: e.target.value })} className="input-field" />
        </Field>
        <Field label="Fin (ex: top 30%)">
          <input type="text" value={anim.scrollEnd ?? 'top 30%'}
            onChange={e => onUpdate({ scrollEnd: e.target.value })} className="input-field" />
        </Field>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Scrub (lié au scroll)">
            <select value={anim.scrub ? 'yes' : 'no'}
              onChange={e => onUpdate({ scrub: e.target.value === 'yes' })} className="input-field">
              <option value="no">Non</option>
              <option value="yes">Oui</option>
            </select>
          </Field>
          <Field label="Épingler">
            <select value={anim.pin ? 'yes' : 'no'}
              onChange={e => onUpdate({ pin: e.target.value === 'yes' })} className="input-field">
              <option value="no">Non</option>
              <option value="yes">Oui</option>
            </select>
          </Field>
        </div>

        {/* ⭐ NOUVEAU : option rejouer à chaque passage pour les animations scroll */}
        <ToggleRow
          label="Rejouer à chaque passage"
          sublabel="L'animation se rejoue quand l'élément entre dans la vue (montée ET descente)"
          checked={anim.replayOnScroll ?? false}
          onChange={v => onUpdate({ replayOnScroll: v })}
        />

        {anim.type === 'parallax' && (
          <SliderField label="Vitesse parallax" value={anim.parallaxSpeed ?? -0.3}
            min={-1} max={1} step={0.05} onChange={v => onUpdate({ parallaxSpeed: v })} />
        )}
        {anim.type === 'stagger' && (
          <SliderField label="Décalage stagger (s)" value={anim.staggerAmount ?? 0.12}
            min={0.02} max={0.5} step={0.02} onChange={v => onUpdate({ staggerAmount: v })} />
        )}
      </div>
    </div>
  );
}

function HoverParams({ anim, onUpdate }: { anim: AnimationParams; onUpdate: (p: Partial<AnimationParams>) => void }) {
  return (
    <div className="rounded-xl border border-gray-800/60 bg-[#08090f] overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-800/40 flex items-center gap-2">
        <FiMousePointer size={11} className="text-gray-500" />
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Survol</span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2.5">
        <OptionalSlider label="Échelle" value={anim.hoverScale} min={0.5} max={2} step={0.01}
          onChange={v => onUpdate({ hoverScale: v })} />
        <OptionalSlider label="Rotation (°)" value={anim.hoverRotation} min={-45} max={45} step={1}
          onChange={v => onUpdate({ hoverRotation: v })} />
        <OptionalSlider label="Décalage X" value={anim.hoverX} min={-50} max={50} step={1}
          onChange={v => onUpdate({ hoverX: v })} />
        <OptionalSlider label="Décalage Y" value={anim.hoverY} min={-50} max={50} step={1}
          onChange={v => onUpdate({ hoverY: v })} />
        <SliderField label="Durée survol (s)" value={anim.hoverDuration ?? anim.duration}
          min={0.05} max={1} step={0.05} onChange={v => onUpdate({ hoverDuration: v })} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MICRO-COMPOSANTS
// ─────────────────────────────────────────────────────────────

function EmptyState({ onGoToLibrary }: { onGoToLibrary: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#0d0e14] border border-gray-800 flex items-center justify-center">
        <FiZap size={22} className="text-gray-700" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-300">Aucune animation</p>
        <p className="text-[11px] text-gray-600 mt-1">Donnez vie à cet élément</p>
      </div>
      <button
        onClick={onGoToLibrary}
        className="mt-1 px-5 py-2 bg-purple-600 text-white text-[11px] font-semibold rounded-xl hover:bg-purple-500 transition-colors flex items-center gap-2"
      >
        <FiPlus size={12} />
        Choisir une animation
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function SliderField({ label, value, min, max, step, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">{label}</label>
        <span className="text-[9px] text-gray-400 font-mono">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-purple-500 h-1 cursor-pointer" />
    </div>
  );
}

function OptionalSlider({ label, value, min, max, step, onChange }: {
  label: string; value: number | undefined; min: number; max: number; step: number;
  onChange: (v: number | undefined) => void;
}) {
  const isSet = value !== undefined;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider leading-tight">{label}</label>
        <button
          onClick={() => onChange(isSet ? undefined : Math.round((min + max) / 2 / step) * step)}
          className={`text-[8px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
            isSet
              ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
              : 'bg-gray-800 text-gray-500 hover:text-white'
          }`}
        >
          {isSet ? value : '—'}
        </button>
      </div>
      {isSet && (
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full accent-purple-500 h-1 cursor-pointer" />
      )}
    </div>
  );
}

function ActionBtn({ children, title, onClick, danger = false, active = false }: {
  children: React.ReactNode; title: string; onClick: () => void;
  danger?: boolean; active?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-all text-gray-500 ${
        danger
          ? 'hover:bg-red-500/15 hover:text-red-400'
          : active
          ? 'bg-purple-500/20 text-purple-400'
          : 'hover:bg-gray-800 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function ToggleRow({ label, sublabel, checked, onChange }: {
  label: string; sublabel: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`relative flex-shrink-0 mt-0.5 w-8 h-4 rounded-full transition-colors cursor-pointer ${checked ? 'bg-purple-500' : 'bg-gray-700'}`}
        onClick={() => onChange(!checked)}
      >
        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <div>
        <p className="text-[11px] font-medium text-gray-300 group-hover:text-white transition-colors">{label}</p>
        <p className="text-[9px] text-gray-600 mt-0.5">{sublabel}</p>
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────
// KEYFRAMES CSS — pour les presets cards uniquement
// ─────────────────────────────────────────────────────────────

const PREVIEW_KEYFRAMES = `
@keyframes fadeIn       { from { opacity:0 } to { opacity:1 } }
@keyframes fadeOut      { from { opacity:1 } to { opacity:0 } }
@keyframes slideUp      { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
@keyframes slideDown    { from { opacity:0; transform:translateY(-24px) } to { opacity:1; transform:translateY(0) } }
@keyframes slideLeft    { from { opacity:0; transform:translateX(24px) } to { opacity:1; transform:translateX(0) } }
@keyframes slideRight   { from { opacity:0; transform:translateX(-24px) } to { opacity:1; transform:translateX(0) } }
@keyframes zoomIn       { from { opacity:0; transform:scale(0.6) } to { opacity:1; transform:scale(1) } }
@keyframes zoomOut      { from { opacity:0; transform:scale(1.4) } to { opacity:1; transform:scale(1) } }
@keyframes rotateIn     { from { opacity:0; transform:rotate(-180deg) } to { opacity:1; transform:rotate(0) } }
@keyframes bounceIn     { 0%{opacity:0;transform:scale(.3)} 50%{opacity:1;transform:scale(1.05)} 70%{transform:scale(.9)} 100%{transform:scale(1)} }
@keyframes elasticIn    { 0%{opacity:0;transform:scale(0)} 60%{opacity:1;transform:scale(1.2)} 80%{transform:scale(0.9)} 100%{transform:scale(1)} }
@keyframes blurIn       { from { opacity:0; filter:blur(12px) } to { opacity:1; filter:blur(0) } }
@keyframes flipX        { from { opacity:0; transform:rotateY(-90deg) } to { opacity:1; transform:rotateY(0) } }
@keyframes skewIn       { from { opacity:0; transform:skewX(20deg) } to { opacity:1; transform:skewX(0) } }
@keyframes float        { from { transform:translateY(0) } to { transform:translateY(-10px) } }
@keyframes pulse        { from { transform:scale(1) } to { transform:scale(1.15) } }
@keyframes spin         { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
@keyframes swing        { from { transform:rotate(-8deg) } to { transform:rotate(8deg) } }
@keyframes blink        { from { opacity:1 } to { opacity:0.15 } }
@keyframes shake        { 0%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} 100%{transform:translateX(0)} }
`;

// ⭐ Ajout des styles input-field pour les champs de formulaire
const inputFieldStyle = `
.input-field {
  width: 100%;
  background: #0a0b10;
  border: 1px solid #2a2b35;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 11px;
  color: #e5e7eb;
  outline: none;
  transition: border-color 0.2s;
}
.input-field:focus {
  border-color: #7C3AED;
}
.input-field::placeholder {
  color: #4b4b55;
}
`;
// Injection du style dans le document (une seule fois)
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = inputFieldStyle;
  document.head.appendChild(styleEl);
}