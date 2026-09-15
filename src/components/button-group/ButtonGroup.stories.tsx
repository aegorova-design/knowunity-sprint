import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Button } from '../button/Button';
import { ButtonIcon } from '../button-icon/ButtonIcon';
import { ButtonGroup } from './ButtonGroup';
import './buttonGroup.stories.css';

const DOCS = `
buttonGroup has no description in Figma. design-system.md is the only prose
about it, and it says:

> **buttonGroup.** A primary and a secondary action shown together, usually in
> bottomContent. Use Vertical when either label could wrap after translation.
> Use Horizontal only when both labels are short in every language.

### The two variants are not the same shape

| variant | first child | second child | gap |
| --- | --- | --- | --- |
| Vertical | Primary \`button\`, fills | Secondary \`button\`, fills | M: Space/0 · L: Space/200 |
| Horizontal | Secondary \`buttonIcon\`, hugs its square | Primary \`button\`, fills | M: Space/100 · L: Space/200 |

Vertical at M has a Space/0 gap on purpose: the M button carries a Space/100
inset inside its own box, so the seam is that inset. At L the face fills the
box, so the group supplies the gap itself.

### Built from

- **button** for the primary in both variants, and for Vertical's secondary.
- **buttonIcon** for Horizontal's secondary.
- **iconSlot**, through button's \`leftIcon\`, for the refresh glyph on Redo 3
  terms — sprint-context's "every button carries an icon" applied here.

The group itself is auto layout and nothing else — no fill, no border, no
radius. It is composed rather than redrawn, the way design-system.md asks.

Both actions come in as slots rather than as label props, so the emphasis of
either can change without an override. That follows the base system's own
pattern (iconSlot, mascotSlot) and mascotMessage's actionSlot.

### Where it is used

Screens 08 Summary and 09 Summary, term tapped, both \`variant=Vertical,
size=L\`, with Continue over Redo 3 terms.

### Gaps

- **The component set carries no description.** Every other set in this file
  has one, and design-system.md's own convention is that "a component without
  one is not finished". This is the one base component in the sprint's reach
  without it.
- **design-system.md describes a component that is not there.** It says
  Horizontal is for "when both labels are short in every language", which
  describes two text buttons side by side. The Horizontal variants draw an icon
  button plus one primary, so there is only ever one label. Either the rule is
  stale or the variant is. Not resolved here — the component is built as the
  file draws it.
- **The nested buttons ship in \`state=Pressed\`.** Vertical/L has both
  children Pressed, Vertical/M has its secondary Pressed. That is baked into the
  main component, not set on the instances, which is why the summary screens
  show a pressed primary at rest. It looks like a leftover rather than a
  decision. Nothing is baked in here: the stories pass their own buttons, at
  Default.
- **No Horizontal use anywhere.** Both mockups use Vertical, so Horizontal's
  pairing is unexercised by any screen.
`;

