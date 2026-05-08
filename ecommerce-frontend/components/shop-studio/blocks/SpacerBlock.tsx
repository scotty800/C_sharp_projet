'use client';

interface Props {
  shop: any;
  block: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}

export function SpacerBlock({ block, isSelected, onSelect, onUpdate }: Props) {
  const { props } = block;

  return (
    <div
      className={`relative cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onSelect}
    >
      <div
        className="w-full"
        style={{ height: props.height || 50 }}
      >
        {isSelected && (
          <div className="h-full w-full bg-primary/10 flex items-center justify-center">
            <div className="bg-primary/30 text-primary text-xs px-2 py-1 rounded-full">
              Espaceur - {props.height || 50}px
            </div>
          </div>
        )}
      </div>

      {isSelected && (
        <div className="absolute -top-3 left-4 bg-primary text-white text-xs px-2 py-0.5 rounded z-20">
          Espaceur
        </div>
      )}
    </div>
  );
}