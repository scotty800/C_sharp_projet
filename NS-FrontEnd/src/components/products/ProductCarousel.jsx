import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductCarousel.css';

const ProductCarousel = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const carouselRef = useRef(null);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    
    setTouchStart(null);
  };

  if (!images?.length) {
    return (
      <div className="product-carousel">
        <img 
          src="/default-product.jpg" 
          alt={productName}
          className="carousel-image"
        />
      </div>
    );
  }

  return (
    <>
      <div 
        className={`product-carousel ${isFullscreen ? 'fullscreen' : ''}`}
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image */}
        <div className="carousel-main">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${productName} - ${currentIndex + 1}`}
              className="carousel-image"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsFullscreen(true)}
            />
          </AnimatePresence>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button 
                className="carousel-nav carousel-prev"
                onClick={goToPrev}
                aria-label="Image précédente"
              >
                ‹
              </button>
              <button 
                className="carousel-nav carousel-next"
                onClick={goToNext}
                aria-label="Image suivante"
              >
                ›
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="carousel-counter">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Fullscreen Button */}
          <button 
            className="carousel-fullscreen"
            onClick={() => setIsFullscreen(true)}
            aria-label="Plein écran"
          >
            ⛶
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="carousel-thumbnails">
            {images.map((image, index) => (
              <button
                key={index}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                <img src={image} alt={`Miniature ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            className="carousel-fullscreen-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)}
          >
            <div className="fullscreen-content" onClick={e => e.stopPropagation()}>
              <img 
                src={images[currentIndex]} 
                alt={`${productName} - ${currentIndex + 1}`}
                className="fullscreen-image"
              />
              
              <button 
                className="fullscreen-close"
                onClick={() => setIsFullscreen(false)}
              >
                ✕
              </button>

              {images.length > 1 && (
                <>
                  <button 
                    className="fullscreen-nav fullscreen-prev"
                    onClick={goToPrev}
                  >
                    ‹
                  </button>
                  <button 
                    className="fullscreen-nav fullscreen-next"
                    onClick={goToNext}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCarousel;