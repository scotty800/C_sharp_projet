import { 
  HeroSection, 
  CategoryRow,
  TrendingShops,
  NewShops,
  TopRatedShops,
  RecommendedShops 
} from '@/components/home';
import Link from 'next/link';
import { FiPlusCircle } from 'react-icons/fi';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      <div className="space-y-8 py-12">
        <TrendingShops />
        <NewShops />
        <CategoryRow />
        <TopRatedShops />
        <RecommendedShops />
      </div>

      {/* Section CTA pour créer une boutique */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Vous avez une boutique ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de vendeurs et développez votre activité sur notre plateforme
          </p>
          <Link
            href="/shop/create"
            className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            <FiPlusCircle size={24} />
            Ouvrir ma boutique
          </Link>
        </div>
      </section>
    </div>
  );
}