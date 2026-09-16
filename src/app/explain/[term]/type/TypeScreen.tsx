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
      middleContent={
        <div className="typeScreen-body">
          {prompt}
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
                component-gaps.md. It is tied to the field by aria-describedby
                so a screen reader reads the reassurance with the field, not
                after it. */}
            <p className="typeScreen-helper" id={helperId}>
              Typed answers are judged the same way and count the same.
            </p>
          </div>
        </div>
      }
      bottomContent={
        <div className="typeScreen-actions">
          <div className="typeScreen-send">
            <Button
              variant="Primary"
              size="L"
              CTA="Send answer"
              showRightIcon
              rightIcon="arrow-right"
              state={isEmpty ? 'Disabled' : 'Default'}
              href={isEmpty ? undefined : sendHref}
            />
          </div>
          {/* The way back to voice stays on the screen in both states: text is
              the fallback, not a one-way door. */}
          <div className="typeScreen-send">
            <Button
              variant="Secondary"
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
