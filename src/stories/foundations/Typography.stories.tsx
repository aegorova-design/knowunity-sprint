import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Description, Page, Section } from './Foundations';
import { TEXT_STYLES, type TextStyle, member, unresolvedTokenVars } from './tokens';

/** One phrase across every style, so the sizes can be compared directly. */
const SPECIMEN = 'Say it out loud';

function Specimen({ style }: { style: TextStyle }) {
  return (
    <Section title={style.name} note={style.description ?? undefined}>
      <div className="fnd-typeItem">
        <p
          className="fnd-specimen"
          style={{
            fontFamily: `var(${member(style, 'fontFamily').cssVar})`,
            fontWeight: `var(${member(style, 'fontWeight').cssVar})`,
            fontSize: `var(${member(style, 'fontSize').cssVar})`,
            lineHeight: `var(${member(style, 'lineHeight').cssVar})`,
          }}
        >
          {SPECIMEN}
        </p>
        <table className="fnd-metaTable">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Token</th>
              <th scope="col">Value</th>
              <th scope="col">$description</th>
            </tr>
          </thead>
          <tbody>
            {style.members.map((entry) => (
              <tr key={entry.cssVar}>
                <td className="fnd-value">{entry.path[entry.path.length - 1]}</td>
                <td className="fnd-name" data-token-var={entry.cssVar}>
                  {entry.cssVar}
                </td>
                <td className="fnd-value">
                  {entry.value}
                  {entry.aliasOf ? <span className="fnd-alias"> → {entry.aliasOf}</span> : null}
                </td>
                <td>
                  <Description description={entry.description} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

const meta = {
  title: 'Foundations/Type',
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: undefined } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-token-var]').length).toBeGreaterThan(0);
    await expect(unresolvedTokenVars(canvasElement)).toEqual([]);
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every Greed text style at its real size, largest first. */
export const Scale: Story = {
  render: () => (
    <Page
      title="Type"
      intro="The Greed text styles in scale order, each specimen set with its own four tokens from build/css/tokens.css. The style group itself carries no $description, so each of its four tokens shows its own. font.family.default resolves through var(--font-greed) to Greed Standard-TRIAL, which this repo now ships in src/fonts/greed: the app loads it with next/font/local and this catalog declares the same four weights as @font-face in .storybook/preview.css, so the specimens render in the real face."
    >
      <div className="fnd-typeList">
        {TEXT_STYLES.map((style) => (
          <Specimen style={style} key={style.name} />
        ))}
      </div>
    </Page>
  ),
};
