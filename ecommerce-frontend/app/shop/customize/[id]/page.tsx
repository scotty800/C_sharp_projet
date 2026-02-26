'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { Shop } from '@/types/shop';
import { getImageUrl } from '@/utils/imageUtils';
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
  FiSettings
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CustomizeShopPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'colors' | 'images' | 'preview'>('info');
  const [saving, setSaving] = useState(false);

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

    const fetchShop = async () => {
      try {
        setLoading(true);
        const shopData = await shopService.getShopById(Number(id));
        
        if (shopData.ownerId !== user.id) {
          toast.error('Vous n\'êtes pas le propriétaire');
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
      } catch (error) {
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShop();
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

  const handleSave = async () => {
    try {
      setSaving(true);

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
        await shopService.uploadLogo(Number(id), logoFile);
      }

      if (bannerFile) {
        await shopService.uploadBanner(Number(id), bannerFile);
      }

      toast.success('Boutique personnalisée avec succès !');
      
      const shopData = await shopService.getShopById(Number(id));
      setShop(shopData);
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview(null);
      setBannerPreview(null);
    } catch (error) {
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
          <div className="flex gap-6 mt-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 pb-2 px-1 ${
                activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              <FiInfo />
              Informations
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex items-center gap-2 pb-2 px-1 ${
                activeTab === 'colors' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              <FiDroplet />
              Couleurs
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-2 pb-2 px-1 ${
                activeTab === 'images' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              <FiImage />
              Images
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 pb-2 px-1 ${
                activeTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'
              }`}
            >
              <FiSettings />
              Aperçu
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
                      onClick={() => handleSave()}
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
                      onClick={() => handleSave()}
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
      </div>
    </div>
  );
}