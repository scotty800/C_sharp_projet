'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ShopCanvas from './ShopCanvas';
import { GoogleFontsLoader } from './GoogleFontsLoader';
import NavbarBlockRenderer from './blocks/navbar/NavbarBlockRenderer';
import { ShopRenderData } from '@/services/api/shopRender';
import { getCustomizationForPage } from '@/components/shop-studio/lib/pagesMeta';
import { StudioProduct, StudioPage } from '@/types/studio';
import { useBlockAnimation, usePageTransition } from '@/hooks/useBlockAnimation';
import { usePageNavigationEngine } from '@/hooks/usePageNavigationEngine';
import { useProductNavigation } from '@/hooks/useProductNavigation';
import type { BlockAnimationsConfig, PageTransitionConfig } from '@/types/animations';

const STUDIO_FRAME_WIDTH = 1200;

export default function ShopPageRenderer({
  data,
  onAddToCart,
}: {
  data: ShopRenderData;
  // ⭐ MODIFICATION — onAddToCart avec variante optionnelle
  onAddToCart?: (product: StudioProduct, variant?: { size?: string; color?: string }) => void;
}) {
  const sortedPages = [...data.pages].sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPage = sortedPages[currentIndex];

  const pageContainerRef = useRef<HTMLDivElement>(null);

  // ── Config de transition (lue depuis la navbar globale) ───────────────────
  const navbarWithTransition = data.globalBlocks.find(
    (b) => b.props?.navConfig?.pageTransition && b.props.navConfig.pageTransition.type !== 'none'
  );
  const pageTransitionConfig: PageTransitionConfig | null =
    navbarWithTransition?.props?.navConfig?.pageTransition ?? null;

  const { transitionToPage } = usePageTransition({
    containerRef: pageContainerRef,
    config: pageTransitionConfig,
    context: 'shop',
  });

  // ── goTo stable (ref pour éviter les closures stale) ─────────────────────
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const goTo = useCallback(
    (idx: number) => {
      const targetIdx = Math.max(0, Math.min(idx, sortedPages.length - 1));
      if (targetIdx === currentIndexRef.current) return;

      transitionToPage(() => {
        setCurrentIndex(targetIdx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },
    [sortedPages.length, transitionToPage]
  );

  // ── ⭐ Navigation engine centralisé ────────────────────────────────────────
  const { navigateToPageId, resolveNavLink, isLinkActive } = usePageNavigationEngine({
    pages: sortedPages,
    goTo,
  });

  // ── ⭐ Navigation produit → page produit ──────────────────────────────────
  const { navigateToProduct, hasProductPage } = useProductNavigation({
    pages: sortedPages,
    navigateToPageId,
  });

  if (!currentPage) return null;

  const customization = getCustomizationForPage(data.pages, currentPage.id, data.customization);
  const hasGlobalNavbar = data.globalBlocks.length > 0;

  // ⭐ AJOUT — Produit lié à la page courante (page générée depuis un template produit)
  const pageProduct =
    currentPage.linkedProductId != null
      ? data.productsList.find((p) => p.id === currentPage.linkedProductId) ?? null
      : null;

  console.log('🔍 DEBUG pageProduct:', {
    linkedProductId: currentPage.linkedProductId,
    pageProduct,
    productsListIds: data.productsList.map(p => p.id),
  });

  return (
    <div className="w-full min-h-screen flex flex-col">
      <GoogleFontsLoader fonts={data.usedFonts} />

      {/* Navbar persistante sur toutes les pages */}
      {hasGlobalNavbar &&
        data.globalBlocks.map((block) => (
          <NavbarBlockRenderer
            key={block.id}
            mode="shop"
            navConfig={block.props?.navConfig}
            pages={sortedPages}
            currentPageId={currentPage.id}
            onNavigatePage={navigateToPageId}
          />
        ))}

      {/* Fallback : onglets simples si aucune Navbar custom */}
      {!hasGlobalNavbar && sortedPages.length > 1 && (
        <PageNavBar
          pages={sortedPages}
          currentIndex={currentIndex}
          onSelect={goTo}
          customization={customization}
        />
      )}

      {/* Conteneur stable pour les transitions GSAP */}
      <div ref={pageContainerRef} className="flex-1" style={{ position: 'relative' }}>
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
          pageAnimationsConfig={data.customization?.pageAnimationsConfig ?? null}
          // ⭐ Navigation produit propagée vers ShopCanvas → ShopProductGrid
          onNavigateToProduct={navigateToProduct}
          hasProductPage={hasProductPage}
          onNavigateLink={resolveNavLink}
          isNavLinkActive={isLinkActive}
          pageProduct={pageProduct} // ⭐ AJOUT
        />
      </div>

      {/* Navigation bas de page */}
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
// Barre de navigation en haut (fallback sans Navbar custom)
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
        <ul className="flex items-center gap-1 overflow-x-auto py-0" style={{ scrollbarWidth: 'none' }}>
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
// Navigation bas de page
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
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
  pageAnimationsConfig,
  onNavigateToProduct,
  hasProductPage,
  onNavigateLink,
  isNavLinkActive,
  pageProduct, // ⭐ AJOUT
}: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(STUDIO_FRAME_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const { setRef } = useBlockAnimation({
    blockId: `page-${page.id}`,
    config: pageAnimationsConfig ?? null,
    context: 'shop',
    studioMode: false,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setFrameWidth(w);
    });
    ro.observe(containerRef.current);
    setFrameWidth(containerRef.current.clientWidth || STUDIO_FRAME_WIDTH);
    return () => ro.disconnect();
  }, []);

  const backgroundStyle = buildBackgroundStyle(customization);

  const combinedRef = useCallback(
    (element: HTMLElement | null) => {
      setRef(element);
      // @ts-ignore
      containerRef.current = element;
    },
    [setRef]
  );

  return (
    <section
      ref={combinedRef}
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
        // ⭐ Propagation vers ShopCanvas
        onNavigateToProduct={onNavigateToProduct}
        hasProductPage={hasProductPage}
        onNavigateLink={onNavigateLink}
        isNavLinkActive={isNavLinkActive}
        pageProduct={pageProduct} // ⭐ AJOUT
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