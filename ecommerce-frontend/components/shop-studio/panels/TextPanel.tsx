'use client';

import { useState } from 'react';
import { FiType, FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi';

interface Props {
  onAddText: (textData: any) => void;
}

const TEXT_PRESETS = [
  { name: 'Titre principal', fontSize: 48, fontWeight: 'bold', content: 'Titre principal' },
  { name: 'Sous-titre', fontSize: 28, fontWeight: 'normal', content: 'Sous-titre' },
  { name: 'Corps de texte', fontSize: 16, fontWeight: 'normal', content: 'Corps de texte' },
  { name: 'Citation', fontSize: 20, fontStyle: 'italic', content: 'Ceci est une citation' },
  { name: 'Bouton CTA', fontSize: 18, fontWeight: 'bold', content: 'Cliquez ici' },
];

const FONTS = [
  'Inter', 'Poppins', 'Montserrat', 'Playfair Display', 
  'Roboto', 'Open Sans', 'Lora', 'Merriweather', 'Nunito'
];

export default function TextPanel({ onAddText }: Props) {
  const [customText, setCustomText] = useState('Nouveau texte');
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState('normal');
  const [textAlign, setTextAlign] = useState('center');
  const [textColor, setTextColor] = useState('#000000');

  const handleAddCustomText = () => {
    onAddText({
      type: 'text',
      content: customText,
      fontFamily: selectedFont,
      fontSize: fontSize,
      fontWeight: fontWeight,
      textAlign: textAlign,
      textColor: textColor,
    });
  };

  return (
    <div className="space-y-6">
      {/* Styles prédéfinis */}
      <div>
        <h4 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wide">Styles prédéfinis</h4>
        <div className="space-y-2">
          {TEXT_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onAddText({
                type: 'text',
                content: preset.content,
                fontFamily: 'Inter',
                fontSize: preset.fontSize,
                fontWeight: preset.fontWeight,
                fontStyle: preset.fontStyle || 'normal',
              })}
              className="w-full p-3 bg-gray-800 rounded-xl text-left hover:bg-gray-700 transition-colors"
            >
              <div className="text-white" style={{ fontSize: preset.fontSize, fontWeight: preset.fontWeight as any }}>
                {preset.content}
              </div>
              <div className="text-gray-500 text-xs mt-1">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Texte personnalisé */}
      <div className="border-t border-gray-800 pt-4">
        <h4 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wide">Texte personnalisé</h4>
        
        <div className="space-y-3">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            placeholder="Votre texte..."
          />

          <div>
            <label className="text-gray-400 text-sm block mb-1">Police</label>
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              {FONTS.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Taille {fontSize}px</label>
            <input
              type="range"
              min="12"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Style</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`p-2 rounded-lg transition-colors ${
                  fontWeight === 'bold' ? 'bg-[#8B5CF6] text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                <FiBold size={16} />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors bg-gray-800 text-gray-400`}
              >
                <FiItalic size={16} />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors bg-gray-800 text-gray-400`}
              >
                <FiUnderline size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Alignement</label>
            <div className="flex gap-2">
              {[
                { value: 'left', icon: FiAlignLeft },
                { value: 'center', icon: FiAlignCenter },
                { value: 'right', icon: FiAlignRight },
              ].map(align => (
                <button
                  key={align.value}
                  onClick={() => setTextAlign(align.value)}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    textAlign === align.value ? 'bg-[#8B5CF6] text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <align.icon size={16} className="mx-auto" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Couleur</label>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-700"
                style={{ backgroundColor: textColor }}
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleAddCustomText}
            className="w-full py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg transition-colors mt-2"
          >
            Ajouter le texte
          </button>
        </div>
      </div>
    </div>
  );
}