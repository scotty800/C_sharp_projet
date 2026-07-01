// components/shop-studio/lib/frameShapes.ts

export interface FrameShapeDef {
  label: string;
  clipPath: string;
  borderRadius: number | string;
}

export const FRAME_SHAPES: Record<string, FrameShapeDef> = {
  square: {
    label: 'Carré',
    clipPath: 'none',
    borderRadius: 8,
  },
  circle: {
    label: 'Cercle',
    clipPath: 'circle(50% at 50% 50%)',
    borderRadius: 0,
  },
  rounded: {
    label: 'Arrondi',
    clipPath: 'none',
    borderRadius: 24,
  },
  hexagon: {
    label: 'Hexagone',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    borderRadius: 0,
  },
  diamond: {
    label: 'Losange',
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    borderRadius: 0,
  },
  octagon: {
    label: 'Octogone',
    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
    borderRadius: 0,
  },
};

export type FrameShapeKey = keyof typeof FRAME_SHAPES;