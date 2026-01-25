'use client';

import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Check if device has fine pointer (not touch)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isTouchDevice = 'ontouchstart' in window;
    
    if (!hasFinePointer || isTouchDevice) {
      return; // Don't show custom cursor on touch devices
    }

    // Show cursor only after mount (prevents hydration mismatch)
    setIsVisible(true);

    const updateCursor = (e: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Check for hoverable elements
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.matches('a, button, [role="button"], input, textarea, select, .y2k-button, .nav-button, .nav-link, .y2k-input')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => setIsHovering(false);

    document.addEventListener('mousemove', updateCursor, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Don't render until client-side mount (prevents hydration mismatch)
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot - Kitchen 154 style */}
      <div
        className="custom-cursor"
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isClicking ? '6px' : isHovering ? '20px' : '10px',
          height: isClicking ? '6px' : isHovering ? '20px' : '10px',
          borderRadius: '50%',
          background: isClicking ? '#f20e0e' : isHovering ? 'transparent' : '#f20e0e',
          border: isHovering ? '2px solid #f20e0e' : 'none',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.15s cubic-bezier(0.4, 0, 0.2, 1), height 0.15s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease, border 0.15s ease',
          willChange: 'transform',
        }}
      />
      {/* Outer ring for hover effect */}
      {isHovering && (
        <div
          className="custom-cursor-ring"
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid rgba(242, 14, 14, 0.5)',
            pointerEvents: 'none',
            zIndex: 9998,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.15s ease',
          }}
        />
      )}
    </>
  );
}
