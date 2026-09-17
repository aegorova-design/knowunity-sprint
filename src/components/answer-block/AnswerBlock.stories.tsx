import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { AnswerBlock, type AnswerBlockKind } from './AnswerBlock';
import './answerBlock.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> A labelled passage of text about the current term. Said is what Knowie
> heard, quoted back so a mishear reads as the app's mistake. Hint is the
> nudge, and it is the loudest of the three because it is the thing to act on.
> Answer is the reveal, and it carries the term's key ideas inside it: the
> name of the set over the chips that are in it, unticked, because a reveal
> means the student has been shown the answer rather than said it. Hint is the
> only kind with a fill — Said and Answer are outlined, and the label and the
> icon are what tell those two apart. Reach for it inside a verdict sheet or
> under a prompt, never as a screen heading, which is textBlock's job. Keep
> bodies to three lines; this is a glance, not a passage. Never recolour an
> instance to make one kind look like another, and never put the key ideas on
> Said or Hint: the group belongs to the one variant that has it. If you need
> a fourth treatment, that is a new kind and a decision.

### How the three kinds are told apart

Each kind changes three things at once — the container, the label colour and the
icon — so none of them leans on colour alone:

| kind | container | label + icon | icon |
| --- | --- | --- | --- |
| Said | outlined, no fill | text.secondary | microphone-01 |
| Hint | background.surface | accent.brand.bold | lightbulb-02 |
| Answer | background.stacking, outlined | accent.brand.bold | check |

The body is text.primary in all three. Only the label and the icon change, which
is what keeps the passage itself equally readable whichever kind it is.

Said and Answer are outlined, which is why they are 2 taller than Hint — 82
against 80. That is how Figma has it, not a rounding slip. They are told apart
by the fill as well as by the label and the icon: Said carries none, Answer
carries background.stacking under its key ideas.

### Answer carries the key ideas

The updated \`kind=Answer\` variant holds the term's key ideas inside the block,
under the body: the name of the set, then the chips that are in it. It gained
the outline with them, and keeps background.stacking behind them — an unticked
chip is background.surface, which is what a sheet is, so without a fill of its
own the four ideas vanish into the sheet on \`18 Summary, term tapped\`.

Figma bakes four chips in with their labels set on the instances and gives the
set no text property for them, so here they arrive as \`keyIdeas\`. A reveal is
about one term and the ideas are that term's. Left off, Answer is the label and
the body, which is what every use of it was before the update. Passing them to
Said or Hint draws nothing: the group belongs to the one variant that has it.

They have one state, the unticked one Figma draws, and \`chips\`'s \`active\` is
not exposed here. A reveal tells the student what the answer contains rather
than recording what they covered, and that holds on the say-back and on the
summary too. Ticked chips belong to \`CoveredIdeas\`, on the two pass screens.

The chips are wrapped in a named list, because \`chips\` renders a \`<button>\`
whatever it is handed and four unnamed buttons would be four controls that do
nothing. The visible name is hidden from assistive tech and given to the list
instead, so the group is announced once.

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
  Answer: { icon: 'check.svg', outlined: true },
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
      // Hint is the only kind with a fill; the outlined two are 2 taller.
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
    const blocks = [...canvasElement.querySelectorAll('.knowieAnswerBlock')] as HTMLElement[];
    await expect(blocks).toHaveLength(3);

    // Said and Answer are both outlined since the update, so the container
    // alone no longer separates all three — the label colour is what finishes
    // the job, and no two kinds share both.
    const reads = blocks.map((b) => {
      const box = getComputedStyle(b);
      const label = b.querySelector('.knowieAnswerBlock-label') as HTMLElement;
      return `${box.backgroundColor}/${box.borderTopWidth}/${getComputedStyle(label).color}`;
    });
    await expect(new Set(reads).size).toBe(3);
  },
};

/**
 * The updated `kind=Answer`: the term's key ideas inside the block, under the
 * body. Unticked, which is what a reveal means — the student has just been
 * shown the answer.
 */
export const AnswerWithKeyIdeas: Story = {
  name: 'Answer, with key ideas',
  args: {
    kind: 'Answer',
    label: 'The answer',
    body: 'Land was traded for loyalty and service. Nobles held land from the king and owed him support, and peasants worked that land in exchange for protection.',
    keyIdeas: ['Land', 'Loyalty and service', 'Protection', 'Peasant labour'],
  },
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector('.knowieAnswerBlock') as HTMLElement;
    const list = block.querySelector('.knowieAnswerBlock-chips') as HTMLElement;
    const chips = [...list.querySelectorAll('.knowieChips')] as HTMLElement[];

    // Four ideas, in the order they were given, inside the block itself.
    await expect(chips).toHaveLength(4);
    await expect(chips.map((c) => c.textContent)).toEqual([
      'Land',
      'Loyalty and service',
      'Protection',
      'Peasant labour',
    ]);

    // Unticked, the way Figma draws them, and there is no other state.
    await expect(chips.every((c) => c.dataset.active === 'False')).toBe(true);

    // One named list rather than four loose buttons, and the visible name is
    // not announced twice.
    await expect(list.tagName).toBe('UL');
    await expect(list).toHaveAttribute('aria-label', 'The key ideas');
    await expect(
      block.querySelector('.knowieAnswerBlock-ideasLabel'),
    ).toHaveAttribute('aria-hidden', 'true');

    // The group sits on Space/300 inside a block that is outlined, not filled.
    await expect(
      getComputedStyle(block.querySelector('.knowieAnswerBlock-ideas') as HTMLElement).rowGap,
    ).toBe('12px');
    await expect(getComputedStyle(block).borderTopWidth).toBe('1px');
    await expect(getComputedStyle(list).columnGap).toBe('8px');
  },
};

/**
 * Not a Figma variant — the group belongs to Answer alone, so ideas handed to
 * another kind draw nothing rather than a combination the variants do not
 * offer.
 */
export const KeyIdeasIgnoredOffAnswer: Story = {
  name: 'key ideas ignored off Answer',
  args: {
    kind: 'Hint',
    label: 'Hint',
    body: 'Think about what the peasants owed in return for the land they worked.',
    keyIdeas: ['Land', 'Loyalty and service'],
  },
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector('.knowieAnswerBlock') as HTMLElement;
    await expect(block.querySelector('.knowieAnswerBlock-ideas')).toBeNull();
  },
};
