'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiMenu, FiMaximize2, FiColumns, FiPlus, FiEye, FiEyeOff, FiTrash2, FiCompass } from 'react-icons/fi';
import { NAVBAR_TEMPLATES, NavbarTemplate } from './lib/navbar/navbarTemplates';

interface Props {
  navbarBlocks: any[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
  onAddNavbar?: (type: string, props: any) => void;
}

const VARIANT_ICONS: Record<string, any> = { horizontal: FiMenu, hero: FiMaximize2, sidebar: FiColumns };
const VARIANT_LABELS: Record<string, string> = { horizontal: 'Horizontale', hero: 'Hero', sidebar: 'Verticale' };

export default function GlobalNavbarsBar({
  navbarBlocks,
  selectedBlockId,
  onSelectBlock,
  onToggleVisibility,
  onDeleteBlock,
  onAddNavbar,
}: Props) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAddMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setShowAddMenu(false);
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showAddMenu]);

  const handleAddNavbar = (tpl: NavbarTemplate) => {
    onAddNavbar?.(`navbar-${tpl.variant}`, { navConfig: tpl.createDefaultConfig() });
    setShowAddMenu(false);
  };

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-3 h-10 border-b border-white/10 bg-[#0d0e14]">
      <div className="flex items-center gap-1.5 text-gray-400 flex-shrink-0">
        <FiCompass size={13} />
        <span className="text-[11px] font-medium uppercase tracking-wide">Navigation</span>
      </div>

      {navbarBlocks.length > 0 && (
        <>
          <div className="w-px h-4 bg-white/10 flex-shrink-0" />
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
            {navbarBlocks.map(block => {
              const variant = block.props?.navConfig?.variant || 'horizontal';
              const Icon = VARIANT_ICONS[variant] || FiMenu;
              const isSelected = selectedBlockId === block.id;
              const isHidden = block.isVisible === false;

              return (
                <div
                  key={block.id}
                  className={`group flex items-center gap-1 pl-2 pr-1 h-7 rounded-md border flex-shrink-0 cursor-pointer transition-colors
                    ${isSelected
                      ? 'bg-primary/15 border-primary/40 shadow-[0_0_10px_rgba(139,92,246,0.25)]'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07]'}
                    ${isHidden ? 'opacity-50' : ''}`}
                  onClick={() => onSelectBlock(block.id)}
                >
                  <Icon size={12} className={isSelected ? 'text-primary' : 'text-gray-400'} />
                  <span className={`text-[11px] whitespace-nowrap ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {VARIANT_LABELS[variant] || variant}
                  </span>
                  <button
                    title={isHidden ? 'Afficher sur le site' : 'Masquer sur le site'}
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(block.id); }}
                    className="ml-1 p-1 rounded text-gray-500 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isHidden ? <FiEyeOff size={11} /> : <FiEye size={11} />}
                  </button>
                  <button
                    title="Supprimer"
                    onClick={(e) => { e.stopPropagation(); onDeleteBlock?.(block.id); }}
                    className="p-1 rounded text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {navbarBlocks.length === 0 && (
        <span className="text-[11px] text-gray-500">Aucune navigation configurée</span>
      )}

      <div className="relative flex-shrink-0 ml-auto" ref={addMenuRef}>
        <button
          onClick={() => setShowAddMenu(v => !v)}
          title="Ajouter une navbar"
          className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <FiPlus size={14} />
        </button>
        {showAddMenu && (
          <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#15161f] border border-white/10 rounded-lg shadow-xl shadow-black/40 z-50 p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
            {NAVBAR_TEMPLATES.map(tpl => {
              const Icon = VARIANT_ICONS[tpl.variant] || FiMenu;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleAddNavbar(tpl)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-white/[0.06] text-left transition-colors"
                >
                  <div className="p-1.5 bg-purple-500/15 rounded-md flex-shrink-0">
                    <Icon size={14} className="text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-xs font-medium">{tpl.label}</div>
                    <div className="text-gray-500 text-[10px] truncate">{tpl.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}