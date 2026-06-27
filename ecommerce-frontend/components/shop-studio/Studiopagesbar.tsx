'use client';

import React, { useState } from 'react';
import type { BlockUI, StudioPage } from './StudioLayout';

interface StudioPagesBarProps {
  pages: StudioPage[];
  currentPageId: string;
  allBlocks: BlockUI[];
  backgroundColor?: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  // ⭐ NOUVEAU : prop pour dupliquer une page
  onDuplicatePage?: (pageId: string) => void;
}

const THUMB_W = 96;
const THUMB_H = 60;
const BASE_CANVAS_W = 1200;
const BASE_CANVAS_H = 800;

const TYPE_COLORS: Record<string, string> = {
  banner: '#60a5fa',
  'screen-banner': '#60a5fa',
  'carousel-banner': '#818cf8',
  title: '#f59e0b',
  text: '#34d399',
  image: '#f472b6',
  button: '#fb923c',
  shape: '#a78bfa',
  products: '#22d3ee',
  logo: '#94a3b8',
  spacer: 'transparent',
};

interface MiniPreviewProps {
  blocks: BlockUI[];
  backgroundColor?: string;
  page?: StudioPage;
}

function MiniPreview({ blocks, backgroundColor, page }: MiniPreviewProps) {
  const scaleX = THUMB_W / BASE_CANVAS_W;
  const scaleY = THUMB_H / BASE_CANVAS_H;
  const rootBlocks = blocks.filter(b => !b.parentId && b.type !== 'group');

  // Utiliser le backgroundColor du page si fourni, sinon le backgroundColor passé en prop
  const bgColor = page?.backgroundColor ?? backgroundColor ?? '#ffffff';

  return (
    <div
      className="relative overflow-hidden rounded-md"
      style={{ width: THUMB_W, height: THUMB_H, backgroundColor: bgColor }}
    >
      {rootBlocks.map(b => {
        const pos = b.position || { x: 0, y: 0, width: 100, height: 40 };
        return (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: Math.max(0, pos.x * scaleX),
              top: Math.max(0, pos.y * scaleY),
              width: Math.max(2, pos.width * scaleX),
              height: Math.max(2, (pos.height || 20) * scaleY),
              backgroundColor: TYPE_COLORS[b.type] || '#9ca3af',
              borderRadius: 1,
              opacity: 0.85,
            }}
          />
        );
      })}
    </div>
  );
}

export default function StudioPagesBar({
  pages,
  currentPageId,
  allBlocks,
  backgroundColor,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
}: StudioPagesBarProps) {
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);
  const [pageToDelete, setPageToDelete] = useState<StudioPage | null>(null);
  const [pageToDuplicate, setPageToDuplicate] = useState<StudioPage | null>(null);

  const sortedPages = [...pages].sort((a, b) => a.order - b.order);

  return (
    <>
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-end gap-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl px-3 py-2 shadow-2xl overflow-x-auto"
        style={{ maxWidth: '90vw' }}
      >
        {sortedPages.map(page => {
          const isActive = page.id === currentPageId;
          const isHovered = hoveredPageId === page.id;
          const pageBlocks = allBlocks.filter(b => (b.pageId || sortedPages[0]?.id) === page.id);

          return (
            <div
              key={page.id}
              className="flex flex-col items-center gap-1 shrink-0"
              onMouseEnter={() => setHoveredPageId(page.id)}
              onMouseLeave={() => setHoveredPageId(null)}
            >
              <div
                className="relative cursor-pointer transition-transform"
                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                onClick={() => onSelectPage(page.id)}
              >
                <div
                  className={`rounded-md transition-all ${
                    isActive
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-gray-900'
                      : isHovered
                      ? 'ring-2 ring-gray-400'
                      : 'ring-1 ring-gray-700'
                  }`}
                >
                  <MiniPreview 
                    blocks={pageBlocks} 
                    backgroundColor={backgroundColor} 
                    page={page}
                  />
                </div>

                {/* ⭐ Bouton Dupliquer */}
                {sortedPages.length > 0 && onDuplicatePage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPageToDuplicate(page);
                    }}
                    className={`absolute -top-2 -right-7 w-5 h-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center text-xs leading-none transition-opacity ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                    title="Dupliquer cette page"
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="6" y="6" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                )}

                {/* ⭐ Bouton Supprimer */}
                {sortedPages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPageToDelete(page);
                    }}
                    className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs leading-none transition-opacity ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                    title="Supprimer cette page"
                  >
                    ✕
                  </button>
                )}
              </div>

              <span
                className={`text-xs truncate max-w-[96px] ${
                  isActive ? 'text-white font-medium' : 'text-gray-400'
                }`}
              >
                {page.name}
              </span>
            </div>
          );
        })}

        <button
          onClick={onAddPage}
          className="flex flex-col items-center justify-center gap-1 shrink-0"
          title="Ajouter une page"
        >
          <div
            className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-600 hover:border-primary hover:bg-gray-800 transition-colors text-gray-400 hover:text-primary text-xl font-bold"
            style={{ width: THUMB_W, height: THUMB_H }}
          >
            +
          </div>
          <span className="text-xs text-gray-500">Ajouter</span>
        </button>
      </div>

      {/* ⭐ Modal de confirmation pour la suppression */}
      {pageToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Supprimer « {pageToDelete.name} » ?</h3>
            <p className="text-gray-400 text-sm mb-5">
              Cette action est irréversible. Tous les blocs de cette page seront définitivement supprimés.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPageToDelete(null)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeletePage(pageToDelete.id);
                  setPageToDelete(null);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ Modal de confirmation pour la duplication */}
      {pageToDuplicate && onDuplicatePage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Dupliquer « {pageToDuplicate.name} » ?</h3>
            <p className="text-gray-400 text-sm mb-5">
              Une copie de cette page sera créée avec tous ses blocs.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPageToDuplicate(null)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDuplicatePage(pageToDuplicate.id);
                  setPageToDuplicate(null);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                Dupliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}