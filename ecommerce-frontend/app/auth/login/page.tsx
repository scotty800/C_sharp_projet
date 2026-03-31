'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      // L'erreur est déjà gérée dans AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dégradé linéaire horizontal gauche → droite */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, #F04E23 0%, #F5B335 100%)'
        }}
      />
      
      {/* Cercles blancs flous pour effet de profondeur */}
      <div 
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-30"
        style={{ background: '#F2F2F2', filter: 'blur(60px)' }}
      />
      <div 
        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-30"
        style={{ background: '#F2F2F2', filter: 'blur(60px)' }}
      />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg overflow-hidden" style={{ background: '#F2F2F2' }}>
              <img 
                src="/logo.png"
                alt="NOVAERA Logo"
                className="w-full h-full object-contain p-3"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#F2F2F2' }}>
            NOVAERA
          </h1>
          <p className="text-sm tracking-wider mt-1 opacity-90" style={{ color: '#F2F2F2' }}>
            OWN THE ERA
          </p>
        </div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 shadow-xl sm:rounded-lg sm:px-10" style={{ background: '#F2F2F2' }}>
          <h2 className="text-center text-2xl font-bold mb-6" style={{ background: 'linear-gradient(90deg, #F04E23, #F5B335)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Connexion
          </h2>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#F04E23' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  border: `1px solid #F5B335`,
                  backgroundColor: 'white',
                  color: '#333'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F04E23';
                  e.target.style.boxShadow = `0 0 0 2px rgba(240, 78, 35, 0.2)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#F5B335';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#F04E23' }}>
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  border: `1px solid #F5B335`,
                  backgroundColor: 'white',
                  color: '#333'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F04E23';
                  e.target.style.boxShadow = `0 0 0 2px rgba(240, 78, 35, 0.2)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#F5B335';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(90deg, #F04E23, #F5B335)'
                }}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="font-medium transition-all hover:underline" style={{ color: '#F04E23' }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}