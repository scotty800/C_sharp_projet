import { useCallback, useEffect, useRef, useState } from 'react';
import { BlockUI } from '@/types/studio';

interface UseCanvasHeightOptions {
  blocks: BlockUI[];
  minHeight?: number;
  padding?: number;
}

/**
 * Calcule la hauteur nécessaire du canvas en mesurant la position réelle
 * du bord inférieur de chaque bloc, sans traitement spécial par type.
 */
export function useCanvasHeight({ blocks, minHeight, padding = 200 }: UseCanvasHeightOptions) {
  const fallbackMin = typeof window !== 'undefined' ? window.innerHeight : 800;
  const effectiveMin = minHeight ?? fallbackMin;

  // Map blockId → hauteur de contenu réelle mesurée (pour les blocs à hauteur auto)
  const measuredHeights = useRef<Map<string, number>>(new Map());

  const [canvasHeight, setCanvasHeight] = useState(effectiveMin);

  const compute = useCallback(() => {
    if (blocks.length === 0) return effectiveMin;

    // Index pour résolution rapide des parents
    const byId = new Map(blocks.map(b => [b.id, b]));

    const getAbsoluteBottom = (block: BlockUI): number => {
      // Remonter la chaîne de parents pour obtenir la position absolue
      let absY = block.position?.y ?? 0;
      let absH = block.position?.height ?? 0;
      let parentId = block.parentId ?? null;

      // Pour les blocs avec hauteur auto (products), utiliser la mesure réelle
      const measured = measuredHeights.current.get(block.id);
      if (measured != null && measured > 0) {
        absH = measured;
      }

      while (parentId) {
        const parent = byId.get(parentId);
        if (!parent) break;
        const parentY = parent.position?.y ?? 0;
        const parentH = parent.position?.height ?? 100;

        if (parent.position?.positionType === 'relative') {
          absY = parentY + absY;
        } else {
          absY = parentY + (absY * parentH) / 100;
          absH = (absH * parentH) / 100;
        }
        parentId = parent.parentId ?? null;
      }

      return absY + absH;
    };

    let maxBottom = 0;
    blocks.forEach(block => {
      if (block.type === 'group') return;
      const bottom = getAbsoluteBottom(block);
      if (bottom > maxBottom) maxBottom = bottom;
    });

    return Math.max(effectiveMin, maxBottom + padding);
  }, [blocks, effectiveMin, padding]);

  // Recalcul à chaque changement de blocs
  useEffect(() => {
    const next = compute();
    setCanvasHeight(prev => {
      // On accepte toujours la croissance, et la réduction seulement
      // si elle est significative (évite les oscillations)
      if (next > prev) return next;
      if (prev - next > 100) return next;
      return prev;
    });
  }, [compute]);

  // ⭐ Callback pour les blocs qui mesurent leur propre hauteur (Grid Product, etc.)
  // ⭐ MODIFICATION : Tolérance de 1px sur l'égalité
  const reportBlockHeight = useCallback((blockId: string, height: number) => {
    const prev = measuredHeights.current.get(blockId);
    // ⭐ Au lieu de prev === height, on utilise une tolérance de 1px
    if (prev != null && Math.abs(prev - height) < 1) return;
    measuredHeights.current.set(blockId, height);
    // Recalcul immédiat
    const next = compute();
    setCanvasHeight(cur => {
      if (next > cur) return next;
      if (cur - next > 100) return next;
      return cur;
    });
  }, [compute]);

  // Nettoyage quand un bloc est supprimé
  useEffect(() => {
    const blockIds = new Set(blocks.map(b => b.id));
    measuredHeights.current.forEach((_, id) => {
      if (!blockIds.has(id)) measuredHeights.current.delete(id);
    });
  }, [blocks]);

  return { canvasHeight, reportBlockHeight };
}