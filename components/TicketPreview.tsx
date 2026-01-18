'use client';

interface TicketPreviewProps {
  from: string;
  to: string;
  title: string;
  description: string;
}

export default function TicketPreview({ from, to, title, description }: TicketPreviewProps) {
  return (
    <div className="bg-white ticket-border rounded-lg relative overflow-hidden max-w-sm mx-auto" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
      {/* Top Gradient Stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ff6b9d] via-[#9b59b6] to-[#4a90e2]"></div>
      
      <div className="p-6 pt-8">
        {/* FROM / TO Section */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-gray-300">
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mb-1">
              From
            </div>
            <div className="text-sm font-semibold text-gray-800">
              {from || 'Your Name'}
            </div>
          </div>
          <div className="mx-4 text-gray-400">→</div>
          <div className="flex-1 text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mb-1">
              To
            </div>
            <div className="text-sm font-semibold text-gray-800">
              {to || 'Loved One'}
            </div>
          </div>
        </div>

        {/* Ticket Title */}
        <div className="mb-4">
          <h2 className="text-2xl md:text-3xl font-light text-gray-900 leading-tight">
            {title || 'Experience Title'}
          </h2>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            {description || 'A special experience for someone special'}
          </p>
        </div>

        {/* Divider Line */}
        <div className="border-t border-dashed border-gray-300 my-6"></div>

        {/* Validity and Usage */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
              Valid Until
            </div>
            <div className="text-sm font-semibold text-gray-800">
              LIFETIME
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
              Usage
            </div>
            <div className="text-sm font-semibold text-gray-800">
              ONE TIME ONLY
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Perforation Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 border-t-2 border-dashed border-gray-300"></div>
    </div>
  );
}
