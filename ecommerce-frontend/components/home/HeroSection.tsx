// components/home/HeroSection.tsx
'use client';

import Link from 'next/link';
import { FiSearch, FiArrowRight, FiPlusCircle } from 'react-icons/fi';
import { useState } from 'react';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-500 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-16 text-center">
        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 animate-fade-in">
          <span className="px-3 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs font-semibold rounded-full">
            SOCIET
          </span>
          <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold rounded-full">
            NOVERA Society
          </span>
          <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold rounded-full">
            VISION CLUB
          </span>
          <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold rounded-full">
            OWN THE ERA
          </span>
        </div>

        {/* Titre principal */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
          The next generation of
          <br />
          independent <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            brands starts here.
          </span>
        </h1>

        {/* Boutons CTA */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            href="/shop/create"
            className="inline-flex items-center gap-2 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            <FiPlusCircle size={20} />
            Create Your Shop
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Explore Creators
            <FiArrowRight />
          </Link>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for brands, products..."
              className="w-full px-6 py-4 pl-12 pr-20 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent shadow-lg"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="flex justify-center gap-8 mt-12">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">10k+</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Brands</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">50k+</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Products</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">100k+</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Community</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;