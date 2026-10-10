'use client';

/**
 * `01 Home`'s exam line. A week out at the first session; a plan-state
 * preview moves it closer by the days the preview is set after the session,
 * so Home agrees with the plan (`useExamDaysLeft`).
 */

import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { examCountdown, useExamDaysLeft } from './explain/outcomes';
import { SUBJECT } from './plan/planData';

export function HomeExamHeader() {
  const days = useExamDaysLeft('first');
  return (
    <VerdictHeader
      verdict="Neutral"
      titleAs="h1"
      title={`Your ${SUBJECT} exam is in ${examCountdown(days)}`}
      showCaption={false}
    />
  );
}
