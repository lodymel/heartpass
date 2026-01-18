'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Footer from '@/components/Footer';

export default function SentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
          setUser(user);
        } else {
          // If no user, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{ background: '#FFFEEF' }}>
        <p className="regular_paragraph">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen relative flex items-center" style={{ background: '#FFFEEF' }}>
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'transparent' }}>
        <div className="container mx-auto px-0">
          <div className="flex items-center justify-between h-20 md:h-24 py-5">
            <Link href="/" className="nav-logo">
              <span className="jenny-title text-2xl md:text-3xl" style={{
                fontWeight: 300,
                letterSpacing: '-0.025em',
                lineHeight: 1,
                whiteSpace: 'nowrap'
              }}>
                HeartPass
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-0 w-full">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="text-4xl md:text-5xl mb-4" style={{ lineHeight: 1 }}>
              ❤️
            </div>
            <h1 className="jenny-title text-5xl md:text-6xl mb-5" style={{
              fontWeight: 300,
              letterSpacing: '-0.025em',
              lineHeight: 1
            }}>
              Welcome
            </h1>
          </div>
          <p className="regular_paragraph text-sm mb-8">
            Your heart journey begins here. Let's create special moments together!
          </p>
          <Link 
            href="/" 
            className="y2k-button inline-flex items-center justify-center text-base"
            style={{
              height: '48px',
              padding: '0 24px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            GO HOME
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}