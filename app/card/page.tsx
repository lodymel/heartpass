'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import Card from '@/components/Card';
import { CardData } from '@/types';
import { createClient } from '@/lib/supabase/client';

function CardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check user authentication
    const checkUser = async () => {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
        } catch (error) {
          // Ignore errors
        }
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const loadCard = async () => {
      const cardId = searchParams.get('id');
      
      // If card ID exists, try to load from database
      if (cardId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('id', cardId)
            .single();

          if (!error && data) {
            const cardData: Partial<CardData> = {
              recipientType: data.recipient_type as any,
              couponType: data.coupon_type,
              mood: data.mood as any,
              recipientName: data.recipient_name || '',
              senderName: data.sender_name || '',
              usageCondition: data.usage_condition || 'Redeem with a smile',
              issueDate: data.issue_date || format(new Date(), 'yyyy-MM-dd'),
              cardId: data.id,
              message: data.message || '',
            };

            setCardData(cardData as CardData);
            if (data.message) {
              setMessage(data.message);
            } else {
              generateAIMessage(cardData);
            }
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Failed to load card:', error);
        }
      }

      // Fallback: Parse URL parameters
      const data: Partial<CardData> = {
        recipientType: (searchParams.get('recipientType') as any) || 'loved-one',
        couponType: searchParams.get('couponType') || '',
        mood: (searchParams.get('mood') as any) || 'cute',
        recipientName: searchParams.get('recipientName') || '',
        senderName: searchParams.get('senderName') || '',
        usageCondition: searchParams.get('usageCondition') || 'Redeem with a smile',
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        cardId: `heartpass-${Date.now()}`,
      };

      setCardData(data as CardData);
      generateAIMessage(data);
      setIsLoading(false);
    };

    loadCard();
  }, [searchParams]);

  const generateAIMessage = async (data: Partial<CardData>) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponType: data.couponType,
          mood: data.mood,
          recipientName: data.recipientName,
          senderName: data.senderName,
        }),
      });

      const result = await response.json();
      setMessage(result.message || '특별한 순간을 함께 만들어요! 💝');
    } catch (error) {
      console.error('Failed to generate AI message:', error);
      setMessage('특별한 순간을 함께 만들어요! 💝');
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const cardElement = document.getElementById('heartpass-card');
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `heartpass-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download card:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleShare = async () => {
    const cardElement = document.getElementById('heartpass-card');
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], 'heartpass-card.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'HeartPass 카드',
              text: '특별한 쿠폰 카드를 받았어요! 💝',
            });
          } catch (error) {
            console.error('Share failed:', error);
          }
        } else {
          // Fallback: copy link or show download
          const url = URL.createObjectURL(blob);
          navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
      });
    } catch (error) {
      console.error('Failed to share card:', error);
    }
  };

  const handleMessageChange = async (newMessage: string) => {
    setMessage(newMessage);
    
    // Save message to database if card has ID
    if (cardData?.cardId && cardData.cardId.startsWith('heartpass-') === false) {
      try {
        const supabase = createClient();
        await supabase
          .from('cards')
          .update({ message: newMessage })
          .eq('id', cardData.cardId);
      } catch (error) {
        console.error('Failed to save message:', error);
      }
    }
  };

  const handleSaveCard = async () => {
    if (!user || !cardData) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('cards')
        .insert({
          user_id: user.id,
          recipient_type: cardData.recipientType,
          coupon_type: cardData.couponType,
          mood: cardData.mood,
          recipient_name: cardData.recipientName,
          sender_name: cardData.senderName,
          usage_condition: cardData.usageCondition,
          message: message,
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to saved card
      router.push(`/card?id=${data.id}`);
    } catch (error) {
      console.error('Failed to save card:', error);
      alert('Failed to save card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">💝</div>
          <div className="text-xl text-gray-700">Creating your card...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Card Preview */}
          <div className="mb-8">
            <Card cardData={cardData} message={message} onMessageChange={handleMessageChange} />
          </div>

          {/* Loading indicator for AI generation */}
          {isGenerating && (
            <div className="text-center mb-4 text-gray-600">
              AI is generating your message... ✨
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                📥 Download
              </button>
              <button
                onClick={handleShare}
                className="flex-1 bg-white border-2 border-pink-500 text-pink-500 hover:bg-pink-50 font-semibold py-4 px-6 rounded-full transition-all transform hover:scale-105"
              >
                📤 Share
              </button>
            </div>

            {/* Save to My Cards Section */}
            {!user && cardData && !cardData.cardId?.startsWith('heartpass-') && (
              <div className="mt-6 p-4 bg-[#FFFEEF] border border-[#e5e5e5] rounded-lg">
                <p className="regular_paragraph text-sm mb-3 text-center">
                  Want to save this card to your collection?
                </p>
                <Link
                  href={`/auth/login?redirect=/card?${new URLSearchParams({
                    recipientType: cardData.recipientType,
                    couponType: cardData.couponType,
                    mood: cardData.mood,
                    recipientName: cardData.recipientName,
                    senderName: cardData.senderName,
                    usageCondition: cardData.usageCondition,
                  }).toString()}`}
                  className="y2k-button w-full text-center block"
                >
                  SIGN IN TO SAVE
                </Link>
              </div>
            )}

            {user && cardData && !cardData.cardId?.startsWith('heartpass-') && (
              <div className="mt-6">
                <button
                  onClick={handleSaveCard}
                  disabled={isSaving}
                  className="y2k-button w-full"
                >
                  {isSaving ? 'Saving...' : 'SAVE TO MY CARDS'}
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              <a
                href="/create"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                ← Create New Card
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-float">💝</div>
            <div className="text-xl text-gray-700">로딩 중...</div>
          </div>
        </div>
      }
    >
      <CardPageContent />
    </Suspense>
  );
}
