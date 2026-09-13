/**
 * Style Dictionary config — turns tokens/*.json into CSS custom properties.
 *
 * Run it with: npm run tokens
 * Output:      build/css/tokens.css (generated; never edit by hand)
 */

/** Maps DTCG unit names onto real CSS units. DTCG spells percent out in full. */
const CSS_UNITS = {
  px: 'px',
  rem: 'rem',
  percent: '%',
};

const config = {
  // Read every token file in tokens/. A glob, so files added later are picked up
  // without touching this config.
  source: ['tokens/*.json'],

  // Our tokens use the W3C Design Tokens format ($value / $type rather than
  // value / type). This flag tells Style Dictionary to read those keys.
  usesDtcg: true,

  hooks: {
    transforms: {
      // Variable names come from the token's own path, with one exception:
      // colour tokens that do not already live under `color` get a `color-`
      // prefix, so interactive.primary reads as --color-interactive-primary.
      // Runs after the built-in name/kebab, so it only prepends to that result.
      'name/color-prefix': {
        type: 'name',
        filter: (token) => token.$type === 'color' && token.path[0].toLowerCase() !== 'color',
        transform: (token) => `color-${token.name}`,
      },

      // Dimensions arrive as objects: { value: 16, unit: "px" }. Emit the
      // authored number and unit untouched — no px-to-rem conversion, so the
      // CSS matches the values in Figma exactly.
      'dimension/css-unit': {
        type: 'value',
        filter: (token) => token.$type === 'dimension',
        transform: (token) => {
          const dimension = token.$value;
          if (dimension === null || typeof dimension !== 'object') {
            return dimension;
          }
          const unit = CSS_UNITS[dimension.unit] ?? dimension.unit;
          return `${dimension.value}${unit}`;
        },
      },
    },

    fileHeaders: {
      'knowunity/generated': () => [
        'GENERATED FILE — DO NOT EDIT BY HAND.',
        '',
        'Every value here comes from tokens/tokens.json.',
        'Edit the token, then run: npm run tokens',
        'Hand edits will be overwritten on the next build.',
      ],
    },
  },

  platforms: {
    css: {
      // Listed explicitly instead of using the built-in `css` transformGroup,
      // which includes size/rem and would rewrite our px values as rem.
      transforms: [
        'name/kebab', // color.violet.50        -> color-violet-50
        'name/color-prefix', // interactive.primary    -> color-interactive-primary
        'dimension/css-unit', // { value: 16, unit: px } -> 16px
        'color/css', // srgb components        -> #f4f2ff / rgba(...)
        'fontFamily/css', // Greed Standard-TRIAL   -> 'Greed Standard-TRIAL'
      ],

      // buildPath + destination together make build/css/tokens.css.
      buildPath: 'build/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            // Keep alias tokens pointing at the token they reference, so
            // --color-interactive-primary: var(--color-violet-50) instead of a
            // duplicated hex. Mirrors the alias structure of tokens.json.
            outputReferences: true,

            // No fallback values inside var() — see the project's hard rules.
            outputReferenceFallbacks: false,

            fileHeader: 'knowunity/generated',
          },
        },
      ],
    },
  },
};

export default config;
