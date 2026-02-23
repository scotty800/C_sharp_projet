'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShopHeader, ShopProducts, ShopInfo, ShopSidebar } from '@/components/shop';
import { shopService } from '@/services/api/shops';
import { productService } from '@/services/api/products';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';

export default function ShopPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        // Récupérer la boutique
        const shopData = await shopService.getShopBySlug(slug as string);
        setShop(shopData);

        // Récupérer les produits de la boutique
        const productsData = await productService.getProductsByShop(shopData.id, {
          pageSize: 12
        });
        setProducts(productsData.products.data);
      } catch (err) {
        setError('Boutique non trouvée');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchShopData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Boutique non trouvée</h1>
          <p className="text-gray-600">La boutique que vous recherchez n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === shop.ownerId;

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader shop={shop} isOwner={isOwner} />
      
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <ShopProducts products={products} totalCount={shop.productCount} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ShopSidebar shop={shop} />
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8">
          <ShopInfo shop={shop} />
        </div>
      </div>
    </div>
  );
}