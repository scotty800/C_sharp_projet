'use client';

import { useEffect, useRef, useState } from 'react';
import { shopCustomizationService } from '@/services/api/shopCustomization';
import { parsePagesAndBlocks } from '@/components/shop-studio/lib/pagesMeta';
import { StudioPage } from '@/types/studio';

// ⭐ NOUVEL IMPORT
import { getReadableTextColor, getReadableMutedTextColor, getReadableBorderColor } from '@/components/shop-studio/lib/colorContrast';

export interface ProductCardIdentity {
  backgroundColor: string;
  panelColor: string;
  accentColor: string;
  textColor: string;
  mutedTextColor: string; // ⭐ NOUVEAU — pour les labels secondaires (ex: "Taille", "Stock")
  borderColor: string;
  fontFamily: string;
  headingWeight: string;
  borderRadius: number;
  boxShadow: string;
  source: 'product-page' | 'shop-default';
}

const FALLBACK_IDENTITY: ProductCardIdentity = {
  backgroundColor: '#ffffff',
  panelColor: '#ffffff',
  accentColor: '#2563EB',
  textColor: '#111111',
  mutedTextColor: 'rgba(17,17,17,0.55)', // ⭐ NOUVEAU
  borderColor: '#e5e7eb',
  fontFamily: 'Inter',
  headingWeight: '600',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  source: 'shop-default',
};

// ⭐ Signature visuelle par template — appliquée par-dessus les couleurs résolues
const TEMPLATE_PRESETS: Record<string, Pick<ProductCardIdentity, "borderRadius" | "boxShadow" | "headingWeight">> = {
  classic: { borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", headingWeight: "600" },
  immersive: { borderRadius: 6, boxShadow: "0 8px 28px rgba(0,0,0,0.35)", headingWeight: "800" },
  gallery: { borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.10)", headingWeight: "700" },
  minimal: { borderRadius: 2, boxShadow: "none", headingWeight: "300" },
};

// ⭐ Cache mémoire avec expiration courte : évite le refetch pour chaque item du panier
// tout en restant à jour si le vendeur vient de modifier son style.
const CACHE_TTL_MS = 15_000; // 15 secondes
const shopStyleCache = new Map<
  number,
  { promise: Promise<{ pages: StudioPage[]; customization: any }>; timestamp: number }
>();

// ⭐ MODIFICATION — utilise l'endpoint public (pas d'auth requise)
function loadShopStyleData(shopId: number) {
  const cached = shopStyleCache.get(shopId);
  const isExpired = !cached || Date.now() - cached.timestamp > CACHE_TTL_MS;

  if (isExpired) {
    // ⭐ CORRECTION — un seul appel à l'endpoint public (pas d'auth requise,
    // fonctionne pour n'importe quel visiteur/client, pas seulement le propriétaire)
    const promise = shopCustomizationService.getPublished(shopId).catch(() => null).then((published) => {
      const blocksFromApi = published?.blocks ?? [];
      const { pages } = parsePagesAndBlocks(blocksFromApi as any[]);
      const customization = published?.customization ?? null;
      return { pages, customization };
    });
    shopStyleCache.set(shopId, { promise, timestamp: Date.now() });
  }

  return shopStyleCache.get(shopId)!.promise;
}

export function useProductCardIdentity(shopId: number | null | undefined, productId: number) {
  const [identity, setIdentity] = useState<ProductCardIdentity>(FALLBACK_IDENTITY);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!shopId) return;

    loadShopStyleData(shopId).then(({ pages, customization }) => {
      if (!mounted.current) return;

      const linkedPage = pages.find(p => p.linkedProductId === productId);
      const style = linkedPage?.productPageStyle;

      // ⭐ LOG DE DÉBOGAGE
      console.log('🔍 Identity check', {
        productId,
        shopId,
        pagesCount: pages.length,
        linkedPage,
        style,
      });

      if (style) {
        const preset = TEMPLATE_PRESETS[style.template] || TEMPLATE_PRESETS.classic;
        const templateDefault = style.backgroundColor || FALLBACK_IDENTITY.panelColor;

        // ⭐ Le template Minimal n'a pas de "panneau" distinct du fond de page :
        // sa couleur de panelColor est une valeur par défaut fantôme, jamais
        // consciemment choisie par le vendeur. On priorise donc backgroundColor pour lui.
        const panelColor =
          style.template === 'minimal'
            ? style.backgroundColor || style.panelColor || templateDefault
            : style.panelColor || style.backgroundColor || templateDefault;

        // ⭐ Texte auto-adapté au fond réel de la carte, plutôt que la couleur figée
        // choisie sur la page produit (qui peut ne plus contraster une fois réutilisée ici)
        const resolvedTextColor = getReadableTextColor(panelColor);

        setIdentity({
          backgroundColor: style.backgroundColor || FALLBACK_IDENTITY.backgroundColor,
          panelColor,
          accentColor: style.accentColor || FALLBACK_IDENTITY.accentColor,
          textColor: resolvedTextColor,
          mutedTextColor: getReadableMutedTextColor(panelColor),
          borderColor: getReadableBorderColor(panelColor),
          fontFamily: customization?.headingFont || FALLBACK_IDENTITY.fontFamily,
          headingWeight: preset.headingWeight,
          borderRadius: preset.borderRadius,
          boxShadow: preset.boxShadow,
          source: 'product-page',
        });
      } else if (customization) {
        const panelColor = '#ffffff'; // le panel du fallback reste blanc par choix de design
        setIdentity({
          ...FALLBACK_IDENTITY,
          backgroundColor: customization.backgroundColor || FALLBACK_IDENTITY.backgroundColor,
          panelColor,
          accentColor: customization.primaryColor || FALLBACK_IDENTITY.accentColor,
          textColor: getReadableTextColor(panelColor),
          mutedTextColor: getReadableMutedTextColor(panelColor),
          fontFamily: customization.headingFont || FALLBACK_IDENTITY.fontFamily,
          source: 'shop-default',
        });
      }
    });

    return () => { mounted.current = false; };
  }, [shopId, productId]);

  return identity;
}