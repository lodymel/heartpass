import Link from 'next/link';
import AuthButton from '@/components/AuthButton';

export default function Home() {
  return (
    <div className="min-h-screen relative flex items-center" style={{ background: '#FFFEEF' }}>
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'transparent' }}>
        <div className="container mx-auto px-0">
          <div className="flex items-center justify-between h-20 md:h-24 py-5">
            {/* Logo */}
            <Link href="/" className="nav-logo">
              <span className="jenny-title text-2xl md:text-3xl" style={{
                fontWeight: 300,
                letterSpacing: '-0.025em',
                lineHeight: 1,
                whiteSpace: 'nowrap'
              }}>
                HeartPass
              </span>
            </Link>
            
            {/* Navigation Links */}
            <div className="flex items-center gap-6 md:gap-8">
              <Link href="/about" className="nav-link">
                About
              </Link>
              <Link href="/gallery" className="nav-link">
                Gallery
              </Link>
              <AuthButton />
              <Link href="/create" className="nav-button-primary">
                BOARDING NOW
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-0 w-full">
        {/* Header - Margot Priolet Style - Centered */}
        <header className="flex flex-col items-center justify-center text-center pt-48 md:pt-56 mb-24 md:mb-32">
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

        {/* Ticket Preview - Minimal Style */}
        <div className="max-w-lg mx-auto mb-24">
          <div className="y2k-window p-12">
            <div className="space-y-8">
              {/* FROM / TO */}
              <div className="flex justify-between items-center pb-6 border-b border-[#e5e5e5]">
                <div>
                  <div className="jenny-label text-[10px] mb-2">From</div>
                  <div className="jenny-body text-base font-normal">You</div>
                </div>
                <div className="text-xl">→</div>
                <div className="text-right">
                  <div className="jenny-label text-[10px] mb-2">To</div>
                  <div className="jenny-body text-base font-normal">Loved One</div>
                </div>
              </div>
              
              {/* Experience */}
              <div>
                <div className="jenny-label text-[10px] mb-3">Experience</div>
                <div className="jenny-heading text-xl" style={{ fontWeight: 300, letterSpacing: '-0.025em' }}>Special Moment Together</div>
              </div>
              
              {/* Footer */}
              <div className="flex justify-between items-center pt-6 border-t border-[#e5e5e5]">
                <div>
                  <div className="jenny-label text-[9px] mb-1">Validity</div>
                  <div className="jenny-body text-xs font-normal">LIFETIME</div>
                </div>
                <div className="text-[9px] font-mono">#HP-2024</div>
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

        {/* Features - Minimal Style */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-3xl mb-4">🎫</div>
              <div className="jenny-label text-sm">Beautiful Tickets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">💝</div>
              <div className="jenny-label text-sm">For Loved Ones</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">♾️</div>
              <div className="jenny-label text-sm">Lifetime Validity</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
