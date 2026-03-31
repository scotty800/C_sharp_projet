'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { isValidEmail, isStrongPassword } from '@/services/utils/validators';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username
    if (!formData.username) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    } else if (formData.username.length > 20) {
      newErrors.username = "Le nom d'utilisateur ne peut pas dépasser 20 caractères";
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    // Password
    const passwordValidation = isStrongPassword(formData.password);
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Terms
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Effacer l'erreur du champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      showNotification('success', 'Inscription réussie ! Bienvenue !');
      router.push('/');
    } catch (error: any) {
      showNotification('error', error.response?.data?.message || "Erreur lors de l'inscription");
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
        className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20"
        style={{ background: '#F2F2F2', filter: 'blur(80px)' }}
      />
      <div 
        className="absolute bottom-20 right-20 w-72 h-72 rounded-full opacity-20"
        style={{ background: '#F2F2F2', filter: 'blur(80px)' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
        style={{ background: '#F2F2F2', filter: 'blur(100px)' }}
      />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-6">
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
          <h2 className="text-center text-2xl font-bold mb-2" style={{ background: 'linear-gradient(90deg, #F04E23, #F5B335)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Créer un compte
          </h2>
          <p className="text-center text-sm mb-6" style={{ color: '#666' }}>
            Rejoignez notre communauté d'acheteurs et vendeurs
          </p>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Nom d'utilisateur */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1" style={{ color: '#F04E23' }}>
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser style={{ color: '#F5B335' }} size={18} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.username ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    border: `1px solid ${errors.username ? '#ef4444' : '#F5B335'}`,
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => {
                    if (!errors.username) {
                      e.target.style.borderColor = '#F04E23';
                      e.target.style.boxShadow = `0 0 0 2px rgba(240, 78, 35, 0.2)`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.username) {
                      e.target.style.borderColor = '#F5B335';
                    }
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="JohnDoe"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#F04E23' }}>
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail style={{ color: '#F5B335' }} size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    border: `1px solid ${errors.email ? '#ef4444' : '#F5B335'}`,
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = '#F04E23';
                      e.target.style.boxShadow = `0 0 0 2px rgba(240, 78, 35, 0.2)`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = '#F5B335';
                    }
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="vous@exemple.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#F04E23' }}>
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock style={{ color: '#F5B335' }} size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    border: `1px solid ${errors.password ? '#ef4444' : '#F5B335'}`,
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = '#F04E23';
                      e.target.style.boxShadow = `0 0 0 2px rgba(240, 78, 35, 0.2)`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = '#F5B335';
                    }
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="text-gray-400 hover:text-gray-600" size={18} />
                  ) : (
                    <FiEye className="text-gray-400 hover:text-gray-600" size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <div className="mt-2 text-xs" style={{ color: '#F04E23' }}>
                Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: '#F04E23' }}>
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock style={{ color: '#F5B335' }} size={18} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword ? 'border-red-500' : ''
                  }`}
                  style={{ 
                    border: `1px solid ${errors.confirmPassword ? '#ef4444' : '#F5B335'}`,
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => {
                    if (!errors.confirmPassword) {
                      e.target.style.borderColor = '#F04E23';
                      e.target.style.boxShadow = `0 0 0 2px rgba(240, 78, 35, 0.2)`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.confirmPassword) {
                      e.target.style.borderColor = '#F5B335';
                    }
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="text-gray-400 hover:text-gray-600" size={18} />
                  ) : (
                    <FiEye className="text-gray-400 hover:text-gray-600" size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Conditions d'utilisation */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="h-4 w-4 rounded focus:ring-2"
                  style={{ 
                    borderColor: '#F5B335',
                    accentColor: '#F04E23'
                  }}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" style={{ color: '#666' }}>
                  J'accepte les{' '}
                  <a href="/terms" className="transition-all hover:underline" style={{ color: '#F04E23' }}>
                    conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="/privacy" className="transition-all hover:underline" style={{ color: '#F04E23' }}>
                    politique de confidentialité
                  </a>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
                )}
              </div>
            </div>

            {/* Bouton d'inscription */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(90deg, #F04E23, #F5B335)'
                }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Inscription en cours...</span>
                  </>
                ) : (
                  <>
                    <span>S'inscrire</span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Séparateur */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#E5E7EB' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2" style={{ background: '#F2F2F2', color: '#666' }}>Ou continuer avec</span>
              </div>
            </div>
          </div>

          {/* Boutons réseaux sociaux */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="w-full flex justify-center items-center gap-2 border rounded-lg font-medium py-2 px-4 transition-all hover:shadow-md" style={{ borderColor: '#F5B335', background: 'white', color: '#F04E23' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#F04E23"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              <span>Google</span>
            </button>
            <button className="w-full flex justify-center items-center gap-2 border rounded-lg font-medium py-2 px-4 transition-all hover:shadow-md" style={{ borderColor: '#F5B335', background: 'white', color: '#F04E23' }}>
              <svg className="w-5 h-5" fill="#F04E23" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Lien vers connexion */}
          <p className="mt-6 text-center text-sm">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="font-semibold transition-all hover:underline" style={{ color: '#F04E23' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}