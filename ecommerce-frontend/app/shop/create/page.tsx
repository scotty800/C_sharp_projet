'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { shopService } from '@/services/api/shops';
import { generateSlug } from '@/services/utils/helpers';
import toast from 'react-hot-toast';

export default function CreateShopPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
  });
  const [slug, setSlug] = useState('');

  // Rediriger si non connecté
  if (!user) {
    router.push('/auth/login?redirect=/shop/create');
    return null;
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
    });
    setSlug(generateSlug(name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Veuillez remplir le nom de la boutique');
      return;
    }

    if (!slug) {
      toast.error('Le slug est requis');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Envoi des données:', {
        name: formData.name,
        description: formData.description,
        slug: slug,  // ← On envoie le slug !
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });

      const response = await shopService.createShop({
        name: formData.name,
        description: formData.description,
        slug: slug,  // ← C'EST OBLIGATOIRE
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });
      
      console.log('Réponse:', response);
      toast.success('Boutique créée avec succès !');
      router.push(`/shop/${response.shop.slug}`);
    } catch (error: any) {
      console.error('Erreur création:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Créer votre boutique</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la boutique *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ma boutique"
              required
            />
          </div>

          {/* Slug - Maintenant modifiable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la boutique *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">/shop/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="ma-boutique"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              L'URL sera : http://localhost:3000/shop/{slug || 'ma-boutique'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Décrivez votre boutique..."
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de contact
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="contact@boutique.com"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0123456789"
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Création en cours...' : 'Créer ma boutique'}
          </button>
        </form>
      </div>
    </div>
  );
}