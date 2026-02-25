'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { productService } from '@/services/api/products';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { FiUpload, FiSave, FiPlus, FiTrash2, FiEdit, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ManageShopPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'products' | 'appearance'>('info');

  // États pour les formulaires
  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
  });

  const [appearance, setAppearance] = useState({
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
        const shopData = await shopService.getShopById(Number(id));
        
        // Vérifier que l'utilisateur est bien le propriétaire
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
        setAppearance({
          themeColor: shopData.themeColor || '#e50914',
          backgroundColor: shopData.backgroundColor || '#ffffff',
          textColor: shopData.textColor || '#000000',
        });

        // Récupérer les produits
        const productsData = await productService.getProductsByShop(shopData.id, {
          pageSize: 50
        });
        setProducts(productsData.products.data || []);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Impossible de charger la boutique');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShopData();
    }
  }, [id, user, router]);

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

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    
    try {
      await shopService.uploadLogo(Number(id), logoFile);
      toast.success('Logo mis à jour');
      setLogoFile(null);
      setLogoPreview(null);
      // Recharger la boutique
      const shopData = await shopService.getShopById(Number(id));
      setShop(shopData);
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    }
  };

  const handleUploadBanner = async () => {
    if (!bannerFile) return;
    
    try {
      await shopService.uploadBanner(Number(id), bannerFile);
      toast.success('Bannière mise à jour');
      setBannerFile(null);
      setBannerPreview(null);
      const shopData = await shopService.getShopById(Number(id));
      setShop(shopData);
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    }
  };

  const handleUpdateShop = async () => {
    try {
      await shopService.updateShop(Number(id), {
        name: shopForm.name,
        description: shopForm.description,
        email: shopForm.email || undefined,
        phone: shopForm.phone || undefined,
        themeColor: appearance.themeColor,
        backgroundColor: appearance.backgroundColor,
        textColor: appearance.textColor,
      });
      toast.success('Boutique mise à jour');
      const shopData = await shopService.getShopById(Number(id));
      setShop(shopData);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Gérer ma boutique : {shop.name}</h1>

        {/* Onglets */}
        <div className="flex border-b mb-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-6 py-3 font-medium ${activeTab === 'appearance' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
          >
            Apparence
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-medium ${activeTab === 'products' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
          >
            Produits ({products.length})
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Informations de la boutique</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({...shopForm, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={shopForm.description}
                  onChange={(e) => setShopForm({...shopForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                <input
                  type="email"
                  value={shopForm.email}
                  onChange={(e) => setShopForm({...shopForm, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={shopForm.phone}
                  onChange={(e) => setShopForm({...shopForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleUpdateShop}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
              >
                <FiSave />
                Enregistrer les modifications
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            {/* Logo */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Logo</h2>
              <div className="flex items-start gap-6">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  {(logoPreview || shop.logoUrl) ? (
                    <Image
                      src={logoPreview || shop.logoUrl || ''}
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <FiImage className="text-gray-400" size={32} />
                    </div>
                  )}
                </div>
                <div>
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
                      onClick={handleUploadLogo}
                      className="ml-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Uploader
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bannière */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Bannière</h2>
              <div className="space-y-4">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  {(bannerPreview || shop.bannerUrl) ? (
                    <Image
                      src={bannerPreview || shop.bannerUrl || ''}
                      alt="Bannière"
                      fill
                      className="object-cover"
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
                      onClick={handleUploadBanner}
                      className="ml-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Uploader
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Couleurs */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Couleurs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
                  <input
                    type="color"
                    value={appearance.themeColor}
                    onChange={(e) => setAppearance({...appearance, themeColor: e.target.value})}
                    className="w-full h-10 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de fond</label>
                  <input
                    type="color"
                    value={appearance.backgroundColor}
                    onChange={(e) => setAppearance({...appearance, backgroundColor: e.target.value})}
                    className="w-full h-10 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du texte</label>
                  <input
                    type="color"
                    value={appearance.textColor}
                    onChange={(e) => setAppearance({...appearance, textColor: e.target.value})}
                    className="w-full h-10 border rounded"
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateShop}
                className="mt-4 flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
              >
                <FiSave />
                Appliquer les couleurs
              </button>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Produits</h2>
              <button
                onClick={() => router.push(`/product/create?shopId=${shop.id}`)}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiPlus />
                Ajouter un produit
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun produit dans cette boutique</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <FiImage className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.price} €</p>
                      <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/product/edit/${product.id}`)}
                      className="text-gray-400 hover:text-primary"
                    >
                      <FiEdit size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}