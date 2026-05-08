'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { productService } from '@/services/api/products';
import { extractProductsFromResponse } from '@/utils/productUtils';

interface Props {
  shop: any;
  block: any;
  customization: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  textOpacity?: number;
  isResizing?: boolean; // ⭐ AJOUTER
}

export function ProductsBlock({ shop, block, customization, isSelected, onSelect, onUpdate, textOpacity = 1, isResizing = false }: Props) {
  const { props } = block;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const isMounted = useRef(true);
  const fetchingRef = useRef(false);
  const lastLimitRef = useRef(props.limit || 8);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ⭐ Chargement initial seulement (pas pendant le redimensionnement)
  useEffect(() => {
    if (initialLoadDone) return;
    if (isResizing) return; // ⭐ Ne pas charger pendant le redimensionnement
    
    const fetchProducts = async () => {
      if (!shop?.id) return;
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await productService.getProductsByShop(shop.id, { 
          pageSize: lastLimitRef.current
        });
        
        const extracted = extractProductsFromResponse(response);
        
        if (isMounted.current) {
          setProducts(extracted);
          setInitialLoadDone(true);
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error);
        if (isMounted.current) {
          setError('Erreur de chargement');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
        fetchingRef.current = false;
      }
    };

    fetchProducts();
  }, [shop?.id, isResizing, initialLoadDone]);

  // ⭐ Recharger seulement si la limite change ET qu'on n'est pas en redimensionnement
  useEffect(() => {
    if (isResizing) return; // ⭐ Ne pas recharger pendant le redimensionnement
    
    const currentLimit = props.limit || 8;
    if (lastLimitRef.current === currentLimit || !initialLoadDone) return;
    
    lastLimitRef.current = currentLimit;
    
    const fetchProducts = async () => {
      if (!shop?.id) return;
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      
      try {
        setLoading(true);
        
        const response = await productService.getProductsByShop(shop.id, { 
          pageSize: currentLimit
        });
        
        const extracted = extractProductsFromResponse(response);
        
        if (isMounted.current) {
          setProducts(extracted);
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
        fetchingRef.current = false;
      }
    };

    fetchProducts();
  }, [props.limit, shop?.id, isResizing, initialLoadDone]);

  // ⭐ STYLE DU TITRE avec support dégradé et opacité
  const titleStyle: React.CSSProperties = {
    fontFamily: props.titleFont || 'Poppins',
    fontSize: props.titleFontSize || '36px',
    fontWeight: props.titleFontWeight || '700',
    textAlign: 'center',
    marginBottom: '2rem',
    lineHeight: 1.2,
    opacity: textOpacity,
  };

  if (props?.titleGradient) {
    titleStyle.backgroundImage = props.titleGradient;
    titleStyle.backgroundClip = 'text';
    titleStyle.WebkitBackgroundClip = 'text';
    titleStyle.color = 'transparent';
  } else {
    titleStyle.color = props.titleColor || '#1F2937';
  }

  const productNameStyle: React.CSSProperties = {
    fontFamily: props.productNameFont || 'Inter',
    fontSize: props.productNameSize || '16px',
    fontWeight: props.productNameWeight || '600',
    color: props.productNameColor || '#1F2937',
    opacity: textOpacity,
  };

  const productPriceStyle: React.CSSProperties = {
    fontFamily: props.priceFont || 'Inter',
    fontSize: props.priceSize || '16px',
    fontWeight: props.priceWeight || '700',
    color: props.priceColor || '#2563EB',
    opacity: textOpacity,
  };

  const containerStyle = (() => {
    if (props.backgroundType === 'gradient' && props.backgroundValue) {
      return { background: props.backgroundValue };
    }
    return { backgroundColor: props.backgroundColor || '#ffffff' };
  })();

  const columns = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
    onUpdate({ title: e.currentTarget.innerText });
  };

  // ⭐ Gestion des erreurs
  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        {error}
      </div>
    );
  }

  // ⭐ Pendant le redimensionnement, on garde les produits existants
  const displayProducts = isResizing ? products : products;
  const displayLoading = isResizing ? false : loading;

  return (
    <div
      className={`relative cursor-pointer transition-all w-full h-full ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onSelect}
      style={containerStyle}
    >
      <div className="container mx-auto px-4 py-8">
        <h2
          className="text-center mb-8"
          style={titleStyle}
          contentEditable={isSelected}
          onBlur={handleTitleBlur}
          suppressContentEditableWarning
        >
          {props.title || 'Nos produits'}
        </h2>

        {displayLoading ? (
          <div className="text-center py-12" style={{ fontFamily: props.loadingFont || 'Inter' }}>
            Chargement...
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Aucun produit pour le moment.
          </div>
        ) : (
          <div className={`grid ${columns[props.columns as keyof typeof columns] || 'grid-cols-4'} gap-6`}>
            {displayProducts.slice(0, props.limit || 8).map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="relative h-48 bg-gray-100">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">🖼️</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold" style={productNameStyle}>
                    {product.name}
                  </h3>
                  {product.category && (
                    <p className="text-gray-500 text-sm mt-1">{product.category}</p>
                  )}
                  <p className="font-bold mt-2" style={productPriceStyle}>
                    {product.price} €
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Label de sélection */}
      {isSelected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-0.5 rounded-full z-20 whitespace-nowrap">
          Produits {textOpacity !== 1 ? `(Opacité: ${Math.round(textOpacity * 100)}%)` : ''}
        </div>
      )}
    </div>
  );
}