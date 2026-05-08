// data/filterPresets.ts

export const filterPresets = [
  { id: 'none', name: 'Normal', cssFilter: 'none', brightness: 1, contrast: 1, saturation: 1, blur: 0 },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(0.4) contrast(1.2) brightness(0.9)', brightness: 0.9, contrast: 1.2, saturation: 0.8, blur: 0 },
  { id: 'black-white', name: 'Noir & Blanc', cssFilter: 'grayscale(1)', brightness: 1, contrast: 1.1, saturation: 0, blur: 0 },
  { id: 'sepia', name: 'Sépia', cssFilter: 'sepia(0.8)', brightness: 1, contrast: 1, saturation: 0.9, blur: 0 },
  { id: 'clarendon', name: 'Clarendon', cssFilter: 'brightness(1.1) contrast(1.2) saturate(1.3)', brightness: 1.1, contrast: 1.2, saturation: 1.3, blur: 0 },
  { id: 'gingham', name: 'Gingham', cssFilter: 'brightness(1.05) contrast(0.9) saturate(0.1) sepia(0.1)', brightness: 1.05, contrast: 0.9, saturation: 0.1, blur: 0 },
  { id: 'moon', name: 'Moon', cssFilter: 'brightness(0.9) contrast(1.1) grayscale(0.3)', brightness: 0.9, contrast: 1.1, saturation: 0.7, blur: 0 },
  { id: 'lark', name: 'Lark', cssFilter: 'brightness(1.1) contrast(0.9) saturate(1.1) hue-rotate(-10deg)', brightness: 1.1, contrast: 0.9, saturation: 1.1, blur: 0 },
  { id: 'reyes', name: 'Reyes', cssFilter: 'brightness(0.95) contrast(0.85) saturate(0.9) sepia(0.1)', brightness: 0.95, contrast: 0.85, saturation: 0.9, blur: 0 },
  { id: 'juno', name: 'Juno', cssFilter: 'brightness(1.05) contrast(1.1) saturate(0.9) hue-rotate(-15deg)', brightness: 1.05, contrast: 1.1, saturation: 0.9, blur: 0 },
  { id: 'vivid', name: 'Vif', cssFilter: 'brightness(0.95) contrast(1.05) saturate(1.5)', brightness: 0.95, contrast: 1.05, saturation: 1.5, blur: 0 },
  { id: 'cool', name: 'Frais', cssFilter: 'brightness(0.97) saturate(0.9) hue-rotate(10deg)', brightness: 0.97, contrast: 1, saturation: 0.9, blur: 0 },
  { id: 'warm', name: 'Chaud', cssFilter: 'brightness(1.03) saturate(1.1) hue-rotate(-10deg)', brightness: 1.03, contrast: 1, saturation: 1.1, blur: 0 },
  { id: 'dramatic', name: 'Dramatique', cssFilter: 'brightness(0.9) contrast(1.3) saturate(1.2)', brightness: 0.9, contrast: 1.3, saturation: 1.2, blur: 0 },
  { id: 'glow', name: 'Lueur', cssFilter: 'brightness(1.05) saturate(1.2) blur(0.5px)', brightness: 1.05, contrast: 0.95, saturation: 1.2, blur: 0.5 },
  { id: 'soft', name: 'Doux', cssFilter: 'brightness(1.02) contrast(0.95) blur(1px)', brightness: 1.02, contrast: 0.95, saturation: 1, blur: 1 },
  { id: 'retro', name: 'Rétro', cssFilter: 'sepia(0.4) saturate(0.8) hue-rotate(-20deg)', brightness: 1, contrast: 1, saturation: 0.8, blur: 0 },
  { id: 'dreamy', name: 'Rêveur', cssFilter: 'brightness(1.05) saturate(0.8) blur(0.8px)', brightness: 1.05, contrast: 0.85, saturation: 0.8, blur: 0.8 },
];

export const seasonalEffects: Record<string, { name: string; description: string; cssFilter: string }> = {
  christmas: {
    name: '🎄 Noël',
    description: 'Rouge, vert et ambiance festive',
    cssFilter: 'brightness(1.05) saturate(1.1) hue-rotate(-5deg) sepia(0.1)',
  },
  halloween: {
    name: '🎃 Halloween',
    description: 'Orange, violet et ambiance mystérieuse',
    cssFilter: 'sepia(0.3) saturate(0.8) brightness(0.85) hue-rotate(-15deg)',
  },
  spring: {
    name: '🌸 Printemps',
    description: 'Couleurs douces et florales',
    cssFilter: 'brightness(1.05) saturate(1.15) hue-rotate(5deg)',
  },
  summer: {
    name: '☀️ Été',
    description: 'Chaud, lumineux et ensoleillé',
    cssFilter: 'brightness(1.1) saturate(1.2) hue-rotate(-5deg)',
  },
  autumn: {
    name: '🍂 Automne',
    description: 'Rouge, orange et tons chauds',
    cssFilter: 'sepia(0.25) saturate(1.1) hue-rotate(-15deg)',
  },
  winter: {
    name: '❄️ Hiver',
    description: 'Froid, bleu et givré',
    cssFilter: 'grayscale(0.15) brightness(0.95) hue-rotate(10deg)',
  },
};