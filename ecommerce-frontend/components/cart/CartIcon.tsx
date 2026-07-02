'use client';

import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '@/hooks/useCart';

interface CartIconProps {
  className?: string;
}

const CartIcon = ({ className = '' }: CartIconProps) => {
  const { itemCount, toggleSidebar } = useCart();

  return (
    <button onClick={toggleSidebar} className={`relative inline-flex items-center ${className}`}>
      <FiShoppingCart size={24} />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;