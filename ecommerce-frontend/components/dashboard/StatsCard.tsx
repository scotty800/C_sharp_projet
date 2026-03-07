'use client';

import { IconType } from 'react-icons';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'green' | 'blue' | 'purple' | 'orange';
}

const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary' }: StatsCardProps) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-600',
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
    orange: 'bg-orange-500/10 text-orange-600',
  };

  // Déterminer si on doit afficher le trend
  const shouldShowTrend = trend && trend.value !== 0 && !isNaN(trend.value);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        {shouldShowTrend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatsCard;