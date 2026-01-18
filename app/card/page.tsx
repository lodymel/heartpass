'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import Card from '@/components/Card';
import { CardData, User, CardFromDB } from '@/types';
import { createClient } from '@/lib/supabase/client';
import AlertModal from '@/components/AlertModal';
import SignupPromptModal from '@/components/SignupPromptModal';
import SendEmailModal from '@/components/SendEmailModal';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

function CardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [cardFromDB, setCardFromDB] = useState<any>(null); // Store full DB record to check user_id and recipient
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [showScreenshotPrompt, setShowScreenshotPrompt] = useState(false);

  useEffect(() => {
    // Check user authentication
    const checkUser = async () => {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
        } catch (error) {
          // Ignore errors
        }
      }
    };
    checkUser();
  }, []);

  // Screenshot protection for non-logged-in users
  useEffect(() => {
    if (!user) {
      // Disable right-click context menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      // Disable text selection
      const handleSelectStart = (e: Event) => {
        e.preventDefault();
        return false;
      };

      // Disable drag and drop
      const handleDragStart = (e: DragEvent) => {
        e.preventDefault();
        return false;
      };

      // Disable common keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        // Disable Print Screen (limited effectiveness)
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          setShowScreenshotPrompt(true);
          return false;
        }
        // Disable F12 (Developer Tools)
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
          e.preventDefault();
          return false;
        }
        // Disable Ctrl+S (Save page)
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          setShowScreenshotPrompt(true);
          return false;
        }
        // Disable Ctrl+P (Print)
        if (e.ctrlKey && e.key === 'p') {
          e.preventDefault();
          setShowScreenshotPrompt(true);
          return false;
        }
      };

      // Mobile/Tablet screenshot detection
      let lastBlurTime = 0;
      let lastFocusTime = Date.now();
      
      const handleVisibilityChange = () => {
        if (document.hidden) {
          lastBlurTime = Date.now();
        } else {
          const timeDiff = Date.now() - lastBlurTime;
          // If page was hidden for a very short time (likely screenshot), show prompt
          if (timeDiff > 0 && timeDiff < 1000) {
            setShowScreenshotPrompt(true);
          }
          lastFocusTime = Date.now();
        }
      };

      const handleBlur = () => {
        lastBlurTime = Date.now();
      };

      const handleFocus = () => {
        const timeDiff = Date.now() - lastBlurTime;
        // If page was blurred for a very short time (likely screenshot), show prompt
        if (timeDiff > 0 && timeDiff < 1000) {
          setShowScreenshotPrompt(true);
        }
        lastFocusTime = Date.now();
      };

      // Detect window resize (some screenshot methods trigger this)
      let resizeTimer: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          // If resize happens quickly, might be screenshot
          setShowScreenshotPrompt(true);
        }, 100);
      };

      // Add event listeners
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('selectstart', handleSelectStart);
      document.addEventListener('dragstart', handleDragStart);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('resize', handleResize);

      // Add CSS to prevent image dragging
      const style = document.createElement('style');
      style.textContent = `
        #heartpass-card {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
        }
        #heartpass-card * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('selectstart', handleSelectStart);
        document.removeEventListener('dragstart', handleDragStart);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('resize', handleResize);
        if (resizeTimer) clearTimeout(resizeTimer);
        document.head.removeChild(style);
      };
    }
  }, [user]);

  useEffect(() => {
    const loadCard = async () => {
      const cardId = searchParams.get('id');
      
      // If card ID exists, try to load from database
      if (cardId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('id', cardId)
            .single();

          if (error) {
            console.error('Failed to load card from DB:', error);
            console.error('Error details:', {
              code: error.code,
              message: error.message,
              hint: error.hint,
              cardId: cardId,
            });
            // Show error message instead of falling back to URL params
            setAlertModal({
              isOpen: true,
              title: 'Pass not found',
              message: 'This pass could not be loaded. It may have been deleted or the link is invalid.',
            });
            setIsLoading(false);
            return;
          }

          if (data) {
            // Check if ticket is expired
            let finalStatus = (data.status as any) || 'active';
            if (data.validity_type === 'date' && data.validity_date) {
              const validityDate = new Date(data.validity_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              validityDate.setHours(0, 0, 0, 0);
              
              if (validityDate < today && finalStatus !== 'used' && finalStatus !== 'cancelled') {
                finalStatus = 'expired';
                // Auto-update expired status in DB
                supabase
                  .from('cards')
                  .update({ status: 'expired' })
                  .eq('id', data.id)
                  .then(() => {
                    // Silently update - no error handling needed
                  });
              }
            }
            
            // Store full DB record to check sender/recipient
            setCardFromDB(data);
            
            const cardData: Partial<CardData> = {
              recipientType: data.recipient_type as any,
              couponType: data.coupon_type,
              mood: data.mood as any,
              recipientName: data.recipient_name || '',
              recipientEmail: data.recipient_email || undefined, // Include recipient email for layout balance
              senderName: data.sender_name || '',
              senderEmail: data.sender_email || undefined, // Include sender email for recipient identification
              usageCondition: data.usage_condition || 'Redeem with a smile',
              validityType: (data.validity_type || 'lifetime') as 'lifetime' | 'date',
              validityDate: data.validity_date || undefined,
              issueDate: data.issue_date || (() => {
                // Use local date (avoid timezone conversion)
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              })(),
              cardId: data.id,
              message: data.message || '',
              status: finalStatus,
            };

            setCardData(cardData as CardData);
            if (data.message) {
              setMessage(data.message);
            } else {
              generateAIMessage(cardData);
            }
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Failed to load card:', error);
          setAlertModal({
            isOpen: true,
            title: 'Error loading pass',
            message: 'Failed to load this pass. Please try again later.',
          });
          setIsLoading(false);
          return;
        }
      }

      // Fallback: Only use URL parameters if no card ID is provided (for preview/creation flow)
      // If card ID exists but DB load failed, don't fallback - show error instead
      if (!searchParams.get('id')) {
        // Parse URL parameters for preview/creation flow
        const urlMessage = searchParams.get('message') || '';
        const data: Partial<CardData> = {
          recipientType: (searchParams.get('recipientType') as any) || 'loved-one',
          couponType: searchParams.get('couponType') || '',
          mood: (searchParams.get('mood') as any) || 'heartfelt',
          recipientName: searchParams.get('recipientName') || '',
          senderName: searchParams.get('senderName') || '',
          usageCondition: searchParams.get('usageCondition') || 'ONE USE',
          validityType: (searchParams.get('validityType') || 'lifetime') as 'lifetime' | 'date',
          validityDate: searchParams.get('validityDate') || undefined,
          issueDate: (() => {
            // Use local date in user's timezone
            const now = new Date();
            const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
            return format(localDate, 'yyyy-MM-dd');
          })(),
          cardId: `heartpass-${Date.now()}`,
        };

        setCardData(data as CardData);
        if (urlMessage) {
          setMessage(urlMessage);
          setIsLoading(false);
        } else {
          generateAIMessage(data);
        }
      } else {
        // Card ID exists but DB load failed - already handled above with error modal
        setIsLoading(false);
      }
    };

    loadCard();
  }, [searchParams]);

  const generateAIMessage = async (data: Partial<CardData>) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponType: data.couponType,
          mood: data.mood,
          recipientName: data.recipientName,
          senderName: data.senderName,
        }),
      });

      const result = await response.json();
      setMessage(result.message || 'Let\'s create special moments together! 💝');
    } catch (error) {
      console.error('Failed to generate AI message:', error);
      setMessage('Let\'s create special moments together! 💝');
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const regenerateAIMessage = async () => {
    if (!cardData) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponType: cardData.couponType,
          mood: cardData.mood,
          recipientName: cardData.recipientName,
          senderName: cardData.senderName,
        }),
      });

      const result = await response.json();
      setMessage(result.message || 'Let\'s create special moments together! 💝');
      
      // Save to database if card is saved
      if (cardData?.cardId && cardData.cardId.startsWith('heartpass-') === false) {
        try {
          const supabase = createClient();
          await supabase
            .from('cards')
            .update({ message: result.message })
            .eq('id', cardData.cardId);
        } catch (error) {
          console.error('Failed to save regenerated message:', error);
        }
      }
    } catch (error) {
      console.error('Failed to regenerate AI message:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsUsed = async () => {
    if (!user || !cardData?.cardId || cardData.cardId.startsWith('heartpass-')) return;
    
    // Check if current user is the recipient (only recipient can mark as used)
    if (!cardFromDB) return;
    
    const isRecipient = 
      cardFromDB.recipient_user_id === user.id || 
      cardFromDB.recipient_email === user.email;
    
    if (!isRecipient) {
      setAlertModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'Only the recipient can mark this pass as used.',
      });
      return;
    }
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('cards')
        .update({ 
          status: 'used',
          used_at: new Date().toISOString(),
        })
        .eq('id', cardData.cardId);

      if (error) throw error;

      // Reload card data to reflect the update
      const { data: updatedCard, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardData.cardId)
        .single();

      if (!fetchError && updatedCard) {
        setCardFromDB(updatedCard);
        const updatedCardData: Partial<CardData> = {
          ...cardData,
          status: 'used' as any,
        };
        setCardData(updatedCardData as CardData);
      }

      setAlertModal({
        isOpen: true,
        title: 'Pass marked as used',
        message: 'This pass has been marked as used. The sender will also see this status.',
      });
    } catch (error) {
      console.error('Failed to mark card as used:', error);
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to mark this pass as used. Please try again.',
      });
    }
  };

  const handleAccept = async () => {
    if (!user || !cardData?.cardId || cardData.cardId.startsWith('heartpass-')) return;
    if (!cardFromDB) return;
    
    // Check if current user is the recipient
    const isRecipient = 
      cardFromDB.recipient_user_id === user.id || 
      cardFromDB.recipient_email === user.email;
    
    if (!isRecipient) {
      setAlertModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'Only the recipient can accept this pass.',
      });
      return;
    }
    
    try {
      const supabase = createClient();
      
      const { data: updateResult, error } = await supabase
        .from('cards')
        .update({ 
          status: 'accepted',
          recipient_user_id: user.id 
        })
        .eq('id', cardData.cardId)
        .select(); // Return updated data

      if (error) {
        console.error('❌ Update error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        setAlertModal({
          isOpen: true,
          title: 'Update Failed',
          message: `Failed to accept pass: ${error.message || JSON.stringify(error)}. Please check if RLS policy allows updates.`,
        });
        return;
      }

      if (!updateResult || updateResult.length === 0) {
        setAlertModal({
          isOpen: true,
          title: 'Warning',
          message: 'Update may not have completed. Please refresh and check again.',
        });
        return;
      }

      // Verify the update by fetching the card again
      const { data: verifiedCard, error: verifyError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardData.cardId)
        .single();
      
      if (verifyError) {
        console.error('❌ Verification error:', verifyError);
      }

      // Show success message
      setAlertModal({
        isOpen: true,
        title: 'Success!',
        message: 'Pass accepted successfully! Redirecting to My Pass...',
      });

      // Small delay to ensure DB update is committed, then redirect
      setTimeout(() => {
        // Force a hard refresh to ensure latest data is loaded
        window.location.href = '/my-cards';
      }, 1000);
    } catch (error) {
      console.error('Failed to accept card:', error);
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to accept this pass. Please try again.',
      });
    }
  };

  const handleSendToEmail = async (email: string) => {
    if (!user || !cardData?.cardId || cardData.cardId.startsWith('heartpass-')) {
      throw new Error('Card must be saved first');
    }

    const supabase = createClient();
    
    // Update card with recipient email
    const updateData: Partial<CardFromDB> = {
      recipient_email: email,
      status: 'pending', // Set as pending when sent
    };
    
    const { error } = await supabase
      .from('cards')
      .update(updateData)
      .eq('id', cardData.cardId);

    if (error) throw error;

    // Send email notification
    try {
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          recipientName: cardData.recipientName,
          senderName: cardData.senderName,
          cardId: cardData.cardId,
          couponType: cardData.couponType,
          message: message,
        }),
      });

      const emailResult = await emailResponse.json();

      if (emailResponse.ok && emailResult.success) {
        setAlertModal({
          isOpen: true,
          title: 'Pass sent! ✉️',
          message: `Your HeartPass has been sent to ${email}. The recipient can click the link in the email and sign up to view their pass.`,
        });
      } else {
        // Email failed but card is updated
        console.error('Email send failed:', emailResult);
        setAlertModal({
          isOpen: true,
          title: 'Pass Saved',
          message: `Your HeartPass has been saved. (Email send failed: ${emailResult.error || 'Unknown error'})\n\nPlease try again.`,
        });
      }
    } catch (emailError) {
      // Email failed but card is updated
      console.error('Email send error:', emailError);
      setAlertModal({
        isOpen: true,
        title: 'Pass Saved',
        message: `Your HeartPass has been saved. (Error occurred while sending email)\n\nPlease try again.`,
      });
    }
  };

  const handleDownload = async () => {
    // Require login for download
    if (!user) {
      setShowSignupPrompt(true);
      return;
    }

    const cardElement = document.getElementById('heartpass-card');
    if (!cardElement) return;

    try {
      // Wait for fonts to load completely
      await document.fonts.ready;
      
      // Additional wait to ensure all fonts are rendered and styles are calculated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#FFFEEF',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        onclone: (clonedDoc) => {
          // Minimal intervention - ensure styles are calculated
          const clonedElement = clonedDoc.getElementById('heartpass-card');
          if (clonedElement) {
            // Force reflow to ensure styles are calculated
            clonedElement.offsetHeight;
          }
        },
      });

      const link = document.createElement('a');
      link.download = `heartpass-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Failed to download card:', error);
      setAlertModal({
        isOpen: true,
        title: 'Download Failed',
        message: 'Failed to download card. Please try again.',
      });
    }
  };

  const handleShare = async () => {
    const cardElement = document.getElementById('heartpass-card');
    if (!cardElement) return;

    try {
      // Wait for fonts to load completely
      await document.fonts.ready;
      
      // Additional wait to ensure all fonts are rendered and styles are calculated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#FFFEEF',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        onclone: (clonedDoc) => {
          // Minimal intervention - ensure styles are calculated
          const clonedElement = clonedDoc.getElementById('heartpass-card');
          if (clonedElement) {
            // Force reflow to ensure styles are calculated
            clonedElement.offsetHeight;
          }
        },
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], 'heartpass-card.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'HeartPass',
              text: 'I received a special HeartPass! 💝',
            });
          } catch (error) {
            console.error('Share failed:', error);
          }
        } else {
          // Fallback: copy link or show download
          const url = URL.createObjectURL(blob);
          navigator.clipboard.writeText(window.location.href);
          setAlertModal({
            isOpen: true,
            title: 'Link Copied',
            message: 'Link copied to clipboard!',
          });
        }
      });
    } catch (error) {
      console.error('Failed to share card:', error);
    }
  };

  const handleMessageChange = async (newMessage: string) => {
    setMessage(newMessage);
    
    // Save message to database if card has ID
    if (cardData?.cardId && cardData.cardId.startsWith('heartpass-') === false) {
      try {
        const supabase = createClient();
        await supabase
          .from('cards')
          .update({ message: newMessage })
          .eq('id', cardData.cardId);
      } catch (error) {
        console.error('Failed to save message:', error);
      }
    }
  };

  const handleSaveCard = async () => {
    if (!user || !cardData) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('cards')
        .insert({
          user_id: user.id,
          recipient_type: cardData.recipientType,
          coupon_type: cardData.couponType,
          mood: cardData.mood,
          recipient_name: cardData.recipientName,
          sender_name: cardData.senderName,
          usage_condition: cardData.usageCondition,
          validity_type: cardData.validityType || 'lifetime',
          validity_date: cardData.validityDate || null,
          message: message,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to saved card
      router.push(`/card?id=${data.id}`);
    } catch (error) {
      console.error('Failed to save card:', error);
      setAlertModal({
        isOpen: true,
        title: 'Save Failed',
        message: 'Failed to save card. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !cardData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFEEF' }}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">💝</div>
          <div className="regular_paragraph text-xl">Creating your card...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#FFFEEF' }}>
      {/* Top Navigation */}
      <Navigation />

      <div className="relative z-10 min-h-screen py-12 md:py-16 pt-40 md:pt-44" style={{ background: '#FFFEEF' }}>
        <div className="container mx-auto px-0">
          <div className="max-w-4xl mx-auto">
          {/* Card Preview */}
          <div className="mb-16 flex justify-center">
            <div style={{ width: '100%', maxWidth: '1200px' }}>
              {/* Only allow message editing for unsaved cards (from URL params) */}
              {cardData?.cardId?.startsWith('heartpass-') ? (
                <Card cardData={cardData} message={message} onMessageChange={handleMessageChange} />
              ) : (
                <Card cardData={cardData} message={message} />
              )}
            </div>
          </div>

          {/* Loading indicator for AI generation - Only for unsaved cards */}
          {cardData?.cardId?.startsWith('heartpass-') && isGenerating && (
            <div className="text-center mb-6 regular_paragraph">
              AI is generating your message... ✨
            </div>
          )}

          {/* AI Regenerate Button - Only for unsaved cards */}
          {cardData?.cardId?.startsWith('heartpass-') && message && user && (
            <div className="max-w-2xl mx-auto mb-4">
              <button
                onClick={regenerateAIMessage}
                disabled={isGenerating}
                className="y2k-button bg-white w-full"
                style={{ 
                  color: '#f20e0e',
                  fontSize: '0.875rem',
                  padding: '10px 20px',
                }}
              >
                {isGenerating ? '✨ Regenerating...' : '✨ Regenerate AI Message'}
              </button>
            </div>
          )}

          {/* Action Buttons - Only show if logged in */}
          {user ? (
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                  onClick={handleDownload}
                  className="y2k-button flex-1 text-center"
                >
                  DOWNLOAD
                </button>
                <button
                  onClick={handleShare}
                  className="y2k-button flex-1 bg-white text-center"
                  style={{ color: '#f20e0e' }}
                >
                  SHARE
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto mb-6">
              <div className="y2k-window p-4 text-center" style={{ border: '1px solid #e5e5e5' }}>
                <p className="regular_paragraph text-sm mb-3" style={{ color: '#666', lineHeight: 1.6 }}>
                  Want to keep this special moment forever? 💝<br />
                  Sign up to download and share this pass with your loved ones ✨
                </p>
                <button
                  onClick={() => setShowSignupPrompt(true)}
                  className="y2k-button"
                >
                  SIGN UP FREE 💝
                </button>
              </div>
            </div>
          )}

            {/* Expired Notice */}
            {cardData?.status === 'expired' && (
              <div className="mb-6 y2k-window p-4 text-center" style={{ borderColor: '#ff6b6b' }}>
                <p className="regular_paragraph text-[11px] md:text-sm" style={{ 
                  color: '#ff6b6b', 
                  fontWeight: 500,
                }}>
                  ⚠️ This pass has expired
                </p>
                {cardData.validityDate && (
                  <p className="regular_paragraph text-[10px] md:text-xs mt-1" style={{ 
                    color: '#999',
                  }}>
                    Valid until: {format(new Date(cardData.validityDate), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
            )}

            {/* Accept & Mark as Used Buttons - Only visible to recipient */}
            {user && cardData?.cardId && !cardData.cardId.startsWith('heartpass-') && 
             cardData.status !== 'expired' && cardData.status !== 'cancelled' && cardFromDB && (() => {
                const isRecipient = 
                  cardFromDB.recipient_user_id === user.id || 
                  cardFromDB.recipient_email === user.email;
                
                if (!isRecipient) return null; // Don't show anything if not recipient
                
                // Show Accept button for pending status
                if (cardData.status === 'pending' || (!cardData.status && cardFromDB.recipient_email)) {
                  return (
                    <div className="mb-6">
                      <button
                        onClick={handleAccept}
                        className="y2k-button w-full"
                      >
                        Accept
                      </button>
                    </div>
                  );
                }
                
                // Show Mark as Used button for accepted status (not used yet)
                if (cardData.status === 'accepted') {
                  return (
                    <div className="mb-6">
                      <button
                        onClick={handleMarkAsUsed}
                        className="y2k-button bg-white w-full"
                        style={{ 
                          color: '#f20e0e',
                          fontSize: '0.875rem',
                          padding: '10px 20px',
                        }}
                      >
                        ✓ Mark as Used
                      </button>
                    </div>
                  );
                }
                
                return null;
              })()}

            {/* Save to My Cards Section - Enhanced with Benefits */}
            {!user && cardData && !cardData.cardId?.startsWith('heartpass-') && (
              <div className="mt-6 y2k-window p-8" style={{ border: '1px solid #e5e5e5' }}>
                <div className="text-center mb-8">
                  <h3 className="jenny-title text-3xl md:text-4xl mb-4" style={{
                    fontWeight: 300,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.2,
                    color: '#f20e0e',
                  }}>
                    Save Your HeartPass
                  </h3>
                  <p className="text-base mb-6" style={{ 
                    color: '#666666', 
                    fontFamily: 'var(--font-sans), sans-serif',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.6',
                    textTransform: 'none',
                  }}>
                    Create an account to unlock these benefits:
                  </p>
                  
                  {/* Benefits List */}
                  <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                      <div className="text-lg mt-0.5">💾</div>
                      <div>
                        <div className="text-sm font-medium mb-1" style={{ 
                          color: '#f20e0e',
                          fontFamily: 'var(--font-sans), sans-serif',
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                        }}>
                          Your Ticket Collection
                        </div>
                        <div className="text-sm" style={{ 
                          color: '#666666', 
                          fontWeight: 400,
                          fontFamily: 'var(--font-sans), sans-serif',
                          letterSpacing: '-0.01em',
                          lineHeight: '1.5',
                          textTransform: 'none',
                        }}>
                          Access all your HeartPasses anytime, anywhere
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-lg mt-0.5">✏️</div>
                      <div>
                        <div className="text-sm font-medium mb-1" style={{ 
                          color: '#f20e0e',
                          fontFamily: 'var(--font-sans), sans-serif',
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                        }}>
                          Edit & Update
                        </div>
                        <div className="text-sm" style={{ 
                          color: '#666666', 
                          fontWeight: 400,
                          fontFamily: 'var(--font-sans), sans-serif',
                          letterSpacing: '-0.01em',
                          lineHeight: '1.5',
                          textTransform: 'none',
                        }}>
                          Modify your cards anytime you want
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-lg mt-0.5">🔒</div>
                      <div>
                        <div className="text-sm font-medium mb-1" style={{ 
                          color: '#f20e0e',
                          fontFamily: 'var(--font-sans), sans-serif',
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                        }}>
                          Secure & Private
                        </div>
                        <div className="text-sm" style={{ 
                          color: '#666666', 
                          fontWeight: 400,
                          fontFamily: 'var(--font-sans), sans-serif',
                          letterSpacing: '-0.01em',
                          lineHeight: '1.5',
                          textTransform: 'none',
                        }}>
                          Your data is safely stored and protected
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Link
                  href={`/auth/login?redirect=/card?${new URLSearchParams({
                    recipientType: cardData.recipientType,
                    couponType: cardData.couponType,
                    mood: cardData.mood,
                    recipientName: cardData.recipientName,
                    senderName: cardData.senderName,
                    usageCondition: cardData.usageCondition,
                    message: message || '',
                  }).toString()}`}
                  className="y2k-button w-full text-center block"
                >
                  SIGN IN TO SAVE
                </Link>
                
                <p className="text-center mt-6 text-xs" style={{ 
                  color: '#999999', 
                  fontFamily: 'var(--font-sans), sans-serif',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.5',
                  textTransform: 'none',
                }}>
                  Free forever. No credit card required.
                </p>
              </div>
            )}

            {/* Action Buttons - Only for unsaved tickets (URL params only) */}
            {user && cardData && cardData.cardId?.startsWith('heartpass-') && (
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSaveCard}
                  disabled={isSaving}
                  className="y2k-button w-full"
                >
                  {isSaving ? 'SAVING...' : 'SAVE TO MY PASS'}
                </button>
                <button
                  onClick={() => setShowSendEmailModal(true)}
                  className="w-full y2k-button bg-white"
                  style={{ color: '#f20e0e' }}
                >
                  SEND TO EMAIL
                </button>
              </div>
            )}

            {/* Status & Actions - For saved tickets (DB) */}
            {user && cardData && !cardData.cardId?.startsWith('heartpass-') && cardFromDB && (
              <div className="mt-6 space-y-6">
                {/* Check if current user is the sender */}
                {(() => {
                  const isSender = cardFromDB.user_id === user.id;
                  const isRecipient = 
                    cardFromDB.recipient_user_id === user.id || 
                    cardFromDB.recipient_email === user.email;
                  const hasEmail = !!cardFromDB.recipient_email;
                  const isActive = cardData.status === 'active' || cardData.status === 'pending';

                  // Only show actions to sender, not recipient or others
                  if (!isSender || !isActive) return null;

                  return (
                    <>
                      {/* Saved status indicator */}
                      <div className="mb-4 text-center">
                        <p className="regular_paragraph text-[10px] md:text-xs" style={{ 
                          color: '#666', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px',
                        }}>
                          <span>✓</span>
                          <span>Saved to My Pass</span>
                        </p>
                      </div>

                      {/* Email action */}
                      {!hasEmail ? (
                        <button
                          onClick={() => setShowSendEmailModal(true)}
                          className="w-full y2k-button bg-white"
                          style={{ color: '#f20e0e' }}
                        >
                          SEND TO EMAIL
                        </button>
                      ) : (
                        <div className="space-y-6">
                          <div className="text-center">
                            <p className="regular_paragraph text-[10px] md:text-xs" style={{ 
                              color: '#666', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              gap: '6px',
                            }}>
                              <span>✓</span>
                              <span>Sent to {cardFromDB.recipient_email}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => setShowSendEmailModal(true)}
                            className="w-full y2k-button bg-white"
                            style={{ color: '#f20e0e' }}
                          >
                            RESEND EMAIL
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}


            <div className="mt-12 text-center">
              {user ? (
                <Link
                  href="/my-cards"
                  className="regular_paragraph text-sm hover:underline"
                  style={{ color: '#f20e0e', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>←</span>
                  <span>Back to My Pass</span>
                </Link>
              ) : (
                <Link
                  href="/"
                  className="regular_paragraph text-sm hover:underline"
                  style={{ color: '#f20e0e', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>←</span>
                  <span>Go to Home</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
        title={alertModal.title}
        message={alertModal.message}
      />
      
      {/* Signup Prompt Modal */}
      <SignupPromptModal
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
      />

      {/* Screenshot Detection Modal - Romantic & Cute */}
      {showScreenshotPrompt && !user && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(242, 14, 14, 0.1)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowScreenshotPrompt(false)}
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
            {/* Title - Romantic */}
            <h2
              className="jenny-title text-3xl mb-4 text-center"
              style={{
                fontWeight: 300,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                color: '#f20e0e',
              }}
            >
              Want to keep this special moment forever? 💝
            </h2>

            {/* Message - Cute & Romantic */}
            <p
              className="regular_paragraph mb-6 text-center"
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: '#666666',
                fontWeight: 400,
              }}
            >
              Sign up to download this pass anytime<br />
              and share it with your loved ones ✨
            </p>

            {/* Benefits - Cute */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💾</div>
                <div className="regular_paragraph text-sm" style={{ color: '#666666' }}>
                  Download in high quality and keep it safe
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">💕</div>
                <div className="regular_paragraph text-sm" style={{ color: '#666666' }}>
                  View it again anytime you want
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎁</div>
                <div className="regular_paragraph text-sm" style={{ color: '#666666' }}>
                  Manage all your HeartPasses in one place
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowScreenshotPrompt(false)}
                className="y2k-button bg-white flex-1"
                style={{ color: '#f20e0e' }}
              >
                Maybe Later
              </button>
              <Link
                href="/auth/signup"
                className="y2k-button flex-1 text-center"
                onClick={() => setShowScreenshotPrompt(false)}
              >
                Sign Up 💝
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {user && cardData && !cardData.cardId?.startsWith('heartpass-') && (
        <SendEmailModal
          isOpen={showSendEmailModal}
          onClose={() => setShowSendEmailModal(false)}
          onSend={handleSendToEmail}
          recipientName={cardData.recipientName}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function CardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFEEF' }}>
          <div className="text-center">
            <div className="text-6xl mb-4 animate-float">💝</div>
            <div className="regular_paragraph text-xl">Loading...</div>
          </div>
        </div>
      }
    >
      <CardPageContent />
    </Suspense>
  );
}
