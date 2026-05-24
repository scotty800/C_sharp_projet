// hooks/useGroupManager.ts
import { useCallback, useRef } from 'react';

export interface BlockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  positionType?: 'absolute' | 'relative' | 'fixed';
}

export interface BlockUI {
  id: string;
  type: string;
  props: any;
  position: BlockPosition;
  order: number;
  isVisible: boolean;
  parentId?: string | null;
  isLocked?: boolean;
  groupId?: string | null;
}

interface UseGroupManagerProps {
  blocks: BlockUI[];
  setBlocks: (blocks: BlockUI[] | ((prev: BlockUI[]) => BlockUI[])) => void;
  refreshCanvas?: () => void;
}

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ⭐ Ajuste entre 8 et 16 selon ton goût
const INTERNAL_PADDING = 30;

// ───────────────────────────────────────────────────────────────
// ANTI-CYCLE : résolution des bounds absolues avec visited set
// ───────────────────────────────────────────────────────────────
function resolveAbsoluteBounds(
  block: BlockUI,
  list: BlockUI[],
  visited: Set<string> = new Set()
): Bounds {
  let x = block.position?.x ?? 0;
  let y = block.position?.y ?? 0;
  let w = block.position?.width ?? 100;
  let h = block.position?.height ?? 100;

  if (block.parentId) {
    if (visited.has(block.id)) {
      console.warn('⚠️ Cycle détecté dans resolveAbsoluteBounds pour', block.id);
      return { x, y, width: w, height: h };
    }
    visited.add(block.id);

    const parent = list.find(b => b.id === block.parentId);
    if (parent) {
      const p = resolveAbsoluteBounds(parent, list, visited);
      x = p.x + (x / 100) * p.width;
      y = p.y + (y / 100) * p.height;
      w = (w / 100) * p.width;
      h = h === 0 ? 0 : (h / 100) * p.height;
    }
  }

  return { x, y, width: w, height: h };
}

// ───────────────────────────────────────────────────────────────
// BOUNDING BOX D'UN GROUPE AVEC PADDING INTERNE
// ───────────────────────────────────────────────────────────────
function computeGroupBounds(groupId: string, list: BlockUI[]): Bounds | null {
  const members = list.filter(b => b.groupId === groupId);
  if (!members.length) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  members.forEach(b => {
    const abs = resolveAbsoluteBounds(b, list);
    if (abs.height === 0) return;
    minX = Math.min(minX, abs.x);
    minY = Math.min(minY, abs.y);
    maxX = Math.max(maxX, abs.x + abs.width);
    maxY = Math.max(maxY, abs.y + abs.height);
  });

  if (!isFinite(minX)) return null;

  // ⭐ AJOUT DU PADDING INTERNE
  return {
    x: minX - INTERNAL_PADDING,
    y: minY - INTERNAL_PADDING,
    width: (maxX - minX) + INTERNAL_PADDING * 2,
    height: (maxY - minY) + INTERNAL_PADDING * 2,
  };
}

// ───────────────────────────────────────────────────────────────
// MEMBRES RACINES DU GROUPE
// ───────────────────────────────────────────────────────────────
function getRootMembers(groupId: string, list: BlockUI[]): BlockUI[] {
  const memberIds = new Set(list.filter(b => b.groupId === groupId).map(b => b.id));
  return list.filter(
    b => b.groupId === groupId && (!b.parentId || !memberIds.has(b.parentId))
  );
}

// ───────────────────────────────────────────────────────────────
// SAFE COMMON PARENT : premier parentId hors de la sélection
// ───────────────────────────────────────────────────────────────
function getSafeCommonParent(members: BlockUI[], ids: Set<string>): string | null {
  for (const m of members) {
    if (m.parentId && !ids.has(m.parentId)) return m.parentId;
  }
  return null;
}

