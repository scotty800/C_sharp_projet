import { useEffect } from 'react';
import { StudioPage } from '@/types/studio';

/**
 * - Renommage d'une page : RIEN À FAIRE (liaison par pageId stable).
 * - Suppression d'une page : neutralise tout lien (Navbar OU bloc générique)
 *   qui pointait vers cette page, pour éviter un lien mort silencieux.
 * - Duplication d'une page : les liens existants restent valides.
 */
export function useNavbarPageSync(
  pages: StudioPage[],
  setBlocks: (updater: (blocks: any[]) => any[]) => void,
) {
  useEffect(() => {
    const validPageIds = new Set(pages.map(p => p.id));

    setBlocks(prevBlocks => {
      let changed = false;
      const next = prevBlocks.map((block: any) => {
        let blockChanged = false;
        let updatedProps = block.props;

        // Cas 1 : boutons de Navbar
        const navConfig = block.props?.navConfig;
        if (block.type?.startsWith('navbar-') && navConfig) {
          const buttons = navConfig.buttons.map((btn: any) => {
            if (btn.link?.type === 'page' && !validPageIds.has(btn.link.pageId)) {
              blockChanged = true;
              return { ...btn, link: { type: 'none' } };
            }
            return btn;
          });
          if (blockChanged) {
            updatedProps = { ...updatedProps, navConfig: { ...navConfig, buttons } };
          }
        }

        // Cas 2 : ⭐ lien générique sur un bloc (bouton, image, forme, custom…)
        const navLink = block.props?.navigationLink;
        if (navLink?.type === 'page' && !validPageIds.has(navLink.pageId)) {
          blockChanged = true;
          updatedProps = { ...updatedProps, navigationLink: { type: 'none' } };
        }

        if (!blockChanged) return block;
        changed = true;
        return { ...block, props: updatedProps };
      });

      return changed ? next : prevBlocks;
    });
  }, [pages, setBlocks]);
}