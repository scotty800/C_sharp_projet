import React from 'react';
import './RevenueChart.css';

const RevenueChart = ({ data, period = 'week' }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="revenue-chart">
      <div className="chart-header">
        <h4>Évolution des revenus</h4>
        <div className="chart-periods">
          <button className={`period-btn ${period === 'week' ? 'active' : ''}`}>
            Semaine
          </button>
          <button className={`period-btn ${period === 'month' ? 'active' : ''}`}>
            Mois
          </button>
          <button className={`period-btn ${period === 'year' ? 'active' : ''}`}>
            Année
          </button>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-bars">
          {data.map((item, index) => (
            <div key={index} className="chart-bar-wrapper">
              <div className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${(item.value / maxValue) * 100}%`,
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <span className="bar-tooltip">{item.value}€</span>
                </div>
              </div>
              <span className="bar-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="chart-stats">
          <div className="stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">
              {data.reduce((sum, item) => sum + item.value, 0).toFixed(2)}€
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Moyenne</span>
            <span className="stat-value">
              {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(2)}€
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Meilleur jour</span>
            <span className="stat-value">
              {Math.max(...data.map(d => d.value)).toFixed(2)}€
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;