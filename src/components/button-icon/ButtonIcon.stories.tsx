import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import {
  ButtonIcon,
  type ButtonIconSize,
  type ButtonIconState,
  type ButtonIconVariant,
} from './ButtonIcon';
import './buttonIcon.stories.css';

const VARIANTS: ButtonIconVariant[] = ['Primary', 'Secondary', 'Tertiary', 'Brand'];
const SIZES: ButtonIconSize[] = ['S', 'M', 'L'];

/** Every variant and size for one state, the way the Figma set is laid out. */
function Matrix({ state, onClick }: { state: ButtonIconState; onClick?: () => void }) {
  return (
    <div className="knowieButtonIconMatrix">
      {VARIANTS.map((variant) => (
        <div className="knowieButtonIconMatrix-group" key={variant}>
          <h3 className="knowieButtonIconMatrix-title">{variant}</h3>
          <div className="knowieButtonIconMatrix-row">
            {SIZES.map((size) => (
              <ButtonIcon
                key={size}
                variant={variant}
                size={size}
                state={state}
                label={size}
                icon="x-close"
                onClick={onClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The matrix repeats each size label across all four variants, so a role
    query alone is ambiguous. */
function pick(buttons: HTMLElement[], variant: ButtonIconVariant) {
  const found = buttons.find((element) => element.dataset.variant === variant);
  if (!found) throw new Error(`No ${variant} buttonIcon among the matches`);
  return found;
}

const DOCS = `
**The Figma component set carries no description.** \`buttonIcon\`
(node 9003:8235) has an empty description field and no documentation links, so
there is nothing to quote here. Only the eight sprint components carry
descriptions today; this is a gap in the base library, not an omission in these
docs.

What follows is the buttonIcon section of design-system.md, which is the nearest
thing the system has to a written rule for this component:

> **buttonIcon.** An action shown as an icon alone: close, back, menu. Same
> variants and states as button. An icon-only control needs an accessible label
> in code.

**That last sentence is why \`label\` is a required prop**, not an optional one.
There is no visible text to fall back on, so a buttonIcon without a name is a
button a screen reader announces as nothing.

### The set

48 variants — four \`variant\` values × three \`size\` values × four \`state\`
values. Each story below is one state showing the full variant × size matrix,
which is how the existing \`button\` stories are laid out and the only way 48
combinations stay readable.

| variant | pill | edge | icon |
| --- | --- | --- | --- |
| Primary | interactive.primary | border.default hairline | interactive.onPrimary |
| Secondary | background.surface | none | text.primary |
| Tertiary | none — hugs the icon | none | text.primary |
| Brand | accent.brand.bold | border.default hairline | accent.brand.onBold |

Sizes put Icon/200, Icon/250 and Icon/300 in the slot. The tap target is at
least 48 square at every size, so S and M sit in a box larger than their pill.

**Note design-system.md is out of date here:** it says buttonIcon has the "same
variants and states as button", but this set has a fourth variant, **Brand**,
which button does not, and its sizes run S–L where button's run XS–L.

### What not to do with it

- **Never ship one without a label.** The prop is required for that reason.
- **Primary is still primary.** design-system.md's "never more than one
  interactive.primary action on a screen" counts a Primary buttonIcon too.
- **Brand means brand**, not "a second primary". recordButton's description is
  explicit that brand violet means live audio in Explain out loud, so a Brand
  buttonIcon on a recording screen will read as part of that.

### Gaps

- **No description in Figma**, as above.
- **The L pill has no size token.** Figma pins it to 56×56 and binds nothing —
  the system has no 56 step in any family, which is the same gap that blocked
  stepperStep before it was redrawn at 48. Built here as Icon/300 plus Space/400
  either side, which lands on 56 without inventing a token, exactly as \`button\`
  already does for its own 56 pill. A real \`Space/1400\` would be better.
- **Disabled loses the variant.** All four collapse to background.surface with
  no edge, so a disabled Primary and a disabled Brand are identical. That is how
  the file has it, but it is worth confirming it is deliberate.
- **Tertiary's outer frame carries Radius/Full at M and L.** The outer frame is
  transparent and has no fill, so the radius does nothing. Not built.
- **Loading does not spin.** The Figma Loading variants are static, and there
  are still no duration or easing tokens in \`tokens/tokens.json\` — the same
  gap flagged on waveform. The icon swaps to loading-01 the way the file does,
  but it does not turn.
`;

const meta = {
  title: 'Components/buttonIcon',
  component: ButtonIcon,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    state: { control: 'inline-radio', options: ['Default', 'Pressed', 'Disabled', 'Loading'] },
  },
  args: { onClick: fn(), label: 'Close' },
} satisfies Meta<typeof ButtonIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Matrix state="Default" onClick={args.onClick} />,
  play: async ({ canvas, args }) => {
    const button = pick(canvas.getAllByRole('button', { name: 'M' }), 'Primary');
    await expect(button).toBeEnabled();
    // The icon-only control still has a name, which is the whole point of label.
    await expect(button).toHaveAccessibleName('M');
    // iconSlot owns the box: Icon/250 at size M, and carries the named icon.
    const slot = button.querySelector('.knowieIconSlot') as HTMLElement;
    await expect(slot).toHaveAttribute('data-size', '250');
    await expect(slot).toHaveAttribute('data-icon', 'x-close');
    // The tap target is at least 48 square even though the pill is 40.
    await expect(Math.round(button.getBoundingClientRect().width)).toBe(48);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Pressed: Story = {
  render: (args) => <Matrix state="Pressed" onClick={args.onClick} />,
  play: async ({ canvas }) => {
    for (const variant of VARIANTS) {
      for (const size of SIZES) {
        const button = pick(canvas.getAllByRole('button', { name: size }), variant);
        await expect(button).toHaveAttribute('data-state', 'Pressed');
      }
    }
    // The press is an overlay over the resting fill, not a replacement, so the
    // filled variants still differ from one another while pressed.
    const primary = pick(canvas.getAllByRole('button', { name: 'M' }), 'Primary');
    const brand = pick(canvas.getAllByRole('button', { name: 'M' }), 'Brand');
    const fill = (b: HTMLElement) =>
      getComputedStyle(b.querySelector('.knowieButtonIcon-pill') as HTMLElement).backgroundColor;
    await expect(fill(primary)).not.toBe(fill(brand));
  },
};

export const Disabled: Story = {
  render: (args) => <Matrix state="Disabled" onClick={args.onClick} />,
  play: async ({ canvas, args }) => {
    for (const variant of VARIANTS) {
      for (const size of SIZES) {
        await expect(pick(canvas.getAllByRole('button', { name: size }), variant)).toBeDisabled();
      }
    }
    await userEvent.click(pick(canvas.getAllByRole('button', { name: 'M' }), 'Primary'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  render: (args) => <Matrix state="Loading" onClick={args.onClick} />,
  play: async ({ canvas, args }) => {
    const button = pick(canvas.getAllByRole('button', { name: 'M' }), 'Primary');
    await expect(button).toHaveAttribute('aria-busy', 'true');
    // The icon is swapped for loading-01 rather than laid over.
    await expect(button.querySelector('.knowieButtonIcon-loading')).not.toBeNull();
    // The slot carries no icon while loading — it is swapped, not overlaid.
    await expect(button.querySelector('.knowieIconSlot')).not.toHaveAttribute('data-icon');
    // A request is already in flight, so the press must not start another.
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
