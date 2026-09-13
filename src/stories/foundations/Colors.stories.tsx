import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Page, Section, TokenMeta } from './Foundations';
import {
  PRIMITIVE_COLOR_GROUPS,
  SEMANTIC_COLOR_GROUPS,
  type TokenGroupView,
  unresolvedTokenVars,
} from './tokens';

function SwatchGrid({ group }: { group: TokenGroupView }) {
  return (
    <Section title={group.name}>
      <div className="fnd-swatchGrid">
        {group.entries.map((entry) => (
          <div className="fnd-swatchCard" key={entry.cssVar}>
            <div className="fnd-swatchTrack">
              <div
                className="fnd-swatch"
                style={{ background: `var(${entry.cssVar})` }}
                data-token-var={entry.cssVar}
              />
            </div>
            <TokenMeta entry={entry} />
          </div>
        ))}
      </div>
    </Section>
  );
}

const meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'fullscreen' },
  // These are reference pages, not screens, so they ignore the 390px canvas
  // the preview file puts every component story on.
  globals: { viewport: { value: undefined } },
  // Guards against tokens.json and build/css/tokens.css drifting apart: every
  // swatch is painted with var(--token), so an undefined property means the
  // generated CSS is stale or the name derivation no longer matches the build.
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-token-var]').length).toBeGreaterThan(0);
    await expect(unresolvedTokenVars(canvasElement)).toEqual([]);
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The layer screens are built from: one section per semantic group. */
export const Semantic: Story = {
  render: () => (
    <Page
      title="Colours — semantic"
      intro="The layer to build from. Each swatch is painted with its own custom property from build/css/tokens.css; the name, value and description are read from tokens/tokens.json. Swatches sit on background.surface so the alpha tokens read as tints."
    >
      {SEMANTIC_COLOR_GROUPS.map((group) => (
        <SwatchGrid group={group} key={group.name} />
      ))}
    </Page>
  ),
};

/** The raw ramps the semantic layer points at. Not for use in screens. */
export const Primitives: Story = {
  render: () => (
    <Page
      title="Colours — primitives"
      intro="The raw palette the semantic layer aliases. Reach for a semantic token instead: these carry no meaning and no descriptions."
    >
      {PRIMITIVE_COLOR_GROUPS.map((group) => (
        <SwatchGrid group={group} key={group.name} />
      ))}
    </Page>
  ),
};
