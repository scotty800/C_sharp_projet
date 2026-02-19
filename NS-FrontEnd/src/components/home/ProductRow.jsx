import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../products/ProductCard';
import './ProductRow.css'

const ProductRow = ({ title, products, seeAllLink }) => {
    const rowRef = useRef(null);

    const scroll = (direction) => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === 'left'
            ? scrollLeft - clientWidth
            : scrollLeft + clientWidth;

            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (!products?.length) return null;

    return (
        <div className='product-row'>
            <div className='product-row-header'>
                <h2 className='product-row-title'>{title}</h2>
                {seeAllLink && (
                    <Link to={seeAllLink} className='product-row-seeall'>
                        voir tout <span className='seeall-arrow'>→</span>
                    </Link>
                )}
            </div>

            <div className='product-row-container'>
                <button
                 className='product-row-nav product-row-nav-left'
                 onClick={() => scroll('left')}
                 aria-label='Voir précédent'
                >
                    ‹
                </button>

                <button
                 className='product-row-nav product-row-nav-right'
                 onClick={() => scroll('right')}
                 aria-label='Voir suivant'
                >
                    ›
                </button>

                <div className='product-row-items' ref={rowRef}>
                    {products.map((product) => (
                        <div key={product.id} className='product-row-item'>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductRow;