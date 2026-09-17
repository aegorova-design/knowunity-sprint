import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { TakePlayer, type TakePlayerState, type TakePlayerSurface } from './TakePlayer';
import './takePlayer.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> A recorded answer the student can listen back to before sending, and again
> from the summary sheet. Reach for it anywhere a take already exists. Use
> surface=Sheet when it sits inside bottomSheetOnly, so it stays distinct from
> the sheet behind it. It plays the take that was judged, never a re-record, so
> never reuse it as a generic audio player or put it on a screen where the
> student has not recorded anything yet.

### What each state drives

The state sets the control, the bars and the fill together, so the three can
never disagree — one place to set the meaning, the way termRow's variant drives
its badge and its nested statusTag at once.

| state | control | icon | waveform |
| --- | --- | --- | --- |
| Default | buttonIcon Primary/M | play | Idle, progress 0 |
| Playing | buttonIcon **Brand**/M | pause | Idle, progress 50 |
| Silent | buttonIcon Primary/M | play | **Silent**, progress 0 |

### The playback position

The table above is what a variant can draw. A take that is actually playing has
a position, and Figma's Playing is a fixed halfway fill — so a 0:30 take used to
show the same frozen picture for half a minute.

\`played\` (0 to 1) is that position. It comes from the screen's clock, and the
nested waveform rounds it to the nearest bar: 24 steps, not the four quarters
\`progress\` can name. Each bar lights over 140ms on the press curve; the detail
is in waveform's own docs.

- **Playing** is where a position comes from.
- **Default** honours one too, so a take **paused partway holds its place**
  instead of snapping back to the start. A paused take is still mid-playback,
  it has just stopped moving, and the control correctly offers play again.
- **Silent** ignores it. There is no audio, so there is nothing to be partway
  through.

Left off, every state fills exactly as its Figma variant does, which is what
every story above this one shows.

\`surface\` changes only the fill: background.surface on Page, the lighter
background.stacking on Sheet.

Note the waveform is never **Live** here. Live means audio is being captured,
which is recordButton's screen — this plays a take back, so it uses Idle with
the progress filling.

### What not to do with it

- **Never use it as a generic audio player.** It plays the take that was
  judged, never a re-record.
- **Never put it on a screen where the student has not recorded anything yet.**
  Reach for it only where a take already exists.
- **Use surface=Sheet inside bottomSheetOnly**, so it stays distinct from the
  sheet behind it.

### Built from

- **buttonIcon** at size M — Primary on Default and Silent, Brand on Playing.
- **waveform** — Idle at 0 and 50, Silent when nothing was captured.

Both are nested the way Figma nests them, rather than redrawn.

### Gaps

- **Silent still offers an enabled play button.** Figma has it as buttonIcon
  \`Primary/M/Default\`, the same as a take at rest, even though Silent means no
  audio was captured. Built as the file has it, but a take with nothing in it
  arguably wants the Disabled state — which buttonIcon already has. Worth a
  decision.
- **Silent is undocumented.** The description covers Default and Playing but
  never says what Silent is for. design-system.md reads it as "a take with no
  captured audio" from the waveform it uses, which is an inference, not a rule.
- **design-system.md is out of date on the radius.** It says "On the Review
  screen the radius is overridden to Radius/Full on the instance. That override
  is not in the component." All six variants now bind Radius/Full on the
  component itself, so the instance override is redundant and that note should
  go.
- **\`onPlayPause\` has no Figma property.** Figma cannot express a handler, but
  a player whose button does nothing is not a player, so the control's press is
  exposed.
- **\`played\` has no Figma property either.** A variant cannot carry a clock,
  and the set has no picture of a take paused partway — Default is drawn empty.
  Both are in code only; the component's Figma description is where they belong
  in the file.
`;

const meta = {
  title: 'Components/takePlayer',
  component: TakePlayer,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    state: { control: 'inline-radio', options: ['Default', 'Playing', 'Silent'] },
    surface: { control: 'inline-radio', options: ['Page', 'Sheet'] },
  },
  args: { onPlayPause: fn() },
  render: (args) => (
    <div className="knowieTakePlayerDemo" data-surface={args.surface}>
      <TakePlayer {...args} />
    </div>
  ),
} satisfies Meta<typeof TakePlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What each state drives in the two components takePlayer is built from. */
const SPEC: Record<
  TakePlayerState,
  { label: string; icon: string; variant: string; bars: string; filled: number }
> = {
  Default: { label: 'Play', icon: 'play.svg', variant: 'Primary', bars: 'Idle', filled: 0 },
  Playing: { label: 'Pause', icon: 'pause.svg', variant: 'Brand', bars: 'Idle', filled: 12 },
  Silent: { label: 'Play', icon: 'play.svg', variant: 'Primary', bars: 'Silent', filled: 0 },
};