const meta = {
  title: 'Components/buttonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['Horizontal', 'Vertical'] },
    size: { control: 'inline-radio', options: ['M', 'L'] },
  },
  render: (args) => (
    <div className="knowieButtonGroupDemo">
      <ButtonGroup {...args} />
    </div>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The gap each variant and size draws, in px, off the Space scale. */
const GAP: Record<string, string> = {
  'Vertical-M': '0px',
  'Vertical-L': '8px',
  'Horizontal-M': '4px',
  'Horizontal-L': '8px',
};

/**
 * One story per Figma variant, named the way Figma names it, with the children
 * the component nests: a Primary button, and a Secondary button or buttonIcon.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function variantStory(variant: 'Horizontal' | 'Vertical', size: 'M' | 'L'): Story {
  return {
    args: {
      variant,
      size,
      primary: <Button variant="Primary" size={size} CTA="Continue" />,
      secondary:
        variant === 'Horizontal' ? (
          <ButtonIcon variant="Secondary" size={size} icon="refresh-ccw-01" label="Redo 3 terms" />
        ) : (
          <Button variant="Secondary" size={size} showLeftIcon leftIcon="refresh-ccw-01" CTA="Redo 3 terms" />
        ),
    },
    play: async ({ canvas, canvasElement }) => {
      const root = canvasElement.querySelector('.knowieButtonGroup') as HTMLElement;

      await expect(root).toHaveAttribute('data-variant', variant);
      await expect(root).toHaveAttribute('data-size', size);

      // Direction and gap, both off the file.
      const style = getComputedStyle(root);
      await expect(style.flexDirection).toBe(variant === 'Vertical' ? 'column' : 'row');
      await expect(style.gap).toBe(GAP[`${variant}-${size}`]);

      // The primary fills in both variants. Horizontal's icon button hugs, and
      // leads the row; Vertical's secondary fills and follows the primary.
      const buttons = Array.from(canvasElement.querySelectorAll('button'));
      await expect(buttons).toHaveLength(2);
      const [first, second] = buttons;

      if (variant === 'Horizontal') {
        await expect(first).toHaveClass('knowieButtonIcon');
        await expect(second).toHaveClass('knowieButton');
        // The square hugs; the primary takes everything left over.
        await expect(first.getBoundingClientRect().width).toBeLessThan(
          second.getBoundingClientRect().width,
        );
      } else {
        await expect(first).toHaveClass('knowieButton');
        await expect(second).toHaveClass('knowieButton');
        // Both fill, so they are the same width as each other and as the group.
        await expect(Math.round(first.getBoundingClientRect().width)).toBe(
          Math.round(second.getBoundingClientRect().width),
        );
        await expect(Math.round(first.getBoundingClientRect().width)).toBe(
          Math.round(root.getBoundingClientRect().width),
        );
      }

      // The primary is the one labelled action in both variants.
      await expect(canvas.getByRole('button', { name: 'Continue' })).toBeVisible();
    },
  };
}

export const VerticalM: Story = {
  ...variantStory('Vertical', 'M'),
  name: 'variant=Vertical, size=M',
};

export const VerticalL: Story = {
  ...variantStory('Vertical', 'L'),
  name: 'variant=Vertical, size=L',
};

export const HorizontalM: Story = {
  ...variantStory('Horizontal', 'M'),
  name: 'variant=Horizontal, size=M',
};

export const HorizontalL: Story = {
  ...variantStory('Horizontal', 'L'),
  name: 'variant=Horizontal, size=L',
};

/**
 * Not a Figma variant — the group as the summary screen places it: Vertical at
 * L, Continue over Redo 3 terms, at the full 358 of bottomContent.
 */
const onContinue = fn();
const onRedo = fn();

export const OnTheSummary: Story = {
  name: 'On the summary screen',
  args: {
    variant: 'Vertical',
    size: 'L',
    primary: <Button variant="Primary" size="L" CTA="Continue" onClick={onContinue} />,
    secondary: (
      <Button
        variant="Secondary"
        size="L"
        showLeftIcon
        leftIcon="refresh-ccw-01"
        CTA="Redo 3 terms"
        onClick={onRedo}
      />
    ),
  },
  beforeEach: () => {
    onContinue.mockClear();
    onRedo.mockClear();
  },
  play: async ({ canvas }) => {
    const primary = canvas.getByRole('button', { name: 'Continue' });
    const secondary = canvas.getByRole('button', { name: 'Redo 3 terms' });

    // Each action fires its own handler, and only its own — the group passes
    // presses straight through and holds no behaviour of its own.
    await userEvent.click(primary);
    await expect(onContinue).toHaveBeenCalledTimes(1);
    await expect(onRedo).not.toHaveBeenCalled();

    await userEvent.click(secondary);
    await expect(onRedo).toHaveBeenCalledTimes(1);
    await expect(onContinue).toHaveBeenCalledTimes(1);

    // The primary reads first, so it is first in the DOM as well as on screen.
    await expect(primary.compareDocumentPosition(secondary)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  },
};

/**
 * Not a Figma variant — the two variants side by side, which is the only way
 * the shape difference reads: Vertical pairs two labels, Horizontal pairs an
 * icon with one.
 */
export const BothVariants: Story = {
  name: 'Vertical against Horizontal',
  args: { variant: 'Vertical', size: 'L' },
  render: () => (
    <div className="knowieButtonGroupDemo">
      <div className="knowieButtonGroupDemo-stack">
        <ButtonGroup
          variant="Vertical"
          size="L"
          primary={<Button variant="Primary" size="L" CTA="Continue" />}
          secondary={<Button
            variant="Secondary"
            size="L"
            showLeftIcon
            leftIcon="refresh-ccw-01"
            CTA="Redo 3 terms"
          />}
        />
        <ButtonGroup
          variant="Horizontal"
          size="L"
          primary={<Button variant="Primary" size="L" CTA="Continue" />}
          secondary={
            <ButtonIcon variant="Secondary" size="L" icon="refresh-ccw-01" label="Redo 3 terms" />
          }
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const groups = canvasElement.querySelectorAll('.knowieButtonGroup');
    await expect(groups).toHaveLength(2);
    // Vertical is two rows tall, Horizontal one.
    await expect(groups[0].getBoundingClientRect().height).toBeGreaterThan(
      groups[1].getBoundingClientRect().height,
    );
  },
};
