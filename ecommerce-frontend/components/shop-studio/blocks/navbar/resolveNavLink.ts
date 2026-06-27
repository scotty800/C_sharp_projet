// components/shop-studio/blocks/navbar/resolveNavLink.ts
import { StudioPage, NavButton } from '@/types/studio';

export interface ResolvedLink {
  kind: 'page' | 'url' | 'none';
  pageId?: string;
  href?: string;
  isExternal: boolean;
  openInNewTab: boolean;
  isBroken: boolean;
}

/**
 * Le projet ne route pas par URL entre les pages de la boutique (navigation
 * par index en mémoire, cf. `goTo()` dans ShopPageRenderer). On résout donc un
 * lien "page" vers un `pageId` stable, pas vers un href — c'est à l'appelant
 * (NavButtonRenderer) de déclencher la navigation via `onNavigatePage(pageId)`.
 */
export function resolveNavLink(button: NavButton, pages: StudioPage[]): ResolvedLink {
  const link = button.link;
  if (!link || link.type === 'none') return { kind: 'none', isExternal: false, openInNewTab: false, isBroken: false };

  if (link.type === 'url') {
    return { kind: 'url', href: link.url, isExternal: true, openInNewTab: !!link.openInNewTab, isBroken: !link.url };
  }

  const page = pages.find(p => p.id === link.pageId);
  if (!page) return { kind: 'page', pageId: link.pageId, isExternal: false, openInNewTab: false, isBroken: true };

  return { kind: 'page', pageId: page.id, isExternal: false, openInNewTab: false, isBroken: false };
}