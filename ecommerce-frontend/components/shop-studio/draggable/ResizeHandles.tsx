'use client';

interface Props {
  onResizeStart: (direction: string, e: React.MouseEvent) => void;
  size?: number;
}

export default function ResizeHandles({ onResizeStart, size = 8 }: Props) {
  const handleClasses = "absolute bg-primary rounded-full hover:scale-110 transition-transform cursor-pointer";
  
  return (
    <>
      {/* Top */}
      <div
        className={`${handleClasses} -top-1 left-1/2 -translate-x-1/2`}
        style={{ width: size, height: size }}
        onMouseDown={(e) => onResizeStart('n', e)}
      />
      {/* Bottom */}
      <div
        className={`${handleClasses} -bottom-1 left-1/2 -translate-x-1/2`}
        style={{ width: size, height: size }}
        onMouseDown={(e) => onResizeStart('s', e)}
      />
      {/* Left */}
      <div
        className={`${handleClasses} top-1/2 -left-1 -translate-y-1/2`}
        style={{ width: size, height: size }}
        onMouseDown={(e) => onResizeStart('w', e)}
      />
      {/* Right */}
      <div
        className={`${handleClasses} top-1/2 -right-1 -translate-y-1/2`}
        style={{ width: size, height: size }}
        onMouseDown={(e) => onResizeStart('e', e)}
      />
      {/* Top-Left */}
      <div
        className={`${handleClasses} -top-1 -left-1`}
        style={{ width: size, height: size }}
        onMouseDown={(e) => onResizeStart('nw', e)}
      />
      {/* Top-Right */}
      <div
        className={`${handleClasses} -top-1 -right-1`}
        style={{ width: size, height: size }}
        onMouseDown={(e) => onResizeStart('ne', e)}
      />
      {/* Bottom-Left */}
      <div
        className={`${handleClasses} -bottom-1 -left-1`}
        style={{ width: size, height: size }}
        onMouseDown={(e) => onResizeStart('sw', e)}
      />
      {/* Bottom-Right */}
      <div
        className={`${handleClasses} -bottom-1 -right-1`}
        style={{ width: size, height: size }}
        onMouseDown={(e) => onResizeStart('se', e)}
      />
    </>
  );
}