'use client';
import React from 'react';
import NavbarBlockRenderer from './blocks/navbar/NavbarBlockRenderer';
import { StudioPage } from '@/types/studio';

interface Props {
  navbarBlocks: any[];          // tous les blocs navbar globaux (identiques sur toutes les pages)
  pages: StudioPage[];
  pageId: string;                // page du frame courant (pour l'état "actif" des liens)
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

const isSidebarVariant = (block: any) => block.props?.navConfig?.variant === 'sidebar';

// Rendu in-context : la Navbar apparaît exactement où elle sera visible sur le site,
// dans chaque frame de page. Comme c'est le même bloc global partout, la sélectionner
// dans une frame la surligne dans toutes — ce qui illustre bien sa nature "globale".
export default function PageGlobalNavbars({ navbarBlocks, pages, pageId, selectedBlockId, onSelectBlock }: Props) {
  if (navbarBlocks.length === 0) return null;

  const sorted = [...navbarBlocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const topBlocks = sorted.filter(b => !isSidebarVariant(b));      // horizontal / hero — en flux
  const overlayBlocks = sorted.filter(isSidebarVariant);            // sidebar — en overlay

  return (
    <>
      {topBlocks.map(block => (
        <div key={block.id} className="relative group">
          <NavbarBlockRenderer
            mode="studio"
            navConfig={block.props?.navConfig}
            pages={pages}
            isSelected={selectedBlockId === block.id}
            currentPageId={pageId}
            onSelect={() => onSelectBlock(block.id)}
            onSelectButton={() => onSelectBlock(block.id)}
          />
          {/* Repère discret : rappelle que ce bloc est partagé entre toutes les pages */}
          <div
            className={`absolute -top-2 left-3 px-1.5 py-0.5 rounded bg-purple-500 text-white text-[9px] font-medium leading-none pointer-events-none transition-opacity
              ${selectedBlockId === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            Globale
          </div>
        </div>
      ))}

      {overlayBlocks.map(block => {
        const sb = block.props?.navConfig?.sidebar;
        const side = sb?.position === 'right' ? 'right' : 'left';
        return (
          <div key={block.id} className="absolute top-0 bottom-0 z-40" style={{ [side]: 0 }}>
            <NavbarBlockRenderer
              mode="studio"
              navConfig={block.props?.navConfig}
              pages={pages}
              isSelected={selectedBlockId === block.id}
              currentPageId={pageId}
              onSelect={() => onSelectBlock(block.id)}
              onSelectButton={() => onSelectBlock(block.id)}
            />
          </div>
        );
      })}
    </>
  );
}