import { StudioProduct, ColorVariant } from '@/types/studio';

export interface ResolvedProductDisplay {
  name: string;
  stock: number;
  sizes: string[];
  imageUrl1?: string | null;
  imageUrl2?: string | null;
  imageUrl3?: string | null;
  variant?: ColorVariant;
}

/**
 * Résout l'affichage effectif d'un produit en fonction de la couleur
 * sélectionnée par le visiteur (ou du produit "de base" si aucune
 * couleur n'est choisie / si la couleur n'a pas de variante configurée).
 */
export function resolveProductDisplay(
  product: StudioProduct,
  selectedColor?: string
): ResolvedProductDisplay {
  const variant = selectedColor
    ? product.colorVariants?.find(
        v => v.color?.toLowerCase() === selectedColor.toLowerCase()
      )
    : undefined;

  return {
    name: variant?.customName || product.name,
    stock: variant?.stock ?? product.stock,
    sizes:
      variant?.sizes && variant.sizes.length > 0
        ? variant.sizes
        : product.sizes || [],
    imageUrl1: variant?.imageUrl1 || product.imageUrl1,
    imageUrl2: variant?.imageUrl2 || product.imageUrl2,
    imageUrl3: variant?.imageUrl3 || product.imageUrl3,
    variant,
  };
}

export function getResolvedImages(display: ResolvedProductDisplay): string[] {
  return [display.imageUrl1, display.imageUrl2, display.imageUrl3].filter(
    (u): u is string => !!u && u.trim() !== ''
  );
}

/**
 * ⭐ NOUVEAU HELPER
 * Associe un boundField "image" à l'index dans le tableau résolu d'images.
 * Retourne null si ce boundField n'est pas un champ image.
 * 
 * Exemples:
 * - 'mainImage' → 0
 * - 'thumbImage:0' → 1
 * - 'thumbImage:1' → 2
 * - 'secondaryImage:0' → 1
 * - 'galleryImage:0' → 0
 * - 'galleryImage:1' → 1
 * - 'unknown' → null
 */
export function getBoundFieldImageIndex(boundField?: string): number | null {
  if (!boundField) return null;
  
  if (boundField === 'mainImage') return 0;
  
  if (boundField.startsWith('thumbImage:')) {
    const idx = parseInt(boundField.split(':')[1], 10);
    return isNaN(idx) ? null : idx + 1; // +1 car thumbImage commence après l'image principale
  }
  
  if (boundField.startsWith('secondaryImage:')) {
    const idx = parseInt(boundField.split(':')[1], 10);
    return isNaN(idx) ? null : idx + 1; // +1 car secondaryImage commence après l'image principale
  }
  
  if (boundField.startsWith('galleryImage:')) {
    const idx = parseInt(boundField.split(':')[1], 10);
    return isNaN(idx) ? null : idx; // 0-indexé pour la galerie
  }
  
  return null;
}