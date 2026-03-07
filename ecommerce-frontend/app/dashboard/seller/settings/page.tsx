'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { FiArrowLeft, FiSave, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SellerSettingsPage() {
  const searchParams = useSearchParams();
  const shopId = Number(searchParams.get('shopId'));
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shop, setShop] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!user || !shopId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const shopData = await shopService.getShopById(shopId);
        setShop(shopData);
        
        setFormData({
          name: shopData.name || '',
          description: shopData.description || '',
          email: shopData.email || '',
          phone: shopData.phone || '',
        });
      } catch (error) {
        console.error('Erreur chargement boutique:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      await shopService.updateShop(shopId, {
        name: formData.name,
        description: formData.description,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });
      
      toast.success('Paramètres mis à jour avec succès');
      
      // Recharger les données
      const updatedShop = await shopService.getShopById(shopId);
      setShop(updatedShop);
      
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
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
        <Link href={`/dashboard/seller?shopId=${shopId}`} className="text-gray-600 hover:text-primary">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Paramètres de la boutique</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <p className="text-gray-600 mb-4">
          Boutique : <span className="font-semibold">{shop?.name}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Informations générales</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la boutique
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Coordonnées</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiMail className="inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiSave />
            {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* Note d'information */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Pour modifier le logo, la bannière ou les couleurs,</p>
        <Link href={`/shop/customize/${shopId}`} className="text-primary hover:underline">
          allez dans Personnaliser
        </Link>
      </div>
    </div>
  );
}