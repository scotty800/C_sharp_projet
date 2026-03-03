'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { productService } from '@/services/api/products';
import { Product } from '@/types/product';
import { FiUpload, FiArrowLeft, FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UploadProductImagesPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // États pour les images
  const [images, setImages] = useState<{
    image1: File | null;
    image2: File | null;
    image3: File | null;
  }>({
    image1: null,
    image2: null,
    image3: null,
  });
  
  const [imagePreviews, setImagePreviews] = useState<{
    image1: string | null;
    image2: string | null;
    image3: string | null;
  }>({
    image1: null,
    image2: null,
    image3: null,
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(Number(id));
        setProduct(data);
        
        // Récupérer les images existantes
        const imagesData = await productService.getProductImages(Number(id));
        setExistingImages(imagesData.images);
        
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Impossible de charger le produit');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageKey: 'image1' | 'image2' | 'image3') => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type et la taille
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

  const handleDeleteExistingImage = async (imageUrl: string, index: number) => {
    if (!confirm('Voulez-vous supprimer cette image ?')) {
      return;
    }

    try {
      const imageNumber = index + 1;
      await productService.deleteImage(Number(id), imageNumber);
      
      // Mettre à jour la liste
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      toast.success('Image supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleUpload = async () => {
    // Vérifier qu'au moins une image est sélectionnée
    if (!images.image1 && !images.image2 && !images.image3) {
      toast.error('Sélectionnez au moins une image');
      return;
    }

    try {
      setUploading(true);
      
      await productService.uploadImages({
        productId: Number(id),
        image1: images.image1 || undefined,
        image2: images.image2 || undefined,
        image3: images.image3 || undefined,
      });

      toast.success('Images uploadées avec succès !');
      
      // Recharger les images
      const imagesData = await productService.getProductImages(Number(id));
      setExistingImages(imagesData.images);
      
      // Réinitialiser les prévisualisations
      setImages({ image1: null, image2: null, image3: null });
      setImagePreviews({ image1: null, image2: null, image3: null });
      
    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const baseUrl = 'http://127.0.0.1:5019';
    return `${baseUrl}${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Produit non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Gérer les images</h1>
            <p className="text-gray-500">Produit : {product.name}</p>
          </div>
        </div>

        {/* Images existantes */}
        {existingImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Images actuelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {existingImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100">
                    <Image
                      src={getImageUrl(imageUrl)}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteExistingImage(imageUrl, index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <FiX size={16} />
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">Image {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload de nouvelles images */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Ajouter des images</h2>
          <p className="text-sm text-gray-500 mb-6">
            Vous pouvez ajouter jusqu'à 3 images. Format accepté : JPG, PNG, WEBP, GIF (max 5 Mo)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((num) => {
              const imageKey = `image${num}` as 'image1' | 'image2' | 'image3';
              return (
                <div key={num} className="border rounded-lg p-4">
                  <div className="relative aspect-square mb-2 bg-gray-50 rounded-lg overflow-hidden">
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
                        >
                          <FiX size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
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
                    className="block w-full text-center py-2 px-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {imagePreviews[imageKey] ? 'Changer' : 'Choisir un fichier'}
                  </label>
                </div>
              );
            })}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading || (!images.image1 && !images.image2 && !images.image3)}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiUpload />
              {uploading ? 'Upload en cours...' : 'Uploader les images'}
            </button>
            <button
              onClick={() => router.back()}
              disabled={uploading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}