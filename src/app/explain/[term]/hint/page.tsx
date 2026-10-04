/**
 * The "I don't know" hint — `/explain/[term]/hint`.
 *
 * Not one of SPEC.md's 28 numbered frames, and no Figma frame exists for it.
 * SPEC.md calls "I don't know" a routing rule that "shows one hint, then the
 * reveal", which left it pointing at `11 Not quite, hint 1 of 2` — a screen
 * built around `VerdictHeader verdict="Miss" title="Not quite"` and an
 * `AnswerBlock kind="Said" label="What Knowie heard"`. Neither can be true
 * here: the student said nothing, so there is nothing to quote back and
 * nothing to be wrong about.
 *
 * So this is the same beat with the verdict taken out. `verdict="Neutral"`,
 * the same value 09c uses for a mic failure and 13 for the reveal, on the same
 * grounds voice-ux.md gives in "Be generous, and separate 'misheard' from
 * 'didn't know it'": a false wrong is the costly failure here, and admitting
 * you are stuck is not a wrong answer.
 *
 * It is one hint, not the ladder — the label reads "Hint", with no "1 of 2",
 * because there is no second rung. The term records as Revealed at 0 XP either
 * way (sprint-context.md).
 *
 * **The way out reads in the mode the student is already in** — the
 * session's input mode (`inputMode.ts`). In type mode "Have a go" leads back
 * to the field and the second half offers voice; in voice mode it is the
 * other way round. Either way both ways of answering stay on screen, which is
 * what keeps the text fallback reachable from every answerable state.
 */

import { notFound } from 'next/navigation';

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';
import { Button } from '@/components/button/Button';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { ActionStack } from '../../ActionStack';
import { ButtonPair } from '../../ButtonPair';
import { readInputMode } from '../../inputModeServer';
import { OtherModeButton } from '../../ModeButtons';
import { TERMS, isTermPosition, nextTermHref } from '../../session';
import { readQueue } from '../../requeueServer';
import { SessionAppBar } from '../SessionAppBar';

import './hintScreen.css';

export default async function HintPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();
  const queue = await readQueue();

  const current = TERMS[term];

  const inputMode = await readInputMode();
  const isText = inputMode.mode === 'type';

  return (
    <Scaffold
      size="iPhone 13"
      // Skip is live: the student can still act on this term. SPEC.md, Skip rule.
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term, queue)} />}
      middleContent={
        <div className="hintScreen-body">
          <VerdictHeader
            verdict="Neutral"
            title="No problem"
            caption="Here's a nudge before the answer."
            titleAs="h1"
          />
          {/* No "1 of 2" — this is the only hint on this path. And no key-idea
              chips on a hint screen: they give the answer away. */}
          <AnswerBlock kind="Hint" label="Hint" body={current.unknownHint} />
        </div>
      }
      bottomContent={
        <ActionStack
          /* sprint-context.md locks the path as one hint, then the reveal —
             "a student who says they do not know has already told you the
             ladder will not help" — so the reveal is the forward action and
             takes the screen's one Primary. */
          primary={
            <Button
              variant="Primary"
              size="L"
              CTA="Show me the answer"
              showRightIcon
              rightIcon="arrow-right"
              /* No `tries`: nothing was said, so the reveal credits nothing.
                 A caption claiming an attempt here would be a lie. */
              href={`/explain/${term}/answer`}
            />
          }
          /* Still an answerable state, so both ways of answering stay open —
             the text fallback is reachable from every one of them. */
          below={
            <ButtonPair>
              {/* "Have a go" is the same offer in both rows — answer this
                  term after all — and it points at whichever way the student
                  was already answering. The second half is the other way,
                  named for where it goes rather than for what it is not. */}
              <Button
                variant="Secondary"
                size="M"
                CTA="Have a go"
                showLeftIcon
                leftIcon={isText ? 'keyboard-01' : 'microphone-01'}
                href={isText ? `/explain/${term}/type` : `/explain/${term}/recording`}
              />
              <OtherModeButton
                inputMode={inputMode}
                voiceHref={`/explain/${term}/recording`}
                typeHref={`/explain/${term}/type`}
              />
            </ButtonPair>
          }
        />
      }
    />
  );
}
