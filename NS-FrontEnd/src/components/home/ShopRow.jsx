import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import ShopCard from '../shops/ShopCard';
import './ShopRow.css';

const ShopRow = ({ title, shops, seeAllLink}) => {
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

    if (!shops?.length) return null;

    return (
        <div className="shop-row">
            <div className="shop-row-header">
                <h2 className="shop-row-title">{title}</h2>
                {seeAllLink && (
                    <Link to={seeAllLink} className="shop-row-seeall">
                        Voir tout <span className="seeall-arrow">→</span>
                    </Link>
                )}
            </div>

            <div className="shop-row-conatiner">
                <button
                    className="shop-row-nav shop-row-nav-left"
                    onClick={() => scroll('left')}
                    aria-label="Voir précédent"
                >
                    ‹
                </button>

                <div className="shop-row-items" ref={rowRef}>
                    {shops.map((shop) => (
                        <div key={shop.id} className="shop-row-item">
                            <ShopCard shop={shop} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShopRow;