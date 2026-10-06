'use client';

/**
 * The heading on `20b Revisit complete`: which terms came back, read off the
 * session's outcomes — every term it did not leave unaided. The script in
 * demo mode (Hibernation and Mammal, so "both"); whatever actually happened in
 * real mode, so the title has to carry the count rather than lean on "both".
 */

import { useEffect } from 'react';

import { readDemoMode } from '../demoMode';
import { MascotHeading } from '../MascotHeading';
import { dueTerms, joinNames, markDemoRevisited, useDemoRevisitedTerms, useLatestOutcomes } from '../outcomes';

function title(count: number): string {
  if (count === 1) return 'You got it on your own';
  if (count === 2) return 'You got both terms on your own';
  return `You got all ${count} terms on your own`;
}

export function RevisitDoneHeading() {
  const outcomes = useLatestOutcomes();
  const revisited = useDemoRevisitedTerms();
  // The terms this revisit brought back: the ones still due when it ran. Once
  // demo mode has written them as revisited they are no longer due, so the
  // written list is what keeps the heading naming them.
  const due = revisited ?? (outcomes ? dueTerms(outcomes) : null);

  // The stubbed revisit stands for a session the student explained unaided,
  // so in demo mode it records that: the review on the mastered plan then
  // matches its "3 of 3" header. Real mode has no revisit session yet and
  // writes nothing here.
  useEffect(() => {
    if (readDemoMode() && outcomes && !revisited) markDemoRevisited(dueTerms(outcomes));
  }, [outcomes, revisited]);

  if (!due) return null;

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
