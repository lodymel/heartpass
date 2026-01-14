'use client';

import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { CardData } from '@/types';
import { coupons } from '@/data/coupons';

interface CardProps {
  cardData: CardData;
  message: string;
  onMessageChange: (message: string) => void;
}

export default function Card({ cardData, message, onMessageChange }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
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

  const coupon = coupons.find((c) => c.id === cardData.couponType);

  return (
    <div
      id="heartpass-card"
      ref={cardRef}
      className="bg-gradient-to-br from-pink-100 via-pink-50 to-rose-50 rounded-3xl shadow-2xl p-8 max-w-md mx-auto"
      style={{
        minHeight: '600px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative hearts */}
      <div className="absolute top-4 right-4 text-pink-300 text-2xl animate-float">💖</div>
      <div className="absolute bottom-4 left-4 text-pink-300 text-xl animate-float" style={{ animationDelay: '1s' }}>
        ❤️
      </div>

      {/* Card Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Recipient Name */}
        {cardData.recipientName && (
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-pink-700">To: {cardData.recipientName}</h2>
          </div>
        )}

        {/* Coupon Emoji and Title */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">{coupon?.emoji || '💝'}</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{coupon?.title || 'Special Coupon'}</h1>
          <p className="text-gray-600">{coupon?.description}</p>
        </div>

        {/* Message */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full">
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              className="w-full text-center text-lg text-gray-800 bg-transparent border-none resize-none focus:outline-none min-h-[100px]"
              placeholder="Enter your message..."
            />
          </div>
        </div>

        {/* Coupon Rules */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Validity:</span>
              <span className="text-pink-600 font-bold">Lifetime</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Usage Condition:</span>
              <span>{cardData.usageCondition}</span>
            </div>
          </div>
        </div>

        {/* QR Code and Footer */}
        <div className="flex items-center justify-between">
          <div className="bg-white p-3 rounded-xl shadow-md">
            <QRCodeSVG value={qrValue} size={80} level="H" />
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>Issued: {format(new Date(cardData.issueDate), 'MMM dd, yyyy')}</div>
            {cardData.senderName && <div className="mt-1">From: {cardData.senderName}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
