'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import ConfirmModal from '@/components/ConfirmModal';
import AlertModal from '@/components/AlertModal';
import Footer from '@/components/Footer';
import { coupons } from '@/data/coupons';
import { User } from '@/types';

interface SavedCard {
  id: string;
  coupon_type: string;
  recipient_name: string;
  sender_name: string;
  created_at: string;
  message: string;
  status?: string;
  used_at?: string;
  recipient_email?: string;
  recipient_user_id?: string;
  validity_type?: 'lifetime' | 'date';
  validity_date?: string | null;
}

export default function MyCardsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [receivedCards, setReceivedCards] = useState<SavedCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [activeFilter, setActiveFilter] = useState<'all' | 'not-sent' | 'pending' | 'accepted' | 'used' | 'expired'>('all');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; cardId: string | null; recipientName: string }>({
    isOpen: false,
    cardId: null,
    recipientName: '',
  });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [sentTabRef, setSentTabRef] = useState<HTMLButtonElement | null>(null);
  const [receivedTabRef, setReceivedTabRef] = useState<HTMLButtonElement | null>(null);
  const [pendingCardModal, setPendingCardModal] = useState<{ isOpen: boolean; cardData: any | null }>({
    isOpen: false,
    cardData: null,
  });
  const [isSavingPendingCard, setIsSavingPendingCard] = useState(false);

  // Check for pending card data from sessionStorage (created before login)
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;
    
    const pendingData = sessionStorage.getItem('pendingHeartPass');
    if (pendingData) {
      try {
        const cardData = JSON.parse(pendingData);
        setPendingCardModal({ isOpen: true, cardData });
      } catch (e) {
        // Invalid data, remove it
        sessionStorage.removeItem('pendingHeartPass');
      }
    }
  }, [user]);

  // Save pending card to database
  const savePendingCard = async () => {
    if (!pendingCardModal.cardData || !user) return;
    
    setIsSavingPendingCard(true);
    try {
      const supabase = createClient();
      const cardData = pendingCardModal.cardData;
      
      const insertData: any = {
        user_id: user.id,
        sender_email: user.email,
        recipient_type: cardData.recipientType || 'loved-one',
        coupon_type: cardData.couponType,
        mood: cardData.mood,
        recipient_name: cardData.recipientName,
        sender_name: cardData.senderName,
        usage_condition: cardData.usageCondition,
        message: cardData.message || 'Let\'s create special moments together! 💝',
        validity_type: cardData.validityType || 'lifetime',
        validity_date: cardData.validityDate || null,
        issue_date: new Date().toISOString().split('T')[0],
        status: cardData.recipientEmail ? 'pending' : 'active',
      };
      
      if (cardData.recipientEmail) {
        insertData.recipient_email = cardData.recipientEmail;
      }
      
      const { data, error } = await supabase
        .from('cards')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Clear sessionStorage
      sessionStorage.removeItem('pendingHeartPass');
      
      // Close modal and reload cards
      setPendingCardModal({ isOpen: false, cardData: null });
      await loadCards();
      
      setAlertModal({
        isOpen: true,
        title: 'Pass saved! 💝',
        message: cardData.recipientEmail 
          ? `Your HeartPass has been saved and sent to ${cardData.recipientEmail}!`
          : 'Your HeartPass has been saved to your collection!',
      });
    } catch (error: any) {
      console.error('Failed to save pending card:', error);
      setAlertModal({
        isOpen: true,
        title: 'Save failed',
        message: 'Failed to save your HeartPass. Please try again.',
      });
    } finally {
      setIsSavingPendingCard(false);
    }
  };

  // Dismiss pending card without saving
  const dismissPendingCard = () => {
    sessionStorage.removeItem('pendingHeartPass');
    setPendingCardModal({ isOpen: false, cardData: null });
  };

  // Load cards function - extracted to be reusable
    const loadCards = async () => {
      const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

    // Load both sent and received cards
    // Load sent cards (where user is the sender)
    const { data: sentData, error: sentError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Load received cards (where recipient_user_id OR recipient_email matches)
    const { data: receivedData, error: receivedError } = await supabase
      .from('cards')
      .select('*')
      .or(`recipient_user_id.eq.${user.id},recipient_email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    // Process sent cards
    if (sentError) {
      console.error('Failed to load sent cards:', sentError);
      setCards([]);
    } else {
      // Check and update expired cards
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const processedCards = (sentData || []).map(async (card: SavedCard) => {
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
      
      const resolvedCards = await Promise.all(processedCards);
      setCards(resolvedCards);
    }

    // Process received cards
    if (receivedError) {
      console.error('Failed to load received cards:', receivedError);
      setReceivedCards([]);
      } else {
      // Filter received cards
      let filtered = (receivedData || []).filter(
        (card: SavedCard) => card.recipient_user_id === user.id || card.recipient_email === user.email
      );
      
      // Check and update expired cards
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const processedCards = filtered.map(async (card: SavedCard) => {
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
      setReceivedCards(filtered);
      }

      setIsLoading(false);
    };

  useEffect(() => {
    loadCards();
  }, [router, pathname]); // Reload when pathname changes (page navigation)

  // Refresh cards when page becomes visible (user returns from creating/using a card)
  useEffect(() => {
    const reloadCards = async () => {
      if (!user) return;
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        // Reload sent cards
        const { data: sentData, error: sentError } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        if (!sentError && sentData) {
          setCards(sentData);
        }
        
        // Reload received cards
        const { data: receivedData, error: receivedError } = await supabase
          .from('cards')
          .select('*')
          .or(`recipient_user_id.eq.${currentUser.id},recipient_email.eq.${currentUser.email}`)
          .order('created_at', { ascending: false });
        if (!receivedError && receivedData) {
          // Filter received cards
          const filtered = (receivedData || []).filter(
            (card: SavedCard) => card.recipient_user_id === currentUser.id || card.recipient_email === currentUser.email
          );
          setReceivedCards(filtered);
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
    // Use different card array based on active tab
    const cardsToFilter = activeTab === 'sent' ? cards : receivedCards;
    let filtered = cardsToFilter;

    if (activeTab === 'sent') {
      // Sent tab filters
      if (activeFilter === 'not-sent') {
        filtered = cardsToFilter.filter(card => 
          (card.status === 'active' || !card.status) && 
          !card.recipient_email &&
          card.status !== 'expired' && 
          card.status !== 'cancelled'
        );
      } else if (activeFilter === 'pending') {
        filtered = cardsToFilter.filter(card => card.status === 'pending');
      } else if (activeFilter === 'accepted') {
        filtered = cardsToFilter.filter(card => card.status === 'accepted');
      } else if (activeFilter === 'used') {
        filtered = cardsToFilter.filter(card => card.status === 'used');
      } else if (activeFilter === 'expired') {
        filtered = cardsToFilter.filter(card => card.status === 'expired');
      }
      // 'all' shows everything including expired
    } else {
      // Received tab filters
      if (activeFilter === 'pending') {
        filtered = cardsToFilter.filter(card => card.status === 'pending' || !card.status);
      } else if (activeFilter === 'accepted') {
        filtered = cardsToFilter.filter(card => card.status === 'accepted');
    } else if (activeFilter === 'used') {
        filtered = cardsToFilter.filter(card => card.status === 'used');
      } else if (activeFilter === 'expired') {
        filtered = cardsToFilter.filter(card => card.status === 'expired');
      }
      // 'all' shows everything
    }

    setFilteredCards(filtered);
  }, [activeFilter, cards, receivedCards, activeTab]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mobile-menu-container')) {
        setOpenMenus({});
      }
    };

    if (Object.keys(openMenus).some(key => openMenus[key])) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [openMenus]);

  const toggleMenu = (cardId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenMenus(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const closeAllMenus = () => {
    setOpenMenus({});
  };

  const handleEdit = (cardId: string) => {
    closeAllMenus();
    router.push(`/create?edit=${cardId}`);
  };

  const handleSendGift = async (cardId: string) => {
    closeAllMenus();
    // Open card page - user can send from there
    router.push(`/card?id=${cardId}`);
  };

  const handleViewDetails = (cardId: string) => {
    closeAllMenus();
    router.push(`/card?id=${cardId}`);
  };

  const handleAccept = async (cardId: string) => {
    closeAllMenus();
    if (!user) return;

    try {
      const supabase = createClient();
      
      // First, get the card to check its current state
      const { data: cardBeforeUpdate, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .single();
      
      // Check if user is the recipient
      const isRecipient = 
        cardBeforeUpdate?.recipient_user_id === user.id || 
        cardBeforeUpdate?.recipient_email === user.email;
      
      if (!isRecipient) {
        setAlertModal({
          isOpen: true,
          title: 'Access Denied',
          message: 'Only the recipient can accept this pass.',
        });
        return;
      }
      
      // Try UPDATE without .select() first to see if it works
      const { error: updateError, count } = await supabase
        .from('cards')
        .update({ 
          status: 'accepted',
          recipient_user_id: user.id 
        })
        .eq('id', cardId)
        .select('id, status, recipient_user_id', { count: 'exact' });

      if (updateError) {
        console.error('❌ [My Pass] Update error:', updateError);
        console.error('❌ [My Pass] Error code:', updateError.code);
        console.error('❌ [My Pass] Error message:', updateError.message);
        console.error('❌ [My Pass] Error details:', updateError);
        setAlertModal({
          isOpen: true,
          title: 'Error',
          message: `Failed to accept pass: ${updateError.message || updateError.code || 'Unknown error'}`,
        });
        return;
      }

      // Now try to get the updated data
      const { data: updateResult, error: selectError } = await supabase
        .from('cards')
        .select('id, status, recipient_user_id')
        .eq('id', cardId)
        .single();

      // Verify the update worked
      if (updateResult?.status !== 'accepted') {
        
        // Try one more direct query
        const { data: finalCheck, error: finalError } = await supabase
          .from('cards')
          .select('status, recipient_user_id')
          .eq('id', cardId)
          .single();
        
        console.error('Final check:', finalCheck);
        
        setAlertModal({
          isOpen: true,
          title: 'Update Failed',
          message: `Status is still: ${finalCheck?.status || 'unknown'}. RLS policy may be blocking the update.`,
        });
        return;
      }

      // Reload cards to get fresh data from DB
      await loadCards();
      
      // Also update local state immediately for better UX
      setReceivedCards(receivedCards.map(card => 
        card.id === cardId ? { ...card, status: 'accepted', recipient_user_id: user.id } : card
      ));
    } catch (error: any) {
      console.error('❌ [My Pass] Failed to accept card:', error);
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to accept this pass. Please try again.',
      });
    }
  };


  const handleUseNow = async (cardId: string) => {
    closeAllMenus();
    const card = receivedCards.find(c => c.id === cardId);
    
    // Check if card is expired
    if (card?.status === 'expired') {
      setAlertModal({
        isOpen: true,
        title: 'Expired pass',
        message: 'This pass has expired and cannot be used.',
      });
      return;
    }
    
    const supabase = createClient();
    const { error } = await supabase
      .from('cards')
      .update({ status: 'used', used_at: new Date().toISOString() })
      .eq('id', cardId);

    if (!error) {
      setReceivedCards(receivedCards.map(card => 
        card.id === cardId ? { ...card, status: 'used' } : card
      ));
      setAlertModal({
        isOpen: true,
        title: 'Pass marked as used',
        message: 'This pass has been marked as used. The sender will also see this status.',
      });
    } else {
      console.error('Failed to mark card as used:', error);
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to mark the pass as used. Please try again.',
      });
    }
  };

  const handleDeleteClick = (cardId: string, recipientName: string) => {
    closeAllMenus();
    setDeleteConfirmModal({
      isOpen: true,
      cardId,
      recipientName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmModal.cardId || !user) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', deleteConfirmModal.cardId)
        .eq('user_id', user.id); // Only delete own cards

      if (error) throw error;

      // Remove from local state
      setCards(cards.filter(card => card.id !== deleteConfirmModal.cardId));
      
      setAlertModal({
        isOpen: true,
        title: 'Pass deleted',
        message: 'The pass has been deleted. It will also disappear for the recipient.',
      });
    } catch (error) {
      console.error('Failed to delete card:', error);
      setAlertModal({
        isOpen: true,
        title: 'Delete failed',
        message: 'Failed to delete the pass. Please try again.',
      });
    } finally {
      setDeleteConfirmModal({ isOpen: false, cardId: null, recipientName: '' });
    }
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

      <div className="relative z-10 container mx-auto px-0 w-full pt-32 md:pt-40">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="jenny-title text-8xl md:text-9xl lg:text-[10rem] mb-6 md:mb-8" style={{
              fontWeight: 300,
              letterSpacing: '-0.025em',
              lineHeight: 1
            }}>
              My Pass
            </h1>
            <p className="regular_paragraph text-sm">
              All your HeartPass in one place
            </p>
          </div>

          {/* Tabs */}
          <div className="relative flex border-b border-[#e5e5e5] mb-6 justify-center">
            {/* Sliding indicator */}
            <div
              className="absolute bottom-0 h-0.5 bg-[#f20e0e] transition-all duration-300 ease-out"
              style={{
                left: activeTab === 'sent' 
                  ? (sentTabRef ? `${sentTabRef.offsetLeft}px` : '0px')
                  : (receivedTabRef ? `${receivedTabRef.offsetLeft}px` : '0px'),
                width: activeTab === 'sent'
                  ? (sentTabRef ? `${sentTabRef.offsetWidth}px` : '0px')
                  : (receivedTabRef ? `${receivedTabRef.offsetWidth}px` : '0px'),
              }}
            />
            <button
              ref={(el) => setSentTabRef(el)}
              onClick={() => setActiveTab('sent')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'sent'
                  ? 'text-[#f20e0e]'
                  : 'text-[#999] md:hover:text-[#f20e0e]'
              }`}
            >
              Sent
            </button>
            <button
              ref={(el) => setReceivedTabRef(el)}
              onClick={() => setActiveTab('received')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'received'
                  ? 'text-[#f20e0e]'
                  : 'text-[#999] md:hover:text-[#f20e0e]'
              }`}
            >
              Received
            </button>
          </div>

          {/* Status Filters */}
          {activeTab === 'sent' && cards.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap justify-center">
                <button
                  onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
                >
                  All ({cards.length})
                </button>
                <button
                onClick={() => setActiveFilter('not-sent')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'not-sent'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
              >
                No Email ({cards.filter(c => (c.status === 'active' || !c.status) && !c.recipient_email).length})
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'pending'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
              >
                Pending ({cards.filter(c => c.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveFilter('accepted')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'accepted'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
              >
                Accepted ({cards.filter(c => c.status === 'accepted').length})
                </button>
                <button
                  onClick={() => setActiveFilter('used')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'used'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
                >
                  Used ({cards.filter(c => c.status === 'used').length})
                </button>
              <button
                onClick={() => setActiveFilter('expired')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'expired'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
              >
                Expired ({cards.filter(c => c.status === 'expired').length})
              </button>
              </div>
            )}

          {activeTab === 'received' && receivedCards.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap justify-center">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
              >
                All ({receivedCards.length})
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'pending'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
              >
                Pending ({receivedCards.filter(c => c.status === 'pending' || !c.status).length})
              </button>
              <button
                onClick={() => setActiveFilter('accepted')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'accepted'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
              >
                Accepted ({receivedCards.filter(c => c.status === 'accepted').length})
              </button>
              <button
                onClick={() => setActiveFilter('used')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'used'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
              >
                Used ({receivedCards.filter(c => c.status === 'used').length})
              </button>
              <button
                onClick={() => setActiveFilter('expired')}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeFilter === 'expired'
                    ? 'bg-[#f20e0e] text-white border-[#f20e0e]'
                    : 'bg-white text-[#f20e0e] border-[#f20e0e] hover:bg-[#f5f5f5]'
                }`}
              >
                Expired ({receivedCards.filter(c => c.status === 'expired').length})
              </button>
            </div>
          )}

          {/* Content */}
          {activeTab === 'sent' ? (
            <>
              {filteredCards.length === 0 ? (
            <div className="text-center py-20">
                  {cards.length === 0 ? (
                    <>
                      <p className="regular_paragraph mb-2" style={{ fontSize: '1.1rem' }}>
                        You haven't created any passes yet
                      </p>
                      <p className="regular_paragraph mb-6" style={{ color: '#999', textTransform: 'none', fontSize: '0.9rem' }}>
                        Create your first HeartPass and share it with someone special!
                      </p>
                      <Link href="/create" className="y2k-button inline-block">
                        CREATE YOUR FIRST PASS
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="regular_paragraph mb-2" style={{ fontSize: '1.1rem' }}>
                        No {activeFilter === 'not-sent' ? 'unsent' : activeFilter} passes
                      </p>
                      <p className="regular_paragraph mb-6" style={{ color: '#999', textTransform: 'none', fontSize: '0.9rem' }}>
                        Try a different filter or create a new pass
                      </p>
                      <Link href="/create" className="y2k-button inline-block">
                        CREATE A NEW PASS
                      </Link>
                    </>
                  )}
            </div>
          ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCards.map((card) => {
                    const coupon = coupons.find(c => c.id === card.coupon_type);
                    return (
                <div
                  key={card.id}
                  className="group relative transition-all duration-200 md:hover:-translate-y-0.5 md:hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] md:!px-5 md:!py-5"
                  style={{
                    background: '#FFFEEF',
                    border: '1px solid #e5e5e5',
                    padding: '20px 30px 24px',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('.mobile-menu-container') && !target.closest('.mobile-menu-dropdown')) {
                      if (window.matchMedia('(max-width: 767px)').matches) {
                        router.push(`/card?id=${card.id}`);
                      }
                    }
                  }}
                >
                  {/* Top Stripe - Boarding Pass Style */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: '#f20e0e',
                  }} />
                  
                  <div className="flex-1 space-y-4 pt-2">
                    {/* FROM / TO - Boarding Pass Style */}
                    <div className="flex justify-between md:justify-between items-start gap-2 md:gap-0 relative">
                      <div className="flex-1 md:flex-none">
                        <div className="regular_paragraph mb-0.5" style={{
                          color: '#f20e0e',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          lineHeight: 1.2,
                          fontSize: '9px',
                        }}>
                          FROM
                        </div>
                        <div className="regular_paragraph" style={{
                          color: '#666666',
                          fontWeight: 400,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.3,
                          fontSize: '13px',
                        }}>
                          {card.sender_name || 'You'}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#f20e0e',
                        opacity: 0.6,
                        fontWeight: 400,
                        marginTop: '6px',
                        flexShrink: 0,
                        marginLeft: '12px',
                        marginRight: '12px',
                      }}>
                        →
                      </div>
                      <div className="text-right flex-1 md:flex-none">
                        <div className="regular_paragraph mb-0.5" style={{
                          color: '#f20e0e',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          lineHeight: 1.2,
                          fontSize: '9px',
                        }}>
                          TO
                        </div>
                        <div className="regular_paragraph" style={{
                          color: '#666666',
                          fontWeight: 400,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.3,
                          fontSize: '13px',
                        }}>
                          {card.recipient_name || 'Loved One'}
                        </div>
                      </div>
                    </div>
                            
                            {/* Coupon Title - Large & Prominent */}
                            <div>
                              <div className="jenny-title text-3xl" style={{
                                fontWeight: 300,
                                letterSpacing: '-0.025em',
                                lineHeight: 1.1,
                                color: '#f20e0e',
                              }}>
                                {coupon?.title || card.coupon_type}
                              </div>
                            </div>
                            
                            {/* Footer - Date & Status */}
                            <div className="flex justify-between items-center pt-2 relative" style={{
                              borderTop: '1px solid #e5e5e5',
                              paddingTop: '10px',
                              paddingBottom: '10px',
                              marginTop: 'auto',
                            }}>
                              {/* Mobile: Date and Status together on left */}
                              <div className="md:hidden flex items-center gap-3" onClick={(e) => {
                                e.stopPropagation();
                                if (window.innerWidth < 768) {
                                  router.push(`/card?id=${card.id}`);
                                }
                              }} style={{ cursor: 'pointer' }}>
                                <div className="regular_paragraph" style={{
                                  color: '#999999',
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                  fontWeight: 400,
                                  lineHeight: 1.2,
                                  fontSize: '13px',
                                }}>
                                  {format(new Date(card.created_at), 'MMM dd')}
                                </div>
                                {/* Status Badge */}
                                {card.recipient_email && !card.recipient_user_id && card.status === 'pending' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#f20e0e',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Pending
                                  </span>
                                )}
                                {card.recipient_user_id && card.status === 'accepted' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#4CAF50',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Accepted
                                  </span>
                                )}
                                {card.status === 'used' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#999999',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Used
                                  </span>
                                )}
                                {card.status === 'expired' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#ff6b6b',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Expired
                                  </span>
                                )}
                                {!card.recipient_email && (card.status === 'active' || !card.status) && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#666666',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Saved
                                  </span>
                                )}
                              </div>
                              
                              {/* Desktop: Date on left, Status on right */}
                              <div className="hidden md:block" onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/card?id=${card.id}`);
                              }} style={{ cursor: 'pointer' }}>
                                <div className="regular_paragraph" style={{
                                  color: '#999999',
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                  fontWeight: 400,
                                  lineHeight: 1.2,
                                  fontSize: '13px',
                                }}>
                                  {format(new Date(card.created_at), 'MMM dd')}
                                </div>
                              </div>
                              <div className="hidden md:block text-right">
                                {/* Status Badge */}
                                {card.recipient_email && !card.recipient_user_id && card.status === 'pending' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#f20e0e',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Pending
                                  </span>
                                )}
                                {card.recipient_user_id && card.status === 'accepted' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#4CAF50',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Accepted
                                  </span>
                                )}
                                {card.status === 'used' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#999999',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Used
                                  </span>
                                )}
                                {card.status === 'expired' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#ff6b6b',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Expired
                                  </span>
                                )}
                                {!card.recipient_email && (card.status === 'active' || !card.status) && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#666666',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Saved
                                  </span>
                                )}
                              </div>
                              
                              {/* Mobile: More Menu Button - Red, aligned with TO */}
                              <div className="md:hidden relative mobile-menu-container flex items-center" style={{ zIndex: 50, marginLeft: 'auto' }}>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleMenu(card.id, e);
                                  }}
                                  className="flex items-center justify-center transition-colors active:opacity-70"
                                  style={{
                                    color: '#f20e0e',
                                    width: '44px',
                                    height: '44px',
                                    padding: '8px',
                                    minWidth: '44px',
                                    minHeight: '44px',
                                    marginRight: '-9px',
                                  }}
                                  aria-label="More options"
                                  type="button"
                                >
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="5" cy="12" r="1" />
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="19" cy="12" r="1" />
                                  </svg>
                                </button>
                                
                                {/* Dropdown Menu */}
                                {openMenus[card.id] && (
                                  <div
                                    className="mobile-menu-dropdown absolute bottom-9 right-0 border border-[#e5e5e5] shadow-lg z-40"
                                    style={{
                                      background: '#FFFEEF',
                                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                      minWidth: '120px',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Sent Cards: Status-based menu items */}
                                    {/* Saved status (!recipient_email): not sent yet → EDIT, SEND */}
                                    {!card.recipient_email && (card.status === 'active' || !card.status) && (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleEdit(card.id);
                                          }}
                                          className="w-full text-left px-4 py-2.5 border-b border-[#e5e5e5] transition-colors active:bg-[rgba(242,14,14,0.05)]"
                                          style={{
                                            fontFamily: 'var(--font-sans)',
                                            color: '#f20e0e',
                                            fontSize: '11px',
                                            fontWeight: 400,
                                            letterSpacing: '0.02em',
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          EDIT
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSendGift(card.id);
                                          }}
                                          className="w-full text-left px-4 py-2.5 border-b border-[#e5e5e5] transition-colors active:bg-[rgba(242,14,14,0.05)]"
                                          style={{
                                            fontFamily: 'var(--font-sans)',
                                            color: '#f20e0e',
                                            fontSize: '11px',
                                            fontWeight: 400,
                                            letterSpacing: '0.02em',
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          SEND
                                        </button>
                                      </>
                                    )}
                                    {/* Already sent status (pending, accepted, used, expired): show VIEW only */}
                                    {(card.status === 'pending' || card.status === 'accepted' || card.status === 'used' || card.status === 'expired') && (
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleViewDetails(card.id);
                                        }}
                                        className="w-full text-left px-4 py-2.5 border-b border-[#e5e5e5] transition-colors active:bg-[rgba(242,14,14,0.05)]"
                                        style={{
                                          fontFamily: 'var(--font-sans)',
                                          color: '#f20e0e',
                                          fontSize: '11px',
                                          fontWeight: 400,
                                          letterSpacing: '0.02em',
                                          textTransform: 'uppercase',
                                        }}
                                      >
                                        VIEW
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteClick(card.id, card.recipient_name || 'Loved One');
                                      }}
                                      className="w-full text-left px-4 py-2.5 transition-colors active:bg-[rgba(255,107,107,0.1)]"
                                      style={{
                                        fontFamily: 'var(--font-sans)',
                                        color: '#ff6b6b',
                                        fontSize: '11px',
                                        fontWeight: 400,
                                        letterSpacing: '0.02em',
                                        textTransform: 'uppercase',
                                      }}
                                    >
                                      DELETE
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                    </div>
                          
                          {/* Action Buttons - Desktop: Overlay on Hover */}
                          <div className="card-overlay-hover hidden md:block absolute inset-0 opacity-0 transition-opacity duration-200 z-30 pointer-events-none" style={{
                            background: 'rgba(255, 254, 239, 0.98)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}>
                            <div className="pointer-events-auto flex items-center gap-2">
                              {card.status === 'active' || !card.status ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleEdit(card.id);
                                    }}
                                    className="px-4 py-2 text-xs border border-[#e5e5e5] hover:bg-[#f5f5f5] transition-colors"
                                    style={{ fontSize: '11px' }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSendGift(card.id);
                                    }}
                                    className="px-4 py-2 text-xs y2k-button"
                                    style={{ fontSize: '11px', padding: '8px 16px' }}
                                  >
                                    Send
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    router.push(`/card?id=${card.id}`);
                                  }}
                                  className="px-4 py-2 text-xs y2k-button"
                                  style={{ fontSize: '11px', padding: '8px 16px' }}
                                >
                                  View
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteClick(card.id, card.recipient_name || 'Loved One');
                                }}
                                className="px-3 py-2 text-xs border border-[#e5e5e5] hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center"
                                style={{ 
                                  color: '#ff6b6b', 
                                  fontSize: '16px',
                                  fontWeight: 300,
                                  width: '32px',
                                  height: '32px',
                                  lineHeight: '1',
                                }}
                                title="Delete"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                  </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {filteredCards.length === 0 ? (
                <div className="text-center py-20">
                  {receivedCards.length === 0 ? (
                    <>
                      <p className="regular_paragraph mb-2" style={{ fontSize: '1.1rem' }}>
                        No received passes yet
                      </p>
                      <p className="regular_paragraph mb-6" style={{ color: '#999', textTransform: 'none', fontSize: '0.9rem' }}>
                        When someone sends you a HeartPass, it will appear here.
                        <br />Share your email with friends to receive passes!
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="regular_paragraph mb-2" style={{ fontSize: '1.1rem' }}>
                        No {activeFilter} passes
                      </p>
                      <p className="regular_paragraph mb-6" style={{ color: '#999', textTransform: 'none', fontSize: '0.9rem' }}>
                        Try a different filter to see other passes
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCards.map((card) => {
                    const coupon = coupons.find(c => c.id === card.coupon_type);
                    return (
                      <div
                        key={card.id}
                        className="group relative transition-all duration-200 md:hover:-translate-y-0.5 md:hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] md:!px-5 md:!py-5"
                        style={{
                          background: '#FFFEEF',
                          border: '1px solid #e5e5e5',
                          padding: '20px 30px 24px',
                          minHeight: '200px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (!target.closest('.mobile-menu-container') && !target.closest('.mobile-menu-dropdown')) {
                            if (window.matchMedia('(max-width: 767px)').matches) {
                              router.push(`/card?id=${card.id}`);
                            }
                          }
                        }}
                      >
                        {/* Top Stripe - Boarding Pass Style */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: '#f20e0e',
                        }} />
                        
                        <div className="flex-1 space-y-4 pt-2">
                          {/* FROM / TO - Boarding Pass Style */}
                          <div className="flex justify-between md:justify-between items-start gap-2 md:gap-0 relative">
                            <div className="flex-1 md:flex-none">
                              <div className="regular_paragraph mb-0.5" style={{
                                color: '#f20e0e',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                                lineHeight: 1.2,
                                fontSize: '9px',
                              }}>
                                FROM
                              </div>
                              <div className="regular_paragraph" style={{
                                color: '#666666',
                                fontWeight: 400,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.3,
                                fontSize: '13px',
                              }}>
                                {card.sender_name || 'Someone'}
                              </div>
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: '#f20e0e',
                              opacity: 0.6,
                              fontWeight: 400,
                              marginTop: '6px',
                              flexShrink: 0,
                              marginLeft: '12px',
                              marginRight: '12px',
                            }}>
                              →
                            </div>
                            <div className="text-right flex-1 md:flex-none">
                              <div className="regular_paragraph mb-0.5" style={{
                                color: '#f20e0e',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                                lineHeight: 1.2,
                                fontSize: '9px',
                              }}>
                                TO
                              </div>
                              <div className="regular_paragraph" style={{
                                color: '#666666',
                                fontWeight: 400,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.3,
                                fontSize: '13px',
                              }}>
                                You
                              </div>
                            </div>
                          </div>
                            
                            {/* Coupon Title - Large & Prominent */}
                            <div>
                              <div className="jenny-title text-3xl" style={{
                                fontWeight: 300,
                                letterSpacing: '-0.025em',
                                lineHeight: 1.1,
                                color: '#f20e0e',
                              }}>
                                {coupon?.title || card.coupon_type}
                              </div>
                            </div>
                            
                            {/* Footer - Date & Status */}
                            <div className="flex justify-between items-center pt-2 relative" style={{
                              borderTop: '1px solid #e5e5e5',
                              paddingTop: '10px',
                              paddingBottom: '10px',
                              marginTop: 'auto',
                            }}>
                              {/* Mobile: Date and Status together on left */}
                              <div className="md:hidden flex items-center gap-3" onClick={(e) => {
                                e.stopPropagation();
                                if (window.innerWidth < 768) {
                                  router.push(`/card?id=${card.id}`);
                                }
                              }} style={{ cursor: 'pointer' }}>
                                <div className="regular_paragraph" style={{
                                  color: '#999999',
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                  fontWeight: 400,
                                  lineHeight: 1.2,
                                  fontSize: '13px',
                                }}>
                                  {format(new Date(card.created_at), 'MMM dd')}
                                </div>
                                {/* Status Badge */}
                                {card.status === 'pending' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#f20e0e',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Pending
                                  </span>
                                )}
                                {card.status === 'accepted' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#4CAF50',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Accepted
                                  </span>
                                )}
                                {card.status === 'used' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#999999',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Used
                                  </span>
                                )}
                                {card.status === 'expired' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#ff6b6b',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Expired
                                  </span>
                                )}
                              </div>
                              
                              {/* Desktop: Date on left, Status on right */}
                              <div className="hidden md:block">
                                <div className="regular_paragraph" style={{
                                  color: '#999999',
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                  fontWeight: 400,
                                  lineHeight: 1.2,
                                  fontSize: '13px',
                                }}>
                                  {format(new Date(card.created_at), 'MMM dd')}
                                </div>
                              </div>
                              <div className="hidden md:block text-right">
                                {/* Status Badge */}
                                {card.status === 'pending' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#f20e0e',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Pending
                                  </span>
                                )}
                                {card.status === 'accepted' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#4CAF50',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Accepted
                                  </span>
                                )}
                                {card.status === 'used' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#999999',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Used
                                  </span>
                                )}
                                {card.status === 'expired' && (
                                  <span className="regular_paragraph" style={{ 
                                    color: '#ff6b6b',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                  }}>
                                    Expired
                                  </span>
                                )}
                              </div>
                              
                              {/* Mobile: More Menu Button - Red, aligned with TO */}
                              <div className="md:hidden relative mobile-menu-container flex items-center" style={{ zIndex: 50, marginLeft: 'auto' }}>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleMenu(card.id, e);
                                  }}
                                  className="flex items-center justify-center transition-colors active:opacity-70"
                                  style={{
                                    color: '#f20e0e',
                                    width: '44px',
                                    height: '44px',
                                    padding: '8px',
                                    minWidth: '44px',
                                    minHeight: '44px',
                                    marginRight: '-9px',
                                  }}
                                  aria-label="More options"
                                  type="button"
                                >
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="5" cy="12" r="1" />
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="19" cy="12" r="1" />
                                  </svg>
                                </button>
                                
                                {/* Dropdown Menu */}
                                {openMenus[card.id] && (
                                  <div
                                    className="mobile-menu-dropdown absolute bottom-9 right-0 border border-[#e5e5e5] shadow-lg z-40"
                                    style={{
                                      background: '#FFFEEF',
                                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                      minWidth: '120px',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Received Cards: Status-based menu items */}
                                    {(card.status === 'pending' || !card.status) && (
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleAccept(card.id);
                                        }}
                                        className="w-full text-left px-4 py-2.5 border-b border-[#e5e5e5] transition-colors active:bg-[rgba(242,14,14,0.05)]"
                                        style={{
                                          fontFamily: 'var(--font-sans)',
                                          color: '#f20e0e',
                                          fontSize: '11px',
                                          fontWeight: 400,
                                          letterSpacing: '0.02em',
                                          textTransform: 'uppercase',
                                        }}
                                      >
                                        ACCEPT
                                      </button>
                                    )}
                                    {card.status === 'accepted' && (
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleUseNow(card.id);
                                        }}
                                        className="w-full text-left px-4 py-2.5 border-b border-[#e5e5e5] transition-colors active:bg-[rgba(242,14,14,0.05)]"
                                        style={{
                                          fontFamily: 'var(--font-sans)',
                                          color: '#f20e0e',
                                          fontSize: '11px',
                                          fontWeight: 400,
                                          letterSpacing: '0.02em',
                                          textTransform: 'uppercase',
                                        }}
                                      >
                                        USE NOW
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleViewDetails(card.id);
                                      }}
                                      className="w-full text-left px-4 py-2.5 border-b border-[#e5e5e5] transition-colors active:bg-[rgba(242,14,14,0.05)]"
                                      style={{
                                        fontFamily: 'var(--font-sans)',
                                        color: '#f20e0e',
                                        fontSize: '11px',
                                        fontWeight: 400,
                                        letterSpacing: '0.02em',
                                        textTransform: 'uppercase',
                                      }}
                                    >
                                      VIEW
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteClick(card.id, card.recipient_name || 'Loved One');
                                      }}
                                      className="w-full text-left px-4 py-2.5 transition-colors active:bg-[rgba(255,107,107,0.1)]"
                                      style={{
                                        fontFamily: 'var(--font-sans)',
                                        color: '#ff6b6b',
                                        fontSize: '11px',
                                        fontWeight: 400,
                                        letterSpacing: '0.02em',
                                        textTransform: 'uppercase',
                                      }}
                                    >
                                      DELETE
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons - Desktop: Overlay on Hover */}
                          <div className="card-overlay-hover hidden md:block absolute inset-0 opacity-0 transition-opacity duration-200 z-30 pointer-events-none" style={{
                            background: 'rgba(255, 254, 239, 0.98)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}>
                            {card.status === 'pending' || !card.status ? (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAccept(card.id);
                                }}
                                className="px-4 py-2 text-xs y2k-button"
                                style={{ fontSize: '11px', padding: '8px 16px' }}
                              >
                                Accept
                              </button>
                            ) : card.status === 'accepted' ? (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleUseNow(card.id);
                                }}
                                className="px-4 py-2 text-xs y2k-button"
                                style={{ fontSize: '11px', padding: '8px 16px' }}
                              >
                                Use Now
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(`/card?id=${card.id}`);
                                }}
                                className="px-4 py-2 text-xs y2k-button"
                                style={{ fontSize: '11px', padding: '8px 16px' }}
                              >
                                View
                              </button>
                            )}
                          </div>
                        </div>
                    );
                  })}
            </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmModal({ isOpen: false, cardId: null, recipientName: '' })}
        title="Delete Pass"
        message={`Are you sure you want to delete this pass?\n\n⚠️ This pass will also disappear for the recipient (${deleteConfirmModal.recipientName}).\n\nThis action cannot be undone.`}
        confirmText="DELETE"
        cancelText="CANCEL"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
      />

      {/* Pending Card Recovery Modal */}
      {pendingCardModal.isOpen && pendingCardModal.cardData && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="relative max-w-md w-full mx-4"
            style={{
              background: '#FFFEEF',
              border: '1px solid #e5e5e5',
              padding: '40px 32px',
            }}
          >
            <h2
              className="jenny-title text-3xl mb-4"
              style={{
                fontWeight: 300,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                color: '#f20e0e',
              }}
            >
              Welcome back! 💝
            </h2>
            <p
              className="regular_paragraph mb-6"
              style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: '#666666',
                fontWeight: 400,
              }}
            >
              We found a HeartPass you created before signing in. Would you like to save it to your account?
            </p>
            
            {/* Card Preview */}
            <div className="mb-6 p-4" style={{ background: '#fff', border: '1px solid #e5e5e5' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="regular_paragraph text-xs" style={{ color: '#f20e0e' }}>FROM</span>
                <span className="regular_paragraph text-xs" style={{ color: '#f20e0e' }}>TO</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="regular_paragraph text-sm" style={{ color: '#666' }}>{pendingCardModal.cardData.senderName}</span>
                <span className="regular_paragraph text-sm" style={{ color: '#666' }}>{pendingCardModal.cardData.recipientName}</span>
              </div>
              <div className="jenny-title text-xl" style={{ color: '#f20e0e' }}>
                {coupons.find(c => c.id === pendingCardModal.cardData.couponType)?.title || pendingCardModal.cardData.couponType}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={dismissPendingCard}
                className="y2k-button bg-white flex-1"
                style={{ color: '#f20e0e' }}
                disabled={isSavingPendingCard}
              >
                Discard
              </button>
              <button
                onClick={savePendingCard}
                className="y2k-button flex-1"
                disabled={isSavingPendingCard}
              >
                {isSavingPendingCard ? 'Saving...' : 'Save Pass'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
