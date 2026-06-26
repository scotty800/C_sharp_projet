// src/types/global.d.ts
export {};

declare global {
  interface Window {
    __carouselStates?: Record<string, {
      currentIndex: number;
      isTransitioning: boolean;
      lastUpdate: number;
    }>;
    __pendingCarouselCallback?: (url: string) => void;
    __pendingAssetCallback?: (url: string) => void;
    saveChanges?: () => Promise<void>;
    applyFiltersToAllBlocks?: (updates: any) => void;
  }
}