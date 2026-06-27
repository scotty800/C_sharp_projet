'use client';
import React, { useEffect } from 'react';
import { NavbarConfig, StudioPage } from '@/types/studio';
import { injectNavbarStyles } from './injectNavbarStyles';
import NavbarHorizontal from './variants/NavbarHorizontal';
import NavbarHero from './variants/NavbarHero';
import NavbarSidebar from './variants/NavbarSidebar';

// ⭐ NOUVELLE INTERFACE — suppression de shopSlug, ajout de onNavigatePage
export interface NavbarRendererProps {
  mode: 'studio' | 'preview' | 'shop';
  navConfig: NavbarConfig;
  pages: StudioPage[];
  isSelected?: boolean;
  currentPageId?: string;
  onSelect?: () => void;
  onSelectButton?: (buttonId: string) => void;
  // ⭐ NOUVEAU : callback pour la navigation interne
  onNavigatePage?: (pageId: string) => void;
}

// ⭐ Ajouter une variante = une ligne ici + un composant. Rien d'autre à toucher dans le moteur.
const VARIANT_COMPONENTS: Record<string, React.ComponentType<NavbarRendererProps>> = {
  horizontal: NavbarHorizontal,
  hero: NavbarHero,
  sidebar: NavbarSidebar,
};

export default function NavbarBlockRenderer(props: NavbarRendererProps) {
  useEffect(() => { injectNavbarStyles(); }, []);
  const Variant = VARIANT_COMPONENTS[props.navConfig?.variant] || NavbarHorizontal;
  return <Variant {...props} />;
}