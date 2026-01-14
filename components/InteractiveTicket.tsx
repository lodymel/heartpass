'use client';

import { useState } from 'react';

interface InteractiveTicketProps {
  from: string;
  to: string;
  title: string;
  description: string;
}

export default function InteractiveTicket({ from, to, title, description }: InteractiveTicketProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isUsed, setIsUsed] = useState(false);

  const handlePressStart = () => {
    setIsPressed(true);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
  };

  const handleUse = () => {
    if (!isUsed) {
      setIsUsed(true);
    }
  };

  return (
    <div className="ticket-interactive">
      <div
        className={`ticket-card ${isPressed ? 'pressed' : ''} ${isUsed ? 'used' : ''}`}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onClick={handleUse}
      >
        {/* ONE TIME ONLY / USED Badge */}
        <div className={`ticket-badge ${isUsed ? 'used' : ''}`}>
          {isUsed ? 'USED' : 'ONE TIME ONLY'}
        </div>

        <div className="ticket-content-wrapper p-10">
          {/* FROM / TO Section */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#e5e5e5]">
            <div className="flex-1">
              <div className="jenny-label text-[10px] mb-2">
                From
              </div>
              <div className="jenny-body text-sm ticket-name font-normal">
                {from || 'Your Name'}
              </div>
            </div>
            <div className="mx-6 text-lg">→</div>
            <div className="flex-1 text-right">
              <div className="jenny-label text-[10px] mb-2">
                To
              </div>
              <div className="jenny-body text-sm ticket-name font-normal">
                {to || 'Loved One'}
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="jenny-heading text-3xl md:text-4xl mb-6 ticket-title" style={{ 
            fontWeight: 300,
            letterSpacing: '-0.025em',
            lineHeight: 1.2
          }}>
            {title || 'Experience Title'}
          </h2>

          {/* Description */}
          <p className="regular_paragraph text-base mb-8 ticket-description">
            {description || 'A special experience for someone special'}
          </p>

          {/* Divider */}
          <div className="ticket-divider"></div>

          {/* Footer */}
          <div className="flex justify-between items-center gap-6 mt-8">
            <div className="flex justify-between items-center flex-1">
              <span className="jenny-label text-[9px]">
                Valid Until
              </span>
              <span className="jenny-body text-xs ml-2 font-normal">
                LIFETIME
              </span>
            </div>
            <div className="flex justify-between items-center flex-1">
              <span className="jenny-label text-[9px]">
                Usage
              </span>
              <span className="jenny-body text-xs ml-2 font-normal">
                ONE TIME ONLY
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
