import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { BottomNav, type BottomNavActive } from './BottomNav';
import './bottomNav.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> Sprint bottom nav. Prototype uses two tabs: home-chat and study-plan. search,
> trophy and avatar are present for app fidelity and are not interactive.

**So three of the five shapes do nothing.** search, trophy and the avatar are
rendered inert — a \`span\` rather than a control, \`aria-hidden\`, and with no
pointer events — so the bar cannot be tabbed into a tab that goes nowhere. Do
not wire them up: making one live is a product decision, not a prop.

**The two live tabs are icon-only.** Figma switches the Navigation Button's
label off, so each one carries its accessible name in code instead —
\`Home chat\` and \`Study plan\`, taken from the tab's own name in Figma. The
current tab is marked \`aria-current="page"\`.

**Built from iconSlot, because that is the only part of it the system has.**
Figma composes the bar from Navigation Button and Avatar instances, both from
the library design-system.md lists as unreachable, and \`navBar\` is still on
its gaps list. Nothing local draws a tab, so the tab is drawn here out of the
one component that does exist. The four icons — myai-chat, search-md,
target-04 and trophy-02 — were exported from this component in Figma and added
to \`public/icons\`, so iconSlot names them the same way it names the rest.

### The home indicator

It is part of this component, because that is where Figma puts it: every
mockup draws it at \`bottomContent / Navbar / Home Indicator\`, and the
\`scaffold\` component set draws none — it holds a Panel Header with the status
bar in it, then the four slots, and nothing else. design-system.md says
scaffold "handles the status bar, the home indicator and the page background";
the first and the third are true and the second is not.

Only the pill's fill is variable-bound, to background/inverse. Its **34 of
height and 131 of width are hand-set in Figma and are not in
\`tokens/tokens.json\`** — they stay hand-set here, on the grounds scaffold.css
already gives for the 390x844 canvas: iPhone geometry is not a design value and
the system has no step for it. The 5 height, the full radius, the fill and the
8 it sits off the bottom all come from tokens.

**The file disagrees with itself about the width.** 131 here and on the four
plan mockups; 119 on both home mockups and on the \`Navbar\` this component was
cut from. 131 is what the component says, so 131 is what this draws.

### What is not here

**A press state.** Figma has none on this component. A tap with no
acknowledgement reads as a dropped tap, so the live tabs take the
interactive.pressed overlay and the press timing the rest of the system uses.
That is an addition to the file, not a reading of it.

### Worth knowing

The active tab is told apart by **colour alone** — accent.brand.bold against
text.secondary — which is the one thing design-system.md says never to do. The
row has no space for a label or a shape as well, and Figma draws it this way.
\`aria-current\` carries it for a screen reader; nothing carries it in
greyscale. That is a gap on the Figma component, not a licence to recolour an
instance.

A tab's box is **40x40**, under the 64 working floor design-system.md sets for
a tap target. That number comes from the missing 04-platform-constraints.md and
cannot be checked, but 40 is what Figma draws and it is flagged rather than
quietly widened.
`;

const meta = {
  title: 'Components/bottomNav',
  component: BottomNav,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    Active: {
      control: 'inline-radio',
      options: ['home-chat', 'study-plan'],
    },
  },
  args: {
    onNavigate: fn(),
  },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One story per Figma variant, named the way the variant is named. */
function variantStory(Active: BottomNavActive): Story {
  const other: BottomNavActive = Active === 'home-chat' ? 'study-plan' : 'home-chat';
  const label = { 'home-chat': 'Home chat', 'study-plan': 'Study plan' } as const;

  return {
    name: `Active=${Active}`,
    args: { Active },
    render: (args) => (
      <div className="knowieBottomNavDemo">
        <BottomNav {...args} />
      </div>
    ),
    play: async ({ canvas, canvasElement, args }) => {
      // The bar offers exactly the two tabs the description says it offers.
      // search, trophy and the avatar are hidden, so they are not in here.
      const tabs = canvas.getAllByRole('button');
      await expect(tabs).toHaveLength(2);

      const current = canvas.getByRole('button', { name: label[Active] });
      await expect(current).toHaveAttribute('aria-current', 'page');
      await expect(canvas.getByRole('button', { name: label[other] })).not.toHaveAttribute(
        'aria-current',
      );

      // The home indicator is drawn and is not announced.
      const indicator = canvasElement.querySelector('.knowieBottomNav-homeIndicator');
      await expect(indicator).toHaveAttribute('aria-hidden', 'true');
      await expect(Math.round(indicator!.getBoundingClientRect().height)).toBe(34);

      // Pressing the other tab reports which one it was.
      await userEvent.click(canvas.getByRole('button', { name: label[other] }));
      await expect(args.onNavigate).toHaveBeenCalledWith(other);
    },
  };
}

export const ActiveHomeChat = variantStory('home-chat');
export const ActiveStudyPlan = variantStory('study-plan');

/**
 * Not a Figma variant. With an href each live tab is a Next `Link`, so the
 * page around the bar can stay a Server Component instead of taking
 * 'use client' just to push a route. Figma cannot express a destination.
 */
export const WithHrefs: Story = {
  name: 'With hrefs',
  args: {
    Active: 'study-plan',
    homeChatHref: '/',
    studyPlanHref: '/plan',
  },
  render: (args) => (
    <div className="knowieBottomNavDemo">
      <BottomNav {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(2);
    await expect(canvas.getByRole('link', { name: 'Home chat' })).toHaveAttribute('href', '/');
    await expect(canvas.getByRole('link', { name: 'Study plan' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
