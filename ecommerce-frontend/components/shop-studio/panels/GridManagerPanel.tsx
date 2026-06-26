'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FiPlus, FiTrash2, FiGrid, FiColumns, FiLayout,
  FiMove, FiCopy, FiEye, FiShoppingCart, FiTag,
  FiAlignLeft, FiType, FiImage, FiX, FiSave, FiUpload,
  FiFolder, FiExternalLink, FiMaximize2
} from 'react-icons/fi';
import { ProductGridConfig, ProductGridSlot, StudioProduct, CreateStudioProduct } from '@/types/studio';

interface Props {
  gridConfig: ProductGridConfig;
  products: StudioProduct[];
  selectedSlotId: string | null;
  onUpdateGrid: (config: ProductGridConfig) => void;
  onSelectSlot: (slotId: string) => void;
  onLinkProduct: (slotId: string, product: StudioProduct) => void;
  onUnlinkProduct: (slotId: string) => void;
  onUpdateSlotConfig: (slotId: string, config: Partial<ProductGridSlot>) => void;
  onCreateProduct?: (product: CreateStudioProduct) => Promise<StudioProduct>;
  assets?: Array<{ id: number; url: string; name: string; type: string }>;
  onUploadAsset?: (file: File) => Promise<{ url: string }>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FRAME_STYLES = [
  { id: 'square',     name: 'Carré',      icon: '⬛', aspectRatio: '1/1', description: 'Format carré classique' },
  { id: 'horizontal', name: 'Horizontal', icon: '📐', aspectRatio: '4/3', description: 'Format paysage 4:3' },
  { id: 'vertical',   name: 'Vertical',   icon: '📏', aspectRatio: '3/4', description: 'Format portrait 3:4' },
  { id: 'circle',     name: 'Cercle',     icon: '⚪', aspectRatio: '1/1', description: 'Format rond' },
  { id: 'rounded',    name: 'Arrondi',    icon: '🟩', aspectRatio: '1/1', description: 'Coins arrondis' },
];

const DEFAULT_TRADITIONAL_CONFIG = {
  showImage: true, showName: true, showPrice: true, showDescription: false,
  showSizeSelector: false, showColorSelector: false, showStockStatus: false,
  showAddToCart: true, imagePosition: 'top' as const, cardStyle: 'default' as const,
  buttonStyle: 'primary' as const,
  nameFont: 'Inter',
  nameFontSize: 14,
  nameFontWeight: '600',
  nameColor: '#1F2937',
  priceFont: 'Inter',
  priceFontSize: 14,
  priceFontWeight: '700',
  priceColor: '#2563EB',
};

const DEFAULT_INTERACTIVE_CONFIG = {
  showNameOnClick: true,
  showPriceOnClick: true,
  showDescriptionOnClick: false,
  showSizeSelector: false,
  showColorSelector: false,
  showStockStatus: false,
  showAddToCart: true,
  overlayStyle: 'modal' as const,
  overlayBackground: '#ffffff',
  overlayBlur: 4,
  animationDuration: 300,
  triggerType: 'click' as const,
  namePosition: 'bottom-left',
  pricePosition: 'bottom-left',
  buttonPosition: 'bottom-right',
  descriptionPosition: 'bottom-center',
  nameColor: '#FFFFFF',
  priceColor: '#FFFFFF',
  cartButtonText: 'Ajouter au panier',
  nameFont: 'Inter',
  nameFontSize: 14,
  nameFontWeight: '600',
  priceFont: 'Inter',
  priceFontSize: 15,
  priceFontWeight: '700',
};

// Base dimensions (ratio conservé)
const GRID_BASE = { width: 800, height: 400 };   // ratio 2:1
const SLOT_BASE = { width: 200, height: 200 };   // ratio 1:1

// Scale → dimensions réelles
const scaleToGridDim = (scale: number) => ({
  width:  Math.round(GRID_BASE.width  * scale),
  height: Math.round(GRID_BASE.height * scale),
  widthUnit: 'px' as const,
  heightUnit: 'px' as const,
});

const scaleToSlotDim = (scale: number) => ({
  width:  Math.round(SLOT_BASE.width  * scale),
  height: Math.round(SLOT_BASE.height * scale),
  widthUnit: 'px' as const,
  heightUnit: 'px' as const,
});

// Dimensions → scale (depuis la largeur)
const dimToGridScale = (dim?: { width: number }) =>
  dim ? Math.round((dim.width / GRID_BASE.width) * 100) / 100 : 1;

const dimToSlotScale = (dim?: { width: number }) =>
  dim ? Math.round((dim.width / SLOT_BASE.width) * 100) / 100 : 1;

const PREDEFINED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const PREDEFINED_COLORS = [
  { name: 'Noir', value: '#000000' }, { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Gris', value: '#808080' }, { name: 'Rouge', value: '#FF0000' },
  { name: 'Bleu', value: '#0000FF' }, { name: 'Vert', value: '#00FF00' },
  { name: 'Jaune', value: '#FFFF00' }, { name: 'Orange', value: '#FFA500' },
  { name: 'Violet', value: '#800080' }, { name: 'Rose', value: '#FFC0CB' },
];

const FONTS_LIST = [
  'Inter', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans',
  'Playfair Display', 'Pacifico', 'Dancing Script', 'Lato', 'Raleway'
];

const FONT_WEIGHTS = [
  { value: '300', label: 'Léger (300)' },
  { value: '400', label: 'Normal (400)' },
  { value: '500', label: 'Moyen (500)' },
  { value: '600', label: 'Semi-gras (600)' },
  { value: '700', label: 'Gras (700)' },
  { value: '800', label: 'Extra-gras (800)' },
];

// ── ScaleSlider component ─────────────────────────────────────────────────────

function ScaleSlider({
  scale,
  onChange,
  min = 0.3,
  max = 2,
  step = 0.05,
  width,
  height,
}: {
  scale: number;
  onChange: (scale: number) => void;
  min?: number;
  max?: number;
  step?: number;
  width: number;
  height: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="bg-primary/30 rounded border border-primary/50 flex-shrink-0"
            style={{
              width: Math.round(32 * (scale / 1)),
              height: Math.round(32 * (scale / 1)),
              maxWidth: 48,
              maxHeight: 48,
              minWidth: 12,
              minHeight: 12,
              transition: 'width 0.15s, height 0.15s',
            }}
          />
          <span className="text-xs text-gray-400">
            {width} × {height} px
          </span>
        </div>
        <span className="text-xs text-gray-300 font-mono bg-gray-700 px-1.5 py-0.5 rounded">
          {Math.round(scale * 100)}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={scale}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>Petit</span>
        <span>Normal</span>
        <span>Grand</span>
      </div>
    </div>
  );
}

// ── GridPositionEditor ────────────────────────────────────────────────────────

interface GridPos { row: number; col: number; rowSpan: number; colSpan: number; }

function GridPositionEditor({
  slot,
  cols,
  rows,
  allSlots,
  onUpdate,
}: {
  slot: ProductGridSlot;
  cols: number;
  rows: number;
  allSlots: ProductGridSlot[];
  onUpdate: (pos: GridPos) => void;
}) {
  const pos: GridPos = {
    row:     slot.gridPosition.row      ?? 0,
    col:     slot.gridPosition.col      ?? 0,
    rowSpan: slot.gridPosition.rowSpan  ?? 1,
    colSpan: slot.gridPosition.colSpan  ?? 1,
  };

  const [drag, setDrag] = useState<{ mode: 'move' | 'resize'; startCell: { r: number; c: number }; originPos: GridPos } | null>(null);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  const ghost = (() => {
    if (!drag || !hover) return null;
    if (drag.mode === 'move') {
      const newCol = Math.max(0, Math.min(cols - pos.colSpan, hover.c));
      const newRow = Math.max(0, Math.min(rows - pos.rowSpan, hover.r));
      return { ...drag.originPos, col: newCol, row: newRow };
    }
    const colSpan = Math.max(1, Math.min(cols - drag.originPos.col, hover.c - drag.originPos.col + 1));
    const rowSpan = Math.max(1, Math.min(4 - drag.originPos.row, hover.r - drag.originPos.row + 1));
    return { ...drag.originPos, colSpan, rowSpan };
  })();

  const displayed = ghost || pos;

  const getOccupant = (r: number, c: number) => {
    return allSlots.find(s => {
      if (s.id === slot.id) return false;
      const sp = s.gridPosition;
      const sc = sp.col ?? 0, sr = sp.row ?? 0;
      const sw = sp.colSpan ?? 1, sh = sp.rowSpan ?? 1;
      return c >= sc && c < sc + sw && r >= sr && r < sr + sh;
    });
  };

  const inSelected = (r: number, c: number, p: GridPos) =>
    c >= p.col && c < p.col + p.colSpan && r >= p.row && r < p.row + p.rowSpan;

  const handleCellDown = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (inSelected(r, c, pos)) {
      setDrag({ mode: 'move', startCell: { r, c }, originPos: pos });
    } else {
      const newCol = Math.max(0, Math.min(cols - pos.colSpan, c));
      const newRow = Math.max(0, Math.min(rows - pos.rowSpan, r));
      onUpdate({ ...pos, col: newCol, row: newRow });
    }
  };

  const handleResizeDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag({ mode: 'resize', startCell: { r: pos.row + pos.rowSpan - 1, c: pos.col + pos.colSpan - 1 }, originPos: pos });
  };

