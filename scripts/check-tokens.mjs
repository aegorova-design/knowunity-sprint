/**
 * Fails if any CSS in src/ reads a custom property that nothing defines.
 *
 * An undefined `var(--x)` is not an error in CSS. The declaration is simply
 * thrown away, so `gap: var(--space-500)` on a scale that stops at 400 and
 * resumes at 600 reads as no gap at all, looks like a layout bug, and survives
 * typecheck, lint and the story tests. This catches it by name instead.
 *
 * A property counts as defined if build/css/tokens.css declares it, or if the
 * same source file declares it — components set local aliases like
 * --knowieButton-lip that way.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DECLARED = /(--[A-Za-z0-9_-]+)\s*:/g;
const USED = /var\(\s*(--[A-Za-z0-9_-]+)\s*([,)])/g;

function cssFilesIn(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return cssFilesIn(path);
    return path.endsWith('.css') ? [path] : [];
  });
}

const tokens = new Set(
  [...readFileSync(join(ROOT, 'build/css/tokens.css'), 'utf8').matchAll(DECLARED)].map((m) => m[1]),
);

const problems = [];

for (const file of cssFilesIn(join(ROOT, 'src'))) {
  const css = readFileSync(file, 'utf8');
  const local = new Set([...css.matchAll(DECLARED)].map((m) => m[1]));

  for (const [, name, next] of css.matchAll(USED)) {
    if (tokens.has(name) || local.has(name)) continue;
    // A fallback is banned by CLAUDE.md, but report it as its own problem
    // rather than letting it hide an undefined name.
    const why = next === ',' ? 'has a fallback (banned)' : 'is not defined anywhere';
    problems.push(`${relative(ROOT, file)}: var(${name}) ${why}`);
  }
}

if (problems.length) {
  console.error(`Undefined custom properties (${problems.length}):\n`);
  for (const p of [...new Set(problems)]) console.error(`  ${p}`);
  console.error('\nEvery value comes from tokens/tokens.json. Add the token and run');
  console.error('`npm run tokens`, or use a step that exists.');
  process.exit(1);
}

console.log(`All custom properties resolve (${tokens.size} tokens defined).`);
