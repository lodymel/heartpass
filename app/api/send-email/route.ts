import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Check API key first
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set in environment variables');
      return NextResponse.json(
        { 
          success: false,
          error: 'Email service not configured. Please set RESEND_API_KEY in .env.local' 
        },
        { status: 500 }
      );
    }

    const { to, recipientName, senderName, cardId, couponType, message } = await request.json();

    if (!to || !to.includes('@')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Valid email address is required' 
        },
        { status: 400 }
      );
    }

    // Card page URL
    const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/card?id=${cardId}`;

    // Email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You received a HeartPass!</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fff5f5 0%, #ffeef0 100%); border-radius: 12px; padding: 40px; text-align: center;">
            <h1 style="color: #f20e0e; font-size: 32px; font-weight: 300; margin: 0 0 20px 0; letter-spacing: -0.025em;">
              💝 You received a HeartPass!
            </h1>
            <p style="font-size: 18px; color: #666; margin: 0 0 30px 0;">
              <strong>${senderName}</strong> sent you a special pass!
            </p>
            <div style="background: white; border-radius: 8px; padding: 30px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333; margin: 0 0 20px 0; line-height: 1.8;">
                ${message || 'A special moment is waiting for you!'}
              </p>
            </div>
            <a href="${cardUrl}" style="display: inline-block; background: #f20e0e; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 500; margin: 20px 0; transition: background 0.2s;">
              View Your Pass →
            </a>
            <p style="font-size: 14px; color: #999; margin: 30px 0 0 0;">
              Sign up with this email to accept and use your pass!
            </p>
          </div>
          <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
            Sent with ❤️ from HeartPass
          </p>
        </body>
      </html>
    `;

    // Email text content (fallback)
    const emailText = `
You received a HeartPass!

${senderName} sent you a special pass!

${message || 'A special moment is waiting for you!'}

View your pass: ${cardUrl}

Sign up with this email to accept and use your pass!

Sent with ❤️ from HeartPass
    `;
    
    // For free tier: Check if recipient is the account owner's email
    // If not, we'll still try but show a helpful message
    const accountOwnerEmail = process.env.RESEND_ACCOUNT_EMAIL || '';
    const isTestEmail = to === accountOwnerEmail;
    
    // Try to send email
    // Domain verified: heartpass.net
    const { data, error } = await resend.emails.send({
      from: 'HeartPass <noreply@heartpass.net>',
      to: [to],
      subject: `💝 ${senderName} sent you a HeartPass!`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Failed to send email',
          details: error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    });
  } catch (error: any) {
    console.error('❌ Email send error (catch):', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to send email',
        type: error.name || 'UnknownError'
      },
      { status: 500 }
    );
  }
}
