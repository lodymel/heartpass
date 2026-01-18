'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const supabase = createClient();

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
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

  return (
    <div>
      {user ? (
        <button onClick={handleLogout}>Sign Out</button>
      ) : (
        <Link href="/auth/login" onClick={(e) => handleClick('/auth/login', e)}>
          Sign In
        </Link>
      )}
    </div>
  );
}
