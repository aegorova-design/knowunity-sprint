/**
 * The recall session's content and its position arithmetic, held in one place
 * so every term screen reads the same three terms and computes "where am I"
 * the same way. `[term]` is the position in the session — 1, 2, 3 — not the
 * term's name, per SPEC.md.
 *
 * The three terms are the ones the happy path in SPEC.md walks through.
 */

export const TERM_POSITIONS = ['1', '2', '3'] as const;

export type TermPosition = (typeof TERM_POSITIONS)[number];

export type Term = {
  position: TermPosition;
  /** The term itself, as the summary screen lists it. */
  name: string;
  /** The question Knowie asks, as the prompt heading. */
  prompt: string;
  /**
   * The single nudge "I don't know" earns. It points at the idea without
   * naming it — the reveal is one tap away and does the naming.
   *
   * Deliberately not the same text as `hints[0]`: the ladder's first rung
   * answers something the student actually said, and this one has nothing to
   * answer. See `/explain/[term]/hint`.
   */
  unknownHint: string;
  /**
   * What the mocked recogniser "heard", by attempt: `heard[0]` is the take
   * `11` quotes back, `heard[1]` the one `12` quotes, `heard[2]` the one `12b`
   * quotes. Judging is hard-coded (sprint-context.md), so the transcript is
   * scripted too — nothing the student says changes it.
   *
   * Three, not two, because `12b Not quite, last attempt` follows a take of
   * its own. The frame reuses `12`'s words there, which would show a student
   * their previous answer unchanged straight after speaking again — so each
   * attempt gets its own take here instead. See `component-gaps.md`.
   *
   * The quotation marks are part of the string, the way the frames set them:
   * `answerBlock kind="Said"` quotes by treatment, not by punctuation, and the
   * frames add the marks anyway so the passage reads as speech.
   */
  heard: readonly [string, string, string];
  /**
   * The hint ladder's two rungs — `11 Not quite, hint 1 of 2` shows the first,
   * `12 Partial, hint 2 of 2` the second. Each one answers the take above it
   * rather than restating the question.
   */
  hints: readonly [string, string];
  /**
   * The answer itself, as `13 Answer revealed` prints it. It names all four
   * key ideas in prose, because the chips beside it are the same four in a
   * word each — the block is what makes them mean something.
   */
  answer: string;
  /**
   * The key ideas a full answer covers — what `10 Got it` ticks off as chips
   * and what `13 Answer revealed` lists under the answer. Four per term, which
   * is what every Mockups v2 frame that draws them draws.
   *
   * They are the judging model made visible, so they live with the term rather
   * than with the screen that shows them: three screens show the same four.
   */
  keyIdeas: readonly string[];
};

/** Identical under every prompt: the ask is the same, only the term changes. */
const PROMPT_CAPTION = 'Explain it like you would to a classmate.';

export const TERM_PROMPT_CAPTION = PROMPT_CAPTION;