/**
 * One story per Figma variant, named the way Figma names it.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function variantStory(state: TakePlayerState, surface: TakePlayerSurface): Story {
  return {
    args: { state, surface, duration: '0:14' },
    play: async ({ canvas, canvasElement, args }) => {
      const player = canvasElement.querySelector('.knowieTakePlayer') as HTMLElement;
      const control = canvas.getByRole('button');
      const glyph = player.querySelector('.knowieTakePlayer-glyph') as HTMLElement;
      const wave = player.querySelector('.knowieWaveform') as HTMLElement;
      const spec = SPEC[state];

      await expect(player).toHaveAttribute('data-state', state);
      await expect(player).toHaveAttribute('data-surface', surface);

      // Space/300 gap, Radius/Full, and the asymmetric Space/400 right padding.
      const box = getComputedStyle(player);
      await expect(box.columnGap).toBe('12px');
      await expect(box.paddingRight).toBe('16px');
      await expect(box.paddingLeft).toBe('12px');
      await expect(box.borderRadius).toBe('9999px');
      // 72 falls out of the 48 control plus Space/300 top and bottom.
      await expect(Math.round(player.getBoundingClientRect().height)).toBe(72);

      // The control is a real buttonIcon, and the state picks its variant.
      await expect(control).toHaveAttribute('data-variant', spec.variant);
      await expect(control).toHaveAttribute('data-size', 'M');
      await expect(control).toHaveAccessibleName(spec.label);
      await expect(getComputedStyle(glyph).maskImage).toContain(spec.icon);

      // The state drives the nested waveform too — never Live, since this is
      // playback rather than capture.
      await expect(wave).toHaveAttribute('data-state', spec.bars);
      await expect(wave.querySelectorAll('[data-filled="true"]')).toHaveLength(spec.filled);

      // The duration is real text, not decoration.
      await expect(canvas.getByText('0:14')).toBeVisible();

      await userEvent.click(control);
      await expect(args.onPlayPause).toHaveBeenCalledOnce();
    },
  };
}

export const DefaultPage: Story = {
  ...variantStory('Default', 'Page'),
  name: 'state=Default, surface=Page',
};

export const PlayingPage: Story = {
  ...variantStory('Playing', 'Page'),
  name: 'state=Playing, surface=Page',
};

export const SilentPage: Story = {
  ...variantStory('Silent', 'Page'),
  name: 'state=Silent, surface=Page',
};

export const DefaultSheet: Story = {
  ...variantStory('Default', 'Sheet'),
  name: 'state=Default, surface=Sheet',
};

export const PlayingSheet: Story = {
  ...variantStory('Playing', 'Sheet'),
  name: 'state=Playing, surface=Sheet',
};

export const SilentSheet: Story = {
  ...variantStory('Silent', 'Sheet'),
  name: 'state=Silent, surface=Sheet',
};

/**
 * Not a Figma variant — the two surfaces side by side, which is the only way
 * the reason for the split reads: on a sheet, the Page fill would disappear
 * into the sheet behind it.
 */
export const BothSurfaces: Story = {
  name: 'Page against Sheet',
  args: { state: 'Default' },
  render: (args) => (
    <div className="knowieTakePlayerDemo" data-surface="Sheet">
      <div className="knowieTakePlayerDemo-stack">
        <TakePlayer state="Default" surface="Page" onPlayPause={args.onPlayPause} />
        <TakePlayer state="Default" surface="Sheet" onPlayPause={args.onPlayPause} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const players = [...canvasElement.querySelectorAll('.knowieTakePlayer')] as HTMLElement[];
    await expect(players).toHaveLength(2);
    // The whole point of the surface axis: the two fills must differ.
    await expect(getComputedStyle(players[0]).backgroundColor).not.toBe(
      getComputedStyle(players[1]).backgroundColor,
    );
  },
};

/**
 * Not a Figma variant — the take's position, which no variant can carry.
 *
 * All three players are handed the same 0.75. Playing and Default draw it, so a
 * paused take holds its place rather than snapping back to the start; Silent
 * ignores it, because a take with no audio cannot be partway through.
 */
export const PlayedPosition: Story = {
  name: 'played, a real position',
  args: { state: 'Playing', played: 0.75 },
  render: (args) => (
    <div className="knowieTakePlayerDemo">
      <div className="knowieTakePlayerDemo-stack">
        <TakePlayer state="Playing" played={0.75} onPlayPause={args.onPlayPause} />
        <TakePlayer state="Default" played={0.75} onPlayPause={args.onPlayPause} />
        <TakePlayer state="Silent" played={0.75} onPlayPause={args.onPlayPause} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [playing, paused, silent] = [
      ...canvasElement.querySelectorAll('.knowieTakePlayer'),
    ] as HTMLElement[];

    const filled = (player: HTMLElement) =>
      player.querySelectorAll('[data-filled="true"]').length;

    // 0.75 of 24 bars, drawn by the state that is running and by the one that
    // is paused partway through.
    await expect(filled(playing)).toBe(18);
    await expect(filled(paused)).toBe(18);

    // The control still says what pressing it does: pause while running, play
    // while paused.
    await expect(playing.querySelector('button')).toHaveAccessibleName('Pause');
    await expect(paused.querySelector('button')).toHaveAccessibleName('Play');

    // Silent has no audio to be partway through.
    await expect(filled(silent)).toBe(0);
  },
};
