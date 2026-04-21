'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// IMPORTANT: Enregistrer les composants nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  title?: string;
  color?: string;
}

const Chart = ({ data, title, color = '#e50914' }: ChartProps) => {
  // Vérifier que les données existent
  if (!data || !data.labels || !data.values || data.labels.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
      </div>
    );
  }

  const chartData: ChartData<'line'> = {
    labels: data.labels,
    datasets: [
      {
        label: 'Ventes',
        data: data.values,
        borderColor: color,
        backgroundColor: `${color}20`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#1f2937', // Couleur du titre en mode clair
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb20', // Grille plus transparente
        },
        ticks: {
          callback: (value) => {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
            }).format(value as number);
          },
          color: '#6b7280', // Couleur des ticks en mode clair
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280', // Couleur des ticks en mode clair
        },
      },
    },
  };

  // Pour le mode sombre, on peut ajuster la couleur du titre
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    if (options.plugins?.title) {
      options.plugins.title.color = '#f3f4f6';
    }
    if (options.scales?.y?.ticks) {
      options.scales.y.ticks.color = '#9ca3af';
    }
    if (options.scales?.x?.ticks) {
      options.scales.x.ticks.color = '#9ca3af';
    }
  }

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default Chart;