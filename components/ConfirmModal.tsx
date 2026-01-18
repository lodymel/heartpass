'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'YES, LEAVE',
  cancelText = 'STAY & CONTINUE',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - full screen overlay (including Navigation) */}
      <div
        className="fixed inset-0"
        onClick={onCancel}
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

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="y2k-button flex-1 bg-white"
            style={{
              border: '1px solid #e5e5e5',
              color: '#f20e0e',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="y2k-button flex-1"
          >
            {confirmText}
          </button>
        </div>
        </div>
      </div>
    </>
  );
}
