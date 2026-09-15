import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { TermRow, type TermRowState, type TermRowVariant } from './TermRow';
import './termRow.stories.css';

const VARIANTS: TermRowVariant[] = ['Unaided', 'Hinted', 'Revealed', 'Skipped'];

/** The four outcomes as they appear in the summary list. */
const TERMS: Record<TermRowVariant, { term: string; xp: string }> = {
  Unaided: { term: 'Feudalism', xp: '+10 XP' },
  Hinted: { term: 'Serfdom', xp: '+6 XP' },
  Revealed: { term: 'Vassalage', xp: '+2 XP' },
  Skipped: { term: 'Manorialism', xp: '+0 XP' },
};

function List({ state, onClick }: { state: TermRowState; onClick?: () => void }) {
  return (
    <div className="knowieTermRowDemo">
      {VARIANTS.map((variant) => (
        <TermRow
          key={variant}
          variant={variant}
          state={state}
          term={TERMS[variant].term}
          xp={TERMS[variant].xp}
          onClick={onClick}
        />
      ))}
    </div>
  );
}

const DOCS = `
The component's description in Figma, verbatim:

> One term's outcome on the session summary. Four end states, each carrying its
> own icon and label as well as a colour, so they read apart in greyscale. The
> whole row is the tap target and it opens that term's sheet, so it needs a
> Pressed state and a 64 minimum height. Reach for it in the summary list and
> nowhere else; the sheet header shows the same trio but is not this component.
> Never change a tag's label on an instance to say something the variant does
> not: if you need a fifth outcome, that is a new variant and a decision.

design-system.md adds the rule that matters most for the build:

> The variant drives the badge icon and the nested statusTag together. Set the
> outcome once on the row, never on the tag inside it.

So the row takes one \`variant\` and passes it straight to the nested
statusTag. There is no way to set the tag separately, which is the point.

**Composed from statusTag and iconSlot** — the two components Figma composes it
from, used unmodified.

## Revealed disagrees with itself in Figma

Figma fills the Revealed badge with \`feedback/error/bold\` (red) while the
icon inside it stays \`accent/brand/onBold\` (violet-950). An \`onBold\` token
pairs with its own \`bold\`, so the icon is still pointing at the colour the
badge used to be. On top of that, the nested statusTag instance has its fill
**overridden** to \`feedback/error/bold\`, which contradicts both the statusTag
component — whose Revealed is \`accent/brand/bold\` — and design-system.md's
rule that statusTag and termRow carry "the same colours... so the two read as a
set". Instance recolouring is exactly what that rule forbids.

Two signals say violet (the icon's own token, and the statusTag component); one
says red, via an override the rules disallow. Built as \`accent/brand\`
throughout, so the badge, the icon and the tag agree and a standalone statusTag
matches a termRow. **This needs a decision** — if red is intended, the statusTag
component and its onBold pairing need changing too, not just this row.

## Other differences from the file

- **Every icon is real.** All five come from \`public/icons\` through
  iconSlot — \`check\`, \`circle-half\`, \`eye\`, \`skip-forward\` and
  \`chevron-right\` — and take their container's colour.
- **The chevron draws at about half the intended strength.** Alone in the set,
  \`chevron-right.svg\` bakes \`fill-opacity=".478431"\` into its path. A mask
  uses the source's alpha, so that 0.478 multiplies with \`text/tertiary\`'s
  own 0.478 and the chevron lands near 23% instead of 48%. Re-exporting it with
  \`fill="currentColor"\` and no \`fill-opacity\`, like the other twenty, fixes
  it with no code change. It is left faithful to the file rather than
  compensated for here, so the fix cannot double back.
- **The row is fluid.** Figma pins 358; a list row fills its container. The 64
  minimum height is real and is kept.
- **A focus ring was added.** Figma has no focus variant, but the row is a
  button, and \`border/focus\` names exactly this use in its own description.
`;

const meta = {
  title: 'Components/termRow',
  component: TermRow,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    state: { control: 'inline-radio', options: ['Default', 'Pressed'] },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof TermRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every outcome at rest. The whole row is the tap target. */
export const Default: Story = {
  render: (args) => <List state="Default" onClick={args.onClick} />,
  play: async ({ canvas, args }) => {
    const rows = canvas.getAllByRole('button');
    await expect(rows).toHaveLength(VARIANTS.length);

    for (const [i, variant] of VARIANTS.entries()) {
      const row = rows[i];
      await expect(row).toHaveAttribute('data-variant', variant);
      await expect(row).toHaveAttribute('data-state', 'Default');
      // 64 minimum height, because the whole row is the tap target.
      await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(64);
      // The outcome is set once: the nested tag follows the row's variant.
      const tag = row.querySelector('.knowieStatusTag') as HTMLElement;
      await expect(tag).toHaveAttribute('data-variant', variant);
      await expect(tag).toHaveTextContent(variant);
    }

    await userEvent.click(rows[0]);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

/** Every outcome mid-press, on the way to that term's sheet. */
export const Pressed: Story = {
  render: (args) => <List state="Pressed" onClick={args.onClick} />,
  play: async ({ canvas }) => {
    const rows = canvas.getAllByRole('button');
    for (const [i, variant] of VARIANTS.entries()) {
      await expect(rows[i]).toHaveAttribute('data-variant', variant);
      await expect(rows[i]).toHaveAttribute('data-state', 'Pressed');
    }
    // Pressed shares one fill across all four outcomes.
    const fills = rows.map((row) => getComputedStyle(row).backgroundColor);
    await expect(new Set(fills).size).toBe(1);
  },
};
