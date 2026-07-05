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
    sizes: variant?.sizes && variant.sizes.length > 0 ? variant.sizes : product.sizes || [],
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