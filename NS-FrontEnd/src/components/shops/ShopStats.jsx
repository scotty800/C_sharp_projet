import React from 'react';
import './ShopStats.css';

const ShopStats = ({ shop }) => {
  const stats = [
    {
      label: 'Produits',
      value: shop.productCount || 0,
      icon: '📦',
      change: '+12%'
    },
    {
      label: 'Commandes',
      value: shop.orderCount || 0,
      icon: '🛒',
      change: '+8%'
    },
    {
      label: 'Avis',
      value: shop.reviewCount || 0,
      icon: '⭐',
      change: '+15%'
    },
    {
      label: 'Note moyenne',
      value: shop.rating || 'Nouveau',
      icon: '📊',
      change: shop.rating ? '+0.2' : null
    },
    {
      label: 'Vues',
      value: shop.viewCount || 0,
      icon: '👁️',
      change: '+24%'
    },
    {
      label: 'Taux de conversion',
      value: shop.conversionRate ? `${shop.conversionRate}%` : '0%',
      icon: '📈',
      change: '+3%'
    }
  ];

  return (
    <div className="shop-stats">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              {stat.change && (
                <span className="stat-change positive">{stat.change}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="stats-chart">
        <h4>Activité récente</h4>
        <div className="chart-bars">
          {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
            <div key={i} className="chart-bar">
              <div 
                className="bar-fill"
                style={{ height: `${height}%` }}
              />
              <span className="bar-label">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-footer">
        <div className="stat-summary">
          <span className="summary-label">Revenus totaux</span>
          <span className="summary-value">
            {shop.totalRevenue ? `${shop.totalRevenue.toFixed(2)}€` : '0€'}
          </span>
        </div>
        <div className="stat-summary">
          <span className="summary-label">Meilleure vente</span>
          <span className="summary-value">{shop.topProduct || '—'}</span>
        </div>
      </div>
    </div>
  );
};

export default ShopStats;