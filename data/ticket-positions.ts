// Ticket overlay positions configuration
// Adjust these values based on your actual ticket design
// All positions are relative to the ticket image

export interface TicketPosition {
  from: {
    top: string;
    left: string;
    width: string;
  };
  to: {
    top: string;
    right: string;
    width: string;
  };
  message: {
    top: string;
    left: string;
    right: string;
    width: string;
    minHeight: string;
    padding: string;
  };
  issued: {
    top: string;
    right: string;
  };
}

// Default positions (adjust based on your ticket design)
export const defaultTicketPositions: TicketPosition = {
  from: {
    top: '15%',
    left: '10%',
    width: '35%',
  },
  to: {
    top: '15%',
    right: '10%',
    width: '35%',
  },
  message: {
    top: '45%',
    left: '8%',
    right: '8%',
    width: '84%',
    minHeight: '120px',
    padding: '16px 20px',
  },
  issued: {
    top: '8%',
    right: '8%',
  },
};

// Per-coupon-type positions (override defaults for specific tickets)
export const ticketPositions: Record<string, Partial<TicketPosition>> = {
  'movie-night': {
    // Add specific positions for movie-night ticket here
    // Example:
    // from: { top: '12%', left: '8%', width: '38%' },
    // to: { top: '12%', right: '8%', width: '38%' },
    // message: { top: '42%', left: '6%', right: '6%', width: '88%', minHeight: '140px', padding: '20px 24px' },
    // issued: { top: '6%', right: '6%' },
  },
};
