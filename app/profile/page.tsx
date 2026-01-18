'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      setIsLoading(false);
    };

    loadProfile();
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
      {/* Top Navigation */}
      <Navigation />

      <div className="relative z-10 container mx-auto px-0 w-full pt-48 md:pt-56">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <h1 className="jenny-title text-5xl md:text-6xl mb-4" style={{
              fontWeight: 300,
              letterSpacing: '-0.025em',
              lineHeight: 1
            }}>
              Profile
            </h1>
            <p className="regular_paragraph text-sm">
              Your account information and settings
            </p>
          </div>

          {/* Profile Card */}
          <div className="y2k-window p-6 mb-6">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full bg-[#f20e0e] flex items-center justify-center text-white text-2xl mb-4">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="jenny-heading text-2xl mb-1" style={{ fontWeight: 300, letterSpacing: '-0.025em' }}>
                {user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="regular_paragraph text-sm">{user?.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block regular_paragraph text-xs mb-2">Email</label>
                <div className="px-4 py-2 bg-[#f5f5f5] text-sm">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="block regular_paragraph text-xs mb-2">User ID</label>
                <div className="px-4 py-2 bg-[#f5f5f5] text-sm font-mono text-xs">
                  {user?.id}
                </div>
              </div>

              <div>
                <label className="block regular_paragraph text-xs mb-2">Member Since</label>
                <div className="px-4 py-2 bg-[#f5f5f5] text-sm">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push('/');
                router.refresh();
              }}
              className="w-full px-4 py-3 y2k-window hover:border-[#f20e0e] transition-colors regular_paragraph text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
