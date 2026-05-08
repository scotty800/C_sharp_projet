'use client';

import { FiPlus, FiSave, FiMonitor, FiTablet, FiSmartphone, FiEye, FiZoomIn, FiZoomOut, FiMaximize } from 'react-icons/fi';

interface Props {
  shop: any;
  saving: boolean;
  onAddBlock: () => void;
  onSave: () => Promise<void>;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  zoom: number;
}

export default function StudioToolbar({ 
  shop, 
  saving, 
  onAddBlock, 
  onSave, 
  previewMode, 
  onPreviewModeChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoom
}: Props) {
  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div>
          <h1 className="text-white font-semibold">Studio Créateur</h1>
          <p className="text-gray-400 text-xs">{shop?.name || 'Boutique'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onAddBlock}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors text-sm"
        >
          <FiPlus size={16} />
          Ajouter un élément
        </button>

        <div className="flex items-center gap-1 ml-4 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onPreviewModeChange('desktop')}
            className={`p-1.5 rounded transition-colors ${
              previewMode === 'desktop' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Bureau"
          >
            <FiMonitor size={16} />
          </button>
          <button
            onClick={() => onPreviewModeChange('tablet')}
            className={`p-1.5 rounded transition-colors ${
              previewMode === 'tablet' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Tablette"
          >
            <FiTablet size={16} />
          </button>
          <button
            onClick={() => onPreviewModeChange('mobile')}
            className={`p-1.5 rounded transition-colors ${
              previewMode === 'mobile' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Mobile"
          >
            <FiSmartphone size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 ml-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded transition-colors text-gray-400 hover:text-white"
            title="Zoom out (Ctrl -)"
          >
            <FiZoomOut size={16} />
          </button>
          <span className="text-white text-xs min-w-[45px] text-center">{zoom}%</span>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded transition-colors text-gray-400 hover:text-white"
            title="Zoom in (Ctrl +)"
          >
            <FiZoomIn size={16} />
          </button>
          <button
            onClick={onZoomReset}
            className="p-1.5 rounded transition-colors text-gray-400 hover:text-white"
            title="Reset zoom (Ctrl 0)"
          >
            <FiMaximize size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {saving && (
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400"></div>
            Sauvegarde...
          </div>
        )}

        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
        >
          <FiSave size={14} />
          Sauvegarder
        </button>

        <a
          href={`/shop/${shop?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm"
        >
          <FiEye size={14} />
          Voir
        </a>
      </div>
    </div>
  );
}