'use client';

import { useEffect, useRef } from 'react';

// ⭐ CORRECTION : Mappage exact des noms de polices vers les paramètres Google Fonts
const GOOGLE_FONTS_MAP: Record<string, string> = {
  'Inter': 'Inter',
  'Roboto': 'Roboto',
  'Open Sans': 'Open+Sans',
  'Montserrat': 'Montserrat',
  'Poppins': 'Poppins',
  'Nunito': 'Nunito',
  'Playfair Display': 'Playfair+Display',
  'Merriweather': 'Merriweather',
  'Lora': 'Lora',
  'Cormorant': 'Cormorant',
  'Crimson Text': 'Crimson+Text',
  'JetBrains Mono': 'JetBrains+Mono',
  'Fira Code': 'Fira+Code',
  'Source Code Pro': 'Source+Code+Pro',
  'Pacifico': 'Pacifico',
  'Lobster': 'Lobster',
  'Bebas Neue': 'Bebas+Neue',
  'Anton': 'Anton',
  'Fredoka One': 'Fredoka+One',
  'Raleway': 'Raleway',
  'Oswald': 'Oswald',
  'Quicksand': 'Quicksand',
  'DM Sans': 'DM+Sans',
  'Work Sans': 'Work+Sans',
  'Comfortaa': 'Comfortaa',
  'Dancing Script': 'Dancing+Script',
  'Great Vibes': 'Great+Vibes',
  'Sacramento': 'Sacramento',
  'Amatic SC': 'Amatic+SC',
  'Architects Daughter': 'Architects+Daughter',
  'Indie Flower': 'Indie+Flower',
  'Patrick Hand': 'Patrick+Hand',
  'Permanent Marker': 'Permanent+Marker',
  'Rubik': 'Rubik',
  'Space Grotesk': 'Space+Grotesk',
  'Sora': 'Sora',
  'Manrope': 'Manrope',
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans',
};

export function GoogleFontsLoader({ fonts }: { fonts: string[] }) {
  const loadedFontsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Filtrer les polices valides et non encore chargées
    const fontsToLoad = fonts.filter(f => {
      const fontName = f?.trim();
      return fontName && 
             GOOGLE_FONTS_MAP[fontName] && 
             !loadedFontsRef.current.has(fontName);
    });

    if (fontsToLoad.length === 0) return;

    // Marquer comme chargées immédiatement pour éviter les doublons
    fontsToLoad.forEach(f => loadedFontsRef.current.add(f));

    // Construire l'URL Google Fonts
    const fontFamilies = fontsToLoad.map(f => GOOGLE_FONTS_MAP[f]);
    
    // Charger les poids 300-800 et les italiques
    const url = `https://fonts.googleapis.com/css2?family=${fontFamilies.join('&family=')}:wght@300;400;500;600;700;800&display=swap`;
    
    console.log('🎨 Chargement des polices Google Fonts:', fontsToLoad);
    console.log('📄 URL:', url);
    
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.id = `google-fonts-${Date.now()}`;
    document.head.appendChild(link);

    // Vérifier si les polices sont chargées
    const checkFonts = () => {
      fontsToLoad.forEach(font => {
        // @ts-ignore
        if (document.fonts && document.fonts.check) {
          // @ts-ignore
          document.fonts.load(`1rem ${font}`).then(() => {
            console.log(`✅ Police chargée: ${font}`);
          }).catch(() => {
            console.warn(`⚠️ Police non chargée: ${font}`);
          });
        }
      });
    };
    
    setTimeout(checkFonts, 1000);
    
    return () => {
      // Ne pas supprimer le lien pour garder les polices chargées
      // if (document.head.contains(link)) {
      //   document.head.removeChild(link);
      // }
    };
  }, [fonts]);

  // ⭐ Injecter aussi des styles CSS pour forcer l'application des polices
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Forcer l'application des polices Google Fonts */
      .force-font-apply {
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}