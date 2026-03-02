'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { productService } from '@/services/api/products';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { getImageUrl, getValidProductImages } from '@/utils/imageUtils';
import { extractProductsFromResponse } from '@/utils/productUtils';
import { 
  FiUpload, 
  FiSave, 
  FiEye, 
  FiArrowLeft,
  FiDroplet,
  FiImage,
  FiInfo,
  FiMail,
  FiPhone,
  FiSettings,
  FiPackage,
  FiPlus,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CustomizeShopPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'colors' | 'images' | 'preview' | 'products'>('info');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // États pour les formulaires
  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
  });

  const [colors, setColors] = useState({
    themeColor: '#e50914',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  });

  // États pour les uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchShopData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Récupération de la boutique avec ID:', id);
        
        const shopData = await shopService.getShopById(Number(id));
        console.log('🏪 Boutique trouvée:', shopData);
        
        if (shopData.ownerId !== user.id) {
          toast.error('Vous n\'êtes pas le propriétaire de cette boutique');
          router.push('/');
          return;
        }

        setShop(shopData);
        setShopForm({
          name: shopData.name,
          description: shopData.description || '',
          email: shopData.email || '',
          phone: shopData.phone || '',
        });
        setColors({
          themeColor: shopData.themeColor || '#e50914',
          backgroundColor: shopData.backgroundColor || '#ffffff',
          textColor: shopData.textColor || '#000000',
        });

        // Récupérer les produits
        await fetchProducts(shopData.id);
        
      } catch (error) {
        console.error('❌ Erreur:', error);
        toast.error('Impossible de charger la boutique');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShopData();
    }
  }, [id, user, router]);

  const fetchProducts = async (shopId: number) => {
    try {
      setProductsLoading(true);
      console.log('📦 Récupération des produits pour shopId:', shopId);
      
      const response = await productService.getProductsByShop(shopId, {
        pageSize: 50
      });
      
      console.log('📦 Réponse API:', response);
      
      // Utiliser la fonction utilitaire pour extraire les produits
      const extractedProducts = extractProductsFromResponse(response);
      console.log('📋 Produits extraits:', extractedProducts.length);
      
      setProducts(extractedProducts);
      
    } catch (error) {
      console.error('❌ Erreur chargement produits:', error);
      toast.error('Erreur lors du chargement des produits');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
      return;
    }

    try {
      setDeletingId(productId);
      console.log('🗑️ Suppression produit:', productId);
      
      await productService.deleteProduct(productId);
      
      // Mettre à jour la liste
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Produit supprimé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Sauvegarde boutique...');

      await shopService.updateShop(Number(id), {
        name: shopForm.name,
        description: shopForm.description,
        email: shopForm.email || undefined,
        phone: shopForm.phone || undefined,
        themeColor: colors.themeColor,
        backgroundColor: colors.backgroundColor,
        textColor: colors.textColor,
      });

      if (logoFile) {
        console.log('📤 Upload logo...');
        await shopService.uploadLogo(Number(id), logoFile);
      }

      if (bannerFile) {
        console.log('📤 Upload bannière...');
        await shopService.uploadBanner(Number(id), bannerFile);
      }

      toast.success('Boutique personnalisée avec succès !');
      
      // Recharger la boutique
      const shopData = await shopService.getShopById(Number(id));
      setShop(shopData);
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview(null);
      setBannerPreview(null);
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleViewShop = () => {
    if (shop) {
      router.push(`/shop/${shop.slug}`);
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold">Personnaliser {shop.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleViewShop}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FiEye />
                Voir la boutique
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <FiSave />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex gap-6 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 pb-2 px-1 whitespace-nowrap ${
                activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              <FiInfo />
              Informations
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex items-center gap-2 pb-2 px-1 whitespace-nowrap ${
                activeTab === 'colors' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              <FiDroplet />
              Couleurs
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-2 pb-2 px-1 whitespace-nowrap ${
                activeTab === 'images' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              <FiImage />
              Images
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 pb-2 px-1 whitespace-nowrap ${
                activeTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              <FiSettings />
              Aperçu
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 pb-2 px-1 whitespace-nowrap ${
                activeTab === 'products' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              <FiPackage />
              Produits {products.length > 0 && `(${products.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'info' && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Informations générales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la boutique
                </label>
                <input
                  type="text"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({...shopForm, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={shopForm.description}
                  onChange={(e) => setShopForm({...shopForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={shopForm.email}
                    onChange={(e) => setShopForm({...shopForm, email: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={shopForm.phone}
                    onChange={(e) => setShopForm({...shopForm, phone: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Couleurs de la boutique</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur principale
                  </label>
                  <input
                    type="color"
                    value={colors.themeColor}
                    onChange={(e) => setColors({...colors, themeColor: e.target.value})}
                    className="w-full h-12 border rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur de fond
                  </label>
                  <input
                    type="color"
                    value={colors.backgroundColor}
                    onChange={(e) => setColors({...colors, backgroundColor: e.target.value})}
                    className="w-full h-12 border rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur du texte
                  </label>
                  <input
                    type="color"
                    value={colors.textColor}
                    onChange={(e) => setColors({...colors, textColor: e.target.value})}
                    className="w-full h-12 border rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Aperçu des couleurs */}
              <div className="mt-8 p-6 rounded-lg border">
                <h3 className="font-medium mb-4">Aperçu</h3>
                <div 
                  className="p-6 rounded-lg space-y-4"
                  style={{ 
                    backgroundColor: colors.backgroundColor,
                    color: colors.textColor
                  }}
                >
                  <p>Texte d'exemple avec la couleur choisie</p>
                  <button
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: colors.themeColor }}
                  >
                    Bouton principal
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg ml-2 border"
                    style={{ 
                      borderColor: colors.themeColor,
                      color: colors.themeColor
                    }}
                  >
                    Bouton secondaire
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Logo */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Logo</h2>
              <div className="flex items-start gap-6">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border bg-white">
                  {(logoPreview || shop.logoUrl) ? (
                    <Image
                      src={logoPreview || (shop.logoUrl ? getImageUrl(shop.logoUrl) : '')}
                      alt="Logo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <FiImage className="text-gray-400" size={32} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo"
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <FiUpload />
                    Choisir un fichier
                  </label>
                  {logoFile && (
                    <button
                      onClick={handleSave}
                      className="ml-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Uploader
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Format recommandé : carré, min 200x200px
                  </p>
                </div>
              </div>
            </div>

            {/* Bannière */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Bannière</h2>
              <div className="space-y-4">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-white">
                  {(bannerPreview || shop.bannerUrl) ? (
                    <Image
                      src={bannerPreview || (shop.bannerUrl ? getImageUrl(shop.bannerUrl) : '')}
                      alt="Bannière"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <FiImage className="text-gray-400" size={48} />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="banner"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="banner"
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <FiUpload />
                    Choisir un fichier
                  </label>
                  {bannerFile && (
                    <button
                      onClick={handleSave}
                      className="ml-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Uploader
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Format recommandé : 1200x300px
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && shop && (
          <div className="max-w-4xl mx-auto">
            <div 
              className="rounded-lg shadow-lg overflow-hidden"
              style={{ 
                backgroundColor: colors.backgroundColor,
                color: colors.textColor
              }}
            >
              {/* Bannière */}
              <div className="relative h-48 w-full bg-gray-200">
                {(bannerPreview || shop.bannerUrl) ? (
                  <Image
                    src={bannerPreview || (shop.bannerUrl ? getImageUrl(shop.bannerUrl) : '')}
                    alt="Bannière"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div 
                    className="w-full h-full"
                    style={{ backgroundColor: colors.themeColor, opacity: 0.3 }}
                  />
                )}
              </div>
              
              <div className="p-6">
                {/* Logo et nom */}
                <div className="flex items-center gap-4 -mt-12 mb-6">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border-4 border-white bg-white">
                    {(logoPreview || shop.logoUrl) ? (
                      <Image
                        src={logoPreview || (shop.logoUrl ? getImageUrl(shop.logoUrl) : '')}
                        alt="Logo"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                        style={{ backgroundColor: colors.themeColor }}
                      >
                        {shopForm.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{shopForm.name || shop.name}</h2>
                    <p className="opacity-75">{shopForm.description || shop.description}</p>
                  </div>
                </div>

                {/* Bouton exemple */}
                <button
                  className="px-6 py-3 rounded-lg text-white"
                  style={{ backgroundColor: colors.themeColor }}
                >
                  Bouton avec la couleur principale
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET PRODUITS */}
        {activeTab === 'products' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Gestion des produits</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {products.length} produit(s) dans cette boutique
                  </p>
                </div>
                <Link
                  href={`/product/create?shopId=${shop.id}`}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FiPlus />
                  Ajouter un produit
                </Link>
              </div>

              {productsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-500 mt-4">Chargement des produits...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <FiPackage className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Aucun produit</h3>
                  <p className="text-gray-500 mb-6">
                    Cette boutique n'a pas encore de produits.
                  </p>
                  <Link
                    href={`/product/create?shopId=${shop.id}`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    <FiPlus />
                    Ajouter votre premier produit
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const productImages = getValidProductImages(product);
                    const imageUrl = productImages.length > 0 
                      ? getImageUrl(productImages[0]) 
                      : '/images/product-placeholder.svg';
                    
                    return (
                      <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                          <Image
                            src={imageUrl}
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
                            <div className="text-xs text-gray-400 mt-1">
                              {productImages.length} image(s)
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              href={`/product/edit/${product.id}`}
                              className="text-gray-400 hover:text-primary transition-colors p-1"
                              title="Modifier"
                            >
                              <FiEdit size={20} />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              disabled={deletingId === product.id}
                              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-1"
                              title="Supprimer"
                            >
                              <FiTrash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}