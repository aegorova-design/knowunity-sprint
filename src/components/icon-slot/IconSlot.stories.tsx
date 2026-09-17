import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { IconSlot, type IconName, type IconSlotSize } from './IconSlot';
import './iconSlot.stories.css';

/**
 * A stand-in for the real icon. Figma's own instance-swap default is a local
 * placeholder called `square`, so these stories show the same thing: the slot
 * is what is being demonstrated, not the artwork.
 */
function SquarePlaceholder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** Every file in public/icons. */
const ICON_NAMES: IconName[] = [
  'ai-quiz', 'arrow-left', 'arrow-right', 'arrow-right-alt', 'check',
  'check-circle', 'chevron-right', 'circle-half', 'corner-up-right',
  'dots-vertical', 'eye', 'graduation-hat-01', 'help-circle', 'keyboard-01',
  'lightbulb-02', 'loading-01', 'microphone-01', 'myai-chat', 'pause', 'play',
  'refresh-ccw-01', 'search-md', 'share-02', 'skip-forward', 'stop',
  'target-04', 'trophy-02', 'x-close', 'zap',
];

/** The px each Figma variant resolves to through the Icon token scale. */
const EXPECTED_PX: Record<IconSlotSize, number> = {
  '100': 8,
  '150': 12,
  '200': 16,
  '250': 20,
  '300': 24,
  '400': 32,
};

const DOCS = `
**The Figma component set carries no description.** \`iconSlot\` (node
9003:8809) has an empty description field and no documentation links, so there
is nothing to quote. Only the eight sprint components carry descriptions today.

What follows is the iconSlot rule from design-system.md:

> **iconSlot.** Every icon goes through iconSlot. Swap the icon with the
> Instance property. Never place a raw icon.

**The artwork comes from the repo, not from Figma.** Figma's instance swap
lists 2392 icon components by key and none of them resolve from this file —
the icon library is not connected, which design-system.md already notes for the
other external instances. The repo carries its own set in \`public/icons\`
instead, and \`icon\` names one of those, the same way mascotFigure's \`pose\`
names a file in \`public/images\`.

The icons are drawn as a **CSS mask** rather than an \`<img>\`, so they take
the slot's colour. An \`<img>\` cannot do that, and these SVGs paint with
\`currentColor\`. The file stays the only source of truth — nothing here
redraws the artwork.

Anything the set does not carry still goes in as \`children\`.

**One caveat on authoring.** A mask uses the source's alpha, so an icon that
bakes \`fill-opacity\` into its own paths draws at that fraction of the slot's
colour — dimmer than the token asks for, and dimmer again if the token is
itself translucent. Twenty-three of the twenty-five icons paint with
\`currentColor\` at full opacity on a 24 viewBox. Two do not:

- \`chevron-right\` carries \`fill-opacity=".478431"\` and a hard-coded
  fill, so it renders at roughly half strength, and it is drawn on a 20 viewBox
  rather than 24, so its artwork sits larger in the square than its neighbours.
- \`stop\` carries a hard-coded \`#090C18\` fill. The mask discards it, so
  the slot renders correctly, but the file is wrong anywhere the artwork is
  used directly.

New icons should be exported with \`fill="currentColor"\`, no opacity, on a
24 viewBox.

Two notes on the mapping from Figma:

- The variant axis is named **\`Size (IGNORE)\`** in Figma. The axis is real and
  its values are bound to Icon/100 … Icon/400, so it is carried here as
  \`size\` with the same options. The Figma axis wants renaming to match.
- Figma's instance-swap property \`Instance\` is \`icon\` here.

The slot sets \`color: var(--color-text-primary)\`, matching the fill Figma
puts on the icon vector. Pass an icon that paints with \`currentColor\`, and
recolour by setting \`color\` on the slot — an icon sitting on
\`interactive.primary\` needs \`interactive.onPrimary\`, not the default.
`;

const meta = {
  title: 'Components/iconSlot',
  component: IconSlot,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    size: { control: 'inline-radio', options: Object.keys(EXPECTED_PX) },
  },
} satisfies Meta<typeof IconSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One story per Figma variant, each checking the box is exactly its Icon token. */
function sizeStory(size: IconSlotSize): Story {
  return {
    name: size,
    args: { size },
    render: (args) => (
      <div className="knowieIconSlotDemo">
        <IconSlot {...args} data-testid="slot">
          <SquarePlaceholder />
        </IconSlot>
        <p className="knowieIconSlotDemo-caption">
          {`Icon/${size} — ${EXPECTED_PX[size]}px`}
        </p>
      </div>
    ),
    play: async ({ canvas }) => {
      const slot = canvas.getByTestId('slot');
      const box = slot.getBoundingClientRect();
      await expect(Math.round(box.width)).toBe(EXPECTED_PX[size]);
      await expect(Math.round(box.height)).toBe(EXPECTED_PX[size]);
    },
  };
}

/** Not a Figma variant — every icon in `public/icons` at one size. Figma
    cannot show this: its own icon library is unreachable. */
export const AllIcons: Story = {
  name: 'All icons',
  render: () => (
    <div className="knowieIconSlotDemo knowieIconSlotDemo--wrap">
      {ICON_NAMES.map((name) => (
        <span className="knowieIconSlotDemo-item" key={name}>
          <IconSlot size="300" icon={name} data-testid="icon" />
          <span className="knowieIconSlotDemo-caption">{name}</span>
        </span>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const slots = canvas.getAllByTestId('icon');
    await expect(slots).toHaveLength(ICON_NAMES.length);
    // Every icon resolves to a mask; none falls back to nothing.
    for (const slot of slots) {
      const mask = getComputedStyle(slot).maskImage || getComputedStyle(slot).webkitMaskImage;
      await expect(mask).toContain('/icons/');
    }
  },
};

export const Size100 = sizeStory('100');
export const Size150 = sizeStory('150');
export const Size200 = sizeStory('200');
export const Size250 = sizeStory('250');
export const Size300 = sizeStory('300');
export const Size400 = sizeStory('400');
