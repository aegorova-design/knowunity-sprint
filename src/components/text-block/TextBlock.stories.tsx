import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { TextBlock, type TextBlockVariant } from './TextBlock';
import './textBlock.stories.css';

const DOCS = `
**The Figma component set carries no description.** \`textBlock\` (node
9003:9039) has an empty description field, on the set and on all four variants
— unlike the eight sprint components, which each carry one. So there is no
verbatim block to quote here, and nothing below is invented to fill the gap.

What design-system.md says, in full, is this:

> **textBlock.** A title with an optional caption. Use XL and L for
> screen-level headings, and M and S for section headings.

Everything else here is read off the Figma file itself rather than off a
description, so treat it as observed behaviour, not as stated intent:

- **XL and L are centred, M and S are left-aligned.** That is set on the text
  layers in Figma, not exposed as a property, so it is not a prop here either.
- **The block fills its container.** Every instance in the file is FILL — 358
  in middleContent, 282 inside a prompt — which is what makes the centring on
  XL and L do any work.
- **XL and L share one caption style** (Headline XS Regular), so the caption
  stays put while the title drops from 76 to 44. M and S each take their own
  smaller caption (Caption M and Caption S Regular).
- **The gap tightens with the step:** Space/100 on XL and L, Space/050 on M
  and S.

### What not to do with it

design-system.md's rules for the system as a whole apply, and two of them bite
here. answerBlock's description says a labelled passage of text belongs inside
a verdict sheet or under a prompt and "never as a screen heading, which is
textBlock's job" — so the line runs both ways: textBlock is the heading, not
the place to put a passage. And Caption S, which variant S uses, is recorded in
design-system.md as being below the platform's minimum caption size. Prefer M
for anything a student has to read.

### Gaps

- **No description in Figma.** By the sprint's own convention — "Write the
  description before you call it done" — this component is unfinished. What
  each step is for, and what not to do with it, is a decision to record on the
  component, not here.
- **Letter spacing is not built.** Figma sets -1% on the XL and L titles and
  +1% on everything else. The tracking primitives exist
  (\`--font-tracking-tight\`, \`-none\`, \`-loose\`) but no Greed text style
  token carries a letterSpacing member, and a percent is not a valid CSS
  letter-spacing unit anyway. Rather than read a primitive directly or invent a
  value, this is left off — the same way the other five components in this
  Storybook leave it off.

### One addition Figma cannot express

\`titleAs\` sets the title's heading level. Figma has no say in the DOM, but a
screen-level XL or L is usually the screen's \`h1\` and a section heading an
\`h2\` or \`h3\`. It defaults to \`h2\` so the title is never a bare paragraph.
`;

const meta = {
  title: 'Components/textBlock',
  component: TextBlock,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['XL', 'L', 'M', 'S'] },
    titleAs: { control: 'inline-radio', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
  },
  render: (args) => (
    <div className="knowieTextBlockDemo">
      <TextBlock {...args} />
    </div>
  ),
} satisfies Meta<typeof TextBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The type each step resolves to, as px, straight off the Figma text styles. */
const TYPE: Record<TextBlockVariant, { title: number; caption: number; gap: number }> = {
  XL: { title: 76, caption: 18, gap: 4 },
  L: { title: 44, caption: 18, gap: 4 },
  M: { title: 18, caption: 12, gap: 2 },
  S: { title: 15, caption: 9, gap: 2 },
};

/** One story per Figma variant, checking the type and gap the variant resolves to. */
function variantStory(variant: TextBlockVariant, args: Partial<Story['args']>): Story {
  return {
    name: variant,
    args: { variant, ...args },
    play: async ({ canvas }) => {
      const title = canvas.getByRole('heading');
      const block = title.parentElement as HTMLElement;
      const caption = block.querySelector('.knowieTextBlock-caption') as HTMLElement;
      const expected = TYPE[variant];

      await expect(block).toHaveAttribute('data-variant', variant);
      // Every one of these comes through a token, so a broken binding fails here.
      await expect(getComputedStyle(title).fontSize).toBe(`${expected.title}px`);
      await expect(getComputedStyle(caption).fontSize).toBe(`${expected.caption}px`);
      await expect(getComputedStyle(block).rowGap).toBe(`${expected.gap}px`);
      await expect(getComputedStyle(block).textAlign).toBe(
        variant === 'XL' || variant === 'L' ? 'center' : 'left',
      );
    },
  };
}

/** The screen-level welcome, at the largest step. */
export const XL = variantStory('XL', {
  title: 'Say it to know it',
  caption:
    'Explaining an idea in your own words is the quickest way to find out if you really know it.',
  titleAs: 'h1',
});

/** A verdict head, where the title is a short read on how it went. */
export const L = variantStory('L', {
  title: 'Feudalism is yours.',
  caption: 'Serfdom needed a hint. Manorialism and Vassalage are next to work on.',
  titleAs: 'h1',
});

/** A section heading — here the prompt the student answers out loud. */
export const M = variantStory('M', {
  title: 'In your own words, what does feudalism mean?',
  caption: 'Explain it like you would to a classmate.',
});

/** The smallest section heading. Its caption sits below the platform minimum. */
export const S = variantStory('S', {
  title: 'This session',
  caption: '4 terms',
});

/**
 * Not a Figma variant — `showCaption` is a boolean property, not a variant
 * axis. With it off, the title stands alone and the gap has nothing to hold.
 */
export const WithoutCaption: Story = {
  name: 'showCaption=false',
  args: {
    variant: 'L',
    title: 'Say it to know it',
    showCaption: false,
    titleAs: 'h1',
  },
  play: async ({ canvas }) => {
    const title = canvas.getByRole('heading', { name: 'Say it to know it' });
    const block = title.parentElement as HTMLElement;
    await expect(block.querySelector('.knowieTextBlock-caption')).toBeNull();
  },
};
