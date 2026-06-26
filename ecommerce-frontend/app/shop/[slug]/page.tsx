'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ShopPageRenderer from '@/components/shop-studio/ShopPageRenderer';
import { shopService } from '@/services/api/shops';
import { productService } from '@/services/api/products';
import { shopRenderService, ShopRenderData } from '@/services/api/shopRender';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';

export default function ShopPage() {
  const params = useParams();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [renderData, setRenderData] = useState<ShopRenderData | null>(null);
  const [legacyProducts, setLegacyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐ Gestionnaire "Ajouter au panier" (dispatch d'événement global)
  const handleAddToCart = (product: Product) => {
    window.dispatchEvent(new CustomEvent('addToCart', { 
      detail: { product, timestamp: Date.now() } 
    }));
  };

  useEffect(() => {
    const slug = params?.slug as string;
    if (slug === 'create') return;
    if (!slug) { setError('Slug manquant'); setLoading(false); return; }

    const load = async () => {
      try {
        setLoading(true);
        const shopData = await shopService.getShopBySlug(slug);
        setShop(shopData);

        const data = await shopRenderService.getRenderData(shopData);
        setRenderData(data);

        // Fallback legacy : boutiques n'ayant pas encore utilisé Studio
        if (!data.hasStudioContent) {
          const productsData = await productService.getProductsByShop(shopData.id, { pageSize: 50 });
          const raw: any = productsData;
          const extracted =
            Array.isArray(raw) ? raw
            : raw?.products?.items || raw?.products?.data || raw?.products
            || raw?.items || raw?.data || raw?.results || [];
          setLegacyProducts(extracted);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Boutique non trouvée');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.slug]);

  if (params?.slug === 'create') return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Boutique non trouvée</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {error || "La boutique que vous recherchez n'existe pas ou a été supprimée."}
          </p>
        </div>
      </div>
    );
  }

  // ── Rendu Studio (lecture seule) ──
  if (renderData?.hasStudioContent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: shop.backgroundColor || '#f3f4f6' }}>
        <ShopPageRenderer 
          data={renderData} 
          onAddToCart={handleAddToCart}
        />
      </div>
    );
  }
}