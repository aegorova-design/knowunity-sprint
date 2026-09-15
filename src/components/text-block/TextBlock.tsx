/**
 * textBlock — a title with an optional caption.
 *
 * Built from the Figma component set `textBlock` (node 9003:9039) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * properties exactly: variant, title, caption and showCaption.
 *
 * The Figma component set carries no description. design-system.md is the only
 * written guidance: "A title with an optional caption. Use XL and L for
 * screen-level headings, and M and S for section headings." See the story docs
 * for the gap that leaves.
 */

import type { ElementType, HTMLAttributes } from 'react';

import './textBlock.css';

export type TextBlockVariant = 'XL' | 'L' | 'M' | 'S';

export type TextBlockProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> & {
  /** Which size step. XL and L are screen-level headings, M and S section headings. */
  variant?: TextBlockVariant;
  /** The heading itself. */
  title?: string;
  /** The supporting line under it. Only rendered when showCaption is true. */
  caption?: string;
  /** Whether the caption shows. Matches the Figma boolean, which defaults to true. */
  showCaption?: boolean;
  /**
   * Heading level for the title. Figma has no say in this, but the DOM does:
   * a screen-level XL or L is usually the screen's h1, a section heading an h2
   * or h3. Defaults to h2 so the component is never a bare paragraph.
   */
  titleAs?: Extract<ElementType, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
};

export function TextBlock({
  variant = 'XL',
  title = 'Header',
  caption = 'Caption',
  showCaption = true,
  titleAs: Title = 'h2',
  ...rest
}: TextBlockProps) {
  return (
    <div className="knowieTextBlock" data-variant={variant} {...rest}>
      <Title className="knowieTextBlock-title">{title}</Title>
      {showCaption ? <p className="knowieTextBlock-caption">{caption}</p> : null}
    </div>
  );
}
