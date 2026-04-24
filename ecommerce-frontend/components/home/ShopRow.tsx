// components/home/ShopRow.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import BrandCard from './BrandCard';
import { Shop } from '@/types/shop';

interface ShopRowProps {
  title: string;
  subtitle?: string;
  shops: Shop[];
  loading?: boolean;
  variant?: 'default' | 'trending' | 'new';
  showTrend?: boolean;
}

const ShopRow = ({ 
  title, 
  subtitle, 
  shops, 
  loading = false, 
  variant = 'default',
  showTrend = false
}: ShopRowProps) => {
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
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
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
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-t-xl animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shops.length) return null;

  // Valeurs de tendance simulées pour l'effet visuel
  const getTrendValue = (index: number) => {
    const trends = ['+245%', '+189%', '+156%', '+134%', '+112%', '+98%', '+87%'];
    return trends[index % trends.length];
  };

  return (
    <div className="py-8 group/row">
      <div className="container mx-auto px-4">
        {/* En-tête style NOVERA - exactement comme l'image */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href="#"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Flèche gauche */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white p-2 rounded-full shadow-lg opacity-0 group-hover/row:opacity-100 transition-all duration-300 -translate-x-1/2"
            >
              <FiChevronLeft size={20} />
            </button>
          )}

          {/* Flèche droite */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white p-2 rounded-full shadow-lg opacity-0 group-hover/row:opacity-100 transition-all duration-300 translate-x-1/2"
            >
              <FiChevronRight size={20} />
            </button>
          )}

          {/* Conteneur des cartes - défilement horizontal */}
          <div
            ref={rowRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {shops.map((shop, index) => (
              <BrandCard
                key={shop.id}
                shop={shop}
                variant={variant}
                showTrend={showTrend}
                trendValue={getTrendValue(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ShopRow;