export const TERMS: Record<TermPosition, Term> = {
  '1': {
    position: '1',
    name: 'Feudalism',
    prompt: 'In your own words, what does feudalism mean?',
    unknownHint: 'Think about what a lord handed out, and what he expected back for it.',
    // Both takes and both rungs read off the Mockups v2 frames "11 Not quite,
    // hint 1 of 2" (13662:14538) and "12 Partial, hint 2 of 2" (13662:14543),
    // which draw this term even though the script never sends it here — term 1
    // passes. The typed path can still reach it, on an answer under 20
    // characters, and then this is the copy that shows.
    heard: [
      '“Feudalism was when people voted for local leaders who made laws for their area.”',
      '“Feudalism is when the king gives land to nobles, and peasants work it in exchange for protection.”',
      '“The nobles paid the king taxes out of the land, and the peasants did all the farming.”',
    ],
    hints: [
      'Nobody voted. Think about land. Who controlled it, and what did other people give in exchange for using it?',
      'What did the nobles give the king back? It was not money.',
    ],
    // Read off the Mockups v2 frame "13 Answer revealed" (13662:14544).
    answer:
      'Land was traded for loyalty and service. Nobles held land from the king and owed him support, and peasants worked that land in exchange for protection.',
    // Read off the Mockups v2 frame "10 Got it" (13662:14537). Frame 13 lists
    // the same four in a different order; one order is kept for both, because
    // the set is what matters and a reshuffle between two screens showing the
    // same term would read as a change.
    keyIdeas: ['Land', 'Loyalty and service', 'Protection', 'Peasant labour'],
  },
  '2': {
    position: '2',
    name: 'Serfdom',
    prompt: 'In your own words, what does serfdom mean?',
    unknownHint: 'Think about who was tied to the land, and what that stopped them doing.',
    // Written here, not read off a frame: every Mockups v2 frame that draws a
    // take draws Feudalism's, and this is the term the script actually walks
    // down the ladder. Pitched to miss one key idea at a time — the first take
    // has the wrong idea, the second has three of the four. A design-owner
    // call, flagged rather than buried.
    heard: [
      '“Serfdom is when people were slaves and the lord could sell them whenever he wanted.”',
      '“Serfs were peasants who had to stay on the land and farm it for the lord.”',
      '“Serfs stayed on the land and farmed it, and they handed the lord part of what they grew.”',
    ],
    hints: [
      'Not slaves — a serf came with the land rather than being owned apart from it. What could they not do, and what were they still allowed to keep?',
      'That is most of it. What did the serf get back from the lord in return for the work?',
    ],
    // Written here: no frame draws Serfdom's answer. Named so that each of
    // the four chips below has a clause of its own, which is what the frame's
    // Feudalism answer does.
    answer:
      'Serfs were bound to the land and could not leave it. They owed the lord labour and a share of the harvest, and kept in return the right to farm their own strips, and his protection.',
    // Read off the Mockups v2 frame "18 Summary, term tapped" (13662:14542),
    // the one frame that draws Serfdom's own chips rather than Feudalism's.
    keyIdeas: ['Bound to the land', 'Owed labour', 'Right to farm', 'Protection'],
  },
  '3': {
    position: '3',
    name: 'Manorialism',
    prompt: 'In your own words, what does manorialism mean?',
    unknownHint: 'Think about the estate itself — who worked it, and who it had to feed.',
    // Written here too, and for the same reason. The script only takes this
    // term to the first rung — attempt 2 passes — so the second take and the
    // second hint are there for the typed path and for completeness.
    heard: [
      '“Manorialism is basically the same as feudalism, it is about kings and knights.”',
      '“It is the manor, where the lord lived and the peasants farmed the land around it.”',
      '“The manor grew crops and sold them at the market in the nearest town.”',
    ],
    hints: [
      'Feudalism is the deal between the lords. Manorialism is the place it happened. Think about one estate, and who worked which part of it.',
      'You have the place. Now think about what that estate had to produce, and who it had to feed.',
    ],
    // Written here too, and named against the same four chips.
    answer:
      "The manor was the estate itself: the lord's own demesne, worked for him, and the plots the peasants farmed for themselves. Between them it had to feed everyone on it.",
    // Written here, not read off a frame: no Mockups v2 frame draws
    // Manorialism's chips — every one of them draws Feudalism's. Kept parallel
    // to the other two in register and length, and pitched at the same grain
    // as this term's own hint. A design-owner call, flagged rather than buried.
    keyIdeas: ['The estate', "Lord's demesne", 'Peasant plots', 'Self-sufficient'],
  },
};

export function isTermPosition(value: string): value is TermPosition {
  return (TERM_POSITIONS as readonly string[]).includes(value);
}

/** Terms in one recall session — the progress bar's denominator. */
export const TERM_COUNT = TERM_POSITIONS.length;

/**
 * How many terms the student has gone through before this one — what the
 * progress bar counts. SPEC.md's progress rule advances on every resolution,
 * so correct, wrong and skipped all move it; the score does not touch it.
 *
 * 0 before term 1, then 1 and 2, and TERM_COUNT once the last term resolves.
 * progressIndicator turns those into 0, 33, 66, 100.
 */
export function termsDoneBefore(position: TermPosition): number {
  return Number(position) - 1;
}

/**
 * Where a resolution goes — the next term, or the summary after the last one.
 * Skip is a resolution, so Skip uses this too.
 */
export function nextTermHref(position: TermPosition): string {
  return position === '3' ? '/explain/summary' : `/explain/${Number(position) + 1}`;
}

/**
 * What the forward button on a resolved term says. SPEC.md screen 10: "On the
 * last term the button reads **See how you did**."
 *
 * It sits beside `nextTermHref` because the two always move together — the
 * label has to change exactly where the destination does, and a verdict screen
 * that read "Next term" into the summary would be lying about where it goes.
 */
export function nextTermLabel(position: TermPosition): string {
  return position === '3' ? 'See how you did' : 'Next term';
}

/**
 * The progress bar's accessible name. The numbers are not in here: the
 * component reads them out of current/total as its unit text.
 */
export const PROGRESS_LABEL = 'Session progress';

/**
 * A take's length as m:ss — the shape the recording status line takes in
 * SPEC.md ("Listening, 0:11") and the number `takePlayer` shows on 08 Review.
 *
 * Shared rather than written twice, because SPEC.md's walkthrough checks that
 * the two agree: "Stop → Review shows that same duration."
 */
export function formatTakeLength(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
