'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required - redirect to login with message
        router.push('/auth/login?message=Please check your email to confirm your account before signing in.');
        router.refresh();
        return;
      }

      // Check for redirect parameter, default to /my-cards
      const redirectTo = searchParams.get('redirect') || '/my-cards';
      router.push(redirectTo);
      router.refresh();
    } catch (error: any) {
      // User-friendly error messages
      let friendlyMessage = error.message || 'Failed to sign up';
      
      if (error.message?.toLowerCase().includes('already registered')) {
        friendlyMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.message?.toLowerCase().includes('invalid email')) {
        friendlyMessage = 'Please enter a valid email address.';
      } else if (error.message?.toLowerCase().includes('weak password')) {
        friendlyMessage = 'Please choose a stronger password (at least 6 characters).';
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
              Sign Up
            </h1>
            <p className="regular_paragraph text-sm">
              Create your HeartPass account
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
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

            <div 
              className="y2k-window" 
              style={{ 
                borderWidth: focusedInput === 'confirmPassword' ? '2px' : '1px',
                borderStyle: 'solid',
                borderColor: focusedInput === 'confirmPassword' ? '#f20e0e' : '#e5e5e5',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: focusedInput === 'confirmPassword' ? '0 0 0 4px rgba(242, 14, 14, 0.08)' : 'none',
                padding: '12px 16px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Confirm Password"
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? (
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
              {isLoading ? 'Signing up...' : 'SIGN UP'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="regular_paragraph text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="underline">
                SIGN IN
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFEEF' }}><p className="regular_paragraph">Loading...</p></div>}>
      <SignupContent />
    </Suspense>
  );
}
