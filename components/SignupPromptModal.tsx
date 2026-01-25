'use client';

import Link from 'next/link';

interface SignupPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignupPromptModal({
  isOpen,
  onClose,
}: SignupPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full mx-4"
        style={{
          background: '#FFFEEF',
          border: '1px solid #e5e5e5',
          padding: '40px 32px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          className="jenny-title text-3xl mb-4"
          style={{
            fontWeight: 300,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            color: '#f20e0e',
          }}
        >
          Save Your HeartPass
        </h2>

        {/* Message */}
        <p
          className="regular_paragraph mb-6"
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: '#666666',
            fontWeight: 400,
          }}
        >
          Create a free account to save and manage all your HeartPass cards in one place.
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-lg mt-0.5">💾</div>
            <div>
              <div className="regular_paragraph text-xs font-medium mb-1" style={{ color: '#f20e0e' }}>
                Your Card Collection
              </div>
              <div className="regular_paragraph text-xs" style={{ color: '#666666', fontWeight: 300 }}>
                Access all your HeartPasses anytime
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-lg mt-0.5">✏️</div>
            <div>
              <div className="regular_paragraph text-xs font-medium mb-1" style={{ color: '#f20e0e' }}>
                Edit & Update
              </div>
              <div className="regular_paragraph text-xs" style={{ color: '#666666', fontWeight: 300 }}>
                Modify your cards anytime
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-lg mt-0.5">📊</div>
            <div>
              <div className="regular_paragraph text-xs font-medium mb-1" style={{ color: '#f20e0e' }}>
                Track Usage
              </div>
              <div className="regular_paragraph text-xs" style={{ color: '#666666', fontWeight: 300 }}>
                See which cards you've used
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="y2k-button bg-white flex-1"
              style={{ color: '#f20e0e' }}
            >
              Maybe Later
            </button>
            <Link
              href="/auth/signup"
              className="y2k-button flex-1 text-center"
              onClick={onClose}
            >
              Sign Up Free
            </Link>
          </div>
          
          {/* Sign In option for existing users */}
          <div className="text-center pt-2">
            <span className="regular_paragraph text-xs" style={{ color: '#999' }}>
              Already have an account?{' '}
            </span>
            <Link
              href="/auth/login"
              className="regular_paragraph text-xs font-medium"
              style={{ color: '#f20e0e', textDecoration: 'underline' }}
              onClick={onClose}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
