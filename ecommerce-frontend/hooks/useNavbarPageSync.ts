// hooks/useNavbarPageSync.ts
import { useEffect } from 'react';
import { StudioPage } from '@/types/studio';

/**
 * - Renommage d'une page : RIEN À FAIRE, car on lie par `pageId` (stable), jamais par nom.
 *   Le `<select>` affiche toujours `pages.find(p => p.id === pageId)?.name`, donc le nouveau nom apparaît automatiquement.
 * - Suppression d'une page : ce hook détecte les boutons qui pointent vers un pageId qui n'existe plus
 *   et neutralise le lien (évite un lien mort silencieux).
 * - Duplication d'une page : un nouvel id est généré, les liens existants restent valides (ils pointent
 *   toujours vers la page source, ce qui est le comportement attendu).
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
        const navConfig = block.props?.navConfig;
        if (!block.type?.startsWith('navbar-') || !navConfig) return block;

        let blockChanged = false;
        const buttons = navConfig.buttons.map((btn: any) => {
          if (btn.link?.type === 'page' && !validPageIds.has(btn.link.pageId)) {
            blockChanged = true;
            return { ...btn, link: { type: 'none' } }; // ⭐ lien cassé neutralisé
          }
          return btn;
        });

        if (!blockChanged) return block;
        changed = true;
        return { ...block, props: { ...block.props, navConfig: { ...navConfig, buttons } } };
      });

      return changed ? next : prevBlocks;
    });
  }, [pages, setBlocks]);
}