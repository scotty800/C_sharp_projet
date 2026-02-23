'use client';

import Link from 'next/link';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';

const EmptyCart = () => {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
        <FiShoppingCart className="text-gray-400" size={40} />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Votre panier est vide
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
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
        <h3 className="text-lg font-semibold mb-4">Vous pourriez aimer :</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Produit {i}</p>
              <p className="text-sm text-primary">29.99 €</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;