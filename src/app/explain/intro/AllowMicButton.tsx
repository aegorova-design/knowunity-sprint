'use client';

/**
 * Allow mic — the one control in this prototype that touches a real browser
 * API. SPEC.md screen 7: "Allow mic (fires the browser permission prompt)",
 * granted goes to `/explain/1` and denied to `/explain/denied`.
 *
 * Nothing is recorded. The stream is opened only to make the browser ask, and
 * every track is stopped again before the route changes, so the recording
 * indicator does not stay lit behind the session. Real speech recognition is
 * still mocked — sprint-context.md — and this asks for nothing else.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/button/Button';

export function AllowMicButton({
  grantedHref,
  deniedHref,
}: {
  grantedHref: string;
  deniedHref: string;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);

  async function askForTheMic() {
    setAsking(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      router.push(grantedHref);
    } catch {
      // Either the student said no, or there is no mediaDevices to ask — an
      // insecure origin, or a browser without it. Both leave the student
      // unable to speak to this page, which is the dead end 14 is for.
      router.push(deniedHref);
    }
  }

  return (
    <Button
      variant="Primary"
      size="L"
      CTA="Allow mic"
      showLeftIcon
      leftIcon="microphone-01"
      state={asking ? 'Loading' : 'Default'}
      onClick={askForTheMic}
    />
  );
}
