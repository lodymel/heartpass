'use client';

import { useState, useRef, useEffect } from 'react';

type View = 'faq' | 'faq-detail' | 'inquiry' | 'inquiry-success';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    id: 'what',
    question: 'What is HeartPass?',
    answer: 'HeartPass is a personalized pass platform where you can create action-based digital passes for soulmates, family, partners, or friends. Design a boarding pass and gift someone a sky full of love, LOLs, and tiny surprises! 💝',
  },
  {
    id: 'create',
    question: 'How do I create a HeartPass?',
    answer: 'Click "BOARDING NOW" in the navigation or "CREATE A HEARTPASS" on the homepage. Then follow the steps: enter who the HeartPass is from, who it\'s for, select a gift, and write your message. In the "Your message" step, you can use the AI button to generate a personalized message! Your ticket will be ready!',
  },
  {
    id: 'send',
    question: 'How do I send a HeartPass?',
    answer: 'After creating your HeartPass, you can save it to My Pass (if logged in) or send it directly via email. Saved HeartPasses can be sent later from My Pass.',
  },
  {
    id: 'accept-use',
    question: 'How do I accept and use a HeartPass?',
    answer: 'When you receive a HeartPass via email or see it in your Received tab, click "Accept" to confirm. Once accepted, you can mark it as "Used" when you actually redeem the pass. Only the recipient can mark a pass as used.',
  },
  {
    id: 'delete-expire',
    question: 'Can I delete a HeartPass? Do they expire?',
    answer: "Yes, you can delete passes you created. However, if you've already sent it to someone, they will still be able to see it (marked as cancelled). Be thoughtful! 💝 By default, HeartPasses are valid for a lifetime! But you can set a specific expiration date when creating a pass. Expired passes will be automatically marked and cannot be used.",
  },
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [view, setView] = useState<View>('faq');
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) contentRef.current.scrollTop = 0;
  }, [isOpen, view, selectedFaq]);

  const handleOpen = () => {
    if (!isOpen) {
      setView('faq');
      setSelectedFaq(null);
      setIsAnimating(true);
      setIsOpen(true);
      // Start animation on next frame (to allow CSS transition to apply)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(false);
        });
      });
    }
  };

  const handleClose = () => {
    if (!isOpen) return;
    // Set isOpen to false first to change icon immediately
    setIsOpen(false);
    setIsAnimating(true);
    // Match animation duration exactly (350ms)
    // Scale down smoothly while closing
    setTimeout(() => {
      setIsAnimating(false);
    }, 350);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const openFaq = (faq: FaqItem) => {
    setSelectedFaq(faq);
    setView('faq-detail');
  };

  const backToFaq = () => {
    setSelectedFaq(null);
    setView('faq');
  };

  const openInquiry = () => {
    setFormError('');
    setEmail('');
    setMessage('');
    setView('inquiry');
  };

  const backFromInquiry = () => {
    setFormError('');
    setView('faq');
  };

  const handleSubmitInquiry = async () => {
    setFormError('');
    const e = email.trim();
    const m = message.trim();
    if (!e) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!m) {
      setFormError('Please enter your message.');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, message: m }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to send your inquiry. Please try again in a moment.');
        return;
      }
      setView('inquiry-success');
    } catch {
      setFormError('Failed to send your inquiry. Please try again in a moment.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className="fixed bottom-5 right-6 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f20e0e] text-white flex items-center justify-center nav-button-primary-chat"
        style={{ 
          cursor: 'pointer', 
          boxShadow: '0 4px 12px rgba(242, 14, 14, 0.2)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), rotate 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          position: 'fixed',
          overflow: 'hidden',
          rotate: isOpen ? '180deg' : '0deg',
          zIndex: 1005,
        }}
        aria-label="Open HeartPass Help"
      >
        <div style={{
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          opacity: !isOpen ? 1 : 0,
          transform: !isOpen ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-90deg)',
          position: 'absolute',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div style={{
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(90deg)',
          position: 'absolute',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
      </button>

      {(isOpen || isAnimating) && (
        <>
          <div 
            role="presentation" 
            className="fixed inset-0 cursor-pointer"
            style={{ 
              background: 'rgba(242, 14, 14, 0.08)',
              zIndex: 1003,
              opacity: isOpen && !isAnimating ? 1 : (isAnimating && !isOpen ? 0 : 0),
              transition: isAnimating 
                ? 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                : (isOpen ? 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'),
            }}
            onClick={handleClose} 
          />

          <div
            ref={chatWindowRef}
            className="chat-window fixed right-4 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[400px] md:h-[500px] max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-8rem)] bg-white border border-[#e5e5e5] flex flex-col"
            style={{ 
              background: '#ffffff', 
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              zIndex: 1004,
              // mobile: bottom-5 (1.25rem) + button height (3rem) + gap (1rem) = 5.25rem
              bottom: 'calc(1.25rem + 3rem + 1rem)',
              opacity: isOpen && !isAnimating ? 1 : 0,
              transform: isOpen && !isAnimating 
                ? 'translateY(0) scale(1) translateZ(0)'
                : 'translateY(20px) scale(0.75) translateZ(0)',
              transformOrigin: 'bottom right',
              transition: isAnimating
                ? (isOpen 
                    ? 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                    : 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)')
                : (isOpen ? 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'),
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-center shrink-0" style={{ background: '#f20e0e' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <img 
                    src="/heart.svg" 
                    alt="HeartPass" 
                    style={{ 
                      width: '20px', 
                      height: '20px',
                      display: 'block',
                    }} 
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase text-white" style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>
                    HEARTPASS SUPPORT
                  </h3>
                </div>
              </div>
            </div>

            {/* Content */}
            <div ref={contentRef} className="flex-1 overflow-y-auto p-4" style={{ background: '#FFFEEF' }}>
              {/* FAQ List */}
              {view === 'faq' && (
                <div className="space-y-3">
                  <p className="text-sm text-[#333] mb-4" style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
                    Hi! What would you like to know? ✨
                  </p>
                  {FAQ_LIST.map((faq) => (
                    <button
                      key={faq.id}
                      type="button"
                      onClick={() => openFaq(faq)}
                      className="w-full text-left px-4 py-3 border border-[#e5e5e5] bg-white md:hover:border-[#f20e0e] md:hover:bg-[#fff9f9] active:bg-[#fff9f9] transition-colors"
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: '#333', borderRadius: 0 }}
                    >
                      {faq.question}
                    </button>
                  ))}
                  <div className="pt-4 mt-4 border-t border-[#e5e5e5]">
                    <p className="text-xs text-[#666] mb-3" style={{ fontFamily: 'var(--font-sans)' }}>
                      Can't find what you need?
                    </p>
                    <button
                      type="button"
                      onClick={openInquiry}
                      className="nav-button-primary w-full"
                      style={{ 
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1rem',
                        fontWeight: 500,
                        letterSpacing: 0,
                        textTransform: 'uppercase',
                        color: '#FFFEEF',
                        background: '#f20e0e',
                        border: 'none',
                        padding: '10px 20px',
                        boxShadow: '0 4px 12px rgba(242, 14, 14, 0.2)',
                        borderRadius: 0,
                      }}
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              )}

              {/* FAQ Answer */}
              {view === 'faq-detail' && selectedFaq && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={backToFaq}
                    className="text-[#f20e0e] text-sm md:hover:underline flex items-center gap-1"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    ← Back to FAQs
                  </button>
                  <h4 className="font-medium text-[#333]" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem' }}>
                    {selectedFaq.question}
                  </h4>
                  <p className="text-sm text-[#555] whitespace-pre-wrap" style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.7 }}>
                    {selectedFaq.answer}
                  </p>
                </div>
              )}

              {/* Inquiry Form */}
              {view === 'inquiry' && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={backFromInquiry}
                    className="text-[#f20e0e] text-sm md:hover:underline flex items-center gap-1"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    ← Back to list
                  </button>
                  <p className="text-sm text-[#555]" style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
                    Send us an email. We'll reply within 1–2 business days. 🎀
                  </p>
                  <div>
                    <label className="block text-xs text-[#666] mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
                      Your email <span className="text-[#f20e0e]">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 border border-[#e5e5e5] focus:outline-none focus:border-[#f20e0e] transition-colors"
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', background: '#fff', borderRadius: 0 }}
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-[#666] mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
                      Message <span className="text-[#f20e0e]">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); setFormError(''); }}
                      placeholder="Type your message here"
                      rows={5}
                      className="w-full px-4 py-3 border border-[#e5e5e5] focus:outline-none focus:border-[#f20e0e] transition-colors resize-none"
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', background: '#fff', borderRadius: 0 }}
                    />
                  </div>
                  {formError && (
                    <p className="text-sm text-[#f20e0e]" style={{ fontFamily: 'var(--font-sans)' }}>
                      {formError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmitInquiry}
                    disabled={isSending}
                    className="nav-button-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ 
                      fontFamily: 'var(--font-sans)',
                      fontSize: '1rem',
                      fontWeight: 500,
                      letterSpacing: 0,
                      textTransform: 'uppercase',
                      color: '#FFFEEF',
                      background: '#f20e0e',
                      border: 'none',
                      padding: '10px 20px',
                      boxShadow: '0 4px 12px rgba(242, 14, 14, 0.2)',
                      borderRadius: 0,
                    }}
                  >
                    {isSending ? 'Sending...' : 'Send inquiry'}
                  </button>
                </div>
              )}

              {/* Inquiry Submitted */}
              {view === 'inquiry-success' && (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <span className="text-3xl block mb-3">💝</span>
                    <h4 className="font-medium text-[#333] mb-2" style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem' }}>
                      Inquiry received
                    </h4>
                    <p className="text-sm text-[#555]" style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
                      We've received your message. We'll reply to your email within 1–2 business days. Please wait just a moment! 💝
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={backToFaq}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] bg-white md:hover:bg-[#f9f9f9] active:bg-[#f9f9f9] transition-colors text-[#333] text-sm"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    ← Back to list
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
