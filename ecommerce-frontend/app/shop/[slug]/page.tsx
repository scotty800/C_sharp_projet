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

        // Récupérer les produits de la boutique
        const productsData = await productService.getProductsByShop(shopData.id, {
          pageSize: 12
        });
        
        console.log('Produits reçus:', productsData);
        
        // ✅ Vérification de sécurité
        if (productsData && productsData.products && productsData.products.data) {
          setProducts(productsData.products.data);
        } else {
          console.warn('Structure de produits inattendue:', productsData);
          setProducts([]);
        }
      } catch (err: any) {
        console.error('Erreur complète:', err);
        setError(err.response?.data?.message || 'Boutique non trouvée');
        setProducts([]); // ← Important : initialiser à un tableau vide
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader shop={shop} isOwner={isOwner} />
      
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* ✅ Passage de produits même vide, mais jamais undefined */}
            <ShopProducts products={products || []} totalCount={shop.productCount} />
          </div>
          <div className="lg:col-span-1">
            <ShopSidebar shop={shop} />
          </div>
        </div>

        <div className="mt-8">
          <ShopInfo shop={shop} />
        </div>
      </div>
    </div>
  );
}