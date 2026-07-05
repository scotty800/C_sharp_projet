'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/services/api/products';
import { Product } from '@/types/product';
import { CreateStudioProduct, StudioProduct, ColorVariant } from '@/types/studio';
import Image from 'next/image';
import { FiStar, FiTrash2, FiMove, FiSave, FiX, FiUpload, FiFolder, FiExternalLink, FiImage, FiPlus, FiEdit2 } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Props {
  shopId: number;
  featuredProducts: any[];
  onUpdateFeatured: (products: any[]) => void;
  onCreateProduct?: (product: CreateStudioProduct) => Promise<StudioProduct>;
  assets?: Array<{ id: number; url: string; name: string; type: string }>;
  onUploadAsset?: (file: File) => Promise<{ url: string }>;
}

const PREDEFINED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const PREDEFINED_COLORS = [
  { name: 'Noir', value: '#000000' }, { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Gris', value: '#808080' }, { name: 'Rouge', value: '#FF0000' },
  { name: 'Bleu', value: '#0000FF' }, { name: 'Vert', value: '#00FF00' },
  { name: 'Jaune', value: '#FFFF00' }, { name: 'Orange', value: '#FFA500' },
  { name: 'Violet', value: '#800080' }, { name: 'Rose', value: '#FFC0CB' },
];

export default function ProductsPanel({ 
  shopId, 
  featuredProducts, 
  onUpdateFeatured,
  onCreateProduct,
  assets = [],
  onUploadAsset,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  
  const [editingVariantColor, setEditingVariantColor] = useState<string | null>(null);
  const [variantImages, setVariantImages] = useState<Record<string, { image1?: File; image2?: File; image3?: File }>>({});
  const [uploadingVariant, setUploadingVariant] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: 0, stock: 0, category: '',
    sizes: [] as string[],
    colors: [] as { name: string; value: string }[],
    imageUrl1: '',
    imageUrl2: '',
    imageUrl3: '',
    isInStock: true,
    colorVariants: {} as Record<string, ColorVariant>,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductsByShop(shopId, { pageSize: 100 });
      
      let extractedProducts: Product[] = [];
      
      if (response && (response as any).products?.items) {
        extractedProducts = (response as any).products.items;
      } else if (Array.isArray(response)) {
        extractedProducts = response;
      }
      
      setProducts(extractedProducts);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [shopId]);

  const featuredIds = featuredProducts.map(p => p.productId);
  const nonFeaturedProducts = products.filter(p => !featuredIds.includes(p.id));
  const filteredNonFeatured = nonFeaturedProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToFeatured = (product: Product) => {
    const newFeatured = [
      ...featuredProducts,
      {
        productId: product.id,
        isFeatured: true,
        featuredOrder: featuredProducts.length,
        productBackgroundType: 'white',
        productFrameStyle: 'rounded',
        productHoverEffect: 'zoom',
      },
    ];
    onUpdateFeatured(newFeatured);
  };

  const removeFromFeatured = (productId: number) => {
    onUpdateFeatured(featuredProducts.filter(p => p.productId !== productId));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(featuredProducts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const reordered = items.map((item, idx) => ({ ...item, featuredOrder: idx }));
    onUpdateFeatured(reordered);
  };

  const removeImage = (idx: number) => {
    if (idx === 0) {
      setNewProduct(p => ({ ...p, imageUrl1: '' }));
    } else if (idx === 1) {
      setNewProduct(p => ({ ...p, imageUrl2: '' }));
    } else if (idx === 2) {
      setNewProduct(p => ({ ...p, imageUrl3: '' }));
    }
  };

  const triggerFileUpload = (idx: number) => {
    setCurrentImageIndex(idx);
    document.getElementById('product-file-input')?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image trop grande (max 5MB)"); return; }
    setUploadingImageIndex(currentImageIndex);
    try {
      const url = onUploadAsset ? (await onUploadAsset(file)).url : URL.createObjectURL(file);
      if (currentImageIndex === 0) {
        setNewProduct(p => ({ ...p, imageUrl1: url }));
      } else if (currentImageIndex === 1) {
        setNewProduct(p => ({ ...p, imageUrl2: url }));
      } else if (currentImageIndex === 2) {
        setNewProduct(p => ({ ...p, imageUrl3: url }));
      }
    } catch { alert("Erreur lors de l'upload"); }
    finally { setUploadingImageIndex(null); }
  };

  const selectFromLibrary = (url: string) => {
    if (currentImageIndex === 0) {
      setNewProduct(p => ({ ...p, imageUrl1: url }));
    } else if (currentImageIndex === 1) {
      setNewProduct(p => ({ ...p, imageUrl2: url }));
    } else if (currentImageIndex === 2) {
      setNewProduct(p => ({ ...p, imageUrl3: url }));
    }
    setShowImageSelector(false);
  };

  const toggleSize = (size: string) => {
    const s = Array.isArray(newProduct.sizes) ? newProduct.sizes : [];
    setNewProduct(p => ({ ...p, sizes: s.includes(size) ? s.filter(x => x !== size) : [...s, size] }));
  };

  const toggleColor = (name: string, value: string) => {
    const c = Array.isArray(newProduct.colors) ? newProduct.colors : [];
    setNewProduct(p => ({
      ...p,
      colors: c.find(x => x.name === name) ? c.filter(x => x.name !== name) : [...c, { name, value }],
    }));
  };

  const getColorVariant = (colorValue: string): ColorVariant | undefined => {
    return newProduct.colorVariants[colorValue];
  };

  const updateColorVariant = (colorValue: string, updates: Partial<ColorVariant>) => {
    setNewProduct(p => ({
      ...p,
      colorVariants: {
        ...p.colorVariants,
        [colorValue]: {
          ...p.colorVariants[colorValue],
          ...updates,
          color: colorValue,
        },
      },
    }));
  };

  const handleVariantImageUpload = (color: string, field: 'image1' | 'image2' | 'image3', file: File) => {
    setVariantImages(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        [field]: file,
      },
    }));
    const url = URL.createObjectURL(file);
    updateColorVariant(color, { [`${field}`]: url });
  };

  const triggerVariantFileUpload = (color: string, field: 'image1' | 'image2' | 'image3') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleVariantImageUpload(color, field, file);
      }
    };
    input.click();
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0) { 
      alert("Nom et prix requis"); 
      return; 
    }
    
    setIsCreating(true);
    try {
      const mainImage = newProduct.imageUrl1 || '';
      const secondaryImages = [
        newProduct.imageUrl2,
        newProduct.imageUrl3
      ].filter(img => img && img.trim() !== '' && img !== mainImage);
      
      const toCreate: CreateStudioProduct = {
        name: newProduct.name,
        description: newProduct.description || '',
        price: newProduct.price,
        stock: newProduct.stock || 0,
        category: newProduct.category || '',
        sizes: newProduct.sizes.filter(Boolean),
        colors: newProduct.colors.map(c => c.value).filter(Boolean),
        imageUrl1: mainImage,
        imageUrl2: secondaryImages[0] || '',
        imageUrl3: secondaryImages[1] || '',
        isInStock: newProduct.stock > 0,
        colorVariants: Object.values(newProduct.colorVariants).filter(v => v.color),
      };
      
      console.log('📤 Envoi au backend:', {
        imageUrl1: toCreate.imageUrl1,
        imageUrl2: toCreate.imageUrl2,
        imageUrl3: toCreate.imageUrl3,
        colorVariants: toCreate.colorVariants,
      });
      
      if (onCreateProduct) {
        const created = await onCreateProduct(toCreate);
        console.log('✅ Produit créé:', created);
        
        for (const variant of Object.values(newProduct.colorVariants)) {
          if (variant.color) {
            const files = variantImages[variant.color];
            if (files && Object.values(files).some(f => f)) {
              try {
                await productService.uploadVariantImages(
                  created.id,
                  variant.color,
                  files
                );
                console.log(`✅ Images uploadées pour la variante ${variant.color}`);
              } catch (error) {
                console.error(`❌ Erreur upload images pour ${variant.color}:`, error);
              }
            }
          }
        }
        
        await fetchProducts();
      }
      
      setNewProduct({ 
        name: '', description: '', price: 0, stock: 0, category: '', 
        sizes: [], colors: [], 
        imageUrl1: '', imageUrl2: '', imageUrl3: '', 
        isInStock: true,
        colorVariants: {},
      });
      setVariantImages({});
      setShowCreateProduct(false);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur lors de la création du produit');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <input id="product-file-input" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      {onCreateProduct && (
        <button
          onClick={() => setShowCreateProduct(true)}
          className="w-full py-2 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-green-500/30 transition-colors"
        >
          <FiSave size={14} /> Créer un produit
        </button>
      )}

      {/* Produits mis en avant */}
      <div>
        <h3 className="text-white font-semibold mb-3">Produits en avant</h3>
        {featuredProducts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Aucun produit mis en avant</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="featured">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {featuredProducts.map((fp, index) => {
                    const product = products.find(p => p.id === fp.productId);
                    if (!product) return null;
                    return (
                      <Draggable key={fp.productId} draggableId={String(fp.productId)} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg"
                          >
                            <div {...provided.dragHandleProps}>
                              <FiMove className="text-gray-500" />
                            </div>
                            <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-700">
                              <Image
                                src={product.imageUrl1 || product.imageUrl || '/images/product-placeholder.svg'}
                                alt={product.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-white text-sm">{product.name}</div>
                              <div className="text-primary text-xs">{product.price} €</div>
                            </div>
                            <button onClick={() => removeFromFeatured(product.id)} className="text-red-400 hover:text-red-300">
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Produits disponibles */}
      <div>
        <h3 className="text-white font-semibold mb-3">Ajouter un produit</h3>
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mb-3"
        />
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredNonFeatured.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            {search ? 'Aucun produit correspondant' : 'Aucun produit disponible'}
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredNonFeatured.map(product => (
              <button
                key={product.id}
                onClick={() => addToFeatured(product)}
                className="w-full flex items-center gap-3 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
              >
                <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-700">
                  <Image
                    src={product.imageUrl1 || product.imageUrl || '/images/product-placeholder.svg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm">{product.name}</div>
                  <div className="text-primary text-xs">{product.price} €</div>
                </div>
                <FiStar className="text-gray-500" size={16} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Options d'affichage */}
      {featuredProducts.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-semibold mb-3">Options d'affichage</h3>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Style de cadre</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              onChange={(e) => {
                const newStyle = e.target.value;
                const updated = featuredProducts.map(fp => ({ ...fp, productFrameStyle: newStyle }));
                onUpdateFeatured(updated);
              }}
            >
              <option value="rounded">Arrondi</option>
              <option value="circle">Cercle</option>
              <option value="shadow">Ombre</option>
              <option value="border">Bordure</option>
              <option value="none">Aucun</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Effet au survol</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              onChange={(e) => {
                const newEffect = e.target.value;
                const updated = featuredProducts.map(fp => ({ ...fp, productHoverEffect: newEffect }));
                onUpdateFeatured(updated);
              }}
            >
              <option value="zoom">Zoom</option>
              <option value="glow">Lueur</option>
              <option value="slide">Glissement</option>
              <option value="none">Aucun</option>
            </select>
          </div>
        </div>
      )}

      {/* Modal de création de produit */}
      {showCreateProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" onClick={() => setShowCreateProduct(false)}>
          <div className="bg-gray-900 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
              <h3 className="text-white font-semibold">Créer un produit</h3>
              <button onClick={() => setShowCreateProduct(false)}><FiX size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div>
                <label className="text-white text-sm block mb-1">Nom *</label>
                <input type="text" value={newProduct.name}
                  onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white text-sm block mb-1">Prix *</label>
                  <input type="number" step="0.01" value={newProduct.price || ''}
                    onChange={(e) => setNewProduct(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="text-white text-sm block mb-1">Stock</label>
                  <input type="number" value={newProduct.stock || ''}
                    onChange={(e) => setNewProduct(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="text-white text-sm block mb-1">Catégorie</label>
                <input type="text" value={newProduct.category}
                  onChange={(e) => setNewProduct(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-white text-sm block mb-1">Description</label>
                <textarea rows={3} value={newProduct.description}
                  onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none" />
              </div>

              {/* Images */}
              <div>
                <label className="text-white text-sm block mb-2">Images</label>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2].map((idx) => {
                    const imageUrl = idx === 0 ? newProduct.imageUrl1 : idx === 1 ? newProduct.imageUrl2 : newProduct.imageUrl3;
                    const label = idx === 0 ? 'Principale *' : idx === 1 ? 'Image 2' : 'Image 3';
                    return (
                      <div key={idx} className="border border-gray-700 rounded-lg p-2">
                        <label className="text-gray-400 text-xs">{label}</label>
                        <div className="relative w-full aspect-square bg-gray-800 rounded-lg overflow-hidden mt-1">
                          {imageUrl ? (
                            <>
                              <img src={imageUrl} className="w-full h-full object-cover" />
                              <button onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"><FiX size={12} /></button>
                            </>
                          ) : (
                            <div className="flex h-full">
                              <button onClick={() => triggerFileUpload(idx)}
                                className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-700 transition-colors">
                                {uploadingImageIndex === idx
                                  ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                  : <><FiUpload size={18} /><span className="text-[11px]">Upload</span></>}
                              </button>
                              {assets.length > 0 && (
                                <button onClick={() => { setCurrentImageIndex(idx); setShowImageSelector(true); }}
                                  className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-700 transition-colors border-l border-gray-700">
                                  <FiFolder size={18} /><span className="text-[11px]">Biblio</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">⚠️ L'image principale sera utilisée comme image principale du produit</p>
              </div>

              {/* Tailles */}
              <div>
                <label className="text-white text-sm block mb-2">Tailles</label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_SIZES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${newProduct.sizes.includes(s) ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* ⭐ COULEURS AVEC VARIANTES */}
              <div>
                <label className="text-white text-sm block mb-2">Couleurs</label>
                <div className="flex flex-wrap gap-3">
                  {PREDEFINED_COLORS.map(c => {
                    const variant = getColorVariant(c.value);
                    const isSelected = newProduct.colors.some(x => x.name === c.name);
                    return (
                      <div key={c.name} className="relative group">
                        <button 
                          type="button" 
                          onClick={() => toggleColor(c.name, c.value)}
                          className={`w-10 h-10 rounded-full transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-gray-900 scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: c.value, border: c.value === '#FFFFFF' ? '1px solid #555' : 'none' }}
                          title={c.name} 
                        />
                        {isSelected && (
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setEditingVariantColor(c.value);
                            }}
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white hover:bg-primary/80 transition-colors shadow-lg"
                            title={`Configurer ${c.name}`}
                          >
                            <FiPlus size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Cliquez sur <FiPlus className="inline" size={10} /> pour configurer les détails d'une couleur
                </p>
              </div>

              {/* ⭐ MODAL DE CONFIGURATION DE VARIANTE DE COULEUR */}
              {editingVariantColor && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50" onClick={() => setEditingVariantColor(null)}>
                  <div className="bg-gray-900 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between p-4 border-b border-gray-700">
                      <h3 className="text-white font-semibold">
                        Configurer la variante
                        <span className="block text-sm font-normal text-gray-400">
                          {PREDEFINED_COLORS.find(c => c.value === editingVariantColor)?.name}
                        </span>
                      </h3>
                      <button onClick={() => setEditingVariantColor(null)}><FiX size={20} /></button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-white text-sm block mb-1">Nom personnalisé</label>
                        <input 
                          type="text" 
                          value={getColorVariant(editingVariantColor)?.customName || ''}
                          onChange={(e) => updateColorVariant(editingVariantColor, { customName: e.target.value })}
                          placeholder="Ex: Rouge foncé"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm block mb-1">Stock</label>
                        <input 
                          type="number" 
                          value={getColorVariant(editingVariantColor)?.stock || 0}
                          onChange={(e) => updateColorVariant(editingVariantColor, { stock: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm block mb-1">Tailles</label>
                        <div className="flex flex-wrap gap-1.5">
                          {PREDEFINED_SIZES.map(s => {
                            const currentSizes = getColorVariant(editingVariantColor)?.sizes || [];
                            const isSelected = currentSizes.includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  const current = getColorVariant(editingVariantColor)?.sizes || [];
                                  const newSizes = isSelected 
                                    ? current.filter(x => x !== s)
                                    : [...current, s];
                                  updateColorVariant(editingVariantColor, { sizes: newSizes });
                                }}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  isSelected 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="text-white text-sm block mb-2">Images de la variante</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['image1', 'image2', 'image3'].map((field) => {
                            const variant = getColorVariant(editingVariantColor);
                            const imageUrl = variant?.[field as keyof ColorVariant] as string || '';
                            const file = variantImages[editingVariantColor]?.[field as keyof typeof variantImages[string]];
                            return (
                              <div key={field} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                {imageUrl ? (
                                  <>
                                    <img src={imageUrl} className="w-full h-full object-cover" />
                                    <button 
                                      onClick={() => {
                                        updateColorVariant(editingVariantColor, { [field]: null });
                                        setVariantImages(prev => {
                                          const newFiles = { ...prev[editingVariantColor] };
                                          delete newFiles[field as keyof typeof newFiles];
                                          return { ...prev, [editingVariantColor]: newFiles };
                                        });
                                      }}
                                      className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full"
                                    >
                                      <FiX size={10} />
                                    </button>
                                    {file && (
                                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-500/80 text-white text-[8px] rounded">
                                        Nouveau
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <button 
                                    onClick={() => triggerVariantFileUpload(editingVariantColor, field as 'image1' | 'image2' | 'image3')}
                                    className="w-full h-full flex items-center justify-center text-gray-400 hover:bg-gray-700 transition-colors"
                                  >
                                    <FiUpload size={16} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Images spécifiques à cette couleur</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 border-t border-gray-700">
                      <button 
                        onClick={() => {
                          const newVariants = { ...newProduct.colorVariants };
                          delete newVariants[editingVariantColor];
                          setNewProduct(p => ({ ...p, colorVariants: newVariants }));
                          setEditingVariantColor(null);
                        }}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                      >
                        Supprimer
                      </button>
                      <button 
                        onClick={() => setEditingVariantColor(null)}
                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 border-t border-gray-700 sticky bottom-0 bg-gray-900">
              <button onClick={() => setShowCreateProduct(false)}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Annuler
              </button>
              <button onClick={handleCreateProduct}
                disabled={isCreating || !newProduct.name || newProduct.price <= 0}
                className="flex-1 py-2 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors">
                {isCreating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bibliothèque d'images */}
      {showImageSelector && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50" onClick={() => setShowImageSelector(false)}>
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Bibliothèque d'images</h3>
              <button onClick={() => setShowImageSelector(false)}><FiX size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {assets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiImage size={40} className="mx-auto mb-3 opacity-40" />
                  <p>Aucune image dans la bibliothèque</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {assets.filter(a => a.type === 'image').map((asset) => (
                    <button key={asset.id} onClick={() => selectFromLibrary(asset.url)}
                      className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiExternalLink size={20} className="text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}