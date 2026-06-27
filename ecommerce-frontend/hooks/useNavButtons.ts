// hooks/useNavButtons.ts
import { useCallback } from 'react';
import { NavButton, NavbarConfig } from '@/types/studio';

const genButtonId = () => `navbtn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function useNavButtons(navConfig: NavbarConfig, onChange: (next: NavbarConfig) => void) {
  const addButton = useCallback((partial?: Partial<NavButton>) => {
    const newButton: NavButton = {
      id: genButtonId(),
      label: partial?.label || 'Nouveau lien',
      order: navConfig.buttons.length,
      isVisible: true,
      link: { type: 'none' },
      ...partial,
    };
    onChange({ ...navConfig, buttons: [...navConfig.buttons, newButton] });
    return newButton.id;
  }, [navConfig, onChange]);

  const removeButton = useCallback((buttonId: string) => {
    const remaining = navConfig.buttons.filter(b => b.id !== buttonId).map((b, idx) => ({ ...b, order: idx }));
    onChange({ ...navConfig, buttons: remaining });
  }, [navConfig, onChange]);

  const updateButton = useCallback((buttonId: string, updates: Partial<NavButton>) => {
    onChange({ ...navConfig, buttons: navConfig.buttons.map(b => (b.id === buttonId ? { ...b, ...updates } : b)) });
  }, [navConfig, onChange]);

  const reorderButtons = useCallback((startIndex: number, endIndex: number) => {
    const sorted = [...navConfig.buttons].sort((a, b) => a.order - b.order);
    const [moved] = sorted.splice(startIndex, 1);
    sorted.splice(endIndex, 0, moved);
    onChange({ ...navConfig, buttons: sorted.map((b, idx) => ({ ...b, order: idx })) });
  }, [navConfig, onChange]);

  const duplicateButton = useCallback((buttonId: string) => {
    const source = navConfig.buttons.find(b => b.id === buttonId);
    if (!source) return;
    const copy: NavButton = { ...source, id: genButtonId(), label: `${source.label} (copie)`, order: navConfig.buttons.length };
    onChange({ ...navConfig, buttons: [...navConfig.buttons, copy] });
  }, [navConfig, onChange]);

  return { addButton, removeButton, updateButton, reorderButtons, duplicateButton };
}