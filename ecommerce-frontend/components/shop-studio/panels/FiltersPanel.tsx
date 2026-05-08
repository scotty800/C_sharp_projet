'use client';

import { useState, useCallback, useMemo } from 'react';
import { FiLock, FiUnlock } from 'react-icons/fi';

interface Props {
  selectedBlock: any;
  isBackgroundSelected: boolean;
  filters: any;
  canvasFilters: any;
  onUpdateBlock: (id: string, updates: any) => void;
  onUpdateFilters: (updates: any) => void;
  onUpdateCanvasFilters: (updates: any) => void;
  onApplyToWholePage?: (updates: any) => void;
}

const FILTERABLE_BLOCK_TYPES = [
  'banner', 'image', 'shape', 'section', 'products', 'text', 'title', 'button', 'logo'
];

const filterPresets = [
  { id: 'none', name: 'Normal', cssFilter: 'none', brightness: 1, contrast: 1, saturation: 1, blur: 0 },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(0.4) contrast(1.2) brightness(0.9)', brightness: 0.9, contrast: 1.2, saturation: 0.8, blur: 0 },
  { id: 'black-white', name: 'Noir & Blanc', cssFilter: 'grayscale(1)', brightness: 1, contrast: 1.1, saturation: 0, blur: 0 },
  { id: 'sepia', name: 'Sépia', cssFilter: 'sepia(0.8)', brightness: 1, contrast: 1, saturation: 0.9, blur: 0 },
  { id: 'vivid', name: 'Vif', cssFilter: 'brightness(0.95) contrast(1.1) saturate(1.4)', brightness: 0.95, contrast: 1.1, saturation: 1.4, blur: 0 },
  { id: 'cool', name: 'Frais', cssFilter: 'brightness(0.97) saturate(0.9) hue-rotate(5deg)', brightness: 0.97, contrast: 1, saturation: 0.9, blur: 0 },
  { id: 'warm', name: 'Chaud', cssFilter: 'brightness(1.03) saturate(1.1) hue-rotate(-5deg)', brightness: 1.03, contrast: 1, saturation: 1.1, blur: 0 },
  { id: 'dramatic', name: 'Dramatique', cssFilter: 'brightness(0.9) contrast(1.3) saturate(1.2)', brightness: 0.9, contrast: 1.3, saturation: 1.2, blur: 0 },
  { id: 'glow', name: 'Lueur', cssFilter: 'brightness(1.05) saturate(1.2) blur(0.5px)', brightness: 1.05, contrast: 0.95, saturation: 1.2, blur: 0.5 },
  { id: 'soft', name: 'Doux', cssFilter: 'brightness(1.02) contrast(0.95) blur(1px)', brightness: 1.02, contrast: 0.95, saturation: 1, blur: 1 },
];

