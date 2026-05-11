'use client';

import { useState, useEffect } from 'react';

interface Props {
  selectedBlock: any;
  isBackgroundSelected: boolean;
  customization: any;
  onUpdateBlock: (id: string, updates: any) => void;
  onUpdateCustomization: (updates: any) => void;
  selectedTarget?: 'text' | 'background';
}

export default function FontsPanel({ 
  selectedBlock, 
  isBackgroundSelected, 
  customization, 
  onUpdateBlock, 
  onUpdateCustomization,
  selectedTarget = 'text'
}: Props) {
  const [activeTab, setActiveTab] = useState<'fonts' | 'text-effects'>('fonts');

  const isBanner = selectedBlock?.type === 'banner';
  const isScreenBanner = selectedBlock?.type === 'screen-banner';
  const isCarouselBanner = selectedBlock?.type === 'carousel-banner';
  const isTextBlock = selectedBlock?.type === 'text';
  const isTitleBlock = selectedBlock?.type === 'title';
  const isButtonBlock = selectedBlock?.type === 'button';
  
  const isCanvasSelected = isBackgroundSelected;
  const isBlockSelected = !isCanvasSelected && selectedBlock !== null;
  const target = selectedTarget;

  // Polices disponibles
  const fonts = [
    'Inter', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans', 
    'Playfair Display', 'Pacifico', 'Dancing Script', 'Lato', 'Raleway'
  ];

  const fontWeights = [
    { value: '300', label: 'Léger (300)' },
    { value: '400', label: 'Normal (400)' },
    { value: '500', label: 'Moyen (500)' },
    { value: '600', label: 'Semi-gras (600)' },
    { value: '700', label: 'Gras (700)' },
    { value: '800', label: 'Extra-gras (800)' },
  ];

  // ==================== POUR LE CANVAS (fond de page) ====================
  if (isCanvasSelected) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Police par défaut</label>
          <select
            value={customization?.primaryFont || 'Inter'}
            onChange={(e) => onUpdateCustomization({ primaryFont: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Police des titres</label>
          <select
            value={customization?.headingFont || 'Poppins'}
            onChange={(e) => onUpdateCustomization({ headingFont: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Police du texte</label>
          <select
            value={customization?.bodyFont || 'Inter'}
            onChange={(e) => onUpdateCustomization({ bodyFont: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // ==================== POUR LE BLOC BANNER CLASSIQUE (TEXTE) ====================
  if ((isBanner || isCarouselBanner) && target === 'text') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('fonts')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'fonts' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            📝 Polices
          </button>
          <button
            onClick={() => setActiveTab('text-effects')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'text-effects' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            ✨ Effets texte
          </button>
        </div>

        {activeTab === 'fonts' && (
          <>
            {/* Police du titre */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Police du titre</label>
              <select
                value={selectedBlock.props?.titleFont || 'Poppins'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { titleFont: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
              >
                {fonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            {/* Taille du titre */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Taille du titre: {selectedBlock.props?.titleFontSize || 48}px</label>
              <input
                type="range"
                min="24"
                max="96"
                step="1"
                value={selectedBlock.props?.titleFontSize || 48}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { titleFontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Poids du titre */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Poids du titre</label>
              <select
                value={selectedBlock.props?.titleFontWeight || '700'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { titleFontWeight: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
              >
                {fontWeights.map(w => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-700 pt-3 mt-2">
              <h4 className="text-white text-xs font-semibold mb-2">Sous-titre</h4>
              
              {/* Police du sous-titre */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Police du sous-titre</label>
                <select
                  value={selectedBlock.props?.subtitleFont || 'Inter'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleFont: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              {/* Taille du sous-titre */}
              <div className="mt-2">
                <label className="text-xs text-gray-400 block mb-1">Taille du sous-titre: {selectedBlock.props?.subtitleFontSize || 18}px</label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  step="1"
                  value={selectedBlock.props?.subtitleFontSize || 18}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleFontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Poids du sous-titre */}
              <div className="mt-2">
                <label className="text-xs text-gray-400 block mb-1">Poids du sous-titre</label>
                <select
                  value={selectedBlock.props?.subtitleFontWeight || '400'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleFontWeight: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fontWeights.map(w => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3 mt-2">
              <h4 className="text-white text-xs font-semibold mb-2">Bouton</h4>
              
              {/* Police du bouton */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Police du bouton</label>
                <select
                  value={selectedBlock.props?.buttonFont || 'Inter'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonFont: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              {/* Taille du bouton */}
              <div className="mt-2">
                <label className="text-xs text-gray-400 block mb-1">Taille du bouton: {selectedBlock.props?.buttonFontSize || 16}px</label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  step="1"
                  value={selectedBlock.props?.buttonFontSize || 16}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonFontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Poids du bouton */}
              <div className="mt-2">
                <label className="text-xs text-gray-400 block mb-1">Poids du bouton</label>
                <select
                  value={selectedBlock.props?.buttonFontWeight || '500'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonFontWeight: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fontWeights.map(w => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {activeTab === 'text-effects' && (
          <>
            {/* Couleur du titre */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Couleur du titre</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedBlock.props?.titleColor || '#ffffff'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { titleColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedBlock.props?.titleColor || '#ffffff'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { titleColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Dégradé pour le titre */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Dégradé pour le titre</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
                ].map((grad, idx) => (
                  <button
                    key={idx}
                    onClick={() => onUpdateBlock(selectedBlock.id, { titleGradient: grad, titleColor: null })}
                    className={`h-8 rounded border transition-all hover:scale-105 ${
                      selectedBlock.props?.titleGradient === grad
                        ? 'border-primary ring-1 ring-primary'
                        : 'border-gray-700'
                    }`}
                    style={{ background: grad }}
                    title={`Dégradé ${idx + 1}`}
                  />
                ))}
              </div>
              {selectedBlock.props?.titleGradient && (
                <button
                  onClick={() => onUpdateBlock(selectedBlock.id, { titleGradient: null, titleColor: '#ffffff' })}
                  className="w-full mt-2 text-xs text-gray-400 hover:text-white"
                >
                  ✕ Supprimer le dégradé
                </button>
              )}
            </div>

            {/* Couleur du sous-titre */}
            <div className="border-t border-gray-700 pt-3 mt-2">
              <label className="text-xs text-gray-400 block mb-1">Couleur du sous-titre</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedBlock.props?.subtitleColor || '#ffffff'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedBlock.props?.subtitleColor || '#ffffff'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Couleur du fond du bouton */}
            <div className="border-t border-gray-700 pt-3 mt-2">
              <label className="text-xs text-gray-400 block mb-1">Couleur du bouton</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedBlock.props?.buttonBackgroundColor || '#2563EB'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonBackgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedBlock.props?.buttonBackgroundColor || '#2563EB'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonBackgroundColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Couleur du texte du bouton */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Texte du bouton</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedBlock.props?.buttonTextColor || '#ffffff'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonTextColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedBlock.props?.buttonTextColor || '#ffffff'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonTextColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Arrondi du bouton */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Arrondi du bouton: {selectedBlock.props?.buttonBorderRadius || 8}px</label>
              <input
                type="range"
                min="0"
                max="50"
                value={selectedBlock.props?.buttonBorderRadius || 8}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonBorderRadius: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Opacité du texte */}
            <div className="border-t border-gray-700 pt-3 mt-2">
              <label className="text-xs text-gray-400 block mb-1">Opacité du texte: {selectedBlock.props?.textOpacity || 100}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedBlock.props?.textOpacity || 100}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { textOpacity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Position du texte */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Position du texte</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => onUpdateBlock(selectedBlock.id, { textPosition: pos })}
                    className={`flex-1 py-1 rounded text-xs ${selectedBlock.props?.textPosition === pos ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    {pos === 'left' ? '← Gauche' : pos === 'center' ? '↔ Centre' : '→ Droite'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ==================== POUR LE BLOC SCREEN-BANNER (TEXTE) ====================
  if (isScreenBanner && target === 'text') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('fonts')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'fonts' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            📝 Polices
          </button>
          <button
            onClick={() => setActiveTab('text-effects')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'text-effects' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            ✨ Effets texte
          </button>
        </div>

        {activeTab === 'fonts' && (
          <>
            {/* Police du titre */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Police du titre</label>
              <select
                value={selectedBlock.props?.titleFont || 'Poppins'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { titleFont: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
              >
                {fonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            {/* Taille du titre */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Taille du titre: {selectedBlock.props?.titleFontSize || 48}px</label>
              <input
                type="range"
                min="24"
                max="96"
                step="1"
                value={selectedBlock.props?.titleFontSize || 48}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { titleFontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Poids du titre */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Poids du titre</label>
              <select
                value={selectedBlock.props?.titleFontWeight || '700'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { titleFontWeight: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
              >
                {fontWeights.map(w => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-700 pt-3 mt-2">
              <h4 className="text-white text-xs font-semibold mb-2">Sous-titre</h4>
              
              {/* Taille du sous-titre */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Taille du sous-titre: {selectedBlock.props?.subtitleFontSize || 18}px</label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  step="1"
                  value={selectedBlock.props?.subtitleFontSize || 18}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleFontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Police du sous-titre */}
              <div className="mt-2">
                <label className="text-xs text-gray-400 block mb-1">Police du sous-titre</label>
                <select
                  value={selectedBlock.props?.subtitleFont || 'Inter'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleFont: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              {/* Poids du sous-titre */}
              <div className="mt-2">
                <label className="text-xs text-gray-400 block mb-1">Poids du sous-titre</label>
                <select
                  value={selectedBlock.props?.subtitleFontWeight || '400'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitleFontWeight: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fontWeights.map(w => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3 mt-2">
              <h4 className="text-white text-xs font-semibold mb-2">Bouton</h4>
              
              {/* Police du bouton */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Police du bouton</label>
                <select
                  value={selectedBlock.props?.buttonFont || 'Inter'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonFont: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                >
                  {fonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              {/* Taille du bouton */}
              <div className="mt-2">
                <label className="text-xs text-gray-400 block mb-1">Taille du bouton: {selectedBlock.props?.buttonFontSize || 16}px</label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  step="1"
                  value={selectedBlock.props?.buttonFontSize || 16}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonFontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'text-effects' && (
          <>
            {/* Couleur du titre */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Couleur du titre</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedBlock.props?.titleColor || '#ffffff'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { titleColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedBlock.props?.titleColor || '#ffffff'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { titleColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Dégradé pour le titre */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Dégradé pour le titre</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
                ].map((grad, idx) => (
                  <button
                    key={idx}
                    onClick={() => onUpdateBlock(selectedBlock.id, { titleGradient: grad, titleColor: null })}
                    className={`h-8 rounded border transition-all hover:scale-105 ${
                      selectedBlock.props?.titleGradient === grad
                        ? 'border-primary ring-1 ring-primary'
                        : 'border-gray-700'
                    }`}
                    style={{ background: grad }}
                    title={`Dégradé ${idx + 1}`}
                  />
                ))}
              </div>
              {selectedBlock.props?.titleGradient && (
                <button
                  onClick={() => onUpdateBlock(selectedBlock.id, { titleGradient: null, titleColor: '#ffffff' })}
                  className="w-full mt-2 text-xs text-gray-400 hover:text-white"
                >
                  ✕ Supprimer le dégradé
                </button>
              )}
            </div>

            {/* Contour du texte (stroke) */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Contour du texte: {selectedBlock.props?.textStrokeWidth || 0}px</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={selectedBlock.props?.textStrokeWidth || 0}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { textStrokeWidth: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {selectedBlock.props?.textStrokeWidth > 0 && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">Couleur du contour</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedBlock.props?.textStrokeColor || '#000000'}
                    onChange={(e) => onUpdateBlock(selectedBlock.id, { textStrokeColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedBlock.props?.textStrokeColor || '#000000'}
                    onChange={(e) => onUpdateBlock(selectedBlock.id, { textStrokeColor: e.target.value })}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Ombre du texte */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Ombre du texte</label>
              <select
                value={selectedBlock.props?.textShadow || 'none'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { textShadow: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
              >
                <option value="none">Aucune</option>
                <option value="2px 2px 4px rgba(0,0,0,0.3)">Légère</option>
                <option value="0px 0px 10px rgba(0,0,0,0.5)">Lueur</option>
                <option value="4px 4px 8px rgba(0,0,0,0.4)">Forte</option>
              </select>
            </div>

            {/* Opacité du texte */}
            <div className="border-t border-gray-700 pt-3 mt-2">
              <label className="text-xs text-gray-400 block mb-1">Opacité du texte: {selectedBlock.props?.textOpacity || 100}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedBlock.props?.textOpacity || 100}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { textOpacity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Position du texte */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Position du texte</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => onUpdateBlock(selectedBlock.id, { textPosition: pos })}
                    className={`flex-1 py-1 rounded text-xs ${selectedBlock.props?.textPosition === pos ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    {pos === 'left' ? '← Gauche' : pos === 'center' ? '↔ Centre' : '→ Droite'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ==================== POUR LES BLOCS TEXTE, TITRE, BOUTON ====================
  if (isBlockSelected && (isTextBlock || isTitleBlock || isButtonBlock) && target === 'text') {
    const blockProps = selectedBlock.props || {};
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('fonts')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'fonts' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            📝 Police
          </button>
          <button
            onClick={() => setActiveTab('text-effects')}
            className={`flex-1 py-1 text-xs rounded ${activeTab === 'text-effects' ? 'bg-primary text-white' : 'text-gray-400'}`}
          >
            ✨ Effets
          </button>
        </div>

        {activeTab === 'fonts' && (
          <>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Police</label>
              <select
                value={blockProps.fontFamily || customization?.bodyFont || 'Inter'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { fontFamily: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
              >
                {fonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Taille: {blockProps.fontSize || 16}px</label>
              <input
                type="range"
                min="12"
                max="72"
                value={blockProps.fontSize || 16}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Poids</label>
              <select
                value={blockProps.fontWeight || '400'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { fontWeight: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
              >
                {fontWeights.map(w => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {activeTab === 'text-effects' && (
          <>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Couleur</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={blockProps.textColor || '#000000'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { textColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={blockProps.textColor || '#000000'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { textColor: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Alignement</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => onUpdateBlock(selectedBlock.id, { textAlign: align })}
                    className={`flex-1 py-1 rounded text-xs ${blockProps.textAlign === align ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    {align === 'left' ? '← Gauche' : align === 'center' ? '↔ Centre' : '→ Droite'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Opacité: {blockProps.textOpacity || 100}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={blockProps.textOpacity || 100}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { textOpacity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // ==================== RENDU NORMAL POUR LES AUTRES BLOCS ====================
  return (
    <div className="text-center py-8">
      <p className="text-gray-400 text-xs">Sélectionnez un élément pour modifier sa police</p>
    </div>
  );
}