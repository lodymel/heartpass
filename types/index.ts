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
  recipientEmail?: string; // Recipient's email (if provided)
  senderName: string;
  senderEmail?: string; // Sender's email for recipient identification
  message: string;
  usageCondition: string;
  validityType: 'lifetime' | 'date';
  validityDate?: string; // ISO date string, only when validityType is 'date'
  issueDate: string;
  cardId: string;
  status?: 'active' | 'pending' | 'accepted' | 'used' | 'expired' | 'cancelled';
}

// Supabase User type (minimal, can be extended)
export interface User {
  id: string;
  email?: string;
  [key: string]: unknown; // Allow other Supabase user properties
}

// Card from database type
export interface CardFromDB {
  id: string;
  user_id: string;
  recipient_user_id?: string | null;
  recipient_email?: string | null;
  recipient_type: string;
  coupon_type: string;
  mood: string;
  recipient_name: string;
  sender_name: string;
  message?: string | null;
  usage_condition: string;
  validity_type: 'lifetime' | 'date';
  validity_date?: string | null;
  issue_date?: string | null;
  status?: 'active' | 'pending' | 'accepted' | 'used' | 'expired' | 'cancelled' | null;
  created_at?: string;
  used_at?: string | null;
  [key: string]: unknown; // Allow other DB fields
}
