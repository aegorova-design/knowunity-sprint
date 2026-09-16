import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { AppBar } from '../app-bar/AppBar';
import { Button } from '../button/Button';
import { ButtonIcon } from '../button-icon/ButtonIcon';
import { MascotFigure } from '../mascot-figure/MascotFigure';
import { ProgressIndicator } from '../progress-indicator/ProgressIndicator';
import { TextBlock } from '../text-block/TextBlock';
import { Scaffold, type ScaffoldProps } from './Scaffold';
import './scaffold.stories.css';

/** A screen assembled the way design-system.md says a screen is assembled. */
const SCREEN: ScaffoldProps = {
  topNavigation: (
    <AppBar
      variant="leftAndRightButton"
      aria-label="Flow navigation"
      // leftAndRightButton means an icon button left, a text button right —
      // which is also what appBar's own padding for this variant assumes.
      left={<ButtonIcon variant="Tertiary" size="M" icon="arrow-left" label="Back" />}
      Slot={<ProgressIndicator thickness="16" progress="50" aria-label="Step 6 of 12" />}
      right={<Button variant="Tertiary" size="S" CTA="Skip" />}
    />
  ),
  middleContent: (
    <>
      <TextBlock variant="L" title="Say it out loud" caption="Explain feudalism in your own words." titleAs="h1" />
      <MascotFigure size="L" />
    </>
  ),
  bottomContent: <Button variant="Primary" size="L" CTA="Start" />,
};

const DOCS = `
The component's description in Figma, verbatim:

> Used to quickly create screens using our components, making use of Figma
> Slots. Allows for quickly testing how designs look on different device types.

design-system.md is more specific about how to use it:

> **scaffold.** Every screen starts here. It handles the status bar, the home
> indicator and the page background. Build inside it, never around it.
>
> The scaffold stacks top to bottom: the status bar header, then
> topNavigation, then middleContent, then bottomContent. bottomSheetOnly
> overlays them.
>
> **Status bar header.** Fixed. Put nothing here.
> **topNavigation.** One appBar, nothing else. It hugs its content.
> **middleContent.** Everything the student reads. It fills the remaining
> height and scrolls. Its padding and gap are already bound to Space tokens,
> so don't add outer margins inside it.
> **bottomContent.** Actions and input. It hugs its content. This is the thumb
> zone. Its padding is bound to Space tokens the same way, so don't add outer
> padding inside it to reach for more.
> **bottomSheetOnly.** Sheet content. Turn on showBottomSheetBackground with it
> so the sheet gets its backing surface. Only one sheet at a time.

## Half of Figma's property list is dead

The set defines **16 properties; only 8 are wired to a layer.** Two
generations coexist. The live one is \`topNavigation#3085:1\`,
\`middleContent#3085:2\`, \`bottomContent#3085:7\`,
\`bottomSheetOnly#3675:101\`, \`showTopNavSlot#3087:9\`,
\`showBottomNavSlot#3087:0\` and \`showBottomSheetBackground#3675:20\` — the
names design-system.md documents, and the ones carried here.

The other eight are defined, appear in Figma's instance panel, and do nothing:
\`Slot - Top navigation\`, \`Slot - Content\`, \`Slot - Bottom nav\`,
\`Slot - Bottom-sheet\`, \`Show Top Nav Slot\`, \`Show Bottom nav slot?\`,
\`Show bottom-sheet background\` and \`Show nav scrim\` (all \`#13624:*\`).

## Other differences from the file

- **bottomSheetOnly is mis-wired.** Figma ties its visibility to
  \`showBottomNavSlot\` — the same boolean that controls bottomContent — so a
  sheet cannot be opened without the bottom bar, and hiding the bar kills the
  sheet. Here the sheet appears when it has content, which is what Figma's own
  "hide empty slots" rule does anyway.
- **The size axis has one option.** design-system.md says to "check the XS -
  iPhone SE variant"; that variant no longer exists in the file.
- **The status bar is reserved, not drawn.** Figma fills it with a Status Bar
  instance from a library this file cannot reach. Its 48 height is held and
  left empty, which is also correct on a real device, where the OS draws it.
- **The frame is fluid.** Figma pins 390x844; a screen container fills the
  viewport instead.
- **Three dead layers are not built:** a \`Scrim\` gradient inside
  middleContent (hidden, unbound fill, and its only control is one of the
  orphaned properties), and a \`Panel Header\` fill bound to
  \`Core/BG/Secondary Transparent\` — a variable from a collection this token
  set does not contain — which is also hidden.
- **No home indicator.** design-system.md says the scaffold handles one; there
  is no such layer in the file.
`;

const meta = {
  title: 'Components/scaffold',
  component: Scaffold,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
} satisfies Meta<typeof Scaffold>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The one Figma variant, with every slot filled. */
export const IPhone13: Story = {
  name: 'iPhone 13',
  args: SCREEN,
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('.knowieScaffold') as HTMLElement;
    await expect(root).toHaveAttribute('data-size', 'iPhone 13');
    // All four regions present, stacked in order.
    await expect(canvas.getByRole('banner')).toBeInTheDocument();
    // topNavigation carries a real appBar, back icon and all.
    const back = canvas.getByRole('button', { name: 'Back' });
    await expect(back.querySelector('.knowieIconSlot')).toHaveAttribute(
      'data-icon',
      'arrow-left',
    );
    await expect(canvas.getByRole('heading', { name: 'Say it out loud' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    // middleContent is the only region that grows and scrolls.
    const middle = root.querySelector('.knowieScaffold-middleContent') as HTMLElement;
    await expect(getComputedStyle(middle).overflowY).toBe('auto');
  },
};

/** showTopNavSlot=false — a screen with no navigation at all. */
export const ShowTopNavSlotFalse: Story = {
  name: 'showTopNavSlot=false',
  args: { ...SCREEN, showTopNavSlot: false },
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('.knowieScaffold') as HTMLElement;
    await expect(root.querySelector('.knowieScaffold-topNavigation')).toBeNull();
    await expect(canvas.queryByRole('banner')).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  },
};

/** showBottomNavSlot=false — nothing in the thumb zone. */
export const ShowBottomNavSlotFalse: Story = {
  name: 'showBottomNavSlot=false',
  args: { ...SCREEN, showBottomNavSlot: false },
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('.knowieScaffold') as HTMLElement;
    await expect(root.querySelector('.knowieScaffold-bottomContent')).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Start' })).toBeNull();
    await expect(canvas.getByRole('banner')).toBeInTheDocument();
  },
};

/** showBottomSheetBackground=true, with a sheet over the screen. */
export const ShowBottomSheetBackgroundTrue: Story = {
  name: 'showBottomSheetBackground=true',
  args: {
    ...SCREEN,
    showBottomSheetBackground: true,
    bottomSheetOnly: (
      <div className="knowieScaffoldDemo-sheet">
        <h2 className="knowieScaffoldDemo-sheetTitle">Feudalism</h2>
        <Button variant="Primary" size="M" CTA="Got it" />
      </div>
    ),
  },
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('.knowieScaffold') as HTMLElement;
    await expect(root.querySelector('.knowieScaffold-sheetBackground')).not.toBeNull();
    await expect(root.querySelector('.knowieScaffold-bottomSheetOnly')).not.toBeNull();
    await expect(canvas.getByRole('heading', { name: 'Feudalism' })).toBeInTheDocument();
    // The sheet still shows with the bottom bar hidden — the mis-wire Figma has.
    await expect(canvas.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
  },
};
