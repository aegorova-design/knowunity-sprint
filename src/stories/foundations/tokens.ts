/**
 * Reads tokens/tokens.json and pairs each token with the CSS custom property
 * Style Dictionary generates for it in build/css/tokens.css.
 *
 * The foundations stories take their *structure*, *$description* and *resolved
 * value* from tokens.json, and paint every specimen with `var(--the-token)` so
 * what you see on screen is the generated CSS, not a copy of it. If the two
 * ever drift apart, the play function in each story fails — see
 * `unresolvedTokenVars`.
 */

import tokensJson from '../../../tokens/tokens.json';

/** Shown wherever a token carries no `$description` in tokens.json. */
export const NO_DESCRIPTION = 'No $description in tokens.json';

type Dimension = { value: number; unit: string };
type ColorValue = { colorSpace: string; components: number[]; alpha: number; hex?: string };
type TokenNode = { $value: unknown; $type?: string; $description?: string };
type TokenGroup = { [key: string]: TokenNode | TokenGroup };

const tokens = tokensJson as unknown as TokenGroup;

export type TokenEntry = {
  /** Path through tokens.json, e.g. ['accent', 'green', 'bold']. */
  path: string[];
  /** Dotted path as written in tokens.json, e.g. 'accent.green.bold'. */
  label: string;
  /** The generated custom property, e.g. '--color-accent-green-bold'. */
  cssVar: string;
  $type: string;
  /** Resolved through any aliases, formatted the way the CSS build formats it. */
  value: string;
  /** Dotted path this token aliases, or null when it holds a literal value. */
  aliasOf: string | null;
  /** The token's own `$description`, or null when it has none. */
  description: string | null;
};

/** A dimension token's number, for anything that needs to sort or sign-test it. */
export type DimensionEntry = TokenEntry & { numeric: number };

// --- name derivation -------------------------------------------------------
//
// Mirrors the two name transforms in style-dictionary.config.mjs: the built-in
// `name/kebab` (which is change-case's kebabCase over the token path) and our
// own `name/color-prefix`. Verified to reproduce all 300 names in
// build/css/tokens.css exactly.

const SPLIT_LOWER_UPPER = /([\p{Ll}\d])(\p{Lu})/gu;
const SPLIT_UPPER_UPPER = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
const STRIP_NON_WORD = /[^\p{L}\d]+/giu;

function kebabCase(path: string[]): string {
  return path
    .join(' ')
    .trim()
    .replace(SPLIT_LOWER_UPPER, '$1\0$2')
    .replace(SPLIT_UPPER_UPPER, '$1\0$2')
    .replace(STRIP_NON_WORD, '\0')
    .split('\0')
    .filter(Boolean)
    .map((word) => word.toLowerCase())
    .join('-');
}

function cssVarFor(path: string[], $type: string): string {
  const name = kebabCase(path);
  // Colour tokens that don't already live under `color` get the prefix back.
  return $type === 'color' && path[0].toLowerCase() !== 'color' ? `--color-${name}` : `--${name}`;
}

// --- value formatting ------------------------------------------------------
//
// Matches the `dimension/css-unit` and `color/css` transforms, so the value
// printed next to a swatch is the value that landed in the CSS.

const CSS_UNITS: Record<string, string> = { px: 'px', rem: 'rem', percent: '%' };

function formatColor(color: ColorValue): string {
  if (color.alpha >= 1) {
    return color.hex ?? rgbaOf(color);
  }
  return rgbaOf(color);
}

