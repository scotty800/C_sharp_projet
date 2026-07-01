'use client';

import { useCallback, useMemo } from 'react';
import { StudioPage } from '@/types/studio';

/**
 * useProductNavigation
 * ─────────────────────────────────────────────────────────────────────────
 * Spécialisation produit → page produit. Délègue la navigation réelle
 * au moteur centralisé (navigateToPageId) pour garantir un comportement
 * identique (transition Navbar incluse) à tous les autres liens.
 */
export function useProductNavigation({
  pages,
  navigateToPageId,
}: {
  pages: StudioPage[];
  navigateToPageId: (pageId: string) => void;
}) {
  const productPageId = useMemo(() => {
    const map = new Map<number, string>();
    pages.forEach((page) => {
      if (page.linkedProductId != null) map.set(page.linkedProductId, page.id);
    });
    return map;
  }, [pages]);

  const navigateToProduct = useCallback(
    (productId: number) => {
      const pageId = productPageId.get(productId);
      if (pageId === undefined) return;
      navigateToPageId(pageId);
    },
    [productPageId, navigateToPageId]
  );

  const hasProductPage = useCallback(
    (productId: number) => productPageId.has(productId),
    [productPageId]
  );

  return { navigateToProduct, hasProductPage };
}