// ───────────────────────────────────────────────────────────────
// CONVERTIR position absolue → relative par rapport à un parent
// ───────────────────────────────────────────────────────────────
function absToRelPosition(abs: Bounds, parentAbs: Bounds, original: BlockPosition): BlockPosition {
  return {
    ...original,
    x: ((abs.x - parentAbs.x) / parentAbs.width) * 100,
    y: ((abs.y - parentAbs.y) / parentAbs.height) * 100,
    width: (abs.width / parentAbs.width) * 100,
    height: abs.height === 0 ? 0 : (abs.height / parentAbs.height) * 100,
    positionType: 'relative',
  };
}

// ───────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ───────────────────────────────────────────────────────────────
export function useGroupManager({ blocks, setBlocks, refreshCanvas }: UseGroupManagerProps) {
  const blocksRef = useRef<BlockUI[]>(blocks);
  blocksRef.current = blocks;

  const snapshotRef = useRef<{
    groupId: string;
    oldBounds: Bounds;
    members: Array<{
      id: string;
      relX: number;
      relY: number;
      relW: number;
      relH: number;
      originalPosition: BlockPosition;
    }>;
  } | null>(null);

  // ───────────────────────────────────────────────────────────────
  // CREATE GROUP
  // ───────────────────────────────────────────────────────────────
  const createGroup = useCallback((layerIds: string[]): string | null => {
    if (layerIds.length < 2) return null;

    const list = blocksRef.current;
    const members = list.filter(b => layerIds.includes(b.id));
    const ids = new Set(layerIds);

    // 1) Détecter si parent/enfant dans la sélection
    let mustFlatten = false;
    for (const m of members) {
      let current = m.parentId;
      while (current) {
        if (ids.has(current)) { mustFlatten = true; break; }
        const parent = list.find(b => b.id === current);
        current = parent?.parentId || null;
      }
      if (mustFlatten) break;
    }

    // 2) commonParent : JAMAIS un bloc dans la sélection
    const commonParent = mustFlatten
      ? getSafeCommonParent(members, ids)
      : (members[0]?.parentId || null);

    // 3) Pré-calculer les bounds absolues AVANT tout flatten
    //    pendant que les parentId sont encore valides
    const absoluteBoundsMap = new Map<string, Bounds>();
    if (mustFlatten) {
      for (const m of members) {
        absoluteBoundsMap.set(m.id, resolveAbsoluteBounds(m, list));
      }
    }

    // 4) Construire la liste aplatie localement avec positions corrigées
    const flattenedList = mustFlatten
      ? list.map(b => {
          if (!ids.has(b.id)) return b;
          const abs = absoluteBoundsMap.get(b.id)!;

          if (commonParent) {
            const parentBlock = list.find(p => p.id === commonParent);
            if (parentBlock) {
              const parentAbs = resolveAbsoluteBounds(parentBlock, list);
              return {
                ...b,
                parentId: commonParent,
                position: absToRelPosition(abs, parentAbs, b.position),
              };
            }
          }

          // Root → position absolue en px
          return {
            ...b,
            parentId: null,
            position: {
              ...b.position,
              x: abs.x,
              y: abs.y,
              width: abs.width,
              height: abs.height === 0 ? 0 : abs.height,
              positionType: 'absolute' as const,
            },
          };
        })
      : list;

    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 5) Liste avec groupId assigné (pour computeGroupBounds)
    const listWithGroupId = flattenedList.map(b =>
      ids.has(b.id) ? { ...b, groupId } : b
    );

    const parentId = commonParent;

    // 6) Groupe root → pas de bloc group intermédiaire
    if (!parentId) {
      setBlocks(prev =>
        prev.map(b => {
          if (!ids.has(b.id)) return b;
          const flattened = flattenedList.find(f => f.id === b.id)!;
          return { ...flattened, groupId };
        })
      );
      refreshCanvas?.();
      return groupId;
    }

    // 7) Calculer la bounding box sur la liste locale (pas le ref stale)
    const bounds = computeGroupBounds(groupId, listWithGroupId);
    const parent = listWithGroupId.find(b => b.id === parentId);

    if (!bounds || !parent) {
      setBlocks(prev =>
        prev.map(b => {
          if (!ids.has(b.id)) return b;
          const flattened = flattenedList.find(f => f.id === b.id)!;
          return { ...flattened, groupId };
        })
      );
      refreshCanvas?.();
      return groupId;
    }

    const parentAbs = resolveAbsoluteBounds(parent, listWithGroupId);
    const relX = ((bounds.x - parentAbs.x) / parentAbs.width) * 100;
    const relY = ((bounds.y - parentAbs.y) / parentAbs.height) * 100;
    const relW = (bounds.width / parentAbs.width) * 100;
    const relH = (bounds.height / parentAbs.height) * 100;

    const updatedMembers = listWithGroupId.filter(b => ids.has(b.id));

    // 8) Un seul setBlocks : flatten + positions corrigées + groupId + bloc group
    setBlocks(prev => [
      ...prev.map(b => {
        if (!ids.has(b.id)) return b;
        const flattened = flattenedList.find(f => f.id === b.id)!;
        return { ...flattened, groupId };
      }),
      {
        id: groupId,
        type: "group",
        props: {},
        parentId,
        groupId: null,
        isVisible: true,
        isLocked: false,
        order: updatedMembers[0]?.order ?? 0,
        position: {
          x: Math.max(0, Math.min(100 - relW, relX)),
          y: Math.max(0, Math.min(100 - relH, relY)),
          width: relW,
          height: relH,
          zIndex: 10,
          rotation: 0,
          positionType: "relative",
        },
      },
    ]);

    refreshCanvas?.();
    return groupId;
  }, [setBlocks, refreshCanvas]);

  // ───────────────────────────────────────────────────────────────
  // UNGROUP
  // ───────────────────────────────────────────────────────────────
  const ungroup = useCallback((groupId: string): boolean => {
    let changed = false;

    const updated = blocksRef.current.map(b => {
      if (b.groupId === groupId) {
        changed = true;
        const { groupId: _, ...rest } = b;
        return rest;
      }
      return b;
    });

    if (changed) {
      setBlocks(updated.filter(b => b.id !== groupId));
      refreshCanvas?.();
    }

    return changed;
  }, [setBlocks, refreshCanvas]);

  // ───────────────────────────────────────────────────────────────
  // ADD TO GROUP
  // ───────────────────────────────────────────────────────────────
  const addToGroup = useCallback((blockId: string, groupId: string): boolean => {
    const list = blocksRef.current;
    const block = list.find(b => b.id === blockId);
    if (!block) return false;

    const groupMembers = list.filter(b => b.groupId === groupId);
    const ids = new Set([blockId, ...groupMembers.map(m => m.id)]);

    // 1) Détecter parent/enfant
    let mustFlatten = false;
    for (const m of [...groupMembers, block]) {
      let current = m.parentId;
      while (current) {
        if (ids.has(current)) { mustFlatten = true; break; }
        const parent = list.find(b => b.id === current);
        current = parent?.parentId || null;
      }
      if (mustFlatten) break;
    }

    // 2) commonParent : JAMAIS dans la sélection
    const allMembers = [...groupMembers, block];
    const commonParent = mustFlatten
      ? getSafeCommonParent(allMembers, ids)
      : (groupMembers[0]?.parentId ?? block.parentId ?? null);

    // 3) Pré-calculer la position absolue du bloc AVANT flatten
    const blockAbs = resolveAbsoluteBounds(block, list);

    // 4) Liste locale aplatie avec positions corrigées
    const flattenedList = mustFlatten
      ? list.map(b => {
          if (!ids.has(b.id)) return b;
          const abs = resolveAbsoluteBounds(b, list);

          if (commonParent) {
            const parentBlock = list.find(p => p.id === commonParent);
            if (parentBlock) {
              const parentAbs = resolveAbsoluteBounds(parentBlock, list);
              return {
                ...b,
                parentId: commonParent,
                position: absToRelPosition(abs, parentAbs, b.position),
              };
            }
          }

          return {
            ...b,
            parentId: null,
            position: {
              ...b.position,
              x: abs.x,
              y: abs.y,
              width: abs.width,
              height: abs.height === 0 ? 0 : abs.height,
              positionType: 'absolute' as const,
            },
          };
        })
      : list;

    const parentId = commonParent;
    const parent = flattenedList.find(b => b.id === parentId);
    const parentAbs = parent ? resolveAbsoluteBounds(parent, flattenedList) : null;

    let relX = 0, relY = 0, relW = 0, relH = 0;

    if (parentAbs) {
      relX = ((blockAbs.x - parentAbs.x) / parentAbs.width) * 100;
      relY = ((blockAbs.y - parentAbs.y) / parentAbs.height) * 100;
      relW = (blockAbs.width / parentAbs.width) * 100;
      relH = (blockAbs.height / parentAbs.height) * 100;
    } else {
      // Groupe root → utiliser les bounds du groupe sur la liste locale
      const groupBounds = computeGroupBounds(groupId, flattenedList);
      if (groupBounds) {
        relX = ((blockAbs.x - groupBounds.x) / groupBounds.width) * 100;
        relY = ((blockAbs.y - groupBounds.y) / groupBounds.height) * 100;
        relW = (blockAbs.width / groupBounds.width) * 100;
        relH = (blockAbs.height / groupBounds.height) * 100;
      }
    }

    // 5) Un seul setBlocks
    setBlocks(prev =>
      prev.map(b => {
        // Membres existants du groupe à aplatir si besoin
        if (mustFlatten && ids.has(b.id) && b.id !== blockId) {
          const flattened = flattenedList.find(f => f.id === b.id);
          return flattened ?? b;
        }
        // Le bloc qu'on ajoute au groupe
        if (b.id === blockId) {
          return {
            ...b,
            groupId,
            parentId,
            position: {
              ...b.position,
              x: Math.max(0, Math.min(100 - relW, relX)),
              y: Math.max(0, Math.min(100 - relH, relY)),
              width: Math.max(5, Math.min(100, relW)),
              height: b.position.height === 0 ? 0 : Math.max(5, Math.min(100, relH)),
              positionType: "relative",
            },
          };
        }
        return b;
      })
    );

    refreshCanvas?.();
    return true;
  }, [setBlocks, refreshCanvas]);

  // ───────────────────────────────────────────────────────────────
  // GET GROUP BOUNDS
  // ───────────────────────────────────────────────────────────────
  const getGroupBounds = useCallback((groupId: string): Bounds | null => {
    return computeGroupBounds(groupId, blocksRef.current);
  }, []);

  // ───────────────────────────────────────────────────────────────
  // START RESIZE
  // ───────────────────────────────────────────────────────────────
  const startGroupResize = useCallback((groupId: string): void => {
    const list = blocksRef.current;
    const oldBounds = computeGroupBounds(groupId, list);
    if (!oldBounds) return;

    const roots = getRootMembers(groupId, list);

    const members = roots.map(b => {
      const abs = resolveAbsoluteBounds(b, list);
      return {
        id: b.id,
        relX: (abs.x - oldBounds.x) / oldBounds.width,
        relY: (abs.y - oldBounds.y) / oldBounds.height,
        relW: abs.width / oldBounds.width,
        relH: abs.height / oldBounds.height,
        originalPosition: { ...b.position },
      };
    });

    snapshotRef.current = { groupId, oldBounds, members };
  }, []);

  // ───────────────────────────────────────────────────────────────
  // RESIZE GROUP
  // ───────────────────────────────────────────────────────────────
  const resizeGroup = useCallback((groupId: string, newBounds: Bounds): boolean => {
    const snap = snapshotRef.current;
    if (!snap || snap.groupId !== groupId) return false;

    const list = blocksRef.current;

    setBlocks(prev =>
      prev.map(b => {
        const s = snap.members.find(m => m.id === b.id);
        if (!s) return b;

        const newAbsX = newBounds.x + s.relX * newBounds.width;
        const newAbsY = newBounds.y + s.relY * newBounds.height;
        const newAbsW = s.relW * newBounds.width;
        const newAbsH = s.relH * newBounds.height;

        if (b.parentId) {
          const parent = list.find(p => p.id === b.parentId);
          if (parent) {
            const parentAbs = resolveAbsoluteBounds(parent, list);
            const relX = ((newAbsX - parentAbs.x) / parentAbs.width) * 100;
            const relY = ((newAbsY - parentAbs.y) / parentAbs.height) * 100;
            const relW = (newAbsW / parentAbs.width) * 100;
            const relH = (newAbsH / parentAbs.height) * 100;

            return {
              ...b,
              position: {
                ...s.originalPosition,
                x: Math.max(0, Math.min(100 - relW, relX)),
                y: Math.max(0, Math.min(100 - relH, relY)),
                width: Math.max(1, Math.min(100, relW)),
                height: Math.max(1, Math.min(100, relH)),
              },
            };
          }
        }

        return {
          ...b,
          position: {
            ...s.originalPosition,
            x: Math.round(newAbsX),
            y: Math.round(newAbsY),
            width: Math.round(newAbsW),
            height: Math.round(newAbsH),
          },
        };
      })
    );

    return true;
  }, [setBlocks]);

  const endGroupResize = useCallback((): void => {
    snapshotRef.current = null;
  }, []);

  // ───────────────────────────────────────────────────────────────
  // MOVE GROUP
  // ───────────────────────────────────────────────────────────────
  const moveGroup = useCallback((
    movedBlockId: string,
    deltaX: number,
    deltaY: number
  ): boolean => {
    const list = blocksRef.current;
    const mover = list.find(b => b.id === movedBlockId);
    if (!mover?.groupId) return false;

    const rootIds = new Set(getRootMembers(mover.groupId, list).map(b => b.id));

    setBlocks(prev =>
      prev.map(b => {
        if (!rootIds.has(b.id)) return b;

        if (b.parentId) {
          const parent = list.find(p => p.id === b.parentId);
          if (parent) {
            const parentAbs = resolveAbsoluteBounds(parent, list);
            const dxPercent = (deltaX / parentAbs.width) * 100;
            const dyPercent = (deltaY / parentAbs.height) * 100;

            return {
              ...b,
              position: {
                ...b.position,
                x: Math.max(0, Math.min(100 - b.position.width, b.position.x + dxPercent)),
                y: Math.max(0, Math.min(100 - b.position.height, b.position.y + dyPercent)),
              },
            };
          }
        }

        return {
          ...b,
          position: {
            ...b.position,
            x: b.position.x + deltaX,
            y: b.position.y + deltaY,
          },
        };
      })
    );

    refreshCanvas?.();
    return true;
  }, [setBlocks, refreshCanvas]);

  // ───────────────────────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────────────────────
  const getGroupMembers = useCallback((gid: string): BlockUI[] =>
    blocksRef.current.filter(b => b.groupId === gid), []);

  const isInGroup = useCallback((id: string): boolean =>
    !!blocksRef.current.find(b => b.id === id)?.groupId, []);

  const getGroupId = useCallback((id: string): string | null =>
    blocksRef.current.find(b => b.id === id)?.groupId ?? null, []);

  return {
    createGroup,
    ungroup,
    addToGroup,
    moveGroup,
    startGroupResize,
    resizeGroup,
    endGroupResize,
    getGroupBounds,
    getGroupMembers,
    isInGroup,
    getGroupId,
  };
}