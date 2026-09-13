import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Description, Page, Section } from './Foundations';
import {
  type DimensionEntry,
  SPACE_NEGATIVE,
  SPACE_SCALE,
  unresolvedTokenVars,
} from './tokens';

function SpaceRow({ entry }: { entry: DimensionEntry }) {
  const negative = entry.numeric < 0;
  return (
    <div className="fnd-spaceRow">
      <div className="fnd-spaceHead">
        <span className="fnd-name">{entry.cssVar}</span>
        <span className="fnd-value">{entry.value}</span>
      </div>
      <div className={negative ? 'fnd-track fnd-track--negative' : 'fnd-track'}>
        <div
          className={negative ? 'fnd-bar fnd-bar--negative' : 'fnd-bar'}
          // A negative token cannot be a width, so the bar is drawn at its
          // magnitude and runs back towards the zero rule instead.
          style={{ width: negative ? `calc(-1 * var(${entry.cssVar}))` : `var(${entry.cssVar})` }}
          data-token-var={entry.cssVar}
        />
      </div>
      <Description description={entry.description} />
    </div>
  );
}

const meta = {
  title: 'Foundations/Spacing',
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: undefined } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-token-var]').length).toBeGreaterThan(0);
    await expect(unresolvedTokenVars(canvasElement)).toEqual([]);
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every Space token drawn at its real width. */
export const Scale: Story = {
  render: () => (
    <Page
      title="Spacing"
      intro="Every Space token drawn at the width its custom property resolves to. Sorted by value rather than by declaration order, so Space.050 sits where it belongs in the scale. The vertical rule marks zero."
    >
      <Section title="Scale" note="Space.0 up to Space.4000.">
        <div className="fnd-spaceList">
          {SPACE_SCALE.map((entry) => (
            <SpaceRow entry={entry} key={entry.cssVar} />
          ))}
        </div>
      </Section>
      <Section
        title="Negative"
        note="Pulls rather than fills, so these run back towards the zero rule and are drawn as outlines."
      >
        <div className="fnd-spaceList">
          {SPACE_NEGATIVE.map((entry) => (
            <SpaceRow entry={entry} key={entry.cssVar} />
          ))}
        </div>
      </Section>
    </Page>
  ),
};
