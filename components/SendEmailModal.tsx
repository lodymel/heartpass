'use client';

import { useState } from 'react';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => Promise<void>;
  recipientName?: string;
}

export default function SendEmailModal({ isOpen, onClose, onSend, recipientName }: SendEmailModalProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('please enter a valid email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('please enter a valid email address');
      return;
    }

    // Confirm before sending
    const confirmed = window.confirm(
      `Send this HeartPass to ${email}?\n\nPlease verify the email address. The recipient will need to sign up with this email to view the pass.`
    );

    if (!confirmed) {
      return;
    }

    setIsSending(true);
    try {
      await onSend(email);
      setEmail('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'failed to send card');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Backdrop - full screen overlay (including Navigation) */}
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(242, 14, 14, 0.1)',
          backdropFilter: 'blur(4px)',
          zIndex: 1003,
        }}
      />
      {/* Modal Panel - displayed above Backdrop */}
      <div 
        className="fixed inset-0 flex items-center justify-center pointer-events-none" 
        style={{
          zIndex: 1004,
        }}
      >
        <div 
          className="relative max-w-md w-full mx-4 pointer-events-auto" 
          onClick={(e) => e.stopPropagation()}
          style={{ 
            background: '#FFFEEF',
            border: '1px solid #e5e5e5',
            padding: '40px 32px',
          }}
        >
        <h2 
          className="jenny-title text-3xl mb-4"
          style={{
            fontWeight: 300,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            color: '#f20e0e',
          }}
        >
          Send Pass to {recipientName || 'Recipient'}
        </h2>
        <p 
          className="regular_paragraph mb-8"
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: '#666666',
            fontWeight: 400,
            textTransform: 'none',
          }}
        >
          Enter the recipient's email address. They'll be able to view and accept this pass.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@example.com"
              required
              className="y2k-window w-full px-4 py-3"
              style={{ 
                border: '1px solid #e5e5e5',
                height: '48px',
              }}
            />
          </div>
          
          {error && (
            <p className="text-sm text-[#f20e0e]" style={{ textTransform: 'none' }}>{error}</p>
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="y2k-button flex-1 bg-white"
              style={{
                border: '1px solid #e5e5e5',
                color: '#f20e0e',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="y2k-button flex-1"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}
