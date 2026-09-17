import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { VerdictHeader } from '../verdict-header/VerdictHeader';
import { Skeleton, type SkeletonLines } from './Skeleton';
import './skeleton.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> Placeholder lines for text that is still loading, used while the judge is
> working. Neutral fill, no motion: the Processing screen already has Knowie
> rolling, so the skeleton stays quiet. Pick the line count to match the text it
> stands in for; line widths are fixed so the shape reads as prose, not a bar.

**That description is out of date on one point and is due an edit.** The lines
shimmer now — see below. Everything else in it still holds.

### The three counts

The widths are not one list sliced to length. Each count has its own order, off
the file:

| lines | widths, in order | block height |
| --- | --- | --- |
| 1 | 300 | 16 |
| 2 | 300, 160 | 44 |
| 3 | 160, 300, 220 | 72 |

Each line is 16 tall with Radius/100 and background/stacking. The block is the
full 358, its lines are centred, and the gap is Space/300.

### Why it moves

It did not, and the reversal was deliberate. The original decision leaned on
Knowie carrying the movement on the Processing screen — but \`mascotFigure\` has
no motion and no token names a mascot idle loop, so nothing on that screen was
moving at all. voice-ux.md asks for "a skeleton/animated state, not a dead
spinner" during the <4s wait, and SPEC.md's motion rule already listed "the
skeleton shimmer" among the things \`prefers-reduced-motion\` stops. The block
was the odd one out against both.

The figure is a 135deg band of light on a gradient box 2.6x the line's width,
swept end to end by \`background-position\`, with the line breathing from 0.75
to full opacity as the band passes the middle. It rests at
\`background/stacking\` and crests at \`background/shimmer\`, one step brighter.
Timing is \`motion.duration.shimmer\` (1350ms) on \`motion.easing.listen\` — the
curve is borrowed rather than duplicated, because the sweep wants the same
symmetric ease-in-out the waveform's loop already is.

Under \`prefers-reduced-motion\` the gradient goes with the animation and the
flat fill comes back, which is exactly the component as it was before. A frozen
band would leave one bright patch parked on the bar for the whole wait.

### Where it is used

Screen 04 Processing, at \`lines=3\`, directly under \`verdictHeader\`
\`verdict=Checking\`, the two Space/600 apart.

### Accessibility

The block is \`aria-hidden\`. It stands in for text that does not exist yet, so
it has nothing to announce, and the screen that uses it already names the wait
in real copy. The caller owns that announcement.

### Gaps

- **No width tokens, for anything.** 160, 300 and 220 are plain numbers,
  because tokens/tokens.json has no width family at all — not for this, not for
  the 358 full width, not for waveform's 236. They are set inline here from the
  component's own variant map so they stay next to the variant they belong to.
  A Size or Width family would fix it for the whole system, not just this
  component.
- **The line height is unbound in Figma.** 16 binds no variable, the way
  button's L face height doesn't. \`Space/400\` is the same 16 and is what
  waveform already uses for a drawn height, so that is what is used here. If
  the line is meant to stand in for a line of text, \`font/lineHeight/xs\` is
  the same 16 and would be the more honest name.
- **The old skeleton is still in the file.** A previous single-bar component
  (240x16, square corners, node 13584:6120) sits on no page and is reachable
  only through its instances. This set supersedes it. The orphan wants deleting
  so nobody swaps to it by accident.
`;

const meta = {
  title: 'Components/skeleton',
  component: Skeleton,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    lines: { control: 'inline-radio', options: ['1', '2', '3'] },
  },
  render: (args) => (
    <div className="knowieSkeletonDemo">
      <Skeleton {...args} />
    </div>
  ),
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The widths each count draws, in order, and the block height they come to. */
const SHAPE: Record<SkeletonLines, { widths: number[]; height: number }> = {
  '1': { widths: [300], height: 16 },
  '2': { widths: [300, 160], height: 44 },
  '3': { widths: [160, 300, 220], height: 72 },
};

