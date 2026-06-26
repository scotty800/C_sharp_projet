'use client';

import { useCallback, useState } from 'react';
import { StudioProduct } from '@/types/studio';
import { ProductPageConfig, generateProductPageBlocks } from '@/types/Productpage';
import { DEFAULT_PAGE_ID } from '@/components/shop-studio/StudioLayout';

/**
 * Integrates product page generation into the Studio's block/page system.
 * Call `buildProductPage(config)` to:
 *  1. Create a new canvas page
 *  2. Inject the template blocks onto it
 *  3. Navigate the studio to that new page
 */
export function useProductPageBuilder({
  pages,
  blocks,
  setPages,
  setBlocks,
  setCurrentPageId,
  animateZoomAndCenterOnPage,
}: {
  pages: Array<{ id: string; name: string; order: number; canvasX?: number; canvasY?: number; backgroundColor?: string; backgroundType?: string; backgroundValue?: string | null; backgroundOpacity?: number }>;
  blocks: any[];
  setPages: (updater: (prev: any[]) => any[]) => void;
  setBlocks: (updater: (prev: any[]) => any[]) => void;
  setCurrentPageId: (id: string) => void;
  animateZoomAndCenterOnPage: (pageId: string, zoom: number, duration?: number) => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const buildProductPage = useCallback(
    async (config: ProductPageConfig) => {
      if (!config.product) return;
      setIsGenerating(true);

      try {
        // Position the new page to the right of the last page
        const FRAME_WIDTH = 1200;
        const GAP = 160;
        const lastPage = [...pages].sort((a, b) => (b.canvasX ?? 0) - (a.canvasX ?? 0))[0];
        const nextX = (lastPage?.canvasX ?? 0) + FRAME_WIDTH + GAP;

        const newPageId = `product-page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        const templateDef = { classic: 'Classique', immersive: 'Immersif', gallery: 'Galerie', minimal: 'Minimal' };

        const newPage = {
          id: newPageId,
          name: `${config.product.name} — ${templateDef[config.template]}`,
          order: pages.length,
          canvasX: nextX,
          canvasY: 0,
          backgroundColor: config.backgroundColor,
          backgroundType: 'solid' as const,
          backgroundValue: null,
          backgroundOpacity: 100,
        };

        // Generate the blocks for this template
        const maxZIndex = blocks.reduce((max, b) => Math.max(max, b.position?.zIndex ?? 0), 0);
        const newBlocks = generateProductPageBlocks(config, newPageId, maxZIndex + 1);

        // Commit everything to state
        setPages(prev => [...prev, newPage]);
        setBlocks(prev => [...prev, ...newBlocks]);
        setCurrentPageId(newPageId);

        // Animate zoom to new page after state settles
        setTimeout(() => {
          animateZoomAndCenterOnPage(newPageId, 65, 900);
        }, 80);

      } finally {
        setIsGenerating(false);
      }
    },
    [pages, blocks, setPages, setBlocks, setCurrentPageId, animateZoomAndCenterOnPage]
  );

  return { buildProductPage, isGenerating };
}