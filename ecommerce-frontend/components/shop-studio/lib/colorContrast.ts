/**
 * Calcule si une couleur est "claire" ou "sombre" et retourne
 * la couleur de texte optimale (noir ou blanc) pour rester lisible.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6) return null;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b };
}

function parseRgbString(rgb: string): { r: number; g: number; b: number } | null {
  const match = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) return null;
  return { r: parseInt(match[1], 10), g: parseInt(match[2], 10), b: parseInt(match[3], 10) };
}

/** Luminance relative (formule WCAG), 0 = noir, 1 = blanc. */
export function getRelativeLuminance(color: string): number {
  let rgb = hexToRgb(color);
  if (!rgb) rgb = parseRgbString(color);
  if (!rgb) return 1; // couleur non reconnue -> on suppose clair, texte noir par défaut

  const srgb = [rgb.r, rgb.g, rgb.b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

export function isColorDark(color: string): boolean {
  return getRelativeLuminance(color) < 0.5;
}

/**
 * Couleur de texte garantissant un bon contraste sur `backgroundColor`.
 * Retourne blanc si le fond est sombre, noir si le fond est clair.
 */
export function getReadableTextColor(
  backgroundColor: string,
  options?: { dark?: string; light?: string }
): string {
  const darkText = options?.dark ?? '#111111';
  const lightText = options?.light ?? '#ffffff';
  return isColorDark(backgroundColor) ? lightText : darkText;
}

/**
 * Variante "atténuée" de la couleur de texte lisible (pour labels secondaires,
 * ex: "Taille", "Couleur"), avec une opacité réduite mais garantissant le sens
 * clair/sombre du fond.
 */
export function getReadableMutedTextColor(backgroundColor: string): string {
  return isColorDark(backgroundColor) ? 'rgba(255,255,255,0.65)' : 'rgba(17,17,17,0.55)';
}

/**
 * Couleur de bordure adaptée au fond (légèrement plus visible sur fond sombre,
 * plus discrète sur fond clair).
 */
export function getReadableBorderColor(backgroundColor: string): string {
  return isColorDark(backgroundColor) ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)';
}