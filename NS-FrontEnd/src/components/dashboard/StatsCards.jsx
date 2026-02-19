import React from 'react';
import './StatsCards.css';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Chiffre d\'affaires',
      value: stats.revenue ? `${stats.revenue.toFixed(2)}€` : '0€',
      change: stats.revenueChange || '+12%',
      icon: '💰',
      color: 'primary'
    },
    {
      title: 'Commandes',
      value: stats.orders || '0',
      change: stats.ordersChange || '+8%',
      icon: '📦',
      color: 'success'
    },
    {
      title: 'Produits vendus',
      value: stats.productsSold || '0',
      change: stats.productsChange || '+15%',
      icon: '🏷️',
      color: 'warning'
    },
    {
      title: 'Visiteurs',
      value: stats.visitors || '0',
      change: stats.visitorsChange || '+24%',
      icon: '👥',
      color: 'info'
    }
  ];

  return (
    <div className="stats-cards">
      {cards.map((card, index) => (
        <div key={index} className={`stat-card card-${card.color}`}>
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-content">
            <span className="stat-title">{card.title}</span>
            <span className="stat-value">{card.value}</span>
            <span className={`stat-change ${card.change.startsWith('+') ? 'positive' : 'negative'}`}>
              {card.change} vs mois dernier
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;