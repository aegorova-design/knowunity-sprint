'use client';

/**
 * The buttons that change, or answer in, the session's input mode
 * (`inputMode.ts`). A tap on Type instead or Switch to voice is the only thing
 * that changes the mode, so it is set here, on the tap, before the link
 * navigates.
 */

import { useEffect, useState, type ComponentProps } from 'react';

import { Button } from '@/components/button/Button';

import { withQuery } from './href';
import { setInputMode, type InputMode, type InputModeState } from './inputMode';

type ButtonProps = ComponentProps<typeof Button>;

export function SetModeButton({ setsMode, ...props }: ButtonProps & { setsMode: InputMode }) {
  return <Button {...props} onClick={() => setInputMode(setsMode)} />;
}

/** `/explain/denied/how`, returning to `back` when dismissed. */
export function micHelpHref(back: string): string {
  return withQuery('/explain/denied/how', { back });
}

/**
 * The way back to voice after the mic was refused: an explainer on turning it
 * on, not a live switch. Once the browser reports the mic allowed again, it
 * becomes the switch — the denied screen promises voice comes back.
 */
function MicDeniedButton({ voiceHref, back }: { voiceHref: string; back: string }) {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    navigator.permissions
      ?.query({ name: 'microphone' as PermissionName })
      .then((status) => {
        if (!cancelled) setGranted(status.state === 'granted');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (granted) {
    return (
      <SetModeButton
        setsMode="voice"
        variant="Secondary"
        size="M"
        CTA="Switch to voice"
        showLeftIcon
        leftIcon="microphone-01"
        href={voiceHref}
      />
    );
  }

  return (
    <Button
      variant="Secondary"
      size="M"
      CTA="Turn on mic"
      showLeftIcon
      leftIcon="help-circle"
      href={micHelpHref(back)}
    />
  );
}

/** The Secondary that offers the mode the student is not in. */
export function OtherModeButton({
  inputMode,
  voiceHref,
  typeHref,
}: {
  inputMode: InputModeState;
  /** Where Switch to voice goes. */
  voiceHref: string;
  /** Where Type instead goes — and, when the mic is refused, where its explainer returns to. */
  typeHref: string;
}) {
  if (inputMode.micDenied) return <MicDeniedButton voiceHref={voiceHref} back={typeHref} />;

  if (inputMode.mode === 'type') {
    return (
      <SetModeButton
        setsMode="voice"
        variant="Secondary"
        size="M"
        CTA="Switch to voice"
        showLeftIcon
        leftIcon="microphone-01"
        href={voiceHref}
      />
    );
  }

  return (
    <SetModeButton
      setsMode="type"
      variant="Secondary"
      size="M"
      CTA="Type instead"
      showLeftIcon
      leftIcon="keyboard-01"
      href={typeHref}
    />
  );
}
