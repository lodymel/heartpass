import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { couponType, mood, recipientName, senderName } = await request.json();

    const couponTitles: Record<string, string> = {
      'cook': 'Cook for you',
      'foot-massage': '15-minute foot massage',
      'movie-night': 'Movie night together',
      'letter': 'Write a 1000+ word letter',
      'compliments': '100 compliments',
      'chicken': 'Chicken delivery coupon',
      'call': 'One-hour call pass',
      'forgive': 'Forgive-one-mistake coupon',
      'wish': 'Wish granted coupon',
    };

    const moodStyles: Record<string, string> = {
      'cute': 'in a cute and adorable way',
      'fun': 'in a fun and cheerful way',
      'heartfelt': 'in a heartfelt and warm way',
      'event': 'in a celebratory and joyful way',
    };

    const couponTitle = couponTitles[couponType] || couponType;
    const moodStyle = moodStyles[mood] || 'in a warm way';

    const prompt = `Write a short, fun, and action-oriented message ${moodStyle} for the following coupon card.
Coupon: ${couponTitle}
Recipient: ${recipientName || 'your loved one'}
Sender: ${senderName || 'me'}

Write 1-2 sentences in English, include emojis, and make it personal and warm.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a creative message writer who creates fun, warm, and action-oriented messages for coupon cards for loved ones.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    const message = completion.choices[0]?.message?.content || 'Let\'s create special moments together! 💝';

    return NextResponse.json({ message });
  } catch (error) {
    console.error('AI API Error:', error);
    // Fallback message if AI fails
    return NextResponse.json({
      message: 'Let\'s create special moments together! 💝',
    });
  }
}
