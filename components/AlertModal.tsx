'use client';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
}: AlertModalProps) {
  if (!isOpen) return null;

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
          {title}
        </h2>

        {/* Message */}
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
          {message}
        </p>

        {/* Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="y2k-button"
            style={{
              minWidth: '120px',
            }}
          >
            {buttonText}
          </button>
        </div>
        
        {/* Prevent auto-close on background click - user must click button */}
        </div>
      </div>
    </>
  );
}
