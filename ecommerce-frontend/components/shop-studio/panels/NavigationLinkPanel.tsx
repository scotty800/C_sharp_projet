'use client';

import { NavLinkTarget, StudioPage } from '@/types/studio';
import { FiLink } from 'react-icons/fi';

interface Props {
  value: NavLinkTarget | undefined;
  pages: StudioPage[];
  onChange: (link: NavLinkTarget) => void;
}

/**
 * NavigationLinkPanel
 * ─────────────────────────────────────────────────────────────────────────
 * Section "Navigation" réutilisable pour TOUT élément cliquable du Studio
 * (bouton, image, forme, élément personnalisé…).
 * Stocke la liaison dans block.props.navigationLink, avec la même forme
 * (NavLinkTarget) que les boutons de Navbar — le moteur centralisé
 * (usePageNavigationEngine) traite donc tous les liens de la même façon.
 */
export default function NavigationLinkPanel({ value, pages, onChange }: Props) {
  const isEnabled = !!value && value.type === 'page';
  const selectedPageId = isEnabled ? (value as { type: 'page'; pageId: string }).pageId : '';

  const handleToggle = (enabled: boolean) => {
    onChange(enabled ? { type: 'page', pageId: pages[0]?.id ?? '' } : { type: 'none' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <FiLink size={15} className="text-emerald-400" />
        </div>
        <div className="min-w-0">
          <div className="text-white text-sm font-semibold leading-tight">Navigation</div>
          <div className="text-[10px] text-gray-500">Ouvrir une page au clic</div>
        </div>
      </div>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-xs text-gray-400">Activer la navigation</span>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
        />
      </label>

      {isEnabled && (
        <div className="bg-black/20 rounded-lg p-2 space-y-2">
          <label className="text-xs text-gray-400 block">Page de destination</label>
          <select
            value={selectedPageId}
            onChange={(e) =>
              onChange(e.target.value ? { type: 'page', pageId: e.target.value } : { type: 'none' })
            }
            className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs"
          >
            <option value="">— Choisir une page —</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <p className="text-[10px] text-gray-500 leading-snug">
            La transition de page définie sur la Navbar sera automatiquement jouée avant l'ouverture.
          </p>
          <button
            onClick={() => onChange({ type: 'none' })}
            className="w-full text-[11px] text-red-400 hover:text-red-300 py-1"
          >
            Supprimer la liaison
          </button>
        </div>
      )}

      {pages.length === 0 && (
        <p className="text-[10px] text-gray-500 text-center py-2">
          Aucune page disponible dans ce projet.
        </p>
      )}
    </div>
  );
}