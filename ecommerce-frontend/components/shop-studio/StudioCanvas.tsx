'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { BannerBlock } from './blocks/BannerBlock';
import { LogoBlock } from './blocks/LogoBlock';
import { TitleBlock } from './blocks/TitleBlock';
import { ProductsBlock } from './blocks/ProductsBlock';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { ShapeBlock } from './blocks/ShapeBlock';
import { ScreenBannerBlock } from './blocks/ScreenBannerBlock';
import { CarouselBannerBlock } from './blocks/CarouselBannerBlock';

interface Props {
  shop: any;
  blocks: any[];
  customization: any;
  filters: any;
  canvasFilters: any;
  selectedBlockId: string | null;
  isBackgroundSelected: boolean;
  onSelectBlock: (id: string | null, target?: 'text' | 'background') => void;
  onSelectBackground: () => void;
  onUpdateBlock: (id: string, updates: any) => void;
  onUpdateBlockPosition: (id: string, position: any) => void;
  onReorderBlocks: (startIndex: number, endIndex: number) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
}

export default function StudioCanvas({
  shop,
  blocks,
  customization,
  filters,
  canvasFilters,
  selectedBlockId,
  isBackgroundSelected,
  onSelectBlock,
  onSelectBackground,
  onUpdateBlock,
  onUpdateBlockPosition,
  onDeleteBlock,
  onDuplicateBlock,
}: Props) {
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [resizingBlock, setResizingBlock] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeForceUpdate, setResizeForceUpdate] = useState(0);
  
  const dragRafId = useRef<number | null>(null);
  const resizeRafId = useRef<number | null>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .force-font-apply, [class*="font-"], h1, h2, h3, h4, p, button, span, div {
        font-display: swap !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  // ⭐ CORRECTION: Ajout de width et height dans le drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingBlock) {
      if (dragRafId.current) return;
      dragRafId.current = requestAnimationFrame(() => {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        // ⭐ Passer aussi la largeur et hauteur actuelles
        onUpdateBlockPosition(draggingBlock, {
          x: originalPosition.x + dx,
          y: originalPosition.y + dy,
          width: originalPosition.width,
          height: originalPosition.height,
        });
        dragRafId.current = null;
      });
    }
  }, [draggingBlock, dragStart, originalPosition, onUpdateBlockPosition]);

  const handleResizeMove = useCallback((e: MouseEvent, blockId: string, startData: any) => {
    if (resizeRafId.current) return;
    resizeRafId.current = requestAnimationFrame(() => {
      const dx = e.clientX - startData.startX;
      const dy = e.clientY - startData.startY;
      let newWidth = startData.startWidth;
      let newHeight = startData.startHeight;
      let newX = startData.startXpos;
      let newY = startData.startYpos;
      
      const MIN_SIZE = 20;
      
      switch (startData.direction) {
        case 'se':
          newWidth = Math.max(MIN_SIZE, startData.startWidth + dx);
          newHeight = Math.max(MIN_SIZE, startData.startHeight + dy);
          break;
        case 'e':
          newWidth = Math.max(MIN_SIZE, startData.startWidth + dx);
          break;
        case 's':
          newHeight = Math.max(MIN_SIZE, startData.startHeight + dy);
          break;
        case 'ne':
          newWidth = Math.max(MIN_SIZE, startData.startWidth + dx);
          newHeight = Math.max(MIN_SIZE, startData.startHeight - dy);
          newY = startData.startYpos + dy;
          break;
        case 'nw':
          newWidth = Math.max(MIN_SIZE, startData.startWidth - dx);
          newHeight = Math.max(MIN_SIZE, startData.startHeight - dy);
          newX = startData.startXpos + dx;
          newY = startData.startYpos + dy;
          break;
        case 'sw':
          newWidth = Math.max(MIN_SIZE, startData.startWidth - dx);
          newHeight = Math.max(MIN_SIZE, startData.startHeight + dy);
          newX = startData.startXpos + dx;
          break;
        case 'n':
          newHeight = Math.max(MIN_SIZE, startData.startHeight - dy);
          newY = startData.startYpos + dy;
          break;
        case 'w':
          newWidth = Math.max(MIN_SIZE, startData.startWidth - dx);
          newX = startData.startXpos + dx;
          break;
      }
      
      onUpdateBlockPosition(blockId, { x: newX, y: newY, width: newWidth, height: newHeight });
      setResizeForceUpdate(prev => prev + 1);
      resizeRafId.current = null;
    });
  }, [onUpdateBlockPosition]);

  const handleMouseUp = useCallback(() => {
    if (dragRafId.current) {
      cancelAnimationFrame(dragRafId.current);
      dragRafId.current = null;
    }
    if (resizeRafId.current) {
      cancelAnimationFrame(resizeRafId.current);
      resizeRafId.current = null;
    }
    setDraggingBlock(null);
    setResizingBlock(null);
    setIsResizing(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    if (draggingBlock) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingBlock, handleMouseMove, handleMouseUp]);

  const handleBlockClick = (e: React.MouseEvent, blockId: string, block: any) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const isTextClick = target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3' || 
                        target.tagName === 'H4' || target.tagName === 'P' || target.tagName === 'BUTTON' ||
                        target.classList?.contains('text-content') || target.classList?.contains('prose');
    onSelectBlock(blockId, isTextClick ? 'text' : 'background');
  };

  const handleCanvasClick = () => onSelectBackground();

  const handleMouseDown = (e: React.MouseEvent, blockId: string, block: any) => {
    e.stopPropagation();
    setDraggingBlock(blockId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setOriginalPosition({ x: block.position.x, y: block.position.y, width: block.position.width, height: block.position.height });
  };

  const handleResizeStart = (e: React.MouseEvent, blockId: string, block: any, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizingBlock(blockId);
    setResizeDirection(direction);
    setDragStart({ x: e.clientX, y: e.clientY });
    setOriginalPosition({ ...block.position });
    
    const startData = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: block.position.width,
      startHeight: block.position.height,
      startXpos: block.position.x,
      startYpos: block.position.y,
      direction,
    };
    
    const handleMouseMoveResize = (moveEvent: MouseEvent) => {
      handleResizeMove(moveEvent, blockId, startData);
    };
    
    const handleMouseUpResize = () => {
      window.removeEventListener('mousemove', handleMouseMoveResize);
      window.removeEventListener('mouseup', handleMouseUpResize);
      if (resizeRafId.current) {
        cancelAnimationFrame(resizeRafId.current);
        resizeRafId.current = null;
      }
      setIsResizing(false);
      setResizingBlock(null);
    };
    
    window.addEventListener('mousemove', handleMouseMoveResize);
    window.addEventListener('mouseup', handleMouseUpResize);
  };

  const handleTextDoubleClick = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    setEditingTextId(blockId);
    onSelectBlock(blockId, 'text');
  };

  const handleTextBlur = (blockId: string, newContent: string) => {
    setEditingTextId(null);
    onUpdateBlock(blockId, { content: newContent });
  };

  const renderBlock = (block: any) => {
    const isSelected = selectedBlockId === block.id;
    const isEditing = editingTextId === block.id;
    
    const blockFilter = block.props?.cssFilter || 'none';
    const blockOpacity = block.props?.opacity !== undefined ? block.props.opacity / 100 : 1;
    const textOpacity = block.props?.textOpacity !== undefined ? block.props.textOpacity / 100 : 1;
    
    const commonProps = {
      shop,
      block,
      customization,
      isSelected,
      isEditing,
      textOpacity,
      isResizing,
      onSelect: () => onSelectBlock(block.id, 'background'),
      onUpdate: (updates: any) => onUpdateBlock(block.id, updates),
      onDelete: () => onDeleteBlock(block.id),
      onDuplicate: () => onDuplicateBlock(block.id),
      onDoubleClick: (e: React.MouseEvent) => handleTextDoubleClick(e, block.id),
      onTextBlur: (content: string) => handleTextBlur(block.id, content),
    };

    const blockStyle = {
      position: 'absolute' as const,
      left: block.position.x,
      top: block.position.y,
      width: block.position.width,
      height: block.position.height,
      zIndex: block.position.zIndex,
      transform: block.position.rotation ? `rotate(${block.position.rotation}deg)` : 'none',
      overflow: 'hidden' as const,
      filter: blockFilter,
      opacity: blockOpacity,
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
    };

    const renderContent = () => {
      switch (block.type) {
        case 'banner': return <BannerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'screen-banner': return <ScreenBannerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'carousel-banner': return <CarouselBannerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'logo': return <LogoBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'title': return <TitleBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'products': return <ProductsBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'text': return <TextBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'image': return <ImageBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'button': return <ButtonBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'spacer': return <SpacerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        case 'shape': return <ShapeBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
        default: return <div key={block.id} className="w-full h-full bg-gray-100 flex items-center justify-center">⚠️ {block.type}</div>;
      }
    };

    return (
      <div key={`wrapper-${block.id}`}>
        <div
          style={blockStyle}
          className={`absolute cursor-grab active:cursor-grabbing ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg z-50' : ''}`}
          onClick={(e) => handleBlockClick(e, block.id, block)}
          onMouseDown={(e) => handleMouseDown(e, block.id, block)}
        >
          {renderContent()}
        </div>

        {isSelected && (
          <div
            key={`handles-${block.id}`}
            style={{
              position: 'absolute',
              left: block.position.x - 4,
              top: block.position.y - 4,
              width: block.position.width + 8,
              height: block.position.height + 8,
              pointerEvents: 'none',
              zIndex: 45,
            }}
          >
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-nw-resize"
                 style={{ width: 16, height: 16, left: -8, top: -8, pointerEvents: 'auto' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'nw')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-ne-resize"
                 style={{ width: 16, height: 16, right: -8, top: -8, pointerEvents: 'auto' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'ne')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-sw-resize"
                 style={{ width: 16, height: 16, left: -8, bottom: -8, pointerEvents: 'auto' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'sw')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-se-resize"
                 style={{ width: 16, height: 16, right: -8, bottom: -8, pointerEvents: 'auto' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'se')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-n-resize"
                 style={{ width: 16, height: 16, left: 'calc(50% - 8px)', top: -8, pointerEvents: 'auto' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'n')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-s-resize"
                 style={{ width: 16, height: 16, left: 'calc(50% - 8px)', bottom: -8, pointerEvents: 'auto' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 's')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-w-resize"
                 style={{ width: 16, height: 16, left: -8, top: 'calc(50% - 8px)', pointerEvents: 'auto' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'w')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-e-resize"
                 style={{ width: 16, height: 16, right: -8, top: 'calc(50% - 8px)', pointerEvents: 'auto' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'e')} />
          </div>
        )}
      </div>
    );
  };

  let backgroundStyle: React.CSSProperties = {
    backgroundColor: customization?.backgroundColor || '#ffffff',
    minHeight: '100vh',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  };

  const canvasFilter = canvasFilters?.globalCssFilter || 'none';
  backgroundStyle.filter = canvasFilter;

  if (customization?.backgroundType === 'gradient' && customization?.backgroundValue) {
    backgroundStyle.background = customization.backgroundValue;
    backgroundStyle.backgroundColor = 'transparent';
    delete backgroundStyle.backgroundColor;
  }

  if (customization?.backgroundImage) {
    backgroundStyle.backgroundImage = `url(${customization.backgroundImage})`;
    backgroundStyle.backgroundSize = customization?.backgroundSize || 'cover';
    backgroundStyle.backgroundPosition = customization?.backgroundPosition || 'center';
    backgroundStyle.backgroundRepeat = 'no-repeat';
    delete backgroundStyle.backgroundColor;
  }

  if (customization?.backgroundOpacity !== undefined && customization?.backgroundOpacity !== 100) {
    backgroundStyle.opacity = customization.backgroundOpacity / 100;
  }

  const blocksContainerStyle = {
    position: 'relative' as const,
    zIndex: 1,
    minHeight: '100vh',
    width: '100%',
  };

  return (
    <div 
      className={`relative w-full min-h-screen ${isBackgroundSelected ? 'ring-4 ring-primary ring-offset-4 rounded-lg' : ''}`}
      onClick={handleCanvasClick}
    >
      <div style={backgroundStyle} />
      <div style={blocksContainerStyle}>
        {blocks.map(block => renderBlock(block))}
      </div>
    </div>
  );
}