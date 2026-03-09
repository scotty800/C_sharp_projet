'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { productService } from '@/services/api/products';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { FiPlus, FiEdit, FiImage, FiArrowLeft, FiPackage, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ManageShopProductsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchShopData = async () => {
      try {
        setLoading(true);
        const shopData = await shopService.getShopById(Number(id));
        
        if (shopData.ownerId !== user.id) {
          toast.error('Vous n\'êtes pas le propriétaire de cette boutique');
          router.push('/');
          return;
        }

        setShop(shopData);
        
        // Récupérer les produits
        console.log('📦 Récupération des produits pour shopId:', shopData.id);
        const response = await productService.getProductsByShop(shopData.id, {
          pageSize: 50
        });
        
        console.log('📦 Réponse complète:', JSON.stringify(response, null, 2));
        
        // EXTRAIRE LES PRODUITS DE products.items
        let extractedProducts: Product[] = [];
        
        // @ts-ignore
        const data = response as any;
        
        // La bonne structure est data.products.items
        if (data.products?.items && Array.isArray(data.products.items)) {
          console.log('✅ Structure trouvée: data.products.items');
          extractedProducts = data.products.items;
        } 
        // Autres possibilités au cas où
        else if (data.products?.data && Array.isArray(data.products.data)) {
          extractedProducts = data.products.data;
        } else if (data.items && Array.isArray(data.items)) {
          extractedProducts = data.items;
        } else if (Array.isArray(data)) {
          extractedProducts = data;
        } else {
          console.log('❌ Aucune structure de tableau trouvée');
          extractedProducts = [];
        }
        
        console.log('📦 Produits extraits:', extractedProducts.length);
        setProducts(extractedProducts);
        
      } catch (error) {
        console.error('❌ Erreur:', error);
        toast.error('Impossible de charger la boutique');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShopData();
    }
  }, [id, user, router]);

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
      return;
    }

    try {
      setDeletingId(productId);
      await productService.deleteProduct(productId);
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      toast.success('Produit supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '/images/product-placeholder.svg'; // ← .svg
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:5019';
    return `${baseUrl}${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Boutique non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
        >
          <FiArrowLeft />
          Retour
        </button>

        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gérer les produits</h1>
            <p className="text-gray-600 mt-1">Boutique : {shop.name}</p>
          </div>
          
          <button
            onClick={() => router.push(`/shop/customize/${shop.id}`)}
            className="text-primary hover:text-primary-dark text-sm"
          >
            Personnaliser la boutique →
          </button>
        </div>

        {/* Section Produits */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Produits ({products.length})
            </h2>
            <button
              onClick={() => router.push(`/product/create?shopId=${shop.id}`)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiPlus />
              Ajouter un produit
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <FiPackage className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-medium text-gray-700 mb-2">Aucun produit</h3>
              <p className="text-gray-500 mb-6">
                Commencez par ajouter votre premier produit à la boutique.
              </p>
              <button
                onClick={() => router.push(`/product/create?shopId=${shop.id}`)}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
              >
                <FiPlus />
                Ajouter un produit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                    <Image
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{product.category}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-lg font-bold text-primary">{product.price} €</span>
                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/product/edit/${product.id}`)}
                        className="text-gray-400 hover:text-primary transition-colors"
                        title="Modifier"
                      >
                        <FiEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}