/**
 * One story per Figma variant, named the way Figma names it.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function variantStory(lines: SkeletonLines): Story {
  return {
    args: { lines },
    play: async ({ canvasElement }) => {
      const root = canvasElement.querySelector('.knowieSkeleton') as HTMLElement;
      const drawn = [...root.querySelectorAll('.knowieSkeleton-line')] as HTMLElement[];
      const expected = SHAPE[lines];

      await expect(root).toHaveAttribute('data-lines', lines);
      await expect(drawn).toHaveLength(expected.widths.length);

      // The widths are the file's, in the file's order — not one list sliced.
      await expect(drawn.map((l) => Math.round(l.getBoundingClientRect().width))).toEqual(
        expected.widths,
      );

      // Every line is 16 tall with Radius/100, and the block hugs to the
      // height those lines and the Space/300 gaps come to.
      for (const line of drawn) {
        await expect(Math.round(line.getBoundingClientRect().height)).toBe(16);
        await expect(getComputedStyle(line).borderRadius).toBe('4px');
      }
      await expect(getComputedStyle(root).rowGap).toBe('12px');
      await expect(Math.round(root.getBoundingClientRect().height)).toBe(expected.height);

      // Decorative, so it stays out of the accessibility tree.
      await expect(root).toHaveAttribute('aria-hidden', 'true');

      // The block itself never moves; the shimmer belongs to the lines.
      await expect(getComputedStyle(root).animationName).toBe('none');

      // Every line runs the same sweep, in sync — no stagger, unlike waveform.
      for (const line of drawn) {
        const style = getComputedStyle(line);
        await expect(style.animationName).toBe('knowieSkeletonShimmer');
        await expect(style.animationDuration).toBe('1.35s');
        await expect(style.animationIterationCount).toBe('infinite');
        await expect(style.animationDelay).toBe('0s');

        // The gradient paints the resting fill itself, so the flat fill under
        // it is cleared — stacked, the two translucent whites would double up.
        await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
        await expect(style.backgroundImage).toContain('linear-gradient');
      }
    },
  };
}

export const Lines3: Story = {
  ...variantStory('3'),
  name: 'lines=3',
};

export const Lines2: Story = {
  ...variantStory('2'),
  name: 'lines=2',
};

export const Lines1: Story = {
  ...variantStory('1'),
  name: 'lines=1',
};

/**
 * Not a Figma variant — the three counts together, which is the only way the
 * ragged widths read as a deliberate shape rather than as three arbitrary bars.
 */
export const EveryCount: Story = {
  name: 'Every count',
  args: { lines: '3' },
  render: () => (
    <div className="knowieSkeletonDemo">
      <div className="knowieSkeletonDemo-stack">
        <Skeleton lines="1" />
        <Skeleton lines="2" />
        <Skeleton lines="3" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const blocks = [...canvasElement.querySelectorAll('.knowieSkeleton')] as HTMLElement[];
    await expect(blocks).toHaveLength(3);
    await expect(blocks.map((b) => b.querySelectorAll('.knowieSkeleton-line').length)).toEqual([
      1, 2, 3,
    ]);
    // Every block starts with a long line, so the three read as one family.
    for (const block of blocks) {
      const first = block.querySelector('.knowieSkeleton-line') as HTMLElement;
      const width = Math.round(first.getBoundingClientRect().width);
      await expect(width === 300 || width === 160).toBe(true);
    }
  },
};

/**
 * Not a Figma variant — the Processing screen's own stack, which is the only
 * place this component is used: verdictHeader at verdict=Checking, then the
 * block at lines=3, Space/600 apart.
 *
 * It is also where to judge the shimmer: the block has to read as the third
 * layer behind Knowie and the headline, not compete with them.
 */
export const OnProcessing: Story = {
  name: 'On the Processing screen',
  args: { lines: '3' },
  render: () => (
    <div className="knowieSkeletonDemo">
      <div className="knowieSkeletonDemo-checking">
        <VerdictHeader
          verdict="Checking"
          title="Checking your answer"
          caption="Comparing what you said with the key ideas."
        />
        <Skeleton lines="3" />
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // The wait is named in text, which is what lets the block say nothing.
    await expect(canvas.getByText('Checking your answer')).toBeVisible();
    const block = canvasElement.querySelector('.knowieSkeleton') as HTMLElement;
    await expect(block).toHaveAttribute('aria-hidden', 'true');
    await expect(block.querySelectorAll('.knowieSkeleton-line')).toHaveLength(3);
  },
};
