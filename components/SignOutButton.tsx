'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

export default function SignOutButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial user
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user);
    });

    // Listen for auth changes to handle sign out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user && user) {
        // User just signed out - keep component visible briefly for smooth transition
        setIsSigningOut(true);
      }
      setUser(session?.user as User | null ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // Small delay before navigation for smooth visual transition
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 150);
  };

  // Only show if user is logged in (or signing out for smooth transition)
  if (!user && !isSigningOut) return null;

  return (
    <button
      onClick={handleLogout}
      className="nav-link"
      disabled={isSigningOut}
      style={{
        opacity: isSigningOut ? 0 : 1,
        transform: isSigningOut ? 'translateX(10px)' : 'translateX(0)',
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
        pointerEvents: isSigningOut ? 'none' : 'auto',
      }}
    >
      {isSigningOut ? 'SIGNING OUT...' : 'SIGN OUT'}
    </button>
  );
}
