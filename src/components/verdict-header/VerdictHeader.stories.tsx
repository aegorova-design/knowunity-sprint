import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { VerdictHeader, type VerdictHeaderVerdict } from './VerdictHeader';
import './verdictHeader.stories.css';

const VERDICTS: VerdictHeaderVerdict[] = ['Pass', 'Partial', 'Miss', 'Neutral', 'Checking'];

const DOCS = `
The component's description in Figma, verbatim:

> Invented. The top of a turn result: Knowie at size L, a headline and a
> caption, centred. The verdict picks the pose and the headline's colour — Pass
> is Excited, Partial Approving, Miss Questioning — and the headline names the
> result in words, which is what still reads when colour and pose both disappear
> in greyscale. Neutral and Checking are not verdicts: Neutral is a term read
> back on the summary, Checking is the wait while an answer is judged, and both
> keep text.primary. One per result screen or verdict sheet. Never let the
> headline stop naming the result, never set the pose on the nested mascotFigure
> since the verdict drives it, and never recolour the headline on an instance —
> a sixth colour is a sixth verdict, and that is a decision.

### How meaning survives greyscale

The headline is the guarantee. Colour and pose both disappear in greyscale, and
this component has no icon — so what makes it honest is that **the title says
the result in words**. That is the same rule mascotFigure carries: "never let a
pose be the only thing carrying a verdict". Keep the title naming the result and
the component holds; replace all five with "Done" and it does not.

The earlier description promised a badge with a check, a half circle and a bent
arrow. No such badge was ever built, it named three shapes for five variants,
and it has now been rewritten around what the component actually is.

### The five variants

| verdict | pose | title colour |
| --- | --- | --- |
| Pass | Excited | feedback.success.onSubtle |
| Partial | Approving | feedback.partial.**bold** |
| Miss | Questioning | feedback.error.onSubtle |
| Neutral | Standby | text.primary |
| Checking | Thinking | text.primary |

Everything else is identical across all five: Space/0 of padding, Space/300 of
gap, Greed/Headline M on the title, Greed/Body S Regular on text.secondary for
the caption.

Neutral and Checking are not verdicts — they are review and processing — so
their titles stay on the page's own text colour rather than borrowing a feedback
one. Checking takes **Thinking**, the pose mascotFigure deliberately keeps
outside mascotMessage's four states, for a moment where Knowie is working
something out and the student is waiting.

### Built from

- **mascotFigure** at size L, pose per verdict. Figma nests exactly this
  instance in every variant and swaps only the pose.

**textBlock was not used**, although it is a title with a caption and the shape
is right. Two things block it, and neither is a prop that can be added on an
instance:

- **No step at Headline M.** textBlock's title runs Display M (76), Headline XL
  (44), Body M Bold (18), Body S Bold (15). This title is Headline M (28), which
  is not on that ramp.
- **No way to colour a title.** textBlock binds text.primary and exposes no
  colour prop, and three of these five verdicts need a feedback colour.

Figma does not nest textBlock here either, so the component and the file agree.
If textBlock ever gains a Headline M step and a title colour, this is the place
to revisit.

### What not to do with it

- **Never let the title stop saying the verdict.** Colour and pose both vanish
  in greyscale; the words are the only thing that does not. A title of "Done" on
  all five would break the component's one real accessibility guarantee.
- **Never use Neutral or Checking as a verdict.** They are review and
  processing. A result that has been judged is Pass, Partial or Miss.
- **Never set the pose on the nested mascotFigure.** The verdict drives it, the
  same way termRow's variant drives its nested statusTag.
- **Never recolour the title on an instance.** A sixth colour is a sixth
  verdict, and that is a decision.

### Gaps

- **Partial takes bold where Pass and Miss take onSubtle.** \`feedback.partial.
  bold\` is orange-400 against \`feedback.success.onSubtle\` green-300 and
  \`feedback.error.onSubtle\` red-200. \`feedback.partial.onSubtle\` exists and
  is orange-300, which is what the pair suggests. Built as bound, because that
  is what the file says, but the odd one out is worth a look — especially for
  contrast on the page background.
- **The default copy is Pass's copy on all five variants.** Every variant ships
  "You got it" and "Every key idea, first try, no help.", so four of the five
  read as wrong until the props are set. Text defaults are per-set in Figma,
  not per-variant, so this cannot be fixed there — but the real copy for
  Partial, Miss, Neutral and Checking is not written down anywhere yet.
`;

const meta = {
  title: 'Components/verdictHeader',
  component: VerdictHeader,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    verdict: { control: 'inline-radio', options: VERDICTS },
  },
  render: (args) => (
    <div className="knowieVerdictHeaderDemo">
      <VerdictHeader {...args} />
    </div>
  ),
} satisfies Meta<typeof VerdictHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What each verdict carries: the pose's file, and the token its title takes. */
const SPEC: Record<VerdictHeaderVerdict, { pose: string; color: string }> = {
  Pass: { pose: 'knowie-09-excited.svg', color: '--color-feedback-success-on-subtle' },
  Partial: { pose: 'knowie-03-approving.svg', color: '--color-feedback-partial-bold' },
  Miss: { pose: 'knowie-11-questioning.svg', color: '--color-feedback-error-on-subtle' },
  Neutral: { pose: 'knowie-01-standby.svg', color: '--color-text-primary' },
  Checking: { pose: 'knowie-12-thinking.svg', color: '--color-text-primary' },
};

