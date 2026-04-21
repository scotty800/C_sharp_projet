'use client';

import { FiCheck, FiPackage, FiTruck, FiHome, FiClock } from 'react-icons/fi';

interface OrderStatusProps {
  currentStatus: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

const OrderStatus = ({ currentStatus, estimatedDelivery, trackingNumber }: OrderStatusProps) => {
  const steps = [
    { key: 'Pending', label: 'Commande confirmée', icon: FiCheck, date: '2024-01-15' },
    { key: 'Processing', label: 'En préparation', icon: FiPackage, date: '2024-01-16' },
    { key: 'Shipped', label: 'Expédiée', icon: FiTruck, date: '2024-01-17' },
    { key: 'Delivered', label: 'Livrée', icon: FiHome, date: null },
  ];

  const getCurrentStepIndex = () => {
    const index = steps.findIndex(step => step.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Suivi de commande</h3>

      {/* Timeline */}
      <div className="relative">
        {/* Ligne de progression */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        
        {/* Étapes */}
        <div className="space-y-8 relative">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-start gap-4">
                {/* Icône */}
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}>
                  <Icon size={20} />
                </div>

                {/* Contenu */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold ${
                      isCurrent ? 'text-primary' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {step.label}
                    </h4>
                    {step.date && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">{step.date}</span>
                    )}
                  </div>
                  
                  {isCurrent && !step.date && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FiClock className="animate-pulse" />
                      En cours
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informations supplémentaires */}
      {(estimatedDelivery || trackingNumber) && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          {estimatedDelivery && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Livraison estimée</span>
              <span className="font-semibold text-gray-900 dark:text-white">{estimatedDelivery}</span>
            </div>
          )}
          {trackingNumber && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Numéro de suivi</span>
              <span className="font-mono text-primary font-semibold">{trackingNumber}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderStatus;