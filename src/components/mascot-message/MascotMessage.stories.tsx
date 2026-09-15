import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Button } from '../button/Button';
import { MascotMessage, type MascotMessageState } from './MascotMessage';
import './mascotMessage.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> Knowie speaking to the student about their own recall. One per screen, in
> middleContent on the plan overview, where the stepper needs a human read on
> what just happened.
>
> state pairs with sectionHeader and drives the colour of the message and the
> pose Knowie pulls. Default is neutral, before a capstone result exists.
> ToRevisit is feedback/partial and Questioning: some terms needed a nudge.
> Mastered is feedback/success and Approving: the section is done. Relearn is
> feedback/error and means none of the terms came back unaided; the
> recommendation is to read the section again rather than practise harder, and
> the copy must say that without blaming the student. Relearn borrows the
> Standby pose because there are only four poses and none of them fits a gentle
> setback; a fifth pose is the proper fix and is a decision, not a variant.
>
> mascotFigure is size S here. Put the call to action in actionSlot rather than
> nesting a fixed button, so its emphasis can change without an override. helper
> carries the scheduling line, where Knowie says when these terms come back.
> Never use this as a generic tooltip or empty state: it is Knowie's voice about
> this student's recall, not a container for any message that needs a mascot
> beside it. Never carry the unaided count here, that read belongs to
> sectionHeader. Never recolour the message on an instance; a fifth reading is a
> product decision before it is a state.

### What the state drives

Two things at once — the message colour and Knowie's pose:

| state | message | pose |
| --- | --- | --- |
| Default | text.primary | Standby |
| ToRevisit | feedback.partial.bold | Approving |
| Mastered | feedback.success.onSubtle | Excited |
| Relearn | feedback.error.onSubtle | Questioning |

### The poses are settled, and Figma is behind

The mapping above was set by the design owner. It matches neither the Figma
description nor the variants, because those two had already drifted apart:

| state | description said | file has | **built** |
| --- | --- | --- | --- |
| Default | Standby | Standby | **Standby** |
| ToRevisit | Questioning | Approving | **Approving** |
| Mastered | Approving | Approving | **Excited** |
| Relearn | Standby | Questioning | **Questioning** |

The thing that settles it: **every state now pulls a different pose.** The file
gave ToRevisit and Mastered the same one, and the description gave Default and
Relearn the same one — either way two states read identically. This mapping is
the only one of the three where the pose is a real signal in all four.

**Both the Figma description and the Mastered variant need updating to match.**
The description's paragraph explaining that "Relearn borrows the Standby pose"
no longer describes what this does; Relearn pulls Questioning, and Excited — the
pose the description never mentions — is what Mastered uses.

### What not to do with it

- **One per screen, in middleContent** on the plan overview.
- **Never use it as a generic tooltip or empty state.** It is Knowie's voice
  about this student's recall.
- **Never carry the unaided count here** — that read belongs to sectionHeader.
- **Never recolour the message on an instance.** A fifth reading is a product
  decision before it is a state.
- **Relearn's copy must not blame the student.** The recommendation is to read
  the section again, not to practise harder.

### Built from

- **mascotFigure** at size S — the component that replaced mascotSlot for this,
  and the reason Knowie is no longer stretched square here.

### What changed from the previous build

The set was rebuilt rather than tweaked, so this is close to a new component:
\`Relearn\` is new; the term line and its \`showTermLine\` boolean are gone
entirely; \`showHelper\` now defaults to **true**; the message is Caption M
**Bold** and recoloured per state; the bubble moved to Radius/600 on a Space/200
gap; the tail became a 16x12 triangle; and \`actionSlot\` changed from a slot
that stretched its child to one that hugs it.

### Gaps

- **The message colours mix two token roles.** ToRevisit takes
  \`feedback.partial.bold\` while Mastered and Relearn take
  \`feedback.*.onSubtle\`. The description names only the families, not the
  steps. All three sit on background.surface rather than on a subtle panel, so
  \`onSubtle\` is arguably the wrong step for all of them — and that is the
  pairing that produced both contrast failures in the last audit.
- **\`actionSlot\` is an instance swap, not a slot.** In Figma it always has a
  button in it, since a swap always has a value. Here it is optional and draws
  nothing when omitted, which is the more useful default.
`;

const meta = {
  title: 'Components/mascotMessage',
  component: MascotMessage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    state: {
      control: 'inline-radio',
      options: ['Default', 'ToRevisit', 'Mastered', 'Relearn'],
    },
  },
  render: (args) => (
    <div className="knowieMascotMessageDemo">
      <MascotMessage {...args} />
    </div>
  ),
} satisfies Meta<typeof MascotMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What each state drives. The poses are the design owner's, not the file's. */
const SPEC: Record<MascotMessageState, { pose: string; file: string }> = {
  Default: { pose: 'Standby', file: 'knowie-01-standby.svg' },
  ToRevisit: { pose: 'Approving', file: 'knowie-03-approving.svg' },
  Mastered: { pose: 'Excited', file: 'knowie-09-excited.svg' },
  Relearn: { pose: 'Questioning', file: 'knowie-11-questioning.svg' },
};

