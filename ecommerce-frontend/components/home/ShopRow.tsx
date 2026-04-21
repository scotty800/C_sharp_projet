'use client';

import { useRef, useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ShopCard from './ShopCard';
import { Shop } from '@/types/shop';

interface ShopRowProps {
  title: string;
  subtitle?: string;
  shops: Shop[];
  loading?: boolean;
}

const ShopRow = ({ title, subtitle, shops, loading = false }: ShopRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { current } = rowRef;
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const current = rowRef.current;
    if (current) {
      current.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => current.removeEventListener('scroll', checkScroll);
    }
  }, [shops]);

  if (loading) {
    return (
      <div className="shop-row py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h2>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-64 h-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shops.length) return null;

  return (
    <div className="shop-row py-8 group/row">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
          <a href="#" className="text-primary hover:underline text-sm font-semibold">
            Voir tout
          </a>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Flèche gauche */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 -ml-4"
            >
              <FiChevronLeft size={24} />
            </button>
          )}

          {/* Flèche droite */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 -mr-4"
            >
              <FiChevronRight size={24} />
            </button>
          )}

          {/* Conteneur des cartes */}
          <div
            ref={rowRef}
            className="shop-row-container"
          >
            {shops.map((shop, index) => (
              <ShopCard key={shop.id} shop={shop} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopRow;