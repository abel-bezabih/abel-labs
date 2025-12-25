'use client';

import { Nav } from './nav';
import { Footer } from './footer';
import { PageTransition } from './page-transition';
import { AnimatedBackground } from './animated-background';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      <Nav />
      <div className="pt-16 min-h-screen flex flex-col relative z-10">
        <PageTransition>
          <div className="flex-grow">{children}</div>
        </PageTransition>
        <Footer />
      </div>
    </>
  );
}



