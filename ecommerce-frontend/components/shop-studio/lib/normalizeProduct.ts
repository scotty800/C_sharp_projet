import { StudioProduct } from '@/types/studio';

function toArray(value: unknown, legacy?: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value ? value.split(',').filter(Boolean) : [];
  if (Array.isArray(legacy)) return legacy;
  if (typeof legacy === 'string') return legacy ? legacy.split(',').filter(Boolean) : [];
  return [];
}

export function normalizeStudioProduct(p: any): StudioProduct {
  const imageUrl1 = p.imageUrl1 || p.imageUrl || '';
  const imageUrl2 = p.imageUrl2 || '';
  const imageUrl3 = p.imageUrl3 || '';

  // ⭐ NOUVEAU : normaliser les variantes de couleur
  const rawVariants = p.colorVariants || p.variants || [];
  const colorVariants = rawVariants.map((v: any) => ({
    ...v,
    sizes: toArray(v.sizes, v.size),
  }));

  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: p.price,
    stock: p.stock || 0,
    category: p.category || '',
    sizes: toArray(p.sizes, p.size),
    colors: toArray(p.colors, p.color),
    imageUrl: imageUrl1,
    imageUrl1,
    imageUrl2,
    imageUrl3,
    colorVariants, // ⭐ NOUVEAU
    isInStock: (p.stock || 0) > 0,
    createdAt: p.createdAt,
  };
}

export function normalizeStudioProducts(list: any[]): StudioProduct[] {
  return (list || []).map(normalizeStudioProduct);
}