/**
 * Where a real judge verdict sends the student — the real-mode counterpart
 * to `script.ts`'s scripted `VERDICTS` table, driven by an actual response
 * instead of a fixed per-term script.
 */

import { FIRST_ATTEMPT } from './script';
import type { JudgeVerdict } from './turnStore';

/**
 * `unclear` routes to `not-heard` — the same screen the "no audio at all"
 * case already uses. Both are neutral, cost no rung and ask for a retry
 * (sprint plan, stage C, rule 2: unclear "doesn't count as an attempt or use
 * a hint"). `not-heard` already sends the student back with the same
 * `attempt` it arrived on, unchanged, which is exactly that rule.
 *
 * `pass`/`partial`/`miss` reuse the same three destinations the scripted
 * ladder does. Rule 1: the third attempt on a term that isn't a pass reveals
 * the answer, which is `last-miss` — the screen that already, on its one
 * button, leads to the reveal.
 */
export function realVerdictSegment(attempt: number, verdict: JudgeVerdict['verdict']): string {
  if (verdict === 'unclear') return 'not-heard';
  if (verdict === 'pass') return attempt > FIRST_ATTEMPT ? 'pass-hinted' : 'pass';
  return attempt >= FIRST_ATTEMPT + 2 ? 'last-miss' : attempt === FIRST_ATTEMPT ? 'hint-1' : 'hint-2';
}
