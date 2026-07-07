'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiMonitor, FiTablet, FiSmartphone, FiEye, FiZoomIn, FiZoomOut, FiMaximize, FiBarChart2 } from 'react-icons/fi';
import ProductPageToolbarButton from './Productpagetoolbarbutton';

interface Props {
  shop: any;
  saving: boolean;
  onSave: () => Promise<void>;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  zoom: number;
  onOpenProductPage: () => void;
}

export default function StudioToolbar({ 
  shop, saving, onSave, previewMode, onPreviewModeChange,
  onZoomIn, onZoomOut, onZoomReset, zoom,
  onOpenProductPage,
}: Props) {
  const router = useRouter();

  return (
    <div
      className="flex items-center justify-between px-4 flex-shrink-0"
      style={{ background: '#0d0e14', borderBottom: '1px solid #1b1c26', height: 48 }}
    >
      {/* ── Gauche : retour + titre ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/shop/my-shops')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-sm group"
          style={{ color: '#6b7280' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#16171f'; (e.currentTarget as HTMLElement).style.color = '#e5e7eb'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
        >
          <FiArrowLeft size={14} />
          <span className="text-xs font-medium">Mes boutiques</span>
        </button>
        <div className="w-px h-4" style={{ background: '#1b1c26' }} />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-white font-bold text-[10px]">S</span>
          </div>
          <div className="leading-tight">
            <p className="text-white text-xs font-semibold">Studio Créateur</p>
            <p className="text-[10px]" style={{ color: '#4b5563' }}>{shop?.name || 'Boutique'}</p>
          </div>
        </div>
      </div>

      {/* ── Centre : preview + zoom ── */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 p-1 rounded-lg" style={{ background: '#11121a', border: '1px solid #1b1c26' }}>
          {[
            { mode: 'desktop', icon: FiMonitor, label: 'Bureau' },
            { mode: 'tablet', icon: FiTablet, label: 'Tablette' },
            { mode: 'mobile', icon: FiSmartphone, label: 'Mobile' },
          ].map(({ mode, icon: Icon, label }) => (
            <button key={mode} onClick={() => onPreviewModeChange(mode as any)} title={label}
              className="p-1.5 rounded-md transition-all"
              style={{ background: previewMode === mode ? '#1e1f2e' : 'transparent', color: previewMode === mode ? '#8b5cf6' : '#6b7280' }}
              onMouseEnter={e => { if (previewMode !== mode) (e.currentTarget as HTMLElement).style.color = '#d1d5db'; }}
              onMouseLeave={e => { if (previewMode !== mode) (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
        <div className="w-px h-4" style={{ background: '#1b1c26' }} />
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: '#11121a', border: '1px solid #1b1c26' }}>
          <button onClick={onZoomOut} title="Zoom out" className="p-1.5 rounded-md transition-colors" style={{ color: '#6b7280' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#d1d5db'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#6b7280'}>
            <FiZoomOut size={13} />
          </button>
          <button onClick={onZoomReset} className="px-2 py-1 rounded-md text-[11px] font-mono font-medium transition-colors tabular-nums"
            style={{ color: '#9ca3af', minWidth: 42, textAlign: 'center' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ffffff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9ca3af'}>
            {zoom}%
          </button>
          <button onClick={onZoomIn} title="Zoom in" className="p-1.5 rounded-md transition-colors" style={{ color: '#6b7280' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#d1d5db'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#6b7280'}>
            <FiZoomIn size={13} />
          </button>
          <div className="w-px h-3 mx-0.5" style={{ background: '#1b1c26' }} />
          <button onClick={onZoomReset} title="Centrer" className="p-1.5 rounded-md transition-colors" style={{ color: '#6b7280' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#d1d5db'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#6b7280'}>
            <FiMaximize size={12} />
          </button>
        </div>
      </div>

      {/* ── Droite : Page Produit + Dashboard + save + voir ── */}
      <div className="flex items-center gap-2">
        {saving && (
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#f59e0b' }}>
            <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-yellow-400" />
            Sauvegarde...
          </div>
        )}

        <ProductPageToolbarButton onOpen={onOpenProductPage} />

        {/* ⭐ AJOUT — bouton Dashboard */}
        <button
          onClick={() => router.push(`/dashboard/seller?shopId=${shop?.id}`)}
          title="Voir le tableau de bord"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: '#11121a', border: '1px solid #1b1c26', color: '#6b7280' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e5e7eb'; (e.currentTarget as HTMLElement).style.borderColor = '#2d303f'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.borderColor = '#1b1c26'; }}
        >
          <FiBarChart2 size={13} />
          Dashboard
        </button>

        <div className="w-px h-4" style={{ background: '#1b1c26' }} />

        <a href={`/shop/${shop?.slug}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: '#11121a', border: '1px solid #1b1c26', color: '#6b7280' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e5e7eb'; (e.currentTarget as HTMLElement).style.borderColor = '#2d303f'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.borderColor = '#1b1c26'; }}>
          <FiEye size={13} />
          Aperçu
        </a>

        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          style={{ background: saving ? '#1e1f2e' : 'linear-gradient(135deg, #10b981, #6366f1)', color: '#ffffff', boxShadow: saving ? 'none' : '0 0 12px rgba(99,102,241,0.3)' }}
          onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>
          <FiSave size={13} />
          Sauvegarder
        </button>
      </div>
    </div>
  );
}