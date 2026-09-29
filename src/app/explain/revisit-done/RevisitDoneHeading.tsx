'use client';

/**
 * The heading on `20b Revisit complete`: which terms came back, read off the
 * session's outcomes — every term it did not leave unaided. The script in
 * demo mode (Hibernation and Mammal, so "both"); whatever actually happened in
 * real mode, so the title has to carry the count rather than lean on "both".
 */

import { MascotHeading } from '../MascotHeading';
import { dueTerms, joinNames, useSessionOutcomes } from '../outcomes';

function title(count: number): string {
  if (count === 1) return 'You got it on your own';
  if (count === 2) return 'You got both terms on your own';
  return `You got all ${count} terms on your own`;
}

export function RevisitDoneHeading() {
  const outcomes = useSessionOutcomes();
  if (!outcomes) return null;

  const due = dueTerms(outcomes);

  return (
    <MascotHeading
      /* Excited: a recovery is the one moment in the flow worth celebrating.
         The title beside her carries it, so the pose is never the only thing
         saying so. */
      pose="Excited"
      title={title(due.length)}
      caption={`${joinNames(due)} needed help last time. You explained ${
        due.length === 1 ? 'it' : 'them'
      } unaided this time. One more check before your exam.`}
    />
  );
}
