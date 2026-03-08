'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/api/products';
import { Product } from '@/types/product';
import { ProductGrid } from '@/components/product';
import { FiArrowLeft } from 'react-icons/fi';

// Données des catégories (à synchroniser avec la page principale)
const categories: Record<string, { name: string; description: string; icon: string }> = {
  mode: { name: 'Mode', description: 'Vêtements, chaussures, accessoires', icon: '👕' },
  electronique: { name: 'Électronique', description: 'Smartphones, ordinateurs, TV', icon: '📱' },
  maison: { name: 'Maison', description: 'Meubles, décoration, jardin', icon: '🏠' },
  sport: { name: 'Sport', description: 'Équipement sportif, vêtements', icon: '⚽' },
  beaute: { name: 'Beauté', description: 'Maquillage, soins, parfums', icon: '💄' },
  jeux: { name: 'Jeux', description: 'Jeux vidéo, consoles, accessoires', icon: '🎮' },
  livres: { name: 'Livres', description: 'Romans, BD, livres scolaires', icon: '📚' },
  automobile: { name: 'Automobile', description: 'Accessoires, entretien, équipement', icon: '🚗' },
  alimentation: { name: 'Alimentation', description: 'Produits frais, épicerie', icon: '🍎' },
};

export default function CategoryPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryId = id as string;
  const category = categories[categoryId] || { name: 'Catégorie', description: '', icon: '📦' };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts({
          category: categoryId,
          pageSize: 24,
        });
        
        // Extraire les produits selon la structure
        let extractedProducts: Product[] = [];
        const data: any = response;
        
        if (data.data && Array.isArray(data.data)) {
          extractedProducts = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          extractedProducts = data.items;
        } else if (Array.isArray(data)) {
          extractedProducts = data;
        }
        
        setProducts(extractedProducts);
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchProducts();
    }
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Fil d'Ariane */}
        <div className="mb-6">
          <Link href="/categories" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <FiArrowLeft size={18} />
            Toutes les catégories
          </Link>
        </div>

        {/* En-tête de la catégorie */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{category.icon}</div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                {products.length} produits disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Liste des produits */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </div>
    </div>
  );
}