/**
 * What a token resolves to in the browser, so the tests can check a colour
 * without a hex ever being written down here.
 */
function tokenColor(token: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

/**
 * One story per Figma variant, named the way Figma names it.
 *
 * The `name` is set at the export rather than in here: Storybook's indexer
 * reads it statically, so a name returned from a factory never reaches the
 * sidebar and the export name shows instead.
 */
function verdictStory(verdict: VerdictHeaderVerdict, title: string, caption: string): Story {
  return {
    args: { verdict, title, caption },
    play: async ({ canvas, canvasElement }) => {
      const root = canvasElement.querySelector('.knowieVerdictHeader') as HTMLElement;
      const titleEl = canvasElement.querySelector('.knowieVerdictHeader-title') as HTMLElement;
      const captionEl = canvasElement.querySelector('.knowieVerdictHeader-caption') as HTMLElement;
      const mascot = canvasElement.querySelector('.knowieMascotFigure') as HTMLElement;
      const spec = SPEC[verdict];

      await expect(root).toHaveAttribute('data-verdict', verdict);
      // The verdict drives the pose; nothing sets it on the instance.
      await expect(mascot).toHaveAttribute('data-size', 'L');
      await expect(mascot.querySelector('img')?.getAttribute('src')).toContain(spec.pose);

      // Space/300 between the three, centred, with no padding of its own.
      await expect(getComputedStyle(root).gap).toBe('12px');
      await expect(getComputedStyle(root).padding).toBe('0px');
      await expect(getComputedStyle(root).textAlign).toBe('center');

      // The title's colour is the only fill the verdict changes.
      await expect(getComputedStyle(titleEl).color).toBe(tokenColor(spec.color));
      // The caption never changes with it.
      await expect(getComputedStyle(captionEl).color).toBe(tokenColor('--color-text-secondary'));

      // The words are what survives greyscale, so they are what is checked.
      await expect(canvas.getByRole('heading')).toHaveTextContent(title);
      await expect(captionEl).toHaveTextContent(caption);
      // Knowie is decorative here: the heading already says the result.
      await expect(mascot.querySelector('img')).toHaveAttribute('alt', '');
    },
  };
}

/** The clean result: every key idea, first try. */
export const Pass: Story = {
  ...verdictStory('Pass', 'You got it', 'Every key idea, first try, no help.'),
  name: 'verdict=Pass',
};

/** Most of it, with a nudge along the way. */
export const Partial: Story = {
  ...verdictStory('Partial', 'Almost there', 'You had the shape of it, with a hint.'),
  name: 'verdict=Partial',
};

/** The one to come back to. */
export const Miss: Story = {
  ...verdictStory('Miss', 'Not quite', 'This one is worth another go later.'),
  name: 'verdict=Miss',
};

/** Not a verdict — a term being read back on the summary. */
export const Neutral: Story = {
  ...verdictStory('Neutral', 'Feudalism', 'Here is what you said about it.'),
  name: 'verdict=Neutral',
};

/** Not a verdict — the wait while the answer is being judged. */
export const Checking: Story = {
  ...verdictStory('Checking', 'Checking your answer', 'One moment while Knowie reads it back.'),
  name: 'verdict=Checking',
};

/**
 * Not a Figma variant — all five in a column, which is the only place the pose
 * and colour pairs can be compared. Also the check that meaning is not resting
 * on colour: read this story in greyscale and every result still reads, because
 * each title says it in words.
 */
export const EveryVerdict: Story = {
  name: 'Every verdict',
  args: { verdict: 'Pass' },
  render: () => (
    <div className="knowieVerdictHeaderDemo">
      <div className="knowieVerdictHeaderDemo-stack">
        <VerdictHeader verdict="Pass" title="You got it" caption="Every key idea, first try." />
        <VerdictHeader verdict="Partial" title="Almost there" caption="You had it, with a hint." />
        <VerdictHeader verdict="Miss" title="Not quite" caption="Worth another go later." />
        <VerdictHeader verdict="Neutral" title="Feudalism" caption="Here is what you said." />
        <VerdictHeader verdict="Checking" title="Checking your answer" caption="One moment." />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const roots = [...canvasElement.querySelectorAll('.knowieVerdictHeader')] as HTMLElement[];
    await expect(roots).toHaveLength(5);

    // Five verdicts, five poses — no verdict borrows another's.
    const poses = roots.map((r) => r.querySelector('img')?.getAttribute('src'));
    await expect(new Set(poses).size).toBe(5);

    // The three real verdicts each take their own colour; Neutral and Checking
    // share text.primary, because neither of them is a verdict.
    const colors = roots.map(
      (r) =>
        getComputedStyle(r.querySelector('.knowieVerdictHeader-title') as HTMLElement).color,
    );
    await expect(new Set(colors).size).toBe(4);
    await expect(colors[3]).toBe(colors[4]);
  },
};
