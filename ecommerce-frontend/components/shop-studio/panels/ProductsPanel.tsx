'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/services/api/products';
import { Product } from '@/types/product';
import Image from 'next/image';
import { FiStar, FiTrash2, FiMove } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Props {
  shopId: number;
  featuredProducts: any[];
  onUpdateFeatured: (products: any[]) => void;
}

export default function ProductsPanel({ shopId, featuredProducts, onUpdateFeatured }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductsByShop(shopId, { pageSize: 100 });
        let extractedProducts: Product[] = [];
        const data: any = response;
        if (data.products?.items) extractedProducts = data.products.items;
        else if (data.items) extractedProducts = data.items;
        else if (Array.isArray(data)) extractedProducts = data;
        setProducts(extractedProducts);
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      } finally {
        setLoading(false);
      }
    };
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

  return (
    <div className="space-y-6">
      {/* Produits mis en avant */}
      <div>
        <h3 className="text-white font-semibold mb-3">Produits en avant</h3>
        {featuredProducts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Aucun produit mis en avant
          </p>
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
                                src={product.imageUrl || '/images/product-placeholder.svg'}
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
                            <button
                              onClick={() => removeFromFeatured(product.id)}
                              className="text-red-400 hover:text-red-300"
                            >
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
                    src={product.imageUrl || '/images/product-placeholder.svg'}
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

      {/* Options d'affichage des produits en avant */}
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
    </div>
  );
}