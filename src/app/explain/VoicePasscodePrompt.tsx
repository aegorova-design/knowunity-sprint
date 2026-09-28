'use client';

/**
 * The one moment real mode asks for the `/voice-test` passcode — right
 * before the first real transcribe/judge call a session makes, on
 * `09 Processing`. Sprint plan, stage C, rule 5: "Real mode sits behind the
 * same passcode as /voice-test, entered once per session." The session
 * cookie `/api/voice-test/verify` sets is what makes "once per session"
 * true after this: every later real turn's `CheckingWait` checks first and,
 * finding it already set, never shows this again.
 *
 * Deliberately plain, matching `/voice-test`'s own form rather than
 * reaching for design-system components here: this is a debug/test gate,
 * not a designed screen SPEC.md accounts for.
 */

import { useState } from 'react';

export function VoicePasscodePrompt({ onUnlocked }: { onUnlocked: () => void }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/voice-test/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        onUnlocked();
      } else {
        setError('Invalid passcode');
      }
    } catch {
      setError('Verification failed');
    }
  };

  return (
    <div style={{ maxWidth: '320px', margin: '80px auto', padding: '20px', fontFamily: 'monospace' }}>
      <p style={{ marginBottom: '10px' }}>Real mode needs the voice-test passcode.</p>
      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="Passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '8px' }}>
          Unlock
        </button>
      </form>
      {error && <div style={{ color: 'var(--color-text-error)', marginTop: '10px' }}>{error}</div>}
    </div>
  );
}
