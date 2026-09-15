/**
 * scaffold — every screen starts here.
 *
 * Built from the Figma component set `scaffold` (node 3085:9242) in
 * Yummy__Knowie Design Sprint. It stacks top to bottom: the status bar row,
 * then topNavigation, then middleContent, then bottomContent. bottomSheetOnly
 * overlays them.
 *
 * Only half of Figma's property list is live. The eight properties in the
 * `#13624:*` generation are defined but wired to no layer; the `#3085/#3087/
 * #3675` generation is the one that does anything, and it is the one carried
 * here. See the story docs.
 */

import type { HTMLAttributes, ReactNode } from 'react';

import './scaffold.css';

/** Figma offers one size today. Its XS - iPhone SE variant no longer exists. */
export type ScaffoldSize = 'iPhone 13';

export type ScaffoldProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** The device canvas. Figma's only option is iPhone 13. */
  size?: ScaffoldSize;
  /** One appBar, nothing else. */
  topNavigation?: ReactNode;
  /** Everything the student reads. Fills the remaining height and scrolls. */
  middleContent?: ReactNode;
  /** Actions and input. Hugs its content, and is the thumb zone. */
  bottomContent?: ReactNode;
  /** Sheet content, overlaying the rest. Only one sheet at a time. */
  bottomSheetOnly?: ReactNode;
  /** Hide topNavigation, for a screen with no navigation at all. */
  showTopNavSlot?: boolean;
  /** Hide bottomContent. */
  showBottomNavSlot?: boolean;
  /** The scrim behind a sheet. Turn it on whenever a sheet is open. */
  showBottomSheetBackground?: boolean;
};

export function Scaffold({
  size = 'iPhone 13',
  topNavigation,
  middleContent,
  bottomContent,
  bottomSheetOnly,
  showTopNavSlot = true,
  showBottomNavSlot = true,
  showBottomSheetBackground = false,
  ...rest
}: ScaffoldProps) {
  return (
    <div className="knowieScaffold" data-size={size} {...rest}>
      {/* Reserved, never filled by the app — the OS draws here. */}
      <div className="knowieScaffold-panelHeader" aria-hidden="true" />

      {showTopNavSlot ? (
        <div className="knowieScaffold-topNavigation">{topNavigation}</div>
      ) : null}

      <div className="knowieScaffold-middleContent">{middleContent}</div>

      {showBottomNavSlot ? (
        <div className="knowieScaffold-bottomContent">{bottomContent}</div>
      ) : null}

      {showBottomSheetBackground ? (
        <div className="knowieScaffold-sheetBackground" />
      ) : null}

      {/* Figma ties this slot's visibility to showBottomNavSlot, the same
          boolean that controls bottomContent, so a sheet cannot be shown
          without the bottom bar. Read as a mis-wire: the sheet appears when
          it has content, which is what Figma's own empty-slot rule does. */}
      {bottomSheetOnly ? (
        <div className="knowieScaffold-bottomSheetOnly">{bottomSheetOnly}</div>
      ) : null}
    </div>
  );
}
