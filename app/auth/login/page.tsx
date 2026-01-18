'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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

      router.push('/my-cards');
      router.refresh();
    } catch (error: any) {
      // Convert technical error messages to user-friendly ones
      let friendlyMessage = error.message || 'Failed to sign in';
      
      if (error.message?.toLowerCase().includes('email not confirmed') || 
          error.message?.toLowerCase().includes('email_not_confirmed')) {
        friendlyMessage = 'Please check your email inbox and click the confirmation link we sent you. Once confirmed, you can sign in!';
      } else if (error.message?.toLowerCase().includes('invalid') || 
                 error.message?.toLowerCase().includes('credentials')) {
        friendlyMessage = 'Invalid email or password. Please check and try again.';
      } else if (error.message?.toLowerCase().includes('user not found')) {
        friendlyMessage = 'No account found with this email. Please sign up first.';
      } else if (error.message?.toLowerCase().includes('too many')) {
        friendlyMessage = 'Too many sign in attempts. Please wait a moment and try again.';
      }
      
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center" style={{ background: '#FFFEEF' }}>
      {/* Top Navigation */}
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
            <Link 
              href="/" 
              className="nav-logo"
              style={{
                position: 'relative',
                zIndex: 100,
                color: '#f20e0e',
                display: 'block',
              }}
            >
              <span className="jenny-title text-2xl md:text-3xl" style={{
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
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-none" style={{
                fontFamily: 'var(--font-sans), sans-serif',
                lineHeight: '1.6',
                letterSpacing: '-0.01em',
                textTransform: 'none',
              }}>
                {error}
              </div>
            )}

            <div 
              className="y2k-window" 
              style={{ 
                borderWidth: focusedInput === 'email' ? '2px' : '1px',
                borderStyle: 'solid',
                borderColor: focusedInput === 'email' ? '#f20e0e' : '#e5e5e5',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: focusedInput === 'email' ? '0 0 0 4px rgba(242, 14, 14, 0.08)' : 'none',
                padding: '12px 16px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Email"
                required
                className="y2k-input w-full"
                style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  height: '24px',
                  padding: 0,
                  margin: 0,
                  border: 'none',
                  outline: 'none',
                }}
              />
            </div>

            <div 
              className="y2k-window" 
              style={{ 
                borderWidth: focusedInput === 'password' ? '2px' : '1px',
                borderStyle: 'solid',
                borderColor: focusedInput === 'password' ? '#f20e0e' : '#e5e5e5',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: focusedInput === 'password' ? '0 0 0 4px rgba(242, 14, 14, 0.08)' : 'none',
                padding: '12px 16px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Password"
                required
                className="y2k-input w-full"
                style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  height: '24px',
                  padding: 0,
                  paddingRight: '40px',
                  margin: 0,
                  border: 'none',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999999',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#666666';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#999999';
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="y2k-button w-full text-base"
              style={{
                height: '48px',
                padding: '0 24px',
              }}
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
