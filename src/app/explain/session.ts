/**
 * The recall session's content and its position arithmetic, held in one place
 * so every term screen reads the same three terms and computes "where am I"
 * the same way. `[term]` is the position in the session — 1, 2, 3 — not the
 * term's name, per SPEC.md.
 *
 * The three terms are camouflage, hibernation and mammal — the same three
 * `judge/judging-rubric.json` defines, imported here through `judge-config.ts`
 * rather than re-typed. `question`, `reference_answer` and each key idea's
 * `label` come straight off the rubric, so demo mode's copy and real mode's
 * judging both describe the same term rather than two hand-maintained
 * versions that can drift apart. Only the scripted dialogue below — the
 * `heard` quotes, the hint text and the "I don't know" nudge — is authored
 * here: the rubric has no multi-turn script, because demo mode's script and
 * real mode's judging are deliberately two different paths (see script.ts).
 *
 * Positions were assigned to match the scripted ladder each one runs:
 * camouflage passes unaided (position 1), hibernation runs the full ladder to
 * a reveal (position 2, by design-owner call), mammal passes after one hint
 * (position 3). The rubric's own `expected_difficulty` field agrees with this
 * ordering — unaided, hardest, hint — which is what suggested it.
 */

import { rubric } from '@/lib/judge-config';

export const TERM_POSITIONS = ['1', '2', '3'] as const;

export type TermPosition = (typeof TERM_POSITIONS)[number];

export type Term = {
  position: TermPosition;
  /** The rubric's own id (judge/judging-rubric.json) — what real mode sends
   *  to `/api/judge` as `term`. Not the same as `position`: the rubric knows
   *  nothing about session order. */
  rubricId: string;
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
   * quotes. Demo mode's judging is scripted (script.ts), so the transcript is
   * scripted too — nothing the student says changes it in demo mode. Real
   * mode shows the actual transcript instead; see the recording/checking
   * screens.
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
   * The take a scripted first-try pass is heard as — what the summary quotes
   * for a term the demo script passes unaided. Only camouflage has one: its
   * `heard[0]` is a wrong answer, written for the hint screens on the typed
   * path, and would otherwise be quoted under "Unaided".
   */
  passTake?: string;
  /**
   * The hint ladder's two rungs in demo mode — `11 Not quite, hint 1 of 2`
   * shows the first, `12 Partial, hint 2 of 2` the second. Each one answers
   * the take above it rather than restating the question.
   *
   * Real mode's hints come from a different place: `rubric.terms[x].hints`,
   * keyed by idea and picked by the judge's `hint_target`, not by attempt
   * number. See sprint plan, stage D.
   */
  hints: readonly [string, string];
  /**
   * The answer itself, as `13 Answer revealed` prints it — `reference_answer`
   * off the rubric, unedited.
   */
  answer: string;
  /**
   * The term's key ideas — what `10 Got it` ticks off as chips and what
   * `13 Answer revealed` lists under the answer. Read off the rubric's own
   * `type: "key"` ideas for this term, in rubric order; bonus ideas (mammal's
   * "Hair or fur") are left out, because these chips are what a pass actually
   * requires, not everything the judge can notice.
   *
   * Camouflage has two, hibernation three, mammal two — not a fixed four the
   * way the original Mockups v2 frames drew. Padding to four with an idea the
   * rubric does not have would say the judge checks something it does not; a
   * design-owner call, flagged rather than buried.
   */
  keyIdeas: readonly string[];
};

/** Identical under every prompt: the ask is the same, only the term changes. */
const PROMPT_CAPTION = 'Explain it like you would to a classmate.';

export const TERM_PROMPT_CAPTION = PROMPT_CAPTION;

type RubricTerm = (typeof rubric.terms)[number];

function rubricTerm(id: string): RubricTerm {
  const found = rubric.terms.find((term) => term.id === id);
  if (!found) throw new Error(`Rubric term not found: ${id}`);
  return found;
}

