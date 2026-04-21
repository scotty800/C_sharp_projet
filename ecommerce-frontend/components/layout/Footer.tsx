import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-secondary dark:bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">MarketPlace</h3>
            <p className="text-gray-400 dark:text-gray-500 mb-4">
              La plateforme n°1 pour acheter et vendre dans toute la France.
              Rejoignez des milliers de vendeurs et acheteurs satisfaits.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors"
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors"
              >
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white dark:text-gray-200">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutiques */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white dark:text-gray-200">Boutiques</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shops" className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                  Toutes les boutiques
                </Link>
              </li>
              <li>
                <Link href="/shop/create" className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                  Ouvrir ma boutique
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                  Bonnes affaires
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white dark:text-gray-200">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-3 text-gray-400 dark:text-gray-500">
                <FiMail />
                <span>support@marketplace.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 dark:text-gray-500">
                <FiPhone />
                <span>+33 1 23 45 67 89</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} MarketPlace. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;