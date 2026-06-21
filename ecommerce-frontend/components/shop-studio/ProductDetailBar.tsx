'use client';

import React, { useState, useEffect } from 'react';
import { FiTrash2, FiPlus, FiArrowLeft, FiArrowRight, FiX, FiEdit2, FiCheck, FiPackage, FiInfo, FiGrid, FiDollarSign, FiTag, FiArchive, FiUpload } from 'react-icons/fi';
import { StudioProduct, ProductCustomization } from '@/types/studio';

interface ProductDetailBarProps {
  product: StudioProduct;
  customization: ProductCustomization | undefined;
  onUpdateCustomization: (updates: Partial<ProductCustomization>) => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdateProduct?: (productId: number, updates: Partial<StudioProduct>) => void;
  onUploadImage?: (productId: number, imageNumber: 1 | 2 | 3, file: File) => Promise<void>;
  onDeleteImage?: (productId: number, imageNumber: 1 | 2 | 3) => Promise<void>;
  style?: React.CSSProperties;
  isPopup?: boolean;
}

const PREDEFINED_COLORS = [
  { name: 'Noir', value: '#000000' }, { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Rouge', value: '#EF4444' }, { name: 'Bleu', value: '#3B82F6' },
  { name: 'Vert', value: '#10B981' }, { name: 'Jaune', value: '#F59E0B' },
  { name: 'Violet', value: '#8B5CF6' }, { name: 'Rose', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' }, { name: 'Cyan', value: '#06B6D4' },
  { name: 'Gris', value: '#6B7280' }, { name: 'Marron', value: '#78350F' },
];

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

export default function ProductDetailBar({
  product,
  customization,
  onUpdateCustomization,
  onSave,
  onCancel,
  onUpdateProduct,
  onUploadImage,
  onDeleteImage,
  style,
  isPopup = false
}: ProductDetailBarProps) {
  
  useEffect(() => {
    console.log('🟢 ProductDetailBar MONTÉ pour le produit:', product?.name);
    return () => {
      console.log('🔴 ProductDetailBar DÉMONTÉ');
    };
  }, [product]);

  const [activeTab, setActiveTab] = useState<'details' | 'variants'>('details');
  
  // États pour l'édition des champs
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<1 | 2 | 3 | null>(null);
  
  // Valeurs temporaires pour l'édition
  const [tempStock, setTempStock] = useState(product.stock || 0);
  const [tempPrice, setTempPrice] = useState(product.price);
  const [tempName, setTempName] = useState(product.name);
  const [tempCategory, setTempCategory] = useState(product.category || '');
  const [tempDescription, setTempDescription] = useState(product.description || '');
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // ⭐ États pour gérer les survols
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [hoveredSize, setHoveredSize] = useState<string | null>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  
  const availableSizes = product.sizes || ['S', 'M', 'L', 'XL'];
  const availableColors = product.colors || ['#FFFFFF', '#000000', '#EF4444'];
  const selectedSize = customization?.selectedSize || availableSizes[0] || 'M';
  const selectedColor = customization?.selectedColor || availableColors[0] || '#FFFFFF';

  // ⭐ Les photos sont maintenant mises à jour dynamiquement via les props
  const productPhotos = [
    { id: 1, url: product.imageUrl1, label: 'Principale' },
    { id: 2, url: product.imageUrl2, label: 'Image 2' },
    { id: 3, url: product.imageUrl3, label: 'Image 3' }
  ];

  // ⭐ SAUVEGARDES
  const handleStockSave = () => {
    if (onUpdateProduct) {
      onUpdateProduct(product.id, { stock: tempStock, isInStock: tempStock > 0 });
    }
    setIsEditingStock(false);
  };

  const handlePriceSave = () => {
    if (onUpdateProduct && tempPrice > 0) {
      onUpdateProduct(product.id, { price: tempPrice });
    }
    setIsEditingPrice(false);
  };

  const handleNameSave = () => {
    if (onUpdateProduct && tempName.trim()) {
      onUpdateProduct(product.id, { name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleCategorySave = () => {
    if (onUpdateProduct) {
      onUpdateProduct(product.id, { category: tempCategory });
    }
    setIsEditingCategory(false);
  };

  const handleDescriptionSave = () => {
    if (onUpdateProduct) {
      onUpdateProduct(product.id, { description: tempDescription });
    }
    setIsEditingDescription(false);
  };

  // ⭐ WRAPPERS pour les boutons
  const handleSaveWrapper = () => {
    if (isEditingName) handleNameSave();
    if (isEditingPrice) handlePriceSave();
    if (isEditingStock) handleStockSave();
    if (isEditingCategory) handleCategorySave();
    if (isEditingDescription) handleDescriptionSave();
    onSave();
  };

  const handleCancelWrapper = () => {
    onCancel();
  };

  // ⭐⭐⭐ GESTION DES IMAGES - UPLOAD ⭐⭐⭐
  const triggerFileUpload = (slot: 1 | 2 | 3) => {
    document.getElementById(`product-image-input-${slot}`)?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2 | 3) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image trop grande (max 5MB)");
      return;
    }
    
    setUploadingImage(slot);
    try {
      const formData = new FormData();
      formData.append('productId', product.id.toString());
      
      const fieldName = slot === 1 ? 'image1' : slot === 2 ? 'image2' : 'image3';
      formData.append(fieldName, file);
      
      console.log(`📤 Upload image ${fieldName} pour le produit ${product.id}`);
      
      const { productService } = await import('@/services/api/products');
      await productService.uploadImages({
        productId: product.id,
        [fieldName]: file
      } as any);
      
      console.log(`✅ Image ${fieldName} uploadée avec succès`);
      
      const updatedProduct = await productService.getProductById(product.id);
      
      if (onUpdateProduct) {
        onUpdateProduct(product.id, {
          imageUrl1: updatedProduct.imageUrl1 || product.imageUrl1,
          imageUrl2: updatedProduct.imageUrl2 || product.imageUrl2,
          imageUrl3: updatedProduct.imageUrl3 || product.imageUrl3,
        });
      }
      
      // ⭐ Déclencher les événements pour mettre à jour tous les composants
      window.dispatchEvent(new CustomEvent('productUpdated', {
        detail: {
          productId: product.id,
          updates: {
            imageUrl1: updatedProduct.imageUrl1 || product.imageUrl1,
            imageUrl2: updatedProduct.imageUrl2 || product.imageUrl2,
            imageUrl3: updatedProduct.imageUrl3 || product.imageUrl3,
          },
          timestamp: Date.now()
        }
      }));
      
      window.dispatchEvent(new CustomEvent('refreshProducts'));
      
    } catch (error) {
      console.error('Erreur upload image:', error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setUploadingImage(null);
      e.target.value = '';
    }
  };

  // ⭐⭐⭐ GESTION DES IMAGES - SUPPRESSION AVEC RÉORGANISATION (CORRIGÉE) ⭐⭐⭐
  const handleDeleteImage = async (slot: 1 | 2 | 3) => {
    try {
      console.log(`🗑️ Suppression de l'image ${slot} pour le produit ${product.id}`);
      
      // ⭐ Récupérer les images actuelles du produit
      const currentImage1 = product.imageUrl1;
      const currentImage2 = product.imageUrl2;
      const currentImage3 = product.imageUrl3;
      
      console.log('📸 Images actuelles:', { currentImage1, currentImage2, currentImage3 });
      
      // ⭐ Déterminer les nouvelles images APRÈS suppression (réorganisation)
      let newImageUrl1: string | undefined = currentImage1 || undefined;
      let newImageUrl2: string | undefined = currentImage2 || undefined;
      let newImageUrl3: string | undefined = currentImage3 || undefined;
      
      if (slot === 1) {
        // Suppression de l'image principale
        newImageUrl1 = currentImage2 || undefined;  // Image 2 devient principale
        newImageUrl2 = currentImage3 || undefined;  // Image 3 devient Image 2
        newImageUrl3 = undefined;                   // Plus d'image 3
      } else if (slot === 2) {
        // Suppression de l'image 2
        newImageUrl1 = currentImage1 || undefined;  // Image 1 reste principale
        newImageUrl2 = currentImage3 || undefined;  // Image 3 devient Image 2
        newImageUrl3 = undefined;                   // Plus d'image 3
      } else if (slot === 3) {
        // Suppression de l'image 3
        newImageUrl1 = currentImage1 || undefined;  // Image 1 reste principale
        newImageUrl2 = currentImage2 || undefined;  // Image 2 reste Image 2
        newImageUrl3 = undefined;                   // Plus d'image 3
      }
      
      console.log('🔄 Nouvelles images après réorganisation:', { newImageUrl1, newImageUrl2, newImageUrl3 });
      
      // ⭐ Mettre à jour localement IMMÉDIATEMENT (feedback instantané)
      if (onUpdateProduct) {
        onUpdateProduct(product.id, {
          imageUrl1: newImageUrl1,
          imageUrl2: newImageUrl2,
          imageUrl3: newImageUrl3,
        });
      }
      
      // ⭐ Appeler l'API pour supprimer l'image
      const { productService } = await import('@/services/api/products');
      const response = await productService.deleteImage(product.id, slot);
      
      console.log(`✅ Image ${slot} supprimée avec succès`, response);
      
      // ⭐⭐ RÉCUPÉRER LE PRODUIT DEPUIS LA RÉPONSE DE L'API ⭐⭐
      // La réponse contient maintenant { message, product }
      let updatedProduct = null;
      if (response && (response as any).product) {
        updatedProduct = (response as any).product;
        console.log('📦 Produit depuis la réponse API:', updatedProduct);
      }
      
      // ⭐ Utiliser les données du backend (qui sont déjà réorganisées)
      // ou garder notre réorganisation locale si le backend ne renvoie pas de produit
      const finalImageUrl1 = updatedProduct?.imageUrl1 || updatedProduct?.imageUrl || newImageUrl1;
      const finalImageUrl2 = updatedProduct?.imageUrl2 || newImageUrl2;
      const finalImageUrl3 = updatedProduct?.imageUrl3 || newImageUrl3;
      
      console.log('📦 Images finales:', { finalImageUrl1, finalImageUrl2, finalImageUrl3 });
      
      // ⭐ Mettre à jour le produit avec les images réorganisées
      if (onUpdateProduct) {
        onUpdateProduct(product.id, {
          imageUrl1: finalImageUrl1,
          imageUrl2: finalImageUrl2,
          imageUrl3: finalImageUrl3,
        });
      }
      
      // ⭐⭐⭐ DÉCLENCHER LES ÉVÉNEMENTS AVEC LES IMAGES RÉORGANISÉES ⭐⭐⭐
      const imageUpdates = {
        imageUrl1: finalImageUrl1,
        imageUrl2: finalImageUrl2,
        imageUrl3: finalImageUrl3,
      };
      
      window.dispatchEvent(new CustomEvent('productUpdated', {
        detail: {
          productId: product.id,
          updates: imageUpdates,
          timestamp: Date.now()
        }
      }));
      
      window.dispatchEvent(new CustomEvent('productsListChanged', {
        detail: {
          productId: product.id,
          updates: imageUpdates
        }
      }));
      
      window.dispatchEvent(new CustomEvent('productDataChanged', {
        detail: {
          productId: product.id,
          updates: imageUpdates
        }
      }));
      
      window.dispatchEvent(new CustomEvent('refreshProducts'));
      
      console.log('✅ Images réorganisées avec succès:', imageUpdates);
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'image:', error);
      alert("Erreur lors de la suppression de l'image");
    }
  };

  // ⭐⭐⭐ GESTION DES COULEURS ⭐⭐⭐
  const handleAddColor = (colorHex: string) => {
    if (onUpdateProduct && !availableColors.includes(colorHex)) {
      const newColors = [...availableColors, colorHex];
      console.log('🎨 Ajout couleur - envoi du tableau de strings HEX:', newColors);
      onUpdateProduct(product.id, { colors: newColors });
    }
    setShowColorPicker(false);
  };

  const handleRemoveColor = (colorHex: string) => {
    if (onUpdateProduct && availableColors.length > 1) {
      const newColors = availableColors.filter(c => c !== colorHex);
      console.log('🎨 Suppression couleur - envoi du tableau de strings HEX:', newColors);
      onUpdateProduct(product.id, { colors: newColors });
      if (selectedColor === colorHex && newColors.length > 0) {
        onUpdateCustomization({ selectedColor: newColors[0] });
      }
    }
  };

  // ⭐⭐⭐ GESTION DES TAILLES ⭐⭐⭐
  const handleAddSize = (size: string) => {
    if (onUpdateProduct && !availableSizes.includes(size)) {
      const newSizes = [...availableSizes, size];
      console.log('📏 Ajout taille - envoi du tableau de strings:', newSizes);
      onUpdateProduct(product.id, { sizes: newSizes });
    }
  };

  const handleRemoveSize = (size: string) => {
    if (onUpdateProduct && availableSizes.length > 1) {
      const newSizes = availableSizes.filter(s => s !== size);
      console.log('📏 Suppression taille - envoi du tableau de strings:', newSizes);
      onUpdateProduct(product.id, { sizes: newSizes });
      if (selectedSize === size && newSizes.length > 0) {
        onUpdateCustomization({ selectedSize: newSizes[0] });
      }
    }
  };

  const unusedSizes = ALL_SIZES.filter(size => !availableSizes.includes(size));

  return (
    <div 
      style={style} 
      onClick={(e) => e.stopPropagation()}
      className={`w-full z-50 font-sans animate-in fade-in slide-in-from-top-2 duration-200 ${!isPopup ? 'absolute' : ''}`}
    >
      {/* Inputs file cachés pour les images */}
      <input id="product-image-input-1" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 1)} />
      <input id="product-image-input-2" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 2)} />
      <input id="product-image-input-3" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 3)} />

      <div className="w-full max-w-[850px] bg-[#11121a] rounded-xl border border-[#4c249f] shadow-[0_0_25px_rgba(139,92,246,0.3)] overflow-hidden text-gray-200">
        
        {/* Sub-header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0d0e14] border-b border-[#1b1c26]">
          <div className="flex items-center gap-4">
            <button onClick={onCancel} className="text-gray-500 hover:text-red-400 transition-colors">
              <FiTrash2 size={14} />
            </button>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <button className="hover:text-white transition-colors"><FiArrowLeft size={14} /></button>
            <button className="hover:text-white transition-colors"><FiArrowRight size={14} /></button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex px-5 pt-2 gap-4 border-b border-[#1b1c26]">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <FiInfo size={12} /> Détails
          </button>
          <button
            onClick={() => setActiveTab('variants')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-medium transition-colors ${
              activeTab === 'variants'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <FiGrid size={12} /> Variantes
          </button>
        </div>

        {/* ONGLET DÉTAILS */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-12 items-start min-h-[100px] px-5 py-3 gap-4 divide-x divide-[#1f2130]">
            
            <div className="col-span-4 flex flex-col justify-center pr-2 gap-2 min-w-0 overflow-hidden">
              
              {/* Nom */}
              <div>
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs" autoFocus />
                    <button onClick={handleNameSave} className="text-green-500"><FiCheck size={12} /></button>
                    <button onClick={() => { setIsEditingName(false); setTempName(product.name); }} className="text-red-500"><FiX size={12} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-white truncate">{product.name}</h3>
                    <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-white"><FiEdit2 size={10} /></button>
                  </div>
                )}
              </div>
              
              {/* Prix */}
              <div>
                {isEditingPrice ? (
                  <div className="flex items-center gap-1">
                    <input 
                      type="text" 
                      value={tempPrice} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setTempPrice(0);
                        } else {
                          const num = parseFloat(val);
                          if (!isNaN(num)) {
                            setTempPrice(num);
                          }
                        }
                      }}
                      className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      autoFocus
                    />
                    <button onClick={handlePriceSave} className="text-green-500"><FiCheck size={12} /></button>
                    <button onClick={() => { setIsEditingPrice(false); setTempPrice(product.price); }} className="text-red-500"><FiX size={12} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-primary font-bold text-sm">{product.price} €</div>
                    <button onClick={() => setIsEditingPrice(true)} className="text-gray-500 hover:text-white"><FiEdit2 size={10} /></button>
                  </div>
                )}
              </div>
              
              {/* Stock */}
              <div className="flex items-center gap-2">
                <FiPackage size={12} className="text-gray-500" />
                {isEditingStock ? (
                  <div className="flex items-center gap-1">
                    <input 
                      type="text" 
                      value={tempStock} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setTempStock(0);
                        } else {
                          const num = parseInt(val);
                          if (!isNaN(num) && num >= 0) {
                            setTempStock(num);
                          }
                        }
                      }}
                      className="w-16 bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-white text-xs"
                      autoFocus
                    />
                    <button onClick={handleStockSave} className="text-green-500"><FiCheck size={12} /></button>
                    <button onClick={() => { setIsEditingStock(false); setTempStock(product.stock || 0); }} className="text-red-500"><FiX size={12} /></button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingStock(true)} className="flex items-center gap-1 text-gray-400 hover:text-white text-xs">
                    <span>Stock: {product.stock || 0}</span>
                    <FiEdit2 size={10} className="opacity-50" />
                  </button>
                )}
              </div>

              {/* Catégorie */}
              <div>
                {isEditingCategory ? (
                  <div className="flex items-center gap-1">
                    <input type="text" value={tempCategory} onChange={(e) => setTempCategory(e.target.value)} placeholder="Catégorie" className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs" />
                    <button onClick={handleCategorySave} className="text-green-500"><FiCheck size={12} /></button>
                    <button onClick={() => { setIsEditingCategory(false); setTempCategory(product.category || ''); }} className="text-red-500"><FiX size={12} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Catégorie: {product.category || 'Non définie'}</span>
                    <button onClick={() => setIsEditingCategory(true)} className="text-gray-500 hover:text-white"><FiEdit2 size={10} /></button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <button onClick={handleSaveWrapper} className="px-3 py-1 text-[11px] font-bold rounded-full text-white bg-gradient-to-r from-[#10b981] via-[#6366f1] to-[#8b5cf6] shadow-[0_0_10px_rgba(99,102,241,0.3)] hover:opacity-90 transition-opacity uppercase whitespace-nowrap">Enregistrer</button>
                <button onClick={handleCancelWrapper} className="px-3 py-1 text-[11px] font-medium rounded-full text-gray-300 bg-[#2d303f] hover:bg-[#373b4e] transition-colors uppercase whitespace-nowrap">Annuler</button>
              </div>
            </div>

            {/* ⭐ SECTION 2 : Photos - AVEC CROIX ROUGE SUR LES IMAGES */}
            <div className="col-span-5 flex flex-col justify-center px-4 gap-1 min-w-0">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Photos</span>
              <div className="flex items-center gap-2 overflow-x-auto">
                {productPhotos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className="flex flex-col items-center flex-shrink-0 relative"
                    onMouseEnter={() => setHoveredImage(photo.id)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    <div className="relative w-12 h-12 bg-[#1b1d2a] border border-[#2d303f] rounded-lg overflow-hidden">
                      {photo.url ? (
                        <>
                          <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                          {hoveredImage === photo.id && (
                            <button
                              onClick={() => handleDeleteImage(photo.id as 1 | 2 | 3)}
                              className="absolute inset-0 bg-black/60 hover:bg-black/70 transition-colors flex items-center justify-center animate-in fade-in duration-150"
                              title={`Supprimer ${photo.label}`}
                            >
                              <FiTrash2 size={14} className="text-red-400 hover:text-red-300 transition-colors" />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => triggerFileUpload(photo.id as 1 | 2 | 3)}
                          className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-white transition-colors"
                        >
                          {uploadingImage === photo.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <FiUpload size={16} />
                          )}
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 mt-0.5">{photo.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="col-span-3 flex flex-col justify-center pl-4 gap-1 min-w-0">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Description</span>
              {isEditingDescription ? (
                <div className="space-y-1">
                  <textarea rows={2} value={tempDescription} onChange={(e) => setTempDescription(e.target.value)} placeholder="Description du produit..." className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs resize-none" autoFocus />
                  <div className="flex justify-end gap-1">
                    <button onClick={handleDescriptionSave} className="text-green-500"><FiCheck size={12} /></button>
                    <button onClick={() => { setIsEditingDescription(false); setTempDescription(product.description || ''); }} className="text-red-500"><FiX size={12} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <p className="text-xs text-gray-400 line-clamp-3 flex-1">{product.description || 'Aucune description'}</p>
                  <button onClick={() => setIsEditingDescription(true)} className="text-gray-500 hover:text-white ml-1 flex-shrink-0"><FiEdit2 size={10} /></button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ONGLET VARIANTES */}
        {activeTab === 'variants' && (
          <div className="grid grid-cols-12 items-start min-h-[100px] px-5 py-3 gap-4 divide-x divide-[#1f2130]">
            
            <div className="col-span-3 flex flex-col justify-center pr-2 gap-2 min-w-0 overflow-hidden">
              <h3 className="text-xs font-bold tracking-wider uppercase text-white truncate">{product.name}</h3>
              
              <div className="flex items-center gap-2">
                <FiPackage size={12} className="text-gray-500" />
                {isEditingStock ? (
                  <div className="flex items-center gap-1">
                    <input 
                      type="text" 
                      value={tempStock} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setTempStock(0);
                        } else {
                          const num = parseInt(val);
                          if (!isNaN(num) && num >= 0) {
                            setTempStock(num);
                          }
                        }
                      }}
                      className="w-16 bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-white text-xs"
                      autoFocus
                    />
                    <button onClick={handleStockSave} className="text-green-500"><FiCheck size={12} /></button>
                    <button onClick={() => { setIsEditingStock(false); setTempStock(product.stock || 0); }} className="text-red-500"><FiX size={12} /></button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingStock(true)} className="flex items-center gap-1 text-gray-400 hover:text-white text-xs">
                    <span>Stock: {product.stock || 0}</span>
                    <FiEdit2 size={10} className="opacity-50" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={handleSaveWrapper} className="px-3 py-1 text-[11px] font-bold rounded-full text-white bg-gradient-to-r from-[#10b981] via-[#6366f1] to-[#8b5cf6] shadow-[0_0_10px_rgba(99,102,241,0.3)] hover:opacity-90 transition-opacity uppercase whitespace-nowrap">Enregistrer</button>
                <button onClick={handleCancelWrapper} className="px-3 py-1 text-[11px] font-medium rounded-full text-gray-300 bg-[#2d303f] hover:bg-[#373b4e] transition-colors uppercase whitespace-nowrap">Annuler</button>
              </div>
            </div>

            {/* ⭐ COULEURS - CROIX ROUGE AU SURVOL */}
            <div className="col-span-4 flex flex-col justify-center px-4 gap-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Couleurs</span>
                <button onClick={() => setShowColorPicker(!showColorPicker)} className="text-gray-500 hover:text-white transition-colors">
                  <FiPlus size={12} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 max-w-full">
                {availableColors.map((colorHex) => (
                  <div 
                    key={colorHex} 
                    className="relative inline-block"
                    onMouseEnter={() => setHoveredColor(colorHex)}
                    onMouseLeave={() => setHoveredColor(null)}
                  >
                    <button
                      onClick={() => onUpdateCustomization({ selectedColor: colorHex })}
                      style={{ backgroundColor: colorHex }}
                      className={`w-8 h-8 rounded-full border-2 border-white/20 flex-shrink-0 transition-all ${
                        selectedColor.toLowerCase() === colorHex.toLowerCase() ? 'ring-2 ring-[#8b5cf6] ring-offset-2 ring-offset-[#11121a] scale-110' : ''
                      } ${hoveredColor === colorHex ? 'scale-105' : ''}`}
                    />
                    {hoveredColor === colorHex && availableColors.length > 1 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveColor(colorHex);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-in zoom-in-95 duration-150"
                        title="Supprimer cette couleur"
                      >
                        <FiX size={10} className="text-white" />
                      </button>
                    )}
                  </div>
                ))}
                {availableColors.length <= 1 && (
                  <span className="text-[9px] text-gray-500 italic">Ajoutez une couleur</span>
                )}
              </div>

              {showColorPicker && (
                <div className="mt-2 p-2 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex flex-wrap gap-1.5 max-w-full">
                    {PREDEFINED_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => handleAddColor(c.value)}
                        style={{ backgroundColor: c.value }}
                        className={`w-6 h-6 rounded-full border border-black/20 hover:scale-110 transition-transform ${
                          availableColors.includes(c.value) ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        disabled={availableColors.includes(c.value)}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowColorPicker(false)}
                    className="mt-1 text-[10px] text-gray-400 hover:text-white transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>

            {/* ⭐ TAILLES - CROIX ROUGE AU SURVOL */}
            <div className="col-span-5 flex flex-col justify-center pl-4 gap-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Tailles</span>
                <div className="flex gap-1">
                  {unusedSizes.slice(0, 4).map(size => (
                    <button 
                      key={size} 
                      onClick={() => handleAddSize(size)} 
                      className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 hover:bg-primary/30 hover:text-white transition-colors"
                      title={`Ajouter ${size}`}
                    >
                      +{size}
                    </button>
                  ))}
                  {unusedSizes.length > 4 && (
                    <span className="text-[9px] text-gray-500">...</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 max-w-full">
                {availableSizes.map((size) => (
                  <div 
                    key={size} 
                    className="relative inline-block"
                    onMouseEnter={() => setHoveredSize(size)}
                    onMouseLeave={() => setHoveredSize(null)}
                  >
                    <button
                      onClick={() => onUpdateCustomization({ selectedSize: size })}
                      className={`min-w-[36px] h-8 px-2 text-[11px] font-medium rounded border transition-all ${
                        selectedSize === size
                          ? 'bg-primary text-white border-primary'
                          : 'bg-[#1b1d2a] text-gray-400 border-[#2d303f] hover:bg-gray-700'
                      } ${hoveredSize === size ? 'ring-2 ring-primary/30' : ''}`}
                    >
                      {size}
                    </button>
                    {hoveredSize === size && availableSizes.length > 1 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSize(size);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-in zoom-in-95 duration-150"
                        title={`Supprimer ${size}`}
                      >
                        <FiX size={10} className="text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}