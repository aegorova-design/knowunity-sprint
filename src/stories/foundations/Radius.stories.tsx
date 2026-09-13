import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Page, TokenMeta } from './Foundations';
import { RADIUS_SCALE, unresolvedTokenVars } from './tokens';

const meta = {
  title: 'Foundations/Radius',
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: undefined } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-token-var]').length).toBeGreaterThan(0);
    await expect(unresolvedTokenVars(canvasElement)).toEqual([]);
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every Radius token applied to a box of the same size. */
export const Scale: Story = {
  render: () => (
    <Page
      title="Radius"
      intro="Every Radius token applied to the same 96px box, smallest corner first. Radius.Full is a 9999px corner, so on a square it reads as a circle."
    >
      <div className="fnd-radiusGrid">
        {RADIUS_SCALE.map((entry) => (
          <div className="fnd-radiusCard" key={entry.cssVar}>
            <div
              className="fnd-radiusBox"
              style={{ borderRadius: `var(${entry.cssVar})` }}
              data-token-var={entry.cssVar}
            />
            <TokenMeta entry={entry} />
          </div>
        ))}
      </div>
    </Page>
  ),
};
