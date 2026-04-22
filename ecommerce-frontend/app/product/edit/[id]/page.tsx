'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { productService } from '@/services/api/products';
import { Product } from '@/types/product';
import { FiSave, FiArrowLeft, FiTrash2, FiImage } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [imageError, setImageError] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    size: '',
    color: '',
  });

  const categories = [
    'Mode',
    'Électronique',
    'Maison',
    'Sport',
    'Beauté',
    'Jeux',
    'Livres',
    'Automobile',
    'Alimentation',
    'Autre'
  ];

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('📦 Chargement du produit ID:', id);
        
        const data = await productService.getProductById(Number(id));
        console.log('✅ Produit chargé:', data);
        
        setProduct(data);
        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price.toString(),
          stock: data.stock.toString(),
          category: data.category,
          size: data.size || '',
          color: data.color || '',
        });
      } catch (error) {
        console.error('❌ Erreur:', error);
        toast.error('Impossible de charger le produit');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    if (isNaN(price) || price <= 0) {
      toast.error('Le prix doit être un nombre positif');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast.error('Le stock doit être un nombre valide');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Mise à jour produit avec données:', {
        name: formData.name,
        description: formData.description,
        price: price,
        stock: stock,
        category: formData.category,
        size: formData.size || undefined,
        color: formData.color || undefined,
      });
      
      // Appeler l'API de mise à jour
      await productService.updateProduct(Number(id), {
        name: formData.name,
        description: formData.description,
        price: price,
        stock: stock,
        category: formData.category,
        size: formData.size || undefined,
        color: formData.color || undefined,
      });
      
      toast.success('Produit mis à jour avec succès');
      
      // Rediriger vers la page de gestion de la boutique
      if (product?.shopId) {
        console.log('➡️ Redirection vers shop/manage/${product.shopId}');
        router.push(`/shop/manage/${product.shopId}`);
      } else {
        console.log('➡️ Redirection vers shop/my-shops');
        router.push('/shop/my-shops');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur détaillée:', error);
      console.error('❌ Réponse:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeleting(true);
      console.log('🗑️ Suppression produit:', id);
      
      await productService.deleteProduct(Number(id));
      
      toast.success('Produit supprimé avec succès');
      
      // Rediriger vers la page de gestion de la boutique
      if (product?.shopId) {
        router.push(`/shop/manage/${product.shopId}`);
      } else {
        router.push('/shop/my-shops');
      }
    } catch (error: any) {
      console.error('❌ Erreur suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = 'http://127.0.0.1:5019';
    return `${baseUrl}${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Produit non trouvé</p>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.imageUrl);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header avec boutons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le produit</h1>
          </div>
          
          <button
            onClick={handleDelete}
            disabled={deleting || saving}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiTrash2 />
            {deleting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>

        {/* Image du produit */}
        {imageUrl && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Image actuelle</h2>
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image
                src={imageError ? '/images/product-placeholder.svg' : imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Formulaire d'édition */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          {/* Nom du produit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: T-shirt en coton"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Description détaillée du produit..."
            />
          </div>

          {/* Prix et Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="29.99"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="10"
                required
              />
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Taille et Couleur (optionnels) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Taille (optionnel)
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: M, XL, 42..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur (optionnel)
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Rouge, Bleu..."
              />
            </div>
          </div>

          {/* Boutons de sauvegarde */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving || deleting}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiSave />
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving || deleting}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </form>

        {/* Lien pour gérer les images */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Images du produit</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Vous pouvez ajouter ou modifier les images de ce produit.
          </p>
          <button
            onClick={() => router.push(`/product/upload-images/${product.id}`)}
            className="flex items-center gap-2 text-primary hover:text-primary-dark"
          >
            <FiImage />
            Gérer les images
          </button>
        </div>
      </div>
    </div>
  );
}