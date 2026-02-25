'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

const HeroSection = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="relative h-[600px] bg-gradient-to-r from-black to-gray-900 overflow-hidden">
      {/* Image de fond avec fallback */}
      <div className="absolute inset-0 opacity-40">
        {!imageError ? (
          <Image
            src="/images/hero-bg.svg"  // Changé de .jpg à .svg
            alt="Hero background"
            fill
            className="object-cover"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-primary-dark" />
        )}
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
            Découvrez des{' '}
            <span className="text-primary">boutiques uniques</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up delay-100">
            Des milliers de vendeurs passionnés vous attendent. Achetez et vendez en toute confiance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-200">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                className="w-full px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            </div>
            <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              Rechercher
              <FiArrowRight />
            </button>
          </div>

          <div className="flex gap-8 mt-12 animate-slide-up delay-300">
            <div>
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-gray-300">Boutiques</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50k+</div>
              <div className="text-gray-300">Produits</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100k+</div>
              <div className="text-gray-300">Acheteurs</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;