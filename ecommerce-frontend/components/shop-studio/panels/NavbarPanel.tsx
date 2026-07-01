'use client';
import { useState, useMemo } from 'react';
import {
  FiPlus, FiTrash2, FiMove, FiCopy, FiEye, FiEyeOff, FiChevronDown, FiChevronRight, FiLink,
  FiMenu, FiSliders, FiLayout, FiZap, FiMaximize2, FiColumns,
} from 'react-icons/fi';
import { getImageUrl } from '@/utils/imageUtils';
import { NavbarConfig, NavButton, StudioPage } from '@/types/studio';
import { useNavButtons } from '@/hooks/useNavButtons';
import { NAV_ICON_PRESETS } from '../blocks/navbar/navIcons';
import { usePreviewOnRealElement } from '@/hooks/useBlockAnimation';
import type { PageTransitionType, EasingPreset, PageTransitionConfig } from '@/types/animations';

interface Props {
  block: any;
  pages: StudioPage[];
  onUpdateBlock: (id: string, updates: any) => void;
  currentPageId?: string; // ⭐ NOUVEAU
}

const FONTS = ['Inter', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans', 'Lato', 'Raleway'];

const VARIANT_META: Record<string, { label: string; icon: any }> = {
  horizontal: { label: 'Horizontale', icon: FiMenu },
  hero: { label: 'Hero', icon: FiMaximize2 },
  sidebar: { label: 'Verticale', icon: FiColumns },
};

const TABS = [
  { id: 'buttons', label: 'Boutons', icon: FiLink },
  { id: 'style', label: 'Style', icon: FiSliders },
  { id: 'layout', label: 'Disposition', icon: FiLayout },
  { id: 'animations', label: 'Animations', icon: FiZap },
] as const;

export default function NavbarPanel({ block, pages, onUpdateBlock, currentPageId }: Props) {
  const navConfig: NavbarConfig = block.props?.navConfig;
  const [tab, setTab] = useState<typeof TABS[number]['id']>('buttons');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // ⭐ NOUVEAU : hook pour prévisualiser la transition sur la page actuelle
  const { playPageTransition } = usePreviewOnRealElement(currentPageId ? `page-${currentPageId}` : '__no_page__');
  const pageTransition = navConfig?.pageTransition;

  const setNavConfig = (next: NavbarConfig) => onUpdateBlock(block.id, { navConfig: next });
  const { addButton, removeButton, updateButton, reorderButtons, duplicateButton } = useNavButtons(navConfig, setNavConfig);

  const sortedButtons = useMemo(() => [...navConfig.buttons].sort((a, b) => a.order - b.order), [navConfig.buttons]);

  const openIconPicker = (buttonId: string) => {
    const ev = new CustomEvent('openAssetPicker', {
      detail: { callback: (asset: any) => updateButton(buttonId, { icon: { type: 'custom', url: getImageUrl(asset.url) } }) },
    });
    window.dispatchEvent(ev);
  };

  // ⭐ Helper pour mettre à jour la transition de page
  const updatePageTransition = (patch: Partial<PageTransitionConfig>) => {
    setNavConfig({
      ...navConfig,
      pageTransition: {
        type: 'none',
        duration: 0.4,
        ease: 'power2.inOut',
        ...pageTransition,
        ...patch,
      },
    });
  };

  if (!navConfig) {
    return (
      <div className="flex flex-col items-center text-center py-10 text-gray-500 text-xs gap-2">
        <FiMenu size={22} className="text-gray-600" />
        Sélectionnez une Navbar pour la configurer
      </div>
    );
  }

  const meta = VARIANT_META[navConfig.variant] || VARIANT_META.horizontal;
  const VariantIcon = meta.icon;

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
          <VariantIcon size={15} className="text-purple-400" />
        </div>
        <div className="min-w-0">
          <div className="text-white text-sm font-semibold leading-tight">Navbar {meta.label}</div>
          <div className="text-[10px] text-gray-500">Globale • visible sur toutes les pages</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/30 rounded-lg p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium transition-colors
              ${tab === id ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ──────────────── BOUTONS ──────────────── */}
      {tab === 'buttons' && (
        <div className="space-y-2">
          <button
            onClick={() => addButton()}
            className="w-full py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <FiPlus size={12} /> Ajouter un bouton
          </button>

          {sortedButtons.length === 0 && (
            <p className="text-center text-[11px] text-gray-500 py-4">Aucun bouton — ajoutez-en un pour démarrer.</p>
          )}

          {sortedButtons.map((btn, index) => {
            const isExpanded = expandedId === btn.id;
            return (
              <div key={btn.id} className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                <div
                  className="flex items-center gap-2 px-2 py-2"
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null && dragIndex !== index) reorderButtons(dragIndex, index);
                    setDragIndex(null);
                  }}
                >
                  <FiMove size={12} className="text-gray-500 cursor-grab flex-shrink-0" />
                  <button onClick={() => setExpandedId(isExpanded ? null : btn.id)} className="text-gray-400 flex-shrink-0">
                    {isExpanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
                  </button>
                  <span className="flex-1 text-xs text-gray-200 truncate">{btn.label || '(sans titre)'}</span>
                  {btn.link.type === 'page' && <FiLink size={11} className="text-emerald-400 flex-shrink-0" title="Lié à une page" />}
                  <button onClick={() => updateButton(btn.id, { isVisible: !btn.isVisible })} className="text-gray-500 hover:text-white flex-shrink-0">
                    {btn.isVisible ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                  </button>
                  <button onClick={() => duplicateButton(btn.id)} className="text-gray-500 hover:text-emerald-400 flex-shrink-0"><FiCopy size={12} /></button>
                  <button onClick={() => removeButton(btn.id)} className="text-gray-500 hover:text-red-400 flex-shrink-0"><FiTrash2 size={12} /></button>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                    {/* Texte */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Texte du bouton</label>
                      <input
                        type="text" value={btn.label}
                        onChange={(e) => updateButton(btn.id, { label: e.target.value })}
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>

                    {/* Page liée */}
                    <div className="bg-black/20 rounded-lg p-2 space-y-2">
                      <label className="text-xs text-gray-400 block">🔗 Page liée</label>
                      <select
                        value={btn.link.type === 'page' ? btn.link.pageId : ''}
                        onChange={(e) => {
                          const pageId = e.target.value;
                          updateButton(btn.id, { link: pageId ? { type: 'page', pageId } : { type: 'none' } });
                        }}
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="">— Aucune page liée —</option>
                        {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>

                      <details className="text-xs">
                        <summary className="text-gray-500 cursor-pointer">Ou lien externe…</summary>
                        <div className="mt-2 space-y-2">
                          <input
                            type="text" placeholder="https://..."
                            value={btn.link.type === 'url' ? btn.link.url : ''}
                            onChange={(e) => updateButton(btn.id, { link: { type: 'url', url: e.target.value, openInNewTab: btn.link.type === 'url' ? btn.link.openInNewTab : false } })}
                            className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs"
                          />
                          {btn.link.type === 'url' && (
                            <label className="flex items-center gap-2 text-gray-400">
                              <input type="checkbox" checked={!!btn.link.openInNewTab} onChange={(e) => updateButton(btn.id, { link: { ...btn.link, openInNewTab: e.target.checked } as any })} />
                              Ouvrir dans un nouvel onglet
                            </label>
                          )}
                        </div>
                      </details>
                    </div>

                    {/* Icône */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Icône</label>
                      <div className="grid grid-cols-5 gap-1 mb-2">
                        {Object.entries(NAV_ICON_PRESETS).map(([name, Icon]) => (
                          <button
                            key={name}
                            onClick={() => updateButton(btn.id, { icon: { type: 'preset', presetName: name } })}
                            className={`p-2 rounded border flex items-center justify-center ${btn.icon?.type === 'preset' && btn.icon.presetName === name ? 'border-primary bg-primary/20 text-primary' : 'border-white/10 text-gray-400 hover:text-white'}`}
                          >
                            <Icon size={14} />
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openIconPicker(btn.id)} className="flex-1 text-xs py-1 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 rounded">📚 Icône perso</button>
                        <button onClick={() => updateButton(btn.id, { icon: { type: 'none' } })} className="text-xs py-1 px-2 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 rounded">✕</button>
                      </div>
                      {btn.icon && btn.icon.type !== 'none' && (
                        <select value={btn.iconPosition || 'left'} onChange={(e) => updateButton(btn.id, { iconPosition: e.target.value as any })} className="w-full mt-2 bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs">
                          <option value="left">Icône à gauche</option>
                          <option value="right">Icône à droite</option>
                          <option value="only">Icône seule</option>
                        </select>
                      )}
                    </div>

                    {/* Override style */}
                    <details className="text-xs">
                      <summary className="text-gray-500 cursor-pointer">Style spécifique à ce bouton (override)</summary>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-gray-400 block mb-1">Couleur texte</label>
                          <input type="color" value={btn.style?.textColor || navConfig.defaultButtonStyle.textColor || '#000000'} onChange={(e) => updateButton(btn.id, { style: { ...btn.style, textColor: e.target.value } })} className="w-full h-7 rounded cursor-pointer" />
                        </div>
                        <div>
                          <label className="text-gray-400 block mb-1">Fond</label>
                          <input type="color" value={btn.style?.backgroundColor || navConfig.defaultButtonStyle.backgroundColor || '#ffffff'} onChange={(e) => updateButton(btn.id, { style: { ...btn.style, backgroundColor: e.target.value } })} className="w-full h-7 rounded cursor-pointer" />
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────── STYLE GLOBAL ──────────────── */}
      {tab === 'style' && (
        <div className="space-y-3">
          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3 space-y-2">
            <h4 className="text-white text-xs font-semibold">Boutons — style par défaut</h4>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-400 block mb-1">Police</label>
                <select value={navConfig.defaultButtonStyle.fontFamily || 'Inter'} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonStyle: { ...navConfig.defaultButtonStyle, fontFamily: e.target.value } })} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs">
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-400 block mb-1">Taille texte: {navConfig.defaultButtonStyle.fontSize || 14}px</label>
                <input type="range" min={10} max={28} value={navConfig.defaultButtonStyle.fontSize || 14} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonStyle: { ...navConfig.defaultButtonStyle, fontSize: parseInt(e.target.value) } })} className="w-full accent-primary" />
              </div>
              <div><label className="text-xs text-gray-400 block mb-1">Couleur texte</label>
                <input type="color" value={navConfig.defaultButtonStyle.textColor || '#000000'} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonStyle: { ...navConfig.defaultButtonStyle, textColor: e.target.value } })} className="w-full h-8 rounded cursor-pointer" />
              </div>
              <div><label className="text-xs text-gray-400 block mb-1">Couleur fond bouton</label>
                <input type="color" value={navConfig.defaultButtonStyle.backgroundColor || '#ffffff'} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonStyle: { ...navConfig.defaultButtonStyle, backgroundColor: e.target.value } })} className="w-full h-8 rounded cursor-pointer" />
              </div>
              <div><label className="text-xs text-gray-400 block mb-1">Bordure: {navConfig.defaultButtonStyle.borderWidth || 0}px</label>
                <input type="range" min={0} max={5} value={navConfig.defaultButtonStyle.borderWidth || 0} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonStyle: { ...navConfig.defaultButtonStyle, borderWidth: parseInt(e.target.value) } })} className="w-full accent-primary" />
              </div>
              <div><label className="text-xs text-gray-400 block mb-1">Rayon: {navConfig.defaultButtonStyle.borderRadius || 0}px</label>
                <input type="range" min={0} max={40} value={navConfig.defaultButtonStyle.borderRadius || 0} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonStyle: { ...navConfig.defaultButtonStyle, borderRadius: parseInt(e.target.value) } })} className="w-full accent-primary" />
              </div>
              <div><label className="text-xs text-gray-400 block mb-1">Padding horizontal: {navConfig.defaultButtonStyle.paddingX || 0}px</label>
                <input type="range" min={0} max={40} value={navConfig.defaultButtonStyle.paddingX || 0} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonStyle: { ...navConfig.defaultButtonStyle, paddingX: parseInt(e.target.value) } })} className="w-full accent-primary" />
              </div>
              <div><label className="text-xs text-gray-400 block mb-1">Padding vertical: {navConfig.defaultButtonStyle.paddingY || 0}px</label>
                <input type="range" min={0} max={40} value={navConfig.defaultButtonStyle.paddingY || 0} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonStyle: { ...navConfig.defaultButtonStyle, paddingY: parseInt(e.target.value) } })} className="w-full accent-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3 space-y-2">
            <h4 className="text-white text-xs font-semibold">Fond de la navbar</h4>
            <input type="color" value={navConfig.backgroundColor || '#ffffff'} onChange={(e) => setNavConfig({ ...navConfig, backgroundColor: e.target.value, backgroundType: 'solid' })} className="w-full h-8 rounded cursor-pointer" />
          </div>
        </div>
      )}

      {/* ──────────────── DISPOSITION ──────────────── */}
      {tab === 'layout' && (
        <div className="space-y-3">
          <div><label className="text-xs text-gray-400 block mb-1">Alignement</label>
            <div className="flex gap-1">
              {(['left', 'center', 'right', 'space-between'] as const).map(a => (
                <button key={a} onClick={() => setNavConfig({ ...navConfig, alignment: a })} className={`flex-1 py-1 text-xs rounded ${navConfig.alignment === a ? 'bg-primary text-white' : 'bg-white/[0.05] text-gray-300'}`}>{a}</button>
              ))}
            </div>
          </div>
          <div><label className="text-xs text-gray-400 block mb-1">Espacement: {navConfig.gap ?? 24}px</label>
            <input type="range" min={0} max={60} value={navConfig.gap ?? 24} onChange={(e) => setNavConfig({ ...navConfig, gap: parseInt(e.target.value) })} className="w-full accent-primary" />
          </div>
          <label className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Logo visible</span>
            <input type="checkbox" checked={!!navConfig.showLogo} onChange={(e) => setNavConfig({ ...navConfig, showLogo: e.target.checked })} />
          </label>
          {navConfig.variant === 'horizontal' && (
            <label className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Navbar collante (sticky)</span>
              <input type="checkbox" checked={!!navConfig.sticky} onChange={(e) => setNavConfig({ ...navConfig, sticky: e.target.checked })} />
            </label>
          )}
          {navConfig.variant === 'sidebar' && (
            <>
              <div><label className="text-xs text-gray-400 block mb-1">Largeur: {navConfig.sidebar?.width ?? 280}px</label>
                <input type="range" min={180} max={400} value={navConfig.sidebar?.width ?? 280} onChange={(e) => setNavConfig({ ...navConfig, sidebar: { ...navConfig.sidebar, width: parseInt(e.target.value) } })} className="w-full accent-primary" />
              </div>
              <div><label className="text-xs text-gray-400 block mb-1">Position</label>
                <div className="flex gap-1">
                  {(['left', 'right'] as const).map(p => (
                    <button key={p} onClick={() => setNavConfig({ ...navConfig, sidebar: { ...navConfig.sidebar, position: p } })} className={`flex-1 py-1 text-xs rounded ${navConfig.sidebar?.position === p ? 'bg-primary text-white' : 'bg-white/[0.05] text-gray-300'}`}>{p === 'left' ? 'Gauche' : 'Droite'}</button>
                  ))}
                </div>
              </div>
            </>
          )}
          {navConfig.variant === 'hero' && (
            <>
              <div><label className="text-xs text-gray-400 block mb-1">Hauteur: {navConfig.hero?.height ?? 140}px</label>
                <input type="range" min={80} max={320} value={navConfig.hero?.height ?? 140} onChange={(e) => setNavConfig({ ...navConfig, hero: { ...navConfig.hero, height: parseInt(e.target.value) } })} className="w-full accent-primary" />
              </div>
              <div><label className="text-xs text-gray-400 block mb-1">Accroche</label>
                <input type="text" value={navConfig.hero?.tagline || ''} onChange={(e) => setNavConfig({ ...navConfig, hero: { ...navConfig.hero, tagline: e.target.value } })} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs" />
              </div>
            </>
          )}
        </div>
      )}

      {/* ──────────────── ANIMATIONS ──────────────── */}
      {tab === 'animations' && (
        <div className="space-y-3">
          <div><label className="text-xs text-gray-400 block mb-1">Effet au survol</label>
            <select value={navConfig.defaultButtonAnimation.hoverEffect || 'none'} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonAnimation: { ...navConfig.defaultButtonAnimation, hoverEffect: e.target.value as any } })} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs">
              <option value="none">Aucun</option>
              <option value="underline">Soulignement</option>
              <option value="background">Éclaircir le fond</option>
              <option value="scale">Zoom léger</option>
              <option value="glow">Lueur</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-400 block mb-1">Durée transition: {navConfig.defaultButtonAnimation.transitionDuration ?? 200}ms</label>
            <input type="range" min={0} max={800} step={10} value={navConfig.defaultButtonAnimation.transitionDuration ?? 200} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonAnimation: { ...navConfig.defaultButtonAnimation, transitionDuration: parseInt(e.target.value) } })} className="w-full accent-primary" />
          </div>
          <div><label className="text-xs text-gray-400 block mb-1">Easing</label>
            <select value={navConfig.defaultButtonAnimation.transitionEasing || 'ease'} onChange={(e) => setNavConfig({ ...navConfig, defaultButtonAnimation: { ...navConfig.defaultButtonAnimation, transitionEasing: e.target.value as any } })} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs">
              <option value="ease">ease</option>
              <option value="ease-in">ease-in</option>
              <option value="ease-out">ease-out</option>
              <option value="ease-in-out">ease-in-out</option>
              <option value="linear">linear</option>
            </select>
          </div>

          {/* ⭐ NOUVEAU : transition de page */}
          <div className="border-t border-white/10 pt-3 space-y-2">
            <h4 className="text-white text-xs font-semibold">🎭 Transition entre les pages</h4>
            <p className="text-[10px] text-gray-500 -mt-1">
              Jouée quand un visiteur clique sur un bouton de cette navbar.
            </p>

            <select
              value={pageTransition?.type ?? 'none'}
              onChange={(e) => updatePageTransition({ type: e.target.value as PageTransitionType })}
              className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs"
            >
              <option value="none">Aucune</option>
              <option value="fade">Fondu</option>
              <option value="slideLeft">Glissement gauche</option>
              <option value="slideRight">Glissement droite</option>
              <option value="slideUp">Glissement haut</option>
              <option value="slideDown">Glissement bas</option>
              <option value="zoomIn">Zoom avant</option>
              <option value="zoomOut">Zoom arrière</option>
              <option value="reveal">Révélation</option>
              <option value="curtainVertical">Rideau vertical</option>
            </select>

            {pageTransition && pageTransition.type !== 'none' && (
              <>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Durée : {pageTransition.duration.toFixed(2)}s
                  </label>
                  <input
                    type="range" min={0.2} max={2} step={0.05}
                    value={pageTransition.duration}
                    onChange={(e) => updatePageTransition({ duration: parseFloat(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>

                <select
                  value={pageTransition.ease}
                  onChange={(e) => updatePageTransition({ ease: e.target.value as EasingPreset })}
                  className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs"
                >
                  <option value="power2.inOut">Lent → Rapide → Lent</option>
                  <option value="power3.inOut">Lent → Rapide → Lent (fort)</option>
                  <option value="power1.inOut">Lent → Rapide → Lent (léger)</option>
                  <option value="sine.inOut">Sinusoïdal doux</option>
                  <option value="expo.inOut">Exponentiel</option>
                </select>

                <button
                  onClick={() => playPageTransition(pageTransition)}
                  disabled={!currentPageId}
                  className="w-full py-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs rounded-lg disabled:opacity-40 hover:bg-purple-500/25 transition-colors"
                >
                  ▶ Prévisualiser sur la page actuelle
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}