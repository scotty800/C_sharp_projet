import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product.id, 1);
    };

    const mainImage = !imageError && product.imageUrl
     ? product.imageUrl
     : '/default-product.jpg';

     return (
        <Link
         to={`/product/${product.id}`}
         className='product-card'
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() =>setIsHovered(false)}
        >
            <div className='product-card-image'>
                <img
                 src={mainImage}
                 alt={product.name}
                 onError={() => setImageError(true)}
                 loading='lazy'
                />

                {product.stock <= 0 && (
                    <span className='product-badge out-of-stock'>Rupture</span>
                )}

                {product.discount > 0 && (
                    <span className='product-badge discount'>{product.discount}%</span>
                )}

                {product.isNew && (
                    <span className='product-badge new'>Nouveau</span>
                )}

                {isHovered && product.stock > 0 && (
                    <div className='product-card-overlay'>
                        <Button
                         size='sm'
                         onClick={handleAddToCart}
                         className="quick-add-btn"
                        >
                            Ajouter au panier
                        </Button>
                    </div>
                )}
            </div>

            <div className='product-card-content'>
                <h3 className='product-card-name'>{product.name}</h3>

                <div className='product-card-shop'>
                    <span className='shop-name'>{product.shopName || 'Boutique'}</span>
                </div>

                <div className='product-card-footer'>
                    <div className='product-card-price'>
                        {product.discount > 0 ? (
                            <>
                             <span className='original-price'>
                                {product.price.toFixed(2)}€
                             </span>
                             <span className='discounted-price'>
                                {(product.price * (1 - product.discount / 100)).toFixed(2)}€
                             </span>
                            </>
                        ) : (
                            <span className='current-price'>
                                {product.price.toFixed(2)}€
                            </span>
                        )}
                    </div>

                    <div className='product-card-rating'>
                        <span className='stars'>
                            {'⭐'.repeat(Math.floor(product.rating || 0))}
                        </span>
                        <span className='rating-count'>
                            ({product.reviewCount || 0})
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;