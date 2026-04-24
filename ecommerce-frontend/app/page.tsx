// app/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { shopService } from '@/services/api/shops';
import { ShopResponse } from '@/types/shop';
import { getImageUrl } from '@/utils/imageUtils';

// Composant Row pour les boutiques (carrousel)
const ShopRow = ({ 
  title, 
  shops, 
  loading,
  variant = 'default'
}: { 
  title: string; 
  shops: ShopResponse[]; 
  loading: boolean;
  variant?: 'default' | 'new' | 'trending';
}) => {
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

  // Dégradés néon pour les bannières
  const getNeonGradient = (index: number) => {
    const gradients = [
      'from-purple-600 via-pink-600 to-purple-600',
      'from-cyan-500 via-blue-500 to-cyan-500',
      'from-pink-500 via-rose-500 to-pink-500',
      'from-green-400 via-emerald-500 to-green-400',
      'from-yellow-500 via-amber-500 to-yellow-500',
      'from-indigo-500 via-purple-500 to-indigo-500',
    ];
    return gradients[index % gradients.length];
  };

  const getRating = (index: number) => {
    const ratings = [4.8, 4.9, 4.7, 5.0, 4.6, 4.9, 4.8, 4.7];
    return ratings[index % ratings.length];
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-4">
            <div className="h-7 w-40 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72">
                <div className="h-24 bg-gray-800 rounded-lg animate-pulse" />
                <div className="p-3 space-y-2 bg-[#1a1a1a] rounded-b-lg">
                  <div className="h-4 bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 bg-gray-800 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shops.length) return null;

  return (
    <div className="py-6 group/row">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
          <Link href="/shops" className="text-gray-400 hover:text-[#B82BFF] text-xs font-medium transition-colors">
            View all &gt;
          </Link>
        </div>

        <div className="relative">
          {showLeftArrow && (
            <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-[#B82BFF] text-white p-1.5 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 -translate-x-3 shadow-lg">
              <FiChevronLeft size={18} />
            </button>
          )}
          {showRightArrow && (
            <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-[#B82BFF] text-white p-1.5 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 translate-x-3 shadow-lg">
              <FiChevronRight size={18} />
            </button>
          )}

          <div ref={rowRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {shops.map((shop, index) => {
              const rating = getRating(index);
              return (
                <Link key={shop.id} href={`/shop/${shop.slug}`}>
                  <div className="group flex-shrink-0 w-72 bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 hover:border-[#B82BFF]/50 hover:shadow-[0_0_20px_rgba(184,43,255,0.15)] transition-all duration-300 cursor-pointer">
                    {/* Bannière */}
                    <div className="relative h-24 overflow-hidden">
                      {shop.bannerUrl ? (
                        <>
                          <Image 
                            src={getImageUrl(shop.bannerUrl)} 
                            alt={shop.name} 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover:scale-110" 
                            unoptimized 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        </>
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-r ${getNeonGradient(index)} opacity-90`} />
                      )}
                      
                      {/* Badge NEW */}
                      {variant === 'new' && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-gradient-to-r from-[#B82BFF] to-[#FF00FF] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                            NEW
                          </span>
                        </div>
                      )}
                      
                      {/* Badge TRENDING */}
                      {variant === 'trending' && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-gradient-to-r from-[#B82BFF] to-[#FF00FF] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                            🔥 TRENDING
                          </span>
                        </div>
                      )}

                      {/* Étoile de satisfaction */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                        <FiStar className="text-yellow-400 text-[9px] fill-yellow-400" />
                        <span className="text-white text-[9px] font-bold">{rating}</span>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {shop.logoUrl ? (
                          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-700">
                            <Image src={getImageUrl(shop.logoUrl)} alt={shop.name} fill className="object-cover" unoptimized />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
                            <span className="text-[#B82BFF] text-[10px] font-bold">{shop.name.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <h3 className="font-bold text-sm text-white truncate flex-1">{shop.name}</h3>
                      </div>
                      
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="text-gray-400">Streetwear</span>
                        <span className="text-cyan-400 truncate max-w-[120px]">@{shop.slug || shop.name.toLowerCase().replace(/\s/g, '')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [trendingShops, setTrendingShops] = useState<ShopResponse[]>([]);
  const [newShops, setNewShops] = useState<ShopResponse[]>([]);
  const [featuredShops, setFeaturedShops] = useState<ShopResponse[]>([]);
  const [loading, setLoading] = useState({ trending: true, new: true, featured: true });

  useEffect(() => {
    const fetchAllShops = async () => {
      try {
        const trendingResponse = await shopService.getShops({ page: 1, pageSize: 10 });
        const trendingData = trendingResponse as any;
        setTrendingShops(trendingData.items || []);
        
        const newResponse = await shopService.getShops({ page: 1, pageSize: 8 });
        const newData = newResponse as any;
        setNewShops(newData.items || []);
        
        const featuredResponse = await shopService.getShops({ page: 1, pageSize: 12 });
        const featuredData = featuredResponse as any;
        setFeaturedShops(featuredData.items || []);
        
        setLoading({ trending: false, new: false, featured: false });
      } catch (error) {
        console.error('Erreur:', error);
        setLoading({ trending: false, new: false, featured: false });
      }
    };
    fetchAllShops();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-6">
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/40 to-black">
          {/* Dégradés néon en arrière-plan */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#B82BFF]/5 via-transparent to-[#E5A13E]/5" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-[#B82BFF] to-[#FF00FF] rounded-full blur-3xl opacity-10" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-[#E5A13E] to-[#FF6B00] rounded-full blur-3xl opacity-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-5" />
          
          <div className="relative flex flex-col items-center justify-center py-16 px-4 text-center">
            {/* Petit texte au-dessus */}
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-3">
              The next generation of independent
            </p>

            {/* NOVAERA Society en GROS - CORRIGÉ */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-tight">
              NOVAERA Society
            </h1>

            {/* OWN THE ERA avec dégradé néon */}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-r from-[#B82BFF] via-[#FF00FF] to-[#E5A13E] bg-clip-text text-transparent">
              OWN THE ERA
            </h2>

            {/* starts here en blanc (petit) */}
            <p className="text-white text-sm uppercase tracking-wider mb-8">
              starts here.
            </p>

            {/* Boutons CTA */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/shop/create"
                className="bg-gradient-to-r from-[#B82BFF] via-[#FF00FF] to-[#E5A13E] hover:from-[#9A00DD] hover:via-[#D94BFF] hover:to-[#D48A2B] text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 text-sm shadow-lg"
              >
                Create Your Shop
              </Link>
              <Link
                href="/shops"
                className="border border-gray-600 hover:border-[#B82BFF] hover:bg-gradient-to-r hover:from-[#B82BFF]/10 hover:to-[#FF00FF]/10 text-white hover:text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 text-sm"
              >
                Explore Creators
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Creators */}
      <ShopRow title="FEATURED CREATORS" shops={featuredShops} loading={loading.featured} variant="default" />

      {/* Discover New Brands */}
      <ShopRow title="DISCOVER NEW BRANDS" shops={newShops} loading={loading.new} variant="new" />

      {/* Brands Tendance */}
      <ShopRow title="BRANDS TENDANCE" shops={trendingShops} loading={loading.trending} variant="trending" />
    </div>
  );
}