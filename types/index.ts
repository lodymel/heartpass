export type RecipientType = 'friend' | 'partner' | 'family';
export type MoodType = 'cute' | 'fun' | 'heartfelt' | 'event';

export interface Coupon {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export interface CardData {
  recipientType: RecipientType;
  couponType: string;
  mood: MoodType;
  recipientName: string;
  senderName: string;
  message: string;
  usageCondition: string;
  issueDate: string;
  cardId: string;
}
