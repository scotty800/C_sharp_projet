'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi';

interface ProductImagesProps {
  product: Product;
}

const ProductImages = ({ product }: ProductImagesProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const images = [
    product.imageUrl,
    product.imageUrl1,
    product.imageUrl2,
    product.imageUrl3,
  ].filter(Boolean) as string[];

  const defaultImage = '/images/product-placeholder.jpg';
  const displayImages = images.length > 0 ? images : [defaultImage];

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Image principale */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={displayImages[selectedImage]}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />

        {/* Navigation flèches */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Bouton plein écran */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
        >
          <FiMaximize2 size={20} />
        </button>

        {/* Compteur d'images */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {selectedImage + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Miniatures */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImage === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={image}
                alt={`${product.name} - ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal plein écran */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-primary text-4xl"
          >
            &times;
          </button>
          
          <div className="relative w-full max-w-5xl h-[80vh] mx-4">
            <Image
              src={displayImages[selectedImage]}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
              >
                <FiChevronLeft size={32} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
              >
                <FiChevronRight size={32} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ProductImages;