'use client';

import { useState } from 'react';
import { FiType } from 'react-icons/fi';

interface Props {
  onAddText: (textData: any) => void;
}

const TEXT_PRESETS = [
  { name: 'Titre principal', fontSize: 48, fontWeight: 'bold', content: 'Titre principal', type: 'title', level: 'h1' },
  { name: 'Titre secondaire', fontSize: 36, fontWeight: 'bold', content: 'Titre secondaire', type: 'title', level: 'h2' },
  { name: 'Titre tertiaire', fontSize: 28, fontWeight: 'bold', content: 'Titre tertiaire', type: 'title', level: 'h3' },
  { name: 'Corps de texte', fontSize: 16, fontWeight: 'normal', content: 'Corps de texte', type: 'text' },
  { name: 'Texte important', fontSize: 18, fontWeight: 'bold', content: 'Texte important', type: 'text' },
];

export default function TextPanel({ onAddText }: Props) {
  const [customText, setCustomText] = useState('Nouveau texte');
  const [textType, setTextType] = useState<'title' | 'text'>('text');
  const [titleLevel, setTitleLevel] = useState<'h1' | 'h2' | 'h3'>('h2');

  const handleAddCustomText = () => {
    if (textType === 'title') {
      onAddText({
        type: 'title',
        level: titleLevel,
        title: customText,
        content: customText,
      });
    } else {
      onAddText({
        type: 'text',
        content: customText,
      });
    }
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
                type: preset.type,
                level: preset.level,
                title: preset.content,
                content: preset.content,
              })}
              className="w-full p-3 bg-gray-800 rounded-xl text-left hover:bg-gray-700 transition-colors"
            >
              <div 
                className="text-white" 
                style={{ 
                  fontSize: preset.fontSize, 
                  fontWeight: preset.fontWeight as any 
                }}
              >
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
          {/* Type de texte */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTextType('text')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  textType === 'text' ? 'bg-[#8B5CF6] text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                Texte simple
              </button>
              <button
                onClick={() => setTextType('title')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  textType === 'title' ? 'bg-[#8B5CF6] text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                Titre
              </button>
            </div>
          </div>

          {/* Niveau de titre (si title) */}
          {textType === 'title' && (
            <div>
              <label className="text-gray-400 text-sm block mb-1">Niveau</label>
              <div className="flex gap-2">
                {['h1', 'h2', 'h3'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setTitleLevel(level as any)}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      titleLevel === level ? 'bg-[#8B5CF6] text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contenu */}
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            placeholder="Votre texte..."
          />

          <button
            onClick={handleAddCustomText}
            className="w-full py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg transition-colors mt-2"
          >
            Ajouter le texte
          </button>
        </div>
      </div>

      {/* Note */}
      <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-800">
        💡 Les polices, tailles et couleurs se modifient dans le panneau "Polices"
      </div>
    </div>
  );
}