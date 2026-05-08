// components/shop-studio/panels/AssetsPanel.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSquare, FiCircle, FiTriangle, FiImage, FiUpload, FiX, FiTrash2 } from 'react-icons/fi';
import { assetsService, ShopAsset } from '@/services/api/assets';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

interface Props {
  onSelectAsset: (asset: any) => void;
  shopId: number;
}

interface ShapeAsset {
  type: string;
  label: string;
  icon: any;
  defaultProps: any;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  assetId: number | null;
  assetName: string;
}

const SHAPES: ShapeAsset[] = [
  { 
    type: 'shape', 
    label: 'Carré', 
    icon: FiSquare, 
    defaultProps: { shape: 'square', width: 100, height: 100, backgroundColor: '#2563EB' } 
  },
  { 
    type: 'shape', 
    label: 'Cercle', 
    icon: FiCircle, 
    defaultProps: { shape: 'circle', width: 100, height: 100, backgroundColor: '#EC4899' } 
  },
  { 
    type: 'shape', 
    label: 'Triangle', 
    icon: FiTriangle, 
    defaultProps: { shape: 'triangle', width: 100, height: 100, backgroundColor: '#F59E0B' } 
  },
];

export default function AssetsPanel({ onSelectAsset, shopId }: Props) {
  const [activeTab, setActiveTab] = useState<'shapes' | 'my-images' | 'upload'>('shapes');
  const [myImages, setMyImages] = useState<ShopAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // ⭐ État pour le menu contextuel
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    assetId: null,
    assetName: '',
  });
  
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Charger les images de la boutique
  useEffect(() => {
    if (activeTab === 'my-images' && shopId) {
      fetchMyImages();
    }
  }, [activeTab, shopId]);

  // Fermer le menu contextuel au clic ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchMyImages = async () => {
    try {
      setLoading(true);
      const data = await assetsService.getShopAssets(shopId);
      setMyImages(data);
    } catch (error) {
      console.error('Erreur chargement images:', error);
      toast.error('Erreur lors du chargement des images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 10 Mo');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ⭐ MODIFICATION: Ajout de assetId lors de l'upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const newAsset = await assetsService.uploadAsset(shopId, selectedFile, 'image', 'uploaded');
      setMyImages(prev => [newAsset, ...prev]);
      
      // ⭐ Après upload, ajouter directement l'image au canvas avec assetId
      const fullUrl = getImageUrl(newAsset.url);
      onSelectAsset({
        type: 'image',
        label: newAsset.name,
        defaultProps: {
          url: fullUrl,
          alt: newAsset.name,
          width: 300,
          height: 200,
          borderRadius: 8,
          assetId: newAsset.id, // ⭐ AJOUT DE assetId
        }
      });
      
      setSelectedFile(null);
      setPreview(null);
      setActiveTab('my-images');
      toast.success('Image importée et ajoutée au canvas');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  // ⭐ Supprimer depuis le menu contextuel
  const handleDeleteFromMenu = async () => {
    if (!contextMenu.assetId) return;
    
    if (confirm(`Supprimer définitivement "${contextMenu.assetName}" ?`)) {
      try {
        setDeletingId(contextMenu.assetId);
        await assetsService.deleteAsset(shopId, contextMenu.assetId);
        setMyImages(prev => prev.filter(img => img.id !== contextMenu.assetId));
        toast.success(`"${contextMenu.assetName}" supprimée`);
      } catch (error) {
        console.error('Erreur suppression:', error);
        toast.error('Erreur lors de la suppression');
      } finally {
        setDeletingId(null);
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    } else {
      setContextMenu(prev => ({ ...prev, visible: false }));
    }
  };

  // ⭐ MODIFICATION: Ajout de assetId lors de la sélection d'une image
  const handleSelectImage = (asset: ShopAsset) => {
    if (!asset.url || asset.url.trim() === '') {
      toast.error("L'URL de l'image est invalide");
      return;
    }
    
    const fullUrl = getImageUrl(asset.url);
    
    onSelectAsset({
      type: 'image',
      label: asset.name,
      defaultProps: {
        url: fullUrl,
        alt: asset.name,
        width: 300,
        height: 200,
        borderRadius: 8,
        assetId: asset.id, // ⭐ AJOUT DE assetId
      }
    });
    toast.success(`Image "${asset.name}" ajoutée au canvas`);
  };

  // ⭐ Gestion du clic droit pour ouvrir le menu contextuel
  const handleContextMenu = (e: React.MouseEvent, assetId: number, assetName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      assetId,
      assetName,
    });
  };

  const handleSelectShape = (shape: ShapeAsset) => {
    onSelectAsset(shape);
  };

  const handleImageError = (assetId: number) => {
    setImageErrors(prev => ({ ...prev, [assetId]: true }));
  };

  const getAssetImageUrl = (asset: ShopAsset) => {
    return getImageUrl(asset.thumbnailUrl || asset.url);
  };

  // ⭐ Fermer le menu contextuel
  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="space-y-3" onClick={closeContextMenu}>
      {/* Onglets */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('shapes')}
          className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'shapes' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          Formes
        </button>
        <button
          onClick={() => setActiveTab('my-images')}
          className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'my-images' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          Mes images ({myImages.length})
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'upload' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          Upload
        </button>
      </div>

      {/* Formes */}
      {activeTab === 'shapes' && (
        <div className="grid grid-cols-2 gap-2">
          {SHAPES.map((shape, idx) => {
            const Icon = shape.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSelectShape(shape)}
                className="flex flex-col items-center gap-2 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all hover:scale-105"
              >
                <Icon size={28} className="text-primary" />
                <span className="text-white text-sm">{shape.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mes images */}
      {activeTab === 'my-images' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : myImages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiImage size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune image importée</p>
              <p className="text-xs mt-1">Onglet "Upload" pour importer vos images</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {myImages.map((asset) => {
                const imageUrl = getAssetImageUrl(asset);
                const hasError = imageErrors[asset.id];
                
                return (
                  <div
                    key={asset.id}
                    className={`group relative aspect-square bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all ${
                      deletingId === asset.id ? 'opacity-50' : ''
                    }`}
                    onClick={() => handleSelectImage(asset)}
                    onContextMenu={(e) => handleContextMenu(e, asset.id, asset.name)}
                  >
                    {!hasError && imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onError={() => handleImageError(asset.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <FiImage size={24} className="text-gray-500" />
                      </div>
                    )}
                    
                    {/* Overlay au survol - seulement "Utiliser" au clic gauche */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs bg-primary px-2 py-1 rounded">
                        Cliquer pour utiliser
                      </span>
                    </div>
                    
                    {/* Nom de l'image en bas */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {asset.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          {!preview ? (
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
              <FiUpload size={32} className="text-gray-400 mb-2" />
              <span className="text-gray-400 text-sm">Cliquer ou glisser une image</span>
              <span className="text-gray-500 text-xs mt-1">PNG, JPG, GIF, WebP (max 10MB)</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <img src={preview} alt="Aperçu" className="w-full h-full object-contain" />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
                >
                  <FiX size={16} className="text-white" />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Upload...' : 'Importer l\'image'}
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ⭐ Menu contextuel au clic droit */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleDeleteFromMenu}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
          >
            <FiTrash2 size={16} />
            Supprimer "{contextMenu.assetName}"
          </button>
        </div>
      )}
    </div>
  );
}