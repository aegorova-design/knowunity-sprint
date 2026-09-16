/**
 * Placeholder app chrome. NOT part of the design system.
 *
 * The bottom navigation, the avatar, the streak counters and the tool row all
 * come from a library this project cannot reach — design-system.md lists Status
 * Bar, Navbar, Navigation Button and Avatar as unreachable, and SPEC.md puts
 * that chrome out of scope for the sprint. So these screens show it as a flat
 * image exported from Mockups v2 rather than pretending to rebuild it.
 *
 * It is inert on purpose: nothing here is in the click path, and none of it is
 * announced. Anything a student actually uses is a real component.
 *
 * This file lives under src/app and is never exported or given a story. It must
 * not be imported from src/components.
 */

import './chrome.css';

export type ChromeStripProps = {
  /** Path under public/chrome. */
  src: string;
  /** Design width in CSS pixels. Every strip is drawn on the 390 canvas. */
  width?: number;
  /** Design height in CSS pixels, so the box is reserved before the image loads. */
  height: number;
};

export function ChromeStrip({ src, width = 390, height }: ChromeStripProps) {
  return (
    /* A fixed-size local PNG placeholder. next/image would wrap it in a layout
       box and optimise an asset that is already exactly the size it is drawn
       at, for no benefit. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="chromeStrip"
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      width={width}
      height={height}
    />
  );
}
