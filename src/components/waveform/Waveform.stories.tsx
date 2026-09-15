import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Waveform, type WaveformProgress, type WaveformState } from './Waveform';
import './waveform.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> The audio level display. Live while recording, Idle inside takePlayer for a
> take that exists but is not playing, Silent when nothing was captured.
> Progress fills the bars left to right as a take plays back, the same way
> progressIndicator fills. It is decoration for a state that is already carried
> by a label, a timer and an icon, so it must never be the only thing telling
> the student what is happening. Never recolour individual bars on an instance;
> if you need a split the variants do not offer, that is a gap to report.
> Reduced motion: the bars freeze, the timer and the label keep moving.

### The row

24 bars, Space/100 wide on a Space/150 gap, in a Space/800 tall row. The heights
run on a repeating four-step figure — 8, 12, 16, 24 — so the row reads as levels
rather than as a pattern of two.

| state | bars | progress |
| --- | --- | --- |
| Live | all accent.brand.bold | 0 only |
| Idle | filled accent.brand.bold, rest text.tertiary | 0, 25, 50, 75, 100 |
| Silent | all text.tertiary, all flattened to Space/100 | 0 only |

**Only Idle carries a split.** Figma has progress steps on Idle alone; Live and
Silent exist at 0 only. So \`progress\` is ignored on Live and Silent here —
Live stays whole and Silent stays empty whatever it says. That is deliberate:
it keeps the component from drawing a combination the variants do not offer.

Playback lands on the nearest quarter, so a take reads in quarters rather than
continuously — 0, 6, 12, 18 or 24 bars filled.

### What not to do with it

- **Never let it be the only thing telling the student what is happening.** It
  is decoration for a state already carried by a label, a timer and an icon,
  which is why it is \`aria-hidden\` here.
- **Never recolour individual bars.** There is no per-bar API, on purpose. If
  you need a split the variants do not offer, that is a gap to report.
- **Live means audio is actually being captured.** Brand violet means live
  audio in this feature and nothing else may use it that way.

### Gap: the motion is not defined anywhere

The description ends with a reduced-motion rule — "the bars freeze, the timer
and the label keep moving" — which only makes sense if Live animates. **It does
not animate here, because there is nothing to build the animation from:**

- The Figma set has no prototype reactions and no motion spec. All seven
  variants are static, including Live.
- \`tokens/tokens.json\` has no duration and no easing tokens — the words do
  not appear in the file at all.

Building it would mean inventing both the timing and the figure, which is
design, not implementation. What is needed is a decision on how the bars move
(all of them, or a travelling group?) plus duration and easing tokens. Once
those exist this is a small addition, and it wants a
\`prefers-reduced-motion: reduce\` branch that freezes the bars — the component
already draws a correct frozen state, which is exactly what that branch needs.
`;

const meta = {
  title: 'Components/waveform',
  component: Waveform,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    state: { control: 'inline-radio', options: ['Live', 'Idle', 'Silent'] },
    progress: { control: 'inline-radio', options: ['0', '25', '50', '75', '100'] },
  },
  render: (args) => (
    <div className="knowieWaveformDemo">
      <Waveform {...args} />
    </div>
  ),
} satisfies Meta<typeof Waveform>;

export default meta;
type Story = StoryObj<typeof meta>;

/** How many of the 24 bars each variant fills. Only Idle carries a split. */
const FILLED: Record<string, number> = {
  'Live/0': 0,
  'Idle/0': 0,
  'Idle/25': 6,
  'Idle/50': 12,
  'Idle/75': 18,
  'Idle/100': 24,
  'Silent/0': 0,
};

/** The repeating height figure, and the flat one Silent uses. */
const HEIGHTS = [8, 12, 16, 24];

