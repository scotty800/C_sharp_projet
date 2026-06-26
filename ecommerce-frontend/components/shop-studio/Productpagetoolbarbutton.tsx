'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiFileText, FiChevronDown } from 'react-icons/fi';

/**
 * Drop-in button for StudioToolbar.
 * Shows a labelled button that triggers the ProductPageSidebar panel.
 *
 * Usage in StudioToolbar.tsx:
 *   import ProductPageToolbarButton from './ProductPageToolbarButton';
 *   ...
 *   <ProductPageToolbarButton onOpen={() => setState(p => ({ ...p, activePanel: 'product-page' }))} />
 */
export default function ProductPageToolbarButton({ onOpen }: { onOpen: () => void }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onOpen}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all group"
        style={{
          backgroundColor: 'rgba(99,102,241,0.12)',
          color: '#a5b4fc',
          border: '1px solid rgba(99,102,241,0.25)',
        }}
      >
        <FiFileText size={14} />
        <span>Page produit</span>
      </button>

      {showTooltip && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap z-50 pointer-events-none"
          style={{ backgroundColor: '#1f2937', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Générer une page produit à partir d'un template
        </div>
      )}
    </div>
  );
}