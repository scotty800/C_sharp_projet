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
        console.log('🔍 Récupération de la boutique avec slug:', slug);
        
        // 1. Récupérer la boutique
        const shopData = await shopService.getShopBySlug(slug);
        console.log('🏪 Boutique trouvée:', shopData);
        setShop(shopData);

        // 2. Récupérer les produits de la boutique
        console.log('📦 Récupération des produits pour shopId:', shopData.id);
        const productsData = await productService.getProductsByShop(shopData.id, {
          pageSize: 50
        });
        
        console.log('📦 Réponse produits COMPLÈTE:', productsData);
        
        // 3. Analyser la structure en détail avec "as any" pour éviter les erreurs TypeScript
        const data: any = productsData;
        
        console.log('📦 Type de productsData:', typeof data);
        console.log('📦 Est un tableau?', Array.isArray(data));
        if (!Array.isArray(data)) {
          console.log('📦 Clés de productsData:', Object.keys(data));
        }
        
        // 4. Tentative d'extraction des produits
        let extractedProducts: Product[] = [];
        
        // Cas 1: Si productsData est directement un tableau
        if (Array.isArray(data)) {
          console.log('✅ Cas 1: productsData est un tableau direct');
          extractedProducts = data;
        }
        // Cas 2: Si data.products est un tableau
        else if (data.products && Array.isArray(data.products)) {
          console.log('✅ Cas 2: data.products est un tableau');
          extractedProducts = data.products;
        }
        // Cas 3: Si data.data est un tableau
        else if (data.data && Array.isArray(data.data)) {
          console.log('✅ Cas 3: data.data est un tableau');
          extractedProducts = data.data;
        }
        // Cas 4: Si data.products?.data est un tableau
        else if (data.products?.data && Array.isArray(data.products.data)) {
          console.log('✅ Cas 4: data.products.data est un tableau');
          extractedProducts = data.products.data;
        }
        // Cas 5: Si data.products?.items est un tableau
        else if (data.products?.items && Array.isArray(data.products.items)) {
          console.log('✅ Cas 5: data.products.items est un tableau');
          extractedProducts = data.products.items;
        }
        // Cas 6: Si data.results est un tableau
        else if (data.results && Array.isArray(data.results)) {
          console.log('✅ Cas 6: data.results est un tableau');
          extractedProducts = data.results;
        }
        // Cas 7: Si data.items est un tableau
        else if (data.items && Array.isArray(data.items)) {
          console.log('✅ Cas 7: data.items est un tableau');
          extractedProducts = data.items;
        }
        else {
          console.warn('⚠️ Aucune structure de tableau reconnue');
          console.log('📦 Structure complète:', JSON.stringify(data, null, 2));
        }
        
        console.log('📦 Produits extraits:', extractedProducts.length);
        if (extractedProducts.length > 0) {
          console.log('📦 Premier produit:', extractedProducts[0]);
        }
        
        setProducts(extractedProducts);
        
      } catch (err: any) {
        console.error('❌ Erreur complète:', err);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Boutique non trouvée</h1>
          <p className="text-gray-600 dark:text-gray-400">{error || "La boutique que vous recherchez n'existe pas ou a été supprimée."}</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === shop.ownerId;

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
              products={products} 
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