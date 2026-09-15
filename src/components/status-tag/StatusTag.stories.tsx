import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { StatusTag, type StatusTagVariant } from './StatusTag';
import './statusTag.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> One term's outcome as a label. Same four values and the same colours as
> termRow, so the two read as a set. The label is decided by the variant and is
> never edited on an instance: a fifth outcome is a new variant and a decision.
> Use it wherever the outcome needs naming beside a term, in the summary row
> and in the sheet header.

design-system.md adds that statusTag, termRow and mascotMessage all name the
same four end states for a term — Unaided, Hinted, Revealed, Skipped — and that
the label is "a fixed text layer, deliberately not a text property".

**So there is no label prop.** The variant decides the word, and an instance
cannot be made to say anything else. If you need a fifth outcome, that is a new
variant and a product decision, not a prop.

Unaided, Hinted and Revealed each take a bold accent with its matching onBold
text. Skipped is the odd one out: a neutral fill with reduced-emphasis text, so
the outcome that was never attempted recedes next to the three that were.

Nothing differs from the Figma file. The 24 height is not set directly — it
falls out of the label's line height plus its padding, so no height token is
needed.
`;

const meta = {
  title: 'Components/statusTag',
  component: StatusTag,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['Unaided', 'Hinted', 'Revealed', 'Skipped'],
    },
  },
} satisfies Meta<typeof StatusTag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One story per Figma variant, checking its fixed label and its 24 height. */
function variantStory(variant: StatusTagVariant): Story {
  return {
    name: variant,
    args: { variant },
    render: (args) => (
      <div className="knowieStatusTagDemo">
        <StatusTag {...args} />
      </div>
    ),
    play: async ({ canvas }) => {
      // The label is the variant's, and the variant's alone.
      const tag = canvas.getByText(variant);
      await expect(tag).toHaveAttribute('data-variant', variant);
      await expect(Math.round(tag.getBoundingClientRect().height)).toBe(24);
    },
  };
}

export const Unaided = variantStory('Unaided');
export const Hinted = variantStory('Hinted');
export const Revealed = variantStory('Revealed');
export const Skipped = variantStory('Skipped');
