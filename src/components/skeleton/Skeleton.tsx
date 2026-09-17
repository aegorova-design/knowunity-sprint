/**
 * skeleton — placeholder lines for text that is still loading.
 *
 * Built from the Figma component set `skeleton` (node 13654:8800) in
 * Yummy__Knowie Design Sprint. The prop name and its options match the Figma
 * variant axis exactly: lines, with 1, 2 and 3.
 *
 * The line widths are ragged on purpose, so the block reads as prose rather
 * than as a progress bar, and they are not the same widths in the same order at
 * every count — lines=3 runs short, long, medium; lines=2 runs long, short.
 * That is read off the file rather than derived, which is why the widths live
 * in a map here instead of being sliced off one list.
 *
 * It shimmers: a band of light travelling each line on a loop. That reverses
 * the component's original "no motion" decision — see the note in the stories.
 */

import type { HTMLAttributes } from 'react';

import './skeleton.css';

/** How many lines of text the block stands in for. */
export type SkeletonLines = '1' | '2' | '3';

/**
 * The width of each line, in the order it is drawn, straight off the Figma
 * variants. These are plain numbers because nothing in tokens/tokens.json
 * names a width — see the Gaps note in the stories.
 */
const LINE_WIDTHS: Record<SkeletonLines, number[]> = {
  '1': [300],
  '2': [300, 160],
  '3': [160, 300, 220],
};

export type SkeletonProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** How many lines to draw. Match it to the text the block stands in for. */
  lines?: SkeletonLines;
};

export function Skeleton({ lines = '3', ...rest }: SkeletonProps) {
  return (
    // Decorative. The block says nothing a screen reader can use, and the
    // screen it sits on already names the wait in text — "Checking your
    // answer" on the Processing mockup. The caller owns that announcement;
    // this is the picture of it, so it stays out of the accessibility tree.
    <div className="knowieSkeleton" data-lines={lines} aria-hidden="true" {...rest}>
      {LINE_WIDTHS[lines].map((width, i) => (
        <span
          key={i}
          className="knowieSkeleton-line"
          // The one value with no token behind it. Set inline rather than in
          // CSS so the three widths stay next to the variant map they come
          // from, instead of being spread across nth-child rules.
          style={{ width: `${width}px` }}
        />
      ))}
    </div>
  );
}
