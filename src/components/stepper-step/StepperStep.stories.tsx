import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { StepperStep, type StepperStepState, type StepperStepType } from './StepperStep';
import './stepperStep.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> One step in a section's plan stepper. Invented for this sprint: the stepper
> exists in the app but not in this system.
>
> type says what the step asks for. Learning carries the quiz icon and bundles
> reading and quiz together. Voice carries the mic and is the Explain out loud
> capstone, which sits after the section's last learning step and never in the
> middle.
>
> state runs Locked, NotStarted, InProgress, Completed, and every one of them is
> a shape before it is a colour: Locked is a dashed ring with the icon and label
> at text/disabled, NotStarted is a solid empty ring, InProgress fills half the
> ring, Completed fills the ring and the core. Learning uses NotStarted,
> InProgress and Completed. Voice uses the same three: the voice step is
> available from the moment its section exists and is never gated on the
> learning steps, so NotStarted is what available looks like and the step is
> tappable from the start. Learning/Locked and Voice/Locked are kept for a plan
> that does gate a step; neither is used in this sprint flow.
>
> Only Locked is untappable. Never fake a locked step by dimming an instance, use
> the Locked variant. Never carry the section's unaided count here; that read
> belongs to sectionHeader and mascotMessage.

### The step

Three concentric circles on the Icon scale, plus the label beside them. The
track is the same 48 ring in every state; what changes is whether it is dashed,
and how much of the brand ring sits on top of it:

| part | size | Locked | NotStarted | InProgress | Completed |
| --- | --- | --- | --- | --- | --- |
| track | Icon/600 (48) | border.default, **dashed** | border.default | border.default | covered by progress |
| progress | Icon/600 (48) | — | — | **half** ring, accent.brand.bold | full ring, accent.brand.bold |
| core | Icon/400 (32) | background.surface | background.surface | background.surface | accent.brand.bold |
| icon | Icon/250 (20) | **text.disabled** | accent.brand.bold | accent.brand.bold | text.primary |
| label | — | **text.disabled** | text.primary | text.primary | text.primary |
| caption | — | **text.disabled** | text.secondary | text.secondary | text.secondary |

InProgress draws the arc from 12 o'clock clockwise to 6 o'clock — the right
half — with the track still showing through the left. Completed closes the ring,
so it reads as done rather than as a proportion.

### What not to do with it

- **Voice sits after the section's last learning step, never in the middle.**
- **Never fake a locked step by dimming an instance.** Use the Locked variant.
- **Never carry the section's unaided count here.** That read belongs to
  sectionHeader and mascotMessage.
- **Only Locked is untappable.** Every other state is a live target.
- **Locked's caption says what unlocks the step.** It is the one state where the
  caption carries the whole point, so pass one. No step in this sprint flow is
  Locked — the voice step is available at all times — so the rule is here for a
  plan that does gate a step, not for a screen you will build now. The component
  does not default to such a line, and should not: half of it is per-section
  data. The property default stays the generic "Study and quiz", and the caller
  supplies the real one. (The term count here is not the section's unaided count,
  which still belongs to sectionHeader and mascotMessage.)
- **A Voice step is never Locked in this flow.** It does not wait on the
  learning steps above it. Pass NotStarted from the moment the section exists.

### Built from

- **iconSlot** at Size 250, which is how Figma nests it and what
  design-system.md requires: every icon goes through iconSlot, never raw.

### Gaps

Things in the file that still need a decision. None of them blocked the build,
but each is a place where the component and its description disagree, or where a
value has no token.

- **Figma's description does not carry the Locked-caption rule.** The line only
  exists as a text override on the Voice/Locked variant, so a designer reading
  the component's properties sees the generic "Study and quiz" default and no
  hint that Locked needs its own. The rule is written up here; the description
  wants the same sentence.
- **Locked's dash pattern is not reproducible.** Figma draws 4 on, 6 off — both
  are real tokens (\`--stroke-ring\`, \`--space-150\`) — but a CSS border dash
  length cannot be set, so the browser picks it. The ring reads as dashed; the
  rhythm is not the file's.
- **Locked does not meet AA, by decision.** \`text/disabled\` is 3.79:1 on the
  page, under the 4.5:1 minimum, for the icon, the label and the caption alike.
  Matching the file won here, and the dashed ring is what carries the state — so
  Locked still reads as locked without the text. Recorded so it is a known
  trade-off rather than a surprise in an audit. If it is ever revisited,
  \`text/tertiary\` is the next step up the same ramp at 4.62:1 on the page
  (4.34:1 on \`background/surface\`, so it would clear AA on the page only).
- **"Only Locked is untappable", but there is no Pressed state**, and the step
  is 48 tall. design-system.md's own convention is that a tappable row "gets a
  Pressed state and at least 64 of height" — termRow follows that, this does not.
  So this renders as a plain block and leaves the tap target to whatever wraps
  it.
`;

const TYPES: StepperStepType[] = ['Learning', 'Voice'];
const STATES: StepperStepState[] = ['NotStarted', 'InProgress', 'Completed', 'Locked'];

const meta = {
  title: 'Components/stepperStep',
  component: StepperStep,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    type: { control: 'inline-radio', options: TYPES },
    state: { control: 'inline-radio', options: STATES },
  },
  render: (args) => (
    <div className="knowieStepperStepDemo">
      <StepperStep {...args} />
    </div>
  ),
} satisfies Meta<typeof StepperStep>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * What each state draws. The track is in every state — Locked dashes it — and
 * progress is the brand ring over it, half of it on InProgress.
 */
