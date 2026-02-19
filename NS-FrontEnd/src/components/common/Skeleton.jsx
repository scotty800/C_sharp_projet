import React from 'react';
import './Skeleton.css';

const Skeleton = ({ 
  type = 'text', 
  width, 
  height, 
  circle = false,
  count = 1,
  className = '' 
}) => {
  const style = {
    width: width || (type === 'text' ? '100%' : undefined),
    height: height || (type === 'avatar' ? '40px' : type === 'image' ? '200px' : '20px'),
    borderRadius: circle ? '50%' : undefined
  };

  const skeletons = [];

  for (let i = 0; i < count; i++) {
    skeletons.push(
      <div 
        key={i}
        className={`skeleton skeleton-${type} ${className}`}
        style={style}
      />
    );
  }

  return <>{skeletons}</>;
};

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton type="image" height="200px" />
    <div className="skeleton-card-content">
      <Skeleton width="80%" />
      <Skeleton width="60%" />
      <Skeleton width="40%" />
    </div>
  </div>
);

export const SkeletonProduct = () => (
  <div className="skeleton-product">
    <Skeleton type="image" height="200px" />
    <div className="skeleton-product-content">
      <Skeleton width="90%" />
      <Skeleton width="70%" />
      <div className="skeleton-product-footer">
        <Skeleton width="40%" />
        <Skeleton width="30%" />
      </div>
    </div>
  </div>
);

export const SkeletonShop = () => (
  <div className="skeleton-shop">
    <Skeleton type="image" height="150px" />
    <div className="skeleton-shop-content">
      <div className="skeleton-shop-header">
        <Skeleton type="avatar" circle width="50px" height="50px" />
        <div className="skeleton-shop-info">
          <Skeleton width="120px" />
          <Skeleton width="80px" />
        </div>
      </div>
      <Skeleton count={2} />
    </div>
  </div>
);

export default Skeleton;