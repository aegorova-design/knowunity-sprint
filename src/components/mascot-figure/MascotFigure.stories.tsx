import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { MascotFigure, type MascotFigurePose, type MascotFigureSize } from './MascotFigure';
import './mascotFigure.stories.css';

const POSES: MascotFigurePose[] = ['Standby', 'Excited', 'Questioning', 'Approving', 'Thinking'];

const DOCS = `
The component's description in Figma, verbatim:

> Knowie, and only Knowie. size picks how much presence the moment needs, pose
> picks what Knowie is doing about it: Standby is neutral and the default,
> Questioning belongs on a prompt, Approving on a pass, Excited on a summary or
> a streak, Thinking on a moment where Knowie is working something out and the
> student is waiting. The frame follows the artwork's 200:217 ratio, so height
> carries the size token and width follows. Never scale the artwork by hand,
> never place .mascotFigureBase directly, and never let a pose be the only thing
> carrying a verdict, since pose and colour both disappear in greyscale. Thinking
> is not one of mascotMessage's states and must not be wired to one. A sixth pose
> is a product decision before it is a variant.

### This supersedes mascotSlot

\`mascotSlot\` is a square box that stretches Knowie to fit it — a gap reported
when that component was built. This one follows the artwork's own proportions,
so nothing is distorted. mascotSlot has been **retired**: it is gone from this
library, and mascotMessage and scaffold's story now use this instead. It still
exists in Figma, where mascotMessage's component continues to nest it.

| size | height | token | width |
| --- | --- | --- | --- |
| S | 48 | Icon/600 | 44 |
| M | 64 | Illustration/800 | 59 |
| L | 120 | Illustration/1500 | 111 |

**Only height is bound in Figma**, and width follows the ratio — which is what
\`aspect-ratio: 200 / 217\` does here. That ratio is the artwork's own
proportion rather than a design value, so it is the one number in the CSS that
is not a token.

Note the sizes cross two scales: S sits on Icon while M and L sit on
Illustration. That is how the file binds them.

### What not to do with it

- **Knowie, and only Knowie.** Not a generic avatar or image box.
- **Never scale the artwork by hand.** Pick the size that fits.
- **Never let a pose be the only thing carrying a verdict** — pose and colour
  both disappear in greyscale, so there must always be copy saying it too. That
  is why \`alt\` is empty by default.
- **Never wire Thinking to a mascotMessage state.** mascotMessage maps its four
  states to four poses; Thinking is deliberately outside that set, for moments
  where Knowie is working something out and the student is waiting.
- **A sixth pose is a product decision before it is a variant.**

### Gaps

- **The artwork is framed wider than the ratio the component claims.** The
  exported SVGs are 219.3 x 232.6, a ratio of 0.943; the component declares
  200:217, which is 0.922. Built with \`object-fit: contain\`, so Knowie sits
  about a pixel short of the box at S rather than being stretched to it.
- **Only five of the fourteen poses in \`public/images\` are exposed**, because
  those are the five the set offers. The other nine are unreachable through this
  component, which is deliberate — a sixth pose is a decision.
- **The four original pose components are orphans.** \`standby\`, \`excited\`,
  \`questioning\` and \`approving\` sit on no page and survive only through the
  instances inside \`.mascotFigureBase\`, so they cannot be edited without
  detaching. The new \`thinking\` component was placed properly in the
  mascotFigure section, which means it is the only one of the five you can
  actually open. Restoring the other four is still worth doing.
`;

const meta = {
  title: 'Components/mascotFigure',
  component: MascotFigure,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['S', 'M', 'L'] },
    pose: { control: 'inline-radio', options: POSES },
  },
  render: (args) => (
    <div className="knowieMascotFigureDemo">
      <MascotFigure {...args} />
    </div>
  ),
} satisfies Meta<typeof MascotFigure>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The box each size resolves to, height first — width follows the ratio. */
const BOX: Record<MascotFigureSize, { h: number; w: number }> = {
  S: { h: 48, w: 44 },
  M: { h: 64, w: 59 },
  L: { h: 120, w: 111 },
};

/**
 * One story per size, showing all four poses.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function sizeStory(size: MascotFigureSize): Story {
  return {
    args: { size },
    render: (args) => (
      <div className="knowieMascotFigureDemo">
        <div className="knowieMascotFigureDemo-row">
          {POSES.map((pose) => (
            <MascotFigure key={pose} size={args.size} pose={pose} />
          ))}
        </div>
      </div>
    ),
    play: async ({ canvasElement }) => {
      const figures = [...canvasElement.querySelectorAll('.knowieMascotFigure')] as HTMLElement[];
      await expect(figures).toHaveLength(5);
      const expected = BOX[size];

      for (const figure of figures) {
        await expect(figure).toHaveAttribute('data-size', size);
        // Height carries the size token; width follows the artwork's ratio.
        const box = figure.getBoundingClientRect();
        await expect(Math.round(box.height)).toBe(expected.h);
        await expect(Math.round(box.width)).toBe(expected.w);
        // Decorative by default: the pose must never be the only thing saying it.
        await expect(figure.querySelector('img')).toHaveAttribute('alt', '');
      }
      // Five poses, five different files — no pose falls back to another.
      const srcs = figures.map((f) => f.querySelector('img')?.getAttribute('src'));
      await expect(new Set(srcs).size).toBe(5);
    },
  };
}

/** Beside a line of copy, as in mascotMessage. */
export const SizeS: Story = { ...sizeStory('S'), name: 'size=S' };

/** A little more presence. */
export const SizeM: Story = { ...sizeStory('M'), name: 'size=M' };

/** Large enough to carry a moment on its own. */
export const SizeL: Story = { ...sizeStory('L'), name: 'size=L' };

/**
 * Not a Figma variant — Knowie as the whole message, so the artwork needs a
 * text alternative. Everywhere else `alt` stays empty on purpose.
 */
export const Labelled: Story = {
  name: 'With an alt',
  args: { size: 'L', pose: 'Approving', alt: 'Knowie looks pleased' },
  play: async ({ canvas }) => {
    await expect(canvas.getByAltText('Knowie looks pleased')).toBeVisible();
  },
};
