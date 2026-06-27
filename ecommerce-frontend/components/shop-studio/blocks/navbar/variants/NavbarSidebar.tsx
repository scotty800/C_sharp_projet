'use client';
import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { NavbarRendererProps } from '../NavbarBlockRenderer';
import NavButtonRenderer from '../NavButtonRenderer';

export default function NavbarSidebar({ 
  navConfig, 
  pages, 
  mode, 
  isSelected, 
  currentPageId, 
  onSelect, 
  onSelectButton,
  onNavigatePage
}: NavbarRendererProps) {
  const sb = navConfig.sidebar || {};
  const [isOpen, setIsOpen] = useState(sb.isOpenByDefault ?? false);
  const sortedButtons = [...navConfig.buttons].sort((a, b) => a.order - b.order);
  const isStudio = mode === 'studio';

  const open = isStudio ? true : isOpen;

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }} 
      className={isSelected ? 'ring-2 ring-primary' : undefined} 
      style={{ position: 'relative', height: isStudio ? '100%' : undefined }}
    >
      {!isStudio && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(o => !o); }}
          style={{ 
            position: 'fixed', 
            top: 16, 
            [sb.position === 'right' ? 'right' : 'left']: 16, 
            zIndex: 60, 
            background: sb.toggleButtonColor || '#111827', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            padding: 8, 
            cursor: 'pointer' 
          }}
        >
          {open ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>
      )}

      <div
        style={{
          position: isStudio ? 'relative' : 'fixed',
          top: 0, 
          [sb.position === 'right' ? 'right' : 'left']: 0, 
          bottom: isStudio ? undefined : 0,
          height: isStudio ? '100%' : undefined,
          width: sb.width ?? 280,
          backgroundColor: navConfig.backgroundColor || '#111827',
          display: 'flex', 
          flexDirection: 'column', 
          gap: navConfig.gap ?? 4,
          padding: '64px 16px 16px',
          transform: open ? 'translateX(0)' : `translateX(${sb.position === 'right' ? '100%' : '-100%'})`,
          transition: 'transform 250ms ease',
          zIndex: 55,
        }}
      >
        {sortedButtons.map(btn => (
          <NavButtonRenderer
            key={btn.id}
            button={btn}
            style={{ ...navConfig.defaultButtonStyle, ...btn.style }}
            animation={{ ...navConfig.defaultButtonAnimation, ...btn.animation }}
            pages={pages}
            isActive={btn.isActiveOverride || (btn.link.type === 'page' && btn.link.pageId === currentPageId)}
            mode={mode}
            onSelectInStudio={() => onSelectButton?.(btn.id)}
            onNavigatePage={onNavigatePage}
          />
        ))}
      </div>

      {!isStudio && open && sb.overlayOnMobile && (
        <div 
          onClick={() => setIsOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }} 
        />
      )}
    </div>
  );
}