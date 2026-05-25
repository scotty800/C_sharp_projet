'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  isResizing?: boolean;
  shopId?: number;
  childBlocks?: any[];
  onAddSlide?: () => void;
  renderBlock?: (block: any) => React.ReactNode;
}

export function CarouselBannerBlock({
  shop,
  block,
  customization,
  isSelected,
  onSelect,
  onUpdate,
  isResizing = false,
  shopId,
  childBlocks = [],
  onAddSlide,
  renderBlock,
}: Props) {
  const { props } = block;

  // Les slides sont les blocs enfants de type 'carousel-slide'
  const slideBlocks = childBlocks.filter((b) => b.type === 'carousel-slide');

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    return props.currentIndex ?? 0;
  });

  const [isHovered, setIsHovered] = useState(false);
  const lastSavedIndex = useRef(currentIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const autoPlay = props.autoPlay !== false && slideBlocks.length > 1;
  const intervalTime = props.intervalTime || 5000;
  const showArrows = props.showArrows !== false && slideBlocks.length > 1;
  const showDots = props.showDots !== false && slideBlocks.length > 1;
  const transitionEffect = props.transitionEffect || 'fade';
  const transitionDuration = 500;

  // Clamp index si des slides sont supprimées
  const safeIndex = Math.min(currentIndex, Math.max(0, slideBlocks.length - 1));
  useEffect(() => {
    if (safeIndex !== currentIndex) setCurrentIndex(safeIndex);
  }, [safeIndex, currentIndex]);

  // Persister l'index courant dans les props du bloc
  useEffect(() => {
    if (lastSavedIndex.current !== safeIndex) {
      lastSavedIndex.current = safeIndex;
      onUpdate({ currentIndex: safeIndex });
    }
  }, [safeIndex, onUpdate]);

  // Émettre l'événement pour ColorsPanel
  useEffect(() => {
    const event = new CustomEvent('carouselIndexChange', { detail: safeIndex });
    window.dispatchEvent(event);
  }, [safeIndex]);

  // Autoplay
  useEffect(() => {
    if (!autoPlay || slideBlocks.length <= 1 || isHovered || isResizing) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev: number) => (prev + 1) % slideBlocks.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [autoPlay, slideBlocks.length, intervalTime, isHovered, isResizing]);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev: number) => (prev - 1 + slideBlocks.length) % slideBlocks.length);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev: number) => (prev + 1) % slideBlocks.length);
  };

  const goToSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  // État vide
  if (slideBlocks.length === 0) {
    return (
      <div
        className={`relative w-full h-full flex items-center justify-center bg-gray-800 ${
          isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
        }`}
        onClick={onSelect}
      >
        <div className="text-center text-gray-400 p-6">
          <div className="text-5xl mb-3">🎠</div>
          <p className="text-sm font-medium text-gray-300 mb-1">Carrousel vide</p>
          <p className="text-xs text-gray-500 mb-4">
            Ajoutez des slides puis glissez-y vos blocs (titre, texte, image…)
          </p>
          {onAddSlide && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddSlide(); }}
              className="px-4 py-2 bg-primary text-white text-xs rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-1 mx-auto"
            >
              <FiPlus size={14} /> Ajouter une slide
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Slides ── */}
      {slideBlocks.map((slideBlock, idx) => {
        const slideProps = slideBlock.props || {};
        const isActive = idx === safeIndex;
        const prevIdx = (safeIndex - 1 + slideBlocks.length) % slideBlocks.length;
        const nextIdx = (safeIndex + 1) % slideBlocks.length;

        // Fond de la slide
        let backgroundStyle: React.CSSProperties = {};
        if (slideProps.backgroundType === 'gradient' && slideProps.backgroundValue) {
          backgroundStyle = { background: slideProps.backgroundValue };
        } else if (slideProps.backgroundColor && slideProps.backgroundColor !== 'transparent') {
          backgroundStyle = { backgroundColor: slideProps.backgroundColor };
        } else {
          backgroundStyle = { backgroundColor: customization?.primaryColor || '#1a1a2e' };
        }

        // Transition
        let transitionStyle: React.CSSProperties = {};
        if (transitionEffect === 'fade') {
          transitionStyle = {
            opacity: isActive ? 1 : 0,
            transition: `opacity ${transitionDuration}ms ease-in-out`,
            pointerEvents: isActive ? 'auto' : 'none',
          };
        } else {
          if (isActive) {
            transitionStyle = { transform: 'translateX(0)', transition: `transform ${transitionDuration}ms ease-in-out` };
          } else if (idx === prevIdx) {
            transitionStyle = { transform: 'translateX(-100%)', transition: `transform ${transitionDuration}ms ease-in-out`, pointerEvents: 'none' };
          } else if (idx === nextIdx) {
            transitionStyle = { transform: 'translateX(100%)', transition: `transform ${transitionDuration}ms ease-in-out`, pointerEvents: 'none' };
          } else {
            transitionStyle = { transform: 'translateX(100%)', transition: 'none', pointerEvents: 'none', display: 'none' };
          }
        }

        return (
          <div
            key={slideBlock.id}
            className="absolute inset-0 w-full h-full"
            style={{ ...backgroundStyle, ...transitionStyle }}
          >
            {/* Image de fond de la slide */}
            {slideProps.backgroundImage && (
              <img
                src={slideProps.backgroundImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ opacity: (slideProps.backgroundImageOpacity ?? 100) / 100 }}
              />
            )}

            {/* Overlay */}
            {slideProps.overlayOpacity > 0 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: slideProps.overlayColor || '#000000',
                  opacity: (slideProps.overlayOpacity ?? 0) / 100,
                }}
              />
            )}

            {/* ── Blocs enfants de CETTE slide ── */}
            {/* Le canvas parent se charge du rendu via renderBlock,
                mais on expose seulement les enfants de la slide active.
                Le StudioCanvas filtre via isSlideActive prop. */}
            {isActive && renderBlock && (
              <div className="absolute inset-0">
                {/* renderBlock est appelé par StudioCanvas pour chaque enfant */}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Flèches ── */}
      {showArrows && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <FiChevronLeft size={22} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <FiChevronRight size={22} />
          </button>
        </>
      )}

      {/* ── Dots ── */}
      {showDots && (
        <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
          {slideBlocks.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => goToSlide(e, idx)}
              className={`transition-all rounded-full ${
                idx === safeIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Toolbar (quand sélectionné) ── */}
      {isSelected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 rounded-lg shadow-lg z-40 flex gap-1 p-1 whitespace-nowrap">
          {onAddSlide && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddSlide(); }}
              className="px-3 py-1 bg-primary text-white text-xs rounded flex items-center gap-1 hover:bg-primary/80 transition-colors"
            >
              <FiPlus size={12} /> Slide
            </button>
          )}
          <span className="px-2 py-1 text-gray-400 text-xs self-center">
            {safeIndex + 1} / {slideBlocks.length}
          </span>
        </div>
      )}
    </div>
  );
}