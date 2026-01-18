'use client';

import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Pages that don't need layout wrapper (they have their own navigation)
  const isAuthPage = pathname?.startsWith('/auth');
  const isHomePage = pathname === '/';
  const isCardPage = pathname?.startsWith('/card');
  const isCreatePage = pathname === '/create';

  // These pages use their own navigation, so just pass through
  if (isAuthPage || isHomePage || isCardPage || isCreatePage) {
    return <>{children}</>;
  }

  // For dashboard pages, just return children with background
  // They'll use their own navigation structure matching the existing style
  return <div style={{ background: '#FFFEEF', minHeight: '100vh' }}>{children}</div>;
}
