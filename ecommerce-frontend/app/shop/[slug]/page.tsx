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
  const params = useParams();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopData = async () => {
      const slug = params?.slug as string;
      
      if (slug === 'create') {
        return;
      }

      if (!slug) {
        setError('Slug manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Récupération de la boutique avec slug:', slug);
        
        const shopData = await shopService.getShopBySlug(slug);
        console.log('Boutique trouvée:', shopData);
        setShop(shopData);

        const productsData = await productService.getProductsByShop(shopData.id, {
          pageSize: 12
        });
        
        if (productsData && productsData.products && productsData.products.data) {
          setProducts(productsData.products.data);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        console.error('Erreur complète:', err);
        setError(err.response?.data?.message || 'Boutique non trouvée');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [params?.slug]);

  if (params?.slug === 'create') {
    return null;
  }

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
          <p className="text-gray-600">{error || "La boutique que vous recherchez n'existe pas ou a été supprimée."}</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === shop.ownerId;

  // Styles de page basés sur les couleurs de la boutique
  const pageStyle = {
    backgroundColor: shop.backgroundColor || '#f3f4f6',
    color: shop.textColor || '#000000',
  };

  return (
    <div 
      className="min-h-screen"
      style={pageStyle}
    >
      <ShopHeader shop={shop} isOwner={isOwner} />
      
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <ShopProducts 
              products={products || []} 
              totalCount={shop.productCount} 
              themeColor={shop.themeColor}
            />
          </div>
          <div className="lg:col-span-1">
            <ShopSidebar 
              shop={shop} 
              themeColor={shop.themeColor}
            />
          </div>
        </div>

        <div className="mt-8">
          <ShopInfo 
            shop={shop} 
            themeColor={shop.themeColor}
          />
        </div>
      </div>
    </div>
  );
}