'use client';

import { useState } from 'react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center"
      aria-label="Menu"
      style={{
        cursor: 'pointer',
      }}
    >
      <span className="sr-only">Open menu</span>
      <div className="relative w-6 h-5">
        {/* Top line */}
        <span
          className={`absolute left-0 w-6 h-0.5 transition-all duration-300 ease-in-out ${
            isOpen ? 'rotate-45 top-2' : 'top-0'
          }`}
          style={{ background: '#f20e0e' }}
        />
        {/* Middle line */}
        <span
          className={`absolute left-0 w-6 h-0.5 transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ 
            background: '#f20e0e',
            top: '10px',
          }}
        />
        {/* Bottom line */}
        <span
          className={`absolute left-0 w-6 h-0.5 transition-all duration-300 ease-in-out ${
            isOpen ? '-rotate-45 top-2' : 'top-5'
          }`}
          style={{ background: '#f20e0e' }}
        />
      </div>
    </button>
  );
}