  const handleCellEnter = (r: number, c: number) => {
    setHover({ r, c });
  };

  const handleMouseUp = () => {
    if (drag && ghost) onUpdate(ghost);
    setDrag(null);
    setHover(null);
  };

  const cellColor = (r: number, c: number): string => {
    const isSelected = inSelected(r, c, displayed);
    const isOrigin   = displayed.row === r && displayed.col === c;
    const isOccupied = !!getOccupant(r, c);
    if (isSelected && isOrigin) return 'bg-primary ring-2 ring-primary/60';
    if (isSelected)             return 'bg-primary/60';
    if (isOccupied)             return 'bg-gray-600/80';
    return 'bg-gray-700/60 hover:bg-gray-600/80';
  };

  const CELL = 28;
  const displayRows = Math.max(rows, 4);

  return (
    <div className="bg-gray-800/50 rounded-lg p-3" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-gray-400">Position &amp; étendue</label>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-primary/30 text-primary px-1.5 py-0.5 rounded">
            {displayed.colSpan}×{displayed.rowSpan}
          </span>
          <span>col {displayed.col + 1}, ligne {displayed.row + 1}</span>
        </div>
      </div>

      <div
        className="relative select-none mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
          gridTemplateRows: `repeat(${displayRows}, ${CELL}px)`,
          gap: 3,
          width: cols * CELL + (cols - 1) * 3,
          cursor: drag ? (drag.mode === 'move' ? 'grabbing' : 'se-resize') : 'default',
        }}
      >
        {Array.from({ length: displayRows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const key = `${r}-${c}`;
            return (
              <div
                key={key}
                className={`rounded transition-colors duration-100 ${cellColor(r, c)}`}
                style={{ width: CELL, height: CELL, cursor: inSelected(r, c, pos) ? 'grab' : 'pointer' }}
                onMouseDown={(e) => handleCellDown(e, r, c)}
                onMouseEnter={() => handleCellEnter(r, c)}
              >
                {!inSelected(r, c, displayed) && (
                  <span className="flex items-center justify-center h-full text-[9px] text-gray-500 pointer-events-none">
                    {getOccupant(r, c) ? '●' : ''}
                  </span>
                )}
              </div>
            );
          })
        )}

        <div
          className="absolute z-10 w-4 h-4 bg-white rounded-full shadow-md cursor-se-resize flex items-center justify-center"
          style={{
            left:   (displayed.col + displayed.colSpan) * (CELL + 3) - 3 - 8,
            top:    (displayed.row + displayed.rowSpan) * (CELL + 3) - 3 - 8,
          }}
          onMouseDown={handleResizeDown}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 7L7 1M4 7L7 4M7 7L7 7" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary inline-block" /> Sélectionné</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-600 inline-block" /> Occupé</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-700/60 border border-gray-600 inline-block" /> Libre</span>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">Largeur (col)</label>
          <div className="flex gap-1">
            <button onClick={() => onUpdate({ ...pos, colSpan: Math.max(1, pos.colSpan - 1) })}
              disabled={pos.colSpan <= 1}
              className="w-7 h-7 bg-gray-700 rounded text-white text-sm hover:bg-gray-600 disabled:opacity-30 flex items-center justify-center">−</button>
            <div className="flex-1 text-center py-1 bg-gray-700 rounded text-white text-xs font-mono">
              {pos.colSpan} / {cols}
            </div>
            <button onClick={() => onUpdate({ ...pos, colSpan: Math.min(cols - pos.col, pos.colSpan + 1) })}
              disabled={pos.colSpan >= cols - pos.col}
              className="w-7 h-7 bg-gray-700 rounded text-white text-sm hover:bg-gray-600 disabled:opacity-30 flex items-center justify-center">+</button>
          </div>
        </div>
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">Hauteur (ligne)</label>
          <div className="flex gap-1">
            <button onClick={() => onUpdate({ ...pos, rowSpan: Math.max(1, pos.rowSpan - 1) })}
              disabled={pos.rowSpan <= 1}
              className="w-7 h-7 bg-gray-700 rounded text-white text-sm hover:bg-gray-600 disabled:opacity-30 flex items-center justify-center">−</button>
            <div className="flex-1 text-center py-1 bg-gray-700 rounded text-white text-xs font-mono">
              {pos.rowSpan} / {rows}
            </div>
            <button onClick={() => onUpdate({ ...pos, rowSpan: Math.min(4 - pos.row, pos.rowSpan + 1) })}
              disabled={pos.rowSpan >= 4 - pos.row}
              className="w-7 h-7 bg-gray-700 rounded text-white text-sm hover:bg-gray-600 disabled:opacity-30 flex items-center justify-center">+</button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-600 text-center mt-2">
        Glisse dans la grille pour déplacer · Handle blanc pour agrandir
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function GridManagerPanel({
  gridConfig,
  products,
  selectedSlotId,
  onUpdateGrid,
  onSelectSlot,
  onLinkProduct,
  onUnlinkProduct,
  onUpdateSlotConfig,
  onCreateProduct,
  assets = [],
  onUploadAsset,
}: Props) {
  // ⭐⭐⭐ LOGS DE DEBUG ⭐⭐⭐
  console.log('🔴🔴🔴 GridManagerPanel RENDU - produits reçus:', products.length);
  console.log('🔴 Détail des produits reçus:', products.map(p => ({ id: p.id, name: p.name, sizes: p.sizes, colors: p.colors })));

  const [activeTab, setActiveTab] = useState<'layout' | 'slots' | 'slot-config'>('layout');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [currentSlotId, setCurrentSlotId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [productSearch, setProductSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gridDimEnabled, setGridDimEnabled] = useState(false);
  const [slotDimEnabled, setSlotDimEnabled] = useState(false);
  
  const [cropEditorOpenForSlot, setCropEditorOpenForSlot] = useState<string | null>(null);

  // ⭐⭐⭐ Version des produits pour forcer le re-render ⭐⭐⭐
  const [productsVersion, setProductsVersion] = useState(0);

  // ⭐ État newProduct avec imageUrl1 comme image principale
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: 0, stock: 0, category: '',
    sizes: [] as string[],
    colors: [] as { name: string; value: string }[],
    imageUrl1: '',
    imageUrl2: '',
    imageUrl3: '',
    isInStock: true,
  });

  // ⭐⭐⭐ FORCER LA RÉHYDRATATION DES SLOTS QUAND products CHANGE ⭐⭐⭐
  useEffect(() => {
    if (products.length === 0) return;
    
    console.log('🔄 GridManagerPanel: Vérification réhydratation des slots...');
    let needsUpdate = false;
    const slotsWithMissingProduct: string[] = [];
    
    gridConfig.slots.forEach(slot => {
      if (slot.productId != null && slot.linkedProduct == null) {
        needsUpdate = true;
        slotsWithMissingProduct.push(slot.id);
        console.log(`⚠️ Slot ${slot.id} a productId ${slot.productId} mais pas linkedProduct`);
      }
    });
    
    if (!needsUpdate) {
      console.log('✅ Tous les slots sont déjà réhydratés');
      return;
    }
    
    console.log(`🔄 Réhydratation des slots ${slotsWithMissingProduct.join(', ')}...`);
    
    const updatedSlots = gridConfig.slots.map(slot => {
      if (slot.productId != null && slot.linkedProduct == null) {
        const product = products.find(p => p.id === slot.productId);
        if (product) {
          console.log(`✅ Slot ${slot.id} réhydraté avec ${product.name}`);
          return { ...slot, linkedProduct: product };
        } else {
          console.warn(`⚠️ Produit ${slot.productId} non trouvé pour le slot ${slot.id}`);
          return { ...slot, linkedProduct: undefined };
        }
      }
      return slot;
    });
    
    const newGridConfig = { ...gridConfig, slots: updatedSlots };
    onUpdateGrid(newGridConfig);
    
    // Forcer le re-render
    setProductsVersion(prev => prev + 1);
    
    console.log('✅ Réhydratation terminée');
  }, [products, gridConfig.slots]);

  // ⭐⭐⭐ ÉCOUTEUR D'ÉVÉNEMENT POUR FORCER LA MISE À JOUR ⭐⭐⭐
  useEffect(() => {
    const handleProductsUpdated = () => {
      console.log('🟡 Événement reçu dans GridManagerPanel - productsVersion incrémenté');
      setProductsVersion(prev => prev + 1);
    };
    
    console.log('🟢 GridManagerPanel - Installation des écouteurs d\'événements');
    window.addEventListener('productUpdated', handleProductsUpdated);
    window.addEventListener('productsChanged', handleProductsUpdated);
    window.addEventListener('refreshProducts', handleProductsUpdated);
    
    return () => {
      console.log('🔴 GridManagerPanel - Nettoyage des écouteurs');
      window.removeEventListener('productUpdated', handleProductsUpdated);
      window.removeEventListener('productsChanged', handleProductsUpdated);
      window.removeEventListener('refreshProducts', handleProductsUpdated);
    };
  }, []);

  // ⭐⭐⭐ Écouter les changements de produits ⭐⭐⭐
  useEffect(() => {
    const handleProductsListChanged = (event: CustomEvent) => {
      const { productId, updates } = event.detail;
      console.log('🔄 Mise à jour de la liste des produits dans GridManagerPanel:', productId, updates);
      
      // Forcer le re-render
      setProductsVersion(prev => prev + 1);
    };
    
    window.addEventListener('productsListChanged', handleProductsListChanged as EventListener);
    return () => window.removeEventListener('productsListChanged', handleProductsListChanged as EventListener);
  }, []);

  // ⭐⭐⭐ LOG pour suivre les changements de products ⭐⭐⭐
  useEffect(() => {
    console.log('🟢🟢🟢 products PROP A CHANGÉ dans GridManagerPanel !');
    console.log('   - Nouveau nombre de produits:', products.length);
    console.log('   - Produits détaillés:', products.map(p => ({ id: p.id, name: p.name, sizes: p.sizes, colors: p.colors })));
    setProductsVersion(prev => prev + 1);
  }, [products]);

  const selectedSlot = gridConfig.slots.find(s => s.id === selectedSlotId);
  const currentDimension = gridConfig.dimension || scaleToGridDim(1);

  const updateGrid = (updates: Partial<ProductGridConfig>) =>
    onUpdateGrid({ ...gridConfig, ...updates });

  const gridScale = dimToGridScale(currentDimension);

  const applyGridScale = (scale: number) => {
    updateGrid({ dimension: scaleToGridDim(scale) });
  };

  const slotScale = dimToSlotScale(selectedSlot?.customSize);

  const applySlotScale = (scale: number) => {
    if (!selectedSlot) return;
    const maxCellWidth = Math.floor(currentDimension.width / gridConfig.columns.desktop) - gridConfig.gap;
    const desired = scaleToSlotDim(scale);
    const safeWidth = Math.min(desired.width, Math.max(50, maxCellWidth));
    const safeScale = safeWidth / SLOT_BASE.width;
    onUpdateSlotConfig(selectedSlot.id, { customSize: scaleToSlotDim(safeScale) });
  };

  const clearSlotDim = () => {
    if (!selectedSlot) return;
    onUpdateSlotConfig(selectedSlot.id, { customSize: undefined });
    setSlotDimEnabled(false);
  };

  const addSlot = () => {
    const newSlot: ProductGridSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      order: gridConfig.slots.length,
      productId: null,
      displayMode: 'traditional',
      frameStyle: 'square',
      imageIndex: null,
      gridPosition: {
        row: Math.floor(gridConfig.slots.length / gridConfig.columns.desktop),
        col: gridConfig.slots.length % gridConfig.columns.desktop,
        rowSpan: 1,
        colSpan: 1,
      },
    };
    updateGrid({ slots: [...gridConfig.slots, newSlot] });
  };

  const removeSlot = (slotId: string) => {
    const slotToRemove = gridConfig.slots.find(s => s.id === slotId);
    const hadProduct = !!slotToRemove?.linkedProduct;
    
    const updated = gridConfig.slots.filter(s => s.id !== slotId).map((s, i) => ({ ...s, order: i }));
    updateGrid({ slots: updated });
    
    if (hadProduct) {
      console.log('🗑️ Slot avec produit supprimé - déclenchement productsChanged');
      window.dispatchEvent(new CustomEvent('productsChanged'));
    }
  };

  const duplicateSlot = (slot: ProductGridSlot) => {
    const newSlot: ProductGridSlot = {
      ...slot,
      id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      order: gridConfig.slots.length,
      productId: null,
      linkedProduct: undefined,
    };
    updateGrid({ slots: [...gridConfig.slots, newSlot] });
  };

  const handleDisplayModeChange = (slotId: string, mode: 'traditional' | 'interactive') => {
    const currentSlot = gridConfig.slots.find(s => s.id === slotId);
    
    onUpdateSlotConfig(slotId, {
      displayMode: mode,
      customConfig: {
        ...currentSlot?.customConfig,
        ...(mode === 'traditional' && !currentSlot?.customConfig?.traditionalConfig
          ? { traditionalConfig: DEFAULT_TRADITIONAL_CONFIG }
          : {}),
        ...(mode === 'interactive' && !currentSlot?.customConfig?.interactiveConfig
          ? { interactiveConfig: DEFAULT_INTERACTIVE_CONFIG }
          : {}),
      },
    });
  };

  const updateTraditionalConfig = (slotId: string, key: string, value: any) => {
    const currentSlot = gridConfig.slots.find(s => s.id === slotId);
    const currentTraditionalConfig = currentSlot?.customConfig?.traditionalConfig || {};
    
    onUpdateSlotConfig(slotId, {
      customConfig: {
        ...currentSlot?.customConfig,
        traditionalConfig: {
          ...DEFAULT_TRADITIONAL_CONFIG,
          ...currentTraditionalConfig,
          [key]: value,
        },
      },
    });
  };

  const updateInteractiveConfig = (slotId: string, key: string, value: any) => {
    const currentSlot = gridConfig.slots.find(s => s.id === slotId);
    const currentInteractiveConfig = currentSlot?.customConfig?.interactiveConfig || {};
    
    onUpdateSlotConfig(slotId, {
      customConfig: {
        ...currentSlot?.customConfig,
        interactiveConfig: {
          ...DEFAULT_INTERACTIVE_CONFIG,
          ...currentInteractiveConfig,
          [key]: value,
        },
      },
    });
  };

  const removeImage = (idx: number) => {
    if (idx === 0) {
      setNewProduct(p => ({ ...p, imageUrl1: '' }));
    } else if (idx === 1) {
      setNewProduct(p => ({ ...p, imageUrl2: '' }));
    } else if (idx === 2) {
      setNewProduct(p => ({ ...p, imageUrl3: '' }));
    }
  };

  const triggerFileUpload = (idx: number) => {
    setCurrentImageIndex(idx);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image trop grande (max 5MB)"); return; }
    setUploadingImageIndex(currentImageIndex);
    try {
      const url = onUploadAsset ? (await onUploadAsset(file)).url : URL.createObjectURL(file);
      if (currentImageIndex === 0) {
        setNewProduct(p => ({ ...p, imageUrl1: url }));
      } else if (currentImageIndex === 1) {
        setNewProduct(p => ({ ...p, imageUrl2: url }));
      } else if (currentImageIndex === 2) {
        setNewProduct(p => ({ ...p, imageUrl3: url }));
      }
    } catch { alert("Erreur lors de l'upload"); }
    finally { setUploadingImageIndex(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const selectFromLibrary = (url: string) => {
    if (currentImageIndex === 0) {
      setNewProduct(p => ({ ...p, imageUrl1: url }));
    } else if (currentImageIndex === 1) {
      setNewProduct(p => ({ ...p, imageUrl2: url }));
    } else if (currentImageIndex === 2) {
      setNewProduct(p => ({ ...p, imageUrl3: url }));
    }
    setShowImageSelector(false);
  };

  const toggleSize = (size: string) => {
    const s = Array.isArray(newProduct.sizes) ? newProduct.sizes : [];
    setNewProduct(p => ({ ...p, sizes: s.includes(size) ? s.filter(x => x !== size) : [...s, size] }));
  };

  const toggleColor = (name: string, value: string) => {
    const c = Array.isArray(newProduct.colors) ? newProduct.colors : [];
    setNewProduct(p => ({
      ...p,
      colors: c.find(x => x.name === name) ? c.filter(x => x.name !== name) : [...c, { name, value }],
    }));
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0) { alert("Nom et prix requis"); return; }
    setIsCreating(true);
    try {
      const mainImage = newProduct.imageUrl1 || '';
      const secondaryImages = [
        newProduct.imageUrl2,
        newProduct.imageUrl3
      ].filter(img => img && img.trim() !== '' && img !== mainImage);
      
      const toCreate: CreateStudioProduct = {
        name: newProduct.name,
        description: newProduct.description || '',
        price: newProduct.price,
        stock: newProduct.stock || 0,
        category: newProduct.category || '',
        sizes: newProduct.sizes.filter(Boolean),
        colors: newProduct.colors.map(c => c.value).filter(Boolean),
        imageUrl: mainImage,
        imageUrl1: mainImage,
        imageUrl2: secondaryImages[0] || '',
        imageUrl3: secondaryImages[1] || '',
        isInStock: newProduct.stock > 0,
      };
      
      console.log('📦 Création produit - Images:', {
        imageUrl1: toCreate.imageUrl1,
        imageUrl2: toCreate.imageUrl2,
        imageUrl3: toCreate.imageUrl3,
      });
      
      const created: StudioProduct = onCreateProduct ? await onCreateProduct(toCreate) : {
        id: Date.now(), name: toCreate.name, description: toCreate.description || '',
        price: toCreate.price, stock: toCreate.stock || 0, category: toCreate.category || '',
        sizes: toCreate.sizes, colors: toCreate.colors,
        imageUrl: toCreate.imageUrl, imageUrl1: toCreate.imageUrl1,
        imageUrl2: toCreate.imageUrl2, imageUrl3: toCreate.imageUrl3,
        isInStock: toCreate.isInStock || false, createdAt: new Date().toISOString(),
      } as StudioProduct;
      
      if (currentSlotId) {
        const currentSlot = gridConfig.slots.find(s => s.id === currentSlotId);
        if (currentSlot && !currentSlot.customConfig?.traditionalConfig) {
          onUpdateSlotConfig(currentSlotId, {
            customConfig: {
              ...currentSlot.customConfig,
              traditionalConfig: DEFAULT_TRADITIONAL_CONFIG,
            }
          });
        }
        onLinkProduct(currentSlotId, created);
      }
      
      setNewProduct({ 
        name: '', description: '', price: 0, stock: 0, category: '', 
        sizes: [], colors: [], 
        imageUrl1: '', imageUrl2: '', imageUrl3: '', 
        isInStock: true 
      });
      setShowCreateProduct(false); 
      setCurrentSlotId(null);
      
      console.log('✅ Produit créé - déclenchement productsChanged');
      window.dispatchEvent(new CustomEvent('productsChanged'));
      
    } catch { 
      alert('Erreur lors de la création'); 
    } finally { 
      setIsCreating(false); 
    }
  };

  const getMainProductImage = (product: StudioProduct): string => {
    return product.imageUrl1 || product.imageUrl || '/images/placeholder.svg';
  };

  const getAllProductImages = (product: StudioProduct): string[] => {
    const images = [];
    if (product.imageUrl1) images.push(product.imageUrl1);
    if (product.imageUrl2) images.push(product.imageUrl2);
    if (product.imageUrl3) images.push(product.imageUrl3);
    return images;
  };

  return (
    <div className="space-y-4">
      {/* ⭐⭐⭐ AFFICHAGE DES LOGS DE DEBUG POUR products ⭐⭐⭐ */}
      <div className="text-[10px] text-gray-500 bg-gray-800/50 p-2 rounded mb-2 hidden">
        <div>🟢 Produits disponibles: {products.length}</div>
        <div>🟢 productsVersion: {productsVersion}</div>
        <div>🟢 Dernier produit: {products[products.length-1]?.name || 'aucun'}</div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      <div className="flex gap-1 border-b border-gray-700">
        {(['layout', 'slots'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-t-lg transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            {tab === 'layout' ? <><FiLayout size={14} /> Structure</> : <><FiGrid size={14} /> Slots ({gridConfig.slots.length})</>}
          </button>
        ))}
        {selectedSlot && (
          <button onClick={() => setActiveTab('slot-config')}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-t-lg transition-colors ${activeTab === 'slot-config' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <FiColumns size={14} /> Style du slot
          </button>
        )}
      </div>

      {/* ══ TAB LAYOUT ════════════════════════════════════════════════════════════ */}
      {activeTab === 'layout' && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <label className="text-sm text-gray-400 block mb-2">Colonnes : {gridConfig.columns.desktop}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 6].map(col => (
                <button key={col}
                  onClick={() => updateGrid({ columns: { ...gridConfig.columns, desktop: col } })}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${gridConfig.columns.desktop === col ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {col}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3">
            <label className="text-sm text-gray-400 block mb-2">Lignes : {gridConfig.rows}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(row => (
                <button key={row}
                  onClick={() => updateGrid({ rows: row })}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${gridConfig.rows === row ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {row}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3 space-y-3">
            <label className="text-sm text-gray-400 block">Espacement</label>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Écart entre slots</span>
                <span className="text-xs text-gray-300 font-mono">{gridConfig.gap}px</span>
              </div>
              <input type="range" min="0" max="48" step="4" value={gridConfig.gap}
                onChange={(e) => updateGrid({ gap: parseInt(e.target.value) })}
                className="w-full accent-primary" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Padding intérieur</span>
                <span className="text-xs text-gray-300 font-mono">{gridConfig.padding}px</span>
              </div>
              <input type="range" min="0" max="32" step="4" value={gridConfig.padding}
                onChange={(e) => updateGrid({ padding: parseInt(e.target.value) })}
                className="w-full accent-primary" />
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiMaximize2 size={14} className="text-gray-400" />
                <label className="text-sm text-gray-400">Dimension de la grille</label>
              </div>
              <button
                onClick={() => setGridDimEnabled(v => !v)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${gridDimEnabled ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {gridDimEnabled ? 'Activé' : 'Désactivé'}
              </button>
            </div>
            {gridDimEnabled ? (
              <div className="pt-2 border-t border-gray-700">
                <ScaleSlider
                  scale={gridScale}
                  onChange={applyGridScale}
                  min={0.25}
                  max={2}
                  step={0.05}
                  width={currentDimension.width}
                  height={currentDimension.height}
                />
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-1">
                Activez pour redimensionner la grille proportionnellement
              </p>
            )}
          </div>
        </div>
      )}

      {/* ══ TAB SLOTS ════════════════════════════════════════════════════════════ */}
      {activeTab === 'slots' && (
        <div className="space-y-3">
          <button onClick={addSlot}
            className="w-full py-2 bg-primary/20 text-primary rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-primary/30 transition-colors">
            <FiPlus size={14} /> Ajouter un slot
          </button>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {gridConfig.slots.map((slot) => {
              const product = slot.linkedProduct;
              const cc = slot.customConfig as any;
              const hasContent = product || cc?.customTitle;
              const imageCount = product
                ? getAllProductImages(product).length
                : 0;

              // ⭐⭐⭐ CLÉ DYNAMIQUE AVEC productsVersion POUR FORCER LE RE-RENDER ⭐⭐⭐
              const key = `${slot.id}-${productsVersion}-${slot.productId}-${slot.linkedProduct?.name || 'null'}`;

              return (
                <div key={key}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedSlotId === slot.id ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'}`}
                  onClick={() => onSelectSlot(slot.id)}>
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500 cursor-move"><FiMove size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">Slot {slot.order + 1}</span>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); duplicateSlot(slot); }}
                            className="p-1 text-gray-400 hover:text-white transition-colors" title="Dupliquer">
                            <FiCopy size={12} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); removeSlot(slot.id); }}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors" title="Supprimer">
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {hasContent ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-6 h-6 bg-gray-700 rounded overflow-hidden">
                            <img src={cc?.customImage || (product ? getMainProductImage(product) : '')} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs text-gray-400 truncate">
                            {cc?.customTitle || product?.name || 'Sans titre'}
                          </span>
                          {product?.price && <span className="text-xs text-primary">{product.price}€</span>}
                          {imageCount > 1 && <span className="text-xs text-gray-500 ml-auto">📷 {imageCount}</span>}
                          {/* ⭐⭐⭐ AFFICHAGE DES INFOS DEBUG ⭐⭐⭐ */}
                          {product && (
                            <span className="text-[9px] text-gray-600 ml-2">
                              🏷️{product.sizes?.length || 0} | 🎨{product.colors?.length || 0}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 mt-1">Slot vide</div>
                      )}

                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${slot.displayMode === 'traditional' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {slot.displayMode === 'traditional' ? '📦 Traditionnel' : '✨ Interactif'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                          {FRAME_STYLES.find(f => f.id === (slot.frameStyle || 'square'))?.icon} {FRAME_STYLES.find(f => f.id === (slot.frameStyle || 'square'))?.name}
                        </span>
                        {((slot.gridPosition.colSpan && slot.gridPosition.colSpan > 1) || (slot.gridPosition.rowSpan && slot.gridPosition.rowSpan > 1)) && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                            📐 {slot.gridPosition.colSpan || 1}×{slot.gridPosition.rowSpan || 1}
                          </span>
                        )}
                        {slot.carouselConfig?.enabled && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">🎠 Carrousel</span>
                        )}
                        {slot.customSize && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                            📏 {slot.customSize.width}×{slot.customSize.height}px
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {gridConfig.slots.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              Aucun slot. Cliquez sur "Ajouter un slot" pour commencer.
            </div>
          )}
        </div>
      )}

      {/* ══ TAB SLOT CONFIG ══════════════════════════════════════════════════════ */}
      {activeTab === 'slot-config' && selectedSlot && (
        <div className="space-y-4">
          {/* Forme du cadre */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <label className="text-sm text-gray-400 block mb-2">Forme du cadre</label>
            <div className="grid grid-cols-5 gap-2">
              {FRAME_STYLES.map(style => (
                <button key={style.id}
                  onClick={() => onUpdateSlotConfig(selectedSlot.id, { frameStyle: style.id as any })}
                  className={`p-2 rounded-lg text-center transition-all ${(selectedSlot.frameStyle || 'square') === style.id ? 'bg-primary text-white ring-2 ring-primary/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  title={style.description}>
                  <div className="text-xl mb-1">{style.icon}</div>
                  <span className="text-[11px]">{style.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2">Aperçu</div>
              <div className="bg-gray-700 overflow-hidden flex items-center justify-center"
                style={{
                  width: 80,
                  aspectRatio: FRAME_STYLES.find(s => s.id === (selectedSlot.frameStyle || 'square'))?.aspectRatio || '1/1',
                  borderRadius: selectedSlot.frameStyle === 'circle' ? '50%' : selectedSlot.frameStyle === 'rounded' ? '24px' : '8px',
                }}>
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-2xl">
                  {FRAME_STYLES.find(s => s.id === (selectedSlot.frameStyle || 'square'))?.icon}
                </div>
              </div>
            </div>
          </div>

          {/* Dimension du slot */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiMaximize2 size={14} className="text-gray-400" />
                <label className="text-sm text-gray-400">Dimension du slot</label>
              </div>
              <button
                onClick={() => {
                  if (slotDimEnabled || selectedSlot.customSize) {
                    clearSlotDim();
                  } else {
                    setSlotDimEnabled(true);
                    onUpdateSlotConfig(selectedSlot.id, { customSize: scaleToSlotDim(1) });
                  }
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${(slotDimEnabled || selectedSlot.customSize) ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {(slotDimEnabled || selectedSlot.customSize) ? 'Activé' : 'Désactivé'}
              </button>
            </div>

            {(slotDimEnabled || selectedSlot.customSize) ? (
              <div className="pt-2 border-t border-gray-700">
                <ScaleSlider
                  scale={slotScale}
                  onChange={applySlotScale}
                  min={0.25}
                  max={2}
                  step={0.05}
                  width={selectedSlot.customSize?.width ?? SLOT_BASE.width}
                  height={selectedSlot.customSize?.height ?? SLOT_BASE.height}
                />
                {(() => {
                  const maxCellWidth = Math.floor(currentDimension.width / gridConfig.columns.desktop) - gridConfig.gap;
                  const atLimit = (selectedSlot.customSize?.width ?? 0) >= maxCellWidth - 5;
                  return atLimit ? (
                    <p className="text-[11px] text-orange-400 bg-orange-500/10 rounded p-2 text-center mt-2">
                      ⚠️ Taille max atteinte — les slots se toucheraient sinon
                    </p>
                  ) : null;
                })()}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-1">
                Activez pour redimensionner ce slot proportionnellement
              </p>
            )}
          </div>

          {/* Éditeur visuel de position & étendue */}
          <GridPositionEditor
            slot={selectedSlot}
            cols={gridConfig.columns.desktop}
            rows={gridConfig.rows}
            allSlots={gridConfig.slots}
            onUpdate={(pos) => onUpdateSlotConfig(selectedSlot.id, { gridPosition: pos })}
          />

          {/* Mode d'affichage */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <label className="text-sm text-gray-400 block mb-2">Mode d'affichage</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDisplayModeChange(selectedSlot.id, 'traditional')}
                className={`p-3 rounded-lg border-2 transition-all ${selectedSlot.displayMode === 'traditional' ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}>
                <div className="flex flex-col items-center gap-2">
                  <FiShoppingCart size={22} />
                  <span className="text-sm font-medium">Traditionnel</span>
                  <span className="text-xs text-gray-400">Affichage complet</span>
                </div>
              </button>
              <button
                onClick={() => handleDisplayModeChange(selectedSlot.id, 'interactive')}
                className={`p-3 rounded-lg border-2 transition-all ${selectedSlot.displayMode === 'interactive' ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}>
                <div className="flex flex-col items-center gap-2">
                  <FiEye size={22} />
                  <span className="text-sm font-medium">Interactif</span>
                  <span className="text-xs text-gray-400">Image + Popup</span>
                </div>
              </button>
            </div>
          </div>

          {/* Sélecteur d'image + éditeur de recadrage */}
          {selectedSlot.linkedProduct && (
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-3">
              <label className="text-sm text-gray-400 block">Image affichée</label>

              <div className="flex gap-2 flex-wrap">
                {[
                  { url: selectedSlot.linkedProduct.imageUrl1, idx: 0, label: 'Principale' },
                  { url: selectedSlot.linkedProduct.imageUrl2, idx: 1, label: 'Image 2'   },
                  { url: selectedSlot.linkedProduct.imageUrl3, idx: 2, label: 'Image 3'   },
                ].filter(x => x.url).map(({ url, idx, label }) => {
                  const isActive = selectedSlot.imageIndex === idx;
                  const cropKey = `${selectedSlot.id}-${idx ?? 'null'}`;
                  const isCropOpen = cropEditorOpenForSlot === cropKey;
                  
                  return (
                    <button
                      key={label}
                      onClick={() => {
                        if (!isActive) {
                          onUpdateSlotConfig(selectedSlot.id, { imageIndex: idx as any });
                          setCropEditorOpenForSlot(null);
                        } else {
                          setCropEditorOpenForSlot(isCropOpen ? null : cropKey);
                        }
                      }}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        isActive
                          ? isCropOpen
                            ? 'border-primary ring-2 ring-primary/80 scale-105'
                            : 'border-primary ring-2 ring-primary/50'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <img src={url!} alt={label} className="w-full h-full object-cover" />
                      {isActive && <div className="absolute inset-0 bg-primary/20" />}
                      {isActive && isCropOpen && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="text-white text-[10px] font-bold">✂️</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                        {label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const cropKey = `${selectedSlot.id}-${selectedSlot.imageIndex ?? 'null'}`;
                if (cropEditorOpenForSlot !== cropKey) return null;

                const cropImageKey = selectedSlot.imageIndex ?? 0;
                const currentCrops = (selectedSlot.customConfig as any)?.imageCrops || {};
                const imgCrop = currentCrops[cropImageKey] || {
                  zoom: 100, posX: 50, posY: 50, fit: 'cover',
                };

                const updateCrop = (key: string, value: any) => {
                  onUpdateSlotConfig(selectedSlot.id, {
                    customConfig: {
                      ...(selectedSlot.customConfig as any),
                      imageCrops: {
                        ...currentCrops,
                        [cropImageKey]: { ...imgCrop, [key]: value },
                      },
                    },
                  });
                };

                const resetCrop = () => {
                  onUpdateSlotConfig(selectedSlot.id, {
                    customConfig: {
                      ...(selectedSlot.customConfig as any),
                      imageCrops: {
                        ...currentCrops,
                        [cropImageKey]: { zoom: 100, posX: 50, posY: 50, fit: 'cover' },
                      },
                    },
                  });
                };

                const updatePosition = (posX: number, posY: number) => {
                  onUpdateSlotConfig(selectedSlot.id, {
                    customConfig: {
                      ...(selectedSlot.customConfig as any),
                      imageCrops: {
                        ...currentCrops,
                        [cropImageKey]: { ...imgCrop, posX, posY },
                      },
                    },
                  });
                };

                const displayImage = (() => {
                  const p = selectedSlot.linkedProduct!;
                  const i = selectedSlot.imageIndex;
                  if (i === 0 && p.imageUrl1) return p.imageUrl1;
                  if (i === 1 && p.imageUrl2) return p.imageUrl2;
                  if (i === 2 && p.imageUrl3) return p.imageUrl3;
                  return p.imageUrl1 || p.imageUrl2 || p.imageUrl3 || null;
                })();

                const frameStyle = selectedSlot.frameStyle || 'square';
                const aspectMap: Record<string, string> = {
                  square: '1/1', horizontal: '4/3', vertical: '3/4',
                  circle: '1/1', rounded: '1/1',
                };
                const borderRadiusMap: Record<string, string> = {
                  square: '8px', horizontal: '8px', vertical: '8px',
                  circle: '50%', rounded: '24px',
                };

                if (!displayImage) return null;

                return (
                  <div className="border-t border-gray-700 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">Recadrage & zoom</span>
                      <button
                        onClick={resetCrop}
                        className="text-[10px] text-gray-500 hover:text-gray-300 underline transition-colors"
                      >
                        Réinitialiser
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <div
                        className="relative overflow-hidden bg-gray-700"
                        style={{
                          width: 140,
                          aspectRatio: aspectMap[frameStyle] || '1/1',
                          borderRadius: borderRadiusMap[frameStyle] || '8px',
                        }}
                      >
                        <img
                          src={displayImage}
                          alt="Aperçu"
                          style={{
                            position: 'absolute',
                            width: `${imgCrop.zoom}%`,
                            height: `${imgCrop.zoom}%`,
                            objectFit: imgCrop.fit as any,
                            left: `${imgCrop.posX - (imgCrop.zoom / 2)}%`,
                            top:  `${imgCrop.posY - (imgCrop.zoom / 2)}%`,
                            maxWidth: 'none',
                            maxHeight: 'none',
                            transform: 'none',
                            pointerEvents: 'none',
                            userSelect: 'none',
                          }}
                          draggable={false}
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundImage:
                              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),' +
                              'linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                            backgroundSize: '33.33% 33.33%',
                          }}
                        />
                      </div>
                    </div>

                    {/* Fit mode */}
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1.5">Mode de remplissage</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { val: 'cover',   label: 'Remplir',   icon: '▣' },
                          { val: 'contain', label: 'Contenir',  icon: '□' },
                          { val: 'fill',    label: 'Étirer',    icon: '⬜' },
                        ].map(({ val, label, icon }) => (
                          <button
                            key={val}
                            onClick={() => updateCrop('fit', val)}
                            className={`py-1.5 rounded text-xs flex flex-col items-center gap-0.5 transition-colors ${
                              imgCrop.fit === val
                                ? 'bg-primary text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            <span className="text-base leading-none">{icon}</span>
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Zoom */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-[11px] text-gray-500">Zoom</label>
                        <span className="text-[11px] text-gray-300 font-mono">{imgCrop.zoom}%</span>
                      </div>
                      <input
                        type="range" min={50} max={200} step={1}
                        value={imgCrop.zoom}
                        onChange={e => updateCrop('zoom', parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                        <span>50%</span><span>100%</span><span>200%</span>
                      </div>
                    </div>

                    {/* Position horizontale */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-[11px] text-gray-500">Position horizontale</label>
                        <span className="text-[11px] text-gray-300 font-mono">
                          {imgCrop.posX === 50 ? 'Centre' : imgCrop.posX < 50 ? `Gauche ${imgCrop.posX}%` : `Droite ${imgCrop.posX}%`}
                        </span>
                      </div>
                      <input
                        type="range" min={0} max={100} step={1}
                        value={imgCrop.posX}
                        onChange={e => updateCrop('posX', parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                        <span>← Gauche</span><span>Centre</span><span>Droite →</span>
                      </div>
                    </div>

                    {/* Position verticale */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-[11px] text-gray-500">Position verticale</label>
                        <span className="text-[11px] text-gray-300 font-mono">
                          {imgCrop.posY === 50 ? 'Centre' : imgCrop.posY < 50 ? `Haut ${imgCrop.posY}%` : `Bas ${imgCrop.posY}%`}
                        </span>
                      </div>
                      <input
                        type="range" min={0} max={100} step={1}
                        value={imgCrop.posY}
                        onChange={e => updateCrop('posY', parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                        <span>↑ Haut</span><span>Centre</span><span>Bas ↓</span>
                      </div>
                    </div>

                    {/* Raccourcis de position */}
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1.5">Raccourcis</label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { label: '↖', posX: 0,  posY: 0  },
                          { label: '↑', posX: 50, posY: 0  },
                          { label: '↗', posX: 100,posY: 0  },
                          { label: '←', posX: 0,  posY: 50 },
                          { label: '·', posX: 50, posY: 50 },
                          { label: '→', posX: 100,posY: 50 },
                          { label: '↙', posX: 0,  posY: 100},
                          { label: '↓', posX: 50, posY: 100},
                          { label: '↘', posX: 100,posY: 100},
                        ].map(({ label, posX, posY }) => (
                          <button
                            key={label}
                            onClick={() => updatePosition(posX, posY)}
                            className={`h-8 rounded text-sm flex items-center justify-center transition-colors ${
                              imgCrop.posX === posX && imgCrop.posY === posY
                                ? 'bg-primary text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Carrousel */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-gray-400">Mode carrousel</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox"
                  checked={selectedSlot.carouselConfig?.enabled || false}
                  onChange={(e) => onUpdateSlotConfig(selectedSlot.id, {
                    carouselConfig: {
                      enabled: e.target.checked,
                      interval: selectedSlot.carouselConfig?.interval || 3000,
                      animation: selectedSlot.carouselConfig?.animation || 'fade',
                      stopOnHover: selectedSlot.carouselConfig?.stopOnHover ?? true,
                      showDots: selectedSlot.carouselConfig?.showDots ?? true,
                      showArrows: selectedSlot.carouselConfig?.showArrows ?? true,
                      currentImageIndex: 0,
                    }
                  })}
                  className="toggle" />
              </label>
            </div>

            {selectedSlot.carouselConfig?.enabled && (
              <div className="space-y-3 pt-3 border-t border-gray-700">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Intervalle</span>
                    <span className="text-xs text-gray-300 font-mono">{(selectedSlot.carouselConfig.interval || 3000) / 1000}s</span>
                  </div>
                  <input type="range" min="1000" max="10000" step="500"
                    value={selectedSlot.carouselConfig.interval || 3000}
                    onChange={(e) => onUpdateSlotConfig(selectedSlot.id, {
                      carouselConfig: { ...selectedSlot.carouselConfig!, interval: parseInt(e.target.value) }
                    })}
                    className="w-full accent-primary" />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-2">Animation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['fade', 'slide'] as const).map(anim => (
                      <button key={anim}
                        onClick={() => onUpdateSlotConfig(selectedSlot.id, {
                          carouselConfig: { ...selectedSlot.carouselConfig!, animation: anim }
                        })}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${selectedSlot.carouselConfig?.animation === anim ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                        {anim === 'fade' ? 'Fondu' : 'Glissement'}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  { key: 'stopOnHover', label: 'Stop au survol' },
                  { key: 'showDots', label: 'Points de navigation' },
                  { key: 'showArrows', label: 'Flèches' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300 text-xs">{label}</span>
                    <input type="checkbox"
                      checked={(selectedSlot.carouselConfig as any)?.[key] ?? true}
                      onChange={(e) => onUpdateSlotConfig(selectedSlot.id, {
                        carouselConfig: { ...selectedSlot.carouselConfig!, [key]: e.target.checked }
                      })}
                      className="toggle" />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Éléments — mode traditionnel */}
          {selectedSlot.displayMode === 'traditional' && (
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-4">
              <label className="text-sm text-gray-400 block">Éléments à afficher</label>
              {[
                { key: 'showImage', label: 'Image', icon: <FiImage size={13} /> },
                { key: 'showName', label: 'Nom', icon: <FiType size={13} /> },
                { key: 'showPrice', label: 'Prix', icon: <FiTag size={13} /> },
                { key: 'showDescription', label: 'Description', icon: <FiAlignLeft size={13} /> },
                { key: 'showAddToCart', label: 'Bouton Ajouter', icon: <FiShoppingCart size={13} /> },
              ].map(({ key, label, icon }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-300 text-sm flex items-center gap-2">{icon} {label}</span>
                  <input type="checkbox"
                    checked={(selectedSlot.customConfig?.traditionalConfig as any)?.[key] ?? (key !== 'showDescription')}
                    onChange={(e) => updateTraditionalConfig(selectedSlot.id, key, e.target.checked)}
                    className="toggle" />
                </label>
              ))}

              {/* Typographie pour mode traditionnel */}
              <div className="border-t border-gray-700 pt-3 space-y-3">
                <label className="text-sm text-gray-400 block">Typographie</label>

                {/* Nom du produit */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Nom du produit</label>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Police</label>
                    <select
                      value={(selectedSlot.customConfig?.traditionalConfig as any)?.nameFont || 'Inter'}
                      onChange={(e) => updateTraditionalConfig(selectedSlot.id, 'nameFont', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                    >
                      {FONTS_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Taille : {(selectedSlot.customConfig?.traditionalConfig as any)?.nameFontSize || 14}px
                    </label>
                    <input type="range" min="10" max="28" step="1"
                      value={(selectedSlot.customConfig?.traditionalConfig as any)?.nameFontSize || 14}
                      onChange={(e) => updateTraditionalConfig(selectedSlot.id, 'nameFontSize', parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Graisse</label>
                    <select
                      value={(selectedSlot.customConfig?.traditionalConfig as any)?.nameFontWeight || '600'}
                      onChange={(e) => updateTraditionalConfig(selectedSlot.id, 'nameFontWeight', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                    >
                      {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Couleur</label>
                    <div className="flex items-center gap-2">
                      <input type="color"
                        value={(selectedSlot.customConfig?.traditionalConfig as any)?.nameColor || '#1F2937'}
                        onChange={(e) => updateTraditionalConfig(selectedSlot.id, 'nameColor', e.target.value)}
                        className="w-8 h-7 rounded cursor-pointer border border-gray-600"
                      />
                      <input type="text"
                        value={(selectedSlot.customConfig?.traditionalConfig as any)?.nameColor || '#1F2937'}
                        onChange={(e) => updateTraditionalConfig(selectedSlot.id, 'nameColor', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Prix */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Prix</label>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Police</label>
                    <select
                      value={(selectedSlot.customConfig?.traditionalConfig as any)?.priceFont || 'Inter'}
                      onChange={(e) => updateTraditionalConfig(selectedSlot.id, 'priceFont', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                    >
                      {FONTS_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Taille : {(selectedSlot.customConfig?.traditionalConfig as any)?.priceFontSize || 14}px
                    </label>
                    <input type="range" min="10" max="28" step="1"
                      value={(selectedSlot.customConfig?.traditionalConfig as any)?.priceFontSize || 14}
                      onChange={(e) => updateTraditionalConfig(selectedSlot.id, 'priceFontSize', parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Graisse</label>
                    <select
                      value={(selectedSlot.customConfig?.traditionalConfig as any)?.priceFontWeight || '700'}
                      onChange={(e) => updateTraditionalConfig(selectedSlot.id, 'priceFontWeight', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                    >
                      {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Couleur</label>
                    <div className="flex items-center gap-2">
                      <input type="color"
                        value={(selectedSlot.customConfig?.traditionalConfig as any)?.priceColor || '#2563EB'}
                        onChange={(e) => updateTraditionalConfig(selectedSlot.id, 'priceColor', e.target.value)}
                        className="w-8 h-7 rounded cursor-pointer border border-gray-600"
                      />
                      <input type="text"
                        value={(selectedSlot.customConfig?.traditionalConfig as any)?.priceColor || '#2563EB'}
                        onChange={(e) => updateTraditionalConfig(selectedSlot.id, 'priceColor', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Éléments — mode interactif */}
          {selectedSlot.displayMode === 'interactive' && (
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-4">
              
              {/* Déclenchement */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">Déclenchement</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['click', 'hover'] as const).map(t => (
                    <button key={t}
                      onClick={() => updateInteractiveConfig(selectedSlot.id, 'triggerType', t)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${(selectedSlot.customConfig?.interactiveConfig?.triggerType ?? 'click') === t ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {t === 'click' ? '🔘 Clic' : '🖱️ Survol'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Éléments à afficher */}
              <div className="border-t border-gray-700 pt-3 space-y-2">
                <label className="text-sm text-gray-400 block">Éléments visibles</label>
                {[
                  { key: 'showNameOnClick',        label: 'Nom du produit' },
                  { key: 'showPriceOnClick',       label: 'Prix' },
                  { key: 'showDescriptionOnClick', label: 'Description' },
                  { key: 'showAddToCart',          label: 'Bouton panier' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300 text-sm">{label}</span>
                    <input type="checkbox"
                      checked={(selectedSlot.customConfig?.interactiveConfig as any)?.[key] ?? (key === 'showPriceOnClick' || key === 'showAddToCart' || key === 'showNameOnClick')}
                      onChange={(e) => updateInteractiveConfig(selectedSlot.id, key, e.target.checked)}
                      className="toggle" />
                  </label>
                ))}
              </div>

              {/* Typographie pour mode interactif */}
              <div className="border-t border-gray-700 pt-3 space-y-3">
                <label className="text-sm text-gray-400 block">Typographie</label>

                {/* Nom du produit */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Nom du produit</label>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Police</label>
                    <select
                      value={(selectedSlot.customConfig?.interactiveConfig as any)?.nameFont || 'Inter'}
                      onChange={(e) => updateInteractiveConfig(selectedSlot.id, 'nameFont', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                    >
                      {FONTS_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Taille : {(selectedSlot.customConfig?.interactiveConfig as any)?.nameFontSize || 14}px
                    </label>
                    <input type="range" min="10" max="28" step="1"
                      value={(selectedSlot.customConfig?.interactiveConfig as any)?.nameFontSize || 14}
                      onChange={(e) => updateInteractiveConfig(selectedSlot.id, 'nameFontSize', parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>

                {/* Prix */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Prix</label>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Police</label>
                    <select
                      value={(selectedSlot.customConfig?.interactiveConfig as any)?.priceFont || 'Inter'}
                      onChange={(e) => updateInteractiveConfig(selectedSlot.id, 'priceFont', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                    >
                      {FONTS_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Taille : {(selectedSlot.customConfig?.interactiveConfig as any)?.priceFontSize || 15}px
                    </label>
                    <input type="range" min="10" max="28" step="1"
                      value={(selectedSlot.customConfig?.interactiveConfig as any)?.priceFontSize || 15}
                      onChange={(e) => updateInteractiveConfig(selectedSlot.id, 'priceFontSize', parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Positionnement dans le cadre */}
              <div className="border-t border-gray-700 pt-3 space-y-3">
                <label className="text-sm text-gray-400 block">Position dans le cadre</label>

                {[
                  { label: 'Nom',    key: 'namePosition',   defaultVal: 'bottom-left'  },
                  { label: 'Prix',   key: 'pricePosition',  defaultVal: 'bottom-left'  },
                  { label: 'Bouton', key: 'buttonPosition', defaultVal: 'bottom-right' },
                  { label: 'Description', key: 'descriptionPosition', defaultVal: 'bottom-center' },
                ].map(({ label, key, defaultVal }) => {
                  const current = (selectedSlot.customConfig?.interactiveConfig as any)?.[key] ?? defaultVal;
                  const positions = [
                    'top-left',    'top-center',    'top-right',
                    'center-left', 'center',        'center-right',
                    'bottom-left', 'bottom-center', 'bottom-right',
                  ];
                  const icons: Record<string, string> = {
                    'top-left': '↖', 'top-center': '↑', 'top-right': '↗',
                    'center-left': '←', 'center': '·', 'center-right': '→',
                    'bottom-left': '↙', 'bottom-center': '↓', 'bottom-right': '↘',
                  };
                  return (
                    <div key={key}>
                      <label className="text-gray-400 text-xs block mb-1.5">{label}</label>
                      <div className="grid grid-cols-3 gap-1" style={{ width: 'fit-content' }}>
                        {positions.map(pos => (
                          <button
                            key={pos}
                            onClick={() => updateInteractiveConfig(selectedSlot.id, key, pos)}
                            className={`w-8 h-8 rounded text-sm flex items-center justify-center transition-colors ${
                              current === pos
                                ? 'bg-primary text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                            title={pos}
                          >
                            {icons[pos]}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Couleurs du texte */}
              <div className="border-t border-gray-700 pt-3 space-y-2">
                <label className="text-sm text-gray-400 block">Couleurs du texte</label>
                <div className="flex gap-3 items-center">
                  <label className="text-gray-400 text-sm w-12">Nom</label>
                  <input type="color"
                    value={(selectedSlot.customConfig?.interactiveConfig as any)?.nameColor || '#FFFFFF'}
                    onChange={(e) => updateInteractiveConfig(selectedSlot.id, 'nameColor', e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border border-gray-600" />
                </div>
                <div className="flex gap-3 items-center">
                  <label className="text-gray-400 text-sm w-12">Prix</label>
                  <input type="color"
                    value={(selectedSlot.customConfig?.interactiveConfig as any)?.priceColor || '#FFFFFF'}
                    onChange={(e) => updateInteractiveConfig(selectedSlot.id, 'priceColor', e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border border-gray-600" />
                </div>
              </div>

              {/* Texte du bouton panier */}
              <div className="border-t border-gray-700 pt-3">
                <label className="text-sm text-gray-400 block mb-1">Texte du bouton panier</label>
                <input
                  type="text"
                  value={(selectedSlot.customConfig?.interactiveConfig as any)?.cartButtonText || 'Ajouter au panier'}
                  onChange={(e) => updateInteractiveConfig(selectedSlot.id, 'cartButtonText', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              {/* Style overlay */}
              <div className="border-t border-gray-700 pt-3">
                <label className="text-sm text-gray-400 block mb-2">Style overlay</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['modal', 'tooltip', 'slide', 'fade'] as const).map(s => (
                    <button key={s}
                      onClick={() => updateInteractiveConfig(selectedSlot.id, 'overlayStyle', s)}
                      className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${(selectedSlot.customConfig?.interactiveConfig?.overlayStyle ?? 'modal') === s ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flou overlay */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-gray-400">Flou du fond</label>
                  <span className="text-sm text-gray-300 font-mono">{selectedSlot.customConfig?.interactiveConfig?.overlayBlur ?? 4}px</span>
                </div>
                <input type="range" min="0" max="20"
                  value={selectedSlot.customConfig?.interactiveConfig?.overlayBlur ?? 4}
                  onChange={(e) => updateInteractiveConfig(selectedSlot.id, 'overlayBlur', parseInt(e.target.value))}
                  className="w-full accent-primary" />
              </div>

              {/* Couleur de fond overlay */}
              <div className="border-t border-gray-700 pt-3">
                <label className="text-sm text-gray-400 block mb-2">Couleur de fond overlay</label>
                <input type="color"
                  value={(selectedSlot.customConfig?.interactiveConfig as any)?.overlayBackground || '#ffffff'}
                  onChange={(e) => updateInteractiveConfig(selectedSlot.id, 'overlayBackground', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer border border-gray-600" />
              </div>
            </div>
          )}

          {/* Produit lié */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <label className="text-sm text-gray-400 block mb-2">Produit lié</label>
            {selectedSlot.linkedProduct ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={getMainProductImage(selectedSlot.linkedProduct)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{selectedSlot.linkedProduct.name}</div>
                  <div className="text-primary text-sm">{selectedSlot.linkedProduct.price} €</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">
                    🏷️ Tailles: {selectedSlot.linkedProduct.sizes?.length || 0} | 
                    🎨 Couleurs: {selectedSlot.linkedProduct.colors?.length || 0}
                  </div>
                </div>
                <button onClick={() => onUnlinkProduct(selectedSlot.id)}
                  className="p-1.5 bg-red-500/20 rounded-md text-red-400 hover:bg-red-500/30 transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { 
                    const currentSlot = gridConfig.slots.find(s => s.id === selectedSlot.id);
                    if (currentSlot && !currentSlot.customConfig?.traditionalConfig) {
                      onUpdateSlotConfig(selectedSlot.id, {
                        customConfig: {
                          ...currentSlot.customConfig,
                          traditionalConfig: DEFAULT_TRADITIONAL_CONFIG,
                        }
                      });
                    }
                    setCurrentSlotId(selectedSlot.id); 
                    setShowProductSelector(true); 
                  }}
                  className="flex-1 py-2 bg-primary/20 text-primary rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-primary/30 transition-colors">
                  <FiPlus size={14} /> Produit existant
                </button>
                <button
                  onClick={() => { setCurrentSlotId(selectedSlot.id); setShowCreateProduct(true); }}
                  className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-green-500/30 transition-colors">
                  <FiSave size={14} /> Créer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ MODALS ════════════════════════════════════════════════════════════════ */}

      {/* Sélecteur produit existant */}
      {showProductSelector && currentSlotId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" onClick={() => setShowProductSelector(false)}>
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Lier un produit</h3>
              <button onClick={() => setShowProductSelector(false)}><FiX size={20} /></button>
            </div>
            <div className="p-4">
              <input type="text" placeholder="Rechercher..." value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
            </div>
            <div className="flex-1 overflow-auto px-4 pb-4 space-y-2">
              {products
                .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                .map((p) => {
                  // ⭐ Clé unique avec productsVersion
                  const key = `product-${p.id}-${productsVersion}`;
                  return (
                    <button key={key}
                      onClick={() => { 
                        console.log('🔗 Lien produit sélectionné:', { id: p.id, name: p.name, sizes: p.sizes, colors: p.colors });
                        const currentSlot = gridConfig.slots.find(s => s.id === currentSlotId);
                        if (currentSlot && !currentSlot.customConfig?.traditionalConfig) {
                          onUpdateSlotConfig(currentSlotId!, {
                            customConfig: {
                              ...currentSlot.customConfig,
                              traditionalConfig: DEFAULT_TRADITIONAL_CONFIG,
                            }
                          });
                        }
                        onLinkProduct(currentSlotId!, p); 
                        setShowProductSelector(false); 
                        setProductSearch(''); 
                      }}
                      className="w-full flex gap-3 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        <img src={getMainProductImage(p)} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <div className="text-white text-sm">{p.name}</div>
                        <div className="text-primary text-sm">{p.price}€</div>
                        <div className="text-[9px] text-gray-500">
                          🏷️{p.sizes?.length || 0} | 🎨{p.colors?.length || 0}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Créer un produit */}
      {showCreateProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
              <h3 className="text-white font-semibold">Créer un produit</h3>
              <button onClick={() => setShowCreateProduct(false)}><FiX size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div>
                <label className="text-white text-sm block mb-1">Nom *</label>
                <input type="text" value={newProduct.name}
                  onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white text-sm block mb-1">Prix *</label>
                  <input type="number" step="0.01" value={newProduct.price || ''}
                    onChange={(e) => setNewProduct(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="text-white text-sm block mb-1">Stock</label>
                  <input type="number" value={newProduct.stock || ''}
                    onChange={(e) => setNewProduct(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="text-white text-sm block mb-1">Catégorie</label>
                <input type="text" value={newProduct.category}
                  onChange={(e) => setNewProduct(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-white text-sm block mb-1">Description</label>
                <textarea rows={3} value={newProduct.description}
                  onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none" />
              </div>

              {/* Images */}
              <div>
                <label className="text-white text-sm block mb-2">Images</label>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2].map((idx) => {
                    const imageUrl = idx === 0 ? newProduct.imageUrl1 : idx === 1 ? newProduct.imageUrl2 : newProduct.imageUrl3;
                    const label = idx === 0 ? 'Principale *' : idx === 1 ? 'Image 2' : 'Image 3';
                    return (
                      <div key={idx} className="border border-gray-700 rounded-lg p-2">
                        <label className="text-gray-400 text-xs">{label}</label>
                        <div className="relative w-full aspect-square bg-gray-800 rounded-lg overflow-hidden mt-1">
                          {imageUrl ? (
                            <>
                              <img src={imageUrl} className="w-full h-full object-cover" />
                              <button onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"><FiX size={12} /></button>
                            </>
                          ) : (
                            <div className="flex h-full">
                              <button onClick={() => triggerFileUpload(idx)}
                                className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-700 transition-colors">
                                {uploadingImageIndex === idx
                                  ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                  : <><FiUpload size={18} /><span className="text-[11px]">Upload</span></>}
                              </button>
                              {assets.length > 0 && (
                                <button onClick={() => { setCurrentImageIndex(idx); setShowImageSelector(true); }}
                                  className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-700 transition-colors border-l border-gray-700">
                                  <FiFolder size={18} /><span className="text-[11px]">Biblio</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">⚠️ L'image principale sera utilisée comme image principale du produit</p>
              </div>

              {/* Tailles */}
              <div>
                <label className="text-white text-sm block mb-2">Tailles</label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_SIZES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${newProduct.sizes.includes(s) ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Couleurs */}
              <div>
                <label className="text-white text-sm block mb-2">Couleurs</label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_COLORS.map(c => (
                    <button key={c.name} type="button" onClick={() => toggleColor(c.name, c.value)}
                      className={`w-8 h-8 rounded-full transition-all ${newProduct.colors.some(x => x.name === c.name) ? 'ring-2 ring-primary ring-offset-2 ring-offset-gray-900 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c.value, border: c.value === '#FFFFFF' ? '1px solid #555' : 'none' }}
                      title={c.name} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t border-gray-700 sticky bottom-0 bg-gray-900">
              <button onClick={() => setShowCreateProduct(false)}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Annuler
              </button>
              <button onClick={handleCreateProduct}
                disabled={isCreating || !newProduct.name || newProduct.price <= 0}
                className="flex-1 py-2 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors">
                {isCreating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bibliothèque d'images */}
      {showImageSelector && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50" onClick={() => setShowImageSelector(false)}>
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Bibliothèque d'images</h3>
              <button onClick={() => setShowImageSelector(false)}><FiX size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {assets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiImage size={40} className="mx-auto mb-3 opacity-40" />
                  <p>Aucune image dans la bibliothèque</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {assets.filter(a => a.type === 'image').map((asset) => (
                    <button key={asset.id} onClick={() => selectFromLibrary(asset.url)}
                      className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiExternalLink size={20} className="text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}