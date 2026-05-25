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
import { GroupOverlay } from './GroupOverlay';

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
  onMoveGroup?: (movedBlockId: string, deltaX: number, deltaY: number) => void;
  getGroupMembers?: (groupId: string) => any[];
  onResizeGroup?: (groupId: string, bounds: { x: number; y: number; width: number; height: number }) => void;
  getGroupBounds?: (groupId: string) => { x: number; y: number; width: number; height: number } | null;
  onResizeGroupStart?: (groupId: string) => void;
  onResizeGroupEnd?: () => void;
  // ── Carousel ──
  onAddSlide?: (carouselBlockId: string) => void;
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
  onMoveGroup,
  getGroupMembers,
  onResizeGroup,
  getGroupBounds,
  onResizeGroupStart,
  onResizeGroupEnd,
  onAddSlide,
}: Props) {
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [resizingBlock, setResizingBlock] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeForceUpdate, setResizeForceUpdate] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupBounds, setGroupBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
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

  // ── Helpers pour calculer les positions absolues à n'importe quelle profondeur ──
  const getAbsolutePosition = useCallback((block: any): { x: number; y: number; width: number; height: number } => {
    if (!block.parentId) {
      return { x: block.position.x, y: block.position.y, width: block.position.width, height: block.position.height };
    }
    const parent = blocks.find(b => b.id === block.parentId);
    if (!parent) return { x: block.position.x, y: block.position.y, width: block.position.width, height: block.position.height };
    
    const parentAbs = getAbsolutePosition(parent);
    return {
      x: parentAbs.x + (block.position.x / 100) * parentAbs.width,
      y: parentAbs.y + (block.position.y / 100) * parentAbs.height,
      width: (block.position.width / 100) * parentAbs.width,
      height: block.position.height === 0 ? 0 : (block.position.height / 100) * parentAbs.height,
    };
  }, [blocks]);

  const getParentAbsolutePosition = useCallback((parentId: string): { x: number; y: number; width: number; height: number } | null => {
    const parent = blocks.find(b => b.id === parentId);
    if (!parent) return null;
    return getAbsolutePosition(parent);
  }, [blocks, getAbsolutePosition]);

  const updateGroupBounds = useCallback(() => {
    if (!selectedGroupId || !getGroupBounds) {
      setGroupBounds(null);
      return;
    }
    const bounds = getGroupBounds(selectedGroupId);
    setGroupBounds(bounds ?? null);
  }, [selectedGroupId, getGroupBounds]);

  useEffect(() => {
    updateGroupBounds();
  }, [blocks, selectedGroupId, updateGroupBounds]);

  const handleGroupResize = useCallback((groupId: string, newBounds: { x: number; y: number; width: number; height: number }) => {
    if (onResizeGroup) {
      onResizeGroup(groupId, newBounds);
      updateGroupBounds();
    }
  }, [onResizeGroup, updateGroupBounds]);

  const handleGroupResizeStart = useCallback(() => {
    if (selectedGroupId && onResizeGroupStart) {
      onResizeGroupStart(selectedGroupId);
    }
  }, [selectedGroupId, onResizeGroupStart]);

  const handleGroupResizeEnd = useCallback(() => {
    if (onResizeGroupEnd) {
      onResizeGroupEnd();
    }
  }, [onResizeGroupEnd]);

  const handleSelectBlockWithGroup = useCallback((blockId: string | null, target?: 'text' | 'background') => {
    if (blockId) {
      const block = blocks.find(b => b.id === blockId);
      setSelectedGroupId(block?.groupId ?? null);
    } else {
      setSelectedGroupId(null);
    }
    onSelectBlock(blockId, target);
  }, [blocks, onSelectBlock]);

  // ⭐ VERSION CORRIGÉE DE handleMouseMove avec calcul des positions absolues
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingBlock && !isCropperOpen) {
      if (dragRafId.current) return;
      dragRafId.current = requestAnimationFrame(() => {
        const block = blocks.find(b => b.id === draggingBlock);

        if (block?.groupId && onMoveGroup) {
          const dx = e.clientX - dragStart.x;
          const dy = e.clientY - dragStart.y;
          onMoveGroup(draggingBlock, dx, dy);
          setDragStart({ x: e.clientX, y: e.clientY });
          dragRafId.current = null;
          return;
        }

        const isChild = block?.parentId != null;

        if (isChild && block?.parentId) {
          // ✅ Résoudre la taille absolue du parent (quelle que soit la profondeur)
          const parentAbs = getParentAbsolutePosition(block.parentId);
          if (parentAbs) {
            const cw = block.position.width || 0;
            const ch = block.position.height || 0;
            const newX = Math.max(0, Math.min(100 - cw, originalPosition.x + (e.clientX - dragStart.x) / parentAbs.width * 100));
            const newY = Math.max(0, Math.min(100 - ch, originalPosition.y + (e.clientY - dragStart.y) / parentAbs.height * 100));

            onUpdateBlockPosition(draggingBlock, {
              x: newX, y: newY,
              width: originalPosition.width,
              height: originalPosition.height,
            });
          }
        } else {
          const newX = originalPosition.x + (e.clientX - dragStart.x);
          const newY = originalPosition.y + (e.clientY - dragStart.y);
          onUpdateBlockPosition(draggingBlock, {
            x: newX, y: newY,
            width: originalPosition.width,
            height: originalPosition.height,
          });
        }

        dragRafId.current = null;
      });
    }
  }, [draggingBlock, dragStart, originalPosition, onUpdateBlockPosition, onMoveGroup, isCropperOpen, blocks, getParentAbsolutePosition]);

  // ⭐ VERSION CORRIGÉE DE handleResizeMove avec calcul des positions absolues
  const handleResizeMove = useCallback((e: MouseEvent, blockId: string, startData: any) => {
    if (isCropperOpen || resizeRafId.current) return;
    resizeRafId.current = requestAnimationFrame(() => {
      const dx = e.clientX - startData.startX;
      const dy = e.clientY - startData.startY;
      let newWidth = startData.startWidth, newHeight = startData.startHeight;
      let newX = startData.startXpos, newY = startData.startYpos;
      const MIN_PERCENT = 5, MIN_PX = 20;

      const block = blocks.find(b => b.id === blockId);
      const isChild = block?.parentId != null;

      if (isChild && block?.parentId) {
        // ✅ Résoudre la taille absolue du parent à n'importe quelle profondeur
        const parentAbs = getParentAbsolutePosition(block.parentId);
        if (parentAbs) {
          const pW = parentAbs.width, pH = parentAbs.height;
          const dpx = (dx / pW) * 100, dpy = (dy / pH) * 100;
          switch (startData.direction) {
            case 'se': newWidth = Math.max(MIN_PERCENT, startData.startWidth + dpx); newHeight = Math.max(MIN_PERCENT, startData.startHeight + dpy); break;
            case 'e':  newWidth = Math.max(MIN_PERCENT, startData.startWidth + dpx); break;
            case 's':  newHeight = Math.max(MIN_PERCENT, startData.startHeight + dpy); break;
            case 'ne': newWidth = Math.max(MIN_PERCENT, startData.startWidth + dpx); newHeight = Math.max(MIN_PERCENT, startData.startHeight - dpy); newY = startData.startYpos + dpy; break;
            case 'nw': newWidth = Math.max(MIN_PERCENT, startData.startWidth - dpx); newHeight = Math.max(MIN_PERCENT, startData.startHeight - dpy); newX = startData.startXpos + dpx; newY = startData.startYpos + dpy; break;
            case 'sw': newWidth = Math.max(MIN_PERCENT, startData.startWidth - dpx); newHeight = Math.max(MIN_PERCENT, startData.startHeight + dpy); newX = startData.startXpos + dpx; break;
            case 'n':  newHeight = Math.max(MIN_PERCENT, startData.startHeight - dpy); newY = startData.startYpos + dpy; break;
            case 'w':  newWidth = Math.max(MIN_PERCENT, startData.startWidth - dpx); newX = startData.startXpos + dpx; break;
          }
          newWidth = Math.max(MIN_PERCENT, Math.min(100 - newX, newWidth));
          newHeight = Math.max(MIN_PERCENT, Math.min(100 - newY, newHeight));
          newX = Math.max(0, Math.min(100 - newWidth, newX));
          newY = Math.max(0, Math.min(100 - newHeight, newY));
        }
      } else {
        switch (startData.direction) {
          case 'se': newWidth = Math.max(MIN_PX, startData.startWidth + dx); newHeight = Math.max(MIN_PX, startData.startHeight + dy); break;
          case 'e':  newWidth = Math.max(MIN_PX, startData.startWidth + dx); break;
          case 's':  newHeight = Math.max(MIN_PX, startData.startHeight + dy); break;
          case 'ne': newWidth = Math.max(MIN_PX, startData.startWidth + dx); newHeight = Math.max(MIN_PX, startData.startHeight - dy); newY = startData.startYpos + dy; break;
          case 'nw': newWidth = Math.max(MIN_PX, startData.startWidth - dx); newHeight = Math.max(MIN_PX, startData.startHeight - dy); newX = startData.startXpos + dx; newY = startData.startYpos + dy; break;
          case 'sw': newWidth = Math.max(MIN_PX, startData.startWidth - dx); newHeight = Math.max(MIN_PX, startData.startHeight + dy); newX = startData.startXpos + dx; break;
          case 'n':  newHeight = Math.max(MIN_PX, startData.startHeight - dy); newY = startData.startYpos + dy; break;
          case 'w':  newWidth = Math.max(MIN_PX, startData.startWidth - dx); newX = startData.startXpos + dx; break;
        }
      }

      const last = lastUpdateRef.current;
      if (!last || Math.abs(newX-last.x)>0.5 || Math.abs(newY-last.y)>0.5 || Math.abs(newWidth-last.width)>0.5 || Math.abs(newHeight-last.height)>0.5) {
        lastUpdateRef.current = { x: newX, y: newY, width: newWidth, height: newHeight };
        onUpdateBlockPosition(blockId, { x: newX, y: newY, width: newWidth, height: newHeight });
        setResizeForceUpdate(p => p + 1);
      }
      resizeRafId.current = null;
    });
  }, [onUpdateBlockPosition, isCropperOpen, blocks, getParentAbsolutePosition]);

  const handleMouseUp = useCallback(() => {
    if (dragRafId.current) { cancelAnimationFrame(dragRafId.current); dragRafId.current = null; }
    if (resizeRafId.current) { cancelAnimationFrame(resizeRafId.current); resizeRafId.current = null; }
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
    if (isCropperOpen) { e.stopPropagation(); return; }
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const isTextElement = ['H1','H2','H3','H4','P','BUTTON'].includes(target.tagName) ||
      target.classList?.contains('text-content') ||
      target.classList?.contains('prose') ||
      target.getAttribute?.('contenteditable') === 'true';
    const isParentBlock = ['banner','screen-banner','carousel-banner'].includes(block.type);

    if (isParentBlock) {
      handleSelectBlockWithGroup(blockId, 'background');
      return;
    }
    handleSelectBlockWithGroup(blockId, isTextElement ? 'text' : 'background');
  };

  const handleCanvasClick = () => {
    if (isCropperOpen) return;
    setSelectedGroupId(null);
    onSelectBackground();
  };

  // ⭐ Les carousel-slide ne sont PAS draggables dans le canvas (elles sont fixes)
  const handleMouseDown = (e: React.MouseEvent, blockId: string, block: any) => {
    if (isCropperOpen) { e.stopPropagation(); return; }

    // Les carousel-slide ne sont pas draggables (elles restent attachées au carousel)
    if (block.type === 'carousel-slide') return;

    e.stopPropagation();
    setDraggingBlock(blockId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setOriginalPosition({ x: block.position.x, y: block.position.y, width: block.position.width, height: block.position.height });
  };

  const handleResizeStart = (e: React.MouseEvent, blockId: string, block: any, direction: string) => {
    if (isCropperOpen) { e.stopPropagation(); return; }
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizingBlock(blockId);
    setResizeDirection(direction);
    setDragStart({ x: e.clientX, y: e.clientY });
    setOriginalPosition({ ...block.position });

    const startData = {
      startX: e.clientX, startY: e.clientY,
      startWidth: block.position.width, startHeight: block.position.height,
      startXpos: block.position.x, startYpos: block.position.y,
      direction,
    };
    const onMove = (me: MouseEvent) => handleResizeMove(me, blockId, startData);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (resizeRafId.current) { cancelAnimationFrame(resizeRafId.current); resizeRafId.current = null; }
      setIsResizing(false);
      setResizingBlock(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleTextDoubleClick = (e: React.MouseEvent, blockId: string) => {
    if (isCropperOpen) return;
    e.stopPropagation();
    setEditingTextId(blockId);
    handleSelectBlockWithGroup(blockId, 'text');
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

  // ⭐ RENDER BLOCK
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
        handleSelectBlockWithGroup(block.id, 'background');
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
      return null;
    }

    const isParentBlock = ['banner', 'screen-banner', 'carousel-banner'].includes(block.type);
    
    if (isParentBlock) {
      const slideBlocks = block.type === 'carousel-banner'
        ? getChildren(block.id).filter(c => c.type === 'carousel-slide').sort((a, b) => (a.order || 0) - (b.order || 0))
        : [];
      
      const activeSlideIndex = block.props?.currentIndex ?? 0;
      const activeSlideId = slideBlocks[activeSlideIndex]?.id;
      
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
                handleSelectBlockWithGroup(block.id, 'background');
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
              {block.type === 'carousel-banner' ? (
                <CarouselBannerBlock
                  key={`${block.id}-${resizeForceUpdate}`}
                  {...commonProps}
                  childBlocks={slideBlocks}
                  onAddSlide={onAddSlide ? () => onAddSlide(block.id) : undefined}
                  shopId={shop?.id}
                />
              ) : (
                renderParentContent(block, commonProps)
              )}
              
              {block.type === 'carousel-banner' && slideBlocks.map(slide => {
                const slideChildren = getChildren(slide.id).filter(c => c.type !== 'carousel-slide');
                const isActiveSlide = slide.id === activeSlideId;
                if (!isActiveSlide) return null;
                
                return slideChildren.map(child => (
                  <div
                    key={`slide-child-${child.id}`}
                    data-block-id={child.id}
                    style={{
                      position: 'absolute',
                      left: `${child.position.x}%`,
                      top: `${child.position.y}%`,
                      width: `${child.position.width}%`,
                      height: child.position.height === 0 ? 'auto' : `${child.position.height}%`,
                      minHeight: '30px',
                      pointerEvents: 'auto',
                      zIndex: child.position.zIndex,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectBlockWithGroup(child.id, 'text');
                    }}
                  >
                    {renderBlock(child, true)}
                  </div>
                ));
              })}
              
              {children.filter(c => c.type !== 'carousel-slide').length > 0 && (
                <div 
                  className="absolute inset-0"
                  style={{ pointerEvents: 'none' }}
                >
                  {children.filter(c => c.type !== 'carousel-slide').map(child => {
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
                          handleSelectBlockWithGroup(child.id, 'text');
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
                      handleSelectBlockWithGroup(child.id, 'text');
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
  }, [blocks, selectedBlockId, editingTextId, isCropperOpen, isResizing, getChildren, resizeForceUpdate, shop, customization, onUpdateBlock, onDeleteBlock, onDuplicateBlock, onUpdateBlockPosition, onAddSlide]);

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

  const sortedBlocks = [...blocks].sort((a, b) => (a.position?.zIndex || 0) - (b.position?.zIndex || 0));
  const rootBlocks = sortedBlocks.filter(block => !block.parentId && block.type !== 'group');

  return (
    <div 
      ref={canvasContainerRef}
      className={`relative w-full min-h-screen ${isBackgroundSelected ? 'ring-4 ring-primary ring-offset-4 rounded-lg' : ''}`}
      onClick={handleCanvasClick}
    >
      <div style={backgroundStyle} />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', width: '100%' }}>
        {rootBlocks.map(block => renderBlock(block))}
      </div>
      
      {selectedGroupId && groupBounds && onResizeGroup && (
        <GroupOverlay
          groupId={selectedGroupId}
          bounds={groupBounds}
          containerRef={canvasContainerRef}
          isSelected={true}
          onResize={handleGroupResize}
          onResizeStart={handleGroupResizeStart}
          onResizeEnd={handleGroupResizeEnd}
        />
      )}
    </div>
  );
}