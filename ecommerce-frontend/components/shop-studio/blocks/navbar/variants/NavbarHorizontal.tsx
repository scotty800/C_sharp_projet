'use client';
import React from 'react';
import { NavbarRendererProps } from '../NavbarBlockRenderer';
import NavButtonRenderer from '../NavButtonRenderer';

export default function NavbarHorizontal({ 
  navConfig, 
  pages, 
  mode, 
  isSelected, 
  currentPageId, 
  onSelect, 
  onSelectButton,
  onNavigatePage // ⭐ NOUVEAU
}: NavbarRendererProps) {
  const sortedButtons = [...navConfig.buttons].sort((a, b) => a.order - b.order);

  const containerStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center',
    justifyContent: navConfig.alignment === 'center' ? 'center' : navConfig.alignment === 'right' ? 'flex-end' : navConfig.alignment === 'space-between' ? 'space-between' : 'flex-start',
    gap: navConfig.gap ?? 24,
    padding: '12px 32px',
    backgroundColor: navConfig.backgroundType === 'gradient' ? undefined : (navConfig.backgroundColor || '#ffffff'),
    backgroundImage: navConfig.backgroundType === 'gradient' ? navConfig.backgroundValue : undefined,
    borderBottom: navConfig.borderBottomWidth ? `${navConfig.borderBottomWidth}px solid ${navConfig.borderBottomColor || '#e5e7eb'}` : undefined,
    position: mode === 'shop' && navConfig.sticky ? 'sticky' : 'relative', // ⚠️ le "sticky" n'a de sens visuel qu'en mode shop (flux de page normal)
    top: 0, zIndex: 40, width: '100%', boxSizing: 'border-box',
  };

  return (
    <div 
      style={containerStyle} 
      className={isSelected ? 'ring-2 ring-primary' : undefined} 
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
    >
      {navConfig.showLogo && navConfig.logoUrl && <img src={navConfig.logoUrl} alt="logo" style={{ height: 32, marginRight: 'auto' }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: navConfig.gap ?? 24, flexWrap: 'wrap' }}>
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
            onNavigatePage={onNavigatePage} // ⭐ PASSAGE DU CALLBACK
          />
        ))}
      </div>
    </div>
  );
}