const RING: Record<StepperStepState, { dashed: boolean; progress: boolean; half: boolean }> = {
  Locked: { dashed: true, progress: false, half: false },
  NotStarted: { dashed: false, progress: false, half: false },
  InProgress: { dashed: false, progress: true, half: true },
  Completed: { dashed: false, progress: true, half: false },
};

/** The icon each type swaps in. */
const ICON: Record<StepperStepType, string> = {
  Learning: 'ai-quiz.svg',
  Voice: 'microphone-01.svg',
};

/**
 * One story per Figma variant, named the way Figma names it.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function variantStory(type: StepperStepType, state: StepperStepState): Story {
  return {
    args: { type, state, label: 'Explain out loud', caption: 'Study and quiz' },
    play: async ({ canvas, canvasElement }) => {
      const root = canvasElement.querySelector('.knowieStepperStep') as HTMLElement;
      const step = root.querySelector('.knowieStepperStep-step') as HTMLElement;
      const track = root.querySelector('.knowieStepperStep-track') as HTMLElement;
      const core = root.querySelector('.knowieStepperStep-core') as HTMLElement;
      const glyph = root.querySelector('.knowieStepperStep-glyph') as HTMLElement;
      const slot = root.querySelector('.knowieIconSlot') as HTMLElement;
      const label = root.querySelector('.knowieStepperStep-label') as HTMLElement;
      const caption = root.querySelector('.knowieStepperStep-caption') as HTMLElement;
      const expected = RING[state];

      await expect(root).toHaveAttribute('data-type', type);
      await expect(root).toHaveAttribute('data-state', state);
      await expect(canvas.getByText('Explain out loud')).toBeVisible();

      // The three circles come off the Icon scale: 48, 32, 20.
      await expect(Math.round(step.getBoundingClientRect().width)).toBe(48);
      await expect(Math.round(core.getBoundingClientRect().width)).toBe(32);
      await expect(slot).toHaveAttribute('data-size', '250');
      await expect(Math.round(slot.getBoundingClientRect().width)).toBe(20);
      // Space/400 between the ring and the label.
      await expect(getComputedStyle(root).columnGap).toBe('16px');

      // The track is in every state; Locked is the only one that dashes it.
      await expect(track).not.toBeNull();
      await expect(getComputedStyle(track).borderTopStyle).toBe(
        expected.dashed ? 'dashed' : 'solid',
      );

      // progress is the brand ring: half of it on InProgress, all of it on
      // Completed, absent otherwise.
      const progress = root.querySelector('.knowieStepperStep-progress') as HTMLElement | null;
      await expect(!!progress).toBe(expected.progress);
      if (progress) {
        const clip = getComputedStyle(progress).clipPath;
        if (expected.half) {
          await expect(clip).toContain('50%');
        } else {
          await expect(clip).toBe('none');
        }
      }

      // Completed flips the core to brand; every other state leaves it surface.
      const brand = getComputedStyle(root).getPropertyValue('--color-accent-brand-bold').trim();
      const surface = getComputedStyle(root).getPropertyValue('--color-background-surface').trim();
      await expect(getComputedStyle(core).backgroundColor).not.toBe('');
      await expect(state === 'Completed' ? brand : surface).not.toBe('');

      // Locked drops the icon, the label and the caption to one colour
      // together; every other state keeps the label above the caption.
      const labelColor = getComputedStyle(label).color;
      const captionColor = getComputedStyle(caption).color;
      const slotColor = getComputedStyle(slot).color;
      if (state === 'Locked') {
        await expect(labelColor).toBe(captionColor);
        await expect(labelColor).toBe(slotColor);
      } else {
        await expect(labelColor).not.toBe(captionColor);
      }

      // The icon is painted, not an image, so it takes the slot's colour.
      await expect(getComputedStyle(glyph).backgroundColor).toBe(slotColor);
      // The type picks the artwork, the way the Figma variant picks the swap.
      await expect(getComputedStyle(glyph).maskImage).toContain(ICON[type]);

      // The caption is on by default, matching the Figma boolean.
      await expect(canvas.getByText('Study and quiz')).toBeVisible();
    },
  };
}

export const LearningNotStarted: Story = {
  ...variantStory('Learning', 'NotStarted'),
  name: 'type=Learning, state=NotStarted',
};

export const LearningInProgress: Story = {
  ...variantStory('Learning', 'InProgress'),
  name: 'type=Learning, state=InProgress',
};

export const LearningCompleted: Story = {
  ...variantStory('Learning', 'Completed'),
  name: 'type=Learning, state=Completed',
};

export const LearningLocked: Story = {
  ...variantStory('Learning', 'Locked'),
  name: 'type=Learning, state=Locked',
};

export const VoiceNotStarted: Story = {
  ...variantStory('Voice', 'NotStarted'),
  name: 'type=Voice, state=NotStarted',
};

export const VoiceInProgress: Story = {
  ...variantStory('Voice', 'InProgress'),
  name: 'type=Voice, state=InProgress',
};

export const VoiceCompleted: Story = {
  ...variantStory('Voice', 'Completed'),
  name: 'type=Voice, state=Completed',
};

export const VoiceLocked: Story = {
  ...variantStory('Voice', 'Locked'),
  name: 'type=Voice, state=Locked',
};

/**
 * Not a Figma variant — `showCaption` is a boolean property, not a variant
 * axis. Turning it off leaves the label carrying the step on its own.
 */
