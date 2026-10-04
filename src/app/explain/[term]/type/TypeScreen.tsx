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

import { ActionStack } from '../../ActionStack';
import { ButtonPair } from '../../ButtonPair';
import { withQuery } from '../../href';
import { readTurn, setTypedAnswer } from '../../turnStore';

import './typeScreen.css';

export function TypeScreen({
  appBar,
  prompt,
  sendHref,
  hintHref,
  otherMode,
  keepAnswer = false,
  sheet,
}: {
  /** A sheet over the screen — `06b Leave session` in type mode. Marks everything under it inert. */
  sheet?: ReactNode;
  appBar: ReactNode;
  prompt: ReactNode;
  /** Where a sent answer goes to be judged. */
  sendHref: string;
  /** The "I don't know" path: one hint, then the reveal. */
  hintHref: string;
  /** The way back to voice — or, with the mic refused, the explainer on turning it on. */
  otherMode: ReactNode;
  /** Start filled with the typed answer still in `turnStore` — one that was sent but never judged. */
  keepAnswer?: boolean;
}) {
  // Read once, on the client navigation that brings the student back. After
  // a reload the store is empty, so this is '' on the server and the client
  // alike, and hydration has nothing to disagree about.
  const [answer, setAnswer] = useState(() => (keepAnswer ? (readTurn().typedAnswer ?? '') : ''));
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
      middleContent={sheet ? <div inert>{prompt}</div> : prompt}
      showBottomSheetBackground={sheet !== undefined}
      bottomSheetOnly={sheet}
      bottomContent={
        // Figma's "bottom stack": the field group over the action group at
        // Space/400. scaffold.css owns the zone's own inset.
        <div className="typeScreen-bottom" inert={sheet !== undefined || undefined}>
          <div className="typeScreen-field">
            <TextField
              label="Your explanation"
              state={isEmpty ? 'Empty' : 'Filled'}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              aria-describedby={helperId}
              autoFocus={sheet === undefined}
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

          <ActionStack
            primary={
              <Button
                variant="Primary"
                size="L"
                CTA="Send answer"
                showRightIcon
                rightIcon="arrow-right"
                state={isEmpty ? 'Disabled' : 'Default'}
                // The length rides on the URL — the scripted checking screen
                // still reads it synchronously, server-side, to pick a demo
                // verdict. The words themselves go to the in-memory store
                // instead: real mode's judge (stage C) reads the student's
                // actual answer from there, never from the URL.
                onClick={isEmpty ? undefined : () => setTypedAnswer(answer.trim())}
                href={
                  isEmpty ? undefined : withQuery(sendHref, { typed: answer.trim().length })
                }
              />
            }
            /* Two ways out now, so the frame's lone full-width Tertiary
               becomes the `ButtonPair` every other screen in the flow uses,
               at the Secondary M that SPEC.md names for Switch to voice and
               that `06 Idle` draws for both halves. The Tertiary was the
               frame's answer to a single button in the row; it is not one any
               more, and a Secondary beside a Tertiary would read as a
               hierarchy that is not there. Reported with the build.

               "I don't know" takes the left half on both screens that carry
               it, so the same control keeps the same place whichever way the
               student is answering. It is a way out of the term, not a way
               out of text, which is why it sits beside Switch to voice rather
               than replacing it.

               The way back to voice stays on screen in both states: text is
               the fallback, not a one-way door. */
            below={
              <ButtonPair>
                <Button
                  variant="Secondary"
                  size="M"
                  CTA="I don’t know"
                  showLeftIcon
                  leftIcon="help-circle"
                  /* No `attempt`: the hint is the same single nudge wherever
                     it is asked for, and the term is bound for Revealed at 0
                     XP either way (sprint-context.md). */
                  href={hintHref}
                />
                {otherMode}
              </ButtonPair>
            }
          />
        </div>
      }
    />
  );
}
