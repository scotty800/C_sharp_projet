import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryRow.css';

const CategoryRow = ({ categories }) => {
    return (
        <div className='category-row'>
            <h2 className='category-row-title'>Parcourir par catégorie</h2>

            <div className='category-grid'>
                {categories.map((category) => (
                    <Link
                     key={category.id}
                     to={`/category/${category.name.toLowerCase()}`}
                     className='category-card'
                     style={{ '--category-color': category.color }}
                    >
                        <div className='category-icon-wrapper'>
                            <span className='category-icon'>{category.icon}</span>
                        </div>
                        <h3 className='category-name'>{category.name}</h3>
                        <span className='category-link'>Explorer →</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryRow;