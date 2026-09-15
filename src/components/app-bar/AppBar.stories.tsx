import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Button } from '../button/Button';
import { ButtonIcon } from '../button-icon/ButtonIcon';
import { ProgressIndicator } from '../progress-indicator/ProgressIndicator';
import { AppBar, type AppBarVariant } from './AppBar';
import './appBar.stories.css';

/**
 * The bar's icon actions. Figma uses a bespoke `App Bar Button Icon` set,
 * which is orphaned and not built; design-system.md says an appBar action is a
 * buttonIcon, so that is what these are. Tertiary because the Figma frame
 * carries no fill and no stroke, M because it is the only size whose box is 48
 * square — see the Gaps note below on its 20px icon.
 */
function Action({ icon, label }: { icon: 'arrow-left' | 'dots-vertical' | 'share-02'; label: string }) {
  return <ButtonIcon variant="Tertiary" size="M" icon={icon} label={label} />;
}

/** What each variant puts on the right, in the order Figma places them. */
function RightActions({ variant }: { variant: AppBarVariant }) {
  switch (variant) {
    case 'leftAndRightIconButton':
      return <Action icon="dots-vertical" label="More" />;
    case 'leftAndRightButton':
      return <Button variant="Tertiary" size="S" CTA="Skip" />;
    case 'leftAndTwoRightIconButtons':
      return (
        <>
          <Action icon="share-02" label="Share" />
          <Action icon="dots-vertical" label="More" />
        </>
      );
    case 'leftAnd2RightButtons':
      return (
        <>
          <Action icon="dots-vertical" label="More" />
          <Button variant="Tertiary" size="S" CTA="Skip" />
        </>
      );
    default:
      return null;
  }
}

function Bar({ variant }: { variant: AppBarVariant }) {
  return (
    <div className="knowieAppBarDemo">
      <AppBar
        variant={variant}
        aria-label="Flow navigation"
        left={<Action icon="arrow-left" label="Back" />}
        Slot={
          <ProgressIndicator
            thickness="16"
            progress="50"
            aria-label="Step 6 of 12"
          />
        }
        right={<RightActions variant={variant} />}
      />
    </div>
  );
}

const DOCS = `
**The Figma component set carries no description.** \`appBar\` (node 9003:8606)
has an empty description field and no documentation links, so there is nothing
to quote. Only the eight sprint components carry descriptions.

What follows is the appBar section of design-system.md:

> **appBar.** Top navigation inside the scaffold's topNavigation slot.
> - leftIconButtonOnly: a back or close action with nothing else.
> - leftAndRightIconButton, leftAndTwoRightIconButtons: back or close plus icon
>   actions such as a menu.
> - leftAndRightButton, leftAnd2RightButtons: when a right-hand action needs a
>   text label, like Skip.
> - The center Slot holds a progressIndicator on flow screens, matching the
>   app's quiz and setup flows.

**This is a layout shell.** In Figma the actions are baked into each variant as
instances of two component sets — \`App Bar Button Icon\` and \`App Bar
Button\` — and **both of those sets have been deleted from the canvas**. They
survive only as orphans with no parent page, resolvable by ID so the instances
still render, but not present in the file. Neither is built here. The variant
decides the padding and which action regions exist; the actions are passed in
through \`left\` and \`right\`.

Note that design-system.md names \`buttonIcon\` and \`button\` for those
actions, while Figma uses the two bespoke App Bar sets instead. The file and
the written rule disagree about what an appBar is made of.

Three more things differ from the file:

- **The width is fluid.** Figma pins the bar to 375 — neither the 390 canvas
  nor the 358 full-width figure design-system.md gives. It fills its container
  here.
- **One gradient, not two.** Figma stacks two identical linear gradients from
  \`background/page\` to the same colour at zero alpha. One is drawn; the
  duplicate only steepens the fade and reads as a copy-paste.
- **The icon actions are buttonIcons**, not the bespoke set. Figma's
  \`App Bar Button Icon\` is a 48 box around a 40 pill around a 24 icon, and
  no buttonIcon size reproduces it: **M** gives the right 48 box but a 20 icon,
  **L** gives the right 24 icon but a 56-tall box that would push the bar off
  its 56. These use Tertiary M, so the bar keeps its height and the icons sit
  4px under Figma. Closing that needs either a buttonIcon size whose box is 48
  around Icon/300, or a decision that 20 is right for an app bar.

The icons themselves are real — \`arrow-left\`, \`dots-vertical\` and
\`share-02\`, exported from the Figma set into \`public/icons\` and drawn
through iconSlot.
`;

const meta = {
  title: 'Components/appBar',
  component: AppBar,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * What Figma insets the right-hand action by, and where the inset lives in the
 * file: leftAndRightButton on the `App Bar Button` instance itself (42 around a
 * 30 button), leftAnd2RightButtons on the `Right buttons` group. Everything
 * else sits flush and is spaced by the bar's own 4 gap.
 */
const RIGHT_INSET: Partial<Record<AppBarVariant, { left?: string; right?: string }>> = {
  leftAndRightButton: { left: '12px' },
  leftAnd2RightButtons: { right: '4px' },
};

/** One story per Figma variant, checking it draws the regions that variant has. */
function variantStory(
  variant: AppBarVariant,
  expected: { left: boolean; right: boolean },
): Story {
  return {
    name: variant,
    args: { variant },
    render: (args) => <Bar variant={args.variant ?? variant} />,
    play: async ({ canvas }) => {
      const bar = canvas.getByRole('banner');
      await expect(bar).toHaveAttribute('data-variant', variant);
      await expect(!!bar.querySelector('.knowieAppBar-left')).toBe(expected.left);
      await expect(!!bar.querySelector('.knowieAppBar-right')).toBe(expected.right);
      // The leading action is a named button carrying the real back icon,
      // not a placeholder square.
      if (expected.left) {
        const back = canvas.getByRole('button', { name: 'Back' });
        await expect(back.querySelector('.knowieIconSlot')).toHaveAttribute(
          'data-icon',
          'arrow-left',
        );
      }
      if (expected.right) {
        // The right-hand inset is Figma's, carried on the region because the
        // caller passes a plain button.
        const region = bar.querySelector('.knowieAppBar-right') as HTMLElement;
        const inset = RIGHT_INSET[variant] ?? {};
        const style = getComputedStyle(region);
        await expect(style.paddingLeft).toBe(inset.left ?? '0px');
        await expect(style.paddingRight).toBe(inset.right ?? '0px');
      }
      // The centre slot is always present and always holds the progress bar.
      await expect(canvas.getByRole('progressbar')).toBeInTheDocument();
      // 56 tall in every variant, as Figma pins it — the slot's padding sits
      // inside the 48 row rather than adding to it.
      await expect(Math.round(bar.getBoundingClientRect().height)).toBe(56);
    },
  };
}

export const Default = variantStory('default', { left: false, right: false });
export const LeftIconButtonOnly = variantStory('leftIconButtonOnly', {
  left: true,
  right: false,
});
export const LeftAndRightIconButton = variantStory('leftAndRightIconButton', {
  left: true,
  right: true,
});
export const LeftAndRightButton = variantStory('leftAndRightButton', {
  left: true,
  right: true,
});
export const LeftAndTwoRightIconButtons = variantStory('leftAndTwoRightIconButtons', {
  left: true,
  right: true,
});
export const LeftAnd2RightButtons = variantStory('leftAnd2RightButtons', {
  left: true,
  right: true,
});
