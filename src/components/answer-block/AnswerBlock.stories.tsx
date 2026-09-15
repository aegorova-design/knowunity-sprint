import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { AnswerBlock, type AnswerBlockKind } from './AnswerBlock';
import './answerBlock.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> A labelled passage of text about the current term. Said is what Knowie heard,
> quoted back so a mishear reads as the app's mistake. Hint is the nudge, and it
> is the loudest of the three because it is the thing to act on. Answer is the
> reveal. Reach for it inside a verdict sheet or under a prompt, never as a
> screen heading, which is textBlock's job. Keep bodies to three lines; this is
> a glance, not a passage. Never recolour an instance to make one kind look like
> another. If you need a fourth treatment, that is a new kind and a decision.

### How the three kinds are told apart

Each kind changes three things at once — the container, the label colour and the
icon — so none of them leans on colour alone:

| kind | container | label + icon | icon |
| --- | --- | --- | --- |
| Said | outlined, no fill | text.secondary | microphone-01 |
| Hint | background.surface | accent.brand.bold | lightbulb-02 |
| Answer | background.stacking | accent.brand.bold | check |

The body is text.primary in all three. Only the label and the icon change, which
is what keeps the passage itself equally readable whichever kind it is.

Said is the only one with a border rather than a fill, so it is 2 taller than
the other two — 82 against 80. That is how Figma has it, not a rounding slip.

### What not to do with it

- **Not a screen heading.** That is textBlock's job, and textBlock's own docs
  point back here for the same reason.
- **Don't recolour an instance** to make one kind look like another. The kind is
  the only thing that sets the colour, and it sets the container, the label and
  the icon together.
- **A fourth treatment is a new kind and a decision**, not a prop.
- **Keep bodies to three lines.** This is authoring guidance, not a clamp — the
  component does not truncate, because silently cutting off a hint would hide
  the thing the student is meant to act on. Write shorter copy instead.

### Built from

- **iconSlot** at Size 250, which is how Figma nests it and what
  design-system.md requires: every icon goes through iconSlot, never raw.

### Gap

There is no icon component in the system, so the artwork in \`public/icons\` is
brought in as a CSS mask painted with currentColor. That works and it keeps the
SVG files as the single source, but every component that needs an icon will
repeat the trick. If that is not the intended pattern, it wants a decision
before the next component copies it.
`;

const meta = {
  title: 'Components/answerBlock',
  component: AnswerBlock,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['Said', 'Hint', 'Answer'] },
  },
  render: (args) => (
    <div className="knowieAnswerBlockDemo">
      <AnswerBlock {...args} />
    </div>
  ),
} satisfies Meta<typeof AnswerBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The icon each kind swaps in, and whether it is the outlined kind. */
const KIND: Record<AnswerBlockKind, { icon: string; outlined: boolean }> = {
  Said: { icon: 'microphone-01.svg', outlined: true },
  Hint: { icon: 'lightbulb-02.svg', outlined: false },
  Answer: { icon: 'check.svg', outlined: false },
};

/** One story per Figma variant, checking the container, the type and the icon. */
function kindStory(kind: AnswerBlockKind, overrides: { label: string; body: string }): Story {
  return {
    name: kind,
    args: { kind, ...overrides },
    play: async ({ canvas, canvasElement }) => {
      const block = canvasElement.querySelector('.knowieAnswerBlock') as HTMLElement;
      const label = block.querySelector('.knowieAnswerBlock-label') as HTMLElement;
      const body = block.querySelector('.knowieAnswerBlock-body') as HTMLElement;
      const icon = block.querySelector('.knowieAnswerBlock-icon') as HTMLElement;
      const expected = KIND[kind];

      await expect(block).toHaveAttribute('data-kind', kind);
      await expect(canvas.getByText(overrides.label)).toBe(label);

      // Container: Space/400 padding, Space/200 gap, Radius/400.
      const box = getComputedStyle(block);
      await expect(box.padding).toBe('16px');
      await expect(box.rowGap).toBe('8px');
      await expect(box.borderRadius).toBe('16px');
      // Said is the only kind carrying a border, which is why it is 2 taller.
      await expect(box.borderTopWidth).toBe(expected.outlined ? '1px' : '0px');

      // Both texts are the 15/20 step — Bold on the label, Regular on the body.
      await expect(getComputedStyle(label).fontSize).toBe('15px');
      await expect(getComputedStyle(label).lineHeight).toBe('20px');
      await expect(getComputedStyle(body).fontSize).toBe('15px');
      await expect(getComputedStyle(body).fontWeight).toBe('400');

      // The label and the icon always share one colour, whichever kind it is.
      await expect(getComputedStyle(icon).backgroundColor).toBe(
        getComputedStyle(label).color,
      );
      // The kind picks the artwork, the way the Figma variant picks the swap.
      await expect(getComputedStyle(icon).maskImage).toContain(expected.icon);
      // iconSlot at Size 250 owns the box.
      const slot = block.querySelector('.knowieIconSlot') as HTMLElement;
      await expect(slot).toHaveAttribute('data-size', '250');
      await expect(getComputedStyle(slot).width).toBe('20px');
    },
  };
}

/** What Knowie heard, quoted back. */
export const Said = kindStory('Said', {
  label: 'What you said',
  body: 'It was when lords gave land to knights and the peasants farmed it for them.',
});

/** The nudge — the loudest of the three, because it is the thing to act on. */
export const Hint = kindStory('Hint', {
  label: 'Hint',
  body: 'Think about what the peasants owed in return for the land they worked.',
});

/** The reveal. */
export const Answer = kindStory('Answer', {
  label: 'The answer',
  body: 'A system where land was exchanged for military service and labour.',
});

/**
 * Not a Figma variant — `showIcon` is a boolean property, not a variant axis.
 * With it off the label stands alone, and the colour is the only thing left
 * separating the kinds, which is exactly what design-system.md warns against.
 */
export const WithoutIcon: Story = {
  name: 'showIcon=false',
  args: {
    kind: 'Hint',
    label: 'Hint',
    body: 'Think about what the peasants owed in return for the land they worked.',
    showIcon: false,
  },
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector('.knowieAnswerBlock') as HTMLElement;
    await expect(block.querySelector('.knowieIconSlot')).toBeNull();
    await expect(block.querySelector('.knowieAnswerBlock-icon')).toBeNull();
  },
};

/**
 * Not a Figma variant — the three kinds stacked the way a verdict sheet shows
 * them, which is the only place the loudness order between them is visible.
 */
export const AllThree: Story = {
  name: 'All three kinds',
  args: { kind: 'Said' },
  render: () => (
    <div className="knowieAnswerBlockDemo">
      <div className="knowieAnswerBlockDemo-stack">
        <AnswerBlock
          kind="Said"
          label="What you said"
          body="It was when lords gave land to knights and the peasants farmed it for them."
        />
        <AnswerBlock
          kind="Hint"
          label="Hint"
          body="Think about what the peasants owed in return for the land they worked."
        />
        <AnswerBlock
          kind="Answer"
          label="The answer"
          body="A system where land was exchanged for military service and labour."
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const blocks = canvasElement.querySelectorAll('.knowieAnswerBlock');
    await expect(blocks).toHaveLength(3);
    // Said outlines, the other two fill — no two kinds read the same.
    const fills = [...blocks].map((b) => getComputedStyle(b).backgroundColor);
    await expect(new Set(fills).size).toBe(3);
  },
};
