'use client';

import { useState } from 'react';
import { FiCode, FiLayout, FiGrid, FiEye, FiGlobe, FiCpu } from 'react-icons/fi';

interface Props {
  customization: any;
  onUpdate: (updates: any) => void;
}

export default function SettingsPanel({ customization, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'layout' | 'advanced' | 'performance'>('layout');

  const tabs = [
    { id: 'layout', label: 'Mise en page', icon: FiLayout },
    { id: 'advanced', label: 'CSS/JS avancé', icon: FiCode },
    { id: 'performance', label: 'Performance', icon: FiCpu },
  ];

  return (
    <div className="space-y-6">
      {/* Onglets */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Layout Settings */}
      {activeTab === 'layout' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Type de layout</label>
            <select
              value={customization.layoutType || 'full_width'}
              onChange={(e) => onUpdate({ layoutType: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="full_width">Pleine largeur</option>
              <option value="boxed">Boxed (centré)</option>
              <option value="framed">Encadré</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Style d'en-tête</label>
            <select
              value={customization.headerStyle || 'full_banner'}
              onChange={(e) => onUpdate({ headerStyle: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="full_banner">Bannière pleine largeur</option>
              <option value="centered_logo">Logo centré</option>
              <option value="minimal">Minimaliste</option>
              <option value="sticky">Sticky</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Affichage des produits</label>
            <select
              value={customization.productDisplayStyle || 'grid_4'}
              onChange={(e) => onUpdate({ productDisplayStyle: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="grid_2">Grille 2 colonnes</option>
              <option value="grid_3">Grille 3 colonnes</option>
              <option value="grid_4">Grille 4 colonnes</option>
              <option value="list">Liste</option>
              <option value="carousel">Carrousel</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Effet de survol</label>
            <select
              value={customization.hoverEffect || 'scale'}
              onChange={(e) => onUpdate({ hoverEffect: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="scale">Zoom</option>
              <option value="glow">Lueur</option>
              <option value="slide">Glissement</option>
              <option value="none">Aucun</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Animation de page</label>
            <select
              value={customization.pageTransition || 'fade'}
              onChange={(e) => onUpdate({ pageTransition: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="fade">Fondu</option>
              <option value="slide">Glissement</option>
              <option value="zoom">Zoom</option>
              <option value="none">Aucune</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-gray-300 text-sm">
            <input
              type="checkbox"
              checked={customization.enable3DEffect || false}
              onChange={(e) => onUpdate({ enable3DEffect: e.target.checked })}
            />
            Activer l'effet 3D sur les produits
          </label>
        </div>
      )}

      {/* Advanced CSS/JS Settings */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">CSS personnalisé</label>
            <textarea
              value={customization.customCss || ''}
              onChange={(e) => onUpdate({ customCss: e.target.value })}
              placeholder=".mon-element { color: red; }"
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">JavaScript personnalisé</label>
            <textarea
              value={customization.customJs || ''}
              onChange={(e) => onUpdate({ customJs: e.target.value })}
              placeholder="console.log('Hello world');"
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono"
            />
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-xs">
              ⚠️ Attention: Un code CSS/JS malveillant peut affecter votre boutique.
            </p>
          </div>
        </div>
      )}

      {/* Performance Settings */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-white text-sm font-medium mb-2">Optimisation des images</h4>
            <div className="space-y-2">
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option>Qualité automatique</option>
                <option>Haute qualité</option>
                <option>Équilibré</option>
                <option>Performance maximale</option>
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-medium mb-2">Mise en cache</h4>
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input
                type="checkbox"
                defaultChecked
                className="rounded"
              />
              Activer le cache navigateur
            </label>
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input
                type="checkbox"
                defaultChecked
                className="rounded"
              />
              Précharger les pages
            </label>
          </div>

          <div>
            <h4 className="text-white text-sm font-medium mb-2">SEO</h4>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Meta title par défaut</label>
              <input
                type="text"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="{shop_name} - Boutique en ligne"
              />
            </div>
            <div className="mt-2">
              <label className="text-sm text-gray-400 block mb-1">Meta description</label>
              <textarea
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Découvrez notre boutique..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}