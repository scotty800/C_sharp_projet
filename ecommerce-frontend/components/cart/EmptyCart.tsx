'use client';

import Link from 'next/link';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';

const EmptyCart = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
          <FiShoppingCart className="text-gray-400 dark:text-gray-500" size={40} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Votre panier est vide
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Découvrez nos boutiques et trouvez des produits uniques à ajouter à votre panier.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shops"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Explorer les boutiques
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
            Retour à l'accueil
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Vous pourriez aimer :</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 animate-pulse" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Produit {i}</p>
                <p className="text-sm text-primary">29.99 €</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;