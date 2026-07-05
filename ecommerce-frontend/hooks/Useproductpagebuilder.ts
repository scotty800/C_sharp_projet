'use client';

import { useCallback, useState } from 'react';
import { StudioProduct } from '@/types/studio';
import { ProductPageConfig, generateProductPageBlocks } from '@/types/Productpage';

/**
 * Intègre la génération de page produit dans le système bloc/page du Studio.
 * Appeler `buildProductPage(config)` pour :
 *  1. Créer une nouvelle page canvas
 *  2. Injecter les blocs du template sur cette page
 *  3. Naviguer le studio vers cette nouvelle page
 *
 * ⭐ NOUVEAU : la page créée porte `linkedProductId = config.product.id`
 *    ce qui permet à la boutique publique de naviguer automatiquement vers
 *    cette page quand un visiteur clique sur ce produit.
 */
export function useProductPageBuilder({
  pages,
  blocks,
  setPages,
  setBlocks,
  setCurrentPageId,
  animateZoomAndCenterOnPage,
}: {
  pages: Array<{
    id: string;
    name: string;
    order: number;
    canvasX?: number;
    canvasY?: number;
    backgroundColor?: string;
    backgroundType?: string;
    backgroundValue?: string | null;
    backgroundOpacity?: number;
    linkedProductId?: number | null;
  }>;
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
        // ── Positionne la nouvelle page à droite de la dernière ──────────────
        const FRAME_WIDTH = 1200;
        const GAP = 160;
        const lastPage = [...pages].sort((a, b) => (b.canvasX ?? 0) - (a.canvasX ?? 0))[0];
        const nextX = (lastPage?.canvasX ?? 0) + FRAME_WIDTH + GAP;

        const newPageId = `product-page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        const TEMPLATE_LABELS: Record<string, string> = {
          classic: 'Classique',
          immersive: 'Immersif',
          gallery: 'Galerie',
          minimal: 'Minimal',
        };

        const newPage = {
          id: newPageId,
          name: `${config.product.name} — ${TEMPLATE_LABELS[config.template] ?? config.template}`,
          order: pages.length,
          canvasX: nextX,
          canvasY: 0,
          backgroundColor: config.backgroundColor,
          backgroundType: 'solid' as const,
          backgroundValue: null,
          backgroundOpacity: 100,
          // ⭐ Liaison produit → page (clé de toute la fonctionnalité)
          linkedProductId: config.product.id,

          // ⭐ NOUVEAU — snapshot de l'identité visuelle choisie pour cette page produit
        productPageStyle: {
            template: config.template,
            backgroundColor: config.backgroundColor,
            accentColor: config.accentColor,
            textColor: config.textColor,
            panelColor: config.panelColor,
          },
        };

        // ── Génère les blocs du template ─────────────────────────────────────
        const maxZIndex = blocks.reduce(
          (max, b) => Math.max(max, b.position?.zIndex ?? 0),
          0
        );
        const newBlocks = generateProductPageBlocks(config, newPageId, maxZIndex + 1);

        // ── Commit dans le state ─────────────────────────────────────────────
        setPages((prev) => [...prev, newPage]);
        setBlocks((prev) => [...prev, ...newBlocks]);
        setCurrentPageId(newPageId);

        // ── Animation après que le state se soit propagé ─────────────────────
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