'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ShopCanvas from './ShopCanvas';
import { GoogleFontsLoader } from './GoogleFontsLoader';
import NavbarBlockRenderer from './blocks/navbar/NavbarBlockRenderer'; // ⭐ AJOUT
import { ShopRenderData } from '@/services/api/shopRender';
import { getCustomizationForPage } from '@/components/shop-studio/lib/pagesMeta';
import { StudioProduct, StudioPage } from '@/types/studio';

const STUDIO_FRAME_WIDTH = 1200;

export default function ShopPageRenderer({
  data,
  onAddToCart,
}: {
  data: ShopRenderData;
  onAddToCart?: (product: StudioProduct) => void;
}) {
  const sortedPages = [...data.pages].sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPage = sortedPages[currentIndex];

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(Math.max(0, Math.min(idx, sortedPages.length - 1)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sortedPages.length]);

  // ⭐ AJOUT — un clic sur un bouton de Navbar lié à une page résout vers
  // l'index correspondant, la navigation se faisant en mémoire (pas d'URL par page).
  const navigateToPageId = useCallback((pageId: string) => {
    const idx = sortedPages.findIndex(p => p.id === pageId);
    if (idx !== -1) goTo(idx);
  }, [sortedPages, goTo]);

  if (!currentPage) return null;

  const customization = getCustomizationForPage(data.pages, currentPage.id, data.customization);
  const hasGlobalNavbar = data.globalBlocks.length > 0;

  return (
    <div className="w-full min-h-screen flex flex-col">
      <GoogleFontsLoader fonts={data.usedFonts} />

      {/* ── Navigation globale (Navbar du Studio) — persistante sur toutes les pages ── */}
      {hasGlobalNavbar &&
        data.globalBlocks.map(block => (
          <NavbarBlockRenderer
            key={block.id}
            mode="shop"
            navConfig={block.props?.navConfig}
            pages={sortedPages}
            currentPageId={currentPage.id}
            onNavigatePage={navigateToPageId}
          />
        ))}

      {/* ── Fallback : onglets simples si aucune Navbar n'a été configurée ── */}
      {!hasGlobalNavbar && sortedPages.length > 1 && (
        <PageNavBar
          pages={sortedPages}
          currentIndex={currentIndex}
          onSelect={goTo}
          customization={customization}
        />
      )}

      {/* ── Page active ── */}
      <div className="flex-1">
        <PageSection
          key={currentPage.id}
          page={currentPage}
          blocks={data.blocksByPage.get(currentPage.id) || []}
          shop={data.shop}
          customization={customization}
          canvasFilters={data.canvasFilters}
          productsList={data.productsList}
          globalProductCustomizations={data.globalProductCustomizations}
          onAddToCart={onAddToCart}
        />
      </div>

      {/* ── Navigation bas de page (Précédent / Suivant) ── */}
      {sortedPages.length > 1 && (
        <PageFooterNav
          currentIndex={currentIndex}
          total={sortedPages.length}
          pages={sortedPages}
          onGo={goTo}
          customization={customization}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Barre de navigation en haut (onglets) — fallback si aucune Navbar custom
// ─────────────────────────────────────────────────────────────────────────────

function PageNavBar({
  pages,
  currentIndex,
  onSelect,
  customization,
}: {
  pages: StudioPage[];
  currentIndex: number;
  onSelect: (idx: number) => void;
  customization: any;
}) {
  const primaryColor = customization?.primaryColor || '#2563EB';

  return (
    <nav
      className="w-full sticky top-0 z-50 shadow-sm"
      style={{ backgroundColor: '#ffffff', borderBottom: `2px solid ${primaryColor}20` }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0" style={{ scrollbarWidth: 'none' }}>
          {pages.map((page, idx) => {
            const isActive = idx === currentIndex;
            return (
              <li key={page.id} className="flex-shrink-0">
                <button
                  onClick={() => onSelect(idx)}
                  className="relative px-5 py-4 text-sm font-medium transition-colors duration-200 whitespace-nowrap outline-none"
                  style={{
                    color: isActive ? primaryColor : '#6B7280',
                    borderBottom: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                    marginBottom: '-2px',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {page.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation bas de page (Précédent / Suivant + dots)
// ─────────────────────────────────────────────────────────────────────────────

function PageFooterNav({
  currentIndex,
  total,
  pages,
  onGo,
  customization,
}: {
  currentIndex: number;
  total: number;
  pages: StudioPage[];
  onGo: (idx: number) => void;
  customization: any;
}) {
  const primaryColor = customization?.primaryColor || '#2563EB';
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  return (
    <div
      className="w-full py-6 px-4 flex items-center justify-between gap-4"
      style={{ borderTop: `1px solid ${primaryColor}15`, backgroundColor: '#fafafa' }}
    >
      <button
        onClick={() => hasPrev && onGo(currentIndex - 1)}
        disabled={!hasPrev}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        style={{
          backgroundColor: hasPrev ? primaryColor : '#E5E7EB',
          color: hasPrev ? '#ffffff' : '#9CA3AF',
          cursor: hasPrev ? 'pointer' : 'not-allowed',
          opacity: hasPrev ? 1 : 0.5,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {hasPrev ? pages[currentIndex - 1].name : 'Précédent'}
      </button>

      <div className="flex items-center gap-2">
        {pages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onGo(idx)}
            className="rounded-full transition-all duration-200"
            style={{
              width: idx === currentIndex ? 24 : 8,
              height: 8,
              backgroundColor: idx === currentIndex ? primaryColor : `${primaryColor}40`,
              cursor: 'pointer',
            }}
            aria-label={`Page ${idx + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => hasNext && onGo(currentIndex + 1)}
        disabled={!hasNext}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        style={{
          backgroundColor: hasNext ? primaryColor : '#E5E7EB',
          color: hasNext ? '#ffffff' : '#9CA3AF',
          cursor: hasNext ? 'pointer' : 'not-allowed',
          opacity: hasNext ? 1 : 0.5,
        }}
      >
        {hasNext ? pages[currentIndex + 1].name : 'Suivant'}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section d'une page
// ─────────────────────────────────────────────────────────────────────────────

function PageSection({
  page,
  blocks,
  shop,
  customization,
  canvasFilters,
  productsList,
  globalProductCustomizations,
  onAddToCart,
}: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(STUDIO_FRAME_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 0) setFrameWidth(w);
    });
    ro.observe(containerRef.current);
    setFrameWidth(containerRef.current.clientWidth || STUDIO_FRAME_WIDTH);
    return () => ro.disconnect();
  }, []);

  const backgroundStyle = buildBackgroundStyle(customization);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-x-hidden"
      style={{
        ...backgroundStyle,
        filter: canvasFilters?.globalCssFilter || 'none',
        minHeight: canvasHeight > 0 ? canvasHeight : undefined,
      }}
    >
      <ShopCanvas
        shop={shop}
        customization={customization}
        blocks={blocks}
        productsList={productsList}
        globalProductCustomizations={globalProductCustomizations}
        frameWidth={frameWidth}
        onHeightChange={setCanvasHeight}
        onAddToCart={onAddToCart}
      />
    </section>
  );
}

function buildBackgroundStyle(customization: any): React.CSSProperties {
  if (!customization) return {};
  if (customization.backgroundType === 'gradient' && customization.backgroundValue) {
    return { background: customization.backgroundValue };
  }
  if (customization.backgroundImage) {
    return {
      backgroundImage: `url(${customization.backgroundImage})`,
      backgroundSize: customization.backgroundSize || 'cover',
      backgroundPosition: customization.backgroundPosition || 'center',
      backgroundRepeat: 'no-repeat',
    };
  }
  return { backgroundColor: customization.backgroundColor || '#ffffff' };
}