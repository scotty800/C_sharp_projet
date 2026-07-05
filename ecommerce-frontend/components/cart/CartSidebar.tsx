'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiX, FiPackage, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/services/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';
import { useProductCardIdentity } from '@/hooks/useProductCardIdentity';
import { CartItem as CartItemType } from '@/types/cart';

const CartSidebar = () => {
  const { cart, isSidebarOpen, closeSidebar } = useCart();
  const items = cart?.items || [];

  return (
    <>
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiShoppingBag />
            Mon panier
            {items.length > 0 && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({items.length})
              </span>
            )}
          </h2>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Fermer"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <FiShoppingBag size={40} className="text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">Votre panier est vide</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <SidebarCartItem key={item.id} item={item} onNavigate={closeSidebar} />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 space-y-3">
          {items.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sous-total</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(cart?.totalAmount || 0)}
              </span>
            </div>
          )}

          {items.length > 0 && (
            <Link
              href="/cart"
              onClick={closeSidebar}
              className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Voir le panier
            </Link>
          )}

          <Link
            href="/orders"
            onClick={closeSidebar}
            className="block w-full text-center border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary font-semibold py-3 rounded-lg transition-colors"
          >
            Voir toutes mes commandes
          </Link>
        </div>
      </aside>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Carte produit individuelle — identité visuelle résolue par produit
// ─────────────────────────────────────────────────────────────────────────────

function SidebarCartItem({
  item,
  onNavigate,
}: {
  item: CartItemType;
  onNavigate: () => void;
}) {
  const identity = useProductCardIdentity(item.shopId, item.productId);
  const mutedColor = identity.mutedTextColor || identity.textColor + '80';

  return (
    <li
      className="flex gap-3 p-3 transition-shadow"
      style={{
        backgroundColor: identity.panelColor,
        borderRadius: `${identity.borderRadius}px`,
        boxShadow: identity.boxShadow,
        border: identity.source === 'product-page' ? `1px solid ${identity.borderColor}` : '1px solid #eeeeee',
      }}
    >
      {/* Image — non cliquable */}
      <div
        className="relative w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800"
        style={{ borderRadius: `${Math.max(identity.borderRadius - 4, 0)}px` }}
      >
        <Image
          src={item.productImage ? getImageUrl(item.productImage) : '/images/product-placeholder.svg'}
          alt={item.productName}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex-1 min-w-0">
        {item.shopSlug && (
          <Link
            href={`/shop/${item.shopSlug}`}
            onClick={onNavigate}
            className="flex items-center gap-1.5 mb-1 group w-fit"
          >
            <div className="relative w-4 h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {item.shopLogoUrl ? (
                <Image
                  src={getImageUrl(item.shopLogoUrl)}
                  alt={item.shopName || ''}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <FiPackage className="w-full h-full p-0.5 text-gray-400" />
              )}
            </div>
            <span className="text-xs truncate transition-opacity hover:opacity-70" style={{ color: mutedColor }}>
              {item.shopName}
            </span>
          </Link>
        )}

        {/* Nom du produit — non cliquable */}
        <p
          className="text-sm line-clamp-2"
          style={{
            fontFamily: identity.fontFamily,
            fontWeight: identity.headingWeight,
            color: identity.textColor,
          }}
        >
          {item.productName}
        </p>

        {/* Variante sélectionnée */}
        {(item.selectedSize || item.selectedColor) && (
          <p className="text-xs mt-0.5" style={{ color: mutedColor }}>
            {item.selectedSize && `Taille: ${item.selectedSize}`}
            {item.selectedSize && item.selectedColor && ' · '}
            {item.selectedColor && `Couleur: ${item.selectedColor}`}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs" style={{ color: mutedColor }}>
            Qté : {item.quantity}
          </span>
          <span className="text-sm font-semibold" style={{ color: identity.textColor }}>
            {formatPrice(item.totalPrice)}
          </span>
        </div>
      </div>
    </li>
  );
}

export default CartSidebar;