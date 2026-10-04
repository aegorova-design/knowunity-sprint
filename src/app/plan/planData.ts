/**
 * The plan's content, held in one place so /plan and /plan/in-progress differ
 * only by the step states they pass in. Copy matches the Mockups v2 frames
 * "02 Plan, nothing started" and "03 Plan, section 1 in progress".
 */

import type { MascotMessageState } from '@/components/mascot-message/MascotMessage';
import type { SectionHeaderState } from '@/components/section-header/SectionHeader';
import type { StepperStepState } from '@/components/stepper-step/StepperStep';

export type PlanStep = {
  label: string;
  caption: string;
  state: StepperStepState;
};

export type PlanSection = {
  title: string;
  learning: PlanStep[];
  /** The voice capstone. Last by position, and never Locked — it is available
   *  from the moment the section exists. See sprint-context.md. */
  voice: PlanStep;
  /**
   * What the last capstone session left behind, on the two screens that have
   * one. Left off, the header is Default with no status and Knowie says
   * nothing — which is `/plan` and `/plan/in-progress`.
   */
  result?: PlanResult;
};

export const SUBJECT = 'Life Science';

/** The voice step's caption, identical on every section. */
const VOICE_CAPTION = 'Explain 3 terms from this section out loud, ~2 min';

/**
 * A learning step. The caption is the frame's own text rather than something
 * derived from the state, because the two types do not agree on what a state
 * reads: a Completed learning step says "Done" on `03`, `19` and `21`, but a
 * Completed Voice step says "Done" where a NotStarted one carries the whole
 * `VOICE_CAPTION` line. Pass the frame's words when they differ from the
 * default.
 */
const learning = (
  label: string,
  state: StepperStepState,
  caption = 'Study and quiz',
): PlanStep => ({
  label,
  caption,
  state,
});

const voice = (): PlanStep => ({
  label: 'Explain out loud',
  caption: VOICE_CAPTION,
  state: 'NotStarted',
});

/** Nothing started — every step still to do. */
export const PLAN_NOTHING_STARTED: PlanSection[] = [
  {
    // Rubric's own `topic` field (judge/judging-rubric.json), not a separate
    // section name invented here — the three learning steps below are this
    // section's voice capstone's three terms.
    title: 'Nature and animals',
    learning: [
      learning('How camouflage works', 'NotStarted'),
      learning('Why animals hibernate', 'NotStarted'),
      learning('What makes a mammal', 'NotStarted'),
    ],
    voice: voice(),
  },
  {
    title: 'Ecosystems and food chains',
    learning: [
      learning('What a food chain is', 'NotStarted'),
      learning('Producers and consumers', 'NotStarted'),
      learning('Energy moving through an ecosystem', 'NotStarted'),
    ],
    voice: voice(),
  },
];

/** Section 1 underway. The voice step is unchanged, because it never waited. */
export const PLAN_IN_PROGRESS: PlanSection[] = [
  {
    ...PLAN_NOTHING_STARTED[0],
    learning: [
      learning('How camouflage works', 'Completed', 'Done'),
      learning('Why animals hibernate', 'InProgress', 'Study and quiz, in progress'),
      learning('What makes a mammal', 'InProgress', 'Study and quiz, in progress'),
    ],
  },
  PLAN_NOTHING_STARTED[1],
];

/**
 * A capstone result on a section — the read `sectionHeader` reports and the
 * line Knowie says about it.
 *
 * Only the two result screens carry one. `/plan` and `/plan/in-progress` leave
 * it off, because no session has happened yet and `sectionHeader`'s Default
 * variant has no status layer at all.
 */
export type PlanResult = {
  /** The header's read. Drives its status colour and icon together. */
  state: SectionHeaderState;
  /** The unaided count, as the frames word it: "1 of 3 on your own". */
  status: string;
  /** Knowie's read on the same session. */
  message: {
    state: MascotMessageState;
    message: string;
    /** The scheduling line — when Knowie brings these terms back. */
    helper: string;
    /**
     * The low-emphasis way to start the recall loop now rather than then. Off
     * where terms needed help: an immediate second go is recognition, not
     * recall, and the revisit is the intended second attempt.
     */
    action?: string;
  };
};

/**
 * A completed section's steps. Every step reads Done on `19` and `21`,
 * including the Voice one — which is the difference from `03`, where the
 * Completed learning step reads Done but the Voice step has not run yet and
 * still carries `VOICE_CAPTION`. See `learning()` for why the caption is
 * passed rather than derived.
 */
const DONE_SECTION = (result: PlanResult): PlanSection => ({
  ...PLAN_NOTHING_STARTED[0],
  result,
  learning: [
    learning('How camouflage works', 'Completed', 'Done'),
    learning('Why animals hibernate', 'Completed', 'Done'),
    learning('What makes a mammal', 'Completed', 'Done'),
  ],
  voice: { ...voice(), state: 'Completed', caption: 'Done' },
});

/**
 * 19 Plan, 1 of 3 unaided. Structure off the Mockups v2 frame "19 Plan, 1 of 3
 * unaided" (13662:14553); the bubble's two lines are the design owner's,
 * replacing the frame's.
 *
 * They swap what the two lines carry: the message now names *which* terms
 * needed help and how much — a hint against a reveal — and the helper carries
 * the advice rather than a date. The frame's "I will bring these three back on
 * Thursday" was `mascotMessage`'s own default left unchanged, and it named a
 * count the header contradicts.
 *
 * The status and message below are the scripted run's. `ToRevisitScreen`
 * replaces both with the session's own, which reproduces these in demo mode.
 *
 * `showHelper` is forced on where this is drawn: SPEC.md screen 5 — "The
 * scheduling line is the calibration mechanism, so it cannot be hidden on the
 * screen that has something to schedule." The frame has it off.
 */
export const PLAN_TO_REVISIT: PlanSection[] = [
  DONE_SECTION({
    state: 'ToRevisit',
    status: '1 of 3 on your own',
    message: {
      state: 'ToRevisit',
      message: 'Mammal needed a hint. Hibernation was revealed.',
      helper: 'Try them on your own in a couple of days.',
    },
  }),
  PLAN_NOTHING_STARTED[1],
];

/**
 * 21 Plan, section mastered. Structure off the Mockups v2 frame "21 Plan,
 * section mastered" (13662:14554); the bubble's two lines are the design
 * owner's, replacing the frame's.
 *
 * The frame's message ended "Try it on your own in a couple of days", which is
 * `19`'s advice on a section that has just been done on its own; that sentence
 * is gone. The helper keeps a date, and now says *all three* come back rather
 * than "it".
 */
export const PLAN_MASTERED: PlanSection[] = [
  DONE_SECTION({
    state: 'Mastered',
    status: '3 of 3 on your own',
    message: {
      state: 'Mastered',
      message: 'You got all 3 terms right',
      helper: "I'll bring them all back Thursday, 2 days before your exam.",
      action: 'Practice sooner',
    },
  }),
  PLAN_NOTHING_STARTED[1],
];
