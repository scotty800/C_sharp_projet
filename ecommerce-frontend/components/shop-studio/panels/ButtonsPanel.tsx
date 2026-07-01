'use client';

import { FiCreditCard, FiSquare, FiArrowRight } from 'react-icons/fi';

interface Props {
  onAddButton: (buttonData: any) => void;
}

const BUTTON_VARIANTS = [
  {
    label: 'Bouton plein',
    icon: FiSquare,
    defaultProps: {
      text: 'Cliquez ici',
      backgroundColor: '#2563EB',
      textColor: '#FFFFFF',
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: '600',
      borderRadius: 8,
      paddingX: 20,
      paddingY: 10,
      border: 'none',
    }
  },
  {
    label: 'Bouton contour',
    icon: FiCreditCard,
    defaultProps: {
      text: 'En savoir plus',
      backgroundColor: 'transparent',
      textColor: '#2563EB',
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: '600',
      borderRadius: 8,
      paddingX: 20,
      paddingY: 10,
      border: '2px solid #2563EB',
    }
  },
  {
    label: 'Bouton flèche',
    icon: FiArrowRight,
    defaultProps: {
      text: 'Découvrir →',
      backgroundColor: '#111827',
      textColor: '#FFFFFF',
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: '600',
      borderRadius: 999,
      paddingX: 24,
      paddingY: 12,
      border: 'none',
    }
  },
];

export default function ButtonsPanel({ onAddButton }: Props) {
  return (
    <div className="space-y-2">
      {BUTTON_VARIANTS.map((variant, idx) => {
        const Icon = variant.icon;
        return (
          <button
            key={idx}
            onClick={() => onAddButton({ type: 'button', ...variant.defaultProps })}
            className="w-full flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all hover:scale-[1.02] text-left"
          >
            <div className="p-2 bg-primary/20 rounded-lg">
              <Icon size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{variant.label}</div>
            </div>
            <div className="text-gray-500 text-xl">+</div>
          </button>
        );
      })}
    </div>
  );
}