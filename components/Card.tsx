'use client';

import { useEffect, useState } from 'react';
import { CardData } from '@/types';
import CSSTicket from './CSSTicket';

interface CardProps {
  cardData: CardData;
  message: string;
  onMessageChange?: (message: string) => void;
}

export default function Card({ cardData, message, onMessageChange }: CardProps) {
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    // Generate unique card ID and QR code value
    const cardId = `heartpass-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const qrData = JSON.stringify({
      id: cardId,
      coupon: cardData.couponType,
      recipient: cardData.recipientName || 'Friend',
      sender: cardData.senderName || 'Someone',
      date: cardData.issueDate,
    });
    setQrValue(qrData);
  }, [cardData]);

  // Always use CSS ticket
  return <CSSTicket cardData={cardData} message={message} onMessageChange={onMessageChange} />;
}
