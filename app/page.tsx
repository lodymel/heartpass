import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: '#FFFEEF' }}>
      {/* Top Navigation */}
      <Navigation />

      <div className="relative z-10 container mx-auto px-0 w-full flex-1">
        {/* Header - Margot Priolet Style - Centered */}
        <header className="flex flex-col items-center justify-center text-center pt-32 md:pt-40 mb-24 md:mb-32">
          <h1 className="jenny-title text-9xl md:text-[12rem] lg:text-[14rem] mb-6" style={{
            fontWeight: 300,
            letterSpacing: '-0.025em',
            lineHeight: 1
          }}>
            HeartPass
          </h1>
          <p className="regular_paragraph max-w-3xl" style={{ fontSize: '1.155em', fontWeight: 500, letterSpacing: '-0.06em', transform: 'scaleX(0.95)' }}>
            Hop on the love flight!<br />
            Design a boarding pass and gift someone<br />
            a sky full of love, LOLs, and tiny surprises.
          </p>
        </header>

        {/* Ticket Preview - Minimal Preview Style */}
        <div className="max-w-md mx-auto mb-24">
          <div className="relative" style={{
            background: '#FFFEEF',
            border: '1px solid #e5e5e5',
            padding: '32px 40px',
          }}>
            {/* Top Stripe */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: '#f20e0e',
            }} />
            
            <div className="space-y-6 pt-4">
              {/* FROM / TO */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="regular_paragraph text-[9px] mb-1" style={{
                    color: '#f20e0e',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}>
                    FROM
                  </div>
                  <div className="regular_paragraph text-sm" style={{
                    color: '#777777',
                    fontWeight: 400,
                  }}>
                    You
                  </div>
                </div>
                <div style={{
                  fontSize: '20px',
                  color: '#f20e0e',
                  opacity: 0.8,
                  fontWeight: 600,
                }}>
                  →
                </div>
                <div className="text-right">
                  <div className="regular_paragraph text-[9px] mb-1" style={{
                    color: '#f20e0e',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}>
                    TO
                  </div>
                  <div className="regular_paragraph text-sm" style={{
                    color: '#777777',
                    fontWeight: 400,
                  }}>
                    Loved One
                  </div>
                </div>
              </div>
              
              {/* Title Preview */}
              <div>
                <div className="jenny-title text-4xl md:text-5xl" style={{
                  fontWeight: 300,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  color: '#f20e0e',
                }}>
                  Spa Day
                </div>
              </div>
              
              {/* Footer Preview */}
              <div className="flex justify-between items-center pt-6 mt-2" style={{
                borderTop: '1px solid #e5e5e5',
              }}>
                <div>
                  <div className="regular_paragraph text-[9px] mb-1" style={{
                    color: '#f20e0e',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}>
                    VALID UNTIL
                  </div>
                  <div className="regular_paragraph text-sm" style={{
                    color: '#777777',
                    fontWeight: 400,
                  }}>
                    LIFETIME
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-24">
          <Link href="/create" className="y2k-button inline-block text-base md:text-lg">
            CREATE A HEARTPASS
          </Link>
        </div>
      </div>

      {/* Footer - Bottom */}
      <Footer />
    </div>
  );
}
