'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const redirectUrl = searchParams.get('redirect');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to original destination or home
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="max-w-md mx-auto">
          <div className="mb-12 text-center">
            <h1 className="jenny-title text-5xl md:text-6xl mb-4" style={{
              fontWeight: 300,
              letterSpacing: '-0.025em',
              lineHeight: 1
            }}>
              Sign In
            </h1>
            <p className="regular_paragraph text-sm">
              Welcome back to HeartPass
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="y2k-input w-full text-base"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="y2k-input w-full text-base"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="y2k-button w-full text-base"
            >
              {isLoading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="regular_paragraph text-sm">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="underline">
                SIGN UP
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