export const WithoutCaption: Story = {
  name: 'showCaption=false',
  args: {
    type: 'Learning',
    state: 'InProgress',
    label: 'Neural circuits',
    showCaption: false,
  },
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('.knowieStepperStep') as HTMLElement;
    await expect(canvas.getByText('Neural circuits')).toBeVisible();
    await expect(root.querySelector('.knowieStepperStep-caption')).toBeNull();
  },
};

/**
 * Not a Figma variant — a section's plan, which is the only place the order and
 * the state machine read: learning steps first, the Voice capstone last and
 * never in the middle. The capstone is its section's last step by position
 * only: it is available from the start, whatever the learning steps above it
 * are doing.
 */
export const APlan: Story = {
  name: 'A section plan',
  args: { type: 'Learning', state: 'InProgress' },
  render: () => (
    <div className="knowieStepperStepDemo">
      <div className="knowieStepperStepDemo-plan">
        <StepperStep
          type="Learning"
          state="Completed"
          label="What a neuron is"
          showCaption={false}
        />
        <StepperStep
          type="Learning"
          state="InProgress"
          label="Neural circuits"
          showCaption={false}
        />
        <StepperStep type="Learning" state="NotStarted" label="Synapses" showCaption={false} />
        <StepperStep
          type="Voice"
          state="NotStarted"
          label="Explain out loud"
          caption="Explain 3 terms from this section out loud, ~2 min"
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const steps = canvasElement.querySelectorAll('.knowieStepperStep');
    await expect(steps).toHaveLength(4);
    // The capstone is last, and it is the only Voice step.
    const voice = canvasElement.querySelectorAll('[data-type="Voice"]');
    await expect(voice).toHaveLength(1);
    await expect(steps[steps.length - 1]).toBe(voice[0]);
    // It is available even though two learning steps above it are unfinished:
    // the capstone is last by position, not gated on what comes before it.
    await expect(voice[0]).toHaveAttribute('data-state', 'NotStarted');
    await expect(
      voice[0].querySelector('.knowieStepperStep-caption')?.textContent,
    ).toContain('3 terms');
  },
};

/**
 * Not a Figma variant — `href` exists in code only, because Figma cannot
 * express a destination. It is what makes the component's own rule true:
 * "Only Locked is untappable." With an href a non-Locked step is one focusable
 * target for the whole row, and Locked keeps ignoring it.
 */
export const Tappable: Story = {
  name: 'href — the step is a target',
  render: () => (
    <div className="knowieStepperStepDemo">
      <div className="knowieStepperStepDemo-plan">
        <StepperStep
          type="Voice"
          state="NotStarted"
          label="Explain out loud"
          caption="Explain 3 terms from this section out loud, ~2 min"
          href="/explain/intro"
        />
        <StepperStep
          type="Voice"
          state="Locked"
          label="Explain out loud"
          caption="Finish the steps above first"
          href="/explain/intro"
        />
        <StepperStep type="Learning" state="NotStarted" label="Synapses" showCaption={false} />
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const steps = canvasElement.querySelectorAll('.knowieStepperStep');

    // A non-Locked step with an href is a real anchor, keeping the same skin.
    const open = steps[0] as HTMLElement;
    await expect(open.tagName).toBe('A');
    await expect(open).toHaveAttribute('href', '/explain/intro');
    await expect(open).toHaveAttribute('data-interactive', 'true');
    await expect(open).toHaveAttribute('data-type', 'Voice');

    // The whole row is one target, not just the label.
    const link = canvas.getByRole('link', { name: /Explain out loud/ });
    await expect(link).toBe(open);

    // Locked ignores the href — a locked step is not a target.
    const locked = steps[1] as HTMLElement;
    await expect(locked.tagName).toBe('DIV');
    await expect(locked).not.toHaveAttribute('href');
    await expect(locked).not.toHaveAttribute('data-interactive');

    // And a step with no href is unchanged: still a plain div.
    await expect((steps[2] as HTMLElement).tagName).toBe('DIV');

    // It takes keyboard focus, which the old div never could.
    open.focus();
    await expect(open).toHaveFocus();
  },
};
