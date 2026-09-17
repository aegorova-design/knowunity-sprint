/**
 * A row of ways out: Secondary M buttons sharing the width in equal halves at
 * Space/200.
 *
 * Four screens had built this row by hand — `06 Idle`, the hint screen, `04
 * First run, mic primer` and `14 Permission denied` — in four files whose
 * rules were identical.
 *
 * Deliberately not `buttonGroup`'s Horizontal variant, which is a different
 * shape: that one pairs a `buttonIcon` hugging its square with a Primary that
 * fills, so it carries one label. This carries two, at equal width.
 *
 * One child is a supported case, not a degenerate one: it fills the row, which
 * is what `05b` and `09c` ask for. The children are laid out by the row rather
 * than sized by themselves — `button` fills whatever box it is given.
 *
 * Usually the `below` of an `ActionStack`, but it stands on its own where
 * there is no Primary to sit under: on `06 Idle` the mic is the main action,
 * so the two ways out are the whole bottom row.
 *
 * It sits with the screens rather than in `src/components` for the same reason
 * `ActionStack` does.
 */

import type { ReactNode } from 'react';

import './buttonPair.css';

export function ButtonPair({ children }: { children: ReactNode }) {
  return <div className="buttonPair">{children}</div>;
}
