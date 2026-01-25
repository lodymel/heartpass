'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

interface AuthButtonProps {
  shouldConfirmNavigation?: (href: string) => boolean;
  onNavigationClick?: (href: string, e: React.MouseEvent) => boolean | void;
}

export default function AuthButton({ shouldConfirmNavigation, onNavigationClick }: AuthButtonProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const wasLoggedIn = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user as User | null);
      wasLoggedIn.current = !!data.user;
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = (session?.user as User | null) ?? null;
      
      // If user just signed out, trigger transition
      if (wasLoggedIn.current && !newUser) {
        setIsTransitioning(true);
        setTimeout(() => {
          setUser(newUser);
          setIsTransitioning(false);
        }, 200);
      } else {
        setUser(newUser);
      }
      
      wasLoggedIn.current = !!newUser;
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (isLoading) {
    return null;
  }

  const handleClick = (href: string, e: React.MouseEvent) => {
    // If already on My Pass page, scroll to top instead of navigating
    if (href === '/my-cards' && pathname === '/my-cards') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (shouldConfirmNavigation && shouldConfirmNavigation(href)) {
      e.preventDefault();
      if (onNavigationClick) {
        const result = onNavigationClick(href, e);
        if (result === false) {
          e.preventDefault();
        }
      }
    } else if (onNavigationClick) {
      const result = onNavigationClick(href, e);
      if (result === false) {
        e.preventDefault();
      }
    }
  };

  if (user || isTransitioning) {
    return (
      <Link 
        href="/my-cards" 
        className="nav-link"
        onClick={(e) => handleClick('/my-cards', e)}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateX(10px)' : 'translateX(0)',
          transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
          pointerEvents: isTransitioning ? 'none' : 'auto',
        }}
      >
        MY PASS
      </Link>
    );
  }

  return (
    <Link 
      href="/auth/login" 
      className="nav-link"
      onClick={(e) => handleClick('/auth/login', e)}
    >
      SIGN IN
    </Link>
  );
}