function rgbaOf({ components, alpha }: ColorValue): string {
  const [r, g, b] = components.map((channel) => Math.round(channel * 255));
  return alpha >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatValue(value: unknown, $type: string): string {
  if ($type === 'color') return formatColor(value as ColorValue);
  if ($type === 'dimension') {
    const { value: number, unit } = value as Dimension;
    return `${number}${CSS_UNITS[unit] ?? unit}`;
  }
  return String(value);
}

// --- reading tokens.json ---------------------------------------------------

const ALIAS = /^\{(.+)\}$/;

function nodeAt(path: string[]): TokenNode {
  let node: TokenGroup | TokenNode = tokens;
  for (const key of path) {
    node = (node as TokenGroup)[key];
    if (!node) throw new Error(`No token at ${path.join('.')}`);
  }
  return node as TokenNode;
}

function isToken(node: TokenNode | TokenGroup): node is TokenNode {
  return typeof node === 'object' && node !== null && '$value' in node;
}

/** Follows `{a.b.c}` references until a literal value is reached. */
function resolve(node: TokenNode): { value: unknown; $type: string } {
  const alias = typeof node.$value === 'string' ? ALIAS.exec(node.$value) : null;
  if (!alias) return { value: node.$value, $type: node.$type ?? 'unknown' };
  const target = nodeAt(alias[1].split('.'));
  const resolved = resolve(target);
  return { value: resolved.value, $type: node.$type ?? resolved.$type };
}

function entryAt(path: string[]): TokenEntry {
  const node = nodeAt(path);
  const alias = typeof node.$value === 'string' ? ALIAS.exec(node.$value) : null;
  const { value, $type } = resolve(node);
  return {
    path,
    label: path.join('.'),
    cssVar: cssVarFor(path, $type),
    $type,
    value: formatValue(value, $type),
    aliasOf: alias ? alias[1] : null,
    description: node.$description ?? null,
  };
}

/** Every token under `path`, depth-first, in the order tokens.json declares them. */
function collect(path: string[]): TokenEntry[] {
  const node = nodeAt(path) as TokenNode | TokenGroup;
  if (isToken(node)) return [entryAt(path)];
  return Object.keys(node)
    .filter((key) => !key.startsWith('$'))
    .flatMap((key) => collect([...path, key]));
}

function asDimensions(entries: TokenEntry[]): DimensionEntry[] {
  return entries.map((entry) => ({
    ...entry,
    numeric: (nodeAt(entry.path).$value as Dimension).value,
  }));
}

// --- the groups the stories render ----------------------------------------

/**
 * Groups that hold raw palette values rather than semantic ones, plus the
 * structural scales, which have stories of their own.
 */
const PRIMITIVE_GROUPS = ['color', 'Homie'];
const NON_COLOR_GROUPS = [
  'Space',
  'Radius',
  'Stroke',
  'Icon',
  'Illustration',
  'font',
  'Greed',
  // Component and motion are mixed groups: mostly dimensions and numbers, with
  // a colour or two inside. Without them here, the Colors page paints
  // `background: 32px` and renders a section of blank swatches.
  'Component',
  'motion',
];

export type TokenGroupView = { name: string; entries: TokenEntry[] };

/**
 * The semantic colour layer: every top-level group that isn't a raw palette or
 * a non-colour scale. Derived rather than listed, so a new semantic group in
 * tokens.json shows up here without a code change.
 */
export const SEMANTIC_COLOR_GROUPS: TokenGroupView[] = Object.keys(tokens)
  .filter((name) => ![...PRIMITIVE_GROUPS, ...NON_COLOR_GROUPS].includes(name))
  .map((name) => ({ name, entries: collect([name]) }));

/** The raw palette the semantic layer points at, one view per hue ramp. */
export const PRIMITIVE_COLOR_GROUPS: TokenGroupView[] = [
  ...Object.keys(tokens.color as TokenGroup).map((hue) => ({
    name: `color.${hue}`,
    entries: collect(['color', hue]),
  })),
  { name: 'Homie', entries: collect(['Homie']) },
];

export type TextStyle = {
  /** The text style's name in tokens.json, e.g. 'Headline XL'. */
  name: string;
  /** fontFamily, fontWeight, fontSize and lineHeight, in that order. */
  members: TokenEntry[];
  /** The style group's own `$description`, if the group carries one. */
  description: string | null;
};

/**
 * The Greed text styles, kept in the order tokens.json declares them, which
 * runs largest to smallest: Display L down to Caption S Regular.
 */
export const TEXT_STYLES: TextStyle[] = Object.keys(tokens.Greed as TokenGroup).map((name) => ({
  name,
  members: collect(['Greed', name]),
  description: ((tokens.Greed as TokenGroup)[name] as TokenNode).$description ?? null,
}));

/** Looks up one member of a text style by its property name. */
export function member(style: TextStyle, property: string): TokenEntry {
  const found = style.members.find((entry) => entry.path[entry.path.length - 1] === property);
  if (!found) throw new Error(`${style.name} has no ${property} token`);
  return found;
}

const space = asDimensions(collect(['Space']));

/** Space tokens from 0 up, sorted by value rather than by declaration order. */
export const SPACE_SCALE: DimensionEntry[] = space
  .filter((entry) => entry.numeric >= 0)
  .sort((a, b) => a.numeric - b.numeric);

/** Negative space tokens, sorted by how far they pull. */
export const SPACE_NEGATIVE: DimensionEntry[] = space
  .filter((entry) => entry.numeric < 0)
  .sort((a, b) => b.numeric - a.numeric);

/** Radius tokens, smallest corner first, with Radius.Full last. */
export const RADIUS_SCALE: DimensionEntry[] = asDimensions(collect(['Radius'])).sort(
  (a, b) => a.numeric - b.numeric,
);

// --- drift check -----------------------------------------------------------

/**
 * Returns the custom properties a story paints with that the loaded CSS does
 * not define. Anything in here means tokens.json and build/css/tokens.css have
 * drifted — either the CSS is stale (`npm run tokens`) or the name derivation
 * above no longer matches the Style Dictionary config.
 */
export function unresolvedTokenVars(root: HTMLElement): string[] {
  const rootStyle = getComputedStyle(document.documentElement);
  const painted = Array.from(root.querySelectorAll<HTMLElement>('[data-token-var]')).map(
    (element) => element.dataset.tokenVar ?? '',
  );
  return Array.from(new Set(painted)).filter(
    (cssVar) => rootStyle.getPropertyValue(cssVar).trim() === '',
  );
}