/**
 * One story per Figma variant, named the way Figma names it.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function variantStory(state: MascotMessageState, message: string): Story {
  return {
    args: { state, message },
    play: async ({ canvas, canvasElement }) => {
      const root = canvasElement.querySelector('.knowieMascotMessage') as HTMLElement;
      const bubble = root.querySelector('.knowieMascotMessage-bubble') as HTMLElement;
      const figure = root.querySelector('.knowieMascotFigure') as HTMLElement;
      const msg = root.querySelector('.knowieMascotMessage-message') as HTMLElement;
      const spec = SPEC[state];

      await expect(root).toHaveAttribute('data-state', state);
      await expect(canvas.getByText(message)).toBeVisible();

      // Knowie is a real mascotFigure at size S, at the artwork's own ratio.
      await expect(figure).toHaveAttribute('data-size', 'S');
      await expect(figure).toHaveAttribute('data-pose', spec.pose);
      await expect(figure.querySelector('img')?.getAttribute('src')).toContain(spec.file);
      await expect(Math.round(figure.getBoundingClientRect().height)).toBe(48);
      // She sits at the top, so the bubble can grow without moving her.
      await expect(getComputedStyle(root).alignItems).toBe('flex-start');

      // Radius/600 bubble on a Space/200 gap, Space/300 from Knowie.
      const box = getComputedStyle(bubble);
      await expect(box.borderRadius).toBe('24px');
      await expect(box.rowGap).toBe('8px');
      await expect(box.padding).toBe('16px');
      await expect(getComputedStyle(root).columnGap).toBe('12px');

      // The message is Caption M Bold, and the state is the only thing that
      // recolours it. Default is the only one on text.primary.
      await expect(getComputedStyle(msg).fontSize).toBe('12px');
      await expect(getComputedStyle(msg).fontWeight).toBe('600');
      const primary = getComputedStyle(root).getPropertyValue('--color-text-primary').trim();
      await expect(primary).not.toBe('');

      // The helper is on by default now.
      await expect(root.querySelector('.knowieMascotMessage-helper')).not.toBeNull();
    },
  };
}

/** Neutral, before a capstone result exists. */
export const Default: Story = {
  ...variantStory('Default', 'Four terms in this section, and the capstone at the end.'),
  name: 'state=Default',
};

/** Some terms needed a nudge. */
export const ToRevisit: Story = {
  ...variantStory(
    'ToRevisit',
    'Serfdom needed a nudge from me. Try it on your own in a couple of days.',
  ),
  name: 'state=ToRevisit',
};

/** The section is done. */
export const Mastered: Story = {
  ...variantStory('Mastered', 'You explained all four without a hint. That is the whole section.'),
  name: 'state=Mastered',
};

/** None of the terms came back unaided — read the section again, no blame. */
export const Relearn: Story = {
  ...variantStory(
    'Relearn',
    'These have not stuck yet. Reading the section again will do more than practising harder.',
  ),
  name: 'state=Relearn',
};

/**
 * Not a Figma variant — `showHelper` is a boolean, and it now defaults to true,
 * so the message-only shape has to be asked for.
 */
export const WithoutHelper: Story = {
  name: 'showHelper=false',
  args: {
    state: 'Default',
    message: 'Four terms in this section, and the capstone at the end.',
    showHelper: false,
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('.knowieMascotMessage') as HTMLElement;
    await expect(root.querySelector('.knowieMascotMessage-helper')).toBeNull();
    await expect(root.querySelector('.knowieMascotMessage-action')).toBeNull();
  },
};

/**
 * Not a Figma variant — the action in place. Figma ships a Primary XS button in
 * the swap, and the frame hugs it rather than stretching it, which is the
 * change from the slot this component used to have.
 */
export const WithAction: Story = {
  name: 'With an action',
  args: {
    state: 'Relearn',
    message: 'These have not stuck yet. Reading the section again will do more than practising harder.',
    actionSlot: <Button variant="Primary" size="XS" CTA="Reread" onClick={fn()} />,
  },
  play: async ({ canvas, canvasElement }) => {
    const action = canvasElement.querySelector('.knowieMascotMessage-action') as HTMLElement;
    const button = canvas.getByRole('button', { name: 'Reread' });
    const bubble = canvasElement.querySelector('.knowieMascotMessage-bubble') as HTMLElement;

    // The action hugs its child rather than stretching it across the bubble.
    await expect(action.getBoundingClientRect().width).toBeLessThan(
      bubble.getBoundingClientRect().width - 32,
    );
    await userEvent.click(button);
  },
};
