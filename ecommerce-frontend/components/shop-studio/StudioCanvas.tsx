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
  isCropperOpen?: boolean;
}

export default function StudioCanvas({
  shop,
  blocks,
  customization,
  canvasFilters,
  selectedBlockId,
  isBackgroundSelected,
  onSelectBlock,
  onSelectBackground,
  onUpdateBlock,
  onUpdateBlockPosition,
  onDeleteBlock,
  onDuplicateBlock,
  isCropperOpen = false,
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
  const lastUpdateRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .force-font-apply, [class*="font-"], h1, h2, h3, h4, p, button, span, div {
        font-display: swap !important;
      }
      .group-container {
        border: 2px dashed #3b82f6;
        border-radius: 8px;
        background: rgba(59, 130, 246, 0.05);
        position: relative;
        transition: all 0.2s ease;
      }
      .group-container:hover {
        background: rgba(59, 130, 246, 0.1);
        border-color: #60a5fa;
      }
      .group-label {
        position: absolute;
        top: -10px;
        left: 10px;
        background: #3b82f6;
        color: white;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 12px;
        z-index: 10;
        pointer-events: none;
        font-weight: 500;
        letter-spacing: 0.5px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  const getChildren = useCallback((parentId: string) => {
    return blocks.filter(b => b.parentId === parentId);
  }, [blocks]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingBlock && !isCropperOpen) {
      if (dragRafId.current) return;
      dragRafId.current = requestAnimationFrame(() => {
        const block = blocks.find(b => b.id === draggingBlock);
        const isChild = block?.parentId !== null && block?.parentId !== undefined;
        const parent = isChild ? blocks.find(b => b.id === block?.parentId) : null;
        
        let dx = e.clientX - dragStart.x;
        let dy = e.clientY - dragStart.y;
        let newX = originalPosition.x + dx;
        let newY = originalPosition.y + dy;
        
        if (isChild && parent) {
          const childWidth = block?.position.width || 0;
          const childHeight = block?.position.height || 0;
          
          const minX = 0;
          const maxX = 100 - childWidth;
          const minY = 0;
          const maxY = 100 - childHeight;
          
          newX = Math.max(minX, Math.min(maxX, newX));
          newY = Math.max(minY, Math.min(maxY, newY));
        }
        
        onUpdateBlockPosition(draggingBlock, {
          x: newX,
          y: newY,
          width: originalPosition.width,
          height: originalPosition.height,
        });
        dragRafId.current = null;
      });
    }
  }, [draggingBlock, dragStart, originalPosition, onUpdateBlockPosition, isCropperOpen, blocks]);

  const handleResizeMove = useCallback((e: MouseEvent, blockId: string, startData: any) => {
    if (isCropperOpen) return;
    if (resizeRafId.current) return;
    
    resizeRafId.current = requestAnimationFrame(() => {
      const dx = e.clientX - startData.startX;
      const dy = e.clientY - startData.startY;
      let newWidth = startData.startWidth;
      let newHeight = startData.startHeight;
      let newX = startData.startXpos;
      let newY = startData.startYpos;
      
      const MIN_PERCENT = 5;
      const MIN_PX = 20;
      
      const block = blocks.find(b => b.id === blockId);
      const isChild = block?.parentId !== null && block?.parentId !== undefined;
      const parent = isChild ? blocks.find(b => b.id === block?.parentId) : null;
      
      if (isChild && parent) {
        const parentWidth = parent.position.width;
        const parentHeight = parent.position.height;
        
        const deltaPercentX = (dx / parentWidth) * 100;
        const deltaPercentY = (dy / parentHeight) * 100;
        
        switch (startData.direction) {
          case 'se':
            newWidth = Math.max(MIN_PERCENT, startData.startWidth + deltaPercentX);
            newHeight = Math.max(MIN_PERCENT, startData.startHeight + deltaPercentY);
            break;
          case 'e':
            newWidth = Math.max(MIN_PERCENT, startData.startWidth + deltaPercentX);
            break;
          case 's':
            newHeight = Math.max(MIN_PERCENT, startData.startHeight + deltaPercentY);
            break;
          case 'ne':
            newWidth = Math.max(MIN_PERCENT, startData.startWidth + deltaPercentX);
            newHeight = Math.max(MIN_PERCENT, startData.startHeight - deltaPercentY);
            newY = startData.startYpos + deltaPercentY;
            break;
          case 'nw':
            newWidth = Math.max(MIN_PERCENT, startData.startWidth - deltaPercentX);
            newHeight = Math.max(MIN_PERCENT, startData.startHeight - deltaPercentY);
            newX = startData.startXpos + deltaPercentX;
            newY = startData.startYpos + deltaPercentY;
            break;
          case 'sw':
            newWidth = Math.max(MIN_PERCENT, startData.startWidth - deltaPercentX);
            newHeight = Math.max(MIN_PERCENT, startData.startHeight + deltaPercentY);
            newX = startData.startXpos + deltaPercentX;
            break;
          case 'n':
            newHeight = Math.max(MIN_PERCENT, startData.startHeight - deltaPercentY);
            newY = startData.startYpos + deltaPercentY;
            break;
          case 'w':
            newWidth = Math.max(MIN_PERCENT, startData.startWidth - deltaPercentX);
            newX = startData.startXpos + deltaPercentX;
            break;
        }
        
        newWidth = Math.max(MIN_PERCENT, Math.min(100 - newX, newWidth));
        newHeight = Math.max(MIN_PERCENT, Math.min(100 - newY, newHeight));
        newX = Math.max(0, Math.min(100 - newWidth, newX));
        newY = Math.max(0, Math.min(100 - newHeight, newY));
        
      } else {
        switch (startData.direction) {
          case 'se':
            newWidth = Math.max(MIN_PX, startData.startWidth + dx);
            newHeight = Math.max(MIN_PX, startData.startHeight + dy);
            break;
          case 'e':
            newWidth = Math.max(MIN_PX, startData.startWidth + dx);
            break;
          case 's':
            newHeight = Math.max(MIN_PX, startData.startHeight + dy);
            break;
          case 'ne':
            newWidth = Math.max(MIN_PX, startData.startWidth + dx);
            newHeight = Math.max(MIN_PX, startData.startHeight - dy);
            newY = startData.startYpos + dy;
            break;
          case 'nw':
            newWidth = Math.max(MIN_PX, startData.startWidth - dx);
            newHeight = Math.max(MIN_PX, startData.startHeight - dy);
            newX = startData.startXpos + dx;
            newY = startData.startYpos + dy;
            break;
          case 'sw':
            newWidth = Math.max(MIN_PX, startData.startWidth - dx);
            newHeight = Math.max(MIN_PX, startData.startHeight + dy);
            newX = startData.startXpos + dx;
            break;
          case 'n':
            newHeight = Math.max(MIN_PX, startData.startHeight - dy);
            newY = startData.startYpos + dy;
            break;
          case 'w':
            newWidth = Math.max(MIN_PX, startData.startWidth - dx);
            newX = startData.startXpos + dx;
            break;
        }
      }
      
      const lastUpdate = lastUpdateRef.current;
      const hasChanged = !lastUpdate || 
        Math.abs(newX - lastUpdate.x) > 0.5 ||
        Math.abs(newY - lastUpdate.y) > 0.5 ||
        Math.abs(newWidth - lastUpdate.width) > 0.5 ||
        Math.abs(newHeight - lastUpdate.height) > 0.5;
      
      if (hasChanged) {
        lastUpdateRef.current = { x: newX, y: newY, width: newWidth, height: newHeight };
        onUpdateBlockPosition(blockId, { x: newX, y: newY, width: newWidth, height: newHeight });
        setResizeForceUpdate(prev => prev + 1);
      }
      
      resizeRafId.current = null;
    });
  }, [onUpdateBlockPosition, isCropperOpen, blocks]);

  const handleMouseUp = useCallback(() => {
    if (dragRafId.current) {
      cancelAnimationFrame(dragRafId.current);
      dragRafId.current = null;
    }
    if (resizeRafId.current) {
      cancelAnimationFrame(resizeRafId.current);
      resizeRafId.current = null;
    }
    lastUpdateRef.current = null;
    setDraggingBlock(null);
    setResizingBlock(null);
    setIsResizing(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    if (draggingBlock && !isCropperOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingBlock, handleMouseMove, handleMouseUp, isCropperOpen]);

  const handleBlockClick = (e: React.MouseEvent, blockId: string, block: any) => {
    if (isCropperOpen) {
      e.stopPropagation();
      return;
    }
    
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    const isTextElement = target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3' || 
                          target.tagName === 'H4' || target.tagName === 'P' || target.tagName === 'BUTTON' ||
                          target.classList?.contains('text-content') || target.classList?.contains('prose') ||
                          target.getAttribute?.('contenteditable') === 'true';
    
    const isParentBlock = ['banner', 'screen-banner', 'carousel-banner'].includes(block.type);
    
    if (isParentBlock) {
      if (isTextElement) {
        const childBlock = blocks.find(b => b.parentId === blockId && (
          b.type === 'title' || b.type === 'text' || b.type === 'button'
        ));
        if (childBlock) {
          onSelectBlock(childBlock.id, 'text');
        } else {
          onSelectBlock(blockId, 'text');
        }
      } else {
        onSelectBlock(blockId, 'background');
      }
      return;
    }
    
    if (isTextElement) {
      onSelectBlock(blockId, 'text');
    } else {
      onSelectBlock(blockId, 'background');
    }
  };

  const handleCanvasClick = () => {
    if (isCropperOpen) return;
    onSelectBackground();
  };

  const handleMouseDown = (e: React.MouseEvent, blockId: string, block: any, isChild: boolean = false) => {
    if (isCropperOpen) {
      e.stopPropagation();
      return;
    }
    
    e.stopPropagation();
    setDraggingBlock(blockId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setOriginalPosition({ x: block.position.x, y: block.position.y, width: block.position.width, height: block.position.height });
  };

  const handleResizeStart = (e: React.MouseEvent, blockId: string, block: any, direction: string) => {
    if (isCropperOpen) {
      e.stopPropagation();
      return;
    }
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
    if (isCropperOpen) return;
    e.stopPropagation();
    setEditingTextId(blockId);
    onSelectBlock(blockId, 'text');
  };

  const handleTextBlur = (blockId: string, newContent: string) => {
    setEditingTextId(null);
    onUpdateBlock(blockId, { content: newContent });
  };

  const renderParentContent = (block: any, commonProps: any) => {
    switch (block.type) {
      case 'banner': return <BannerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
      case 'screen-banner': return <ScreenBannerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
      case 'carousel-banner': return <CarouselBannerBlock key={`${block.id}-${resizeForceUpdate}`} {...commonProps} />;
      default: return null;
    }
  };

  const renderBlock = useCallback((block: any, isChild: boolean = false) => {
    const isSelected = selectedBlockId === block.id;
    const isEditing = editingTextId === block.id;
    const children = getChildren(block.id);
    
    const blockFilter = block.props?.cssFilter || 'none';
    const blockOpacity = block.props?.opacity !== undefined ? block.props.opacity / 100 : 1;
    const textOpacity = block.props?.textOpacity !== undefined ? block.props.textOpacity / 100 : 1;
    
    const showSelectionRing = isSelected && !isCropperOpen;
    const showResizeHandles = isSelected && !isCropperOpen && block.type !== 'group';
    
    const commonProps = {
      shop,
      block,
      customization,
      isSelected: showSelectionRing,
      isEditing,
      textOpacity,
      isResizing,
      onSelect: () => {
        if (isCropperOpen) return;
        onSelectBlock(block.id, 'background');
      },
      onUpdate: (updates: any) => onUpdateBlock(block.id, updates),
      onDelete: () => onDeleteBlock(block.id),
      onDuplicate: () => onDuplicateBlock(block.id),
      onDoubleClick: (e: React.MouseEvent) => {
        if (isCropperOpen) return;
        handleTextDoubleClick(e, block.id);
      },
      onTextBlur: (content: string) => handleTextBlur(block.id, content),
    };

    if (block.type === 'group') {
      const groupChildren = getChildren(block.id);
      const isSelectedGroup = selectedBlockId === block.id && !isCropperOpen;
      
      return (
        <div
          key={`wrapper-${block.id}`}
          className={`group-container ${isSelectedGroup ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`}
          style={{
            position: 'absolute',
            left: block.position.x,
            top: block.position.y,
            width: block.position.width,
            height: block.position.height,
            zIndex: block.position.zIndex,
            cursor: isSelectedGroup ? 'move' : 'default',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectBlock(block.id, 'background');
          }}
          onMouseDown={(e) => {
            if (isSelectedGroup && !isCropperOpen) {
              handleMouseDown(e, block.id, block);
            }
          }}
        >
          <div className="group-label">📁 Groupe ({groupChildren.length})</div>
          
          {groupChildren.map(child => {
            const childStyle = {
              position: 'absolute' as const,
              left: `${child.position.x}%`,
              top: `${child.position.y}%`,
              width: `${child.position.width}%`,
              height: child.position.height === 0 ? 'auto' : `${child.position.height}%`,
              minHeight: '30px',
            };
            
            return (
              <div
                key={`group-child-${child.id}`}
                data-block-id={child.id}
                style={childStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBlock(child.id, 'background');
                }}
              >
                {renderBlock(child, true)}
              </div>
            );
          })}
        </div>
      );
    }

    const isParentBlock = ['banner', 'screen-banner', 'carousel-banner'].includes(block.type);
    
    if (isParentBlock) {
      return (
        <div key={`wrapper-${block.id}`}>
          <div
            style={{
              position: 'absolute',
              left: block.position.x,
              top: block.position.y,
              width: block.position.width,
              height: block.position.height,
              zIndex: block.position.zIndex,
            }}
            className="relative"
          >
            <div
              data-block-id={block.id}
              className={`w-full h-full ${!isChild ? 'cursor-grab active:cursor-grabbing' : ''} ${showSelectionRing && !isChild ? 'ring-2 ring-primary ring-offset-2 rounded-lg z-50' : ''}`}
              onClick={(e) => {
                if (isCropperOpen) {
                  e.stopPropagation();
                  return;
                }
                e.stopPropagation();
                onSelectBlock(block.id, 'background');
              }}
              onMouseDown={(e) => {
                handleMouseDown(e, block.id, block);
              }}
              style={{
                filter: blockFilter,
                opacity: blockOpacity,
                transform: block.position.rotation ? `rotate(${block.position.rotation}deg)` : 'none',
                overflow: 'hidden',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            >
              {renderParentContent(block, commonProps)}
              
              {children.length > 0 && (
                <div 
                  className="absolute inset-0"
                  style={{ pointerEvents: 'none' }}
                >
                  {children.map(child => {
                    return (
                      <div
                        key={`child-wrapper-${child.id}`}
                        data-block-id={child.id}
                        style={{
                          position: 'absolute',
                          left: `${child.position.x}%`,
                          top: `${child.position.y}%`,
                          width: `${child.position.width}%`,
                          height: child.position.height === 0 ? 'auto' : `${child.position.height}%`,
                          minHeight: '30px',
                          pointerEvents: 'auto',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBlock(child.id, 'text');
                        }}
                      >
                        {renderBlock(child, true)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {showResizeHandles && (
              <div className="absolute inset-0 pointer-events-none z-50" style={{ margin: '-4px' }}>
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-nw-resize pointer-events-auto"
                     style={{ width: 12, height: 12, left: -6, top: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'nw')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-ne-resize pointer-events-auto"
                     style={{ width: 12, height: 12, right: -6, top: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'ne')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-sw-resize pointer-events-auto"
                     style={{ width: 12, height: 12, left: -6, bottom: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'sw')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-se-resize pointer-events-auto"
                     style={{ width: 12, height: 12, right: -6, bottom: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'se')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-n-resize pointer-events-auto"
                     style={{ width: 12, height: 12, left: 'calc(50% - 6px)', top: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'n')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-s-resize pointer-events-auto"
                     style={{ width: 12, height: 12, left: 'calc(50% - 6px)', bottom: -6 }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 's')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-w-resize pointer-events-auto"
                     style={{ width: 12, height: 12, left: -6, top: 'calc(50% - 6px)' }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'w')} />
                <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-e-resize pointer-events-auto"
                     style={{ width: 12, height: 12, right: -6, top: 'calc(50% - 6px)' }}
                     onMouseDown={(e) => handleResizeStart(e, block.id, block, 'e')} />
              </div>
            )}
          </div>
        </div>
      );
    }

    const renderContent = () => {
      switch (block.type) {
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

    const blockStyle = {
      position: 'absolute' as const,
      left: isChild ? `${block.position.x}%` : block.position.x,
      top: isChild ? `${block.position.y}%` : block.position.y,
      width: isChild ? `${block.position.width}%` : block.position.width,
      height: isChild ? (block.position.height === 0 ? 'auto' : `${block.position.height}%`) : block.position.height,
      minHeight: isChild ? '30px' : undefined,
      zIndex: block.position.zIndex,
      transform: block.position.rotation ? `rotate(${block.position.rotation}deg)` : 'none',
    };

    const hasChildren = children && children.length > 0;

    return (
      <div
        key={`wrapper-${block.id}`}
        data-block-id={block.id}
        style={blockStyle}
        className="relative"
      >
        <div
          className={`w-full h-full cursor-grab active:cursor-grabbing ${showSelectionRing ? 'ring-2 ring-primary ring-offset-2 rounded-lg z-50' : ''}`}
          onClick={(e) => handleBlockClick(e, block.id, block)}
          onMouseDown={(e) => handleMouseDown(e, block.id, block)}
          style={{
            filter: blockFilter,
            opacity: blockOpacity,
            transform: block.position.rotation ? `rotate(${block.position.rotation}deg)` : 'none',
            overflow: 'visible',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            position: 'relative',
          }}
        >
          {renderContent()}
          
          {hasChildren && (
            <div 
              className="absolute inset-0"
              style={{ pointerEvents: 'none' }}
            >
              {children.map(child => {
                const childStyle = {
                  position: 'absolute' as const,
                  left: `${child.position.x}%`,
                  top: `${child.position.y}%`,
                  width: `${child.position.width}%`,
                  height: child.position.height === 0 ? 'auto' : `${child.position.height}%`,
                  minHeight: '30px',
                  pointerEvents: 'auto' as const,
                };
                
                return (
                  <div
                    key={`child-wrapper-${child.id}`}
                    data-block-id={child.id}
                    style={childStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBlock(child.id, 'text');
                    }}
                  >
                    {renderBlock(child, true)}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showResizeHandles && (
          <div className="absolute inset-0 pointer-events-none z-50" style={{ margin: '-4px' }}>
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-nw-resize pointer-events-auto"
                 style={{ width: 12, height: 12, left: -6, top: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'nw')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-ne-resize pointer-events-auto"
                 style={{ width: 12, height: 12, right: -6, top: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'ne')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-sw-resize pointer-events-auto"
                 style={{ width: 12, height: 12, left: -6, bottom: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'sw')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-se-resize pointer-events-auto"
                 style={{ width: 12, height: 12, right: -6, bottom: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'se')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-n-resize pointer-events-auto"
                 style={{ width: 12, height: 12, left: 'calc(50% - 6px)', top: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'n')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-s-resize pointer-events-auto"
                 style={{ width: 12, height: 12, left: 'calc(50% - 6px)', bottom: -6 }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 's')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-w-resize pointer-events-auto"
                 style={{ width: 12, height: 12, left: -6, top: 'calc(50% - 6px)' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'w')} />
            <div className="absolute bg-primary rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-e-resize pointer-events-auto"
                 style={{ width: 12, height: 12, right: -6, top: 'calc(50% - 6px)' }}
                 onMouseDown={(e) => handleResizeStart(e, block.id, block, 'e')} />
          </div>
        )}
      </div>
    );
  }, [blocks, selectedBlockId, editingTextId, isCropperOpen, isResizing, getChildren, resizeForceUpdate, shop, customization, onSelectBlock, onUpdateBlock, onDeleteBlock, onDuplicateBlock, onUpdateBlockPosition]);

  // ⭐ STYLE BACKGROUND CORRIGÉ - Pas de mélange entre background et backgroundColor
  let backgroundStyle: React.CSSProperties = {
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
  } else if (customization?.backgroundImage) {
    backgroundStyle.backgroundImage = `url(${customization.backgroundImage})`;
    backgroundStyle.backgroundSize = customization?.backgroundSize || 'cover';
    backgroundStyle.backgroundPosition = customization?.backgroundPosition || 'center';
    backgroundStyle.backgroundRepeat = 'no-repeat';
  } else {
    backgroundStyle.backgroundColor = customization?.backgroundColor || '#ffffff';
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

  const sortedBlocks = [...blocks].sort((a, b) => (a.position?.zIndex || 0) - (b.position?.zIndex || 0));
  const rootBlocks = sortedBlocks.filter(block => !block.parentId);

  return (
    <div 
      className={`relative w-full min-h-screen ${isBackgroundSelected ? 'ring-4 ring-primary ring-offset-4 rounded-lg' : ''}`}
      onClick={handleCanvasClick}
    >
      <div style={backgroundStyle} />
      <div style={blocksContainerStyle}>
        {rootBlocks.map(block => renderBlock(block))}
      </div>
    </div>
  );
}