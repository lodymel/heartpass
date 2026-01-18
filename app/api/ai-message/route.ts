import { NextRequest, NextResponse } from 'next/server';
import { getRandomMessage } from '@/data/message-templates';
import { MoodType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { couponType, mood, recipientName, senderName } = await request.json();

    if (!couponType) {
      return NextResponse.json(
        { error: 'Coupon type is required' },
        { status: 400 }
      );
    }

    // Get a random message template based on coupon type and mood
    const message = getRandomMessage(
      couponType,
      (mood as MoodType) || 'heartfelt',
      recipientName,
      senderName
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Message generation error:', error);
    // Fallback message if generation fails
    return NextResponse.json({
      message: 'Let\'s create special moments together! 💝',
    });
  }
}
