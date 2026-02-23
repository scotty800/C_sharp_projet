'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiChevronRight } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

const categories: Category[] = [
  {
    id: 'mode',
    name: 'Mode',
    image: '/images/categories/mode.jpg',
    count: 1234,
  },
  {
    id: 'electronique',
    name: 'Électronique',
    image: '/images/categories/electronique.jpg',
    count: 856,
  },
  {
    id: 'maison',
    name: 'Maison',
    image: '/images/categories/maison.jpg',
    count: 2341,
  },
  {
    id: 'sport',
    name: 'Sport',
    image: '/images/categories/sport.jpg',
    count: 567,
  },
  {
    id: 'beaute',
    name: 'Beauté',
    image: '/images/categories/beaute.jpg',
    count: 432,
  },
  {
    id: 'jeux',
    name: 'Jeux',
    image: '/images/categories/jeux.jpg',
    count: 789,
  },
];

const CategoryRow = () => {
  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Parcourir par catégorie</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group relative overflow-hidden rounded-lg aspect-square"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-sm text-gray-300">{category.count} produits</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryRow;