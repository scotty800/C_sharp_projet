'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { productService } from '@/services/api/products';
import { shopService } from '@/services/api/shops';
import { Product } from '@/types/product';
import { FiPlus, FiEdit, FiTrash2, FiArrowLeft, FiPackage } from 'react-icons/fi';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

export default function SellerProductsPage() {
  const searchParams = useSearchParams();
  const shopId = Number(searchParams.get('shopId'));
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    if (!user || !shopId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les infos de la boutique
        const shop = await shopService.getShopById(shopId);
        setShopName(shop.name);

        // Récupérer les produits
        const response = await productService.getProductsByShop(shopId, { pageSize: 50 });
        
        // Extraire les produits
        const data: any = response;
        let extractedProducts: Product[] = [];
        
        if (data.products?.items) {
          extractedProducts = data.products.items;
        } else if (data.products?.data) {
          extractedProducts = data.products.data;
        } else if (data.data) {
          extractedProducts = data.data;
        }
        
        setProducts(extractedProducts);
      } catch (error) {
        console.error('Erreur chargement produits:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, user]);

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`Supprimer "${productName}" ?`)) return;
    
    try {
      await productService.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Produit supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/seller?shopId=${shopId}`} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des produits</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">Boutique : {shopName}</p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Produits ({products.length})</h2>
          <Link
            href={`/product/create?shopId=${shopId}`}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus />
            Ajouter un produit
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">Aucun produit dans cette boutique</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="relative w-full h-40 mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <h3 className="font-semibold truncate text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-primary font-bold">{product.price} €</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Stock: {product.stock}</span>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Link
                    href={`/product/edit/${product.id}`}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors"
                  >
                    <FiEdit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}