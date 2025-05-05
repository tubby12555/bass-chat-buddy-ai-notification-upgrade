
import React, { ReactNode } from 'react';

interface MobileOverlayProps {
  isMobileMenuOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const MobileOverlay: React.FC<MobileOverlayProps> = ({ 
  isMobileMenuOpen, 
  onClose, 
  children 
}) => {
  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
};
