'use client';

import { format, parseISO } from 'date-fns';
import { CardData } from '@/types';
import { coupons } from '@/data/coupons';
import { useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface CSSTicketProps {
  cardData: CardData;
  message: string;
  onMessageChange?: (message: string) => void;
}

const MAX_MESSAGE_LENGTH = 200;

export default function CSSTicket({ cardData, message, onMessageChange }: CSSTicketProps) {
  const isMobile = useIsMobile();
  
  const coupon = useMemo(() => 
    coupons.find((c) => c.id === cardData.couponType),
    [cardData.couponType]
  );
  
  const issueDate = useMemo(() => {
    if (cardData.issueDate) {
      // Parse date string in local timezone (avoid UTC conversion)
      const [year, month, day] = cardData.issueDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, 'MMM dd, yyyy');
    }
    // Use local date
    const now = new Date();
    return format(now, 'MMM dd, yyyy');
  }, [cardData.issueDate]);
  
  // Format validity display
  const getValidityDisplay = useMemo(() => {
    if (cardData.validityType === 'lifetime') {
      return 'LIFETIME';
    } else if (cardData.validityType === 'date' && cardData.validityDate) {
      try {
        return format(parseISO(cardData.validityDate), 'MMM dd, yyyy').toUpperCase();
      } catch {
        return 'LIFETIME';
      }
    }
    return 'LIFETIME';
  }, [cardData.validityType, cardData.validityDate]);
  
  const [charCount, setCharCount] = useState(message.length);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value.slice(0, MAX_MESSAGE_LENGTH);
    setCharCount(newMessage.length);
    if (onMessageChange) {
      onMessageChange(newMessage);
    }
  };

  return (
    <div
      id="heartpass-card"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        background: '#FFFEEF',
        border: '1px solid #e5e5e5',
        borderRadius: '0',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Stripe - Boarding Pass Style */}
      <div
        style={{
          height: '8px',
          background: '#f20e0e',
          width: '100%',
        }}
      />

      {/* Main Content */}
      <div style={{ padding: isMobile ? '24px 20px' : '48px 56px' }}>

        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: isMobile ? '32px' : '64px',
            borderBottom: '2px solid #f20e0e',
            paddingBottom: isMobile ? '16px' : '24px',
            boxSizing: 'border-box',
          }}
        >
          {/* FROM / TO Section */}
          <div style={{ flex: 1, maxWidth: '60%', boxSizing: 'border-box' }}>
            <div 
              style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: isMobile ? '12px' : '16px',
                width: '100%',
              }}
            >
              {/* FROM */}
              <div style={{ justifySelf: 'start' }}>
                <div
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: '#f20e0e',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    fontSize: isMobile ? '9px' : '10px',
                    lineHeight: isMobile ? '12px' : '14px',
                    margin: 0,
                    marginBottom: '8px',
                    padding: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  FROM
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: '#777777',
                    letterSpacing: '-0.02em',
                    fontWeight: 400,
                    fontSize: isMobile ? '16px' : '18.4px',
                    lineHeight: isMobile ? '24px' : '27.6px',
                    margin: 0,
                    padding: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  {cardData.senderName || 'Your Name'}
                </div>
                {cardData.senderEmail && (
                  <div
                    style={{
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: '#999999',
                      letterSpacing: '-0.01em',
                      fontWeight: 400,
                      fontSize: isMobile ? '11px' : '12px',
                      lineHeight: isMobile ? '16px' : '18px',
                      margin: '4px 0 0 0',
                      padding: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    {cardData.senderEmail}
                  </div>
                )}
              </div>

              {/* Arrow - Aligned with name baseline (not email) */}
              <div
                style={{
                  fontSize: isMobile ? '20px' : '24px',
                  color: '#f20e0e',
                  opacity: 0.8,
                  fontWeight: 600,
                  justifySelf: 'center',
                  alignSelf: 'flex-start',
                  lineHeight: isMobile ? '24px' : '27.6px',
                  margin: 0,
                  paddingTop: isMobile ? '20px' : '22px', // Align with name
                  boxSizing: 'border-box',
                }}
              >
                →
              </div>

              {/* TO */}
              <div style={{ justifySelf: 'end', textAlign: 'left' }}>
                <div
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: '#f20e0e',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    fontSize: isMobile ? '9px' : '10px',
                    lineHeight: isMobile ? '12px' : '14px',
                    margin: 0,
                    marginBottom: '8px',
                    padding: 0,
                    boxSizing: 'border-box',
                    textAlign: 'left',
                  }}
                >
                  TO
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: '#777777',
                    letterSpacing: '-0.02em',
                    fontWeight: 400,
                    fontSize: isMobile ? '16px' : '18.4px',
                    lineHeight: isMobile ? '24px' : '27.6px',
                    textAlign: 'left',
                    margin: 0,
                    padding: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  {cardData.recipientName || 'Loved One'}
                </div>
                {/* Recipient email or placeholder for visual balance */}
                <div
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: '#999999',
                    letterSpacing: '-0.01em',
                    fontWeight: 400,
                    fontSize: isMobile ? '11px' : '12px',
                    lineHeight: isMobile ? '16px' : '18px',
                    textAlign: 'left',
                    margin: '4px 0 0 0',
                    padding: 0,
                    boxSizing: 'border-box',
                    minHeight: isMobile ? '16px' : '18px', // Ensure consistent height for visual balance
                  }}
                >
                  {cardData.recipientEmail || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* ISSUED Date - Aligned with FROM/TO */}
          <div
            style={{
              textAlign: 'right',
              marginLeft: isMobile ? '24px' : '48px',
            }}
          >
            <div
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: '#f20e0e',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: isMobile ? '8px' : '10px',
                lineHeight: isMobile ? '11px' : '14px',
                margin: 0,
                marginBottom: '8px',
                padding: 0,
                textAlign: 'right',
                boxSizing: 'border-box',
              }}
            >
              ISSUED
            </div>
            <div
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: '#f20e0e',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: isMobile ? '12px' : '16px',
                lineHeight: isMobile ? '18px' : '24px',
                margin: 0,
                padding: 0,
                textAlign: 'right',
                boxSizing: 'border-box',
              }}
            >
              {issueDate}
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div style={{ 
          marginTop: isMobile ? '8px' : '16px', 
          marginBottom: isMobile ? '24px' : '40px', 
          boxSizing: 'border-box',
          display: 'block',
          width: '100%',
        }}>
          <div
            style={{
              fontFamily: '"Roslindale Condensed", serif',
              fontWeight: 300,
              letterSpacing: '-0.025em',
              lineHeight: isMobile ? '42px' : '66px',
              color: '#f20e0e',
              fontSize: isMobile ? '38px' : '62px',
              margin: '0 0 16px 0',
              padding: 0,
              boxSizing: 'border-box',
              display: 'block',
              width: '100%',
            }}
          >
            {coupon?.title || 'Experience'}
          </div>
          <div
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: '#f20e0e',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
              fontSize: isMobile ? '13px' : '16px',
              lineHeight: isMobile ? '19.5px' : '24px',
              margin: 0,
              padding: 0,
              boxSizing: 'border-box',
              display: 'block',
              width: '100%',
            }}
          >
            {coupon?.description || 'A special experience for someone special'}
          </div>
        </div>

        {/* Message Box - Red Box */}
        <div
          style={{
            backgroundColor: '#f20e0e',
            padding: isMobile ? '24px 20px' : '32px 40px',
            marginBottom: isMobile ? '24px' : '32px',
            minHeight: isMobile ? '120px' : '160px',
            position: 'relative',
            boxSizing: 'border-box',
            display: 'block',
            textAlign: 'center',
          }}
        >
          {/* Quotation Mark */}
          <div
            style={{
              position: 'absolute',
              left: isMobile ? '12px' : '16px',
              top: isMobile ? '12px' : '16px',
              fontSize: isMobile ? '36px' : '48px',
              color: '#FFFEEF',
              opacity: 0.2,
              fontFamily: 'serif',
              lineHeight: isMobile ? '36px' : '48px',
              margin: 0,
              padding: 0,
              width: isMobile ? '36px' : '48px',
              height: isMobile ? '36px' : '48px',
            }}
          >
            "
          </div>

          {onMessageChange ? (
            <div style={{ 
              position: 'relative', 
              zIndex: 1,
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}>
              <textarea
                value={message}
                onChange={handleMessageChange}
                placeholder="Enter your message..."
                maxLength={MAX_MESSAGE_LENGTH}
                className="heartpass-message-textarea"
                style={{
                  fontSize: isMobile ? '14px' : '16px',
                  lineHeight: isMobile ? '22.4px' : '25.6px',
                  letterSpacing: '0',
                  wordSpacing: '0',
                  textAlign: 'center',
                  color: '#FFFEEF',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  minHeight: isMobile ? '80px' : '120px',
                  width: '100%',
                  maxWidth: '100%',
                  margin: '0 auto',
                  padding: 0,
                  background: 'transparent',
                  border: 'none',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  display: 'block',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  MozUserSelect: 'text',
                  msUserSelect: 'text',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                fontSize: isMobile ? '14px' : '16px',
                lineHeight: isMobile ? '22.4px' : '25.6px',
                letterSpacing: '0',
                wordSpacing: '0',
                textAlign: 'center',
                wordBreak: 'break-word',
                color: '#FFFEEF',
                position: 'relative',
                zIndex: 1,
                margin: '0',
                padding: '0',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                boxSizing: 'border-box',
                display: 'block',
                width: '100%',
                maxWidth: '100%',
                left: '0',
                right: '0',
                textIndent: '0',
              }}
            >
              {message || 'Your message here'}
            </div>
          )}
        </div>

        {/* Footer Info - Boarding Pass Style */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingTop: isMobile ? '20px' : '32px',
            borderTop: '1px solid #e5e5e5',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: '#f20e0e',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: isMobile ? '8px' : '10px',
                lineHeight: isMobile ? '11px' : '14px',
                margin: 0,
                marginBottom: '8px',
                padding: 0,
                boxSizing: 'border-box',
              }}
            >
              VALID UNTIL
            </div>
            <div
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: '#f20e0e',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: isMobile ? '12px' : '16px',
                lineHeight: isMobile ? '18px' : '24px',
                margin: 0,
                padding: 0,
                boxSizing: 'border-box',
              }}
            >
              {getValidityDisplay}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: '#f20e0e',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: isMobile ? '8px' : '10px',
                lineHeight: isMobile ? '11px' : '14px',
                margin: 0,
                marginBottom: '8px',
                padding: 0,
                textAlign: 'right',
                boxSizing: 'border-box',
              }}
            >
              USAGE
            </div>
            <div
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: '#f20e0e',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: isMobile ? '12px' : '16px',
                lineHeight: isMobile ? '18px' : '24px',
                margin: 0,
                padding: 0,
                textAlign: 'right',
                boxSizing: 'border-box',
              }}
            >
              {cardData.usageCondition || 'ONE USE'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Perforation - Boarding Pass Style */}
      <div
        style={{
          height: '1px',
          borderTop: '2px dashed #e5e5e5',
          margin: isMobile ? '0 20px' : '0 56px',
        }}
      />
    </div>
  );
}
