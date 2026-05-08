'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface Props {
  element: { type: string; id: string; props: any };
  customization: any;
  onUpdate: (updates: any) => void;
}

export function ElementProperties({ element, customization, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'style' | 'content' | 'animation'>('style');

  // Propriétés de la bannière
  if (element.type === 'banner') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          {[
            { id: 'style', label: 'Style' },
            { id: 'content', label: 'Contenu' },
            { id: 'animation', label: 'Animation' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2 py-1 text-sm rounded ${
                activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'style' && (
          <>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Type de bannière</label>
              <select
                value={element.props.type || 'full_width'}
                onChange={(e) => onUpdate({ type: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="full_width">Pleine largeur</option>
                <option value="boxed">Encadrée</option>
                <option value="hero">Héros (plein écran)</option>
                <option value="split">Split 50/50</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Hauteur (px)</label>
              <input
                type="range"
                min="200"
                max="800"
                value={element.props.height || 400}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-right text-xs text-gray-400">{element.props.height || 400}px</div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Opacité de l'overlay</label>
              <input
                type="range"
                min="0"
                max="100"
                value={element.props.overlayOpacity || 30}
                onChange={(e) => onUpdate({ overlayOpacity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Couleur de l'overlay</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-700 cursor-pointer"
                  style={{ backgroundColor: element.props.overlayColor || '#000000' }}
                />
                <input
                  type="text"
                  value={element.props.overlayColor || '#000000'}
                  onChange={(e) => onUpdate({ overlayColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Position du texte</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => onUpdate({ textPosition: pos })}
                    className={`flex-1 py-2 rounded ${
                      element.props.textPosition === pos
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {pos === 'left' ? '← Gauche' : pos === 'center' ? '↔ Centre' : 'Droite →'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'content' && (
          <>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Titre</label>
              <input
                type="text"
                value={element.props.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Sous-titre</label>
              <input
                type="text"
                value={element.props.subtitle || ''}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Texte du bouton</label>
              <input
                type="text"
                value={element.props.buttonText || 'Découvrir'}
                onChange={(e) => onUpdate({ buttonText: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </>
        )}

        {activeTab === 'animation' && (
          <>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Animation d'entrée</label>
              <select
                value={element.props.animation || 'none'}
                onChange={(e) => onUpdate({ animation: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="none">Aucune</option>
                <option value="fade">Fondu</option>
                <option value="slide-up">Glissement vers le haut</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>
          </>
        )}
      </div>
    );
  }

  // Propriétés du logo
  if (element.type === 'logo') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Position</label>
          <div className="flex gap-2">
            {['left', 'center', 'right'].map(pos => (
              <button
                key={pos}
                onClick={() => onUpdate({ position: pos })}
                className={`flex-1 py-2 rounded ${
                  element.props.position === pos
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {pos === 'left' ? '← Gauche' : pos === 'center' ? '↔ Centre' : 'Droite →'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Taille (px)</label>
          <input
            type="range"
            min="40"
            max="200"
            value={element.props.size || 80}
            onChange={(e) => onUpdate({ size: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Forme</label>
          <div className="flex gap-2">
            {['rounded', 'circle', 'square'].map(shape => (
              <button
                key={shape}
                onClick={() => onUpdate({ shape })}
                className={`flex-1 py-2 rounded ${
                  element.props.shape === shape
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {shape === 'rounded' ? 'Arrondi' : shape === 'circle' ? 'Cercle' : 'Carré'}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-gray-300 text-sm">
          <input
            type="checkbox"
            checked={element.props.border !== false}
            onChange={(e) => onUpdate({ border: e.target.checked })}
          />
          Bordure blanche
        </label>
      </div>
    );
  }

  // Propriétés d'une section
  if (element.type === 'section') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Titre</label>
          <input
            type="text"
            value={element.props.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Contenu</label>
          <textarea
            value={element.props.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Couleur de fond</label>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border border-gray-700 cursor-pointer"
              style={{ backgroundColor: element.props.backgroundColor || '#f3f4f6' }}
            />
            <input
              type="text"
              value={element.props.backgroundColor || '#f3f4f6'}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-gray-300 text-sm">
          <input
            type="checkbox"
            checked={element.props.isVisible !== false}
            onChange={(e) => onUpdate({ isVisible: e.target.checked })}
          />
          Section visible
        </label>
      </div>
    );
  }

  // Propriétés d'un asset (sticker, texte, etc.)
  if (element.type === 'asset') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Type</label>
          <select
            value={element.props.type || 'text'}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="text">Texte</option>
            <option value="image">Image</option>
            <option value="shape">Forme</option>
          </select>
        </div>
        {element.props.type === 'text' && (
          <>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Contenu</label>
              <input
                type="text"
                value={element.props.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Police</label>
              <select
                value={element.props.fontFamily || 'Inter'}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Taille</label>
              <input
                type="range"
                min="12"
                max="72"
                value={element.props.fontSize || 16}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Couleur</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-700 cursor-pointer"
                  style={{ backgroundColor: element.props.textColor || '#000000' }}
                />
                <input
                  type="text"
                  value={element.props.textColor || '#000000'}
                  onChange={(e) => onUpdate({ textColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </>
        )}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Position X</label>
          <input
            type="range"
            min="0"
            max="100"
            value={element.props.posX || 0}
            onChange={(e) => onUpdate({ posX: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Position Y</label>
          <input
            type="range"
            min="0"
            max="100"
            value={element.props.posY || 0}
            onChange={(e) => onUpdate({ posY: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Rotation</label>
          <input
            type="range"
            min="0"
            max="360"
            value={element.props.rotation || 0}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-400 text-sm text-center py-8">
      Sélectionnez un élément pour le modifier
    </div>
  );
}