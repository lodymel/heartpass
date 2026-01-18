'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  card_id: string;
  type: 'received' | 'accepted' | 'used';
  message: string;
  read: boolean;
  created_at: string;
  card?: {
    id: string;
    sender_name: string;
    recipient_name: string;
    coupon_type: string;
  };
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    let subscription: any;

    // Load initial notifications
    const loadNotifications = async () => {
      // Get received cards (pending status) - cards sent to this user
      const { data: receivedCards, error } = await supabase
        .from('cards')
        .select('*')
        .or(`recipient_user_id.eq.${user.id},recipient_email.eq.${user.email}`)
        .in('status', ['pending'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && receivedCards) {
        const notifs: Notification[] = receivedCards.map(card => ({
          id: card.id,
          card_id: card.id,
          type: 'received',
          message: `${card.sender_name || 'Someone'} sent you a HeartPass!`,
          read: false,
          created_at: card.created_at,
          card: {
            id: card.id,
            sender_name: card.sender_name || 'Someone',
            recipient_name: card.recipient_name || 'You',
            coupon_type: card.coupon_type || '',
          },
        }));
        setNotifications(notifs);
        setUnreadCount(notifs.length);
      }
    };

    loadNotifications();

    // Subscribe to real-time updates
    subscription = supabase
      .channel('cards-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `recipient_email=eq.${user.email}`,
        },
        (payload) => {
          loadNotifications(); // Reload on any change
        }
      )
      .subscribe();

    // Also check periodically (fallback)
    const interval = setInterval(loadNotifications, 30000); // Every 30 seconds

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      clearInterval(interval);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    router.push(`/card?id=${notification.card_id}`);
  };

  if (!user) return null;

  return (
    <>
      {/* Notification Bell Button - Top Right (Industry Standard) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 md:top-6 md:right-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center transition-all duration-300 group"
        style={{
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
        aria-label="Notifications"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-black md:group-hover:text-[#f20e0e] transition-colors"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#f20e0e] text-white text-[10px] md:text-xs font-bold flex items-center justify-center"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop - brand tone (same as NotificationButton) */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(242, 14, 14, 0.08)' }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel - Dropdown from top right */}
          <div
            className="fixed top-20 md:top-20 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-96 max-h-[calc(100vh-8rem)] md:max-h-[600px] bg-white border border-[#e5e5e5] z-50 flex flex-col"
            style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#e5e5e5]">
              <h2
                className="text-xl font-bold uppercase"
                style={{
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.05em',
                  color: '#f20e0e',
                }}
              >
                Notifications
              </h2>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs uppercase md:hover:text-[#f20e0e] transition-colors"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.05em',
                    color: '#666666',
                    fontSize: '0.7rem',
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p
                    className="text-sm uppercase"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      letterSpacing: '0.05em',
                      color: '#999999',
                    }}
                  >
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 border-b border-[#e5e5e5] text-left md:hover:bg-[#FFFEEF] active:bg-[#FFFEEF] transition-colors ${
                        !notification.read ? 'bg-[#FFFEEF]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            !notification.read ? 'bg-[#f20e0e]' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium mb-1"
                            style={{
                              fontFamily: 'var(--font-sans)',
                              letterSpacing: '0.02em',
                              color: '#000000',
                            }}
                          >
                            {notification.message}
                          </p>
                          <p
                            className="text-xs"
                            style={{
                              fontFamily: 'var(--font-sans)',
                              letterSpacing: '0.05em',
                              color: '#999999',
                            }}
                          >
                            {new Date(notification.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
