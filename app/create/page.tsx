'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoodType } from '@/types';
import { coupons } from '@/data/coupons';
import { createClient } from '@/lib/supabase/client';

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [couponType, setCouponType] = useState('');
  const [mood, setMood] = useState<MoodType | ''>('');
  const [usageCondition, setUsageCondition] = useState('Redeem with a smile');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
      }).catch(() => {
        // Ignore auth errors if Supabase is not configured
      });
    } catch (error) {
      // Ignore errors if Supabase is not configured
    }
  }, []);

  const moods = [
    { id: 'cute', label: 'Cute', emoji: '😊' },
    { id: 'fun', label: 'Fun', emoji: '😄' },
    { id: 'heartfelt', label: 'Heartfelt', emoji: '💝' },
    { id: 'event', label: 'Event', emoji: '🎉' },
  ];

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      const cardData = {
        recipientType: 'loved-one',
        couponType,
        mood: mood as MoodType,
        recipientName,
        senderName,
        usageCondition,
      };

      // If user is logged in, save to database
      if (user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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
            })
            .select()
            .single();

          if (error) throw error;
          
          // Redirect to card page with saved card ID
          router.push(`/card?id=${data.id}`);
          return;
        } catch (error) {
          console.error('Failed to save card:', error);
          // Fallback to URL params if save fails
        }
      }

      // Fallback: Use URL params for non-logged-in users
      const params = new URLSearchParams(cardData as any);
      router.push(`/card?${params.toString()}`);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleContinue = () => {
    if (step === 1 && senderName.trim()) {
      handleNext();
    } else if (step === 2 && recipientName.trim()) {
      handleNext();
    } else if (step === 3 && couponType) {
      handleNext();
    } else if (step === 4 && mood) {
      handleNext();
    } else if (step === 5) {
      handleNext();
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#FFFEEF' }}>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 md:px-12 py-12">
        <div className="w-full max-w-2xl">
          {/* Step 1: FROM */}
          {step === 1 && (
            <div className="space-y-12">
              <div>
                <h1 className="jenny-title text-5xl md:text-6xl mb-4" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1
                }}>
                  Who is this HeartPass from?
                </h1>
              </div>

              <div className="y2k-window p-0">
                <div>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && senderName.trim()) {
                        handleContinue();
                      }
                    }}
                    placeholder="Your name"
                    autoFocus
                    className="y2k-input w-full text-xl font-light"
                  />
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={!senderName.trim()}
                className="y2k-button w-full text-base"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: TO */}
          {step === 2 && (
            <div className="space-y-12">
              <div>
                <h1 className="jenny-title text-5xl md:text-6xl mb-4" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1
                }}>
                  Who is this HeartPass for?
                </h1>
              </div>

              <div className="y2k-window p-0">
                <div>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && recipientName.trim()) {
                        handleContinue();
                      }
                    }}
                    placeholder="Their name"
                    autoFocus
                    className="y2k-input w-full text-xl font-light"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} className="y2k-button flex-1 bg-white">
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!recipientName.trim()}
                  className="y2k-button flex-1"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Experience */}
          {step === 3 && (
            <div className="space-y-12">
              <div>
                <h1 className="jenny-title text-5xl md:text-6xl mb-4" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1
                }}>
                  What experience?
                </h1>
                <p className="regular_paragraph text-base mt-4">
                  Choose the promise you're making
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {coupons.map((coupon) => (
                  <button
                    key={coupon.id}
                    onClick={() => {
                      setCouponType(coupon.id);
                      setTimeout(handleContinue, 200);
                    }}
                    className={`y2k-window p-6 text-left transition-all hover:border-[#1a1a1a] ${
                      couponType === coupon.id
                        ? 'border-[#1a1a1a] border-2'
                        : ''
                    }`}
                  >
                    <div className="text-2xl mb-3">{coupon.emoji}</div>
                    <div className="jenny-heading text-sm mb-1" style={{ fontWeight: 300, letterSpacing: '-0.025em' }}>{coupon.title}</div>
                    <div className="jenny-body text-xs" style={{ fontWeight: 300 }}>{coupon.description}</div>
                  </button>
                ))}
              </div>

              <button onClick={handleBack} className="y2k-button w-full bg-white">
                Back
              </button>
            </div>
          )}

          {/* Step 4: Mood */}
          {step === 4 && (
            <div className="space-y-12">
              <div>
                <h1 className="jenny-title text-5xl md:text-6xl mb-4" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1
                }}>
                  What's the vibe?
                </h1>
                <p className="regular_paragraph text-base mt-4">
                  How should this feel?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {moods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMood(m.id as MoodType);
                      setTimeout(handleContinue, 200);
                    }}
                    className={`y2k-window p-8 text-center transition-all hover:border-[#1a1a1a] ${
                      mood === m.id
                        ? 'border-[#1a1a1a] border-2'
                        : ''
                    }`}
                  >
                    <div className="text-4xl mb-3">{m.emoji}</div>
                    <div className="jenny-heading text-sm" style={{ fontWeight: 300, letterSpacing: '-0.025em' }}>{m.label}</div>
                  </button>
                ))}
              </div>

              <button onClick={handleBack} className="y2k-button w-full bg-white">
                Back
              </button>
            </div>
          )}

          {/* Step 5: Final */}
          {step === 5 && (
            <div className="space-y-12">
              <div>
                <h1 className="jenny-title text-5xl md:text-6xl mb-4" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1
                }}>
                  Almost there
                </h1>
                <p className="regular_paragraph text-base mt-4">
                  One last detail
                </p>
              </div>

              <div className="y2k-window p-8">
                <div className="space-y-8">
                  <div>
                    <div className="jenny-label text-[10px] mb-2">Validity</div>
                    <div className="jenny-body text-lg font-normal">LIFETIME</div>
                  </div>
                  
                  <div className="pt-6 border-t border-[#e5e5e5]">
                    <label className="jenny-label block text-[10px] mb-4">
                      Usage Condition
                    </label>
                    <input
                      type="text"
                      value={usageCondition}
                      onChange={(e) => setUsageCondition(e.target.value)}
                      className="y2k-input w-full text-base font-light"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} className="y2k-button flex-1 bg-white">
                  Back
                </button>
                <button onClick={handleContinue} className="y2k-button flex-1 text-base">
                  Create HeartPass
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
