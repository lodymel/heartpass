'use client';

import { format } from 'date-fns';
import { CardData } from '@/types';
import { defaultTicketPositions, ticketPositions, TicketPosition } from '@/data/ticket-positions';

interface CustomTicketProps {
  cardData: CardData;
  message: string;
  onMessageChange?: (message: string) => void;
}

export default function CustomTicket({ cardData, message, onMessageChange }: CustomTicketProps) {
  // Map coupon type to ticket image filename
  const getTicketImagePath = (couponType: string) => {
    // Custom filename mappings
    // If your ticket image filename is different from coupon type ID, add it here
    // Supports both .png and .svg files
    const filenameMap: Record<string, string> = {
      'movie-night': 'movie-ticket.svg', // Updated to SVG
      // Add more mappings here as you design more tickets:
      // 'full-body-massage': 'full-body-massage-ticket.svg',
      // 'coffee-dessert-day': 'coffee-dessert-ticket.svg',
    };
    
    // Use custom mapping if exists, otherwise try .svg first, then .png
    if (filenameMap[couponType]) {
      return `/tickets/${filenameMap[couponType]}`;
    }
    
    // Try SVG first, then PNG as fallback
    return `/tickets/${couponType}.svg`;
  };

  // Get positions for this coupon type, or use defaults
  const getPositions = (): TicketPosition => {
    const customPositions = ticketPositions[cardData.couponType];
    if (!customPositions) return defaultTicketPositions;

    return {
      from: { ...defaultTicketPositions.from, ...customPositions.from },
      to: { ...defaultTicketPositions.to, ...customPositions.to },
      message: { ...defaultTicketPositions.message, ...customPositions.message },
      issued: { ...defaultTicketPositions.issued, ...customPositions.issued },
    };
  };

  const positions = getPositions();
  const ticketImagePath = getTicketImagePath(cardData.couponType);
  const issueDate = cardData.issueDate 
    ? format(new Date(cardData.issueDate), 'MMM dd, yyyy')
    : format(new Date(), 'MMM dd, yyyy');

  return (
    <div
      id="heartpass-card"
      className="relative w-full mx-auto"
      style={{
        maxWidth: '1200px',
        aspectRatio: 'auto',
      }}
    >
      {/* Ticket Image Background */}
      <div className="relative w-full">
        <img
          src={ticketImagePath}
          alt="HeartPass Ticket"
          className="w-full h-auto"
          style={{ 
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
          }}
          onError={(e) => {
            // Hide image if not found
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            console.warn(`Ticket image not found: ${ticketImagePath}`);
          }}
        />

        {/* Overlay Content - FROM name (under FROM underline) */}
        {cardData.senderName && (
          <div
            className="absolute"
            style={{
              top: positions.from.top,
              left: positions.from.left,
              width: positions.from.width,
              pointerEvents: 'none',
            }}
          >
            <div
              className="text-[#f20e0e] font-medium"
              style={{
                fontSize: '1.1em',
                letterSpacing: '-0.02em',
                textAlign: 'left',
                minHeight: '1.5em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {cardData.senderName}
            </div>
          </div>
        )}

        {/* Overlay Content - TO name (under TO underline) */}
        {cardData.recipientName && (
          <div
            className="absolute"
            style={{
              top: positions.to.top,
              right: positions.to.right,
              width: positions.to.width,
              pointerEvents: 'none',
            }}
          >
            <div
              className="text-[#f20e0e] font-medium"
              style={{
                fontSize: '1.1em',
                letterSpacing: '-0.02em',
                textAlign: 'right',
                minHeight: '1.5em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {cardData.recipientName}
            </div>
          </div>
        )}

        {/* Overlay Content - Message in red box (next to quotation marks) */}
        <div
          className="absolute"
          style={{
            top: positions.message.top,
            left: positions.message.left,
            right: positions.message.right,
            width: positions.message.width,
            minHeight: positions.message.minHeight,
            padding: positions.message.padding,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
        >
          {onMessageChange ? (
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-[#f20e0e] placeholder-[#f20e0e]/50"
              placeholder="Enter your message..."
              style={{
                fontSize: '0.95em',
                lineHeight: '1.4',
                letterSpacing: '-0.01em',
                textAlign: 'center',
                color: '#f20e0e',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <div
              className="text-[#f20e0e]"
              style={{
                fontSize: '0.95em',
                lineHeight: '1.4',
                letterSpacing: '-0.01em',
                textAlign: 'center',
                wordBreak: 'break-word',
                color: '#f20e0e',
              }}
            >
              {message || 'Your message here'}
            </div>
          )}
        </div>

        {/* Overlay Content - ISSUED date (top right, next to "ISSUED:") */}
        <div
          className="absolute"
          style={{
            top: positions.issued.top,
            right: positions.issued.right,
            textAlign: 'right',
            pointerEvents: 'none',
          }}
        >
          <div
            className="text-[#f20e0e] font-medium"
            style={{
              fontSize: '0.85em',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {issueDate}
          </div>
        </div>
      </div>
    </div>
  );
}
