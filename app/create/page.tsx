'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { MoodType, User, CardFromDB } from '@/types';
import { coupons } from '@/data/coupons';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import ConfirmModal from '@/components/ConfirmModal';
import AlertModal from '@/components/AlertModal';
import Footer from '@/components/Footer';

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCardId = searchParams.get('edit'); // Get edit card ID from URL
  const [step, setStep] = useState(1);
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [couponType, setCouponType] = useState('');
  const [message, setMessage] = useState('');
  const [mood, setMood] = useState<MoodType>('heartfelt'); // Default mood
  const [usageCondition] = useState('ONE USE');
  const [validityType, setValidityType] = useState<'lifetime' | 'date'>('lifetime');
  const [validityDate, setValidityDate] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false); // Track if editing existing card
  const [isLoadingCard, setIsLoadingCard] = useState(false); // Track card loading state
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false); // Track message generation
  const [isNavigating, setIsNavigating] = useState(false); // Prevent duplicate navigation
  const [isSaving, setIsSaving] = useState(false); // Track save operation
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [pendingYear, setPendingYear] = useState<number | null>(null);
  const [pendingMonth, setPendingMonth] = useState<number | null>(null);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; redirectTo?: string }>({
    isOpen: false,
    title: '',
    message: '',
    redirectTo: undefined,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const MAX_MESSAGE_LENGTH = 200;

  // Helper function to parse date string as local date (avoid timezone issues)
  const parseLocalDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper function to format date as YYYY-MM-DD (local date, no timezone conversion)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate minimum date (today + 7 days)
  const getMinDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    return formatLocalDate(minDate);
  };

  // Check if user has started creating a card
  const hasProgress = () => {
    return step > 1 || senderName || recipientName || couponType || message;
  };

  // Handle navigation with confirmation
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (hasProgress()) {
      e.preventDefault();
      setPendingNavigation(href);
      setShowConfirmModal(true);
    }
    // No progress, allow navigation
  };

  const handleConfirmLeave = () => {
    if (pendingNavigation) {
      window.location.href = pendingNavigation;
    }
    if (pendingAction) {
      pendingAction();
    }
    setShowConfirmModal(false);
    setPendingNavigation(null);
    setPendingAction(null);
  };

  const handleCancelLeave = () => {
    setShowConfirmModal(false);
    setPendingNavigation(null);
    setPendingAction(null);
  };

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
        setUser(user);
      }).catch(() => {
        // Ignore auth errors if Supabase is not configured
      });
    } catch (error) {
      // Ignore errors if Supabase is not configured
    }
  }, []);

  // Load existing card data when editing
  useEffect(() => {
    if (!editCardId || !user || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const loadCardForEdit = async () => {
      setIsLoadingCard(true);
      try {
        const supabase = createClient();
        const { data: card, error } = await supabase
          .from('cards')
          .select('*')
          .eq('id', editCardId)
          .eq('user_id', user.id) // Only allow editing own cards
          .single();

        if (error || !card) {
          console.error('Failed to load card for edit:', error);
          setAlertModal({
            isOpen: true,
            title: 'Cannot edit pass',
            message: 'this pass cannot be edited. it may have been sent or does not belong to you.',
            redirectTo: '/my-cards',
          });
          return;
        }

        // Only allow editing passes that haven't been sent (no recipient_email)
        if (card.recipient_email || card.status === 'pending' || card.status === 'accepted' || card.status === 'used') {
          setAlertModal({
            isOpen: true,
            title: 'Cannot edit pass',
            message: 'this pass has already been sent and cannot be edited. you can only edit unsent passes.',
            redirectTo: '/my-cards',
          });
          return;
        }

        // Load card data into form
        setSenderName(card.sender_name || '');
        setRecipientName(card.recipient_name || '');
        setCouponType(card.coupon_type || '');
        setMessage(card.message || '');
        setMood((card.mood as MoodType) || 'heartfelt');
        setValidityType(card.validity_type === 'date' ? 'date' : 'lifetime');
        if (card.validity_date) {
          setValidityDate(card.validity_date);
        }
        setIsEditing(true);
      } catch (error) {
        console.error('Error loading card:', error);
        setAlertModal({
          isOpen: true,
          title: 'Error',
          message: 'failed to load pass for editing.',
          redirectTo: '/my-cards',
        });
      } finally {
        setIsLoadingCard(false);
      }
    };

    loadCardForEdit();
  }, [editCardId, user]);


  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Handle Enter key to proceed to next step (Step 3: Which gift?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Enter key on step 3 (Which gift?) when a coupon is selected
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && step === 3 && couponType) {
        // Don't trigger if user is typing in an input field
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleContinue();
        }
      }
    };

    if (step === 3) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [step, couponType]);


  const moods = [
    { id: 'cute', label: 'Cute', emoji: '😊' },
    { id: 'fun', label: 'Fun', emoji: '😄' },
    { id: 'heartfelt', label: 'Heartfelt', emoji: '💝' },
    { id: 'event', label: 'Event', emoji: '🎉' },
  ];

  // Generate message using templates
  const handleGenerateMessage = async () => {
    if (!couponType) {
      return;
    }

    setIsGeneratingMessage(true);
    try {
      const response = await fetch('/api/ai-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponType,
          mood,
          recipientName,
          senderName,
        }),
      });

      const data = await response.json();
      if (data.message) {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Failed to generate message:', error);
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
      // Scroll to top when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const cardData = {
        recipientType: 'loved-one',
        couponType,
        mood: mood,
        recipientName,
        senderName,
        usageCondition,
        message,
        validityType,
        validityDate: validityType === 'date' ? validityDate : undefined,
      };

      // If user is logged in, save to database
      if (user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setIsSaving(true);
        try {
          const supabase = createClient();
          
          // Use the current user from auth.getUser() for safety
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          const actualUserId = currentUser?.id || user.id;
          const senderEmail = currentUser?.email || user.email; // Get sender email from login
          
          if (!actualUserId) {
            throw new Error('User ID is missing. Please log in again.');
          }
          
          // Ensure message is not empty (use default if empty)
          const finalMessage = cardData.message?.trim() || 'Let\'s create special moments together! 💝';
          
          const insertData: Partial<CardFromDB> = {
            user_id: actualUserId, // Use verified user ID
            sender_email: senderEmail, // Automatically store sender's email from login
            recipient_type: cardData.recipientType,
            coupon_type: cardData.couponType,
            mood: cardData.mood,
            recipient_name: cardData.recipientName,
            sender_name: cardData.senderName,
            usage_condition: cardData.usageCondition,
            message: finalMessage, // Use default message if empty
            validity_type: cardData.validityType,
            validity_date: cardData.validityDate || null,
            issue_date: (() => {
              // Use local date (avoid timezone conversion)
              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, '0');
              const day = String(now.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            })(), // Set issue date to today
            status: 'active', // Set status to active when created
          };

          // If email is provided, set recipient_email and status to pending
          if (recipientEmail && recipientEmail.includes('@')) {
            insertData.recipient_email = recipientEmail;
            insertData.status = 'pending'; // Set as pending when sent
          }

          let data, error;
          
          if (isEditing && editCardId) {
            // Update existing card
            const { data: updateData, error: updateError } = await supabase
              .from('cards')
              .update(insertData)
              .eq('id', editCardId)
              .eq('user_id', actualUserId) // Ensure user can only update own cards
              .select()
              .single();
            
            data = updateData;
            error = updateError;
            
            if (error) {
              console.error('❌ Failed to update card:', error);
            }
          } else {
            // Insert new card
            const { data: insertDataResult, error: insertError } = await supabase
              .from('cards')
              .insert(insertData)
              .select()
              .single();
            
            data = insertDataResult;
            error = insertError;
            
            if (error) {
              console.error('❌ Failed to save card:', error);
            }
          }

          if (error) {
            // Log technical details for debugging (only visible in console)
            console.error('Save error:', error);
            
            // Determine user-friendly message based on error type
            let friendlyMessage = 'Something went wrong while saving your HeartPass.';
            
            if (error.code === '23505' || error.message?.includes('duplicate')) {
              friendlyMessage = 'This pass already exists. Please try creating a new one.';
            } else if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
              friendlyMessage = 'You don\'t have permission to perform this action. Please try signing out and back in.';
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
              friendlyMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message?.includes('timeout')) {
              friendlyMessage = 'The request took too long. Please try again.';
            }
            
            setAlertModal({
              isOpen: true,
              title: isEditing ? 'Update failed' : 'Save failed',
              message: `${friendlyMessage}\n\nPlease try again. If the problem persists, try refreshing the page.`,
              redirectTo: undefined,
            });
            setIsSaving(false);
            return;
          }
          
          // If email is provided, send email notification
          if (recipientEmail && recipientEmail.includes('@')) {
            try {
              const emailResponse = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: recipientEmail,
                  recipientName: recipientName,
                  senderName: senderName,
                  cardId: data.id,
                  couponType: couponType,
                  message: message || 'Let\'s create special moments together! 💝',
                }),
              });

              const emailResult = await emailResponse.json();

              if (emailResponse.ok && emailResult.success) {
                setAlertModal({
                  isOpen: true,
                  title: 'Pass sent! ✉️',
                  message: `Your HeartPass has been sent to ${recipientEmail}.\n\nThe recipient can click the link in the email and sign up to view their pass.`,
                  redirectTo: '/my-cards',
                });
              } else {
                // Email failed but card is saved
                console.error('❌ Email send failed:', emailResult);
                const errorMsg = emailResult.error || 'Unknown error';
                const isApiKeyError = errorMsg.includes('API_KEY') || errorMsg.includes('not configured') || errorMsg.includes('Email service not configured');
                const isDomainError = errorMsg.includes('verify a domain') || errorMsg.includes('testing emails to your own email');
                
                setAlertModal({
                  isOpen: true,
                  title: 'Pass saved ⚠️',
                  message: isApiKeyError 
                    ? `Your HeartPass has been saved.\n\n⚠️ Email sending failed: RESEND_API_KEY is not configured.\n\nPlease add RESEND_API_KEY to your .env.local file and restart the server.`
                    : isDomainError
                    ? `Your HeartPass has been saved.\n\n⚠️ Resend free tier limitation:\n\nYou can only send test emails to your own email address for now.\n\n💡 To send to other recipients:\n1. Verify your domain in Resend Dashboard → Domains\n2. Then you can send to any email address\n\n✅ Your pass is saved! You can resend it after domain verification.`
                    : `Your HeartPass has been saved.\n\nEmail sending failed: ${errorMsg}\n\nYou can resend it from the card page later.`,
                  redirectTo: '/my-cards',
                });
              }
            } catch (emailError: any) {
              // Email failed but card is saved
              console.error('❌ Email send error (catch):', emailError);
              console.error('Error details:', {
                message: emailError.message,
                stack: emailError.stack,
                name: emailError.name
              });
              
              const isNetworkError = emailError.message?.includes('fetch') || emailError.message?.includes('network');
              
              setAlertModal({
                isOpen: true,
                title: 'Pass saved ⚠️',
                message: isNetworkError
                  ? `Your HeartPass has been saved.\n\nA network error occurred while sending the email.\n\nPossible causes:\n- Internet connection issue\n- Server error\n\nYou can resend it from the card page later.`
                  : `Your HeartPass has been saved.\n\nAn error occurred while sending the email: ${emailError.message || 'Unknown error'}\n\nPossible causes:\n- RESEND_API_KEY not configured\n- Network error\n\nYou can resend it from the card page later.`,
                redirectTo: '/my-cards',
              });
            }
          } else {
            // No email provided - redirect to card page so user can see the ticket immediately
            // This also allows non-logged-in users to view the ticket
            router.push(`/card?id=${data.id}`);
          }
          setIsSaving(false);
          return;
        } catch (error) {
          console.error('Failed to save card:', error);
          setIsSaving(false);
          setAlertModal({
            isOpen: true,
            title: 'Save failed',
            message: 'Failed to save your HeartPass. Please try again.',
          });
          // Fallback to URL params if save fails
        }
      }

      // Fallback: For non-logged-in users, save to sessionStorage and redirect
      // This allows data to persist through the login flow
      const cardDataWithEmail = {
        ...cardData,
        message: cardData.message || '',
        recipientEmail: recipientEmail || '',
      };
      
      // Save to sessionStorage for recovery after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingHeartPass', JSON.stringify(cardDataWithEmail));
      }
      
      const params = new URLSearchParams({
        ...cardData,
        message: cardData.message || '',
      } as any);
      router.push(`/card?${params.toString()}`);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleContinue = () => {
    // Prevent duplicate calls
    if (isNavigating) return;
    
    if (step === 1 && senderName.trim()) {
      setIsNavigating(true);
      handleNext();
      setTimeout(() => setIsNavigating(false), 100);
    } else if (step === 2 && recipientName.trim()) {
      setIsNavigating(true);
      handleNext();
      setTimeout(() => setIsNavigating(false), 100);
    } else if (step === 3 && couponType) {
      setIsNavigating(true);
      handleNext();
      setTimeout(() => setIsNavigating(false), 100);
    } else if (step === 4) {
      // Validate validity date if date type is selected
      if (validityType === 'date' && !validityDate) {
        setAlertModal({
          isOpen: true,
          title: 'Date Required',
          message: 'Please select a validity date or choose LIFETIME',
        });
        return;
      }
      setIsNavigating(true);
      handleNext();
      setTimeout(() => setIsNavigating(false), 100);
    } else if (step === 5) {
      // Step 5: Email is optional, but if provided, validate it
      if (recipientEmail && !recipientEmail.includes('@')) {
        setAlertModal({
          isOpen: true,
          title: 'Invalid Email',
          message: 'please enter a valid email address or leave it empty to skip.',
        });
        return;
      }
      setIsNavigating(true);
      handleNext();
      setTimeout(() => setIsNavigating(false), 100);
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#FFFEEF' }}>
      {/* Top Navigation - Using Navigation component with progress check */}
      <Navigation
        shouldConfirmNavigation={(href) => {
          // Check if user has progress and is trying to navigate away
          return !!hasProgress();
        }}
        onNavigationClick={(href, e) => {
          // Show confirm modal if there's progress
          if (hasProgress()) {
            e.preventDefault();
            setPendingNavigation(href);
            setShowConfirmModal(true);
            return false; // Prevent navigation
          }
          // Allow navigation if no progress
          return true;
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 md:px-12 py-12 pt-32">
        <div className="w-full max-w-2xl">
          {/* Progress Bar - Always visible at top */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className="flex-1 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    background: s <= step ? '#f20e0e' : '#e5e5e5',
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs" style={{ fontFamily: 'var(--font-sans)', color: '#999' }}>
              <span className={step >= 1 ? 'text-[#f20e0e]' : ''}>Step {step}/5</span>
            </div>
          </div>

          {/* Step 1: FROM */}
          {step === 1 && (
            <div className="space-y-12">
              <div>
                <div
                  className="regular_paragraph text-[10px] mb-3"
                  style={{
                    color: 'transparent',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    height: '16px',
                  }}
                >
                  &nbsp;
                </div>
                <h1 className="jenny-title text-6xl md:text-7xl mb-4" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1
                }}>
                  Who is this HeartPass from?
                </h1>
              </div>

              <div 
                className="y2k-window" 
                style={{ 
                  borderWidth: focusedInput === 'sender' ? '2px' : '1px',
                  borderStyle: 'solid',
                  borderColor: focusedInput === 'sender' ? '#f20e0e' : '#e5e5e5',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: focusedInput === 'sender' ? '0 0 0 4px rgba(242, 14, 14, 0.08)' : 'none',
                  padding: '20px 24px',
                }}
              >
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && senderName.trim()) {
                      e.preventDefault();
                      handleContinue();
                    }
                  }}
                  onFocus={() => setFocusedInput('sender')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Your name"
                  autoFocus
                  className="y2k-input w-full"
                />
              </div>

              <button
                onClick={handleContinue}
                disabled={!senderName.trim()}
                className="y2k-button w-full text-base"
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* Step 2: TO */}
          {step === 2 && (
            <div className="space-y-12">
              <div>
                <div
                  className="regular_paragraph text-[10px] mb-3"
                  style={{
                    color: 'transparent',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    height: '16px',
                  }}
                >
                  &nbsp;
                </div>
                <h1 className="jenny-title text-6xl md:text-7xl mb-4" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1
                }}>
                  Who is this HeartPass for?
                </h1>
              </div>

              <div 
                className="y2k-window" 
                style={{ 
                  borderWidth: focusedInput === 'recipient' ? '2px' : '1px',
                  borderStyle: 'solid',
                  borderColor: focusedInput === 'recipient' ? '#f20e0e' : '#e5e5e5',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: focusedInput === 'recipient' ? '0 0 0 4px rgba(242, 14, 14, 0.08)' : 'none',
                  padding: '20px 24px',
                }}
              >
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && recipientName.trim()) {
                      e.preventDefault();
                      handleContinue();
                    }
                  }}
                  onFocus={() => setFocusedInput('recipient')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Their name"
                  autoFocus
                  className="y2k-input w-full"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack} 
                  className="y2k-button flex-1 bg-white"
                  style={{ color: '#f20e0e' }}
                >
                  BACK
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!recipientName.trim()}
                  className="y2k-button flex-1"
                >
                  CONTINUE
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Experience */}
          {step === 3 && (
            <div className="space-y-12">
              <div>
                <div
                  className="regular_paragraph text-[10px] mb-3"
                  style={{
                    color: '#f20e0e',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    height: '16px',
                  }}
                >
                  SELECT GIFT
                </div>
                <h1 className="jenny-title text-6xl md:text-7xl mb-4" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1
                }}>
                  Which gift
                </h1>
                {recipientName && (
                  <p className="regular_paragraph text-lg mt-2 mb-4" style={{
                    color: '#666666',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                  }}>
                    for <span style={{ color: '#f20e0e', fontWeight: 500 }}>{recipientName}</span>?
                  </p>
                )}
                {!recipientName && (
                  <p className="regular_paragraph text-lg mt-2 mb-4" style={{
                    color: '#666666',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                  }}>
                    for your loved one?
                  </p>
                )}
              </div>

              <div 
                ref={scrollContainerRef}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                {coupons.map((coupon) => (
                  <button
                    key={coupon.id}
                    onClick={() => {
                      setCouponType(coupon.id);
                    }}
                    className="y2k-window p-6 text-center transition-all"
                    style={{
                      borderWidth: couponType === coupon.id ? '2px' : '1px',
                      borderStyle: 'solid',
                      borderColor: couponType === coupon.id ? '#f20e0e' : '#e5e5e5',
                      backgroundColor: couponType === coupon.id ? 'rgba(242, 14, 14, 0.05)' : 'transparent',
                      boxShadow: couponType === coupon.id ? '0 0 0 4px rgba(242, 14, 14, 0.08)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      if (window.matchMedia('(hover: hover)').matches && couponType !== coupon.id) {
                        e.currentTarget.style.borderColor = '#f20e0e';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (window.matchMedia('(hover: hover)').matches && couponType !== coupon.id) {
                        e.currentTarget.style.borderColor = '#e5e5e5';
                      }
                    }}
                  >
                    <div className="text-3xl mb-4">{coupon.emoji}</div>
                    <div 
                      className="regular_paragraph text-lg font-medium"
                      style={{
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        color: couponType === coupon.id ? '#f20e0e' : '#666666',
                      }}
                    >
                      {coupon.title}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack} 
                  className="y2k-button flex-1 bg-white"
                  style={{ color: '#f20e0e' }}
                >
                  BACK
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!couponType}
                  className="y2k-button flex-1"
                >
                  CONTINUE
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Message */}
          {step === 4 && (
            <div className="space-y-12">
              <div>
                <div
                  className="regular_paragraph text-[10px] mb-3"
                  style={{
                    color: 'transparent',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    height: '16px',
                  }}
                >
                  &nbsp;
                </div>
                <h1 className="jenny-title text-6xl md:text-7xl mb-4" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1
                }}>
                  Your message
                </h1>
                <p className="regular_paragraph text-base mt-4">
                  What would you like to say?
                </p>
              </div>

              {/* AI Message Generation Button */}
              <button
                type="button"
                onClick={handleGenerateMessage}
                disabled={isGeneratingMessage || !couponType}
                className="y2k-window w-full text-left"
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: '#e5e5e5',
                  padding: '16px 20px',
                  cursor: (isGeneratingMessage || !couponType) ? 'not-allowed' : 'pointer',
                  opacity: (isGeneratingMessage || !couponType) ? 0.5 : 1,
                  height: '80px',
                  transition: 'border-color 0.2s ease, opacity 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (window.matchMedia('(hover: hover)').matches && !isGeneratingMessage && couponType) {
                    e.currentTarget.style.borderColor = '#f20e0e';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.matchMedia('(hover: hover)').matches && !isGeneratingMessage && couponType) {
                    e.currentTarget.style.borderColor = '#e5e5e5';
                  }
                }}
              >
                <div className="flex items-center justify-between" style={{ height: '100%' }}>
                  <div style={{ flex: 1, minWidth: 0, position: 'relative', height: '48px' }}>
                    <div 
                      className="regular_paragraph text-sm font-medium" 
                      style={{ 
                        color: '#f20e0e', 
                        marginBottom: '4px',
                        height: '20px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        opacity: isGeneratingMessage ? 0 : 1,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      Generate message with AI
                    </div>
                    <div 
                      className="regular_paragraph text-sm font-medium" 
                      style={{ 
                        color: '#f20e0e', 
                        marginBottom: '4px',
                        height: '20px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        opacity: isGeneratingMessage ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      Generating message...
                    </div>
                    <div 
                      className="text-sm" 
                      style={{ 
                        color: '#999999', 
                        fontFamily: 'var(--font-sans), sans-serif', 
                        textTransform: 'none',
                        height: '20px',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        opacity: isGeneratingMessage ? 0 : 1,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      Get a personalized message based on your gift and mood
                    </div>
                    <div 
                      className="text-sm" 
                      style={{ 
                        color: '#999999', 
                        fontFamily: 'var(--font-sans), sans-serif', 
                        textTransform: 'none',
                        height: '20px',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        opacity: isGeneratingMessage ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      Creating a personalized message for you...
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '20px',
                    color: '#f20e0e',
                    opacity: isGeneratingMessage ? 0.5 : 1,
                    flexShrink: 0,
                    marginLeft: '12px',
                    transition: 'opacity 0.2s ease',
                  }}>
                    ✨
                  </div>
                </div>
              </button>

              <div 
                className="y2k-window" 
                style={{ 
                  borderWidth: focusedInput === 'message' ? '2px' : '1px',
                  borderStyle: 'solid',
                  borderColor: focusedInput === 'message' ? '#f20e0e' : '#e5e5e5',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: focusedInput === 'message' ? '0 0 0 4px rgba(242, 14, 14, 0.08)' : 'none',
                  padding: '20px 24px',
                }}
              >
                <textarea
                  value={message}
                  onChange={(e) => {
                    const newMessage = e.target.value.slice(0, MAX_MESSAGE_LENGTH);
                    setMessage(newMessage);
                  }}
                  onFocus={() => setFocusedInput('message')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Write your message here..."
                  autoFocus
                  maxLength={MAX_MESSAGE_LENGTH}
                  className="y2k-input w-full min-h-[200px] resize-none"
                  style={{ fontFamily: 'inherit', fontSize: '1rem', lineHeight: '1.6' }}
                />
                {/* Character Count */}
                <div
                  className="text-right mt-3"
                  style={{
                    fontSize: '11px',
                    color: '#666666',
                    opacity: message.length > MAX_MESSAGE_LENGTH * 0.9 ? 1 : 0.5,
                    fontFamily: 'inherit',
                  }}
                >
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </div>
              </div>

              <div className="y2k-window p-6">
                <div className="space-y-6">
                  {/* Validity Selection */}
                  <div>
                    <div className="jenny-label text-[10px] mb-3">VALIDITY</div>
                    <div className="space-y-3">
                      {/* Lifetime Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setValidityType('lifetime');
                          setValidityDate('');
                        }}
                        className="w-full text-left p-4 transition-all"
                        style={{
                          borderWidth: validityType === 'lifetime' ? '2px' : '1px',
                          borderStyle: 'solid',
                          borderColor: validityType === 'lifetime' ? '#f20e0e' : '#e5e5e5',
                          backgroundColor: validityType === 'lifetime' ? 'rgba(242, 14, 14, 0.05)' : 'transparent',
                          boxShadow: validityType === 'lifetime' ? '0 0 0 4px rgba(242, 14, 14, 0.08)' : 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={(e) => {
                          if (window.matchMedia('(hover: hover)').matches && validityType !== 'lifetime') {
                            e.currentTarget.style.borderColor = '#f20e0e';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (window.matchMedia('(hover: hover)').matches && validityType !== 'lifetime') {
                            e.currentTarget.style.borderColor = '#e5e5e5';
                          }
                        }}
                      >
                        <div className="regular_paragraph text-base font-medium" style={{
                          color: validityType === 'lifetime' ? '#f20e0e' : '#666666',
                        }}>
                          LIFETIME
                        </div>
                      </button>

                      {/* Date Option */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setValidityType('date');
                            setIsDatePickerOpen(true);
                          }}
                          className="w-full text-left p-4 transition-all"
                          style={{
                            borderWidth: validityType === 'date' ? '2px' : '1px',
                            borderStyle: 'solid',
                            borderColor: validityType === 'date' ? '#f20e0e' : '#e5e5e5',
                            backgroundColor: validityType === 'date' ? 'rgba(242, 14, 14, 0.05)' : 'transparent',
                            boxShadow: validityType === 'date' ? '0 0 0 4px rgba(242, 14, 14, 0.08)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                          onMouseEnter={(e) => {
                            if (window.matchMedia('(hover: hover)').matches && validityType !== 'date') {
                              e.currentTarget.style.borderColor = '#f20e0e';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (window.matchMedia('(hover: hover)').matches && validityType !== 'date') {
                              e.currentTarget.style.borderColor = '#e5e5e5';
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="regular_paragraph text-sm font-medium" style={{
                              color: validityType === 'date' ? '#f20e0e' : '#666666',
                            }}>
                              SPECIFIC DATE
                            </div>
                            {validityDate ? (
                              <div className="regular_paragraph text-xs" style={{
                                color: '#f20e0e',
                                fontWeight: 400,
                              }}>
                                {(() => {
                                  const date = parseLocalDate(validityDate);
                                  if (!date) return '';
                                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                })()}
                              </div>
                            ) : (
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ color: validityType === 'date' ? '#f20e0e' : '#999999', flexShrink: 0 }}
                              >
                                <path
                                  d="M6 2V6M14 2V6M3 10H17M5 4H15C16.1046 4 17 4.89543 17 6V17C17 18.1046 16.1046 19 15 19H5C3.89543 19 3 18.1046 3 17V6C3 4.89543 3.89543 4 5 4Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        </button>
                        {validityType === 'date' && isDatePickerOpen && typeof window !== 'undefined' ? createPortal(
                          <>
                            {/* Backdrop - full screen overlay (including navigation) */}
                            <div 
                              style={{ 
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(242, 14, 14, 0.08)',
                                zIndex: 10010,
                              }}
                              onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                  setIsDatePickerOpen(false);
                                  setShowMonthYearPicker(false);
                                  setPendingYear(null);
                                  setPendingMonth(null);
                                }
                              }}
                            />
                            {/* Calendar Container - displayed above navigation */}
                            <div 
                              className="flex items-center justify-center pointer-events-none"
                              style={{ 
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 10011,
                              }}
                            >
                              <div 
                                className="bg-white pointer-events-auto"
                                style={{
                                  width: '100%',
                                  maxWidth: '400px',
                                  maxHeight: '500px',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  position: 'relative',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const target = e.target as HTMLElement;
                                  if (!target.closest('[data-month-year-picker]') && 
                                      !target.closest('button[data-date-header-button]')) {
                                    setShowMonthYearPicker(false);
                                  }
                                }}
                              >
                              <DatePicker
                                selected={validityDate ? parseLocalDate(validityDate) : null}
                                onChange={(date: Date | null) => {
                                  if (date) {
                                    const formattedDate = formatLocalDate(date);
                                    setValidityDate(formattedDate);
                                    setIsDatePickerOpen(false);
                                  }
                                }}
                                 onSelect={(date: Date | null) => {
                                   if (date) {
                                    const formattedDate = formatLocalDate(date);
                                    setValidityDate(formattedDate);
                                    setIsDatePickerOpen(false);
                                  }
                                }}
                                 minDate={parseLocalDate(getMinDate()) || undefined}
                                inline
                                calendarClassName="heartpass-datepicker"
                                formatWeekDay={(nameOfDay: string) => nameOfDay.substring(0, 1)}
                                renderCustomHeader={({
                                  date,
                                  decreaseMonth,
                                  increaseMonth,
                                  prevMonthButtonDisabled,
                                  nextMonthButtonDisabled,
                                  changeMonth,
                                  changeYear,
                                  decreaseYear,
                                  increaseYear,
                                  prevYearButtonDisabled,
                                  nextYearButtonDisabled,
                                }) => {
                                  const currentYear = date.getFullYear();
                                  const currentMonth = date.getMonth();
                                  const minDate = parseLocalDate(getMinDate());
                                  const minYear = minDate ? minDate.getFullYear() : new Date().getFullYear();
                                  const maxYear = currentYear + 10; // 10 years ahead
                                  
                                  const months = [
                                    'January', 'February', 'March', 'April', 'May', 'June',
                                    'July', 'August', 'September', 'October', 'November', 'December'
                                  ];
                                  
                                  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
                                  
                                  return (
                                    <div style={{ 
                                      position: 'relative',
                                      width: '100%',
                                      boxSizing: 'border-box',
                                    }}>
                                      <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: '#f20e0e',
                                        borderBottom: '1px solid #f20e0e',
                                        gap: '1rem',
                                        height: '50px',
                                        minHeight: '50px',
                                        boxSizing: 'border-box',
                                        margin: 0,
                                        position: 'relative',
                                      }}>
                                        <button
                                          type="button"
                                          onClick={decreaseMonth}
                                          disabled={prevMonthButtonDisabled}
                                          style={{
                                            background: 'transparent',
                                            border: '1px solid rgba(255, 254, 239, 0.3)',
                                            borderRadius: '4px',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: prevMonthButtonDisabled ? 'not-allowed' : 'pointer',
                                            opacity: prevMonthButtonDisabled ? 0.5 : 1,
                                            padding: 0,
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            flexShrink: 0,
                                          }}
                                          onMouseEnter={(e) => {
                                            if (window.matchMedia('(hover: hover)').matches && !prevMonthButtonDisabled) {
                                              e.currentTarget.style.background = 'rgba(255, 254, 239, 0.1)';
                                              e.currentTarget.style.borderColor = 'rgba(255, 254, 239, 0.5)';
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (window.matchMedia('(hover: hover)').matches) {
                                              e.currentTarget.style.background = 'transparent';
                                              e.currentTarget.style.borderColor = 'rgba(255, 254, 239, 0.3)';
                                            }
                                          }}
                                        >
                                          <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ flexShrink: 0 }}
                                          >
                                            <path
                                              d="M10 12L6 8L10 4"
                                              stroke="#FFFEEF"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </button>
                                        <button
                                          type="button"
                                          data-date-header-button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setShowMonthYearPicker((prev) => {
                                              return !prev;
                                            });
                                          }}
                                          style={{
                                            color: '#FFFEEF',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '-0.04em',
                                            fontSize: '0.875rem',
                                            flex: 1,
                                            textAlign: 'center',
                                            background: 'transparent',
                                            border: 'none',
                                            padding: '4px 8px',
                                            cursor: 'pointer',
                                            borderRadius: '4px',
                                            transition: 'all 0.2s ease',
                                          }}
                                          onMouseEnter={(e) => {
                                            if (window.matchMedia('(hover: hover)').matches) {
                                              e.currentTarget.style.background = 'rgba(255, 254, 239, 0.1)';
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (window.matchMedia('(hover: hover)').matches) {
                                              e.currentTarget.style.background = 'transparent';
                                            }
                                          }}
                                        >
                                          {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={increaseMonth}
                                          disabled={nextMonthButtonDisabled}
                                          style={{
                                            background: 'transparent',
                                            border: '1px solid rgba(255, 254, 239, 0.3)',
                                            borderRadius: '4px',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: nextMonthButtonDisabled ? 'not-allowed' : 'pointer',
                                            opacity: nextMonthButtonDisabled ? 0.5 : 1,
                                            padding: 0,
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            flexShrink: 0,
                                          }}
                                          onMouseEnter={(e) => {
                                            if (window.matchMedia('(hover: hover)').matches && !nextMonthButtonDisabled) {
                                              e.currentTarget.style.background = 'rgba(255, 254, 239, 0.1)';
                                              e.currentTarget.style.borderColor = 'rgba(255, 254, 239, 0.5)';
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (window.matchMedia('(hover: hover)').matches) {
                                              e.currentTarget.style.background = 'transparent';
                                              e.currentTarget.style.borderColor = 'rgba(255, 254, 239, 0.3)';
                                            }
                                          }}
                                        >
                                          <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ flexShrink: 0 }}
                                          >
                                            <path
                                              d="M6 4L10 8L6 12"
                                              stroke="#FFFEEF"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                      
                                      {/* Month/Year Picker Dropdown */}
                                      {showMonthYearPicker && (
                                        <div 
                                          data-month-year-picker
                                          className="custom-scrollbar"
                                          style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e5e5e5',
                                            borderTop: 'none',
                                            zIndex: 100001,
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                          }}
                                        >
                                          {/* Year Selection */}
                                          <div style={{
                                            padding: '0.75rem',
                                            borderBottom: '1px solid #e5e5e5',
                                          }}>
                                            <div style={{
                                              fontSize: '0.7rem',
                                              fontWeight: 500,
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.1em',
                                              color: '#666666',
                                              marginBottom: '0.5rem',
                                            }}>
                                              YEAR
                                            </div>
                                            <div style={{
                                              display: 'grid',
                                              gridTemplateColumns: 'repeat(3, 1fr)',
                                              gap: '0.5rem',
                                            }}>
                                              {years.map((year) => (
                                                <button
                                                  key={year}
                                                  type="button"
                                                  onClick={() => {
                                                    if (pendingYear === year) {
                                                      setPendingYear(null);
                                                      return;
                                                    }
                                                    setPendingYear(year);
                                                    // If month is already selected, apply both
                                                    if (pendingMonth !== null) {
                                                      changeYear(year);
                                                      changeMonth(pendingMonth);
                                                      setPendingYear(null);
                                                      setPendingMonth(null);
                                                      setShowMonthYearPicker(false);
                                                    }
                                                  }}
                                                  style={{
                                                    padding: '8px 12px',
                                                    background: (year === pendingYear) ? 'rgba(242, 14, 14, 0.1)' : 'transparent',
                                                    border: (year === pendingYear) ? '1px solid #f20e0e' : '1px solid #e5e5e5',
                                                    color: (year === pendingYear) ? '#f20e0e' : '#666666',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    borderRadius: '0',
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    if (window.matchMedia('(hover: hover)').matches && year !== pendingYear) {
                                                      e.currentTarget.style.borderColor = '#f20e0e';
                                                      e.currentTarget.style.backgroundColor = 'rgba(242, 14, 14, 0.05)';
                                                    }
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    if (window.matchMedia('(hover: hover)').matches && year !== pendingYear) {
                                                      e.currentTarget.style.borderColor = '#e5e5e5';
                                                      e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                  }}
                                                >
                                                  {year}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                          
                                          {/* Month Selection */}
                                          <div style={{
                                            padding: '0.75rem',
                                          }}>
                                            <div style={{
                                              fontSize: '0.7rem',
                                              fontWeight: 500,
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.1em',
                                              color: '#666666',
                                              marginBottom: '0.5rem',
                                            }}>
                                              MONTH
                                            </div>
                                            <div style={{
                                              display: 'grid',
                                              gridTemplateColumns: 'repeat(3, 1fr)',
                                              gap: '0.5rem',
                                            }}>
                                              {months.map((month, index) => (
                                                <button
                                                  key={month}
                                                  type="button"
                                                  onClick={() => {
                                                    if (pendingMonth === index) {
                                                      setPendingMonth(null);
                                                      return;
                                                    }
                                                    setPendingMonth(index);
                                                    // If year is already selected, apply both
                                                    if (pendingYear !== null) {
                                                      changeYear(pendingYear);
                                                      changeMonth(index);
                                                      setPendingYear(null);
                                                      setPendingMonth(null);
                                                      setShowMonthYearPicker(false);
                                                    }
                                                  }}
                                                  style={{
                                                    padding: '8px 12px',
                                                    background: (index === pendingMonth) ? 'rgba(242, 14, 14, 0.1)' : 'transparent',
                                                    border: (index === pendingMonth) ? '1px solid #f20e0e' : '1px solid #e5e5e5',
                                                    color: (index === pendingMonth) ? '#f20e0e' : '#666666',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    borderRadius: '0',
                                                    textTransform: 'capitalize',
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    if (window.matchMedia('(hover: hover)').matches && index !== pendingMonth) {
                                                      e.currentTarget.style.borderColor = '#f20e0e';
                                                      e.currentTarget.style.backgroundColor = 'rgba(242, 14, 14, 0.05)';
                                                    }
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    if (window.matchMedia('(hover: hover)').matches && index !== pendingMonth) {
                                                      e.currentTarget.style.borderColor = '#e5e5e5';
                                                      e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                  }}
                                                >
                                                  {month.substring(0, 3)}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }}
                              />
                              </div>
                            </div>
                          </>,
                          document.body
                        ) : null}
                        {validityType === 'date' && !validityDate && !isDatePickerOpen && (
                          <div className="regular_paragraph text-xs mt-2" style={{ color: '#999999' }}>
                            Minimum: {(() => {
                              const minDate = parseLocalDate(getMinDate());
                              if (!minDate) return '';
                              return minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-[#e5e5e5]">
                    <div className="jenny-label text-[10px] mb-2">USAGE</div>
                    <div className="regular_paragraph text-base font-medium">{usageCondition}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleBack} 
                  className="y2k-button flex-1 bg-white"
                  style={{ color: '#f20e0e' }}
                >
                  BACK
                </button>
                <button onClick={handleContinue} className="y2k-button flex-1 text-base">
                  CONTINUE
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Send Email (Optional) */}
          {step === 5 && (
            <div className="space-y-12">
              <div>
                <div
                  className="regular_paragraph text-[10px] mb-3"
                  style={{
                    color: 'transparent',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    height: '16px',
                  }}
                >
                  &nbsp;
                </div>
                <h1 className="jenny-title text-6xl md:text-7xl mb-4" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1
                }}>
                  Send to {recipientName || 'them'}?
                </h1>
                <p className="regular_paragraph text-base mt-4">
                  Enter {recipientName ? `${recipientName}'s` : 'their'} email to send this pass now, or create it first and send later.
                </p>
              </div>

              <div 
                className="y2k-window" 
                style={{ 
                  borderWidth: focusedInput === 'email' ? '2px' : '1px',
                  borderStyle: 'solid',
                  borderColor: focusedInput === 'email' ? '#f20e0e' : '#e5e5e5',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: focusedInput === 'email' ? '0 0 0 4px rgba(242, 14, 14, 0.08)' : 'none',
                  padding: '20px 24px',
                }}
              >
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder={`${recipientName || 'recipient'}@example.com`}
                  className="y2k-input w-full"
                  style={{ fontFamily: 'inherit', fontSize: '1rem' }}
                  autoFocus
                />
                <p className="regular_paragraph text-xs mt-3" style={{ color: '#666', textTransform: 'none' }}>
                  {recipientEmail ? 
                    `${recipientName || 'They'} will receive this pass when they sign up with this email.` :
                    'You can always send this pass later from my pass page.'}
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleBack} 
                  className="y2k-button flex-1 bg-white"
                  style={{ color: '#f20e0e' }}
                  disabled={isSaving}
                >
                  BACK
                </button>
                {recipientEmail ? (
                  <button 
                    onClick={handleContinue} 
                    className="y2k-button flex-1 text-base"
                    disabled={isSaving}
                  >
                    {isSaving ? 'SENDING...' : 'SEND NOW'}
                  </button>
                ) : (
                  <button 
                    onClick={handleContinue} 
                    className="y2k-button flex-1 text-base"
                    disabled={isSaving}
                  >
                    {isSaving ? 'CREATING...' : 'CREATE FIRST'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        title="Almost There!"
        message="You're making great progress on your HeartPass! Would you like to finish creating it first?"
        confirmText="LEAVE PAGE"
        cancelText="STAY & CONTINUE"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => {
          const redirectTo = alertModal.redirectTo;
          setAlertModal({ isOpen: false, title: '', message: '', redirectTo: undefined });
          if (redirectTo) {
            router.push(redirectTo);
          }
        }}
        title={alertModal.title}
        message={alertModal.message}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="regular_paragraph">Loading...</p></div>}>
      <CreatePageContent />
    </Suspense>
  );
}
