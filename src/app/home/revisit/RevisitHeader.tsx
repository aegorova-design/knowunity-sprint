'use client';

/**
 * The exam line on `20 Home, revisit`, with "N terms to revisit" counted off
 * the session's outcomes — the script in demo mode, what was recorded in real
 * mode. The caption stays off until the count can be read.
 */

import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { dueTerms, useSessionOutcomes } from '../../explain/outcomes';
import { SUBJECT } from '../../plan/planData';

export function RevisitHeader() {
  const outcomes = useSessionOutcomes();
  const due = outcomes ? dueTerms(outcomes).length : null;

  return (
    <VerdictHeader
      verdict="Neutral"
      titleAs="h1"
      title={`Your ${SUBJECT} exam is in 5 days`}
      caption={due === null ? '' : `${due} ${due === 1 ? 'term' : 'terms'} to revisit`}
      showCaption={due !== null}
    />
  );
}
