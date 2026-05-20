// hooks/useGroupManager.ts
import { useCallback, useRef } from 'react';

export interface BlockUI {
  id: string;
  type: string;
  props: any;
  position: any;
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

// ⭐ Padding autour des éléments du groupe (en pixels)
const GROUP_PADDING = 15;

export function useGroupManager({ blocks, setBlocks, refreshCanvas }: UseGroupManagerProps) {
  const isResizingRef = useRef(false);
  const currentResizeGroupIdRef = useRef<string | null>(null);

  const createGroup = useCallback((layerIds: string[]): string | null => {
    if (layerIds.length < 2) return null;
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setBlocks(blocks.map(b => layerIds.includes(b.id) ? { ...b, groupId } : b));
    refreshCanvas?.();
    return groupId;
  }, [blocks, setBlocks, refreshCanvas]);

  const ungroup = useCallback((groupId: string): boolean => {
    let changed = false;
    const updated = blocks.map(b => {
      if (b.groupId === groupId) {
        changed = true;
        const { groupId: _, ...rest } = b;
        return rest;
      }
      return b;
    });
    if (changed) { setBlocks(updated); refreshCanvas?.(); }
    return changed;
  }, [blocks, setBlocks, refreshCanvas]);

  // ⭐ Calcule les bounds avec padding
  const calculateBoundsFromMembers = useCallback((members: BlockUI[]) => {
    if (!members.length) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    members.forEach(m => {
      const x = m.position?.x || 0;
      const y = m.position?.y || 0;
      const w = m.position?.width || 100;
      const h = m.position?.height || 100;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });
    
    // ⭐ Ajouter le padding autour des éléments
    return { 
      x: minX - GROUP_PADDING, 
      y: minY - GROUP_PADDING, 
      width: (maxX - minX) + GROUP_PADDING * 2, 
      height: (maxY - minY) + GROUP_PADDING * 2 
    };
  }, []);

  const getGroupBounds = useCallback((groupId: string) => {
    return calculateBoundsFromMembers(blocks.filter(b => b.groupId === groupId));
  }, [blocks, calculateBoundsFromMembers]);

  const resizeGroup = useCallback((
    groupId: string,
    newBounds: { x: number; y: number; width: number; height: number }
  ) => {
    if (isResizingRef.current && currentResizeGroupIdRef.current !== groupId) return false;

    const members = blocks.filter(b => b.groupId === groupId);
    if (!members.length) return false;

    const old = calculateBoundsFromMembers(members);
    if (!old) return false;

    if (
      Math.abs(old.width  - newBounds.width)  < 0.5 &&
      Math.abs(old.height - newBounds.height) < 0.5 &&
      Math.abs(old.x      - newBounds.x)      < 0.5 &&
      Math.abs(old.y      - newBounds.y)      < 0.5
    ) return false;

    isResizingRef.current = true;
    currentResizeGroupIdRef.current = groupId;

    // ⭐ Ajuster les bounds internes en fonction du padding
    const innerOld = {
      x: old.x + GROUP_PADDING,
      y: old.y + GROUP_PADDING,
      width: old.width - GROUP_PADDING * 2,
      height: old.height - GROUP_PADDING * 2,
    };
    
    const innerNew = {
      x: newBounds.x + GROUP_PADDING,
      y: newBounds.y + GROUP_PADDING,
      width: newBounds.width - GROUP_PADDING * 2,
      height: newBounds.height - GROUP_PADDING * 2,
    };

    const scaleX = innerNew.width / innerOld.width;
    const scaleY = innerNew.height / innerOld.height;

    const updated = blocks.map(b => {
      if (b.groupId !== groupId) return b;

      // Position relative dans l'espace interne (sans padding)
      const relX = ((b.position.x || 0) - innerOld.x) / innerOld.width;
      const relY = ((b.position.y || 0) - innerOld.y) / innerOld.height;
      const relW = (b.position.width  || 100) / innerOld.width;
      const relH = (b.position.height || 100) / innerOld.height;

      const isBanner = ['banner', 'screen-banner', 'carousel-banner'].includes(b.type);
      const MIN = isBanner ? 40 : 20;

      const newX = Math.round(innerNew.x + relX * innerNew.width);
      const newY = Math.round(innerNew.y + relY * innerNew.height);
      const newW = Math.max(MIN, Math.round(relW * innerNew.width));
      const newH = b.position.height === 0 ? 0 : Math.max(MIN, Math.round(relH * innerNew.height));

      return { ...b, position: { ...b.position, x: newX, y: newY, width: newW, height: newH } };
    });

    setBlocks(updated);
    return true;
  }, [blocks, setBlocks, calculateBoundsFromMembers]);

  const endGroupResize = useCallback(() => {
    isResizingRef.current = false;
    currentResizeGroupIdRef.current = null;
  }, []);

  const moveGroup = useCallback((movedBlockId: string, deltaX: number, deltaY: number) => {
    const mover = blocks.find(b => b.id === movedBlockId);
    if (!mover?.groupId) return false;
    const gid = mover.groupId;
    const memberIds = new Set(blocks.filter(b => b.groupId === gid).map(b => b.id));

    setBlocks(blocks.map(b => {
      if (!memberIds.has(b.id)) return b;
      const newX = Math.round(Math.max(0, Math.min(1200 - (b.position.width  || 100), (b.position.x || 0) + deltaX)));
      const newY = Math.round(Math.max(0, Math.min(800  - (b.position.height || 100), (b.position.y || 0) + deltaY)));
      return { ...b, position: { ...b.position, x: newX, y: newY } };
    }));
    refreshCanvas?.();
    return true;
  }, [blocks, setBlocks, refreshCanvas]);

  const getGroupMembers  = useCallback((gid: string) => blocks.filter(b => b.groupId === gid), [blocks]);
  const isInGroup        = useCallback((id: string)   => !!blocks.find(b => b.id === id)?.groupId, [blocks]);
  const getGroupId       = useCallback((id: string)   => blocks.find(b => b.id === id)?.groupId ?? null, [blocks]);

  return { 
    createGroup, 
    ungroup, 
    moveGroup, 
    resizeGroup, 
    endGroupResize, 
    getGroupBounds, 
    getGroupMembers, 
    isInGroup, 
    getGroupId 
  };
}