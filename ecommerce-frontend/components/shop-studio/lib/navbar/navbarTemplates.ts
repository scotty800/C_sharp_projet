// lib/navbar/navbarTemplates.ts
import { NavbarConfig, NavbarVariant, NavButton } from '@/types/studio';

const genId = () => `navbtn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function defaultButtons(): NavButton[] {
  return [
    { id: genId(), label: 'Accueil', order: 0, isVisible: true, link: { type: 'none' } },
    { id: genId(), label: 'Boutique', order: 1, isVisible: true, link: { type: 'none' } },
    { id: genId(), label: 'Contact', order: 2, isVisible: true, link: { type: 'none' } },
  ];
}

const sharedAnimation = { 
  hoverEffect: 'underline' as const, 
  transitionDuration: 200, 
  transitionEasing: 'ease' as const, 
  entrance: 'none' as const 
};

export interface NavbarTemplate {
  id: string;
  variant: NavbarVariant;
  label: string;
  description: string;
  icon: string;
  createDefaultConfig: () => NavbarConfig;
}

export const NAVBAR_TEMPLATES: NavbarTemplate[] = [
  {
    id: 'navbar-horizontal-classic',
    variant: 'horizontal',
    label: 'Navbar classique',
    description: 'Barre horizontale e-commerce, logo + liens.',
    icon: '🧭',
    createDefaultConfig: () => ({
      variant: 'horizontal',
      buttons: defaultButtons(),
      alignment: 'space-between',
      gap: 24,
      sticky: true,
      showLogo: true,
      backgroundColor: '#ffffff',
      backgroundType: 'solid',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      collapseBreakpoint: 'mobile',
      mobileMenuStyle: 'drawer',
      defaultButtonStyle: { 
        textColor: '#1f2937', 
        fontFamily: 'Inter', 
        fontSize: 14, 
        fontWeight: '500', 
        paddingX: 14, 
        paddingY: 8, 
        borderRadius: 6, 
        gapIcon: 6 
      },
      defaultButtonAnimation: sharedAnimation,
    }),
  },
  {
    id: 'navbar-hero-banner',
    variant: 'hero',
    label: 'Hero Navbar',
    description: 'Grande barre en tête de page, met en avant la marque.',
    icon: '🪧',
    createDefaultConfig: () => ({
      variant: 'hero',
      buttons: defaultButtons(),
      alignment: 'center',
      gap: 32,
      sticky: false,
      showLogo: true,
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg,#111827,#1f2937)',
      hero: { height: 140, showTagline: true, tagline: 'Bienvenue dans notre boutique' },
      defaultButtonStyle: { 
        textColor: '#ffffff', 
        fontFamily: 'Poppins', 
        fontSize: 15, 
        fontWeight: '600', 
        paddingX: 16, 
        paddingY: 10, 
        borderRadius: 8, 
        gapIcon: 8 
      },
      defaultButtonAnimation: { ...sharedAnimation, hoverEffect: 'glow' },
    }),
  },
  {
    id: 'navbar-sidebar-drawer',
    variant: 'sidebar',
    label: 'Sidebar de navigation',
    description: 'Menu latéral rétractable, idéal pour les grandes boutiques.',
    icon: '📑',
    createDefaultConfig: () => ({
      variant: 'sidebar',
      buttons: defaultButtons(),
      alignment: 'left',
      gap: 4,
      backgroundColor: '#111827',
      backgroundType: 'solid',
      sidebar: { 
        width: 280, 
        position: 'left', 
        isOpenByDefault: false, 
        overlayOnMobile: true, 
        toggleButtonColor: '#ffffff' 
      },
      defaultButtonStyle: { 
        textColor: '#d1d5db', 
        fontFamily: 'Inter', 
        fontSize: 14, 
        fontWeight: '500', 
        paddingX: 16, 
        paddingY: 12, 
        borderRadius: 8, 
        gapIcon: 10 
      },
      defaultButtonAnimation: { ...sharedAnimation, hoverEffect: 'background' },
    }),
  },
];

export const getNavbarTemplate = (id: string) => NAVBAR_TEMPLATES.find(t => t.id === id);
export const blockTypeForVariant = (variant: NavbarVariant) => `navbar-${variant}` as const;

// ⭐ AJOUT — utilisé pour isoler les blocs Navbar (globaux) des blocs de page
export const isNavbarBlockType = (type: string): boolean => type.startsWith('navbar-');