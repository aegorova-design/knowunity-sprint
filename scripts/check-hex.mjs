/**
 * Fails if any file in src/ carries a raw hex colour.
 *
 * Every colour comes from tokens/tokens.json, so a literal `#090c18` in a
 * component is a token that got copied instead of referenced: it stops
 * tracking the token, and a theme change silently leaves it behind.
 *
 * Two things keep the match honest rather than noisy:
 *
 *   - A colour is exactly 3, 4, 6 or 8 hex digits, and the lookahead rejects a
 *     trailing hex digit. That drops the odd lengths in the Figma node ids
 *     these files quote constantly — `#13624:*`, `#3675:101`.
 *   - Comment lines and story files are skipped. That is where the rest of
 *     those node ids live (`#3085/#3087/`, which is the right length to look
 *     like a colour), alongside prose describing an icon's hardcoded fill.
 *     Neither styles anything.
 *
 * So the rule is: a hex colour in code fails; a hex-shaped string in prose
 * does not. A trailing comment on a line of code is still read.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const HEX =
  /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;
const COMMENT = /^\s*(\/\/|\/?\*)/;

function filesIn(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesIn(path);
    if (/\.stories\.tsx?$/.test(path)) return [];
    return /\.(css|tsx?)$/.test(path) ? [path] : [];
  });
}

const problems = [];

for (const file of filesIn(join(ROOT, 'src'))) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (COMMENT.test(line)) return;
      for (const [hex] of line.matchAll(HEX)) {
        problems.push(`${relative(ROOT, file)}:${i + 1}  ${hex}  ${line.trim()}`);
      }
    });
}

if (problems.length) {
  console.error(`Raw hex colours (${problems.length}):\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('\nEvery colour comes from tokens/tokens.json. Use the token that');
  console.error('already holds this value, or add one and run `npm run tokens`.');
  process.exit(1);
}

console.log('No raw hex colours in src/.');
