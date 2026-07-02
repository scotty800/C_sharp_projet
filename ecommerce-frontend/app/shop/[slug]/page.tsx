'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ShopPageRenderer from '@/components/shop-studio/ShopPageRenderer';
import { shopService } from '@/services/api/shops';
import { productService } from '@/services/api/products';
import { shopRenderService, ShopRenderData } from '@/services/api/shopRender';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [renderData, setRenderData] = useState<ShopRenderData | null>(null);
  const [legacyProducts, setLegacyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐ MODIFICATION — Gestionnaire avec variante optionnelle
  const handleAddToCart = async (product: Product, variant?: { size?: string; color?: string }) => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter des articles au panier');
      router.push(`/auth/login?redirect=/shop/${params?.slug}`);
      return;
    }

    try {
      await addToCart(product.id, 1, variant?.size, variant?.color);
      toast.success('Ajouté au panier');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'ajout au panier");
    }
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

  // ── Fallback : rendu legacy (grille produits simple) ──
  // (à conserver pour les boutiques sans Studio)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{shop.name}</h1>
        {legacyProducts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">Aucun produit disponible</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {legacyProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
                  
                  {/* ⭐ Affichage des tailles et couleurs disponibles (legacy) */}
                  {(product.size || product.color) && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {product.size && <span>Taille: {product.size}</span>}
                      {product.size && product.color && ' · '}
                      {product.color && <span>Couleur: {product.color}</span>}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{product.price} €</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm"
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}