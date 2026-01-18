import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@heartpass.net';

/** Simple email format validation */
function isValidEmail(s: string): boolean {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Email service is currently unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Please enter your email address.' },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Please enter your message.' },
        { status: 400 }
      );
    }

    const subject = `[HeartPass Inquiry] ${email}`;
    const text = `A new 1:1 inquiry has been submitted from the HeartPass website.

From: ${email}

Message:
---
${message}
---

Reply to the email above to respond to the inquirer. Please reply within 1–2 business days. 💝`;

    const { error } = await resend.emails.send({
      from: 'HeartPass <noreply@heartpass.net>',
      to: [SUPPORT_EMAIL],
      replyTo: email,
      subject,
      text,
    });

    if (error) {
      console.error('Contact API Resend error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to send your inquiry. Please try again in a moment.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('Contact API error:', e);
    return NextResponse.json(
      { success: false, error: 'Failed to send your inquiry. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
