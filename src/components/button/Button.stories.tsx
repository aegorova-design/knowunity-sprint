import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Button, type ButtonSize, type ButtonState, type ButtonVariant } from './Button';
import './button.stories.css';

const VARIANTS: ButtonVariant[] = ['Primary', 'Secondary', 'Tertiary'];
const SIZES: ButtonSize[] = ['XS', 'S', 'M', 'L'];

/** Every variant and size for one state, the way the Figma set is laid out. */
function Matrix({ state, onClick }: { state: ButtonState; onClick?: () => void }) {
  return (
    <div className="knowieButtonMatrix">
      {VARIANTS.map((variant) => (
        <div className="knowieButtonMatrix-group" key={variant}>
          <h3 className="knowieButtonMatrix-title">{variant}</h3>
          <div className="knowieButtonMatrix-row">
            {SIZES.map((size) => (
              <Button
                key={size}
                variant={variant}
                size={size}
                state={state}
                CTA={size}
                onClick={onClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The matrix repeats each size label across all three variants, so a role
    query alone is ambiguous. */
function pick(buttons: HTMLElement[], variant: ButtonVariant) {
  const found = buttons.find((element) => element.dataset.variant === variant);
  if (!found) throw new Error(`No ${variant} button among the matches`);
  return found;
}

const DOCS = `
The component's description in Figma, verbatim:

> Primary carries the one action a screen is asking for, Secondary the
> alternative, Tertiary the quiet way out.
>
> Primary and Secondary sit on a lip: a solid edge under the face, 2px at XS, S
> and M and 4px at L, read from Component/button/lip. Pressed collapses that lip
> and drops the face by the same amount inside an outer box that never changes
> height, so the button sinks flush and nothing around it reflows. Face heights
> while pressed come from Component/button/facePressed; at S and M the tap
> target already has the slack, so only the offset changes. The lip is an inner
> shadow at 15 percent black on Primary and 40 percent on Secondary: the same
> perceptual step on two very different faces, not two different ideas. Its
> offset is the one value not bound to a variable, because the effect needs a
> negative Y and the token is a positive height. In code it is inset 0 minus lip.
>
> Tertiary has no fill and no lip, so there is nothing to sink. It presses by
> scaling its label to 94 percent from its own centre. Figma cannot show that
> without rewriting the font size and breaking the type style, so the Pressed
> still is identical to Default on purpose. The scale lives here and in code,
> not in the variant.
>
> Motion for all three: 70ms down, 140ms back up, cubic-bezier(.2,.9,.3,1).
> Variants are stills; the movement only exists in prototype mode or in code.
>
> Colour does not change on press, on any variant. Movement is the whole signal.
> Disabled and Loading carry no lip by decision, so they read flat next to
> Default. Never dim an instance to fake a press, and never add a lip to
> Tertiary to make the family look consistent; consistency here is the timing,
> not the anatomy.

### The anatomy

An **outer box** whose height never changes, and a **face** inside it that
moves. Nothing outside the button can tell that it was pressed, because the
footprint is identical in every state.

| size | box | face at rest | lip | face pressed | drop |
| --- | --- | --- | --- | --- | --- |
| XS | 32 | 32 | 2 | 30 | 2 |
| S | 48 | 32 | 2 | 32 | 2 |
| M | 48 | 40 | 2 | 40 | 2 |
| L | 56 | 56 | 4 | 52 | 4 |

Where the face already fills its box — XS and L — the press also shrinks it by
the lip, so the sink stays inside the box. At S and M the box has the slack
already, so only the offset changes. That is the whole of what
\`Component/button/facePressed\` is for, and why it only exists at XS and L.

**Tertiary is not on that table.** Having no fill, its face is only ever the
label's own line box — 20 at XS, S and M — and only at L does it match the
family at 56. Its boxes are 20 / 48 / 48 / 56, so **XS Tertiary is the one
button in the set shorter than a tap-target row**: 20 tall, against 32 for a
Primary XS. Worth a look, since design-system.md has a minimum tap target.

### Where the values live

Everything above is a token. Four of them were added for this press and did not
exist before:

| token | what it is |
| --- | --- |
| \`color.alpha.dark-15\` / \`dark-40\` | the two lip fills |
| \`Component.button.lipFill.Primary\` / \`.Secondary\` | which face takes which |
| \`Component.button.pressScale\` | Tertiary's 94 percent |
| \`motion.duration.pressIn\` / \`pressOut\`, \`motion.easing.press\` | 70ms, 140ms, the curve |

\`Component/button/{height,lip,facePressed}\` were already in
\`tokens/tokens.json\` but had never been generated into
\`build/css/tokens.css\`, which was quietly failing the Foundations/Colors story.

### What not to do with it

- **Never dim an instance to fake a press.** Colour does not change on press, on
  any variant. If it looks pressed because it got darker, it is wrong.
- **Never add a lip to Tertiary** to make the family look consistent.
  Consistency here is the timing, not the anatomy.
- **Never let Disabled or Loading carry a lip.** They read flat next to Default
  by decision, which is what makes the lip mean "pressable".
- **One Primary per screen**, from design-system.md.
- **Keep labels to one or two words**, and test the longest one in German.

### Reduced motion

The press is the only feedback this button has, so under
\`prefers-reduced-motion\` the movement stays and only its timing goes: the face
still sinks, it just arrives immediately.

### Gaps

- **L's resting face height is unbound in Figma.** Every other face height binds
  a token; L's 56 is a loose number. It is the same measurement as
  \`Component/button/height/L\`, which is what is used here.
- **The Loading spinner is still empty.** \`showLeftIcon\` and
  \`showRightIcon\` now take an icon through \`leftIcon\` / \`rightIcon\`
  and render it via iconSlot, but Loading still just reserves its container.
  buttonIcon swaps in \`loading-01\` for that state; this one does not yet.
- **Tertiary Loading binds \`text/link\`** where every other Tertiary state
  binds \`text/primary\`. Nothing renders it, because Loading drops the label
  for an icon, so it is unbuilt rather than wrong — but it is the only place
  that colour appears on this component.
- **Figma's \`size\` default is XS**; this component defaults to M, which is
  what every call site in the repo already assumes.
`;

const meta = {
  title: 'Components/button',
  component: Button,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    state: { control: 'inline-radio', options: ['Default', 'Pressed', 'Disabled', 'Loading'] },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The box, the face and the lip at each size, straight off the Figma set. */
const SPEC: Record<ButtonSize, { box: number; face: number; lip: number; facePressed: number }> = {
  XS: { box: 32, face: 32, lip: 2, facePressed: 30 },
  S: { box: 48, face: 32, lip: 2, facePressed: 32 },
  M: { box: 48, face: 40, lip: 2, facePressed: 40 },
  L: { box: 56, face: 56, lip: 4, facePressed: 52 },
};

/**
 * Tertiary does not share those. Its face is the label's own line box at XS, S
 * and M, and only at L does it match the family — which is also the only size
 * where it is as tall as a Primary. At XS its whole box is the line box, making
 * it the one button in the set shorter than a tap-target row.
 */
const TERTIARY_SPEC: Record<ButtonSize, { box: number; face: number }> = {
  XS: { box: 20, face: 20 },
  S: { box: 48, face: 20 },
  M: { box: 48, face: 20 },
  L: { box: 56, face: 56 },
};

const faceOf = (button: HTMLElement) => button.querySelector('.knowieButton-face') as HTMLElement;

/** How far the face sits below the top of its box. */
function drop(button: HTMLElement): number {
  return Math.round(
    faceOf(button).getBoundingClientRect().top - button.getBoundingClientRect().top,
  );
}

export const Default: Story = {
  render: (args) => <Matrix state="Default" onClick={args.onClick} />,
  play: async ({ canvas, args }) => {
    for (const size of SIZES) {
      for (const variant of VARIANTS) {
        const spec = variant === 'Tertiary' ? TERTIARY_SPEC[size] : SPEC[size];
        const button = pick(canvas.getAllByRole('button', { name: size }), variant);
        const face = faceOf(button);
        // The outer box is the tap target and never changes height.
        await expect(Math.round(button.getBoundingClientRect().height)).toBe(spec.box);
        await expect(Math.round(face.getBoundingClientRect().height)).toBe(spec.face);
        // Primary and Secondary rest on a lip; Tertiary has none to rest on.
        const lip = getComputedStyle(face).boxShadow;
        if (variant === 'Tertiary') {
          await expect(lip).toBe('none');
        } else {
          await expect(lip).not.toBe('none');
          await expect(lip).toContain('inset');
        }
      }
    }

    const button = pick(canvas.getAllByRole('button', { name: 'M' }), 'Primary');
    await expect(button).toBeEnabled();
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
        const face = faceOf(button);

        await expect(button).toHaveAttribute('data-state', 'Pressed');
        // The lip is collapsed in every pressed state, on every variant.
        await expect(getComputedStyle(face).boxShadow).toBe('none');

        if (variant === 'Tertiary') {
          // The footprint is identical to Default, and nothing sinks: the label
          // carries the press instead.
          await expect(Math.round(button.getBoundingClientRect().height)).toBe(
            TERTIARY_SPEC[size].box,
          );
          await expect(Math.round(face.getBoundingClientRect().height)).toBe(
            TERTIARY_SPEC[size].face,
          );
          const label = button.querySelector('.knowieButton-label') as HTMLElement;
          await expect(getComputedStyle(label).transform).not.toBe('none');
        } else {
          // The box is unchanged, so nothing around it reflows, and the face has
          // shrunk to its pressed height where it filled the box.
          await expect(Math.round(button.getBoundingClientRect().height)).toBe(SPEC[size].box);
          await expect(Math.round(face.getBoundingClientRect().height)).toBe(
            SPEC[size].facePressed,
          );
        }
      }
    }
  },
};

export const Disabled: Story = {
  render: (args) => <Matrix state="Disabled" onClick={args.onClick} />,
  play: async ({ canvas, args }) => {
    for (const variant of VARIANTS) {
      for (const size of SIZES) {
        const button = pick(canvas.getAllByRole('button', { name: size }), variant);
        await expect(button).toBeDisabled();
        // No lip by decision, so Disabled reads flat next to Default.
        await expect(getComputedStyle(faceOf(button)).boxShadow).toBe('none');
      }
    }
    await userEvent.click(pick(canvas.getAllByRole('button', { name: 'M' }), 'Primary'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  render: (args) => <Matrix state="Loading" onClick={args.onClick} />,
  play: async ({ canvas, args }) => {
    // The label is dropped from the layout, but the button keeps its name.
    const button = pick(canvas.getAllByRole('button', { name: 'M' }), 'Primary');
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveTextContent('');
    // Flat next to Default, the same way Disabled is.
    await expect(getComputedStyle(faceOf(button)).boxShadow).toBe('none');
    // A request is already in flight, so the press must not start another.
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/**
 * Not a Figma variant — each size at rest beside the same size pressed, which
 * is the only place the mechanic can actually be checked. Figma's variants are
 * stills; what matters is the relationship between the two.
 */
export const TheSink: Story = {
  name: 'The sink',
  render: (args) => (
    <div className="knowieButtonMatrix">
      {SIZES.map((size) => (
        <div className="knowieButtonMatrix-group" key={size}>
          <h3 className="knowieButtonMatrix-title">{size} — at rest, then pressed</h3>
          <div className="knowieButtonMatrix-row">
            <Button variant="Primary" size={size} state="Default" CTA={size} onClick={args.onClick} />
            <Button variant="Primary" size={size} state="Pressed" CTA={size} onClick={args.onClick} />
            <Button
              variant="Secondary"
              size={size}
              state="Default"
              CTA={size}
              onClick={args.onClick}
            />
            <Button
              variant="Secondary"
              size={size}
              state="Pressed"
              CTA={size}
              onClick={args.onClick}
            />
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll('.knowieButtonMatrix-row')] as HTMLElement[];
    await expect(rows).toHaveLength(SIZES.length);

    for (const [index, size] of SIZES.entries()) {
      const spec = SPEC[size];
      const buttons = [...rows[index].querySelectorAll('.knowieButton')] as HTMLElement[];
      const [primaryRest, primaryPressed, secondaryRest, secondaryPressed] = buttons;

      for (const [rest, pressed] of [
        [primaryRest, primaryPressed],
        [secondaryRest, secondaryPressed],
      ] as const) {
        // The box never changes height, in either state.
        await expect(Math.round(rest.getBoundingClientRect().height)).toBe(spec.box);
        await expect(Math.round(pressed.getBoundingClientRect().height)).toBe(spec.box);

        // The face drops by exactly the lip it was sitting on.
        await expect(drop(pressed) - drop(rest)).toBe(spec.lip);

        // And the lip it dropped into is gone.
        await expect(getComputedStyle(faceOf(rest)).boxShadow).toContain('inset');
        await expect(getComputedStyle(faceOf(pressed)).boxShadow).toBe('none');

        // The one rule the whole component rests on: colour does not change on
        // press. If this ever fails, the press has stopped being movement.
        await expect(getComputedStyle(faceOf(pressed)).backgroundColor).toBe(
          getComputedStyle(faceOf(rest)).backgroundColor,
        );
        const restLabel = rest.querySelector('.knowieButton-label') as HTMLElement;
        const pressedLabel = pressed.querySelector('.knowieButton-label') as HTMLElement;
        await expect(getComputedStyle(pressedLabel).color).toBe(getComputedStyle(restLabel).color);
      }
    }
  },
};

/**
 * Not a Figma variant — Tertiary has no lip, so its press is the label shrinking
 * from its own centre. Figma's Pressed still is identical to Default on purpose;
 * this is the only place the difference exists.
 */
export const TertiaryPress: Story = {
  name: 'Tertiary presses by scale',
  render: (args) => (
    <div className="knowieButtonMatrix">
      <div className="knowieButtonMatrix-group">
        <h3 className="knowieButtonMatrix-title">Tertiary — at rest, then pressed</h3>
        <div className="knowieButtonMatrix-row">
          <Button variant="Tertiary" size="L" state="Default" CTA="Skip" onClick={args.onClick} />
          <Button variant="Tertiary" size="L" state="Pressed" CTA="Skip" onClick={args.onClick} />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [rest, pressed] = [
      ...canvasElement.querySelectorAll('.knowieButton'),
    ] as HTMLElement[];

    // Neither has a lip, and neither sinks.
    await expect(getComputedStyle(faceOf(rest)).boxShadow).toBe('none');
    await expect(getComputedStyle(faceOf(pressed)).boxShadow).toBe('none');
    await expect(drop(pressed)).toBe(drop(rest));

    // The label is the only thing that moves, and only by scaling.
    const restLabel = rest.querySelector('.knowieButton-label') as HTMLElement;
    const pressedLabel = pressed.querySelector('.knowieButton-label') as HTMLElement;
    await expect(getComputedStyle(restLabel).transform).toBe('none');
    await expect(getComputedStyle(pressedLabel).transform).toContain('matrix');
    // 94 percent, from the token rather than from a number written here.
    const scale = Number(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--component-button-press-scale')
        .trim(),
    );
    await expect(pressedLabel.getBoundingClientRect().width).toBeCloseTo(
      restLabel.getBoundingClientRect().width * scale,
      1,
    );

    // And colour still does not change, the same as the other two variants.
    await expect(getComputedStyle(pressedLabel).color).toBe(getComputedStyle(restLabel).color);
  },
};

/**
 * Not a Figma variant — the icon containers with something in them. Figma fills
 * them with an iconSlot instance swap; `leftIcon` and `rightIcon` are that
 * swap, so the glyph comes from public/icons and goes through iconSlot rather
 * than being placed raw, which is what design-system.md requires.
 *
 * sprint-context's locked build rules say "every button carries an icon: mic
 * for record actions, keyboard for Type instead" — these are those.
 */
export const WithIcons: Story = {
  name: 'Icons in the containers',
  render: (args) => (
    <div className="knowieButtonMatrix">
      <div className="knowieButtonMatrix-group">
        <h3 className="knowieButtonMatrix-title">Left icon, on each variant</h3>
        <div className="knowieButtonMatrix-row">
          <Button
            variant="Primary"
            size="L"
            showLeftIcon
            leftIcon="microphone-01"
            CTA="Record"
            onClick={args.onClick}
          />
          <Button
            variant="Secondary"
            size="M"
            showLeftIcon
            leftIcon="keyboard-01"
            CTA="Type instead"
            onClick={args.onClick}
          />
          <Button
            variant="Tertiary"
            size="M"
            showLeftIcon
            leftIcon="x-close"
            CTA="Cancel"
            onClick={args.onClick}
          />
        </div>
      </div>
      <div className="knowieButtonMatrix-group">
        <h3 className="knowieButtonMatrix-title">Right icon, and a reserved box with no icon</h3>
        <div className="knowieButtonMatrix-row">
          <Button
            variant="Primary"
            size="L"
            showRightIcon
            rightIcon="arrow-right"
            CTA="Send answer"
            onClick={args.onClick}
          />
          <Button variant="Secondary" size="M" showLeftIcon CTA="No icon" onClick={args.onClick} />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const slots = canvasElement.querySelectorAll('.knowieIconSlot');
    // Four buttons carry an icon; the fifth reserves its box and stays empty.
    await expect(slots).toHaveLength(4);
    await expect(canvasElement.querySelectorAll('.knowieButton-icon')).toHaveLength(1);

    // The slot size follows the button size, off the same Icon scale the
    // reserved containers used: L takes 300, M takes 250.
    const record = canvas.getByRole('button', { name: 'Record' });
    const type = canvas.getByRole('button', { name: 'Type instead' });
    await expect(record.querySelector('.knowieIconSlot')).toHaveAttribute('data-size', '300');
    await expect(type.querySelector('.knowieIconSlot')).toHaveAttribute('data-size', '250');

    // The icon takes the label's colour rather than naming its own, so the two
    // never drift apart. Primary is the case that would break with the slot's
    // own default of text.primary.
    for (const name of ['Record', 'Type instead', 'Cancel']) {
      const button = canvas.getByRole('button', { name });
      const slot = button.querySelector('.knowieIconSlot') as HTMLElement;
      const label = button.querySelector('.knowieButton-label') as HTMLElement;
      await expect(getComputedStyle(slot).color).toBe(getComputedStyle(label).color);
    }

    // Decorative: the label is what names the action, so the icon is hidden
    // from the accessibility tree and the button keeps its plain name.
    await expect(record.querySelector('.knowieIconSlot')).toHaveAttribute('aria-hidden', 'true');
  },
};
