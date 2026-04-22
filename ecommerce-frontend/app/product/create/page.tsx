'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { productService } from '@/services/api/products';
import { shopService } from '@/services/api/shops';
import { ShopResponse } from '@/types/shop';
import { FiSave, FiArrowLeft, FiPackage, FiUpload, FiX } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function CreateProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopIdParam = searchParams.get('shopId');
  const { user } = useAuth();
  const [shops, setShops] = useState<ShopResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'images'>('form');
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  
  const [images, setImages] = useState({
    image1: null as File | null,
    image2: null as File | null,
    image3: null as File | null,
  });
  
  const [imagePreviews, setImagePreviews] = useState({
    image1: null as string | null,
    image2: null as string | null,
    image3: null as string | null,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    size: '',
    color: '',
    shopId: shopIdParam ? parseInt(shopIdParam) : '',
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
      router.push('/auth/login?redirect=/product/create');
      return;
    }

    const fetchShops = async () => {
      try {
        const userShops = await shopService.getMyShops();
        setShops(userShops);
        
        if (!shopIdParam && userShops.length > 0) {
          setFormData(prev => ({ ...prev, shopId: userShops[0].id }));
        }
      } catch (error) {
        console.error('Erreur chargement boutiques:', error);
        toast.error('Impossible de charger vos boutiques');
      }
    };

    fetchShops();
  }, [user, router, shopIdParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageKey: 'image1' | 'image2' | 'image3') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Le fichier doit être une image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5 Mo');
        return;
      }

      setImages(prev => ({ ...prev, [imageKey]: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [imageKey]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageKey: 'image1' | 'image2' | 'image3') => {
    setImages(prev => ({ ...prev, [imageKey]: null }));
    setImagePreviews(prev => ({ ...prev, [imageKey]: null }));
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock || !formData.category || !formData.shopId) {
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
      setLoading(true);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: price,
        stock: stock,
        category: formData.category,
        size: formData.size || undefined,
        color: formData.color || undefined,
        shopId: formData.shopId as number,
      };

      const response = await productService.createProductForShop(
        formData.shopId as number,
        productData
      );
      
      setCreatedProductId(response.id);
      toast.success('Produit créé ! Vous pouvez maintenant ajouter des images.');
      setStep('images');
    } catch (error: any) {
      console.error('Erreur création produit:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async () => {
    if (!createdProductId) return;

    if (!images.image1 && !images.image2 && !images.image3) {
      toast.error('Sélectionnez au moins une image');
      return;
    }

    try {
      setLoading(true);
      
      await productService.uploadImages({
        productId: createdProductId,
        image1: images.image1 || undefined,
        image2: images.image2 || undefined,
        image3: images.image3 || undefined,
      });

      toast.success('Images uploadées avec succès !');
      router.push(`/shop/manage/${formData.shopId}`);
    } catch (error: any) {
      console.error('Erreur upload images:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload des images');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipImages = () => {
    router.push(`/shop/manage/${formData.shopId}`);
  };

  if (!user) {
    return null;
  }

  if (shops.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
            <FiPackage className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Vous n'avez pas de boutique</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vous devez avoir une boutique pour créer des produits.
            </p>
            <button
              onClick={() => router.push('/shop/create')}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
            >
              Créer une boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {step === 'form' ? 'Ajouter un produit' : 'Ajouter des images'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {step === 'form' 
                ? 'Étape 1/2 : Informations du produit' 
                : 'Étape 2/2 : Images du produit (optionnel)'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full ${step === 'form' ? 'bg-primary' : 'bg-primary/30'}`} />
          <div className={`flex-1 h-2 rounded-full ${step === 'images' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmitProduct} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Boutique * {shops.length > 1 && "(sélectionnez la boutique)"}
              </label>
              <select
                name="shopId"
                value={formData.shopId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Sélectionnez une boutique</option>
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiSave />
              {loading ? 'Création en cours...' : 'Créer le produit'}
            </button>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ajouter des images (optionnel)</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Vous pouvez ajouter jusqu'à 3 images pour votre produit. Format accepté : JPG, PNG (max 5 Mo)
              </p>
            </div>

            {/* Grille d'upload d'images dynamique */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((num) => {
                const imageKey = `image${num}` as 'image1' | 'image2' | 'image3';
                const hasImage = !!images[imageKey];
                
                // Ne pas afficher les emplacements vides après le premier
                if (num > 1 && !images.image1 && !images.image2) {
                  return null;
                }
                if (num > 2 && !images.image1 && !images.image2 && !images.image3) {
                  return null;
                }
                
                return (
                  <div key={num} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="relative aspect-square mb-2 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {imagePreviews[imageKey] ? (
                        <>
                          <Image
                            src={imagePreviews[imageKey]!}
                            alt={`Image ${num}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <button
                            onClick={() => removeImage(imageKey)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            type="button"
                          >
                            <FiX size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                          <FiUpload size={32} />
                          <span className="text-sm mt-2">Image {num}</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id={`image-${num}`}
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, imageKey)}
                      className="hidden"
                    />
                    <label
                      htmlFor={`image-${num}`}
                      className="block w-full text-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {hasImage ? 'Changer' : 'Choisir un fichier'}
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleUploadImages}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                <FiUpload />
                {loading ? 'Upload en cours...' : 'Uploader les images'}
              </button>
              <button
                onClick={handleSkipImages}
                disabled={loading}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Passer cette étape
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}