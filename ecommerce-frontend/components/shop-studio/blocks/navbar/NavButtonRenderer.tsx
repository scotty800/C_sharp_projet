'use client';
import React from 'react';
import { NavButton, NavButtonStyle, NavButtonAnimation, StudioPage } from '@/types/studio';
import { resolveNavLink } from './resolveNavLink';
import { NAV_ICON_PRESETS } from './navIcons';

interface Props {
  button: NavButton;
  style: NavButtonStyle;
  animation: NavButtonAnimation;
  pages: StudioPage[];
  isActive?: boolean;
  mode: 'studio' | 'preview' | 'shop';
  onSelectInStudio?: () => void;
  // ⭐ NOUVEAU : callback pour la navigation interne (preview/shop)
  onNavigatePage?: (pageId: string) => void;
}

export default function NavButtonRenderer({
  button,
  style,
  animation,
  pages,
  isActive,
  mode,
  onSelectInStudio,
  onNavigatePage, // ⭐ NOUVEAU
}: Props) {
  if (!button.isVisible) return null;

  // ⭐ Suppression de shopSlug dans l'appel de resolveNavLink
  const resolved = resolveNavLink(button, pages);
  const IconComp = button.icon?.type === 'preset' && button.icon.presetName ? NAV_ICON_PRESETS[button.icon.presetName] : null;
  const iconSize = (style.fontSize || 14) + 2;

  const renderIcon = () =>
    IconComp ? <IconComp size={iconSize} /> :
    button.icon?.type === 'custom' && button.icon.url ? <img src={button.icon.url} alt="" style={{ width: iconSize, height: iconSize }} /> : null;

  const computedStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: style.gapIcon ?? 6,
    color: isActive ? (style.textColorActive ?? style.textColor) : style.textColor,
    backgroundColor: isActive ? (style.backgroundColorActive ?? style.backgroundColor) : style.backgroundColor,
    fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight as any,
    letterSpacing: style.letterSpacing,
    borderWidth: style.borderWidth, borderStyle: style.borderWidth ? 'solid' : undefined,
    borderColor: isActive ? (style.borderColorHover ?? style.borderColor) : style.borderColor,
    borderRadius: style.borderRadius,
    padding: `${style.paddingY ?? 8}px ${style.paddingX ?? 14}px`,
    transitionProperty: 'color, background-color, border-color, transform, box-shadow',
    transitionDuration: `${animation.transitionDuration ?? 200}ms`,
    transitionTimingFunction: animation.transitionEasing || 'ease',
    cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
    opacity: resolved.isBroken && mode !== 'studio' ? 0.5 : 1,
  };

  const hoverClass = `navbtn-hover-${animation.hoverEffect || 'none'}`;
  const content = (
    <>
      {button.iconPosition !== 'right' && renderIcon()}
      {button.iconPosition !== 'only' && <span>{button.label}</span>}
      {button.iconPosition === 'right' && renderIcon()}
    </>
  );

  // ── Studio : on sélectionne pour éditer, on ne navigue jamais ──
  if (mode === 'studio') {
    return (
      <button
        type="button"
        className={hoverClass}
        style={computedStyle}
        onClick={(e) => { e.stopPropagation(); onSelectInStudio?.(); }}
        title={resolved.isBroken ? 'Lien cassé — choisissez une page dans les paramètres' : undefined}
      >
        {content}
        {resolved.isBroken && <span style={{ fontSize: 10 }}>⚠️</span>}
      </button>
    );
  }

  // ── Lien externe : vrai <a> ──
  if (resolved.kind === 'url' && resolved.href) {
    return (
      <a
        href={resolved.href}
        target={resolved.openInNewTab ? '_blank' : undefined}
        rel={resolved.openInNewTab ? 'noopener noreferrer' : undefined}
        className={hoverClass}
        style={computedStyle}
      >
        {content}
      </a>
    );
  }

  // ── Lien interne (page) : navigation en mémoire, pas d'URL dédiée ──
  if (resolved.kind === 'page' && !resolved.isBroken && resolved.pageId) {
    return (
      <button
        type="button"
        className={hoverClass}
        style={computedStyle}
        onClick={(e) => {
          e.preventDefault();
          onNavigatePage?.(resolved.pageId!);
        }}
      >
        {content}
      </button>
    );
  }

  // ── Fallback : lien cassé ou non résolu ──
  return (
    <span className={hoverClass} style={{ ...computedStyle, cursor: 'default', opacity: 0.5 }}>
      {content}
    </span>
  );
}