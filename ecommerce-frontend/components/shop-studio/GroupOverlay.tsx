'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface GroupOverlayProps {
  groupId: string;
  bounds: { x: number; y: number; width: number; height: number };
  containerRef: React.RefObject<HTMLDivElement>;
  isSelected: boolean;
  onResize: (groupId: string, bounds: { x: number; y: number; width: number; height: number }) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

export function GroupOverlay({
  groupId,
  bounds,
  containerRef,
  isSelected,
  onResize,
  onResizeStart,
  onResizeEnd,
}: GroupOverlayProps) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeDirectionRef = useRef<string | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startBoundsRef = useRef(bounds);
  const rafIdRef = useRef<number | null>(null);
  const pendingBoundsRef = useRef(bounds);

  useEffect(() => {
    if (!isResizing) pendingBoundsRef.current = bounds;
  }, [bounds, isResizing]);

  if (!isSelected) return null;

  const getScale = (): number => {
    if (!containerRef.current) return 1;
    const rect = containerRef.current.getBoundingClientRect();
    return rect.width / (containerRef.current.offsetWidth || 1);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startBoundsRef.current = { ...bounds };
    pendingBoundsRef.current = { ...bounds };
    resizeDirectionRef.current = direction;
    setIsResizing(true);
    onResizeStart?.();
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeDirectionRef.current) return;
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const direction = resizeDirectionRef.current!;
      const scale = getScale();
      const dx = (e.clientX - startPosRef.current.x) / scale;
      const dy = (e.clientY - startPosRef.current.y) / scale;

      let nb = { ...startBoundsRef.current };
      const MIN = 50;

      switch (direction) {
        case 'nw': nb.x += dx; nb.y += dy; nb.width -= dx; nb.height -= dy; break;
        case 'ne': nb.y += dy; nb.width += dx; nb.height -= dy; break;
        case 'sw': nb.x += dx; nb.width -= dx; nb.height += dy; break;
        case 'se': nb.width += dx; nb.height += dy; break;
        case 'n':  nb.y += dy; nb.height -= dy; break;
        case 's':  nb.height += dy; break;
        case 'w':  nb.x += dx; nb.width -= dx; break;
        case 'e':  nb.width += dx; break;
      }

      if (nb.width < MIN) {
        nb.width = MIN;
        if (direction.includes('w')) nb.x = startBoundsRef.current.x + startBoundsRef.current.width - MIN;
      }
      if (nb.height < MIN) {
        nb.height = MIN;
        if (direction.includes('n')) nb.y = startBoundsRef.current.y + startBoundsRef.current.height - MIN;
      }

      nb.x = Math.round(nb.x); nb.y = Math.round(nb.y);
      nb.width = Math.round(nb.width); nb.height = Math.round(nb.height);

      pendingBoundsRef.current = nb;
      onResize(groupId, nb);
    });
  }, [groupId, onResize]);

  const handleResizeEnd = useCallback(() => {
    if (rafIdRef.current !== null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }
    resizeDirectionRef.current = null;
    setIsResizing(false);
    onResizeEnd?.();
  }, [onResizeEnd]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const b = isResizing ? pendingBoundsRef.current : bounds;

  // ─── Tout en position: absolute dans le même repère que le cadre ──────────
  // Le cadre est déjà parfaitement positionné (position: absolute dans le canvas).
  // Les poignées utilisent le même repère : position absolue par rapport au
  // coin haut-gauche du cadre. Pas de calcul fixed, pas de conversion écran.
  //
  // Chaque poignée est positionnée relativement au coin haut-gauche du cadre
  // (b.x, b.y), donc ses coords sont relatives à ce coin : ex. coin SE = (b.width, b.height).

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: b.x,
    top: b.y,
    width: b.width,
    height: b.height,
    pointerEvents: 'none',
    zIndex: 9999,
  };

  const frameStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    border: '2px dashed #8B5CF6',
    borderRadius: '4px',
    pointerEvents: 'none',
  };

  // Position d'une poignée exprimée en % ou px relatifs au wrapper
  const handle = (left: number | string, top: number | string, cursor: string): React.CSSProperties => ({
    position: 'absolute',
    left: typeof left === 'number' ? left - 6 : `calc(${left} - 6px)`,
    top:  typeof top  === 'number' ? top  - 6 : `calc(${top}  - 6px)`,
    width: 12,
    height: 12,
    backgroundColor: '#8B5CF6',
    border: '2px solid white',
    borderRadius: '50%',
    cursor,
    zIndex: 10000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    pointerEvents: 'auto',
    touchAction: 'none',
  });

  return (
    <div style={wrapperStyle}>
      <div style={frameStyle} />

      {/* Coins */}
      <div style={handle(0,       0,        'nw-resize')} onMouseDown={e => handleResizeStart(e, 'nw')} />
      <div style={handle(b.width, 0,        'ne-resize')} onMouseDown={e => handleResizeStart(e, 'ne')} />
      <div style={handle(0,       b.height, 'sw-resize')} onMouseDown={e => handleResizeStart(e, 'sw')} />
      <div style={handle(b.width, b.height, 'se-resize')} onMouseDown={e => handleResizeStart(e, 'se')} />

      {/* Milieux */}
      <div style={handle(b.width / 2, 0,           'n-resize')} onMouseDown={e => handleResizeStart(e, 'n')} />
      <div style={handle(b.width / 2, b.height,    's-resize')} onMouseDown={e => handleResizeStart(e, 's')} />
      <div style={handle(0,           b.height / 2, 'w-resize')} onMouseDown={e => handleResizeStart(e, 'w')} />
      <div style={handle(b.width,     b.height / 2, 'e-resize')} onMouseDown={e => handleResizeStart(e, 'e')} />
    </div>
  );
}