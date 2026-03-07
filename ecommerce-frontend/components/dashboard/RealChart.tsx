'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface ChartProps {
  type: 'line' | 'bar' | 'doughnut';
  data: any;
  options?: any;
  height?: number;
}

export const RealChart = ({ type, data, options = {}, height = 300 }: ChartProps) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={mergedOptions} />;
      case 'bar':
        return <Bar data={data} options={mergedOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={mergedOptions} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      {renderChart()}
    </div>
  );
};