/**
 * One story per Figma variant, named the way Figma names it.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function variantStory(state: WaveformState, progress: WaveformProgress): Story {
  return {
    args: { state, progress },
    play: async ({ canvasElement }) => {
      const row = canvasElement.querySelector('.knowieWaveform') as HTMLElement;
      const bars = [...row.querySelectorAll('.knowieWaveform-bar')] as HTMLElement[];
      const expected = FILLED[`${state}/${progress}`];

      await expect(row).toHaveAttribute('data-state', state);
      await expect(bars).toHaveLength(24);
      // Decoration only — the label, timer and icon carry the state.
      await expect(row).toHaveAttribute('aria-hidden', 'true');

      // Space/800 row, Space/100 bars on a Space/150 gap.
      await expect(getComputedStyle(row).height).toBe('32px');
      await expect(getComputedStyle(row).columnGap).toBe('6px');
      await expect(getComputedStyle(bars[0]).width).toBe('4px');

      // Silent flattens every bar; the rest run the four-step figure.
      bars.forEach((bar, i) => {
        const h = state === 'Silent' ? 4 : HEIGHTS[i % 4];
        expect(getComputedStyle(bar).height).toBe(`${h}px`);
      });

      // The fill runs left to right and lands on a quarter.
      const brand = getComputedStyle(bars[0]).backgroundColor;
      const marked = bars.filter((b) => b.dataset.filled === 'true');
      await expect(marked).toHaveLength(expected);
      if (state === 'Live') {
        // Live is whole, so every bar takes the brand without any split.
        const colours = new Set(bars.map((b) => getComputedStyle(b).backgroundColor));
        await expect(colours.size).toBe(1);
        await expect(brand).not.toBe('');
      }
      if (state === 'Idle' && expected > 0 && expected < 24) {
        // A real split: the filled bars differ from the unfilled ones.
        await expect(getComputedStyle(bars[0]).backgroundColor).not.toBe(
          getComputedStyle(bars[23]).backgroundColor,
        );
      }
    },
  };
}

export const LiveZero: Story = {
  ...variantStory('Live', '0'),
  name: 'state=Live, progress=0',
};

export const IdleZero: Story = {
  ...variantStory('Idle', '0'),
  name: 'state=Idle, progress=0',
};

export const IdleTwentyFive: Story = {
  ...variantStory('Idle', '25'),
  name: 'state=Idle, progress=25',
};

export const IdleFifty: Story = {
  ...variantStory('Idle', '50'),
  name: 'state=Idle, progress=50',
};

export const IdleSeventyFive: Story = {
  ...variantStory('Idle', '75'),
  name: 'state=Idle, progress=75',
};

export const IdleHundred: Story = {
  ...variantStory('Idle', '100'),
  name: 'state=Idle, progress=100',
};

export const SilentZero: Story = {
  ...variantStory('Silent', '0'),
  name: 'state=Silent, progress=0',
};

/**
 * Not a Figma variant — the five Idle steps stacked, which is the only place
 * the fill order reads as playback rather than as five separate pictures.
 */
export const PlayingThrough: Story = {
  name: 'Idle, every step',
  args: { state: 'Idle', progress: '0' },
  render: () => (
    <div className="knowieWaveformDemo">
      <div className="knowieWaveformDemo-steps">
        {(['0', '25', '50', '75', '100'] as WaveformProgress[]).map((p) => (
          <Waveform key={p} state="Idle" progress={p} />
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll('.knowieWaveform')];
    await expect(rows).toHaveLength(5);
    // Each step fills six more bars than the one above it.
    const counts = rows.map((r) => r.querySelectorAll('[data-filled="true"]').length);
    await expect(counts).toEqual([0, 6, 12, 18, 24]);
  },
};

/**
 * Not a Figma variant — `progress` has no effect on Live or Silent, because
 * Figma has no such variants. Both ignore it rather than drawing a split.
 */
export const ProgressIgnored: Story = {
  name: 'progress ignored off Idle',
  args: { state: 'Live', progress: '75' },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('.knowieWaveform') as HTMLElement;
    // The prop is carried on the element, but nothing is split by it.
    await expect(row).toHaveAttribute('data-progress', '75');
    await expect(row.querySelectorAll('[data-filled="true"]')).toHaveLength(0);
  },
};
