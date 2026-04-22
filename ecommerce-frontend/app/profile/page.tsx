'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { FiMoon, FiSun, FiUser, FiMail, FiSave } from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Sauvegarder les paramètres (à implémenter avec ton API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres sauvegardés');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Veuillez vous connecter</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Mon profil</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          {/* Informations personnelles */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informations personnelles</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FiUser className="text-primary" size={20} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nom d'utilisateur</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FiMail className="text-primary" size={20} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Thème */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Préférences d'affichage</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Thème</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {theme === 'dark' ? 'Sombre' : 'Clair'}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  {theme === 'dark' ? (
                    <>
                      <FiSun size={18} />
                      <span>Passer en clair</span>
                    </>
                  ) : (
                    <>
                      <FiMoon size={18} />
                      <span>Passer en sombre</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiSave />
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}