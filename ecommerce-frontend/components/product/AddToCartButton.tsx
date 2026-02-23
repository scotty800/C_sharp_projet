'use client';

import { useState } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  productId: number;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const AddToCartButton = ({ 
  productId, 
  quantity = 1, 
  disabled = false,
  className = '',
  children 
}: AddToCartButtonProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleClick = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(productId, quantity);
      toast.success('Produit ajouté au panier');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isAdding}
      className={`flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <FiShoppingCart className={isAdding ? 'animate-bounce' : ''} />
      {children || (isAdding ? 'Ajout en cours...' : 'Ajouter au panier')}
    </button>
  );
};

export default AddToCartButton;