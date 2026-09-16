/**
 * The plan's content, held in one place so /plan and /plan/in-progress differ
 * only by the step states they pass in. Copy matches the Mockups v2 frames
 * "02 Plan, nothing started" and "03 Plan, section 1 in progress".
 */

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
};

export const SUBJECT = 'World History';

/** The voice step's caption, identical on every section. */
const VOICE_CAPTION = 'Explain 3 terms from this section out loud, ~2 min';

const learning = (label: string, state: StepperStepState): PlanStep => ({
  label,
  caption: 'Study and quiz',
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
    title: 'The feudal system',
    learning: [
      learning('What feudalism was', 'NotStarted'),
      learning('Lords, vassals and fiefs', 'NotStarted'),
      learning('Life on the manor', 'NotStarted'),
    ],
    voice: voice(),
  },
  {
    title: 'The Black Death',
    learning: [
      learning('How the plague spread', 'NotStarted'),
      learning('Life after the plague', 'NotStarted'),
      learning('Wages, land and labour', 'NotStarted'),
    ],
    voice: voice(),
  },
];

/** Section 1 underway. The voice step is unchanged, because it never waited. */
export const PLAN_IN_PROGRESS: PlanSection[] = [
  {
    ...PLAN_NOTHING_STARTED[0],
    learning: [
      learning('What feudalism was', 'Completed'),
      learning('Lords, vassals and fiefs', 'InProgress'),
      learning('Life on the manor', 'InProgress'),
    ],
  },
  PLAN_NOTHING_STARTED[1],
];
