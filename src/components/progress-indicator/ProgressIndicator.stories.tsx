import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import {
  ProgressIndicator,
  type ProgressIndicatorProgress,
  type ProgressIndicatorThickness,
  type ProgressIndicatorVariant,
} from './ProgressIndicator';
import './progressIndicator.stories.css';

const VARIANTS: ProgressIndicatorVariant[] = ['Primary', 'Coral'];
const THICKNESSES: ProgressIndicatorThickness[] = ['24', '16'];

/** Both variants at both thicknesses for one progress step. */
function Matrix({ progress }: { progress: ProgressIndicatorProgress }) {
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
              progress={progress}
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

Three things differ from the Figma file, each on purpose:

- **showText is not built.** Figma bakes a unit label into each thickness=24
  variant — "0/12" through "12/12" — behind a \`showText\` boolean. This
  project does not need it, so neither the property nor the label exists here.
  Note the rule quoted above still refers to it.
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
not as nothing — matching how Figma draws the 0 variants. The bar has no text,
so whatever screen uses it must name it with \`aria-label\` or
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
    progress: { control: 'inline-radio', options: ['0', '25', '50', '75', '100'] },
  },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * One story per Figma progress step, each checking the fill really is that
 * share of the track — and that progress=0 still draws its minimum dot.
 */
function progressStory(progress: ProgressIndicatorProgress): Story {
  return {
    name: progress,
    args: { progress },
    render: (args) => <Matrix progress={args.progress ?? progress} />,
    play: async ({ canvas }) => {
      const bars = canvas.getAllByRole('progressbar');
      await expect(bars).toHaveLength(VARIANTS.length * THICKNESSES.length);

      for (const bar of bars) {
        await expect(bar).toHaveAttribute('aria-valuenow', progress);

        const fill = bar.firstElementChild as HTMLElement;
        const trackStyle = getComputedStyle(bar);
        const inner =
          bar.getBoundingClientRect().width -
          parseFloat(trackStyle.paddingLeft) -
          parseFloat(trackStyle.paddingRight);
        const fillBox = fill.getBoundingClientRect();

        if (progress === '0') {
          // The dot is as wide as the bar is tall.
          await expect(Math.round(fillBox.width)).toBe(Math.round(fillBox.height));
        } else {
          const share = (fillBox.width / inner) * 100;
          await expect(Math.abs(share - Number(progress))).toBeLessThan(1);
        }
      }
    },
  };
}

export const Progress0 = progressStory('0');
export const Progress25 = progressStory('25');
export const Progress50 = progressStory('50');
export const Progress75 = progressStory('75');
export const Progress100 = progressStory('100');
