'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';
import AuthButton from '@/components/AuthButton';
import NotificationButton from '@/components/NotificationButton';
import SignOutButton from '@/components/SignOutButton';

interface NavigationProps {
  // Optional: Check if navigation should be confirmed (e.g., unsaved changes)
  shouldConfirmNavigation?: (href: string) => boolean;
  // Optional: Callback when navigation is clicked (returns true if navigation should proceed)
  onNavigationClick?: (href: string, e: React.MouseEvent) => boolean | void;
}

export default function Navigation({ shouldConfirmNavigation, onNavigationClick }: NavigationProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Navigation Bar - Always on top, visible above menu */}
      <nav 
        className="fixed top-0 left-0 right-0" 
        style={{ 
          background: 'rgba(255, 254, 239, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'background 0.2s ease',
          position: 'fixed',
          zIndex: 1002,
        }}
      >
        <div 
          className="container mx-auto px-4 md:px-6" 
          style={{ 
            maxWidth: '100%', 
            position: 'relative',
            zIndex: 71,
          }}
        >
          <div className="flex items-center justify-between h-20 md:h-24 py-5 relative" style={{ zIndex: 72 }}>
          {/* Logo - Always visible above menu */}
          <Link 
            href="/" 
            className="nav-logo"
            style={{
              position: 'relative',
              zIndex: 100,
              color: '#f20e0e',
            }}
            onClick={(e) => {
              // Close mobile menu if open
              if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
              }
              
              // If already on home page, smooth scroll to top instead of navigating
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
              }
              
              // Check if navigation should be confirmed (e.g., unsaved changes)
              if (shouldConfirmNavigation && shouldConfirmNavigation('/')) {
                e.preventDefault();
                if (onNavigationClick) {
                  const result = onNavigationClick('/', e);
                  // If navigation proceeds, it will be handled by onNavigationClick
                  if (result !== false) {
                    // Navigation will proceed, menu already closed
                  }
                }
              } else if (onNavigationClick) {
                const result = onNavigationClick('/', e);
                if (result === false) {
                  e.preventDefault();
                }
              }
              // If no confirmation needed and no onNavigationClick, allow default navigation
            }}
          >
            <div className="nav-logo-container" style={{
              position: 'relative',
              width: 'fit-content',
              height: 'fit-content',
              display: 'inline-block',
            }}>
              {/* HeartPass Text */}
              <span className="jenny-title text-2xl md:text-3xl nav-logo-text" style={{
                fontWeight: 400,
                letterSpacing: '-0.025em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                color: '#f20e0e',
                display: 'block',
                position: 'relative',
                zIndex: 101,
              }}>
                HeartPass
              </span>
              {/* Heart SVG - Hidden by default, shown on hover */}
              <img 
                src="/heart.svg" 
                alt="Heart" 
                className="nav-logo-heart"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '32px',
                  height: '32px',
                  pointerEvents: 'none',
                  zIndex: 102,
                }}
              />
            </div>
          </Link>

          {/* Desktop Navigation - Always visible on md and up */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <AuthButton 
              shouldConfirmNavigation={shouldConfirmNavigation}
              onNavigationClick={onNavigationClick}
            />
            <NotificationButton />
            <SignOutButton />
            <Link 
              href="/create" 
              className="nav-button-primary"
              onClick={(e) => {
                if (shouldConfirmNavigation && shouldConfirmNavigation('/create')) {
                  e.preventDefault();
                  if (onNavigationClick) {
                    const result = onNavigationClick('/create', e);
                    if (result === false) return;
                  }
                } else if (onNavigationClick) {
                  const result = onNavigationClick('/create', e);
                  if (result === false) e.preventDefault();
                }
              }}
            >
              BOARDING NOW
            </Link>
          </div>

          {/* Mobile/Tablet: CTA Button + Notification + Hamburger */}
          <div className="flex md:hidden items-center gap-4">
            {/* CTA Button - Always visible on mobile */}
            <Link href="/create" className="nav-button-primary text-sm px-3 py-2">
              BOARDING NOW
            </Link>
            
            {/* Notification Button - Mobile */}
            <div style={{ marginLeft: '12px', marginRight: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <NotificationButton />
            </div>
            
            {/* Hamburger Menu Button - Brand Color, Always Visible Above Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative w-10 h-10 flex items-center justify-center"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              style={{
                cursor: 'pointer',
                position: 'relative',
                zIndex: 70,
              }}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              <div className="relative w-6 h-5" style={{ height: '20px' }}>
                {/* Top line - transforms to X top */}
                <span
                  className="absolute left-0 w-6 h-0.5 transition-all duration-300 ease-in-out"
                  style={{ 
                    background: '#f20e0e',
                    top: isMobileMenuOpen ? '9.5px' : '0px',
                    transform: isMobileMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    transformOrigin: 'center',
                  }}
                />
                {/* Middle line - fades out */}
                <span
                  className="absolute left-0 w-6 h-0.5 transition-all duration-300 ease-in-out"
                  style={{ 
                    background: '#f20e0e',
                    top: '9.5px',
                    opacity: isMobileMenuOpen ? 0 : 1,
                  }}
                />
                {/* Bottom line - transforms to X bottom */}
                <span
                  className="absolute left-0 w-6 h-0.5 transition-all duration-300 ease-in-out"
                  style={{ 
                    background: '#f20e0e',
                    top: isMobileMenuOpen ? '9.5px' : '19px',
                    transform: isMobileMenuOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
                    transformOrigin: 'center',
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
      </nav>

      {/* Mobile Menu Overlay - Full Screen (Outside nav for proper z-index) */}
      {isMobileMenuOpen && (
        <>
          {/* Mobile Menu Panel - full screen overlay (excluding Navigation) */}
          <div
            className="fixed left-0 right-0 bottom-0 md:hidden"
            style={{ 
              background: 'rgba(255, 254, 239, 0.7)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              top: '80px',
              zIndex: 1001,
              overflowY: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Menu Content */}
            <div className="container mx-auto px-4 w-full">
              <div className="flex flex-col gap-8 items-center">
                {/* Auth Button - Mobile Version */}
                <AuthButtonMobileWrapper 
                  shouldConfirmNavigation={shouldConfirmNavigation}
                  onNavigationClick={onNavigationClick}
                />
                
                {/* Sign Out - Mobile Version */}
                <SignOutButtonMobile 
                  shouldConfirmNavigation={shouldConfirmNavigation}
                  onNavigationClick={onNavigationClick}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Mobile versions of auth components
function AuthButtonMobileWrapper({ 
  shouldConfirmNavigation, 
  onNavigationClick,
  onMenuClose
}: { 
  shouldConfirmNavigation?: (href: string) => boolean;
  onNavigationClick?: (href: string, e: React.MouseEvent) => boolean | void;
  onMenuClose?: () => void;
}) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsLoading(false);
      return;
    }
    
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) return null;

  const handleClick = (href: string, e: React.MouseEvent) => {
    if (shouldConfirmNavigation && shouldConfirmNavigation(href)) {
      e.preventDefault();
      if (onNavigationClick) {
        const result = onNavigationClick(href, e);
        if (result !== false) {
          router.push(href);
        }
      }
    } else {
      if (onNavigationClick) {
        const result = onNavigationClick(href, e);
        if (result === false) {
          e.preventDefault();
          return;
        }
      }
      router.push(href);
    }
  };

  if (user) {
    return (
      <button
        onClick={(e) => handleClick('/my-cards', e)}
        className="nav-link-mobile-clean"
        style={{
          color: '#f20e0e',
          fontFamily: 'var(--font-sans), sans-serif',
          fontSize: '1.25rem',
          fontWeight: 500,
          letterSpacing: 0,
          textTransform: 'uppercase',
          textAlign: 'center',
          width: '100%',
        }}
      >
        MY PASS
      </button>
    );
  }

  return (
    <button
      onClick={(e) => handleClick('/auth/login', e)}
      className="nav-link-mobile-clean"
      style={{
        color: '#f20e0e',
        fontFamily: 'var(--font-sans), sans-serif',
        fontSize: '1.25rem',
        fontWeight: 500,
        letterSpacing: 0,
        textTransform: 'uppercase',
        textAlign: 'center',
        width: '100%',
      }}
    >
      SIGN IN
    </button>
  );
}

function NotificationButtonMobile({ 
  shouldConfirmNavigation, 
  onNavigationClick,
  onMenuClose
}: { 
  shouldConfirmNavigation?: (href: string) => boolean;
  onNavigationClick?: (href: string, e: React.MouseEvent) => boolean | void;
  onMenuClose?: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (data.user) {
        setUser(data.user);
        // Load notification count
        supabase
          .from('cards')
          .select('id', { count: 'exact' })
          .or(`recipient_user_id.eq.${data.user.id},recipient_email.eq.${data.user.email}`)
          .in('status', ['pending'])
          .then(({ count }: any) => {
            setUnreadCount(count || 0);
          });
      }
    });
  }, []);

  if (!user) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Close mobile menu first
        if (onMenuClose) onMenuClose();
        // Small delay to ensure menu closes, then trigger notification panel
        setTimeout(() => {
          const notificationButton = document.querySelector('button[aria-label="Notifications"]') as HTMLElement;
          if (notificationButton) {
            notificationButton.click();
          }
        }, 100);
      }}
      className="nav-link-mobile-clean w-full text-left"
      style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span>NOTIFICATIONS</span>
      {unreadCount > 0 && (
        <span
          className="w-5 h-5 rounded-full bg-[#f20e0e] text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

function SignOutButtonMobile({ 
  shouldConfirmNavigation, 
  onNavigationClick 
}: { 
  shouldConfirmNavigation?: (href: string) => boolean;
  onNavigationClick?: (href: string, e: React.MouseEvent) => boolean | void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    const supabase = createClient();
    
    // Check if navigation should be confirmed before logout
    if (shouldConfirmNavigation && shouldConfirmNavigation('/')) {
      e.preventDefault();
      if (onNavigationClick) {
        const result = onNavigationClick('/', e);
        if (result === false) return;
      }
    } else if (onNavigationClick) {
      const result = onNavigationClick('/', e);
      if (result === false) {
        e.preventDefault();
        return;
      }
    }
    
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!user) return null;

  return (
    <button 
      onClick={handleLogout} 
      className="nav-link-mobile-clean"
      style={{
        color: '#f20e0e',
        fontFamily: 'var(--font-sans), sans-serif',
        fontSize: '1.25rem',
        fontWeight: 500,
        letterSpacing: 0,
        textTransform: 'uppercase',
        textAlign: 'center',
        width: '100%',
      }}
    >
      SIGN OUT
    </button>
  );
}
