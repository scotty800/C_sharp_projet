'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiSearch, FiStar, FiShoppingCart, FiCheck, FiEye } from 'react-icons/fi';
import { assetsService } from '@/services/api/assets';
import toast from 'react-hot-toast';

interface Template {
  id: number;
  name: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  isPremium: boolean;
  price: number;
  usageCount: number;
}

interface Props {
  onApplyTemplate: (template: any) => void;
}

const CATEGORIES = ['tous', 'general', 'mode', 'electronique', 'maison', 'beaute', 'sport', 'alimentation'];

export default function TemplatesPanel({ onApplyTemplate }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('tous');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await assetsService.getTemplates(activeCategory === 'tous' ? undefined : activeCategory);
        setTemplates(data);
      } catch (error) {
        console.error('Erreur chargement templates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [activeCategory]);

  const filteredTemplates = templates.filter(template => {
    if (search && !template.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleApply = (template: Template) => {
    if (template.isPremium) {
      // Pour les templates premium, on pourrait ouvrir un modal de paiement
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-medium">Template premium : {template.price} €</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onApplyTemplate(template);
              }}
              className="bg-primary text-white px-3 py-1 rounded text-sm"
            >
              Acheter et appliquer
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    } else {
      onApplyTemplate(template);
    }
  };

  return (
    <div className="space-y-4">
      {/* Recherche */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 size-4" />
        <input
          type="text"
          placeholder="Rechercher un template..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm"
        />
      </div>

      {/* Catégories */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {cat === 'tous' ? 'Tous' : cat}
          </button>
        ))}
      </div>

      {/* Grille des templates */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          Aucun template trouvé
        </p>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="relative h-32 bg-gray-700">
                {template.thumbnailUrl ? (
                  <Image
                    src={template.thumbnailUrl}
                    alt={template.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Aperçu
                  </div>
                )}
                {template.isPremium && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FiStar size={10} />
                    {template.price} €
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  Utilisé {template.usageCount} fois
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-white font-medium text-sm">{template.name}</h3>
                <p className="text-gray-400 text-xs line-clamp-2 mt-1">{template.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(template);
                  }}
                  className="w-full mt-3 bg-primary hover:bg-primary-dark text-white text-sm py-1.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FiCheck size={14} />
                  Appliquer ce template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Preview */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">{selectedTemplate.name}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiEye size={20} />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
              {selectedTemplate.previewUrl ? (
                <div className="relative w-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden">
                  <Image
                    src={selectedTemplate.previewUrl}
                    alt={selectedTemplate.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Aperçu non disponible
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => handleApply(selectedTemplate)}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-lg transition-colors"
              >
                Appliquer ce template
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}