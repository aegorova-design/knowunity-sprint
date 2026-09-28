/**
 * Wraps every `/explain/*` route with the demo-mode badge. The only reason
 * this layout exists: `Scaffold` is a design-system component and the badge
 * is app-specific chrome, so it does not belong inside Scaffold, and there
 * is no other single place ~30 screens all pass through except this one.
 */

import { Suspense, type ReactNode } from 'react';

import { DemoModeGate } from './DemoModeGate';

export default function ExplainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <DemoModeGate />
      </Suspense>
    </>
  );
}