export default function FiltersPanel({ 
  selectedBlock, 
  isBackgroundSelected, 
  canvasFilters,
  onUpdateBlock, 
  onUpdateCanvasFilters,
  onApplyToWholePage
}: Props) {
  const [activeTab, setActiveTab] = useState<'presets' | 'manual'>('presets');
  const [isLocked, setIsLocked] = useState(false);

  const isCanvasSelected = isBackgroundSelected;
  const isBlockSelected = !isCanvasSelected && selectedBlock !== null;
  const blockType = selectedBlock?.type;
  const canApplyFilter = FILTERABLE_BLOCK_TYPES.includes(blockType);

  const currentFilters = useMemo(() => {
    if (isCanvasSelected) {
      return {
        brightness: canvasFilters?.globalBrightness ?? 1,
        contrast: canvasFilters?.globalContrast ?? 1,
        saturation: canvasFilters?.globalSaturation ?? 1,
        blur: canvasFilters?.globalBlur ?? 0,
        cssFilter: canvasFilters?.globalCssFilter || 'none',
      };
    }
    if (isBlockSelected && canApplyFilter) {
      return {
        brightness: selectedBlock.props?.brightness ?? 1,
        contrast: selectedBlock.props?.contrast ?? 1,
        saturation: selectedBlock.props?.saturation ?? 1,
        blur: selectedBlock.props?.blur ?? 0,
        cssFilter: selectedBlock.props?.cssFilter || 'none',
      };
    }
    return { brightness: 1, contrast: 1, saturation: 1, blur: 0, cssFilter: 'none' };
  }, [isCanvasSelected, isBlockSelected, canApplyFilter, selectedBlock, canvasFilters]);

  // ⭐ CORRECTION : Utiliser les bonnes propriétés pour le canvas
  const applyPreset = useCallback((preset: any) => {
    console.log('🎯 applyPreset - isCanvasSelected:', isCanvasSelected);
    console.log('🎯 applyPreset - preset:', preset.name);
    console.log('🎯 applyPreset - isLocked:', isLocked);
    
    if (isCanvasSelected) {
      // ⭐ Pour le canvas, on utilise les propriétés globalBrightness, globalContrast, etc.
      const updates = {
        globalBrightness: preset.brightness,
        globalContrast: preset.contrast,
        globalSaturation: preset.saturation,
        globalBlur: preset.blur || 0,
        globalCssFilter: preset.cssFilter,
      };
      console.log('🎯 Application au canvas avec updates:', updates);
      onUpdateCanvasFilters(updates);
      if (isLocked && onApplyToWholePage) {
        console.log('🎯 Application à toute la page (isLocked=true)');
        onApplyToWholePage({
          brightness: preset.brightness,
          contrast: preset.contrast,
          saturation: preset.saturation,
          blur: preset.blur || 0,
          cssFilter: preset.cssFilter,
        });
      }
    } else if (isBlockSelected && canApplyFilter) {
      // ⭐ Pour un bloc, on utilise les propriétés simples
      const updates = {
        brightness: preset.brightness,
        contrast: preset.contrast,
        saturation: preset.saturation,
        blur: preset.blur || 0,
        cssFilter: preset.cssFilter,
      };
      console.log('🎯 Application au bloc avec updates:', updates);
      onUpdateBlock(selectedBlock.id, updates);
    } else {
      console.log('🎯 Aucune cible valide pour l\'application du preset');
    }
  }, [isCanvasSelected, isBlockSelected, canApplyFilter, selectedBlock, isLocked, onUpdateBlock, onUpdateCanvasFilters, onApplyToWholePage]);

  const updateParameter = useCallback((key: string, value: number) => {
    if (isCanvasSelected) {
      const updates: any = {};
      const globalKey = `global${key.charAt(0).toUpperCase() + key.slice(1)}`;
      updates[globalKey] = value;
      const brightness = key === 'brightness' ? value : (canvasFilters?.globalBrightness ?? 1);
      const contrast = key === 'contrast' ? value : (canvasFilters?.globalContrast ?? 1);
      const saturation = key === 'saturation' ? value : (canvasFilters?.globalSaturation ?? 1);
      const blur = key === 'blur' ? value : (canvasFilters?.globalBlur ?? 0);
      updates.globalCssFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`;
      onUpdateCanvasFilters(updates);
      if (isLocked && onApplyToWholePage) {
        const blockUpdates = { brightness, contrast, saturation, blur, cssFilter: updates.globalCssFilter };
        onApplyToWholePage(blockUpdates);
      }
    } else if (isBlockSelected && canApplyFilter) {
      const updates: any = { [key]: value };
      const brightness = key === 'brightness' ? value : (selectedBlock.props?.brightness ?? 1);
      const contrast = key === 'contrast' ? value : (selectedBlock.props?.contrast ?? 1);
      const saturation = key === 'saturation' ? value : (selectedBlock.props?.saturation ?? 1);
      const blur = key === 'blur' ? value : (selectedBlock.props?.blur ?? 0);
      updates.cssFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`;
      onUpdateBlock(selectedBlock.id, updates);
    }
  }, [isCanvasSelected, isBlockSelected, canApplyFilter, selectedBlock, canvasFilters, isLocked, onUpdateBlock, onUpdateCanvasFilters, onApplyToWholePage]);

  const resetFilters = useCallback(() => {
    if (isCanvasSelected) {
      onUpdateCanvasFilters({ globalBrightness: 1, globalContrast: 1, globalSaturation: 1, globalBlur: 0, globalCssFilter: 'none' });
      if (isLocked && onApplyToWholePage) onApplyToWholePage({ brightness: 1, contrast: 1, saturation: 1, blur: 0, cssFilter: 'none' });
    } else if (isBlockSelected && canApplyFilter) {
      onUpdateBlock(selectedBlock.id, { brightness: 1, contrast: 1, saturation: 1, blur: 0, cssFilter: 'none' });
    }
  }, [isCanvasSelected, isBlockSelected, canApplyFilter, selectedBlock, isLocked, onUpdateBlock, onUpdateCanvasFilters, onApplyToWholePage]);

  const toggleLock = useCallback(() => {
    if (!isLocked) {
      const updates = {
        brightness: canvasFilters?.globalBrightness ?? 1,
        contrast: canvasFilters?.globalContrast ?? 1,
        saturation: canvasFilters?.globalSaturation ?? 1,
        blur: canvasFilters?.globalBlur ?? 0,
        cssFilter: canvasFilters?.globalCssFilter || 'none',
      };
      if (onApplyToWholePage) onApplyToWholePage(updates);
    }
    setIsLocked(!isLocked);
  }, [isLocked, canvasFilters, onApplyToWholePage]);

  const filterParameters = [
    { key: 'brightness', label: 'Luminosité', min: 0, max: 2, step: 0.01, default: 1 },
    { key: 'contrast', label: 'Contraste', min: 0, max: 2, step: 0.01, default: 1 },
    { key: 'saturation', label: 'Saturation', min: 0, max: 2, step: 0.01, default: 1 },
    { key: 'blur', label: 'Flou', min: 0, max: 10, step: 0.1, default: 0 },
  ];

  // ⭐ CANVAS SÉLECTIONNÉ (fond de page)
  if (isCanvasSelected) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold text-sm">Filtres</h3>
          <span className="text-xs text-gray-500 bg-blue-500/20 px-2 py-0.5 rounded-full">🎨 Fond</span>
        </div>

        <button onClick={toggleLock} className={`w-full py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${isLocked ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
          {isLocked ? <><FiLock size={14} /> 🔒 Appliqué à toute la page (cliquer pour désactiver)</> : <>🌍 Appliquer à toute la page</>}
        </button>

        <div className="p-3 bg-gray-800 rounded-lg">
          <div className="w-full h-16 rounded-lg transition-all duration-200" style={{ filter: currentFilters.cssFilter, background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
        </div>

        <div className="flex gap-2 border-b border-gray-700 pb-2">
          <button onClick={() => setActiveTab('presets')} className={`flex-1 py-1 text-xs rounded ${activeTab === 'presets' ? 'bg-primary text-white' : 'text-gray-400'}`}>Presets</button>
          <button onClick={() => setActiveTab('manual')} className={`flex-1 py-1 text-xs rounded ${activeTab === 'manual' ? 'bg-primary text-white' : 'text-gray-400'}`}>Manuel</button>
        </div>

        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {filterPresets.map(preset => (
              <button key={preset.id} onClick={() => applyPreset(preset)} className={`p-2 rounded-lg border ${currentFilters.cssFilter === preset.cssFilter ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-800'}`}>
                <div className="w-full h-12 rounded mb-1" style={{ filter: preset.cssFilter, background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
                <span className="text-white text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-3">
            {filterParameters.map(param => (
              <div key={param.key}>
                <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{param.label}</span><span>{(currentFilters[param.key as keyof typeof currentFilters] as number || param.default).toFixed(2)}</span></div>
                <input type="range" min={param.min} max={param.max} step={param.step} value={currentFilters[param.key as keyof typeof currentFilters] as number || param.default} onChange={(e) => updateParameter(param.key, parseFloat(e.target.value))} className="w-full" />
              </div>
            ))}
            <button onClick={resetFilters} className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs">Réinitialiser</button>
          </div>
        )}
      </div>
    );
  }

  // ⭐ BLOC SÉLECTIONNÉ
  if (isBlockSelected && canApplyFilter) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold text-sm">Filtres</h3>
          <span className="text-xs text-gray-500">🎯 {selectedBlock.type}</span>
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <div className="w-full h-16 rounded-lg" style={{ filter: currentFilters.cssFilter, background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
        </div>

        <div className="flex gap-2 border-b border-gray-700 pb-2">
          <button onClick={() => setActiveTab('presets')} className={`flex-1 py-1 text-xs rounded ${activeTab === 'presets' ? 'bg-primary text-white' : 'text-gray-400'}`}>Presets</button>
          <button onClick={() => setActiveTab('manual')} className={`flex-1 py-1 text-xs rounded ${activeTab === 'manual' ? 'bg-primary text-white' : 'text-gray-400'}`}>Manuel</button>
        </div>

        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {filterPresets.map(preset => (
              <button key={preset.id} onClick={() => applyPreset(preset)} className={`p-2 rounded-lg border ${currentFilters.cssFilter === preset.cssFilter ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-800'}`}>
                <div className="w-full h-12 rounded mb-1" style={{ filter: preset.cssFilter, background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
                <span className="text-white text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-3">
            {filterParameters.map(param => (
              <div key={param.key}>
                <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{param.label}</span><span>{(currentFilters[param.key as keyof typeof currentFilters] as number || param.default).toFixed(2)}</span></div>
                <input type="range" min={param.min} max={param.max} step={param.step} value={currentFilters[param.key as keyof typeof currentFilters] as number || param.default} onChange={(e) => updateParameter(param.key, parseFloat(e.target.value))} className="w-full" />
              </div>
            ))}
            <button onClick={resetFilters} className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs">Réinitialiser</button>
          </div>
        )}
      </div>
    );
  }

  // ⭐ BLOC NON FILTRABLE
  if (isBlockSelected && !canApplyFilter) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-xs">
          ℹ️ Filtres non disponibles pour <strong>{selectedBlock?.type}</strong>
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Types supportés : {FILTERABLE_BLOCK_TYPES.join(', ')}
        </p>
      </div>
    );
  }

  // ⭐ RIEN DE SÉLECTIONNÉ
  return (
    <div className="text-center py-8">
      <p className="text-gray-400 text-xs">Sélectionnez le fond ou un élément</p>
    </div>
  );
}