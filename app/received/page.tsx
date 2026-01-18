'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface ReceivedCard {
  id: string;
  coupon_type: string;
  recipient_name: string;
  sender_name: string;
  created_at: string;
  message: string;
  status?: 'pending' | 'accepted' | 'used' | 'expired';
  used_at?: string;
}

export default function ReceivedPage() {
  const router = useRouter();
  const [cards, setCards] = useState<ReceivedCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<ReceivedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'used'>('all');

  useEffect(() => {
    const loadCards = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // Load received cards
      // RLS allows cards where recipient_user_id matches
      // For recipient_email matches, we filter in application after fetching
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .or(`recipient_user_id.eq.${user.id},recipient_email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load received cards:', error);
        setCards([]);
      } else {
        // Additional client-side filter for email matching (safe fallback)
        // RLS will allow if recipient_user_id matches, but we also check email
        let filtered = (data || []).filter(
          (card: any) => card.recipient_user_id === user.id || card.recipient_email === user.email
        );
        
        // Check and update expired cards
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const processedCards = filtered.map(async (card: any) => {
          if (card.validity_type === 'date' && card.validity_date && 
              card.status !== 'used' && card.status !== 'cancelled' && card.status !== 'expired') {
            const validityDate = new Date(card.validity_date);
            validityDate.setHours(0, 0, 0, 0);
            
            if (validityDate < today) {
              // Auto-update expired status
              const supabase = createClient();
              await supabase
                .from('cards')
                .update({ status: 'expired' })
                .eq('id', card.id);
              return { ...card, status: 'expired' };
            }
          }
          return card;
        });
        
        filtered = await Promise.all(processedCards);
        setCards(filtered);
      }

      setIsLoading(false);
    };

    loadCards();
  }, [router]);

  // Refresh cards when page becomes visible (user returns from using a card)
  useEffect(() => {
    const reloadCards = async () => {
      if (!user) return;
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .or(`recipient_user_id.eq.${currentUser.id},recipient_email.eq.${currentUser.email}`)
          .order('created_at', { ascending: false });
        if (!error && data) {
          const filtered = data.filter(
            (card: any) => card.recipient_user_id === currentUser.id || card.recipient_email === currentUser.email
          );
          setCards(filtered);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        reloadCards();
      }
    };

    const handleFocus = () => {
      if (user) {
        reloadCards();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  useEffect(() => {
    let filtered = cards;

    if (activeFilter === 'pending') {
      filtered = cards.filter(card => card.status === 'pending' || !card.status);
    } else if (activeFilter === 'accepted') {
      filtered = cards.filter(card => card.status === 'accepted');
    } else if (activeFilter === 'used') {
      filtered = cards.filter(card => card.status === 'used');
    }

    setFilteredCards(filtered);
  }, [activeFilter, cards]);

  const handleAccept = async (cardId: string) => {
    if (!user) return;

    const supabase = createClient();
    // Update status to accepted AND set recipient_user_id if not already set
    const { error } = await supabase
      .from('cards')
      .update({ 
        status: 'accepted',
        recipient_user_id: user.id, // Link to user account if not already linked
      })
      .eq('id', cardId);

    if (!error) {
      setCards(cards.map(card => card.id === cardId ? { ...card, status: 'accepted' } : card));
    } else {
      console.error('Failed to accept card:', error);
    }
  };

  const handleDecline = async (cardId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('cards')
      .update({ status: 'cancelled' })
      .eq('id', cardId);

    if (!error) {
      setCards(cards.filter(card => card.id !== cardId));
    }
  };

  const handleUseNow = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    
    // Check if card is expired
    if (card?.status === 'expired') {
      alert('This pass has expired and cannot be used.');
      return;
    }
    
    const supabase = createClient();
    const { error } = await supabase
      .from('cards')
      .update({ status: 'used', used_at: new Date().toISOString() })
      .eq('id', cardId);

    if (!error) {
      // Update local state immediately
      setCards(cards.map(card => card.id === cardId ? { ...card, status: 'used' } : card));
      
      // Show confirmation
      alert('This pass has been marked as used. The sender will also see this status.');
    } else {
      console.error('Failed to mark card as used:', error);
      alert('Failed to mark this pass as used. Please try again.');
    }
  };

  const handleViewDetails = (cardId: string) => {
    router.push(`/card?id=${cardId}`);
  };

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
      {/* Top Navigation */}
      <Navigation />

      <div className="relative z-10 container mx-auto px-0 w-full pt-48 md:pt-56">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <h1 className="jenny-title text-5xl md:text-6xl mb-4" style={{
              fontWeight: 300,
              letterSpacing: '-0.025em',
              lineHeight: 1
            }}>
              Received
            </h1>
            <p className="regular_paragraph text-sm">
              Passes others have sent you
            </p>
          </div>

          {/* Status Filters */}
          {cards.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] md:hover:bg-[#f5f5f5]'
                }`}
              >
                All ({cards.length})
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'pending'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] md:hover:bg-[#f5f5f5]'
                }`}
              >
                Pending ({cards.filter(c => c.status === 'pending' || !c.status).length})
              </button>
              <button
                onClick={() => setActiveFilter('accepted')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'accepted'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] md:hover:bg-[#f5f5f5]'
                }`}
              >
                Accepted ({cards.filter(c => c.status === 'accepted').length})
              </button>
              <button
                onClick={() => setActiveFilter('used')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'used'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] md:hover:bg-[#f5f5f5]'
                }`}
              >
                Used ({cards.filter(c => c.status === 'used').length})
              </button>
            </div>
          )}

          {/* Cards Grid */}
          {filteredCards.length === 0 ? (
            <div className="text-center py-20">
              <p className="regular_paragraph mb-6">
                {cards.length === 0 ? 'No received passes yet' : `No ${activeFilter} passes`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="y2k-window p-6 md:hover:border-[#f20e0e] transition-all"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="jenny-heading text-lg" style={{ fontWeight: 300, letterSpacing: '-0.025em' }}>
                        From {card.sender_name || 'Someone'}
                      </div>
                      {card.status && (
                        <span className="regular_paragraph text-xs" style={{ 
                          color: card.status === 'used' ? '#999999' : 
                          card.status === 'accepted' ? '#f20e0e' : 
                          '#666666',
                          textTransform: 'uppercase',
                          fontSize: '10px',
                          fontWeight: 500,
                        }}>
                          {card.status}
                        </span>
                      )}
                    </div>
                    <div className="jenny-label text-xs mb-1">
                      {format(new Date(card.created_at), 'MMM dd, yyyy')}
                    </div>
                    {card.message && (
                      <p className="regular_paragraph text-xs line-clamp-2 mt-2">
                        {card.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {card.status === 'pending' || !card.status ? (
                      <>
                        <button
                          onClick={() => handleDecline(card.id)}
                          className="flex-1 px-3 py-2 text-xs border border-[#e5e5e5] md:hover:bg-[#f5f5f5] active:bg-[#f5f5f5] transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAccept(card.id)}
                          className="flex-1 px-3 py-2 text-xs y2k-button"
                          style={{ padding: '8px 12px', fontSize: '12px' }}
                        >
                          Accept
                        </button>
                      </>
                    ) : card.status === 'accepted' ? (
                      <>
                        <button
                          onClick={() => handleViewDetails(card.id)}
                          className="flex-1 px-3 py-2 text-xs border border-[#e5e5e5] md:hover:bg-[#f5f5f5] active:bg-[#f5f5f5] transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleUseNow(card.id)}
                          className="flex-1 px-3 py-2 text-xs y2k-button"
                          style={{ padding: '8px 12px', fontSize: '12px' }}
                        >
                          Use Now
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleViewDetails(card.id)}
                        className="w-full px-3 py-2 text-xs border border-[#e5e5e5] hover:bg-[#f5f5f5] transition-colors"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
