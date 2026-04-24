// components/home/CategoryRow.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

const categories: Category[] = [
  { id: 'streetwear', name: 'Streetwear', count: 1234 },
  { id: 'jewelry', name: 'Jewelry', count: 856 },
  { id: 'skincare', name: 'Skincare', count: 2341 },
  { id: 'creative', name: 'Creative Goods', count: 567 },
  { id: 'beauty', name: 'Beauty', count: 432 },
  { id: 'accessories', name: 'Accessories', count: 789 },
];

const CategoryRow = () => {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              EXPLORE CATEGORIES
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Discover brands by category
            </p>
          </div>
          <Link
            href="/categories"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-semibold flex items-center gap-1 transition-colors group"
          >
            View all
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 aspect-square hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                <div className="text-4xl mb-2">
                  {category.name === 'Streetwear' && '👕'}
                  {category.name === 'Jewelry' && '💎'}
                  {category.name === 'Skincare' && '✨'}
                  {category.name === 'Creative Goods' && '🎨'}
                  {category.name === 'Beauty' && '💄'}
                  {category.name === 'Accessories' && '👜'}
                </div>
                <h3 className="font-bold text-lg">{category.name}</h3>
                <p className="text-sm text-gray-200">{category.count} brands</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryRow;