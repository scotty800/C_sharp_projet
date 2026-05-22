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

// ───────────────────────────────────────────────────────────────
// POSITION ABSOLUE (px) D’UN BLOC
// ───────────────────────────────────────────────────────────────
function resolveAbsoluteBounds(block: BlockUI, list: BlockUI[]): Bounds {
  let x = block.position?.x ?? 0;
  let y = block.position?.y ?? 0;
  let w = block.position?.width ?? 100;
  let h = block.position?.height ?? 100;

  if (block.parentId) {
    const parent = list.find(b => b.id === block.parentId);
    if (parent) {
      const p = resolveAbsoluteBounds(parent, list);
      x = p.x + (x / 100) * p.width;
      y = p.y + (y / 100) * p.height;
      w = (w / 100) * p.width;
      h = h === 0 ? 0 : (h / 100) * p.height;
    }
  }

  return { x, y, width: w, height: h };
}

// ───────────────────────────────────────────────────────────────
// BOUNDING BOX D’UN GROUPE
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
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
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

    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 1) Assigner groupId aux membres
    setBlocks(prev =>
      prev.map(b => (layerIds.includes(b.id) ? { ...b, groupId } : b))
    );

    const list = blocksRef.current;
    const members = list.filter(b => layerIds.includes(b.id));

    // 2) Détecter parent commun
    const parentIds = [...new Set(members.map(m => m.parentId || null))];
    const parentId = parentIds.length === 1 ? parentIds[0] : null;

    // 3) Groupe root → rien à faire
    if (!parentId) {
      refreshCanvas?.();
      return groupId;
    }

    const parent = list.find(b => b.id === parentId);
    if (!parent) return groupId;

    const parentAbs = resolveAbsoluteBounds(parent, list);
    const bounds = computeGroupBounds(groupId, list);
    if (!bounds) return groupId;

    // 4) Conversion en %
    const relX = ((bounds.x - parentAbs.x) / parentAbs.width) * 100;
    const relY = ((bounds.y - parentAbs.y) / parentAbs.height) * 100;
    const relW = (bounds.width / parentAbs.width) * 100;
    const relH = (bounds.height / parentAbs.height) * 100;

    // 5) Clamp
    const clampedX = Math.max(0, Math.min(100 - relW, relX));
    const clampedY = Math.max(0, Math.min(100 - relH, relY));

    // 6) Ajouter le bloc groupe
    setBlocks(prev => [
      ...prev,
      {
        id: groupId,
        type: "group",
        props: {},
        parentId,
        groupId: null,
        isVisible: true,
        isLocked: false,
        order: members[0]?.order ?? 0,
        position: {
          x: clampedX,
          y: clampedY,
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
  // RESIZE GROUP (PATCH CLAMP)
  // ───────────────────────────────────────────────────────────────
  const resizeGroup = useCallback((
    groupId: string,
    newBounds: Bounds
  ): boolean => {
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
  // MOVE GROUP (PATCH CLAMP)
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

            const newX = b.position.x + dxPercent;
            const newY = b.position.y + dyPercent;

            return {
              ...b,
              position: {
                ...b.position,
                x: Math.max(0, Math.min(100 - b.position.width, newX)),
                y: Math.max(0, Math.min(100 - b.position.height, newY)),
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
