'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
  image: string; // Changé pour correspondre aux fichiers SVG
}

const categories: Category[] = [
  { id: 'mode', name: 'Mode', count: 1234, color: 'bg-pink-500', image: '/images/categories/mode.svg' },
  { id: 'electronique', name: 'Électronique', count: 856, color: 'bg-blue-500', image: '/images/categories/electronique.svg' },
  { id: 'maison', name: 'Maison', count: 2341, color: 'bg-green-500', image: '/images/categories/maison.svg' },
  { id: 'sport', name: 'Sport', count: 567, color: 'bg-orange-500', image: '/images/categories/sport.svg' },
  { id: 'beaute', name: 'Beauté', count: 432, color: 'bg-purple-500', image: '/images/categories/beaute.svg' },
  { id: 'jeux', name: 'Jeux', count: 789, color: 'bg-red-500', image: '/images/categories/jeux.svg' },
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