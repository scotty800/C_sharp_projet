'use client';

import { useState, useEffect } from 'react';
import { 
  FiDroplet, FiType, FiFilter, FiImage, FiLayout, 
  FiPackage, FiSettings, FiCamera, FiPlusSquare, FiLayers, FiX,
  FiMenu, // ⭐ pour la navigation
  FiZap, // ⭐ NOUVEAU pour les animations
  FiCreditCard // ⭐ AJOUTÉ pour les boutons
} from 'react-icons/fi';
import ColorsPanel from './panels/ColorsPanel';
import FontsPanel from './panels/FontsPanel';
import FiltersPanel from './panels/FiltersPanel';
import AssetsPanel from './panels/AssetsPanel';
import TemplatesPanel from './panels/TemplatesPanel';
import SectionsPanel from './panels/SectionsPanel';
import ProductsPanel from './panels/ProductsPanel';
import SettingsPanel from './panels/SettingsPanel';
import SnapshotsPanel from './panels/SnapshotsPanel';
import TextPanel from './panels/TextPanel';
import ButtonsPanel from './panels/ButtonsPanel'; // ⭐ AJOUTÉ
import GridManagerPanel from './panels/GridManagerPanel';
import ProductCustomizationSidebar from './panels/ProductCustomizationSidebar';
// ⭐ Panneau Navigation
import NavbarPanel from './panels/NavbarPanel';
// ⭐ Panneau Navigation Link
import NavigationLinkPanel from './panels/NavigationLinkPanel';
// ⭐ NOUVEAU : Panneau Animations
import AnimationsPanel from './panels/AnimationsPanel';
import { ProductGridConfig, ProductGridSlot, StudioProduct, ProductCustomization, CreateStudioProduct } from '@/types/studio';
import { StudioPage } from '@/types/studio';

interface Props {
  shop: any;
  blocks: any[];
  selectedBlockId: string | null;
  selectedTarget: 'text' | 'background';
  isBackgroundSelected: boolean;
  customization: any;
  filters: any;
  canvasFilters: any;
  activePanel: string;
  onAddBlock: (type: string, props: any, parentId?: string | null) => void;
  onUpdateBlock: (id: string, updates: any) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onUpdateCustomization: (updates: any) => void;
  onUpdateFilters: (updates: any) => void;
  onUpdateCanvasFilters: (updates: any) => void;
  onApplyToWholePage: (updates: any) => void;
  onSelectBackground: () => void;
  onReparentLayer?: (layerId: string, newParentId: string | null) => void;
  onToggleLayerVisibility?: (layerId: string) => void;
  onToggleLayerLock?: (layerId: string) => void;
  onReorderLayers?: (startIndex: number, endIndex: number, parentId?: string | null) => void;
  onGroupLayers?: (layerIds: string[]) => void;
  onUngroupLayer?: (layerId: string) => void;
  onUpdateInternalElement?: (elementId: string, parentId: string, updates: any) => void;
  onDeleteInternalElement?: (elementId: string, parentId: string) => void;
  shopId: number;
  onAddSlide?: (carouselBlockId: string) => void;
  gridConfig?: ProductGridConfig;
  onUpdateGrid?: (config: ProductGridConfig) => void;
  onSelectSlot?: (slotId: string) => void;
  onLinkProductToSlot?: (slotId: string, product: StudioProduct) => void;
  onUnlinkProductFromSlot?: (slotId: string) => void;
  onUpdateSlotConfig?: (slotId: string, config: Partial<ProductGridSlot>) => void;
  onSelectBlock?: (blockId: string | null, target?: 'text' | 'background') => void;
  onCreateProduct?: (product: CreateStudioProduct) => Promise<StudioProduct>;
  selectedProductForCustomization?: {
    id: number;
    name: string;
    customization: ProductCustomization;
    slideCount?: number;
  } | null;
  onUpdateProductCustomization?: (productId: number, updates: Partial<ProductCustomization>) => void;
  onCloseProductCustomization?: () => void;
  productsList?: StudioProduct[];
  // ⭐ NOUVEAU : pages pour la navigation
  pages?: StudioPage[];
  // ⭐ NOUVEAU : ID de la page actuelle pour les animations de page
  currentPageId?: string;
}

// ⭐ PANELS mis à jour avec l'ajout de 'buttons', 'navbar' et 'animations'
const PANELS = [
  { id: 'sections',   label: 'Sections',    icon: FiPlusSquare },
  { id: 'textes',     label: 'Textes',      icon: FiType },
  { id: 'buttons',    label: 'Boutons',     icon: FiCreditCard }, // ⭐ NOUVEAU
  { id: 'colors',     label: 'Couleurs',    icon: FiDroplet },
  { id: 'fonts',      label: 'Polices',     icon: FiType },
  { id: 'filters',    label: 'Filtres',     icon: FiFilter },
  { id: 'assets',     label: 'Assets',      icon: FiImage },
  { id: 'templates',  label: 'Templates',   icon: FiLayout },
  { id: 'products',   label: 'Produits',    icon: FiPackage },
  { id: 'snapshots',  label: 'Versions',    icon: FiCamera },
  { id: 'settings',   label: 'Paramètres',  icon: FiSettings },
  { id: 'layers',     label: 'Calques',     icon: FiLayers },
  { id: 'navbar',     label: 'Navigation',  icon: FiMenu },
  { id: 'animations', label: 'Animations',  icon: FiZap }, // ⭐ NOUVEAU
];

export default function StudioSidebar({ 
  shop, blocks, selectedBlockId, selectedTarget, isBackgroundSelected,
  customization, filters, canvasFilters, activePanel,
  onAddBlock, onUpdateBlock, onDeleteBlock, onDuplicateBlock,
  onUpdateCustomization, onUpdateFilters, onUpdateCanvasFilters,
  onApplyToWholePage, onSelectBackground, shopId, onAddSlide,
  gridConfig, onUpdateGrid, onSelectSlot, onLinkProductToSlot,
  onUnlinkProductFromSlot, onUpdateSlotConfig, onSelectBlock,
  onCreateProduct, selectedProductForCustomization,
  onUpdateProductCustomization, onCloseProductCustomization,
  productsList = [],
  pages = [], // ⭐ NOUVEAU : pages
  currentPageId, // ⭐ NOUVEAU : ID de la page actuelle
}: Props) {

  // Panel ouvert (null = panneau droit fermé)
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  const getSelectedBlock = () => {
    if (!selectedBlockId || isBackgroundSelected) return null;
    return blocks.find(b => b.id === selectedBlockId) || null;
  };
  const selectedBlock = getSelectedBlock();

  // Sync avec activePanel venant de l'extérieur
  useEffect(() => {
    if (activePanel) setOpenPanel(activePanel);
  }, [activePanel]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('productsListUpdated', { detail: { products: productsList } }));
  }, [productsList]);

  const handleIconClick = (panelId: string) => {
    // Toggle : si déjà ouvert, fermer
    setOpenPanel(prev => prev === panelId ? null : panelId);
    // Sync avec le reste de l'app
    const event = new CustomEvent('changePanel', { detail: panelId });
    window.dispatchEvent(event);
  };

  const handleUpdateBlock = (blockId: string, updates: any) => {
    onUpdateBlock(blockId, updates);
  };

  const handleSelectSlot = (slotId: string) => {
    onSelectSlot?.(slotId);
    onSelectBlock?.(slotId, 'background');
  };

  const renderPanelContent = () => {
    switch (openPanel) {
      case 'sections':
        return <SectionsPanel onAddSection={onAddBlock} />;

      case 'textes':
        return (
          <TextPanel onAddText={(textData) => {
            onAddBlock(textData.type, { ...textData, position: { x: 200, y: 200, width: 300, height: 100, zIndex: 10 } });
          }} />
        );

      // ⭐ NOUVEAU : Panneau Boutons
      case 'buttons':
        return (
          <ButtonsPanel onAddButton={(buttonData) => {
            onAddBlock(buttonData.type, { ...buttonData, position: { x: 200, y: 200, width: 160, height: 48, zIndex: 10 } });
          }} />
        );

      case 'assets':
        return (
          <AssetsPanel
            onSelectAsset={(asset) => onAddBlock(asset.type, asset.defaultProps)}
            shopId={shopId}
          />
        );

      case 'colors':
        return (
          <ColorsPanel
            selectedBlock={selectedBlock}
            selectedTarget={selectedTarget}
            isBackgroundSelected={isBackgroundSelected}
            customization={customization}
            onUpdateBlock={handleUpdateBlock}
            onUpdateCustomization={onUpdateCustomization}
            shopId={shopId}
            onAddSlide={onAddSlide}
          />
        );

      case 'fonts':
        return (
          <FontsPanel
            selectedBlock={selectedBlock}
            selectedTarget={selectedTarget}
            isBackgroundSelected={isBackgroundSelected}
            customization={customization}
            onUpdateBlock={handleUpdateBlock}
            onUpdateCustomization={onUpdateCustomization}
          />
        );

      case 'filters':
        return (
          <FiltersPanel
            selectedBlock={selectedBlock}
            isBackgroundSelected={isBackgroundSelected}
            filters={filters}
            canvasFilters={canvasFilters}
            onUpdateBlock={handleUpdateBlock}
            onUpdateFilters={onUpdateFilters}
            onUpdateCanvasFilters={onUpdateCanvasFilters}
            onApplyToWholePage={onApplyToWholePage}
          />
        );

      case 'templates':
        return (
          <TemplatesPanel
            onApplyTemplate={(template) => {
              if (template.configuration) onUpdateCustomization(template.configuration);
            }}
          />
        );

      case 'products':
        return gridConfig && onUpdateGrid ? (
          <GridManagerPanel
            gridConfig={gridConfig}
            products={productsList}
            selectedSlotId={selectedBlockId}
            onUpdateGrid={onUpdateGrid}
            onSelectSlot={handleSelectSlot}
            onLinkProduct={onLinkProductToSlot || (() => {})}
            onUnlinkProduct={onUnlinkProductFromSlot || (() => {})}
            onUpdateSlotConfig={onUpdateSlotConfig || (() => {})}
            onCreateProduct={onCreateProduct}
          />
        ) : (
          <ProductsPanel
            shopId={shopId}
            featuredProducts={[]}
            onUpdateFeatured={() => {}}
            onCreateProduct={onCreateProduct}
          />
        );

      case 'snapshots':
        return <SnapshotsPanel shopId={shopId} onRestore={() => {}} />;

      case 'settings':
        return <SettingsPanel customization={customization} onUpdate={onUpdateCustomization} />;

      case 'layers':
        return (
          <div className="p-4">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggleFloatingLayers'));
              }}
              className="w-full py-2 bg-primary text-white rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-primary/80 transition-colors"
            >
              <FiLayers size={16} />
              Ouvrir le panneau des calques
            </button>
            <p className="text-xs text-gray-400 mt-3 text-center border-t border-gray-700 pt-3">
              💡 <kbd className="px-1 py-0.5 bg-gray-800 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-800 rounded">Shift</kbd> + <kbd className="px-1 py-0.5 bg-gray-800 rounded">L</kbd>
            </p>
          </div>
        );

      // ⭐ Panneau Navigation — Navbar OU bloc lié à une page
      case 'navbar':
        if (selectedBlock?.type?.startsWith('navbar-')) {
          return (
            <NavbarPanel
              block={selectedBlock}
              pages={pages}
              onUpdateBlock={handleUpdateBlock}
              currentPageId={currentPageId}
            />
          );
        }
        if (selectedBlock && !isBackgroundSelected) {
          return (
            <NavigationLinkPanel
              value={selectedBlock.props?.navigationLink}
              pages={pages}
              onChange={(link) => handleUpdateBlock(selectedBlock.id, { navigationLink: link })}
            />
          );
        }
        return (
          <div className="text-center py-8 text-gray-400 text-xs">
            <FiMenu size={24} className="mx-auto mb-2 text-gray-600" />
            Sélectionnez un élément ou une Navbar sur le canvas
          </div>
        );

      // ⭐ NOUVEAU : Panneau Animations
      case 'animations':
        return selectedBlock ? (
          <AnimationsPanel
            blockId={selectedBlock.id}
            blockType={selectedBlock.type}
            config={selectedBlock.props?.animationsConfig ?? null}
            onChange={(config) => {
              handleUpdateBlock(selectedBlock.id, { animationsConfig: config });
            }}
          />
        ) : (
          // ⭐ REMPLACER le message vide par les animations de PAGE
          <AnimationsPanel
            blockId="__page__"
            blockType="page"
            config={customization?.pageAnimationsConfig ?? null}
            onChange={(config) => {
              onUpdateCustomization({ pageAnimationsConfig: config });
            }}
            isPageMode
            pageId={currentPageId} // ⭐ AJOUT : passer l'ID de la page actuelle
          />
        );

      default:
        return null;
    }
  };

  const isPanelOpen = openPanel !== null;

  return (
    <>
      <div className="flex flex-shrink-0 h-full">

        {/* ── Colonne gauche : icônes ── */}
        <div className="w-14 flex flex-col items-center py-3 gap-1 bg-[#0d0e14] border-r border-[#1b1c26] h-full overflow-y-auto">
          {PANELS.map(panel => {
            const isActive = openPanel === panel.id;
            return (
              <button
                key={panel.id}
                onClick={() => handleIconClick(panel.id)}
                title={panel.label}
                className={`
                  relative w-10 h-10 flex flex-col items-center justify-center gap-0.5 rounded-xl
                  transition-all duration-200 group
                  ${isActive
                    ? 'bg-primary/20 text-primary shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : 'text-gray-500 hover:bg-[#1b1c26] hover:text-gray-200'
                  }
                `}
              >
                {/* Barre active à gauche */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-primary" />
                )}
                <panel.icon size={18} />
                <span className="text-[8px] font-medium leading-none">{panel.label.slice(0, 5)}</span>
              </button>
            );
          })}
        </div>

        {/* ── Colonne droite : contenu du panneau ── */}
        {isPanelOpen && (
          <div
            className="w-72 flex flex-col bg-[#11121a] border-r border-[#1b1c26] h-full animate-in slide-in-from-left-2 duration-200"
          >
            {/* Header du panneau */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1b1c26] flex-shrink-0">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                {PANELS.find(p => p.id === openPanel)?.label}
              </span>
              <button
                onClick={() => setOpenPanel(null)}
                className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-[#1b1c26]"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderPanelContent()}
            </div>
          </div>
        )}
      </div>

      {/* Panneau de personnalisation produit (overlay fixe) */}
      {selectedProductForCustomization && (
        <div className="fixed top-4 right-4 bottom-4 w-96 z-[100] flex flex-col rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl shadow-black/60 ring-1 ring-purple-500/20 overflow-hidden animate-in slide-in-from-right-8 fade-in duration-300">
          <button
            onClick={() => onCloseProductCustomization?.()}
            title="Fermer"
            className="absolute -top-3 -left-3 z-10 w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-red-500 border border-gray-600 hover:border-red-400 rounded-full text-gray-300 hover:text-white shadow-lg transition-colors"
          >
            <FiX size={15} />
          </button>
          <div className="flex-1 overflow-y-auto">
            <ProductCustomizationSidebar
              productId={selectedProductForCustomization.id}
              productName={selectedProductForCustomization.name}
              customization={selectedProductForCustomization.customization}
              slideCount={selectedProductForCustomization.slideCount}
              onUpdate={(updates) => {
                onUpdateProductCustomization?.(selectedProductForCustomization.id, updates);
              }}
              onClose={onCloseProductCustomization || (() => {})}
            />
          </div>
        </div>
      )}
    </>
  );
}