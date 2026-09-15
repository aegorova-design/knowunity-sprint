import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Chips, type ChipsActive, type ChipsColor, type ChipsSize } from './Chips';
import './chips.stories.css';

const SIZES: ChipsSize[] = ['XXS', 'XS', 'S', 'M'];
const COLORS: ChipsColor[] = ['Primary', 'pro'];

/** Stand-in artwork. Figma ships a `square` placeholder in both slots. */
function Glyph({ icon }: { icon?: 'check' }) {
  return <span className="knowieChipsGlyph" data-icon={icon} aria-hidden="true" />;
}

/** Every colour and size for one active value, the way the Figma set is laid out. */
function Matrix({ active, onClick }: { active: ChipsActive; onClick?: () => void }) {
  return (
    <div className="knowieChipsMatrix">
      {COLORS.map((color) => (
        <div className="knowieChipsMatrix-group" key={color}>
          <h3 className="knowieChipsMatrix-title">{color}</h3>
          <div className="knowieChipsMatrix-row">
            {SIZES.map((size) => (
              <Chips
                key={size}
                size={size}
                color={color}
                active={active}
                Text={size}
                leftIcon={<Glyph />}
                rightIcon={<Glyph icon="check" />}
                onClick={onClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The matrix repeats each size label across both colours, so a role query
    alone is ambiguous. */
function pick(chips: HTMLElement[], color: ChipsColor) {
  const found = chips.find((element) => element.dataset.color === color);
  if (!found) throw new Error(`No ${color} chip among the matches`);
  return found;
}

const DOCS = `
**The Figma component set carries no description.** \`chips\` (node 9003:8679)
has an empty description field, so there is nothing to quote. That is now five
base components without one — button, buttonIcon, textBlock, mascotSlot and
this.

What follows is the chips section of design-system.md, which is the nearest
thing the system has to a written rule for this component:

> **chips.** Selectable options: topics, filters, tool entry points. active=True
> marks the selected state. Use color=pro only for PRO content.

### The set

16 variants — four \`size\` values × two \`color\` values × two \`active\`
values. Each story below is one \`active\` value showing the full colour × size
matrix, which is how the existing \`button\` and \`buttonIcon\` stories are laid
out and the only way 16 combinations stay readable.

| size | height | padding | gap | text | icon |
| --- | --- | --- | --- | --- | --- |
| XXS | Icon/250 | Space/150 | Space/050 | Caption S Bold | Icon/150 |
| XS | Icon/300 | Space/200 | Space/100 | Caption S Bold | Icon/150 |
| S | Icon/400 | Space/300 | Space/100 | Caption M Bold | Icon/200 |
| M | Illustration/500 | Space/400 | Space/150 | Body S Bold | Icon/250 |

Vertical padding is Space/0 at every size — the height comes from the size token
alone, with the content centred in it.

**The colour axis does nothing until active is True.** Unselected chips are
background.surface with text.primary whichever colour they are. Selected,
Primary takes interactive.primary and pro takes pro.bold.

### What not to do with it

- **Use color=pro only for PRO content.** PRO is a proper noun and the gold fill
  means that and nothing else.
- **Keep labels to one or two words**, which is what the "1/2 words" placeholder
  is telling you.

### Built from

- **iconSlot**, at Icon/150, /200 or /250 depending on size. Both slots ship a
  \`square\` placeholder in Figma, so the artwork is the caller's to pass.

### Gaps

- **No description in Figma**, as above.
- **Primary selected uses two tokens for one role.** The label takes
  \`interactive.onPrimary\` and the icons take \`text.inverse\`. Both resolve to
  navy-950, so nothing looks wrong — but they are two names for "the thing that
  sits on this fill", and pro does the same job with \`pro.onBold\` for both.
  Both are kept as the file binds them rather than collapsed, since picking one
  is a decision about the token layer.
- **XXS and XS use Caption S**, which design-system.md already records as below
  the platform minimum for caption text. Two of the four sizes are affected.
- **Three naming problems, all already on design-system.md's list.** The set is
  plural where every other component is singular; the text property is \`Text\`
  with a capital T where others use CTA, title or caption; and \`color\` mixes
  \`Primary\` with lowercase \`pro\`. All three are carried here unchanged, since
  the brief is to match Figma's names.
- **\`active\` is a variant, not a boolean.** Its Figma values are the strings
  "False" and "True", so the prop is \`'False' | 'True'\` rather than a boolean —
  the same way progressIndicator carries its numeric steps as strings. It drives
  \`aria-pressed\` underneath.
- **No disabled state.** There is no way to show an option that cannot be
  picked, which filters usually need.
`;

const meta = {
  title: 'Components/chips',
  component: Chips,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    color: { control: 'inline-radio', options: COLORS },
    active: { control: 'inline-radio', options: ['False', 'True'] },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Chips>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What each size resolves to: height, then the icon step in its slots. */
const BOX: Record<ChipsSize, { height: number; icon: string }> = {
  XXS: { height: 20, icon: '150' },
  XS: { height: 24, icon: '150' },
  S: { height: 32, icon: '200' },
  M: { height: 40, icon: '250' },
};

export const Inactive: Story = {
  name: 'active=False',
  render: (args) => <Matrix active="False" onClick={args.onClick} />,
  play: async ({ canvas, args }) => {
    for (const size of SIZES) {
      for (const color of COLORS) {
        const chip = pick(canvas.getAllByRole('button', { name: size }), color);
        await expect(chip).toHaveAttribute('data-active', 'False');
        // active marks the selected state, which aria-pressed carries.
        await expect(chip).toHaveAttribute('aria-pressed', 'false');
        await expect(Math.round(chip.getBoundingClientRect().height)).toBe(BOX[size].height);
        const slot = chip.querySelector('.knowieIconSlot') as HTMLElement;
        await expect(slot).toHaveAttribute('data-size', BOX[size].icon);
      }
    }
    // Unselected is identical whichever colour it is — the colour axis only
    // does anything once active is True.
    const primary = pick(canvas.getAllByRole('button', { name: 'M' }), 'Primary');
    const pro = pick(canvas.getAllByRole('button', { name: 'M' }), 'pro');
    await expect(getComputedStyle(primary).backgroundColor).toBe(
      getComputedStyle(pro).backgroundColor,
    );

    await userEvent.click(primary);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Active: Story = {
  name: 'active=True',
  render: (args) => <Matrix active="True" onClick={args.onClick} />,
  play: async ({ canvas }) => {
    for (const size of SIZES) {
      for (const color of COLORS) {
        const chip = pick(canvas.getAllByRole('button', { name: size }), color);
        await expect(chip).toHaveAttribute('data-active', 'True');
        await expect(chip).toHaveAttribute('aria-pressed', 'true');
      }
    }
    // Selected is where the colour axis finally does something.
    const primary = pick(canvas.getAllByRole('button', { name: 'M' }), 'Primary');
    const pro = pick(canvas.getAllByRole('button', { name: 'M' }), 'pro');
    await expect(getComputedStyle(primary).backgroundColor).not.toBe(
      getComputedStyle(pro).backgroundColor,
    );
  },
};

/**
 * Not a Figma variant — `showLeftIcon` and `showRightIcon` are booleans, not
 * variant axes. Both default to true, so a label-only chip has to be asked for.
 */
export const LabelOnly: Story = {
  name: 'showLeftIcon=false, showRightIcon=false',
  args: {
    size: 'S',
    color: 'Primary',
    active: 'True',
    Text: 'History',
    showLeftIcon: false,
    showRightIcon: false,
  },
  render: (args) => (
    <div className="knowieChipsMatrix">
      <div className="knowieChipsMatrix-row">
        <Chips {...args} />
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const chip = canvas.getByRole('button', { name: 'History' });
    await expect(canvasElement.querySelectorAll('.knowieIconSlot')).toHaveLength(0);
    // The pill still holds its size-token height with nothing but a label in it.
    await expect(Math.round(chip.getBoundingClientRect().height)).toBe(32);
  },
};
