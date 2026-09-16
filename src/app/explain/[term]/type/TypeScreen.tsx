'use client';

/**
 * The two states of the text fallback, on one route.
 *
 * SPEC.md screen 23 is "15 + 16" — Empty and Filled are not two screens but
 * one field the student types into, so the state lives here rather than in the
 * URL. This is the only part of the screen that needs to be a client
 * component; the prompt and the app bar are rendered on the server and handed
 * in as props, so they stay off the client bundle.
 */

import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { TextField } from '@/components/text-field/TextField';

import './typeScreen.css';

export function TypeScreen({
  appBar,
  prompt,
  sendHref,
  voiceHref,
}: {
  appBar: ReactNode;
  prompt: ReactNode;
  /** Where a sent answer goes to be judged. */
  sendHref: string;
  /** Back to the mic on this same term. */
  voiceHref: string;
}) {
  const [answer, setAnswer] = useState('');
  const helperId = useId();

  // SPEC.md: an empty field leaves Send answer disabled. Length judging is the
  // checking screen's job, not this one's — anything typed can be sent.
  const isEmpty = answer.trim().length === 0;

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={appBar}
      // Figma puts the prompt alone in middleContent — the field lives down in
      // the thumb zone with the buttons, not under the question.
      middleContent={prompt}
      bottomContent={
        // Figma's "bottom stack": the field group over the action group at
        // Space/400. scaffold.css owns the zone's own inset.
        <div className="typeScreen-bottom">
          <div className="typeScreen-field">
            <TextField
              label="Your explanation"
              state={isEmpty ? 'Empty' : 'Filled'}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              aria-describedby={helperId}
              autoFocus
            />
            {/* A helper line under a field. Not a Storybook component —
                textField carries no helper of its own. Logged in
                component-gaps.md. Tied to the field by aria-describedby so a
                screen reader reads the reassurance with the field, not after
                it. Caption M Regular, left aligned, straight off the frame. */}
            <p className="typeScreen-helper" id={helperId}>
              Typed answers are judged the same way and count the same.
            </p>
          </div>

          <div className="typeScreen-actions">
            <Button
              variant="Primary"
              size="L"
              CTA="Send answer"
              showRightIcon
              rightIcon="arrow-right"
              state={isEmpty ? 'Disabled' : 'Default'}
              href={isEmpty ? undefined : sendHref}
            />
            {/* Tertiary, not the Secondary SPEC.md names — the frame draws it
                Tertiary, and the frame wins on visual detail. The way back to
                voice stays on screen in both states: text is the fallback, not
                a one-way door. */}
            <Button
              variant="Tertiary"
              size="M"
              CTA="Switch to voice"
              showLeftIcon
              leftIcon="microphone-01"
              href={voiceHref}
            />
          </div>
        </div>
      }
    />
  );
}
