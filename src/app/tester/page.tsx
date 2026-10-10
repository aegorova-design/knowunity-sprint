'use client';

/**
 * The tester launcher — `/tester`. Facilitator tooling, not a designed screen.
 * It sits behind the tester passcode like the rest of real mode
 * (`PasscodeGate`), and turns demo mode off for this tab. A facilitator gets
 * back here from Home by pressing and holding Knowie for two seconds
 * (`FacilitatorHold`).
 *
 * - **1 week until exam: first session** — Home as it is before any session.
 * - **Plan states** — a view-only preview of the plan after a session, with
 *   the revisit due two days later, or mastered, without running the revisit
 *   session (`setPlanPreview` in `outcomes.ts`). They read this browser's own
 *   results when there are any, else a sample, and write nothing.
 * - **Reset tester data** — clears this browser's results, recordings, input
 *   mode and requeue, after a confirmation on the screen.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { applyDemoParam } from '../explain/demoMode';
import {
  continueHref,
  previewUsesOwnResults,
  readPreviewOutcomes,
  setPlanPreview,
  type PlanPreview,
} from '../explain/outcomes';
import { PLAN_MASTERED_HREF, PLAN_TO_REVISIT_HREF } from '../plan/planHref';
import { prepareFirstSession, resetTesterData } from './testerData';

import './tester.css';

type Launch = { state: PlanPreview; label: string; href: string; source: string };

function launches(): Launch[] {
  const own = previewUsesOwnResults('after');
  const ownDue = previewUsesOwnResults('due');
  return [
    {
      state: 'after',
      label: 'After a session',
      href: continueHref(readPreviewOutcomes('after')),
      source: own ? 'This browser’s results' : 'Sample results',
    },
    {
      state: 'due',
      label: 'Revisit due (2 days later)',
      href: PLAN_TO_REVISIT_HREF,
      source: ownDue ? 'This browser’s results' : own ? 'Sample results: none of yours need a revisit' : 'Sample results',
    },
    {
      state: 'mastered',
      label: 'Mastered',
      href: PLAN_MASTERED_HREF,
      source: own ? 'This browser’s results, every term unaided' : 'Sample results, every term unaided',
    },
  ];
}

function subscribeToNothing() {
  return () => {};
}

export default function TesterPage() {
  // Rendered on the client only (the passcode gate renders nothing on the
  // server); the labels are read fresh on every render, so a reset updates them.
  const isClient = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    applyDemoParam('0');
  }, []);

  const items = isClient ? launches() : [];

  return (
    <Scaffold
      size="iPhone 13"
      showTopNavSlot={false}
      middleContent={
        <div className="tester">
          <h1 className="tester-title">Tester launcher</h1>

          <section className="tester-section" aria-labelledby="tester-session">
            <h2 className="tester-heading" id="tester-session">
              Session
            </h2>
            <div className="tester-item">
              <Button
                variant="Primary"
                size="M"
                CTA="1 week until exam: first session"
                href="/"
                onClick={prepareFirstSession}
              />
              <p className="tester-note">
                Home before any session, in voice. Stored results stay until you reset them.
              </p>
            </div>
          </section>

          <section className="tester-section" aria-labelledby="tester-plan-states">
            <h2 className="tester-heading" id="tester-plan-states">
              Plan states
            </h2>
            <p className="tester-note">
              View only: nothing is saved, and practising opens a placeholder. Starting a new session ends it.
            </p>
            {items.map((item) => (
              <div className="tester-item" key={item.state}>
                <Button
                  variant="Secondary"
                  size="M"
                  CTA={item.label}
                  href={item.href}
                  onClick={() => setPlanPreview(item.state)}
                />
                <p className="tester-note">{item.source}</p>
              </div>
            ))}
          </section>

          <section className="tester-section" aria-labelledby="tester-reset">
            <h2 className="tester-heading" id="tester-reset">
              Tester data
            </h2>
            {confirmingReset ? (
              <div className="tester-item" role="group" aria-label="Confirm reset">
                <p className="tester-note">
                  Clear this browser’s results, recordings, input mode and requeue? This can’t be undone.
                </p>
                <Button
                  variant="Primary"
                  size="M"
                  CTA="Yes, reset"
                  onClick={() => {
                    resetTesterData();
                    setConfirmingReset(false);
                    setResetDone(true);
                  }}
                />
                <Button variant="Tertiary" size="M" CTA="Cancel" onClick={() => setConfirmingReset(false)} />
              </div>
            ) : (
              <div className="tester-item">
                <Button
                  variant="Secondary"
                  size="M"
                  CTA="Reset tester data"
                  onClick={() => {
                    setResetDone(false);
                    setConfirmingReset(true);
                  }}
                />
                <p className="tester-note" role="status">
                  {resetDone ? 'Tester data cleared.' : 'For the next tester on this device.'}
                </p>
              </div>
            )}
          </section>
        </div>
      }
    />
  );
}
