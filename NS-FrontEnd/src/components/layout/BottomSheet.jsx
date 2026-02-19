import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './BottomSheet.css';

const BottomSheet = ({ isOpen, onClose, title, children, height = '50vh' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div 
        className="bottom-sheet"
        style={{ height }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bottom-sheet-handle" onClick={onClose}>
          <div className="handle-bar" />
        </div>
        
        {title && (
          <div className="bottom-sheet-header">
            <h3>{title}</h3>
            <button className="bottom-sheet-close" onClick={onClose}>✕</button>
          </div>
        )}
        
        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BottomSheet;