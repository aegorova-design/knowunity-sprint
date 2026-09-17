/**
 * The "You covered" group: the label over the key ideas a passing answer
 * covered, all of them ticked.
 *
 * `10 Got it` and `10b Got it, after a hint` draw it identically — same label,
 * same chips, same Space/300 between them — so by the rule in
 * `component-gaps.md` it stops being copied. The label stays a prop because
 * `13`, `13b` and `18` used to draw the same chips under "The key ideas";
 * those three moved into `answerBlock`'s Answer variant, which carries its own
 * group now, so the two pass screens are what is left.
 *
 * It sits with the screens rather than in `src/components` for the same reason
 * `ActionStack`, `ButtonPair`, `SheetPanel` and `SessionAppBar` do:
 * design-system.md's "Never invent a component to fill a gap" is about the
 * design system, and this is a composition of `chips` and a token-set label,
 * not a new part of the system.
 *
 * The label is a heading, not a plain line. It names the set under it, so a
 * screen reader reaches four covered ideas as one thing instead of four loose
 * controls — which matters more here than usual, because `chips` renders a
 * button whatever it is handed. See `component-gaps.md`.
 */

import { Chips, type ChipsActive } from '@/components/chips/Chips';

import './coveredIdeas.css';

/** One id on the page: no screen shows two of these. */
const LABEL_ID = 'coveredIdeas-label';

export function CoveredIdeas({
  label,
  ideas,
  active = 'True',
}: {
  /** What the group is called. "You covered" on a pass, per the frames. */
  label: string;
  /** The term's key ideas, in the order `session.ts` lists them. */
  ideas: readonly string[];
  /**
   * Whether the ideas are ticked. `True` on a pass, where they are a record of
   * what the student covered; `False` on `13 Answer revealed`, where they are
   * the four ideas the answer contains and the student has not said any of
   * them yet. `13b` ticks them, once they have.
   */
  active?: ChipsActive;
}) {
  return (
    <section className="coveredIdeas" aria-labelledby={LABEL_ID}>
      <h2 className="coveredIdeas-label" id={LABEL_ID}>
        {label}
      </h2>
      <ul className="coveredIdeas-chips">
        {ideas.map((idea) => (
          <li key={idea}>
            {/* Never a set of options to choose from, whichever way `active`
                falls: ticked, it records what the student covered; unticked,
                it lists what the answer covers. */}
            <Chips size="S" active={active} showLeftIcon={false} showRightIcon={false} Text={idea} />
          </li>
        ))}
      </ul>
    </section>
  );
}
