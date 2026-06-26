import { BlockUI } from '@/types/studio';

export interface AbsoluteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Résout la position absolue (px) d'un bloc en remontant sa chaîne de parents. */
export function getAbsolutePosition(
  block: BlockUI,
  blocksById: Map<string, BlockUI>
): AbsoluteRect {
  let absX = block.position?.x ?? 0;
  let absY = block.position?.y ?? 0;
  let absW = block.position?.width ?? 100;
  let absH = block.position?.height ?? 100;

  let currentParentId = block.parentId ?? null;
  while (currentParentId) {
    const parent = blocksById.get(currentParentId);
    if (!parent) break;

    if (parent.position?.positionType === 'relative') {
      absX += parent.position?.x ?? 0;
      absY += parent.position?.y ?? 0;
    } else {
      const pW = parent.position?.width ?? 100;
      const pH = parent.position?.height ?? 100;
      absX = (parent.position?.x ?? 0) + (absX * pW) / 100;
      absY = (parent.position?.y ?? 0) + (absY * pH) / 100;
      absW = (absW * pW) / 100;
      absH = (absH * pH) / 100;
    }
    currentParentId = parent.parentId ?? null;
  }

  return { x: absX, y: absY, width: absW, height: absH };
}

/** Estime la hauteur de contenu nécessaire pour qu'aucun bloc en position absolue ne soit coupé. */
export function estimateContentHeight(
  blocks: BlockUI[],
  fallbackMinHeight: number,
  productBlockHeights?: Map<string, number>
): number {
  if (blocks.length === 0) return fallbackMinHeight;

  const blocksById = new Map(blocks.map(b => [b.id, b]));
  let maxBottom = 0;

  blocks.forEach(block => {
    if (block.type === 'group') return;
    const abs = getAbsolutePosition(block, blocksById);
    let bottom = abs.y + abs.height;

    if (block.type === 'products') {
      const measured = productBlockHeights?.get(block.id);
      if (measured) bottom = abs.y + measured;
    }
    if (bottom > maxBottom) maxBottom = bottom;
  });

  const padding = 80;
  return Math.max(fallbackMinHeight, Math.ceil((maxBottom + padding) / 10) * 10);
}