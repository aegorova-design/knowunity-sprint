import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { TextField, type TextFieldState } from './TextField';
import './textField.stories.css';

const DOCS = `
The component's description in Figma, verbatim:

> Invented, fills the gap listed in design-system.md. Multiline answer input for
> the typed fallback. Focus state uses border/focus.

**This closes a gap.** design-system.md's "Gaps waiting for a decision" list
opens with:

> **textField.** A typed answer is the way out when a student can't speak.
> Nothing local covers it.

That entry can come off the list, the way the Recording-state entry already has.
It is also worth noting the file's "Not in this system" section still lists
**Text Field** among the external-library instances to "treat as missing" — that
line is now out of date too, since this is a local component set.

### The two states

358x160. Empty and Filled differ in exactly two things:

| | Empty | Filled |
| --- | --- | --- |
| border | border.default | **border.focus** |
| text | text.tertiary | text.primary |

Everything else is shared: background.input, Radius/400, Space/400 padding and
Body M Regular.

The text difference is the placeholder-versus-value distinction, which CSS
already draws, so \`state\` only has to carry the border. That means a real
field fills in naturally — type into the Empty story and the text turns
text.primary on its own.

### Why the field does not grow

Figma fixes the box at 160, so the field scrolls rather than growing. The
textarea's drag handle is off for the same reason: this is a 390 canvas and a
student could otherwise drag the field wider than the screen.

### Gaps

- **Filled and focused are the same picture.** The variant axis is
  Empty/Filled, but the thing that changes is \`border.focus\` — so a field with
  an answer already in it, sitting unfocused, draws a focus ring. The
  description says "Focus state uses border/focus", which suggests the token is
  doing focus duty and Filled is really depicting "focused and typed". Both are
  wired here, so the ring shows on \`state="Filled"\` and on real keyboard focus.
  If Filled is meant to be distinct from focused, it needs its own border token.
- **The focus ring is drawn at the wrong weight.** \`border.focus\`'s own token
  description says it is "drawn at Stroke.Heavy Border" — 2px. Figma draws it
  here at Stroke/Border, 1px. Built at 1px to match the file, but one of the two
  is wrong.
- **No error state.** The border family has \`border.error\` and
  \`border.success\`, and this set uses neither. Whether a typed answer can fail
  validation is a product question, not a variant.
- **\`label\` has no Figma property.** The field carries no visible label, so
  one is required in code — the same reasoning design-system.md gives for
  buttonIcon.
`;

const meta = {
  title: 'Components/textField',
  component: TextField,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    state: { control: 'inline-radio', options: ['Empty', 'Filled'] },
  },
  args: { onChange: fn(), label: 'Your explanation' },
  render: (args) => (
    <div className="knowieTextFieldDemo">
      <TextField {...args} />
    </div>
  ),
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * One story per Figma variant, named the way Figma names it.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function variantStory(state: TextFieldState, value: string | undefined): Story {
  return {
    args: { state, value },
    play: async ({ canvas }) => {
      const field = canvas.getByRole('textbox') as HTMLTextAreaElement;

      await expect(field).toHaveAttribute('data-state', state);
      // Icon-free and label-free on screen, so aria-label is the only name.
      await expect(field).toHaveAccessibleName('Your explanation');

      // Space/4000 tall, Space/400 padding, Radius/400, and fixed so a drag
      // handle cannot break the 390 canvas.
      const box = getComputedStyle(field);
      await expect(box.height).toBe('160px');
      await expect(box.padding).toBe('16px');
      await expect(box.borderRadius).toBe('16px');
      await expect(box.resize).toBe('none');
      await expect(box.borderTopWidth).toBe('1px');

      // Empty shows the prompt; Filled shows what was typed.
      if (state === 'Empty') {
        await expect(field.value).toBe('');
        await expect(field).toHaveAttribute('placeholder', 'Type your explanation');
      } else {
        await expect(field.value).toBe(value);
      }
    },
  };
}

/** Nothing typed yet — the prompt in text.tertiary, on a border.default edge. */
export const Empty: Story = {
  ...variantStory('Empty', undefined),
  name: 'state=Empty',
};

/** An answer in the field — text.primary, on a border.focus edge. */
export const Filled: Story = {
  ...variantStory(
    'Filled',
    'Feudalism was when lords gave land to knights, and the peasants worked it in return for protection.',
  ),
  name: 'state=Filled',
};

/**
 * Not a Figma variant — the field actually being typed into, which is the only
 * way to check that the two states are a real input rather than two pictures.
 */
export const Typing: Story = {
  name: 'Typing into it',
  args: { state: 'Empty' },
  play: async ({ canvas, args }) => {
    const field = canvas.getByRole('textbox');
    await userEvent.type(field, 'Land for service');
    await expect(args.onChange).toHaveBeenCalled();
    // Focus alone draws the same ring the Filled variant does, which is what
    // the component's description means by "Focus state uses border/focus".
    await expect(field).toHaveFocus();
  },
};

/**
 * Not a Figma variant — the two borders side by side, which is the only place
 * the difference between them reads.
 */
export const BothStates: Story = {
  name: 'Empty against Filled',
  args: { state: 'Empty' },
  render: (args) => (
    <div className="knowieTextFieldDemo">
      <TextField state="Empty" label="Empty field" onChange={args.onChange} />
      <TextField
        state="Filled"
        label="Filled field"
        value="Land for service, and service for protection."
        onChange={args.onChange}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const fields = [...canvasElement.querySelectorAll('.knowieTextField')] as HTMLElement[];
    await expect(fields).toHaveLength(2);
    // The whole difference between the two states is the edge.
    await expect(getComputedStyle(fields[0]).borderTopColor).not.toBe(
      getComputedStyle(fields[1]).borderTopColor,
    );
    // The fill is shared, so the states cannot be told apart by the box.
    await expect(getComputedStyle(fields[0]).backgroundColor).toBe(
      getComputedStyle(fields[1]).backgroundColor,
    );
  },
};
