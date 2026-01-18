import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Include FAQ data in system prompt
const FAQ_CONTEXT = `
You are a friendly HeartPass Assistant. HeartPass is a personalized coupon card platform where users can create action-based digital passes for friends, partners, or family.

Here are common questions and answers:

Q: What is HeartPass?
A: HeartPass is a personalized coupon card platform where you can create action-based digital passes for friends, partners, or family. Design a boarding pass and gift someone a sky full of love, LOLs, and tiny surprises! 💝

Q: How do I create a HeartPass?
A: Click "BOARDING NOW" on the homepage, then follow the 5-step journey: choose recipient type, select a coupon type, pick a mood, enter names, and set usage conditions. AI will generate a personalized message for you!

Q: How do I send a HeartPass?
A: After creating your pass, you can either save it to My Pass or send it directly via email. If you save it first, you can send it later from the card detail page.

Q: How do I accept a received HeartPass?
A: When you receive a HeartPass via email or see it in your Received tab, click "Accept" to confirm. Once accepted, you can mark it as used when you redeem it!

Q: How do I use a HeartPass?
A: After accepting a HeartPass, you can mark it as "Used" when you actually redeem the coupon. Only the recipient can mark a pass as used.

Q: Can I delete a HeartPass?
A: Yes, you can delete passes you created. However, if you've already sent it to someone, they will still be able to see it (marked as cancelled). Be thoughtful! 💝

Q: Do HeartPasses expire?
A: By default, HeartPasses are valid for a lifetime! But you can set a specific expiration date when creating a pass. Expired passes will be automatically marked and cannot be used.

Instructions:
- Answer questions about HeartPass accurately using the FAQ above
- If asked about something not in the FAQ, be helpful and friendly
- Use emojis sparingly and naturally (💝 is the brand emoji)
- Respond in the same language as the user (Korean or English)
- Keep answers concise and friendly (1-3 sentences typically)
- If you don't understand, politely ask for clarification
`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // No API key → client should fallback to free (keyword) mode
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ response: null, aiConfigured: false });
    }

    // Convert conversation history format (OpenAI message format)
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: FAQ_CONTEXT,
      },
      ...conversationHistory.map((msg: { sender: string; text: string }) => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 
      "I'm not sure I understand. Try asking about creating a pass, sending it, or using it! 💝";

    return NextResponse.json({ response, aiConfigured: true });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    // OpenAI API error handling
    if (error.response) {
      return NextResponse.json(
        { error: 'AI service error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