/** "What is camouflage?" -> "In your own words, what is camouflage?" */
function promptFor(term: RubricTerm): string {
  return `In your own words, ${term.question.charAt(0).toLowerCase()}${term.question.slice(1)}`;
}

function keyIdeaLabels(term: RubricTerm): readonly string[] {
  return term.ideas.filter((idea) => idea.type === 'key').map((idea) => idea.label);
}

const CAMOUFLAGE = rubricTerm('camouflage');
const HIBERNATION = rubricTerm('hibernation');
const MAMMAL = rubricTerm('mammal');

export const TERMS: Record<TermPosition, Term> = {
  '1': {
    position: '1',
    rubricId: CAMOUFLAGE.id,
    name: 'Camouflage',
    prompt: promptFor(CAMOUFLAGE),
    unknownHint: "Think about how the animal's colours or shape help it avoid being spotted.",
    // The scripted run never sends term 1 through the ladder — it passes on
    // the first attempt — so these three only surface on the typed path, on
    // an answer under 20 characters. Written to plausibly fail anyway: the
    // first echoes the rubric's own listed contradiction (bright colours to
    // be seen, not to hide), the second and third have "blends in" but never
    // say why that matters.
    passTake: '“Camouflage is when an animal’s colours help it blend in, so predators can’t see it.”',
    heard: [
      '“Camouflage is when an animal has really bright colours so predators notice it and stay away.”',
      '“It’s when an animal’s colours match where it lives, so it’s harder to see.”',
      '“The animal blends into the background using its colours and shape.”',
    ],
    hints: [
      'Bright colours that stand out are the opposite of camouflage. Think about matching, not standing out.',
      'You have the blending in part. Now think about why an animal would want to be hard to see.',
    ],
    answer: CAMOUFLAGE.reference_answer,
    keyIdeas: keyIdeaLabels(CAMOUFLAGE),
  },
  '2': {
    position: '2',
    rubricId: HIBERNATION.id,
    name: 'Hibernation',
    prompt: promptFor(HIBERNATION),
    unknownHint: "Think about what an animal's body does through the coldest months, and why.",
    // Written to run the full ladder: the first take borrows the rubric's own
    // listed contradiction (migration, not hibernation) for an honest Miss;
    // the second has the state but not the reason, for a Partial; the third
    // is a different wrong-ish take, not a repeat of the second, per the
    // three-takes rule above.
    heard: [
      '“Hibernation is when animals fly south for the winter to find food.”',
      '“It’s when an animal goes into a long sleep through the winter.”',
      '“Animals hibernate because it’s too cold to move around, so they just doze off in their den.”',
    ],
    hints: [
      "Not migration — the animal doesn't go anywhere. Think about what it's doing, and where it stays.",
      'That is the state. Now think about what happens inside its body, or why it needs to do this at all.',
    ],
    answer: HIBERNATION.reference_answer,
    keyIdeas: keyIdeaLabels(HIBERNATION),
  },
  '3': {
    position: '3',
    rubricId: MAMMAL.id,
    name: 'Mammal',
    prompt: promptFor(MAMMAL),
    unknownHint: "Think about what's special about how a mammal mother feeds and keeps her baby warm.",
    // The script only takes this term to the first rung — attempt 2 passes —
    // so the second take and second hint exist for the typed path and for
    // completeness. The third take leans on the rubric's own "neutral" fact
    // (live birth) that neither helps nor hurts a real verdict.
    heard: [
      '“A mammal is an animal that has fur and lives on land.”',
      '“A mammal is a warm-blooded animal, and the mothers feed their babies milk.”',
      '“Mammals are animals that give birth to live babies instead of laying eggs.”',
    ],
    hints: [
      "Fur is a clue, but think about what a mammal mother gives her baby to eat right after it's born.",
      'You have the milk and the warmth. Think about whether there is anything else mammals usually have.',
    ],
    answer: MAMMAL.reference_answer,
    keyIdeas: keyIdeaLabels(MAMMAL),
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
