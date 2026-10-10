'use client';

/**
 * Real mode starts with the tester passcode: until this browser session has
 * entered it, every screen shows the passcode ask instead of itself. Demo mode
 * (`?demo=1`, or saved) skips it. `/voice-test` keeps its own ask.
 *
 * Nothing behind the gate mounts until it opens, so no screen's effects — a
 * mic, a judge call — can run behind it. That is also why it renders nothing
 * on the server: whether demo mode is on lives in `sessionStorage`.
 */

import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';

import { Scaffold } from '@/components/scaffold/Scaffold';

import { applyDemoParam, readDemoMode, useIsDemoMode } from './explain/demoMode';
import { VoicePasscodePrompt } from './explain/VoicePasscodePrompt';

import './passcodeGate.css';

const UNGATED = ['/voice-test'];

function subscribeToNothing() {
  return () => {};
}

export function PasscodeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isClient = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const isDemo = useIsDemoMode();
  const [status, setStatus] = useState<'checking' | 'open' | 'locked'>('checking');

  useEffect(() => {
    // `?demo=` on any URL saves the flag, not only under /explain.
    applyDemoParam(new URLSearchParams(window.location.search).get('demo'));
    if (readDemoMode()) return;

    let cancelled = false;
    fetch('/api/voice-test/verify')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStatus(data.authenticated === true ? 'open' : 'locked');
      })
      .catch(() => {
        if (!cancelled) setStatus('locked');
      });
    return () => {
      cancelled = true;
    };
  }, [isDemo]);

  if (UNGATED.some((path) => pathname.startsWith(path))) return children;
  if (!isClient) return null;
  if (isDemo || status === 'open') return children;
  if (status === 'checking') return null;

  return (
    <Scaffold
      size="iPhone 13"
      showTopNavSlot={false}
      middleContent={
        <div className="passcodeGate">
          <VoicePasscodePrompt titleAs="h1" onUnlocked={() => setStatus('open')} />
        </div>
      }
    />
  );
}
