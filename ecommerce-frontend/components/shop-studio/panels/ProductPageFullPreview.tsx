'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiMaximize2, FiX } from 'react-icons/fi';
import { ProductPageConfig, generateProductPageBlocks } from '@/types/Productpage';
import { BlockUI } from '@/types/studio';

const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 900;

/* ──────────────────────────────────────────────────────────────────────────
 * Rendus miniatures FIDÈLES aux vrais blocs (ImageBlock/TextBlock/TitleBlock/
 * ButtonBlock). C'est ce qui garantit que cet aperçu == ce qui sera généré :
 * on appelle la VRAIE fonction generateProductPageBlocks, puis on affiche
 * chaque bloc avec exactement la même logique de style que les vrais
 * composants (mode "pastille" pour les badges, cadrage des images, etc.)
 * ────────────────────────────────────────────────────────────────────────── */

function MiniShape({ props }: { props: any }) {
  const isGradientBg = typeof props?.backgroundColor === 'string' && props.backgroundColor.includes('gradient');
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        ...(isGradientBg ? { background: props.backgroundColor } : { backgroundColor: props?.backgroundColor || 'transparent' }),
        opacity: props?.opacity !== undefined ? props.opacity / 100 : 1,
        borderRadius: props?.borderRadius ? `${props.borderRadius}px` : 0,
        boxSizing: 'border-box',
      }}
    />
  );
}

function MiniImage({ props }: { props: any }) {
  const src = props?.src || props?.url || props?.imageUrl || props?.image || '';
  const fit = props?.objectFit || 'cover';
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: props?.borderRadius ? `${props.borderRadius}px` : 0,
        overflow: 'hidden',
        backgroundColor: props?.backgroundColor || '#f0f0f0',
        border: props?.border || 'none',
        opacity: props?.opacity !== undefined ? props.opacity / 100 : 1,
        boxSizing: 'border-box',
      }}
    >
      {src ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, objectPosition: 'center', display: 'block' }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">Image</div>
      )}
    </div>
  );
}

function MiniText({ props }: { props: any }) {
  const isPill = props?.borderRadius !== undefined || props?.paddingX !== undefined || props?.paddingY !== undefined;
  const isGradientText = props?.textGradient && props.textGradient !== '';

  const justify = props?.textAlign === 'left' ? 'flex-start' : props?.textAlign === 'right' ? 'flex-end' : (isPill ? 'flex-start' : 'center');

  const baseStyle: React.CSSProperties = {
    fontSize: `${props?.fontSize || 16}px`,
    fontWeight: props?.fontWeight || '400',
    fontFamily: props?.fontFamily || 'Inter',
    textAlign: props?.textAlign || 'left',
    lineHeight: props?.lineHeight || 1.5,
    letterSpacing: props?.letterSpacing !== undefined ? `${props.letterSpacing}px` : undefined,
    margin: 0,
    color: isGradientText ? 'transparent' : (props?.textColor || '#000000'),
    backgroundImage: isGradientText ? props.textGradient : undefined,
    backgroundClip: isGradientText ? ('text' as any) : undefined,
    WebkitBackgroundClip: isGradientText ? ('text' as any) : undefined,
  };

  const style: React.CSSProperties = isPill
    ? {
        ...baseStyle,
        display: 'inline-block',
        width: 'fit-content',
        whiteSpace: 'nowrap',
        backgroundColor: props?.backgroundColor || 'transparent',
        borderRadius: `${props?.borderRadius ?? 999}px`,
        padding: `${props?.paddingY ?? 4}px ${props?.paddingX ?? 10}px`,
        boxSizing: 'border-box',
      }
    : {
        ...baseStyle,
        width: '100%',
        backgroundColor: props?.backgroundColor || 'transparent',
        wordBreak: 'break-word',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 6,
        WebkitBoxOrient: 'vertical' as any,
      };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: justify }}>
      <div style={style}>{props?.content}</div>
    </div>
  );
}

function MiniTitle({ props }: { props: any }) {
  const text = props?.title || props?.text || props?.content || '';
  const justify = props?.textAlign === 'left' ? 'flex-start' : props?.textAlign === 'right' ? 'flex-end' : 'center';
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: justify }}>
      <div
        style={{
          width: '100%',
          fontSize: `${props?.fontSize || 32}px`,
          fontWeight: props?.fontWeight || '700',
          fontFamily: props?.fontFamily || 'Poppins',
          textAlign: props?.textAlign || 'center',
          lineHeight: props?.lineHeight || 1.2,
          color: props?.textColor || '#ffffff',
          letterSpacing: props?.letterSpacing !== undefined ? `${props.letterSpacing}px` : undefined,
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </div>
    </div>
  );
}

function MiniButton({ props }: { props: any }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: props?.backgroundColor || '#111111',
        color: props?.textColor || '#ffffff',
        fontSize: `${props?.fontSize || 15}px`,
        fontFamily: props?.fontFamily || 'Inter',
        fontWeight: props?.fontWeight || '600',
        borderRadius: `${props?.borderRadius ?? 8}px`,
        border: props?.border || 'none',
        letterSpacing: props?.letterSpacing !== undefined ? `${props.letterSpacing}px` : undefined,
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
      }}
    >
      {props?.text}
    </div>
  );
}

function renderMiniBlock(block: BlockUI) {
  const { position, props, type } = block;
  if (!position) return null;
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: position.width,
    height: position.height,
    zIndex: position.zIndex,
  };
  let content: React.ReactNode;
  switch (type) {
    case 'shape': content = <MiniShape props={props} />; break;
    case 'image': content = <MiniImage props={props} />; break;
    case 'text': content = <MiniText props={props} />; break;
    case 'title': content = <MiniTitle props={props} />; break;
    case 'button': content = <MiniButton props={props} />; break;
    default: return null;
  }
  return (
    <div key={block.id} style={wrapperStyle}>
      {content}
    </div>
  );
}

function PageRender({ config, width }: { config: ProductPageConfig; width: number }) {
  const blocks = generateProductPageBlocks(config, 'preview', 1).sort(
    (a, b) => (a.position?.zIndex ?? 0) - (b.position?.zIndex ?? 0)
  );
  const scale = width / PAGE_WIDTH;
  const height = PAGE_HEIGHT * scale;

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black" style={{ width, height }}>
      <div style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative' }}>
        {blocks.map(renderMiniBlock)}
      </div>
    </div>
  );
}

export default function ProductPageFullPreview({ config, width = 264 }: { config: ProductPageConfig; width?: number }) {
  const [expanded, setExpanded] = useState(false);

  if (!config.product) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-gray-800/50 border border-gray-700/30" style={{ width, height: width * (PAGE_HEIGHT / PAGE_WIDTH) }}>
        <span className="text-gray-500 text-sm">Sélectionnez un produit</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <PageRender config={config} width={width} />
        <button
          onClick={() => setExpanded(true)}
          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Agrandir l'aperçu"
        >
          <FiMaximize2 size={13} />
        </button>
      </div>

      {expanded && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setExpanded(false)}
        >
          <div onClick={e => e.stopPropagation()} className="relative">
            <PageRender config={config} width={Math.min(900, window.innerWidth - 80)} />
            <button
              onClick={() => setExpanded(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}