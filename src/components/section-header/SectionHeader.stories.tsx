import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { SectionHeader, type SectionHeaderState } from './SectionHeader';
import './sectionHeader.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> Invented. Plan section header. Carries the capstone result (option C):
> Mastered when all terms unaided, ToRevisit shows the unaided count.

**This closes a gap.** When mascotMessage was built, its description said its
states "pair with sectionHeader" — and sectionHeader did not exist anywhere in
the file. It does now.

### What the state drives

Three things at once — whether there is a status line at all, its colour, and
the icon:

| state | status | colour | icon |
| --- | --- | --- | --- |
| Default | **none** | — | graduation-hat-01 in text.secondary |
| Mastered | shown | feedback.success.onSubtle | check-circle |
| ToRevisit | shown | feedback.partial.bold | circle-half |

**Default has no status layer at all** in Figma, not a hidden one — so the
\`status\` prop is ignored there rather than drawn and hidden. That is also why
Default is 50 tall and the other two are 64.

The status and the icon always share a colour, so the count and the mark read as
one statement rather than two.

### It pairs with mascotMessage

The two colours match mascotMessage exactly — \`feedback.success.onSubtle\` for
Mastered and \`feedback.partial.bold\` for ToRevisit — so a section's header and
Knowie's read on it agree without either component knowing about the other.

### What not to do with it

- **The unaided count belongs here and nowhere else.** mascotMessage's
  description is explicit: "Never carry the unaided count here, that read
  belongs to sectionHeader."
- **Mastered means every term came back unaided.** ToRevisit is the state that
  shows a partial count.

### Built from

- **iconSlot** at Size 300, which is how Figma nests it and what
  design-system.md requires: every icon goes through iconSlot, never raw.

### Gaps

- **There is no Relearn.** mascotMessage gained a fourth state — Relearn, for
  when no term came back unaided — and its description says state "pairs with
  sectionHeader". This set has only three, so the pairing breaks on exactly the
  case a section header would most need to show. A section where nothing stuck
  currently has to render as ToRevisit with a count of zero.
- **The placeholder copy contradicts the description on Mastered.** The default
  \`status\` is "1 of 4 unaided" in both Mastered and ToRevisit, but the
  description says Mastered is "when all terms unaided" — so Mastered's
  placeholder should read "4 of 4 unaided". Cosmetic, but it is the one line
  that explains what the state means.
- **The heights are not token-bound**, and do not need to be: 50 and 64 both
  fall out of the content plus Space/300 above and below plus the hairline
  border. Worth knowing the outlined box is 2 taller than its content box.
- **\`titleAs\` has no Figma property.** Figma has no say in heading level, but
  the DOM does; it defaults to h3 since a section header usually sits under the
  screen's own heading.
`;

const meta = {
  title: 'Components/sectionHeader',
  component: SectionHeader,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    state: { control: 'inline-radio', options: ['Default', 'Mastered', 'ToRevisit'] },
    titleAs: { control: 'inline-radio', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
  },
  render: (args) => (
    <div className="knowieSectionHeaderDemo">
      <SectionHeader {...args} />
    </div>
  ),
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What each state draws: whether a status shows, and which icon. */
const SPEC: Record<SectionHeaderState, { status: boolean; icon: string; height: number }> = {
  Default: { status: false, icon: 'graduation-hat-01.svg', height: 50 },
  Mastered: { status: true, icon: 'check-circle.svg', height: 64 },
  ToRevisit: { status: true, icon: 'circle-half.svg', height: 64 },
};

/**
 * One story per Figma variant, named the way Figma names it.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function variantStory(
  state: SectionHeaderState,
  overrides: { title: string; status?: string },
): Story {
  return {
    args: { state, ...overrides },
    play: async ({ canvas, canvasElement }) => {
      const root = canvasElement.querySelector('.knowieSectionHeader') as HTMLElement;
      const statusEl = root.querySelector('.knowieSectionHeader-status') as HTMLElement | null;
      const icon = root.querySelector('.knowieSectionHeader-icon') as HTMLElement;
      const slot = root.querySelector('.knowieIconSlot') as HTMLElement;
      const spec = SPEC[state];

      await expect(root).toHaveAttribute('data-state', state);
      // The title is a real heading, whatever level the screen needs.
      await expect(canvas.getByRole('heading')).toHaveTextContent(overrides.title);

      // Space/300 by Space/600 padding, a hairline edge, and a full pill.
      const box = getComputedStyle(root);
      await expect(box.paddingTop).toBe('12px');
      await expect(box.paddingLeft).toBe('24px');
      await expect(box.borderTopWidth).toBe('1px');
      await expect(box.borderRadius).toBe('9999px');
      // The height falls out of the content plus padding plus the border.
      await expect(Math.round(root.getBoundingClientRect().height)).toBe(spec.height);

      // Default carries no status layer at all, so the prop is not drawn.
      await expect(statusEl !== null).toBe(spec.status);

      // iconSlot at Size 300, and the state picks the artwork.
      await expect(slot).toHaveAttribute('data-size', '300');
      await expect(Math.round(slot.getBoundingClientRect().width)).toBe(24);
      await expect(getComputedStyle(icon).maskImage).toContain(spec.icon);
      // The mark and the count are one statement, so they share a colour.
      if (statusEl) {
        await expect(getComputedStyle(icon).backgroundColor).toBe(
          getComputedStyle(statusEl).color,
        );
      }
    },
  };
}

/** No capstone result yet — just the section. */
export const Default: Story = {
  ...variantStory('Default', { title: 'The feudal system' }),
  name: 'state=Default',
};

/** Every term came back unaided. */
export const Mastered: Story = {
  ...variantStory('Mastered', { title: 'The feudal system', status: '4 of 4 unaided' }),
  name: 'state=Mastered',
};

/** Some did not, and the count says how many did. */
export const ToRevisit: Story = {
  ...variantStory('ToRevisit', { title: 'The feudal system', status: '1 of 4 unaided' }),
  name: 'state=ToRevisit',
};

/**
 * Not a Figma variant — the three stacked, which is the only place the height
 * difference between Default and the other two reads.
 */
export const AllThree: Story = {
  name: 'A plan of sections',
  args: { state: 'Default' },
  render: () => (
    <div className="knowieSectionHeaderDemo">
      <div className="knowieSectionHeaderDemo-stack">
        <SectionHeader state="Mastered" title="What a neuron is" status="4 of 4 unaided" />
        <SectionHeader state="ToRevisit" title="Neural circuits" status="1 of 4 unaided" />
        <SectionHeader state="Default" title="Synapses" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const headers = [...canvasElement.querySelectorAll('.knowieSectionHeader')] as HTMLElement[];
    await expect(headers).toHaveLength(3);
    // The two with a result are taller than the one without.
    const heights = headers.map((h) => Math.round(h.getBoundingClientRect().height));
    await expect(heights).toEqual([64, 64, 50]);
    // No two results read the same colour.
    const marks = headers
      .slice(0, 2)
      .map((h) => getComputedStyle(h.querySelector('.knowieSectionHeader-icon') as HTMLElement).backgroundColor);
    await expect(new Set(marks).size).toBe(2);
  },
};
