import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { RecordButton } from './RecordButton';
import './recordButton.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> The mic for Explain out loud. One per screen, in bottomContent, where the
> thumb already is. Idle takes interactive.primary because it is the screen's
> one primary action; Recording takes accent.brand.bold because brand violet
> means audio is live and nothing else in this feature may use it that way. Stop
> occupies the same position as start, so the thumb does not move. Never pair it
> with a second primary action on the same screen, and never use the Recording
> variant for a state where audio is not actually being captured.

### The two variants

| variant | fill | icon | icon colour | press overlay |
| --- | --- | --- | --- | --- |
| Idle | interactive.primary | microphone-01 | interactive.onPrimary | interactive.**pressedInverse** |
| Recording | accent.brand.bold | square (stop) | accent.brand.onBold | interactive.**pressed** |

A fixed 96 circle, both axes bound to Space/2400 — unlike most fixed-shape
controls in this system, nothing here had to be derived from padding.

The two press overlays are different tokens on purpose, and the file is right to
split them: Idle's fill is light, so it darkens with the Inverse overlay;
Recording's brand violet is vivid, so it lightens with the plain one.

### Recording has no Disabled state

Figma has **5** variants, not 6. That is not an omission — a live recording
cannot be disabled mid-take. The props encode it as a union, so
\`variant="Recording" state="Disabled"\` will not compile.

### What not to do with it

- **One per screen, in bottomContent**, where the thumb already is.
- **Never pair it with a second primary action on the same screen.** Idle takes
  interactive.primary, and design-system.md allows only one of those per screen.
- **Never use Recording where audio is not actually being captured.** Brand
  violet means live audio in this feature and nothing else may use it that way.
- **Stop occupies the same position as start**, so the thumb does not move.
  Do not move or resize it between the two variants.

### Built from

- **iconSlot** at Size 400, which is how Figma nests it and what
  design-system.md requires: every icon goes through iconSlot, never raw.

### The stop icon

Recording draws \`/icons/stop.svg\`. Figma calls the same slot \`square\`, and
the description's "Stop occupies the same position as start" confirms the shape
is meant to read as stop rather than as a second mic.

Two things about that file differ from the rest of \`public/icons\`, neither of
which blocks anything:

- **It is the only icon with a hardcoded fill** (\`#090C18\`) instead of
  \`currentColor\`. It does not show here, because the glyph is drawn as a mask
  and painted with \`currentColor\` — the shape's alpha is all that is used, so
  it takes accent.brand.onBold from the slot like every other icon. It would
  matter if the file were ever used as an \`<img>\`.
- **It is full-bleed in its 24 box**, where Figma's \`square\` sits inset — a
  20x20 vector in a 24 grid. So the stop reads about a fifth larger here than in
  Figma: 32 across the slot rather than 26.7. Matching Figma exactly would mean
  insetting the glyph to 83.3% of the slot, which is not a token value, so the
  file is used as drawn. If the size is wrong, the fix belongs in the SVG.

While you are in there: design-system.md describes this component as "built from
iconSlot carrying microphone-01", which reads as though the mic is used
throughout. It is not — Recording carries the stop shape. Worth correcting.
`;

const meta = {
  title: 'Components/recordButton',
  component: RecordButton,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['Idle', 'Recording'] },
    state: { control: 'inline-radio', options: ['Default', 'Pressed', 'Disabled'] },
  },
  args: { onClick: fn(), label: 'Start recording' },
  render: (args) => (
    <div className="knowieRecordButtonDemo">
      <RecordButton {...args} />
    </div>
  ),
} satisfies Meta<typeof RecordButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The fill and glyph each variant carries. */
const SPEC = {
  Idle: { icon: 'microphone-01.svg', label: 'Start recording' },
  Recording: { icon: 'stop.svg', label: 'Stop recording' },
} as const;

/**
 * One story per Figma variant, named the way Figma names it.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function variantStory(
  variant: 'Idle' | 'Recording',
  state: 'Default' | 'Pressed' | 'Disabled',
): Story {
  const spec = SPEC[variant];
  return {
    // Cast because the props are a union: TypeScript cannot prove from the
    // factory's parameters alone that Recording is never paired with Disabled.
    // The union still blocks that combination at every real call site.
    args: { variant, state, label: spec.label } as Story['args'],
    play: async ({ canvas, canvasElement, args }) => {
      const button = canvas.getByRole('button');
      const slot = canvasElement.querySelector('.knowieIconSlot') as HTMLElement;
      const glyph = canvasElement.querySelector('.knowieRecordButton-glyph') as HTMLElement;

      await expect(button).toHaveAttribute('data-variant', variant);
      await expect(button).toHaveAttribute('data-state', state);
      // Icon-only, so the label is the only name it has.
      await expect(button).toHaveAccessibleName(spec.label);

      // Space/2400 both ways, and a full circle.
      await expect(Math.round(button.getBoundingClientRect().width)).toBe(96);
      await expect(Math.round(button.getBoundingClientRect().height)).toBe(96);
      await expect(getComputedStyle(button).borderRadius).toBe('9999px');
      // iconSlot at Size 400 owns the icon box.
      await expect(slot).toHaveAttribute('data-size', '400');
      await expect(Math.round(slot.getBoundingClientRect().width)).toBe(32);
      // The variant picks the artwork, the way the Figma variant picks the swap.
      await expect(getComputedStyle(glyph).maskImage).toContain(spec.icon);

      if (state === 'Disabled') {
        await expect(button).toBeDisabled();
        await userEvent.click(button);
        await expect(args.onClick).not.toHaveBeenCalled();
      } else {
        await expect(button).toBeEnabled();
        await userEvent.click(button);
        await expect(args.onClick).toHaveBeenCalledOnce();
      }
    },
  };
}

export const IdleDefault: Story = {
  ...variantStory('Idle', 'Default'),
  name: 'variant=Idle, state=Default',
};

export const IdlePressed: Story = {
  ...variantStory('Idle', 'Pressed'),
  name: 'variant=Idle, state=Pressed',
};

export const IdleDisabled: Story = {
  ...variantStory('Idle', 'Disabled'),
  name: 'variant=Idle, state=Disabled',
};

export const RecordingDefault: Story = {
  ...variantStory('Recording', 'Default'),
  name: 'variant=Recording, state=Default',
};

export const RecordingPressed: Story = {
  ...variantStory('Recording', 'Pressed'),
  name: 'variant=Recording, state=Pressed',
};

/**
 * Not a Figma variant — the two variants side by side. Stop has to occupy the
 * same position and the same box as start, so the thumb does not move between
 * them; this is the only place that is checkable.
 */
export const SameFootprint: Story = {
  name: 'Stop lands where start was',
  args: { variant: 'Idle', state: 'Default' },
  render: (args) => (
    <div className="knowieRecordButtonDemo">
      <div className="knowieRecordButtonDemo-pair">
        <RecordButton variant="Idle" label="Start recording" onClick={args.onClick} />
        <RecordButton variant="Recording" label="Stop recording" onClick={args.onClick} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [idle, recording] = [
      ...canvasElement.querySelectorAll('.knowieRecordButton'),
    ] as HTMLElement[];
    const a = idle.getBoundingClientRect();
    const b = recording.getBoundingClientRect();
    // Identical box, so swapping variant never moves the thumb target.
    await expect(Math.round(a.width)).toBe(Math.round(b.width));
    await expect(Math.round(a.height)).toBe(Math.round(b.height));
    // But never the same fill — brand violet only ever means live audio.
    await expect(getComputedStyle(idle).backgroundColor).not.toBe(
      getComputedStyle(recording).backgroundColor,
    );
  },
};
