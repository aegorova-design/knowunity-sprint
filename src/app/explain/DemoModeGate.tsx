'use client';

/**
 * Applies `?demo=` to storage on every navigation, and shows the small
 * "Demo" badge while the flag is on. See `demoMode.ts` for why the flag
 * lives in `sessionStorage` rather than riding the URL like `attempt` does.
 *
 * Lives in its own client component, wrapped in `<Suspense>` by
 * `layout.tsx`, so that reading the URL here does not force every screen
 * under `/explain` into dynamic rendering — most of them would otherwise
 * lose their static prerender just to support a param almost no visitor
 * passes.
 */

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { applyDemoParam, useIsDemoMode } from './demoMode';

import './demoBadge.css';

export function DemoModeGate() {
  const demoParam = useSearchParams().get('demo');

  // Storage is the only thing the effect touches — an external system, which
  // is what an effect is for.
  useEffect(() => {
    applyDemoParam(demoParam);
  }, [demoParam]);

  const storedDemo = useIsDemoMode();

  // An explicit `?demo=` on this URL wins outright; with none present, this
  // falls back to whatever a previous navigation already saved.
  const isDemo = demoParam === '1' ? true : demoParam === '0' ? false : storedDemo;

  if (!isDemo) return null;

  return (
    <div className="explainDemoBadge" role="status" aria-label="Demo mode">
      Demo
    </div>
  );
}
