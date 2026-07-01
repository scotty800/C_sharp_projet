'use client';

import { useCallback, useMemo } from 'react';
import { StudioPage, NavLinkTarget } from '@/types/studio';

/**
 * usePageNavigationEngine
 * ─────────────────────────────────────────────────────────────────────────
 * Moteur de navigation UNIQUE pour toute la Boutique.
 * Tout élément interactif (bouton Navbar, bloc lié, produit → page produit)
 * doit passer par ce moteur pour changer de page.
 */
export function usePageNavigationEngine({
  pages,
  goTo,
}: {
  pages: StudioPage[];
  goTo: (index: number) => void;
}) {
  const pageIndexById = useMemo(() => {
    const map = new Map<string, number>();
    pages.forEach((p, idx) => map.set(p.id, idx));
    return map;
  }, [pages]);

  const navigateToPageId = useCallback(
    (pageId: string) => {
      const idx = pageIndexById.get(pageId);
      if (idx === undefined) return;
      goTo(idx);
    },
    [pageIndexById, goTo]
  );

  const resolveNavLink = useCallback(
    (link: NavLinkTarget | null | undefined) => {
      if (!link || link.type === 'none') return;
      if (link.type === 'page') {
        navigateToPageId(link.pageId);
        return;
      }
      if (link.type === 'url' && link.url) {
        if (link.openInNewTab) window.open(link.url, '_blank', 'noopener,noreferrer');
        else window.location.href = link.url;
      }
    },
    [navigateToPageId]
  );

  const isLinkActive = useCallback(
    (link: NavLinkTarget | null | undefined) => {
      if (!link) return false;
      if (link.type === 'page') return !!link.pageId && pageIndexById.has(link.pageId);
      if (link.type === 'url') return !!link.url;
      return false;
    },
    [pageIndexById]
  );

  return { navigateToPageId, resolveNavLink, isLinkActive };
}