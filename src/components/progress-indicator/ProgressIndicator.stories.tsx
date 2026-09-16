import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import {
  ProgressIndicator,
  type ProgressIndicatorThickness,
  type ProgressIndicatorVariant,
} from './ProgressIndicator';
import './progressIndicator.stories.css';

const VARIANTS: ProgressIndicatorVariant[] = ['Primary', 'Coral'];
const THICKNESSES: ProgressIndicatorThickness[] = ['24', '16'];

type Counted = { current: number; total: number };

/** Both variants at both thicknesses, from a percentage or from a count. */
function Matrix({ progress, counted }: { progress: number; counted?: Counted }) {
  return (
    <div className="knowieProgressDemo">
      {VARIANTS.map((variant) => (
        <div className="knowieProgressDemo-group" key={variant}>
          <h3 className="knowieProgressDemo-title">{variant}</h3>
          {THICKNESSES.map((thickness) => (
            <ProgressIndicator
              key={thickness}
              variant={variant}
              thickness={thickness}
              {...(counted ? counted : { progress })}
              aria-label={`${variant} ${thickness} — ${progress}%`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const DOCS = `
**The Figma component set carries no description.** \`progressIndicator\`
(node 9003:8923) has an empty description field and no documentation links, so
there is nothing to quote. Only the eight sprint components carry descriptions.

What follows is the progressIndicator rule from design-system.md:

> **progressIndicator.** Step progress through a flow. Use showText when the
> number itself matters to the student.

design-system.md also places it: appBar's centre slot holds a
progressIndicator on flow screens, and waveform fills its bars "the same way
progressIndicator fills".

**Not only quarters.** Figma names five progress steps — 0, 25, 50, 75, 100 —
and those five still work. But a variant axis is not a range: the recall
session has three terms, and a bar that can only draw quarters puts the
student at 25% when they are a third of the way through. So \`progress\` takes
any number 0–100, and \`current\`/\`total\` compute one with
\`Math.floor(current / total * 100)\` — floored, not rounded, so a third reads
as 33 and two thirds as 66, never a step the student has not reached. Out of
range clamps to 0–100.

**The unit text is not drawn, but it is read.** Figma bakes a label into each
thickness=24 variant — "0/12" through "12/12" — behind a \`showText\` boolean.
No screen in this project shows it, so the visible layer is not built. The
string itself is worth having anyway: given \`current\` and \`total\`, the bar
carries \`aria-valuetext="{current} of {total}"\`, so a screen reader says "1
of 3" rather than "33 percent". Without a count there is no unit text and the
percentage stands on its own.

Two more things differ from the Figma file, each on purpose:

- **The track's border is not built.** This project does not need it. Worth
  knowing separately: Figma binds that 1px edge to \`border/subtle\`, a
  variable deleted from the Semantic color token collection, so it could not
  have reached code anyway. The binding is still worth repointing in the file,
  since Figma resolves it by ID and it looks fine on canvas.
- **The width is fluid.** Figma pins the track to 350. A bar has no business
  fixing its own width, so it fills its container and takes its percentage from
  that, reproducing the Figma proportions at any width. (350 is also an odd
  number here: design-system.md says a full-width component is 358.)

At \`progress=0\` the fill is drawn as a dot the width of the bar's own height,
not as nothing — matching how Figma draws the 0 variants. The bar has no
visible text, so whatever screen uses it must name it with \`aria-label\` or
\`aria-labelledby\`.
`;

const meta = {
  title: 'Components/progressIndicator',
  component: ProgressIndicator,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    thickness: { control: 'inline-radio', options: THICKNESSES },
    progress: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    current: { control: { type: 'number', min: 0 } },
    total: { control: { type: 'number', min: 1 } },
  },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The fill really is that share of the track, and 0 still draws its dot. */
async function expectFill(bar: HTMLElement, percent: number) {
  const fill = bar.firstElementChild as HTMLElement;
  const trackStyle = getComputedStyle(bar);
  const inner =
    bar.getBoundingClientRect().width -
    parseFloat(trackStyle.paddingLeft) -
    parseFloat(trackStyle.paddingRight);
  const fillBox = fill.getBoundingClientRect();

  if (percent === 0) {
    // The dot is as wide as the bar is tall.
    await expect(Math.round(fillBox.width)).toBe(Math.round(fillBox.height));
    return;
  }
  const share = (fillBox.width / inner) * 100;
  await expect(Math.abs(share - percent)).toBeLessThan(1);
}

/** One story per named step, driven by `progress` — the Figma quarters. */
function quarterStory(progress: 0 | 25 | 50 | 75 | 100): Story {
  return {
    name: String(progress),
    args: { progress },
    render: (args) => <Matrix progress={Number(args.progress)} />,
    play: async ({ canvas }) => {
      const bars = canvas.getAllByRole('progressbar');
      await expect(bars).toHaveLength(VARIANTS.length * THICKNESSES.length);

      for (const bar of bars) {
        await expect(bar).toHaveAttribute('aria-valuenow', String(progress));
        await expect(bar).toHaveAttribute('aria-valuemin', '0');
        await expect(bar).toHaveAttribute('aria-valuemax', '100');
        // No count, so no unit text — the percentage speaks for itself.
        await expect(bar).not.toHaveAttribute('aria-valuetext');
        await expectFill(bar, progress);
      }
    },
  };
}

/**
 * One story per step of a three-term session, driven by `current`/`total` —
 * the thirds the quarters could not express. 1/3 floors to 33, 2/3 to 66.
 */
function thirdStory(current: 0 | 1 | 2 | 3, percent: 0 | 33 | 66 | 100): Story {
  const total = 3;
  return {
    name: `${percent} — ${current} of ${total}`,
    args: { current, total },
    render: (args) => (
      <Matrix progress={percent} counted={{ current: Number(args.current), total }} />
    ),
    play: async ({ canvas }) => {
      const bars = canvas.getAllByRole('progressbar');
      await expect(bars).toHaveLength(VARIANTS.length * THICKNESSES.length);

      for (const bar of bars) {
        await expect(bar).toHaveAttribute('aria-valuenow', String(percent));
        await expect(bar).toHaveAttribute('aria-valuemin', '0');
        await expect(bar).toHaveAttribute('aria-valuemax', '100');
        await expect(bar).toHaveAttribute('aria-valuetext', `${current} of ${total}`);
        await expectFill(bar, percent);
      }
    },
  };
}

export const Progress0 = quarterStory(0);
export const Progress25 = quarterStory(25);
export const Progress50 = quarterStory(50);
export const Progress75 = quarterStory(75);
export const Progress100 = quarterStory(100);

export const Thirds0 = thirdStory(0, 0);
export const Thirds33 = thirdStory(1, 33);
export const Thirds66 = thirdStory(2, 66);
export const Thirds100 = thirdStory(3, 100);

/** Out of range clamps rather than overflowing the track. */
export const Clamped: Story = {
  args: { current: 7, total: 3 },
  render: () => <Matrix progress={100} counted={{ current: 7, total: 3 }} />,
  play: async ({ canvas }) => {
    for (const bar of canvas.getAllByRole('progressbar')) {
      await expect(bar).toHaveAttribute('aria-valuenow', '100');
      await expectFill(bar, 100);
    }
  },
};
