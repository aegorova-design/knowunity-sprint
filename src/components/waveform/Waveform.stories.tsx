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

### Two ways to set the fill

\`progress\` is the Figma axis and lands on the nearest quarter — 0, 6, 12, 18 or
24 bars. It is what an instance drawn in the file can say, and it is what every
static use of this component wants.

\`played\` is a real position, 0 to 1, and it wins over \`progress\` when both are
given. A take that is playing back has a clock behind it, and four steps is four
visible jumps however long the take is, so the player hands over the fraction
and the row rounds it **to the nearest bar — 24 steps, not 4**. Only Idle uses
either: Live stays whole and Silent stays empty whatever they say.

Rounding to the nearest rather than down is deliberate: the last bar lights half
a bar's width of time before the take ends, so playback finishes on a full row
rather than completing it at the instant it stops.

### The flip

Each bar's change from unplayed to played carries
\`motion.duration.pressOut\` (140ms) on \`motion.easing.press\`. The fill itself
is not motion — it reports position, the way progressIndicator does — but at 24
steps the bars turn over often enough that a hard cut reads as a stutter, so a
bar lights rather than snaps. The pair is borrowed rather than duplicated, on
the same grounds skeleton borrows \`motion.easing.listen\`; the reuse is logged
in component-gaps.md.

Reduced motion drops the flip and keeps the fill advancing: position is what
SPEC.md's motion rule keeps running while it stops the loops.

### What not to do with it

- **Never let it be the only thing telling the student what is happening.** It
  is decoration for a state already carried by a label, a timer and an icon,
  which is why it is \`aria-hidden\` here.
- **Never recolour individual bars.** There is no per-bar API, on purpose. If
  you need a split the variants do not offer, that is a gap to report.
- **Live means audio is actually being captured.** Brand violet means live
  audio in this feature and nothing else may use it that way.

### The listen loop

Live animates. Each bar runs one rise and fall — down to a trough, up to its
resting height, back — on \`motion.duration.listen\` (1200ms) with
\`motion.easing.listen\`, a symmetric curve so neither edge of the figure reads
as a beat.

What makes it read as *listening* rather than pulsing is the stagger. Each bar
lags the one before it by \`motion.duration.listenStagger\` (120ms), which
against the 1200ms loop puts about **2.4 crests on the row at once** — travelling
waves, not a single swell. That ratio is the design owner's call, not a
by-product: one crest (a ~45ms step) was the alternative and was rejected as too
calm for a live mic.

The delays are **negative**, so every bar is already mid-figure on the first
frame. With positive delays the row visibly assembles itself over the first
loop, which reads as a loading state at exactly the moment the student starts
talking.

Twenty-four distinct delays cannot come from \`nth-child\` — a repeating group
marches six identical fours instead of travelling — so the component sets
\`--i\` on each bar and the delay is \`calc(var(--i) * step * -1)\`.

**The crest is the resting figure.** \`scaleY\` runs from the trough to 1, never
past it, so the animation's peak is the same silhouette every other state
draws. That is what makes the reduced-motion branch a single \`animation: none\`
with nothing to design: the frozen frame is already correct.

**Depth is the one value here that is not a token.** It is a unitless scale
factor, and it belongs to no group \`tokens/tokens.json\` has; inventing a group
for a single number would be worse than naming it. It lives as
\`--waveform-listen-depth\` at the top of \`waveform.css\`.

The Figma set still has no motion spec — all seven variants are static, Live
included — so none of the above is readable from the file. It was specified
against a motion preview and signed off on the numbers.
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
  args: { state: 'Live', progress: '75', played: 0.4 },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('.knowieWaveform') as HTMLElement;
    // A position is ignored off Idle for the same reason a quarter is, so
    // neither can draw a combination the variants do not offer.
    await expect(row.querySelectorAll('[data-filled="true"]')).toHaveLength(0);
  },
};

/**
 * The listen loop's wiring, which is easy to break silently: the delays are
 * what make the row travel, and a positive step or a missing index would still
 * render 24 bars that merely look wrong.
 */
export const LiveMotion: Story = {
  name: 'state=Live, the listen loop',
  args: { state: 'Live', progress: '0' },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('.knowieWaveform') as HTMLElement;
    const bars = [...row.querySelectorAll('.knowieWaveform-bar')] as HTMLElement[];

    // Every bar carries its own index, in order.
    await expect(bars.map((b) => b.style.getPropertyValue('--i'))).toEqual(
      bars.map((_, i) => String(i)),
    );

    // And every delay is negative, so the row starts mid-figure rather than
    // assembling itself. The first is the only one allowed to be zero.
    const delays = bars.map((b) => Number.parseFloat(getComputedStyle(b).animationDelay));
    await expect(delays[0]).toBe(0);
    await expect(delays.every((d) => d <= 0)).toBe(true);

    // Each bar lags the one before it by the same step.
    const steps = delays.slice(1).map((d, i) => Math.round((delays[i] - d) * 1000) / 1000);
    await expect(new Set(steps).size).toBe(1);
  },
};

/**
 * The playback fill's wiring, which is easy to break silently: a row that
 * rounds to the quarter still renders 24 plausible bars, and a flip that lost
 * its tokens still changes colour.
 *
 * `played` is 0.3 here — 7.2 bars, so 7 — which is a fill `progress` cannot
 * express at all. That is the whole point of the prop.
 */
export const IdlePlayed: Story = {
  name: 'state=Idle, a played position',
  args: { state: 'Idle', progress: '0', played: 0.3 },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('.knowieWaveform') as HTMLElement;
    const bars = [...row.querySelectorAll('.knowieWaveform-bar')] as HTMLElement[];

    // Rounded to the bar, not to the quarter: 0.3 x 24 is 7.2.
    await expect(row.querySelectorAll('[data-filled="true"]')).toHaveLength(7);

    // The fill runs left to right, with no gaps in it.
    await expect(bars.slice(0, 7).every((b) => b.dataset.filled === 'true')).toBe(true);
    await expect(bars.slice(7).every((b) => b.dataset.filled === undefined)).toBe(true);

    // A position wins over the quarter it was given, and the attribute reports
    // the quarter it is nearest so the element never contradicts the row.
    await expect(row).toHaveAttribute('data-progress', '25');

    // The flip carries the borrowed press pair — 140ms on the press curve.
    const flip = getComputedStyle(bars[0]);
    await expect(flip.transitionProperty).toBe('background-color');
    await expect(flip.transitionDuration).toBe('0.14s');
    await expect(flip.transitionTimingFunction).toBe('cubic-bezier(0.2, 0.9, 0.3, 1)');
  },
};
