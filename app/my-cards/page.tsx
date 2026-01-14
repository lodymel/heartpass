'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface SavedCard {
  id: string;
  coupon_type: string;
  recipient_name: string;
  sender_name: string;
  created_at: string;
  message: string;
}

export default function MyCardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadCards = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load cards:', error);
      } else {
        setCards(data || []);
      }

      setIsLoading(false);
    };

    loadCards();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center" style={{ background: '#FFFEEF' }}>
        <div className="relative z-10 container mx-auto px-0 w-full text-center">
          <p className="regular_paragraph">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#FFFEEF' }}>
      <div className="relative z-10 container mx-auto px-0 w-full pt-48 md:pt-56">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="jenny-title text-5xl md:text-6xl mb-4" style={{
              fontWeight: 300,
              letterSpacing: '-0.025em',
              lineHeight: 1
            }}>
              My Cards
            </h1>
            <p className="regular_paragraph text-sm">
              All your HeartPass cards in one place
            </p>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-20">
              <p className="regular_paragraph mb-6">No cards yet</p>
              <Link href="/create" className="y2k-button inline-block">
                CREATE YOUR FIRST CARD
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <Link
                  key={card.id}
                  href={`/card?id=${card.id}`}
                  className="y2k-window p-6 hover:border-[#f20e0e] transition-all"
                >
                  <div className="mb-4">
                    <div className="jenny-heading text-lg mb-2" style={{ fontWeight: 300, letterSpacing: '-0.025em' }}>
                      {card.recipient_name || 'Loved One'}
                    </div>
                    <div className="jenny-label text-xs mb-1">
                      {format(new Date(card.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  {card.message && (
                    <p className="regular_paragraph text-xs line-clamp-2">
                      {card.message}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
