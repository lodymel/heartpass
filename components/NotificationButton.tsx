'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

export default function NotificationButton() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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
          console.log('Real-time update:', payload);
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

  return (
    <>
      {/* Notification Button - Nav Link Style (without underline) */}
      <button
        onClick={() => {
          if (!user) {
            router.push('/auth/login');
            return;
          }
          setIsOpen(!isOpen);
        }}
        className="relative"
        onMouseEnter={() => {
          if (window.matchMedia('(hover: hover)').matches) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => {
          if (window.matchMedia('(hover: hover)').matches) {
            setIsHovered(false);
          }
        }}
        style={{
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: '1rem',
          fontWeight: 400,
          letterSpacing: '0',
          textTransform: 'uppercase',
          textDecoration: 'none',
          color: '#f20e0e',
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
        aria-label="Notifications"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={isHovered || isOpen ? '#f20e0e' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-current"
          style={{
            transition: 'fill 0.3s ease-in-out',
          }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f20e0e] text-white text-[9px] font-bold flex items-center justify-center"
            style={{ 
              fontFamily: 'var(--font-sans)',
              lineHeight: '1',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel - Portal to body for proper z-index stacking */}
      {isOpen && mounted && user ? createPortal(
        <>
          {/* Backdrop - brand tone: subtle warm tone instead of cold black (subtle brand red tint) */}
          <div
            className="fixed inset-0"
            style={{ 
              background: 'rgba(242, 14, 14, 0.08)',
              zIndex: 1003,
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel - Apple style: restrained glass (94% opacity + 20px blur), soft shadow (0.06) */}
          <div
            className="fixed top-20 md:top-24 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-96 max-h-[calc(100vh-8rem)] md:max-h-[600px] border border-[#e5e5e5] border-t-2 border-t-[#f20e0e] flex flex-col"
            style={{
              background: 'rgba(255, 254, 239, 0.94)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              zIndex: 1004,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - light tone, small and tidy title */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5]">
              <h2
                className="text-[13px] font-semibold uppercase"
                style={{
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.08em',
                  color: '#f20e0e',
                }}
              >
                Notifications
              </h2>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] uppercase transition-colors md:hover:underline"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.06em',
                    color: '#666666',
                  }}
                  onMouseEnter={(e) => { 
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.color = '#f20e0e';
                    }
                  }}
                  onMouseLeave={(e) => { 
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.color = '#666666';
                    }
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List - matches panel glass, brand scrollbar */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <span
                    className="block mb-2 text-base"
                    style={{ color: 'rgba(242, 14, 14, 0.5)' }}
                    aria-hidden
                  >
                    ♥
                  </span>
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
                      className="w-full p-4 border-b border-[#e5e5e5] text-left transition-colors active:bg-[rgba(242,14,14,0.06)] md:hover:bg-[rgba(242,14,14,0.06)]"
                      style={{
                        background: !notification.read ? 'rgba(242, 14, 14, 0.04)' : 'transparent',
                      }}
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
        </>,
        document.body
      ) : null}
    </>
  );
}
