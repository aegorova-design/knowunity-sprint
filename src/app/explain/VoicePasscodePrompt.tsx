'use client';

/**
 * The tester passcode — the same one as `/voice-test`, checked by
 * `/api/voice-test/verify`, which sets the session cookie the transcribe and
 * judge routes require. Shown as the very first screen in real mode
 * (`PasscodeGate`), and again inline on the checking screen if that cookie
 * has gone. Demo mode never asks.
 *
 * The field is a plain password input set from the same tokens as
 * `textField`: `textField` is a textarea and cannot mask what is typed. Logged
 * in component-gaps.md.
 */

import { useId, useState } from 'react';

import { Button } from '@/components/button/Button';
import { TextBlock } from '@/components/text-block/TextBlock';

import './voicePasscodePrompt.css';

export function VoicePasscodePrompt({ onUnlocked, titleAs = 'h2' }: { onUnlocked: () => void; titleAs?: 'h1' | 'h2' }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const errorId = useId();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setError('');
    setChecking(true);
    try {
      const res = await fetch('/api/voice-test/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        onUnlocked();
        return;
      }
      setError('That passcode didn’t work. Check it and try again.');
    } catch {
      setError('Couldn’t check the passcode. Try again.');
    }
    setChecking(false);
  };

  return (
    <form className="passcodePrompt" onSubmit={submit}>
      <TextBlock
        variant="M"
        title="Enter the tester passcode"
        caption="Your facilitator has it. You only need it once."
        showCaption
        titleAs={titleAs}
      />
      <input
        className="passcodePrompt-field"
        type="password"
        aria-label="Passcode"
        placeholder="Passcode"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={passcode}
        onChange={(e) => setPasscode(e.target.value.trim())}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p className="passcodePrompt-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
      <Button
        variant="Primary"
        size="L"
        CTA="Unlock"
        type="submit"
        state={checking ? 'Loading' : passcode ? 'Default' : 'Disabled'}
      />
    </form>
  );
}
