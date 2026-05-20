// types/layers.ts
export interface Layer {
  id: string;
  name: string;
  type: string;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  children: Layer[];
  parentId: string | null;
  blockId: string;
  isExpanded?: boolean;
}

export interface LayerTreeProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
  onMoveLayerUp: (layerId: string) => void;
  onMoveLayerDown: (layerId: string) => void;
  onReparentLayer: (layerId: string, newParentId: string | null) => void;
}