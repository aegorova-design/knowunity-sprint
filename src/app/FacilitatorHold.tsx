'use client';

/**
 * The facilitator's way back to the tester launcher from Home: press and hold
 * Knowie's header for two seconds. A tap, a scroll or a brief press does
 * nothing, so a tester will not hit it by accident, and it needs no visible
 * control on a student-facing screen. Works with touch and a mouse.
 */

import { useRouter } from 'next/navigation';
import { useRef, type ReactNode } from 'react';

import './facilitatorHold.css';

const HOLD_MS = 2000;
const LAUNCHER_HREF = '/tester';

export function FacilitatorHold({ children }: { children: ReactNode }) {
  const router = useRouter();
  const timer = useRef<number | null>(null);

  const cancel = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <div
      className="facilitatorHold"
      onPointerDown={() => {
        cancel();
        timer.current = window.setTimeout(() => router.push(LAUNCHER_HREF), HOLD_MS);
      }}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
    </div>
  );
}
