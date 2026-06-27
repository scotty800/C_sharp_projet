'use client';
import React from 'react';
import { NavbarRendererProps } from '../NavbarBlockRenderer';
import NavButtonRenderer from '../NavButtonRenderer';

export default function NavbarHero({ 
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
  const hero = navConfig.hero || {};

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      className={isSelected ? 'ring-2 ring-primary' : undefined}
      style={{
        minHeight: hero.height ?? 140,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '24px 32px',
        backgroundColor: navConfig.backgroundType === 'gradient' ? undefined : (navConfig.backgroundColor || '#111827'),
        backgroundImage: navConfig.backgroundType === 'gradient' ? navConfig.backgroundValue : undefined,
        width: '100%', boxSizing: 'border-box',
      }}
    >
      {navConfig.showLogo && navConfig.logoUrl && <img src={navConfig.logoUrl} alt="logo" style={{ height: 40 }} />}
      {hero.showTagline && hero.tagline && <p style={{ color: '#9ca3af', fontSize: 14 }}>{hero.tagline}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: navConfig.gap ?? 32, flexWrap: 'wrap', justifyContent: 'center' }}>
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